import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listArchive, unarchiveDocument } from '../../api/documents'
import WindowChrome from './WindowChrome'
import { Archive, RotateCcw, FileText, Image, FileArchive, File } from 'lucide-react'

interface Props {
  onClose: () => void
  onPreview: (doc: any) => void
  zIndex?: number
  onFocus?: () => void
}

function formatSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function getFileIcon(fileType?: string) {
  if (!fileType) return <File size={36} color="#8b6914" />
  if (fileType.startsWith('image/')) return <Image size={36} color="#2980b9" />
  if (fileType.includes('pdf')) return <FileText size={36} color="#c0392b" />
  if (fileType.includes('zip') || fileType.includes('archive')) return <FileArchive size={36} color="#8e44ad" />
  return <FileText size={36} color="#5c3d11" />
}

function DetailPanel({ item }: { item: any }) {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(92,61,17,0.08)', border: '1px solid rgba(92,61,17,0.12)' }}>
          {getFileIcon(item.file_type)}
        </div>
        <span className="text-xs font-semibold text-center break-all leading-tight" style={{ color: '#2c1a06' }}>
          {item.name}
        </span>
      </div>

      <div className="flex flex-col gap-2 text-[11px]" style={{ borderTop: '1px solid rgba(92,61,17,0.1)', paddingTop: 12 }}>
        {[
          { label: 'Type', value: item.file_type ?? '—' },
          { label: 'Size', value: formatSize(item.size) },
          { label: 'Added', value: formatDate(item.created_at) },
          { label: 'Status', value: item.status ?? '—' },
          ...(item.tags?.length ? [{ label: 'Tags', value: item.tags.join(', ') }] : []),
          ...(item.categories?.length ? [{ label: 'Category', value: item.categories.join(', ') }] : []),
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="font-medium mb-0.5" style={{ color: '#a0876a' }}>{label}</div>
            <div className="break-all" style={{ color: '#2c1a06' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ArchiveWindow({ onClose, onPreview, zIndex, onFocus }: Props) {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['archive'], queryFn: listArchive })

  const unarchiveMut = useMutation({
    mutationFn: (name: string) => unarchiveDocument(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['archive'] })
      qc.invalidateQueries({ queryKey: ['documents'] })
      setSelected(null)
    },
  })

  const items: any[] = data?.response ?? []

  return (
    <WindowChrome title="🗂 Archive" defaultWidth={620} defaultHeight={380} defaultX={240} defaultY={160} onClose={onClose} zIndex={zIndex} onFocus={onFocus}>
      <div className="flex h-full">

        {/* File list */}
        <div className="flex flex-col flex-1 min-w-0" style={{ borderRight: '1px solid rgba(92,61,17,0.1)' }}>
          <div className="flex items-center px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid rgba(92,61,17,0.1)' }}>
            <span className="text-xs" style={{ color: '#7a6548' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex-1 overflow-auto px-2 py-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: '#7a6548' }}>Loading...</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Archive size={32} color="#d4c4a8" />
                <span className="text-sm" style={{ color: '#b0a090' }}>Archive is empty</span>
              </div>
            ) : (
              items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg group transition-colors cursor-pointer"
                  style={{ background: selected?.id === item.id ? 'rgba(92,61,17,0.1)' : 'transparent' }}
                  onClick={() => setSelected(item)}
                  onDoubleClick={() => onPreview(item)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={15} color="#8b6914" className="shrink-0" />
                    <span className="text-sm truncate" style={{ color: '#2c1a06' }}>{item.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); unarchiveMut.mutate(item.name) }}
                    className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-md transition-all flex items-center shrink-0 ml-2"
                    style={{ background: '#5c3d11', color: '#f5e6c8' }}>
                    <RotateCcw size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-44 shrink-0 overflow-auto" style={{ background: 'rgba(92,61,17,0.03)' }}>
          {selected ? (
            <DetailPanel item={selected} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
              <File size={28} color="#d4c4a8" />
              <span className="text-[11px] text-center" style={{ color: '#b0a090' }}>Select a file to see details</span>
            </div>
          )}
        </div>

      </div>
    </WindowChrome>
  )
}
