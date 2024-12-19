import { useCallback, useEffect, useState, useLayoutEffect } from 'react'
import { storeFile, getAllFiles, deleteFile, getFile } from './services/fileStorage'

interface StoredFile {
  id: string
  name: string
  type: string
  size: number
  timestamp: number
}

function App() {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [isDark, setIsDark] = useState(true)

  useLayoutEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    setIsDark(savedTheme === 'dark' || (savedTheme === null && prefersDark))
  }, [])

  useEffect(() => {
    // Update DOM and save preference
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

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

  const handleFileOpen = async (id: string) => {
    try {
      const file = await getFile(id)
      if (!file) {
        alert('File not found')
        return
      }

      const blob = new Blob([file.data], { type: file.type })
      const url = URL.createObjectURL(blob)

      // Try to open in new tab first
      const newWindow = window.open(url, '_blank')
      
      // If blocked or not supported, try download
      if (!newWindow) {
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Error opening file:', error)
      alert('Failed to open file')
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
    <div className="min-h-screen dark:bg-background-dark bg-background-light dark:text-text-dark text-text-light">
      <header className="dark:bg-surface-dark bg-surface-light border-b dark:border-gray-700 border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div>
          <h1 className="text-2xl font-bold dark:text-text-dark text-text-light">TacoVault</h1>
          <p className="text-sm dark:text-muted-dark text-muted-light mt-1">Wrap your files in security</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="Toggle theme"
          >
            <span className="dark:text-text-dark text-text-light">
              {isDark ? '☀' : '☾'}
            </span>
          </button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="dark:bg-surface-dark bg-surface-light rounded-xl p-8 shadow-lg">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Secure File Storage</h2>
            <p className="dark:text-nord4 text-nord3">Store your files securely using Threshold's decentralized network</p>
          </div>
          
          {/* File Upload */}
          <div className="mb-12">
            <label className="block mb-3 text-lg font-medium text-white">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-sm dark:text-text-dark text-text-light
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
              <p className="dark:text-gray-400 text-gray-600">No files stored yet</p>
            ) : (
              <ul className="space-y-4">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between p-4 dark:bg-gray-800 bg-gray-100 rounded-lg border dark:border-gray-700 border-gray-200"
                  >
                    <div 
                      className="flex-1 cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-200 px-2 py-1 rounded"
                      onClick={() => handleFileOpen(file.id)}
                    >
                      <p className="font-medium dark:text-text-dark text-text-light">{file.name}</p>
                      <p className="text-sm dark:text-muted-dark text-muted-light">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
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
