import { useState, useEffect } from 'react'
import { Upload, File, Download, Trash2, Paperclip } from 'lucide-react'

function FileManager({ jobId }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [jobId])

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files?jobId=${jobId}`)
      const data = await response.json()
      setFiles(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching files:', error)
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Soubor je příliš velký. Maximum je 10 MB.')
      return
    }

    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1]

        const response = await fetch(`/api/files?jobId=${jobId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        })

        if (response.ok) {
          const newFile = await response.json()
          setFiles([newFile, ...files])
        } else {
          alert('Nepodařilo se nahrát soubor')
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Chyba při nahrávání souboru')
      setUploading(false)
    }
  }

  const handleDelete = async (fileId) => {
    if (!window.confirm('Opravdu chcete smazat tento soubor?')) return

    try {
      await fetch(`/api/files?jobId=${jobId}&fileId=${fileId}`, {
        method: 'DELETE',
      })
      setFiles(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Chyba při mazání souboru')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝'
    if (fileType?.includes('image')) return '🖼️'
    return '📎'
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Načítání souborů...</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Paperclip className="w-4 h-4" />
          Přiložené soubory
        </label>
        <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
          <Upload className="w-4 h-4" />
          {uploading ? 'Nahrávání...' : 'Nahrát soubor'}
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
        </label>
      </div>

      {files.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
          Žádné soubory
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString('cs-CZ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Stáhnout"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Smazat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileManager
