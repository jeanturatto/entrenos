import type { SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const chunkSize = 1_800;
const metadataSuffix = '.chunks';
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function getWebStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function chunkKey(key: string, index: number) {
  return `${key}.${index}`;
}

async function readChunkCount(key: string) {
  const value = await SecureStore.getItemAsync(`${key}${metadataSuffix}`);
  const count = Number(value);

  return Number.isInteger(count) && count > 0 ? count : 0;
}

export const authStorage: SupportedStorage = {
  async getItem(key) {
    if (process.env.EXPO_OS === 'web') {
      return getWebStorage()?.getItem(key) ?? null;
    }

    const count = await readChunkCount(key);

    if (count === 0) {
      return SecureStore.getItemAsync(key);
    }

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))),
    );

    return chunks.every((chunk) => chunk !== null) ? chunks.join('') : null;
  },

  async setItem(key, value) {
    if (process.env.EXPO_OS === 'web') {
      getWebStorage()?.setItem(key, value);
      return;
    }

    const previousCount = await readChunkCount(key);
    const chunks = Array.from({ length: Math.ceil(value.length / chunkSize) }, (_, index) =>
      value.slice(index * chunkSize, (index + 1) * chunkSize),
    );

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(chunkKey(key, index), chunk, secureStoreOptions),
      ),
    );
    await SecureStore.setItemAsync(
      `${key}${metadataSuffix}`,
      String(chunks.length),
      secureStoreOptions,
    );
    await SecureStore.deleteItemAsync(key);

    await Promise.all(
      Array.from({ length: Math.max(0, previousCount - chunks.length) }, (_, index) =>
        SecureStore.deleteItemAsync(chunkKey(key, chunks.length + index)),
      ),
    );
  },

  async removeItem(key) {
    if (process.env.EXPO_OS === 'web') {
      getWebStorage()?.removeItem(key);
      return;
    }

    const count = await readChunkCount(key);

    await Promise.all([
      SecureStore.deleteItemAsync(key),
      SecureStore.deleteItemAsync(`${key}${metadataSuffix}`),
      ...Array.from({ length: count }, (_, index) =>
        SecureStore.deleteItemAsync(chunkKey(key, index)),
      ),
    ]);
  },
};
