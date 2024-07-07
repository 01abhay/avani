// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from 'drizzle-orm'
import {
  // index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
  // integer,
  numeric,
  jsonb,
  vector,
} from 'drizzle-orm/pg-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(name => name)

export const stores = createTable(
  'stores',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }),

    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  // (store) => ({
  //   nameIndex: index("name_idx").on(store.name),
  // })
)

export type StoreRowInsert = typeof stores.$inferInsert
export type StoreRowSelect = typeof stores.$inferSelect

export const products = createTable('products', {
  id: varchar('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  description: text('description'),
  price: numeric('price'), // 149, 199, 149, 299, 349, 399, 449, 499, 549, 599, 649, 699, 749, 799
  rating: numeric('rating'), // 1-5
  images: jsonb('images'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
})

export type ProductRowInsert = typeof products.$inferInsert
export type ProductRowSelect = typeof products.$inferSelect

export const productDescriptionEmbeddings = createTable('product_description_embeddings', {
  id: serial('id').primaryKey(),
  text: text('text'),
  productId: varchar('productId'),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
})

export type ProductDescriptionEmbeddingRowInsert = typeof productDescriptionEmbeddings.$inferInsert
export type ProductDescriptionEmbeddingRowSelect = typeof productDescriptionEmbeddings.$inferSelect

export const productRelations = relations(products, ({ many }) => ({
  embeddings: many(productDescriptionEmbeddings),
}))

export const productDescriptionEmbeddingRelations = relations(productDescriptionEmbeddings, ({ one }) => ({
  author: one(products, {
    fields: [productDescriptionEmbeddings.productId],
    references: [products.id],
  }),
}))

// store FAQs (queries)
