import { useState, useEffect, useRef } from 'react'
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  AudioLines,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  Menu,
  MessageCircle,
  Mic2,
  MoreHorizontal,
  PanelLeftClose,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  Share2,
  Sparkles,
  Subtitles,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react'

import { INITIAL_MEETINGS } from './sampleData'
import {
  copyToClipboard,
  estimateDuration,
  extractYouTubeId,
  formatMeetingDate,
} from './utils/helpers'

import MeetingDetail from './components/MeetingDetail'
import DashboardView from './components/DashboardView'
import TranscriptsView from './components/TranscriptsView'
import AiNotesView from './components/AiNotesView'
import IntegrationsView from './components/IntegrationsView'
import SettingsModal from './components/SettingsModal'
import Toast from './components/Toast'

const DEFAULT_API = 'http://localhost:8000/api'
const navItems = [
  { name: 'Meetings', icon: Video },
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Transcripts', icon: Subtitles },
  { name: 'AI notes', icon: Sparkles },
  { name: 'Integrations', icon: Link2 },
]

export default function App() {
  // Navigation & Page state
  const [page, setPage] = useState('Meetings')
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  // Settings & Profile state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('meetwise_api_url') || DEFAULT_API
  })
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('meetwise_profile')
      return saved ? JSON.parse(saved) : { name: 'Iqra Zaheer', workspace: 'Personal workspace' }
    } catch {
      return { name: 'Iqra Zaheer', workspace: 'Personal workspace' }
    }
  })

  // Meetings collection (persisted in localStorage)
  const [meetings, setMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem('meetwise_meetings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Error reading meetings from storage:', e)
    }
    return INITIAL_MEETINGS
  })

  // Toast notification state
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev))
    }, 3500)
  }

  // Backend connection health status
  const [backendStatus, setBackendStatus] = useState({ online: false, latency: 0 })

  const checkBackendHealth = async () => {
    const start = Date.now()
    try {
      const res = await fetch(`${apiUrl}/health`, { method: 'GET' })
      if (res.ok) {
        const latency = Date.now() - start
        setBackendStatus({ online: true, latency })
        return true
      }
      setBackendStatus({ online: false, latency: 0 })
      return false
    } catch {
      setBackendStatus({ online: false, latency: 0 })
      return false
    }
  }

  useEffect(() => {
    checkBackendHealth()
    const timer = setInterval(checkBackendHealth, 30000)
    return () => clearInterval(timer)
  }, [apiUrl])

  // Save meetings to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('meetwise_meetings', JSON.stringify(meetings))
    } catch (e) {
      console.warn('Could not persist meetings:', e)
    }
  }, [meetings])

  // Save profile to localStorage
  const updateProfile = newProf => {
    setProfile(newProf)
    try {
      localStorage.setItem('meetwise_profile', JSON.stringify(newProf))
    } catch (e) {
      console.warn('Could not save profile:', e)
    }
  }

  // Save API URL
  const updateApiUrl = newUrl => {
    setApiUrl(newUrl)
    try {
      localStorage.setItem('meetwise_api_url', newUrl)
    } catch (e) {
      console.warn('Could not save api url:', e)
    }
  }

  // Calculate initials from profile name
  const initials = profile.name
    ? profile.name
        .split(/\s+/)
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ME'

  // Capture Form State
  const [source, setSource] = useState('')
  const [language, setLanguage] = useState('english')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [busyStage, setBusyStage] = useState('')
  const [error, setError] = useState('')
  const uploadRef = useRef(null)

  // Keyboard shortcut: Cmd+K / Ctrl+K to search
  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Analyze function that connects to FastAPI backend
  async function analyze(e) {
    e?.preventDefault()
    if (!file && !source.trim()) {
      setError('Paste a meeting link (e.g. YouTube) or choose an audio/video file.')
      return
    }

    setBusy(true)
    setError('')
    setBusyStage('Uploading and converting audio format...')

    try {
      const data = new FormData()
      data.append('language', language)

      let endpoint = `${apiUrl}/analyze`
      let tempMediaUrl = null

      if (file) {
        data.append('file', file)
        endpoint = `${apiUrl}/analyze-upload`
        try {
          tempMediaUrl = URL.createObjectURL(file)
        } catch {
          // Object URL not supported or failed
        }
      } else {
        data.append('source', source.trim())
      }

      setBusyStage('Running speech transcription & generating executive intelligence...')

      const response = await fetch(endpoint, { method: 'POST', body: data })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail || 'Analysis pipeline returned an error. Check backend logs.'
        )
      }

      const youtubeId = source ? extractYouTubeId(source) : null
      const isVideoFile = file ? file.name.match(/\.(mp4|mov|webm|mkv)$/i) : false

      // Construct new real meeting object
      const newMeeting = {
        id: result.session_id || `meeting-${Date.now()}`,
        session_id: result.session_id,
        title: result.title || (file ? file.name.replace(/\.[^/.]+$/, '') : 'Meeting Recording'),
        createdAt: new Date().toISOString(),
        formattedDate: 'Just now',
        duration: estimateDuration(result.transcript),
        sourceType: youtubeId ? 'youtube' : file ? (isVideoFile ? 'video' : 'audio') : 'link',
        source: file ? file.name : source.trim(),
        youtubeId,
        mediaUrl: tempMediaUrl,
        language,
        color: ['lavender', 'mint', 'peach'][Math.floor(Math.random() * 3)],
        summary: result.summary,
        transcript: result.transcript,
        action_items: result.action_items,
        key_decisions: result.key_decisions,
        open_questions: result.open_questions,
        isSample: false,
        messages: [],
      }

      // Prepend to meetings list
      setMeetings(prev => [newMeeting, ...prev])
      setSelectedMeeting(newMeeting)
      setPage('Meetings')

      // Reset form
      setSource('')
      setFile(null)
      if (uploadRef.current) uploadRef.current.value = ''
      showToast('Meeting analyzed successfully!')
    } catch (err) {
      console.error('Analysis error:', err)
      setError(
        err.message ||
          'Could not connect to the API server. Make sure "uvicorn api:app --reload" is running on port 8000.'
      )
    } finally {
      setBusy(false)
      setBusyStage('')
    }
  }

  const selectFile = e => {
    const chosen = e.target.files?.[0]
    if (chosen) {
      setFile(chosen)
      setSource('')
      setError('')
    }
  }

  const clearFile = () => {
    setFile(null)
    if (uploadRef.current) uploadRef.current.value = ''
  }

  // Update a single meeting in state (e.g. chat messages or checklist)
  const handleUpdateMeeting = updated => {
    setMeetings(prev => prev.map(m => (m.id === updated.id ? updated : m)))
    if (selectedMeeting?.id === updated.id) {
      setSelectedMeeting(updated)
    }
  }

  // Delete a meeting
  const handleDeleteMeeting = meetingId => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId))
    if (selectedMeeting?.id === meetingId) {
      setSelectedMeeting(null)
    }
  }

  // Reset to sample data
  const handleResetData = () => {
    setMeetings(INITIAL_MEETINGS)
    setSelectedMeeting(null)
    localStorage.setItem('meetwise_meetings', JSON.stringify(INITIAL_MEETINGS))
  }

  // Clear all data
  const handleClearAll = () => {
    setMeetings([])
    setSelectedMeeting(null)
    localStorage.removeItem('meetwise_meetings')
  }

  // Filter meetings by search bar
  const displayedMeetings = meetings.filter(m => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      m.title.toLowerCase().includes(q) ||
      (m.summary && m.summary.toLowerCase().includes(q)) ||
      (m.action_items && m.action_items.toLowerCase().includes(q)) ||
      (m.transcript && m.transcript.toLowerCase().includes(q))
    )
  })

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        apiUrl={apiUrl}
        onUpdateApiUrl={updateApiUrl}
        meetingsCount={meetings.length}
        onResetData={handleResetData}
        onClearAll={handleClearAll}
        showToast={showToast}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <AudioLines size={20} />
          </div>
          <span>meetwise</span>
          <button
            className="icon-btn sidebar-collapse"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          >
            <PanelLeftClose size={17} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name && !selectedMeeting ? 'active' : ''}`}
              onClick={() => {
                setPage(name)
                setSelectedMeeting(null)
                setMobileNav(false)
              }}
            >
              <Icon size={17} />
              <span>{name}</span>
              {name === 'Meetings' && (
                <span className="nav-count">{meetings.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Recent Meetings List in Sidebar */}
        <div className="nav-label recent-label">
          <span>RECENT MEETINGS</span>
          <button
            className="mini-plus"
            aria-label="New meeting"
            title="Analyze new meeting"
            onClick={() => {
              setSelectedMeeting(null)
              setPage('Meetings')
              setTimeout(() => document.getElementById('source-input')?.focus(), 100)
            }}
          >
            <Plus size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '3px', maxHeight: '180px', overflowY: 'auto' }}>
          {meetings.slice(0, 4).map(m => {
            const isSelected = selectedMeeting?.id === m.id
            const dotColor = m.color || 'purple'
            return (
              <button
                key={m.id}
                className={`recent-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMeeting(m)
                  setPage('Meetings')
                  setMobileNav(false)
                }}
                title={m.title}
              >
                <span className={`recent-dot ${dotColor}`} />
                <span className="recent-copy">
                  <b>{m.title}</b>
                  <small>{m.formattedDate || formatMeetingDate(m.createdAt)}</small>
                </span>
              </button>
            )
          })}
        </div>

        <div className="sidebar-spacer" />

        {/* Upgrade / Help Card */}
        <div className="upgrade-card">
          <div className="upgrade-icon">
            <Sparkles size={17} />
          </div>
          <b>AI Video Assistant</b>
          <p>Speech transcription, RAG Q&A, and action extraction powered by Mistral AI.</p>
          <button onClick={() => setSettingsOpen(true)}>
            Settings & Backend <Settings2 size={13} />
          </button>
        </div>

        {/* User Profile */}
        <button
          className="profile"
          onClick={() => setSettingsOpen(true)}
          title="Click to edit profile & settings"
        >
          <div className="avatar">{initials}</div>
          <span>
            <b>{profile.name}</b>
            <small>{profile.workspace}</small>
          </span>
          <Settings2 size={16} style={{ color: '#8aa59e' }} />
        </button>
      </aside>

      {mobileNav && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="main-area">
        {/* Top Header Bar */}
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>

          <div className="crumb">
            <span>Workspace</span>
            <span className="slash">/</span>
            <b>{selectedMeeting ? 'Meeting Detail' : page}</b>
          </div>

          <div className="top-actions">
            {/* Global Search Input */}
            <div className="search-box">
              <Search size={15} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search meetings & notes..."
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#889891', cursor: 'pointer', padding: 0 }}
                >
                  <X size={13} />
                </button>
              ) : (
                <kbd>⌘ K</kbd>
              )}
            </div>

            {/* Backend Status Chip */}
            <div
              onClick={checkBackendHealth}
              title={
                backendStatus.online
                  ? `Backend connected (${backendStatus.latency}ms ping)`
                  : 'Backend offline: run "uvicorn api:app --reload"'
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: backendStatus.online ? '#e8f5ee' : '#faebeb',
                color: backendStatus.online ? '#1c724e' : '#bb3939',
                border: `1px solid ${backendStatus.online ? '#c7ebd6' : '#f5cfcf'}`,
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: backendStatus.online ? '#2ba879' : '#d9534f',
                }}
              />
              <span>{backendStatus.online ? 'API Online' : 'API Offline'}</span>
            </div>

            <button
              className="icon-btn top-settings"
              aria-label="Settings"
              title="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 size={18} />
            </button>

            <div
              className="avatar top-avatar"
              onClick={() => setSettingsOpen(true)}
              style={{ cursor: 'pointer' }}
              title={profile.name}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="workspace">
          {/* If a meeting is selected, render MeetingDetail */}
          {selectedMeeting ? (
            <MeetingDetail
              meeting={selectedMeeting}
              onBack={() => setSelectedMeeting(null)}
              onUpdateMeeting={handleUpdateMeeting}
              onDeleteMeeting={handleDeleteMeeting}
              apiUrl={apiUrl}
              showToast={showToast}
            />
          ) : page === 'Dashboard' ? (
            <DashboardView
              meetings={meetings}
              onSelectMeeting={m => setSelectedMeeting(m)}
              onStartNewMeeting={() => {
                setPage('Meetings')
                setTimeout(() => document.getElementById('source-input')?.focus(), 50)
              }}
              backendStatus={backendStatus}
              onTestBackend={checkBackendHealth}
              showToast={showToast}
            />
          ) : page === 'Transcripts' ? (
            <TranscriptsView
              meetings={meetings}
              onSelectMeeting={m => setSelectedMeeting(m)}
              showToast={showToast}
            />
          ) : page === 'AI notes' ? (
            <AiNotesView
              meetings={meetings}
              onSelectMeeting={m => setSelectedMeeting(m)}
              showToast={showToast}
            />
          ) : page === 'Integrations' ? (
            <IntegrationsView
              backendStatus={backendStatus}
              onTestBackend={checkBackendHealth}
              apiUrl={apiUrl}
              meetingsCount={meetings.length}
              onResetData={handleResetData}
              onClearAll={handleClearAll}
              showToast={showToast}
            />
          ) : (
            /* DEFAULT VIEW: MEETINGS PAGE */
            <>
              {/* Heading */}
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span className="live-dot" /> YOUR MEETING SPACE
                  </div>
                  <h1>Meetings</h1>
                  <p>Capture, transcribe, and synthesize every conversation into clear action items.</p>
                </div>

                <button
                  className="new-meeting-btn"
                  onClick={() => document.getElementById('source-input')?.focus()}
                >
                  <Plus size={16} /> New meeting
                </button>
              </div>

              {/* Capture Card Section */}
              <section className="capture-card">
                <div className="capture-copy">
                  <div className="capture-kicker">
                    <span className="sparkle-wrap">
                      <Sparkles size={14} />
                    </span>{' '}
                    MEETING INTELLIGENCE
                  </div>
                  <h2>
                    Turn conversations<br />
                    into <span>clear next steps.</span>
                  </h2>
                  <p>
                    Bring a YouTube link or upload an audio/video recording. Get an accurate transcript,
                    executive summary, action items with owners, and interactive Q&A.
                  </p>
                  <div className="trust-row">
                    <span>
                      <Check size={13} /> Private & Local
                    </span>
                    <span>
                      <Check size={13} /> MP4, MOV, MP3, WAV
                    </span>
                  </div>
                </div>

                <div className="capture-form-wrap">
                  <form className="capture-form" onSubmit={analyze}>
                    <label htmlFor="source-input">Add a meeting recording or video link</label>

                    {/* URL Input Field */}
                    <div className="source-field">
                      <Link2 size={17} />
                      <input
                        id="source-input"
                        value={source}
                        onChange={e => {
                          setSource(e.target.value)
                          if (e.target.value) clearFile()
                          if (error) setError('')
                        }}
                        placeholder="Paste a YouTube video link..."
                      />
                      <button
                        className="paste-btn"
                        type="button"
                        onClick={async () => {
                          try {
                            const t = await navigator.clipboard.readText()
                            if (t) {
                              setSource(t)
                              clearFile()
                            }
                          } catch {
                            document.getElementById('source-input')?.focus()
                          }
                        }}
                      >
                        Paste
                      </button>
                    </div>

                    <div className="or-divider">
                      <span />
                      or
                      <span />
                    </div>

                    {/* File Upload Drop Area */}
                    <button
                      className={`upload-drop ${file ? 'has-file' : ''}`}
                      type="button"
                      onClick={() => uploadRef.current?.click()}
                    >
                      <span className="upload-icon">
                        {file ? <Check size={18} /> : <Upload size={18} />}
                      </span>
                      <span>
                        <b>{file ? file.name : 'Choose a file to upload'}</b>
                        <small>
                          {file
                            ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to change`
                            : 'MP4, MOV, MKV, MP3, WAV up to 500 MB'}
                        </small>
                      </span>
                      {file ? (
                        <span
                          onClick={e => {
                            e.stopPropagation()
                            clearFile()
                          }}
                          style={{ color: '#b53e3e', padding: '4px' }}
                          title="Remove file"
                        >
                          <X size={15} />
                        </span>
                      ) : (
                        <ArrowDownToLine size={16} className="upload-arrow" />
                      )}
                    </button>

                    <input
                      ref={uploadRef}
                      type="file"
                      accept="audio/*,video/*,.mp4,.mov,.mkv,.webm,.mp3,.wav,.m4a"
                      hidden
                      onChange={selectFile}
                    />

                    {/* Bottom Controls */}
                    <div className="form-bottom">
                      <label className="language-select">
                        <span>Transcription language</span>
                        <select
                          value={language}
                          onChange={e => setLanguage(e.target.value)}
                        >
                          <option value="english">English (Whisper)</option>
                          <option value="hinglish">Hinglish (Sarvam AI)</option>
                        </select>
                        <ChevronDown size={14} />
                      </label>

                      <button className="analyze-btn" disabled={busy} type="submit">
                        {busy ? (
                          <>
                            <LoaderCircle size={16} className="spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={15} /> Analyze meeting
                          </>
                        )}
                      </button>
                    </div>

                    {/* Progress Indicator */}
                    {busy && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '8px 10px',
                          background: '#f2f9f5',
                          borderRadius: '6px',
                          border: '1px solid #d4ebdd',
                          fontSize: '10px',
                          color: '#28684d',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <LoaderCircle size={13} className="spin" />
                        <span>{busyStage || 'Analyzing recording with AI...'}</span>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="error-msg">
                        <X size={14} />
                        <span>{error}</span>
                      </div>
                    )}
                  </form>

                  <div className="form-footnote">
                    <span className="lock-icon">◆</span> Your recordings stay private and are processed locally.
                  </div>
                </div>

                <div className="deco deco-one" />
                <div className="deco deco-two" />
              </section>

              {/* Recent Meetings Section Header */}
              <div className="section-row">
                <div>
                  <h2 className="section-title">
                    {searchQuery ? `Search results for "${searchQuery}"` : 'Your Meetings'}
                  </h2>
                  <p className="section-subtitle">
                    {searchQuery
                      ? `Found ${displayedMeetings.length} matching meetings`
                      : 'Pick up where you left off or review past summaries.'}
                  </p>
                </div>

                {searchQuery && (
                  <button
                    className="view-all"
                    onClick={() => setSearchQuery('')}
                    style={{ cursor: 'pointer' }}
                  >
                    Clear search <X size={13} />
                  </button>
                )}
              </div>

              {/* Dynamic Meetings Grid */}
              <section className="meeting-grid">
                {displayedMeetings.length > 0 ? (
                  displayedMeetings.map(m => {
                    const colorClass = m.color || 'lavender'
                    return (
                      <article
                        className="meeting-card"
                        key={m.id}
                        onClick={() => setSelectedMeeting(m)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={`meeting-thumb ${colorClass}`}>
                          <div className="thumb-window">
                            <span />
                            <span />
                            <span />
                          </div>

                          <div className="waveform">
                            {Array.from({ length: 25 }, (_, n) => (
                              <i
                                key={n}
                                style={{
                                  height: `${8 + ((n * 17 + m.title.length * 7) % 24)}px`,
                                }}
                              />
                            ))}
                          </div>

                          <button
                            className="play-btn"
                            aria-label="Play meeting"
                            onClick={e => {
                              e.stopPropagation()
                              setSelectedMeeting(m)
                            }}
                          >
                            <Play size={13} fill="currentColor" />
                          </button>

                          <span className="duration-pill">{m.duration || '30 min'}</span>
                        </div>

                        <div className="meeting-card-body">
                          <div className="meeting-card-top">
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h3
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {m.title}
                              </h3>
                              <p>
                                <Clock3 size={13} />
                                {m.formattedDate || formatMeetingDate(m.createdAt)}
                                {m.isSample && (
                                  <span
                                    style={{
                                      marginLeft: '6px',
                                      background: '#edf4f0',
                                      color: '#346350',
                                      padding: '1px 5px',
                                      borderRadius: '3px',
                                      fontSize: '8px',
                                      fontWeight: '700',
                                    }}
                                  >
                                    Sample
                                  </span>
                                )}
                              </p>
                            </div>

                            <button
                              className="icon-btn more-btn"
                              aria-label="Delete"
                              title="Delete meeting"
                              onClick={e => {
                                e.stopPropagation()
                                if (window.confirm(`Delete meeting "${m.title}"?`)) {
                                  handleDeleteMeeting(m.id)
                                  showToast('Meeting deleted')
                                }
                              }}
                            >
                              <Trash2 size={14} style={{ color: '#9faea7' }} />
                            </button>
                          </div>

                          <p className="meeting-description">
                            {m.summary
                              ? m.summary.split('\n')[0].replace(/^[•*-]\s*/, '')
                              : 'Click to view full transcript, action items, and Q&A.'}
                          </p>

                          <div className="meeting-tags">
                            <span>
                              <FileText size={12} /> Summary
                            </span>
                            <span>
                              <MessageCircle size={12} /> AI notes
                            </span>
                            {m.sourceType === 'youtube' && (
                              <span style={{ marginLeft: 'auto', background: '#faebeb', color: '#b93a3a' }}>
                                YouTube
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })
                ) : (
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      background: '#ffffff',
                      border: '1px solid #e3ebe7',
                      borderRadius: '10px',
                      padding: '40px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#667970' }}>
                      No meetings found matching your search.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: '#276e55',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '7px 14px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </section>

              {/* Bottom Tip Callout */}
              <div className="bottom-tip">
                <div className="tip-icon">
                  <Activity size={17} />
                </div>
                <span>
                  <b>Actionable intelligence for every sync.</b> Paste any YouTube recording link or upload a
                  media file to extract summaries, follow-ups, and key decisions.
                </span>
                <button onClick={() => document.getElementById('source-input')?.focus()}>
                  Try it now <ArrowLeft size={13} />
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <footer className="footer">
            <span>Made for conversations that move work forward.</span>
            <span>
              Meetwise <span className="footer-dot">·</span> 2026
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}
