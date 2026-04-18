import { useEffect, useState } from 'react'
import api from '../../api/client'
import WindowChrome from './WindowChrome'
import { FileText, Loader } from 'lucide-react'

interface Props {
  doc: { name: string; file_type?: string }
  onClose: () => void
  zIndex?: number
  onFocus?: () => void
}

const TEXT_TYPES = new Set(['text/plain', 'application/json', 'application/xml'])

function isImage(ft?: string) { return !!ft?.startsWith('image/') }
function isPdf(ft?: string) { return ft === 'application/pdf' }
function isText(ft?: string) { return !!ft && TEXT_TYPES.has(ft) }

function formatText(raw: string, fileType?: string) {
  if (fileType === 'application/json') {
    try { return JSON.stringify(JSON.parse(raw), null, 2) } catch { /* fall through */ }
  }
  return raw
}

export default function PreviewWindow({ doc, onClose, zIndex, onFocus }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string
    setError(null); setBlobUrl(null); setText(null)

    api.get(`/preview/${doc.name}`, { responseType: 'blob' })
      .then(async (res) => {
        if (isText(doc.file_type)) {
          const raw = await res.data.text()
          setText(formatText(raw, doc.file_type))
        } else {
          objectUrl = URL.createObjectURL(res.data)
          setBlobUrl(objectUrl)
        }
      })
      .catch(() => setError('Preview not available for this file type.'))

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [doc.name, doc.file_type])

  const loading = !blobUrl && !text && !error

  return (
    <WindowChrome
      title={`Preview — ${doc.name}`}
      defaultWidth={720}
      defaultHeight={540}
      defaultX={160}
      defaultY={60}
      onClose={onClose}
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="flex items-center justify-center h-full" style={{ background: '#f5ede0' }}>
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <Loader size={24} color="#8b6914" className="animate-spin" />
            <span className="text-sm" style={{ color: '#7a6548' }}>Loading preview...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2">
            <FileText size={40} color="#d4c4a8" />
            <span className="text-sm" style={{ color: '#7a6548' }}>{error}</span>
          </div>
        )}

        {blobUrl && isImage(doc.file_type) && (
          <img src={blobUrl} alt={doc.name} className="max-w-full max-h-full object-contain p-4" />
        )}

        {blobUrl && isPdf(doc.file_type) && (
          <iframe src={blobUrl} className="w-full h-full border-0" title={doc.name} />
        )}

        {text !== null && (
          <pre
            className="w-full h-full overflow-auto p-4 text-xs leading-relaxed"
            style={{ fontFamily: 'ui-monospace, monospace', color: '#2c1a06', background: '#fdf8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {text}
          </pre>
        )}
      </div>
    </WindowChrome>
  )
}
