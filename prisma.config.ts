import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
import { join } from "node:path";

const env = dotenv.config({ path: join(__dirname, "prisma", ".env") });

const dbUrl = env.parsed?.DATABASE_URL || process.env.DATABASE_URL || "postgresql://postgres.oliorzvsffrvpphnarva:TBYERBS4qktOc226@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasourceUrl: dbUrl,
});