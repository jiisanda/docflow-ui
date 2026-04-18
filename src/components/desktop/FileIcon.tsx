import { useState, useRef } from 'react'
import { FileText, Image, FileArchive, File } from 'lucide-react'

interface Doc {
  id: string
  name: string
  file_type?: string
  size?: number
  created_at?: string
  tags?: string[]
  categories?: string[]
  status?: string
}

interface Props {
  doc: Doc
  onDoubleClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
  selected: boolean
}

function getIcon(fileType?: string) {
  if (!fileType) return <File size={32} color="#8b6914" />
  if (fileType.includes('image')) return <Image size={32} color="#2980b9" />
  if (fileType.includes('pdf')) return <FileText size={32} color="#c0392b" />
  if (fileType.includes('zip') || fileType.includes('archive')) return <FileArchive size={32} color="#8e44ad" />
  return <FileText size={32} color="#5c3d11" />
}

function getExt(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? 'FILE'
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="shrink-0 w-16 text-right" style={{ color: '#a0876a' }}>{label}</span>
      <span className="truncate" style={{ color: '#2c1a06' }}>{value}</span>
    </div>
  )
}

export default function FileIcon({ doc, onDoubleClick, onContextMenu, selected }: Props) {
  const [tooltip, setTooltip] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPos({ x: r.right + 8, y: r.top })
    timer.current = setTimeout(() => setTooltip(true), 600)
  }

  const handleMouseLeave = () => {
    if (timer.current) clearTimeout(timer.current)
    setTooltip(false)
  }

  return (
    <div
      className="icon-wrap flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer w-20 transition-all"
      style={{ background: selected ? 'rgba(92,61,17,0.12)' : 'transparent' }}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="icon-img w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-transform relative"
        style={{ background: 'rgba(255,250,242,0.85)', border: '1px solid rgba(92,61,17,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {getIcon(doc.file_type)}
        <span className="absolute bottom-1 right-1 text-[8px] font-bold px-0.5 rounded"
          style={{ background: 'rgba(92,61,17,0.12)', color: '#7a6548' }}>
          {getExt(doc.name)}
        </span>
      </div>
      <span className="icon-label text-[11px] text-center leading-tight px-1 max-w-full truncate"
        style={{ color: '#2c1a06' }}>
        {doc.name}
      </span>

      {tooltip && (
        <div
          className="fixed z-9999 text-[11px] rounded-xl py-2.5 px-3 flex flex-col gap-1 pointer-events-none"
          style={{
            left: Math.min(pos.x, window.innerWidth - 200),
            top: Math.max(4, Math.min(pos.y, window.innerHeight - 160)),
            background: 'rgba(255,250,242,0.97)',
            border: '1px solid rgba(92,61,17,0.18)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            minWidth: 180,
            maxWidth: 220,
          }}
        >
          <span className="font-semibold truncate mb-0.5" style={{ color: '#2c1a06' }}>{doc.name}</span>
          <MetaRow label="Type" value={doc.file_type ?? getExt(doc.name)} />
          <MetaRow label="Size" value={formatSize(doc.size)} />
          <MetaRow label="Added" value={formatDate(doc.created_at)} />
          {doc.status && <MetaRow label="Status" value={doc.status} />}
          {doc.tags && doc.tags.length > 0 && <MetaRow label="Tags" value={doc.tags.join(', ')} />}
          {doc.categories && doc.categories.length > 0 && <MetaRow label="Category" value={doc.categories.join(', ')} />}
        </div>
      )}
    </div>
  )
}
