import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./src/schemas/*",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.OUTSIDE_DATABASE_URL as string,
  },
} satisfies Config;