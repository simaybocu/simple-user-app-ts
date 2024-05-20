import cache from '.';
import { DynamicKeyType, Key } from './keys';
//TODO: buradaki DynamicKey olayı nodejs-be-arch projesinden anlaşılacak

export enum TYPES {
  LIST = 'list',
  STRING = 'string',
  HASH = 'hash',
  ZSET = 'zset',
  SET = 'set',
}

export async function keyExists(...keys: string[]) {
  return (await cache.exists(keys)) ? true : false;
}

export async function setValue(
  key: Key | DynamicKeyType,
  value: string | number,
  expireAt: number | null = null,
) {
  if (expireAt) return cache.pSetEx(key, expireAt, `${value}`);
  else return cache.set(key, `${value}`);
}

export async function setJson(
  key: Key | DynamicKeyType,
  value: any[],
  expireAt: number | null = null,
) {
  const json = JSON.stringify(value);
  return await setValue(key, json, expireAt);
}

export async function getValue(key: Key | DynamicKeyType) {
  return cache.get(key);
}

export async function delByKey(key: Key | DynamicKeyType) {
  return cache.del(key);
}

export async function expire(expireAt: Date, key: Key | DynamicKeyType) {
  return await cache.pExpireAt(key, expireAt.getTime());
}

export async function incr(key: Key | DynamicKeyType) {
  return cache.incr(key);
}

export async function incrBy(key: Key | DynamicKeyType, increment: number) {
  return cache.incrBy(key, increment);
}
//TODO: diğer list ve json fonksiyonlarına da bakılacak