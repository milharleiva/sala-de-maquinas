import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";
import { join } from "node:path";

const dbUrl = env("DATABASE_URL") || process.env.DATABASE_URL;

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});