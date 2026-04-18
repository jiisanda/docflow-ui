import { useEffect, useRef } from 'react'
import { Eye, Download, Link, Mail, Archive, Trash2 } from 'lucide-react'

interface Props {
  x: number
  y: number
  onClose: () => void
  onPreview: () => void
  onDownload: () => void
  onShareLink: () => void
  onShareMail: () => void
  onArchive: () => void
  onDelete: () => void
}

interface ItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  divider?: boolean
}

function Item({ icon, label, onClick, danger, divider }: ItemProps) {
  return (
    <>
      {divider && <div className="my-1 mx-2 h-px" style={{ background: 'rgba(92,61,17,0.12)' }} />}
      <button
        className="context-menu-item flex items-center gap-2.5 w-full px-3 py-1.5 text-sm rounded-md text-left transition-colors"
        style={{ color: danger ? '#c0392b' : '#2c1a06' }}
        onClick={onClick}
      >
        <span style={{ opacity: 0.7 }}>{icon}</span>
        {label}
      </button>
    </>
  )
}

export default function ContextMenu({ x, y, onClose, onPreview, onDownload, onShareLink, onShareMail, onArchive, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [onClose])

  // keep menu in viewport
  const menuW = 180
  const menuH = 220
  const left = Math.min(x, window.innerWidth - menuW - 8)
  const top = Math.min(y, window.innerHeight - menuH - 8)

  return (
    <div ref={ref}
      className="fixed z-50 p-1 rounded-xl window-shadow"
      style={{ left, top, width: menuW, background: 'rgba(255,250,242,0.96)', border: '1px solid rgba(92,61,17,0.15)', backdropFilter: 'blur(12px)' }}>
      <Item icon={<Eye size={14} />} label="Preview" onClick={() => { onPreview(); onClose() }} />
      <Item icon={<Download size={14} />} label="Download" onClick={() => { onDownload(); onClose() }} />
      <Item icon={<Link size={14} />} label="Share link" onClick={() => { onShareLink(); onClose() }} />
      <Item icon={<Mail size={14} />} label="Send via email" onClick={() => { onShareMail(); onClose() }} />
      <Item icon={<Archive size={14} />} label="Archive" onClick={() => { onArchive(); onClose() }} divider />
      <Item icon={<Trash2 size={14} />} label="Move to Trash" onClick={() => { onDelete(); onClose() }} danger divider />
    </div>
  )
}
