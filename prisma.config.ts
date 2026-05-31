// Loads .env / .env.local for the Prisma CLI (migrate, studio, generate).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // The CLI (migrate/introspect) must use the DIRECT (non-pooled) connection.
    // Falls back to DATABASE_URL if DIRECT_URL is not set.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
