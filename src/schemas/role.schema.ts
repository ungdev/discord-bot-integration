import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";
import { userSchema } from "./user.schema";

export const roleSchema = pgTable('role', {
    id: serial('id').primaryKey(),
    name: text('role_name').notNull().unique(),
    description: text('role_desc').notNull(),
});

export type Role = typeof roleSchema.$inferInsert;

export const userToRoleSchema = pgTable('userToRole', {
    userId: integer('user_id').notNull().references(() => userSchema.id, { onDelete: "cascade" }),
    roleId: integer('role_id').notNull().references(() => roleSchema.id, { onDelete: "cascade" }),
    isWish: boolean('isWish').notNull()
});

export type userToRole = typeof userToRoleSchema.$inferInsert;
