
import { DatabaseService } from './database';
import type { User, InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return await DatabaseService.getUserById(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // For now, we'll search by wallet address if username looks like an address
    if (username.match(/^0x[a-fA-F0-9]{40}$/)) {
      return await DatabaseService.getUserByAddress(username);
    }
    // TODO: Add proper username search when implementing user authentication
    return undefined;
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return await DatabaseService.getUserByAddress(address);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return await DatabaseService.createUser(insertUser);
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
