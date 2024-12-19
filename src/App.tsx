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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">File Storage</h1>
          
          {/* File Upload */}
          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* File List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Stored Files</h2>
            {files.length === 0 ? (
              <p className="text-gray-500">No files stored yet</p>
            ) : (
              <ul className="space-y-3">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
