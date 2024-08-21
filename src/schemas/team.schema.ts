import { pgTable, serial, text, bigint, boolean, integer } from "drizzle-orm/pg-core";
import { factionSchema } from "./faction.schema";

export const teamSchema = pgTable('team', {
    id: serial('id').primaryKey(),
    isOfficial: boolean('isOfficial').notNull(),
    timeCode: bigint('timeCode', { mode: 'number' }),
    name: text('name').notNull().unique(),
    faction: integer('faction').references(() => factionSchema.id)
});

export type Team = typeof teamSchema.$inferInsert;
