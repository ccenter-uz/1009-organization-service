import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { encrypt } from '@/common/helper/crypt';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, id: string, data: any) {
    const cacheKey = `${key}:${id}`;
    await this.cacheManager.set(cacheKey, JSON.stringify(data)); // 60 sekund
  }

  async setAll(key: string, filter: string, data: any[]) {
    const encryptedFilter = encrypt(filter);
    console.log(encryptedFilter);
    
    const cacheKey = `${key}:${filter}`;
    console.log(JSON.stringify(data));

    await this.cacheManager.set(cacheKey, JSON.stringify(data));
  }

  async get(key: string, id: string) {
    const cacheKey = `${key}:${id}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    return cachedData ? JSON.parse(cachedData as string) : null;
  }

  async getAll(key: string, filter: string) {
    const encryptedFilter = encrypt(filter);
    console.log(encryptedFilter);
    
    const cacheKey = `${key}:${filter}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    console.log(cachedData);
    
    return cachedData ? JSON.parse(cachedData as string) : [];
  }

  async update(key: string, id: string, data: any) {
    const cacheKey = `${key}:${id}`;
    await this.cacheManager.set(cacheKey, JSON.stringify(data));
  }

  async delete(key: string, id: string) {
    const cacheKey = `${key}:${id}`;
    await this.cacheManager.del(cacheKey);
  }
}
