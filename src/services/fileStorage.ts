import { openDB } from 'idb'

const dbName = 'fileStorageDB'
const storeName = 'files'

interface StoredFile {
  id: string
  name: string
  type: string
  size: number
  data: ArrayBuffer
  timestamp: number
}

export async function initDB() {
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
  
  const storedFile: StoredFile = {
    id: crypto.randomUUID(),
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
