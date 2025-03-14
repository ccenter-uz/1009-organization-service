import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { encrypt } from '@/common/helper/crypt';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CacheService {
  private logger = new Logger(CacheService.name);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, id: string, data: any) {
    const methodName: string = this.set.name;

    this.logger.debug(`Method: ${methodName} - Request: `, { key, data, id });

    const cacheKey = `${key}:${id}`;
    await this.cacheManager.set(cacheKey, JSON.stringify(data));
  }

  async setAll(key: string, filter: string, data: any) {
    const methodName: string = this.setAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, {
      key,
      data,
      filter,
    });
    const cacheKey = `${key}:${filter}`;

    this.saveOrganizationCache(cacheKey);
    await this.cacheManager.set(cacheKey, JSON.stringify(data));
  }

  async get(key: string, id: string) {
    const methodName: string = this.get.name;

    this.logger.debug(`Method: ${methodName} - Request: `, {
      key,
      id,
    });
    const cacheKey = `${key}:${id}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    const data = cachedData ? JSON.parse(cachedData as string) : null;
    this.logger.debug(`Method: ${methodName} - Response: `, data);

    return data;
  }

  async update(key: string, id: string, data: any) {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, {
      key,
      id,
      data,
    });
    const cacheKey = `${key}:${id}`;
    await this.cacheManager.set(cacheKey, JSON.stringify(data));
  }

  async delete(key: string, id: string) {
    const methodName: string = this.delete.name;

    this.logger.debug(`Method: ${methodName} - Request: `, {
      key,
      id,
    });
    const cacheKey = `${key}:${id}`;
    await this.cacheManager.del(cacheKey);
  }

  async deleteAll(key: string) {
    const methodName: string = this.deleteAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, {
      key,
    });
    const cacheKey = `${key}`;
    await this.cacheManager.del(cacheKey);
  }

  async saveOrganizationCache(cache: string) {
    const methodName: string = this.saveOrganizationCache.name;

    this.logger.debug(`Method: ${methodName} - Request: `, {
      cache,
    });
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
    const methodName: string = this.invalidateAllCaches.name;

    const allKeys =
      (await this.cacheManager.get<string[]>(`${cacheName}-keys`)) || [];
    this.logger.debug(`Method: ${methodName} - Request: `, {
      cacheName,
      allKeys,
    });
    await Promise.all(allKeys.map((key) => this.cacheManager.del(key)));

    await this.cacheManager.del(`${cacheName}-keys`);
  }
}
