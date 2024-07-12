import { pgTable, serial, boolean, text } from "drizzle-orm/pg-core";

export const eventSchema = pgTable('event', {
    id: serial('id').primaryKey(),
    name: text('event_name').notNull().unique(),
    state: boolean('state').notNull(),
});

export type Event = typeof eventSchema.$inferInsert;
