import { cosineDistance, l1Distance, l2Distance, desc, gt, inArray, sql } from 'drizzle-orm'
import { products, productDescriptionEmbeddings } from '~/server/db/schema'
import { db } from '../db'

export const getProductsBasedOnSimilarityScore = async (embedding: number[]) => {
  const similarity1 = sql`1 - (${cosineDistance(productDescriptionEmbeddings.embedding, embedding)})`
  const similarity2 = sql`1 - (${l1Distance(productDescriptionEmbeddings.embedding, embedding)})`
  const similarity3 = sql`1 - (${l2Distance(productDescriptionEmbeddings.embedding, embedding)})`

  let productsIds = await db
    .select({
      productId: productDescriptionEmbeddings.productId,
      similarity: similarity1,
    })
    .from(productDescriptionEmbeddings)
    .where(gt(similarity1, 0.1))
    .orderBy(t => desc(t.similarity))
    .limit(4)
  if (!productsIds.length)
    productsIds = await db
      .select({
        productId: productDescriptionEmbeddings.productId,
        similarity: similarity2,
      })
      .from(productDescriptionEmbeddings)
      .where(gt(similarity2, 0.1))
      .orderBy(t => desc(t.similarity))
      .limit(4)
  if (!productsIds.length)
    productsIds = await db
      .select({
        productId: productDescriptionEmbeddings.productId,
        similarity: similarity3,
      })
      .from(productDescriptionEmbeddings)
      .where(gt(similarity3, 0.1))
      .orderBy(t => desc(t.similarity))
      .limit(4)
  if (!productsIds.length) return []

  const _products = await db
    .select({
      id: products.id,
      description: products.description,
      name: products.name,
      images: products.images,
      price: products.price,
    })
    .from(products)
    .where(inArray(products.id, productsIds.map(p => p.productId!).filter(Boolean)))

  return _products
}
