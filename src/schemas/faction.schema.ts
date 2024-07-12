import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const factionSchema = pgTable('faction', {
    id: serial('id').primaryKey(),
    name: text('team_name').notNull().unique(),
    points: integer('points').notNull()
});

export type Faction = typeof factionSchema.$inferInsert;
