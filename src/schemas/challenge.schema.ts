import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { factionSchema } from "./faction.schema";

export const challengeSchema = pgTable('challenge', {
    id: serial('id').primaryKey(),
    name: text('challenge_name').notNull().unique(),
    description: text('challenge_desc').notNull(),
    points: integer('points').notNull(),
});

export type challenge = typeof challengeSchema.$inferInsert;

export const factionTochallengeSchema = pgTable('factionTochallenge', {
    factionId: integer('faction_id').notNull().references(() => factionSchema.id),
    challengeId: integer('challenge_id').notNull().references(() => challengeSchema.id),
});

export type factionTochallenge = typeof factionTochallengeSchema.$inferInsert;
