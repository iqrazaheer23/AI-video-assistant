import { useRef, useState } from 'react'
import { Activity, ArrowDownToLine, ArrowLeft, AudioLines, Check, ChevronDown, CircleHelp, Clock3, FileText, FolderOpen, Headphones, LayoutDashboard, Link2, LoaderCircle, Menu, MessageCircle, Mic2, MoreHorizontal, PanelLeftClose, Play, Plus, Search, Send, Settings2, Share2, Sparkles, Subtitles, Upload, Video, X } from 'lucide-react'

const API = 'http://localhost:8000/api'
const navItems = [{ name: 'Dashboard', icon: LayoutDashboard }, { name: 'Meetings', icon: Video }, { name: 'Transcripts', icon: Subtitles }, { name: 'AI notes', icon: Sparkles }, { name: 'Integrations', icon: Link2 }]
const shortDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())

function App() {
  const [page, setPage] = useState('Meetings')
  const [source, setSource] = useState('')
  const [language, setLanguage] = useState('english')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [meeting, setMeeting] = useState(null)
  const [tab, setTab] = useState('Summary')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [mobileNav, setMobileNav] = useState(false)
  const uploadRef = useRef(null)

  async function analyze(e) {
    e?.preventDefault()
    if (!file && !source.trim()) { setError('Paste a meeting link or choose an audio/video file.'); return }
    setBusy(true); setError(''); setMeeting(null); setMessages([])
    try {
      const data = new FormData(); data.append('language', language)
      let endpoint = `${API}/analyze`
      if (file) { data.append('file', file); endpoint = `${API}/analyze-upload` } else data.append('source', source.trim())
      const response = await fetch(endpoint, { method: 'POST', body: data })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Analysis failed. Please try again.')
      setMeeting(result); setTab('Summary'); setPage('Meetings')
    } catch (err) { setError(err.message || 'Could not connect to the API. Start the backend and try again.') }
    finally { setBusy(false) }
  }

  async function sendQuestion(text = question) {
    const prompt = text.trim(); if (!prompt || !meeting || busy) return
    setQuestion(''); setMessages(prev => [...prev, { role: 'user', content: prompt }, { role: 'assistant', content: '', loading: true }])
    try {
      const response = await fetch(`${API}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: meeting.session_id, question: prompt }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Could not get an answer.')
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: result.answer }])
    } catch (err) { setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: err.message }]) }
  }

  const selectFile = e => { const chosen = e.target.files?.[0]; if (chosen) { setFile(chosen); setSource('') } }
  const clearFile = () => { setFile(null); if (uploadRef.current) uploadRef.current.value = '' }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><AudioLines size={20}/></div><span>meetwise</span><button className="icon-btn sidebar-collapse" aria-label="Close menu" onClick={() => setMobileNav(false)}><PanelLeftClose size={17}/></button></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list">{navItems.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${page === name ? 'active' : ''}`} onClick={() => { setPage(name); setMobileNav(false) }}><Icon size={17}/><span>{name}</span>{name === 'Meetings' && <span className="nav-count">4</span>}</button>)}</nav>
      <div className="nav-label recent-label">RECENT MEETINGS <button className="mini-plus" aria-label="New meeting" onClick={() => { setMeeting(null); setPage('Meetings') }}><Plus size={14}/></button></div>
      <button className={`recent-item ${meeting ? 'selected' : ''}`} onClick={() => meeting && setPage('Meetings')}><span className="recent-dot purple"/><span className="recent-copy"><b>{meeting?.title || 'Product sync — Q3'}</b><small>{meeting ? 'Just now' : 'Today · 10:30 AM'}</small></span></button>
      <button className="recent-item"><span className="recent-dot blue"/><span className="recent-copy"><b>Design weekly</b><small>Yesterday · 2:00 PM</small></span></button>
      <button className="recent-item"><span className="recent-dot amber"/><span className="recent-copy"><b>Team standup</b><small>Oct 22 · 9:15 AM</small></span></button>
      <div className="sidebar-spacer"/>
      <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><b>Make every meeting count</b><p>Get more out of every conversation with AI.</p><button onClick={() => setError('You’re all set — AI summaries are ready to use.')}>Explore features <ArrowLeft size={13}/></button></div>
      <button className="profile"><div className="avatar">IQ</div><span><b>Iqra Zaheer</b><small>Personal workspace</small></span><MoreHorizontal size={18}/></button>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={19}/></button><div className="crumb"><span>Workspace</span><span className="slash">/</span><b>{page}</b></div><div className="top-actions"><div className="search-box"><Search size={15}/><input placeholder="Search meetings..."/><kbd>⌘ K</kbd></div><button className="icon-btn top-help" aria-label="Help"><CircleHelp size={18}/></button><button className="icon-btn top-settings" aria-label="Settings"><Settings2 size={18}/></button><div className="avatar top-avatar">IQ</div></div></header>
      <div className="workspace">
        <div className="page-heading"><div><div className="eyebrow"><span className="live-dot"/> YOUR MEETING SPACE</div><h1>{meeting ? meeting.title : page === 'Meetings' ? 'Meetings' : page}</h1><p>{meeting ? <>Your conversation, made easier to revisit <span className="heading-dot">·</span> {shortDate}</> : 'Your conversations, all in one place.'}</p></div><button className="new-meeting-btn" onClick={() => { setMeeting(null); document.getElementById('source-input')?.focus() }}><Plus size={16}/> New meeting</button></div>
        {!meeting ? <>
          <section className="capture-card"><div className="capture-copy"><div className="capture-kicker"><span className="sparkle-wrap"><Sparkles size={14}/></span> MEETING INTELLIGENCE</div><h2>Turn conversations<br/>into <span>clear next steps.</span></h2><p>Bring a recording or meeting link. Get a searchable transcript, thoughtful summary, and the details your team needs.</p><div className="trust-row"><span><Check size={13}/> Private by design</span><span><Check size={13}/> Ready in minutes</span></div></div><div className="capture-form-wrap"><form className="capture-form" onSubmit={analyze}><label htmlFor="source-input">Add a meeting recording</label><div className="source-field"><Link2 size={17}/><input id="source-input" value={source} onChange={e => { setSource(e.target.value); if (e.target.value) clearFile() }} placeholder="Paste a YouTube or video link..."/><button className="paste-btn" type="button" onClick={async () => { try { const t = await navigator.clipboard.readText(); if (t) { setSource(t); clearFile() } } catch { document.getElementById('source-input')?.focus() } }}>Paste</button></div><div className="or-divider"><span/>or<span/></div><button className={`upload-drop ${file ? 'has-file' : ''}`} type="button" onClick={() => uploadRef.current?.click()}><span className="upload-icon">{file ? <Check size={18}/> : <Upload size={18}/>}</span><span><b>{file ? file.name : 'Choose a file to upload'}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to change` : 'MP4, MOV, MP3, WAV up to 500 MB'}</small></span><ArrowDownToLine size={16} className="upload-arrow"/></button><input ref={uploadRef} type="file" accept="audio/*,video/*,.mp4,.mov,.mkv,.webm" hidden onChange={selectFile}/><div className="form-bottom"><label className="language-select"><span>Transcription language</span><select value={language} onChange={e => setLanguage(e.target.value)}><option value="english">English</option><option value="hinglish">Hinglish</option></select><ChevronDown size={14}/></label><button className="analyze-btn" disabled={busy} type="submit">{busy ? <><LoaderCircle size={16} className="spin"/> Working...</> : <><Sparkles size={15}/> Analyze meeting</>}</button></div>{error && <div className="error-msg"><X size={14}/>{error}</div>}</form><div className="form-footnote"><LockIcon/> Your recordings stay yours. Never used to train AI.</div></div><div className="deco deco-one"/><div className="deco deco-two"/></section>
          <div className="section-row"><div><h2 className="section-title">Your recent meetings</h2><p className="section-subtitle">Pick up where you left off.</p></div><button className="view-all" onClick={() => setPage('Meetings')}>View all <ArrowLeft size={14}/></button></div>
          <section className="meeting-grid">{[{ title: 'Product sync — Q3 roadmap', date: 'Today, 10:30 AM', duration: '42 min', color: 'lavender', icon: Video, summary: 'Roadmap milestones, launch owners, and a plan for the beta release.' }, { title: 'Design weekly', date: 'Yesterday, 2:00 PM', duration: '36 min', color: 'mint', icon: Mic2, summary: 'Updated user flows and shared feedback from customer interviews.' }, { title: 'Team standup', date: 'Oct 22, 9:15 AM', duration: '18 min', color: 'peach', icon: Headphones, summary: 'Sprint progress, blockers, and priorities for the week ahead.' }].map((m, i) => <article className="meeting-card" key={m.title} onClick={() => i === 0 && meeting && setPage('Meetings')}><div className={`meeting-thumb ${m.color}`}><div className="thumb-window"><span/><span/><span/></div><div className="waveform">{Array.from({ length: 25 }, (_, n) => <i key={n} style={{ height: `${8 + ((n * 19 + i * 13) % 25)}px` }}/>)}</div><button className="play-btn" aria-label="Play meeting"><Play size={13} fill="currentColor"/></button><span className="duration-pill">{m.duration}</span></div><div className="meeting-card-body"><div className="meeting-card-top"><div><h3>{m.title}</h3><p><Clock3 size={13}/>{m.date}</p></div><button className="icon-btn more-btn" aria-label="More"><MoreHorizontal size={17}/></button></div><p className="meeting-description">{m.summary}</p><div className="meeting-tags"><span><FileText size={12}/> Summary</span><span><MessageCircle size={12}/> AI notes</span></div></div></article>)}</section>
          <div className="bottom-tip"><div className="tip-icon"><Activity size={17}/></div><span><b>Good meetings lead somewhere.</b> Add a recording and let Meetwise surface what matters.</span><button onClick={() => document.getElementById('source-input')?.focus()}>Try it now <ArrowLeft size={13}/></button></div>
        </> : <MeetingDetail meeting={meeting} tab={tab} setTab={setTab} question={question} setQuestion={setQuestion} messages={messages} sendQuestion={sendQuestion} busy={busy} error={error}/>}
        <footer className="footer"><span>Made for conversations that move work forward.</span><span>Meetwise <span className="footer-dot">·</span> 2026</span></footer>
      </div>
    </main>
  </div>
}

function LockIcon() { return <span className="lock-icon">◆</span> }

function MeetingDetail({ meeting, tab, setTab, question, setQuestion, messages, sendQuestion, busy, error }) {
  const [activeTab, setActiveTab] = useState(tab)
  const tabs = ['Summary', 'Transcript', 'Action items', 'Decisions']
  const content = activeTab === 'Summary' ? meeting.summary : activeTab === 'Transcript' ? meeting.transcript : activeTab === 'Action items' ? meeting.action_items : meeting.key_decisions
  return <div className="detail-layout"><section className="detail-main"><div className="video-preview"><div className="video-grid"><div className="video-person person-one"><div className="person-silhouette">IQ</div><span>You</span></div><div className="video-person person-two"><AudioLines size={36}/><span>Meeting recording</span></div></div><div className="video-controls"><span><span className="record-dot"/> Recording analyzed</span><button><Play size={13} fill="currentColor"/> Play recording</button><span>00:00 / —</span></div></div><div className="detail-title-row"><div><div className="detail-meta"><span className="meta-tag"><Video size={12}/> Meeting recording</span><span>{shortDate}</span><span>·</span><span>Just now</span></div><h2>{meeting.title}</h2></div><button className="share-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 size={15}/> Share</button></div><div className="detail-tabs">{tabs.map(t => <button className={activeTab === t ? 'tab-active' : ''} key={t} onClick={() => { setActiveTab(t); setTab(t) }}>{t}</button>)}</div><div className="detail-content"><div className="content-label"><span className="content-icon">{activeTab === 'Transcript' ? <Subtitles size={15}/> : activeTab === 'Action items' ? <Check size={15}/> : activeTab === 'Decisions' ? <Activity size={15}/> : <Sparkles size={15}/>}</span>{activeTab}</div><div className="content-text">{content || 'No content available.'}</div>{activeTab === 'Summary' && <div className="takeaway-box"><span className="takeaway-icon"><Sparkles size={15}/></span><div><b>Meeting takeaway</b><p>Your summary and key follow-ups are ready to share with your team.</p></div></div>}</div></section><aside className="chat-panel"><div className="chat-header"><div className="chat-header-icon"><Sparkles size={17}/></div><div><b>Ask about this meeting</b><small>Answers grounded in your transcript</small></div><button className="icon-btn" aria-label="More"><MoreHorizontal size={17}/></button></div><div className="chat-context"><span className="context-dot"/><span>Using <b>{meeting.title}</b></span><ChevronDown size={14}/></div><div className="chat-body">{messages.length === 0 ? <div className="chat-welcome"><div className="chat-orbit"><Sparkles size={22}/></div><h3>Curious about something?</h3><p>Ask a question and I’ll find the answer in your meeting.</p><div className="suggestions">{['What were the key takeaways?', 'List the action items', 'What decisions were made?'].map(s => <button key={s} onClick={() => sendQuestion(s)}>{s}<ArrowLeft size={13}/></button>)}</div></div> : messages.map((m, i) => <div key={i} className={`chat-message ${m.role}`}>{m.role === 'assistant' && <div className="assistant-avatar"><Sparkles size={13}/></div>}<div className="chat-bubble">{m.loading ? <LoaderCircle size={15} className="spin"/> : m.content}</div></div>)}</div><form className="chat-composer" onSubmit={e => { e.preventDefault(); sendQuestion() }}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask anything about this meeting..."/><button type="submit" disabled={!question.trim() || busy} aria-label="Send message"><Send size={15}/></button></form><p className="chat-disclaimer">AI can make mistakes. Check important details.</p></aside></div>
}

export default App
