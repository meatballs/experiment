import { openDB, IDBPDatabase } from 'idb'

const dbName = 'fileStorageDB'
const storeName = 'files'

interface StoredFile {
  id: string // SHA-256 hash
  name: string
  type: string
  size: number
  data: ArrayBuffer
  timestamp: number
}

async function computeFileHash(data: ArrayBuffer): Promise<string> {
  // Check if Web Crypto API is available
  if (window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b): string => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.warn('Web Crypto API failed:', error)
      // Fallback to simple timestamp-based ID if crypto fails
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }
  // Fallback for browsers without Web Crypto API
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function initDB(): Promise<IDBPDatabase> {
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      db.createObjectStore(storeName, { keyPath: 'id' })
    },
  })
  return db
}

export async function storeFile(file: File): Promise<StoredFile> {
  const db = await initDB()
  const arrayBuffer = await file.arrayBuffer()
  const fileHash = await computeFileHash(arrayBuffer)
  
  const storedFile: StoredFile = {
    id: fileHash,
    name: file.name,
    type: file.type,
    size: file.size,
    data: arrayBuffer,
    timestamp: Date.now(),
  }
  
  await db.put(storeName, storedFile)
  return storedFile
}

export async function getAllFiles(): Promise<StoredFile[]> {
  const db = await initDB()
  return db.getAll(storeName)
}

export async function deleteFile(id: string): Promise<void> {
  const db = await initDB()
  await db.delete(storeName, id)
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  const db = await initDB()
  return db.get(storeName, id)
}
