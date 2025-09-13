
// Simple in-memory storage implementation
interface User {
  id: number;
  username: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InsertUser {
  username: string;
  address: string;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// In-memory storage for users
const users: User[] = [];
let nextId = 1;

export class MemoryStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return users.find(user => user.username === username);
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return users.find(user => user.address.toLowerCase() === address.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: nextId++,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return user;
  }
}

// Use memory storage
export const storage = new MemoryStorage();
