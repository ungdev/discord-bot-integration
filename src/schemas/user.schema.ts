import { pgTable, serial, text, integer, pgEnum, date } from "drizzle-orm/pg-core";
import { teamSchema } from "./team.schema";

export const permission = pgEnum('permission', ['newStudent', 'Student', 'Admin', 'RespoCE', 'Respo', 'Anim']);

export enum PermType {
  NewStudent = 'newStudent',
  Student = 'Student',
  Admin = 'Admin', // peut tout faire
  RespoCE = 'RespoCE', // peut creer des équipes
  Respo = 'Respo', // peut creer et modifier des perms
  Anim = 'Anim' //peut voir les perms
}

export const parsePermType = (perm: string): PermType | undefined => {
  switch (perm) {
    case 'newStudent':
      return PermType.NewStudent;
    case 'Student':
      return PermType.Student;
    case 'Admin':
      return PermType.Admin;
    case 'RespoCE':
      return PermType.RespoCE;
    case 'Respo':
      return PermType.Respo;
    case 'Anim':
      return PermType.Anim;
    default:
      return undefined;
  }
}

export const userSchema = pgTable("user", {
  id: serial("id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  branch: text("branch"),
  birthday: date("birthday"),
  contact: text("contact"),
  discord_id: text("discord_id"),
  connection_number: integer("connection_num").notNull(),
  permission: permission('permission').notNull(),
  password: text("password").notNull(),
  team: integer('team').references(() => teamSchema.id)
});

export type User = typeof userSchema.$inferInsert;
