import { useState } from 'react'
import { X, User, ShieldCheck, Database, RefreshCw, Trash2, Check } from 'lucide-react'

export default function SettingsModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  apiUrl,
  onUpdateApiUrl,
  meetingsCount,
  onResetData,
  onClearAll,
  showToast,
}) {
  const [name, setName] = useState(profile.name)
  const [workspace, setWorkspace] = useState(profile.workspace)
  const [api, setApi] = useState(apiUrl)

  if (!isOpen) return null

  const handleSave = e => {
    e.preventDefault()
    onUpdateProfile({ name: name.trim() || 'User', workspace: workspace.trim() || 'Personal workspace' })
    onUpdateApiUrl(api.trim() || 'http://localhost:8000/api')
    showToast('Settings saved successfully')
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(16, 44, 39, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e9efec',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8faf9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#d9f2e8',
                color: '#1b7559',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <User size={16} />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#25352f' }}>
              Workspace & App Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close"
            style={{ width: '28px', height: '28px' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} style={{ padding: '22px', overflowY: 'auto', display: 'grid', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#44564e', marginBottom: '6px' }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Iqra Zaheer"
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #dbe3df',
                borderRadius: '7px',
                fontSize: '12px',
                color: '#283832',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#44564e', marginBottom: '6px' }}>
              Workspace Name
            </label>
            <input
              type="text"
              value={workspace}
              onChange={e => setWorkspace(e.target.value)}
              placeholder="e.g. AI Product Lab"
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #dbe3df',
                borderRadius: '7px',
                fontSize: '12px',
                color: '#283832',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#44564e', marginBottom: '6px' }}>
              FastAPI Backend Endpoint URL
            </label>
            <input
              type="text"
              value={api}
              onChange={e => setApi(e.target.value)}
              placeholder="http://localhost:8000/api"
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #dbe3df',
                borderRadius: '7px',
                fontSize: '12px',
                color: '#283832',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <small style={{ display: 'block', color: '#889891', fontSize: '10px', marginTop: '4px' }}>
              Default: http://localhost:8000/api (used by uvicorn api:app)
            </small>
          </div>

          <div
            style={{
              padding: '14px',
              background: '#f5faf7',
              borderRadius: '9px',
              border: '1px solid #e1ede6',
              display: 'grid',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#314e43', fontSize: '12px', fontWeight: '600' }}>
              <Database size={15} />
              <span>Meeting Storage</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '10px',
                  background: '#d4ebd9',
                  color: '#1a5f3e',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {meetingsCount} meeting{meetingsCount === 1 ? '' : 's'} stored
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '10px', color: '#688075', lineHeight: '1.5' }}>
              Your analyzed meetings are safely persisted in your browser's local storage.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all meeting data back to default sample meetings?')) {
                    onResetData()
                    showToast('Data reset to sample meetings')
                    onClose()
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#276e55',
                  background: '#fff',
                  border: '1px solid #cce1d6',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={12} /> Reset to Samples
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete ALL stored meetings?')) {
                    onClearAll()
                    showToast('All meetings cleared')
                    onClose()
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#bd4b4b',
                  background: '#fff',
                  border: '1px solid #eed2d2',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={12} /> Clear All
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: '1px solid #d4ded8',
                background: '#fff',
                color: '#53655c',
                borderRadius: '7px',
                padding: '8px 14px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                border: 'none',
                background: '#276e55',
                color: '#fff',
                borderRadius: '7px',
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
