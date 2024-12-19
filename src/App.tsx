import { useCallback, useEffect, useState } from 'react'
import { storeFile, getAllFiles, deleteFile } from './services/fileStorage'

interface StoredFile {
  id: string
  name: string
  type: string
  size: number
  timestamp: number
}

function App() {
  const [files, setFiles] = useState<StoredFile[]>([])

  const loadFiles = useCallback(async () => {
    const storedFiles = await getAllFiles()
    setFiles(storedFiles)
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return

    try {
      await storeFile(fileList[0])
      await loadFiles()
      event.target.value = '' // Reset input
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFile(id)
      await loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-secondary text-white">
      <header className="bg-secondary border-b border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Threshold Storage</h1>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gray-900 rounded-xl p-8 shadow-lg">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Secure File Storage</h2>
            <p className="text-gray-400">Store your files securely using Threshold's decentralized network</p>
          </div>
          
          {/* File Upload */}
          <div className="mb-12">
            <label className="block mb-3 text-lg font-medium text-white">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary-dark
                cursor-pointer"
            />
          </div>

          {/* File List */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Stored Files</h3>
            {files.length === 0 ? (
              <p className="text-gray-400">No files stored yet</p>
            ) : (
              <ul className="space-y-4">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
