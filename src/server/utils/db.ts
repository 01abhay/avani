import { cosineDistance, l1Distance, l2Distance, desc, gt, gte, inArray, sql, type SQL, and, lte } from 'drizzle-orm'

import { products, productDescriptionEmbeddings } from '~/server/db/schema'
import { db } from '../db'

type Attributes = { minPrice?: number; maxPrice?: number; limit?: number }
export const getProductsBasedOnSimilarityScore = async (embedding: number[], attrs: Attributes) => {
  let productIds: string[] = []
  if (attrs.maxPrice ?? attrs.minPrice) {
    const _products = await db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          attrs.minPrice ? gte(products.price, attrs.minPrice.toString()) : undefined,
          attrs.maxPrice ? lte(products.price, attrs.maxPrice.toString()) : undefined,
        ),
      )
    productIds = _products.map(p => p.id)
  }
  productIds = await sQ(sql`1 - (${cosineDistance(productDescriptionEmbeddings.embedding, embedding)})`, { productIds, limit: attrs.limit })
  if (!productIds.length)
    productIds = await sQ(sql`1 - (${l1Distance(productDescriptionEmbeddings.embedding, embedding)})`, { productIds, limit: attrs.limit })
  if (!productIds.length)
    productIds = await sQ(sql`1 - (${l2Distance(productDescriptionEmbeddings.embedding, embedding)})`, { productIds, limit: attrs.limit })
  if (!productIds.length) return []

  const _products = await db
    .select({
      id: products.id,
      description: products.description,
      name: products.name,
      images: products.images,
      price: products.price,
    })
    .from(products)
    .where(inArray(products.id, productIds))

  return _products
}

const sQ = async (similarity: SQL<unknown>, attrs: { productIds?: string[]; limit?: number }) => {
  const rows = await db
    .select({ productId: productDescriptionEmbeddings.productId, similarity })
    .from(productDescriptionEmbeddings)
    .where(
      and(gt(similarity, 0.1), attrs.productIds?.length ? inArray(productDescriptionEmbeddings.productId, attrs.productIds) : undefined),
    )
    .orderBy(t => desc(t.similarity))
    .limit(attrs.limit ?? 6)
  return rows.map(r => r.productId!).filter(Boolean)
}
