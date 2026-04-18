import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listDocuments, deleteDocument, archiveDocument } from '../../api/documents'
import Topbar from './Topbar'
import Dock from './Dock'
import FileIcon from './FileIcon'
import ContextMenu from './ContextMenu'
import TrashWindow from '../windows/TrashWindow'
import ArchiveWindow from '../windows/ArchiveWindow'
import PreviewWindow from '../windows/PreviewWindow'
import { Upload, FolderOpen } from 'lucide-react'

interface Props { username: string; onLogout: () => void }

type WinType = 'trash' | 'archive' | 'notif' | 'preview'
interface OpenWindow { id: string; type: WinType; doc?: any }

type ContextState = { x: number; y: number; doc: any } | null

export default function Desktop({ username, onLogout }: Props) {
  const qc = useQueryClient()
  const [context, setContext] = useState<ContextState>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [topZ, setTopZ] = useState(10)
  const [winZ, setWinZ] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => listDocuments(),
  })

  const deleteMut = useMutation({
    mutationFn: (name: string) => deleteDocument(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })

  const archiveMut = useMutation({
    mutationFn: (name: string) => archiveDocument(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })

  const docs: any[] = data?.response ?? []

  const openWindow = (type: WinType, doc?: any) => {
    // for singleton windows (trash/archive/notif) bring to front if already open
    if (type !== 'preview') {
      const existing = windows.find((w) => w.type === type)
      if (existing) { focusWindow(existing.id); return }
    } else {
      // for preview, deduplicate by doc id
      const existing = windows.find((w) => w.type === 'preview' && w.doc?.id === doc?.id)
      if (existing) { focusWindow(existing.id); return }
    }
    const newZ = topZ + 1
    setTopZ(newZ)
    const id = `${type}-${Date.now()}`
    setWindows((w) => [...w, { id, type, doc }])
    setWinZ((z) => ({ ...z, [id]: newZ }))
  }

  const closeWindow = (id: string) => {
    setWindows((w) => w.filter((x) => x.id !== id))
  }

  const focusWindow = useCallback((id: string) => {
    setTopZ((z) => {
      const newZ = z + 1
      setWinZ((wz) => ({ ...wz, [id]: newZ }))
      return newZ
    })
  }, [])

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (!files.length) return
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    await fetch('/v2/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      body: form,
    })
    qc.invalidateQueries({ queryKey: ['documents'] })
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    await fetch('/v2/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      body: form,
    })
    qc.invalidateQueries({ queryKey: ['documents'] })
  }

  return (
    <div className="flex flex-col w-screen h-screen"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => { setContext(null); setSelected(null) }}>

      <Topbar
        username={username}
        onLogout={onLogout}
        onSearch={() => {}}
        notifCount={0}
        onNotif={() => openWindow('notif')}
        currentPath={[]}
      />

      {/* Desktop area */}
      <div className="relative flex-1 overflow-hidden">

        {/* Drop hint */}
        {docs.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(92,61,17,0.08)', border: '2px dashed rgba(92,61,17,0.25)' }}>
              <Upload size={28} color="rgba(92,61,17,0.35)" />
            </div>
            <p className="text-sm" style={{ color: 'rgba(92,61,17,0.45)' }}>Drop files here or click Upload</p>
          </div>
        )}

        {/* File icons grid */}
        <div className="flex flex-wrap content-start gap-2 p-6 pr-24" style={{ maxWidth: 'calc(100% - 80px)' }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-20 h-24 rounded-xl animate-pulse" style={{ background: 'rgba(92,61,17,0.08)' }} />
              ))
            : docs.map((doc: any) => (
                <FileIcon
                  key={doc.id}
                  doc={doc}
                  selected={selected === doc.id}
                  onDoubleClick={() => openWindow('preview', doc)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelected(doc.id)
                    setContext({ x: e.clientX, y: e.clientY, doc })
                  }}
                />
              ))
          }
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
          style={{ background: '#5c3d11', color: '#f5e6c8', boxShadow: '0 4px 12px rgba(92,61,17,0.35)' }}>
          <Upload size={15} />
          Upload
        </button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} />

        {/* Right dock */}
        <Dock
          onTrash={() => openWindow('trash')}
          onArchive={() => openWindow('archive')}
          onNotif={() => openWindow('notif')}
          notifCount={0}
        />

        {/* Context menu */}
        {context && (
          <ContextMenu
            x={context.x}
            y={context.y}
            onClose={() => setContext(null)}
            onPreview={() => { openWindow('preview', context.doc); setContext(null) }}
            onDownload={() => {}}
            onShareLink={() => {}}
            onShareMail={() => {}}
            onArchive={() => { archiveMut.mutate(context.doc.name); setContext(null) }}
            onDelete={() => { deleteMut.mutate(context.doc.name); setContext(null) }}
          />
        )}

        {/* All windows */}
        {windows.map((w) => {
          if (w.type === 'trash') return (
            <TrashWindow key={w.id} onClose={() => closeWindow(w.id)} zIndex={winZ[w.id]} onFocus={() => focusWindow(w.id)} />
          )
          if (w.type === 'archive') return (
            <ArchiveWindow key={w.id} onClose={() => closeWindow(w.id)} zIndex={winZ[w.id]} onFocus={() => focusWindow(w.id)} />
          )
          if (w.type === 'preview' && w.doc) return (
            <PreviewWindow key={w.id} doc={w.doc} onClose={() => closeWindow(w.id)} zIndex={winZ[w.id]} onFocus={() => focusWindow(w.id)} />
          )
          return null
        })}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 h-6 shrink-0 text-xs"
        style={{ background: 'rgba(92,61,17,0.08)', borderTop: '1px solid rgba(92,61,17,0.1)', color: '#7a6548' }}>
        <span className="flex items-center gap-1"><FolderOpen size={11} /> {docs.length} document{docs.length !== 1 ? 's' : ''}</span>
        <span>DocFlow v1.0.0</span>
      </div>
    </div>
  )
}
