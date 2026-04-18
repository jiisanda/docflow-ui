import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { shareLink } from '../../api/documents'
import WindowChrome from './WindowChrome'
import { Link, X, Copy, Check, Plus } from 'lucide-react'

interface Props {
  doc: { name: string }
  onClose: () => void
  zIndex?: number
  onFocus?: () => void
}

const inputStyle: React.CSSProperties = {
  background: '#f5ede0',
  border: '1.5px solid #d4c4a8',
  color: '#2c1a06',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  outline: 'none',
  width: '100%',
}

export default function ShareWindow({ doc, onClose, zIndex, onFocus }: Props) {
  const [visits, setVisits] = useState(5)
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const addEmail = () => {
    const v = emailInput.trim()
    if (v && !emails.includes(v)) setEmails((e) => [...e, v])
    setEmailInput('')
  }

  const shareMut = useMutation({
    mutationFn: () => shareLink(doc.name, visits, emails),
    onSuccess: (data) => setShareUrl(data.share_this),
  })

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <WindowChrome
      title={`Share — ${doc.name}`}
      defaultWidth={400}
      defaultHeight={320}
      defaultX={320}
      defaultY={180}
      onClose={onClose}
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="flex flex-col gap-4 p-5 h-full overflow-auto">

        {/* Visits */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: '#7a6548' }}>Max visits</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={visits}
            onChange={(e) => setVisits(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        {/* Email recipients */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: '#7a6548' }}>Share with (optional)</label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="email@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addEmail}
              className="px-2.5 rounded-lg flex items-center"
              style={{ background: '#5c3d11', color: '#f5e6c8' }}>
              <Plus size={14} />
            </button>
          </div>
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {emails.map((e) => (
                <span key={e} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(92,61,17,0.1)', color: '#5c3d11' }}>
                  {e}
                  <button onClick={() => setEmails((es) => es.filter((x) => x !== e))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={() => shareMut.mutate()}
          disabled={shareMut.isPending}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: shareMut.isPending ? '#b8966a' : '#5c3d11', color: '#f5e6c8', cursor: shareMut.isPending ? 'not-allowed' : 'pointer' }}>
          <Link size={14} />
          {shareMut.isPending ? 'Generating...' : 'Generate link'}
        </button>

        {shareMut.isError && (
          <p className="text-xs text-center" style={{ color: '#c0392b' }}>Failed to generate link. Try again.</p>
        )}

        {/* Result */}
        {shareUrl && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: '#7a6548' }}>Shareable link</label>
            <div className="flex gap-2 items-center p-2.5 rounded-lg" style={{ background: '#f5ede0', border: '1px solid #d4c4a8' }}>
              <span className="text-[11px] truncate flex-1" style={{ color: '#2c1a06' }}>{shareUrl}</span>
              <button onClick={copy} className="shrink-0 p-1 rounded transition-all" style={{ color: '#5c3d11' }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </WindowChrome>
  )
}
