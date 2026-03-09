import { db } from "./db";
import { favorites, type Favorite, type InsertFavorite } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getFavorites(): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getFavorites(): Promise<Favorite[]> {
    return await db.select().from(favorites);
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [created] = await db.insert(favorites).values(favorite).returning();
    return created;
  }

  async deleteFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }
}

export const storage = new DatabaseStorage();
