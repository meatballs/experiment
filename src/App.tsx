import { useCallback, useEffect, useState, useLayoutEffect } from 'react'
import { Sun, Moon, Trash2, Share2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { storeFile, getAllFiles, deleteFile, getFile } from './services/fileStorage'

interface StoredFile {
  id: string
  name: string
  type: string
  size: number
  timestamp: number
}

function App(): JSX.Element {
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

  const toggleTheme = (): void => setIsDark(!isDark)

  const loadFiles = useCallback(async (): Promise<void> => {
    const storedFiles = await getAllFiles()
    setFiles(storedFiles)
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
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

  const handleFileOpen = async (id: string): Promise<void> => {
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

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteFile(id)
      await loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen dark:bg-background-dark bg-background-light dark:text-text-dark text-text-light">
      <Toaster position="bottom-right" />
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
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 dark:text-text-dark text-text-light" />
            ) : (
              <Moon className="w-5 h-5 dark:text-text-dark text-text-light" />
            )}
          </button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="dark:bg-surface-dark bg-surface-light rounded-xl p-8 shadow-lg">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Secure File Sharing</h2>
            <p className="dark:text-nord4 text-nord3">Share your files securely using Threshold&apos;s decentralized network</p>
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
              title="Click to select a file to upload"
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
                    data-file-id={file.id}
                    className="file-item flex items-center justify-between p-4 dark:bg-gray-800 bg-gray-100 rounded-lg border dark:border-gray-700 border-gray-200"
                  >
                    <div 
                      className="flex-1 cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-200 px-2 py-1 rounded"
                      onClick={() => handleFileOpen(file.id)}
                      title="Click to open or download this file"
                    >
                      <div className="file-details">
                        <p className="file-name font-medium dark:text-text-dark text-text-light">{file.name}</p>
                        <p className="file-info text-sm dark:text-muted-dark text-muted-light">
                          <span className="file-size">{formatFileSize(file.size)}</span> • 
                          <span className="file-type">{file.type || 'Unknown type'}</span> • 
                          <span className="file-timestamp">{new Date(file.timestamp).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast('Sharing feature coming soon!')}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                        title="Share this file"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete this file"
                        aria-label="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
