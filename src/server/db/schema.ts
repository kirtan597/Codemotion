import { pgTable, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const shares = pgTable('shares', {
  id: text('id').primaryKey().$defaultFn(() => nanoid(10)),
  algorithmId: text('algorithm_id').notNull(),
  input: jsonb('input').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  views: integer('views').default(0).notNull(),
});

export type Share = typeof shares.$inferSelect;
export type NewShare = typeof shares.$inferInsert;
