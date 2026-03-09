import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  stationUuid: text("station_uuid").notNull().unique(),
  name: text("name").notNull(),
  streamUrl: text("stream_url").notNull(),
  country: text("country"),
  favicon: text("favicon"),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
