import { useState } from 'react'
import { CheckCircle2, AlertCircle, Database, Link2, RefreshCw, Server, Sparkles, Video, Volume2, ShieldCheck, Trash2 } from 'lucide-react'

export default function IntegrationsView({
  backendStatus,
  onTestBackend,
  apiUrl,
  meetingsCount,
  onResetData,
  onClearAll,
  showToast,
}) {
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    setTesting(true)
    await onTestBackend()
    setTesting(false)
    showToast(backendStatus.online ? 'Backend is healthy & online' : 'Backend is unreachable', backendStatus.online ? 'info' : 'error')
  }

  return (
    <div style={{ display: 'grid', gap: '22px', maxWidth: '880px' }}>
      {/* Intro Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#24352f', fontFamily: 'Manrope' }}>
          Integrations & System Architecture
        </h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#7a8c84' }}>
          Real-time status of backend microservices, audio transcription models, and local persistence.
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div style={{ display: 'grid', gap: '14px' }}>
        {/* CARD 1: FASTAPI BACKEND */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: backendStatus.online ? '#e6f5ee' : '#fbebeb',
                color: backendStatus.online ? '#227b55' : '#c93b3b',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Server size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ fontSize: '13px', color: '#263730' }}>FastAPI Pipeline Bridge</b>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: backendStatus.online ? '#d8f2e4' : '#f9dddd',
                    color: backendStatus.online ? '#176643' : '#b22e2e',
                  }}
                >
                  {backendStatus.online ? 'CONNECTED' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#889891', marginTop: '3px', fontFamily: 'monospace' }}>
                {apiUrl} {backendStatus.online && `(${backendStatus.latency}ms ping)`}
              </div>
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #d4ded9',
              background: '#fff',
              borderRadius: '7px',
              padding: '7px 12px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#344e43',
              cursor: testing ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={13} className={testing ? 'spin' : ''} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* CARD 2: SPEECH TO TEXT */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#edf4f8',
                color: '#286bb5',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Volume2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ fontSize: '13px', color: '#263730' }}>Whisper & Sarvam Speech Transcription</b>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#e2effa',
                    color: '#1d5e9f',
                  }}
                >
                  ACTIVE
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#889891', marginTop: '3px' }}>
                Supports English (OpenAI Whisper base/tiny) and Hinglish (Sarvam AI API)
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#387355', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Ready
          </div>
        </div>

        {/* CARD 3: MISTRAL AI */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#f6effe',
                color: '#7b38c2',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ fontSize: '13px', color: '#263730' }}>Mistral AI & LangChain LCEL RAG</b>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#ede3fb',
                    color: '#652ca4',
                  }}
                >
                  MISTRAL-SMALL
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#889891', marginTop: '3px' }}>
                Generates summaries, extracts action items, decisions, and powers meeting Q&A
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#387355', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Ready
          </div>
        </div>

        {/* CARD 4: YT-DLP & FFMPEG */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#fef1eb',
                color: '#bd4b17',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Video size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ fontSize: '13px', color: '#263730' }}>Audio Extractor (yt-dlp & FFmpeg)</b>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#fbe4d9',
                    color: '#a13b0d',
                  }}
                >
                  16KHZ MONO WAV
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#889891', marginTop: '3px' }}>
                Downloads audio from YouTube URLs and converts MP4, MOV, MKV, MP3, WAV
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#387355', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Ready
          </div>
        </div>

        {/* CARD 5: CLIENT STORAGE */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#ebf5ef',
                color: '#257a55',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ fontSize: '13px', color: '#263730' }}>Client Storage (LocalStorage)</b>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#dcf0e5',
                    color: '#1a6442',
                  }}
                >
                  {meetingsCount} MEETINGS
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#889891', marginTop: '3px' }}>
                Persists your analyzed meeting history and notes safely in your browser
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                if (window.confirm('Reset data to initial sample meetings?')) {
                  onResetData()
                  showToast('Reset to demo sample data')
                }
              }}
              style={{
                border: '1px solid #d4ded9',
                background: '#fff',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#276e55',
                cursor: 'pointer',
              }}
            >
              Reset Samples
            </button>
            <button
              onClick={() => {
                if (window.confirm('Clear all meeting records?')) {
                  onClearAll()
                  showToast('All meetings cleared')
                }
              }}
              style={{
                border: '1px solid #f0d5d5',
                background: '#fff',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#b83b3b',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
