import { bigint, pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { userSchema } from "./user.schema";

export const permanenceSchema = pgTable('permanence', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    desc: text('desc').notNull(),
    startingTime: text('startingTime').notNull(),
    duration: bigint('duration', { mode: 'number' }).notNull(),
    studentNumber: integer('studentNumber').notNull(),
  });

export const userToPermanenceSchema = pgTable('userToPermanence', {
    userId: integer('user_id').notNull().references(() => userSchema.id, { onDelete: "cascade" }),
    permId: integer('perm_id').notNull().references(() => permanenceSchema.id, { onDelete: "cascade" }),
});


export type Permanence = typeof permanenceSchema.$inferInsert;
export type UserToPermanence = typeof userToPermanenceSchema.$inferInsert;