import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { encrypt } from '@/common/helper/crypt';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, id: string, data: any) {
    const cacheKey = `${key}:${id}`;
    await this.cacheManager.set(cacheKey, JSON.stringify(data));
  }

  async setAll(key: string, filter: string, data: any) {
    const cacheKey = `${key}:${filter}`;

    this.saveOrganizationCache(cacheKey);
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

  async deleteAll(key: string) {
    const cacheKey = `${key}`;
    await this.cacheManager.del(cacheKey);
  }

  async saveOrganizationCache(cache: string) {
    let cacheName = cache.split(':')[0];
    let cacheKey = cache.split(':')[1];
    let allKeys =
      (await this.cacheManager.get<string[]>(`${cacheName}-keys`)) || [];
    if (!allKeys.includes(cacheKey)) {
      allKeys.push(cache);
      await this.cacheManager.set(`${cacheName}-keys`, allKeys);
    }
  }

  async invalidateAllCaches(cacheName: string) {
    const allKeys =
      (await this.cacheManager.get<string[]>(`${cacheName}-keys`)) || [];

    await Promise.all(allKeys.map((key) => this.cacheManager.del(key)));

    await this.cacheManager.del(`${cacheName}-keys`);
  }
}
