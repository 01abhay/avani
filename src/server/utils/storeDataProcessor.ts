import chunk from "chunk-text";
import _ from "lodash";

import {
  products as productsModel,
  productDescriptionEmbeddings as productDescriptionEmbeddingsModel,
  type ProductRowInsert,
  type ProductDescriptionEmbeddingRowInsert,
} from "../db/schema";
import { db } from "../db";

import { embeddings as getEmbeddings, vision } from "./openai";

export const processShopData = async () => {
  return { message: "did not run!" };
  try {
    const productRows = await readJsonlFile();

    const embeddingRows: ProductDescriptionEmbeddingRowInsert[] = [];
    productRows.forEach((p) => {
      if (p.description) {
        chunk(p.description, 4096).forEach((c) => {
          embeddingRows.push({ productId: p.id, text: c });
        });
      }
    });
    await Promise.all(
      _.chunk(embeddingRows, 16).map(async (embeddingSubChunks, i) => {
        const embeddingsObjs = await getEmbeddings(
          embeddingSubChunks.map((c) => c.text!)
        );
        embeddingsObjs.forEach((embedding, j) => {
          const idx = i * 16 + j;
          if (embeddingRows[idx]) {
            embeddingRows[idx].embedding = embedding.embedding;
          }
        });
      })
    );

    await db.insert(productsModel).values(productRows);
    await db.insert(productDescriptionEmbeddingsModel).values(
      embeddingRows.map((r) => ({
        productId: r.productId,
        embedding: r.embedding,
        text: r.text,
      }))
    );

    return { message: "success" };
  } catch (error) {
    console.log("\n\n\nError @processShopData", error);
    return {
      message: "error",
      error: (error as { message: string }).message,
    };
  }
};

// --

type _Product = {
  id: string;
  title: string;
  description: string;
  category?: string;
  productType: string;
  "seo.title"?: string;
  "seo.description"?: string;
  tags: string[];

  variants: {
    title: string;
    imageUrl?: string;
    description?: string;
  }[];
  images: {
    imageUrl?: string;
    description?: string;
  }[];

  createdAt: string;
};

type _Variant = {
  id: string;
  title: string;
  image?: _Image;
  __parentId: string;
};

type _Image = {
  id: string;
  src: string;
  altText?: string;
  __parentId: string;
};

export async function readJsonlFile() {
  const jsonl = await fetch(
    "http://localhost:3000/assets/data/pilgrim.jsonl"
  ).then((res) => res.text());

  const rl = jsonl.trim().split("\n"); // .slice(0, 55);
  const products: _Product[] = [];

  const productIndices: Record<string, number> = {};
  for await (const _line of rl) {
    const { id, ...line } = JSON.parse(_line) as _Product | _Variant | _Image;
    if (id.includes("Product/")) {
      const product = line as Omit<_Product, "id">;
      products.push({ id, ...product, variants: [], images: [] });
      productIndices[id] = products.length - 1;
    }
    if (id.includes("ProductVariant/")) {
      const variant = line as Omit<_Variant, "id">;
      products[productIndices[variant.__parentId]!]!.variants.push({
        title: variant.title,
        ...(variant.image
          ? {
              imageUrl: variant.image?.src,
              description: variant.image?.altText?.replace(/\n|\s{2,}/g, ""),
            }
          : {}),
      });
    }
    if (id.includes("ProductImage/")) {
      const image = line as Omit<_Image, "id">;
      products[productIndices[image.__parentId]!]!.images.push({
        imageUrl: image.src,
        description: image.altText?.replace(/\n|\s{2,}/g, ""),
      });
    }
  }

  const productsTable: ProductRowInsert[] = [];
  for await (const product of products) {
    let description = `These are the image(s) of the product named ${product.title}.`;
    if (product.description)
      description += ` the product description given by the merchant is, \n"${product.title}" \n-----\n\n`;
    if (product.category)
      description += ` the product belongs to the category '${product.category}'\n\n`;
    if (product.productType)
      description += ` the product type is '${product.productType}'\n\n`;
    if (product["seo.title"])
      description += ` the product has SEO title is '${product["seo.title"]}'\n\n`;
    if (product["seo.description"])
      description += ` the product has SEO description is '${product["seo.description"]}'\n\n`;
    if (product.tags?.length)
      description += ` the product is also tagged with keywords '${product.tags.join(
        ", "
      )}'\n\n`;

    const noOfImages = Math.min(product.images?.length, 3);
    if (noOfImages)
      description += ` the product has ${noOfImages} image${pluralize(
        noOfImages
      )} attached in next ${noOfImages} message${pluralize(noOfImages)}.\n\n`;

    const noOfVariants = product.variants?.length;
    if (noOfVariants) {
      description += ` the product has ${noOfVariants} variant${pluralize(
        noOfVariants
      )} and may have one image per variant attached after product image${pluralize(
        noOfImages
      )}.`;
      description +=
        product.variants.map((v) => `'${v.title}'`).join(", ") +
        ` are the product variants.`;
    }

    const productImages = product.images
      ?.map((i) => i.imageUrl + "&width=512")
      .slice(0, 3);
    const variantImages = product.variants
      ?.map((i) => !!i.imageUrl && i.imageUrl + "&width=512")
      .filter(Boolean) as string[];
    const allProductImages = Array.from(
      new Set([...productImages, ...variantImages])
    );

    const productRow = {
      name: product.title,
      price: pickRandomPrice().toString(),
      rating: getRandomRating().toString(),
      images: allProductImages,
    };

    try {
      if (!allProductImages.length)
        throw Error("no product images for vision api!");

      description +=
        "\n\n\n now write the product description (within 4096 characters) based on above information and any useful information (eg. color, text written on product, patterns, etc.) extracted from the product and its variant images,";
      description +=
        " make sure extracted information is about the product described above not any other thing or person in images.";
      description +=
        " description must be very crisp must have all the information from provided description and extracted from image.";
      description +=
        " also description should be optimized for vector embedding generation for vector search operations.";
      description +=
        " again, please do not repeat any information and do not miss any information.";
      const choice = await vision(description, allProductImages);
      productsTable.push({
        id: product.id,
        ...productRow,
        description: choice.message.content!,
      });
    } catch (e) {
      console.log("Error: vision api call ", e);
      productsTable.push({
        id: product.id,
        ...productRow,
        description: description,
      });
    }
  }

  return productsTable;
}

const pluralize = (n: number) => {
  return n > 1 ? "s" : "";
};

const pickRandomPrice = () => {
  const numbers = [
    149, 199, 249, 299, 349, 399, 449, 499, 549, 599, 649, 699, 749, 799,
  ];
  const randomIndex = Math.floor(Math.random() * numbers.length);
  return numbers[randomIndex]!;
};

const getRandomRating = () => {
  const randomNum = Math.floor(Math.random() * 401) + 100;
  const rating = randomNum / 100;
  return rating.toFixed(2);
};
