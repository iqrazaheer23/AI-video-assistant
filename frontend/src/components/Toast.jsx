import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: isError ? '#842029' : '#102c27',
        color: '#f8fbfa',
        padding: '12px 18px',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        fontSize: '12px',
        fontWeight: '500',
        animation: 'slideIn 0.25s ease-out',
      }}
    >
      {isError ? <AlertCircle size={16} color="#f5c2c7" /> : <CheckCircle2 size={16} color="#85e0a3" />}
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#d6e3df',
          padding: '2px',
          marginLeft: '6px',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}
