import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pfVideosTable = pgTable(
  "pf_videos",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    embedUrl: text("embed_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    durationText: text("duration_text"),
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    qualityLabel: text("quality_label").default("1080p"),
    category: text("category").default("amateur"),
    studio: text("studio"),
    tags: text("tags").array().default(sql`ARRAY[]::text[]`),
    pornstars: text("pornstars").array().default(sql`ARRAY[]::text[]`),
    status: text("status").default("published"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("pf_videos_status_idx").on(table.status),
    index("pf_videos_category_idx").on(table.category),
    index("pf_videos_studio_idx").on(table.studio),
    index("pf_videos_views_idx").on(table.views),
  ]
);

export type PfVideo = typeof pfVideosTable.$inferSelect;
export type PfVideoInsert = typeof pfVideosTable.$inferInsert;
