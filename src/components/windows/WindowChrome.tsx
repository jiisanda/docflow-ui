import { Rnd } from 'react-rnd'
import { X, Minus, Square } from 'lucide-react'
import { useState } from 'react'

interface Props {
  title: string
  defaultWidth?: number
  defaultHeight?: number
  defaultX?: number
  defaultY?: number
  onClose: () => void
  children: React.ReactNode
  zIndex?: number
  onFocus?: () => void
}

export default function WindowChrome({
  title, defaultWidth = 640, defaultHeight = 480,
  defaultX = 120, defaultY = 80,
  onClose, children, zIndex = 10, onFocus
}: Props) {
  const [minimized, setMinimized] = useState(false)

  return (
    <Rnd
      default={{ x: defaultX, y: defaultY, width: defaultWidth, height: minimized ? 36 : defaultHeight }}
      minWidth={320}
      minHeight={minimized ? 36 : 200}
      bounds="window"
      style={{ zIndex }}
      onMouseDown={onFocus}
      dragHandleClassName="window-drag-handle"
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden window-shadow"
        style={{ border: '1px solid rgba(92,61,17,0.18)', background: 'rgba(255,250,242,0.97)' }}>

        {/* Title bar */}
        <div className="window-drag-handle flex items-center justify-between px-3 h-9 shrink-0 cursor-move"
          style={{ background: '#5c3d11', borderBottom: '1px solid rgba(92,61,17,0.3)' }}>
          <span className="text-sm font-medium truncate" style={{ color: '#f5e6c8' }}>{title}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized((v) => !v)}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: '#f59e0b' }}>
              <Minus size={10} color="#7a4500" />
            </button>
            <button
              className="w-5 h-5 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 cursor-not-allowed"
              style={{ background: '#22c55e' }}>
              <Square size={9} color="#14532d" />
            </button>
            <button onClick={onClose}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: '#ef4444' }}>
              <X size={10} color="#7f1d1d" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!minimized && (
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        )}
      </div>
    </Rnd>
  )
}
