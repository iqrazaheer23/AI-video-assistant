import { useState, useMemo } from 'react'
import {
  Activity,
  ArrowLeft,
  AudioLines,
  Check,
  CheckSquare,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  ListTodo,
  LoaderCircle,
  MoreHorizontal,
  Play,
  Send,
  Share2,
  Sparkles,
  Square,
  Subtitles,
  Trash2,
  Video,
  Volume2,
  X,
} from 'lucide-react'
import {
  copyToClipboard,
  downloadFile,
  estimateDuration,
  formatMeetingDate,
  parseActionItems,
  parseBulletList,
} from '../utils/helpers'

export default function MeetingDetail({
  meeting,
  onBack,
  onUpdateMeeting,
  onDeleteMeeting,
  apiUrl,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState('Summary')
  const [transcriptSearch, setTranscriptSearch] = useState('')
  const [question, setQuestion] = useState('')
  const [busyChat, setBusyChat] = useState(false)
  const [messages, setMessages] = useState(meeting.messages || [])
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  // Parse action items into structured checklist
  const initialActions = useMemo(() => {
    return parseActionItems(meeting.action_items)
  }, [meeting.action_items])

  const [actionsState, setActionsState] = useState(initialActions)

  // Toggle action item completed status
  const toggleAction = id => {
    setActionsState(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    )
  }

  const completedCount = actionsState.filter(a => a.completed).length
  const totalCount = actionsState.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Filtered transcript search
  const filteredTranscript = useMemo(() => {
    const raw = meeting.transcript || ''
    if (!transcriptSearch.trim()) return raw
    return raw
  }, [meeting.transcript, transcriptSearch])

  // Copy helper with toast
  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text)
    if (ok) showToast(`${label} copied to clipboard`)
    else showToast('Failed to copy', 'error')
  }

  // Export meeting notes
  const handleExport = format => {
    setExportMenuOpen(false)
    const titleClean = meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()

    if (format === 'markdown') {
      const md = `# ${meeting.title}
Date: ${meeting.formattedDate || meeting.createdAt}
Duration: ${meeting.duration || 'N/A'}
Source: ${meeting.source || 'N/A'}

## Executive Summary
${meeting.summary || 'None'}

## Action Items
${actionsState.map(a => `- [${a.completed ? 'x' : ' '}] **${a.task}** | Owner: ${a.owner} | Deadline: ${a.deadline}`).join('\n')}

## Key Decisions
${meeting.key_decisions || 'None'}

## Open Questions & Follow-ups
${meeting.open_questions || 'None'}

## Full Transcript
${meeting.transcript || 'None'}
`
      downloadFile(`${titleClean}_notes.md`, md, 'text/markdown')
      showToast('Exported Markdown notes')
    } else if (format === 'text') {
      const txt = `${meeting.title}
${'='.repeat(meeting.title.length)}
Date: ${meeting.formattedDate || meeting.createdAt}

SUMMARY:
${meeting.summary || 'None'}

ACTION ITEMS:
${actionsState.map(a => `[${a.completed ? 'DONE' : 'TODO'}] ${a.task} (Owner: ${a.owner}, Due: ${a.deadline})`).join('\n')}

KEY DECISIONS:
${meeting.key_decisions || 'None'}

OPEN QUESTIONS:
${meeting.open_questions || 'None'}

TRANSCRIPT:
${meeting.transcript || 'None'}
`
      downloadFile(`${titleClean}_notes.txt`, txt, 'text/plain')
      showToast('Exported Text notes')
    }
  }

  // Smart Q&A handler (with graceful local fallback if backend session expired)
  const sendQuestion = async (queryText = question) => {
    const prompt = queryText.trim()
    if (!prompt || busyChat) return

    setQuestion('')
    const newMessages = [...messages, { role: 'user', content: prompt }]
    setMessages(newMessages)
    setBusyChat(true)

    try {
      // First try live backend RAG API
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: meeting.session_id, question: prompt }),
      })

      if (response.ok) {
        const result = await response.json()
        const updated = [...newMessages, { role: 'assistant', content: result.answer }]
        setMessages(updated)
        onUpdateMeeting({ ...meeting, messages: updated })
        setBusyChat(false)
        return
      }
    } catch {
      // Backend unavailable or error; continue to intelligent local transcript fallback
    }

    // Local fallback: intelligent answer synthesized from transcript, summary, action items
    const lower = prompt.toLowerCase()
    let fallback = ''

    if (lower.includes('action') || lower.includes('task') || lower.includes('todo') || lower.includes('owner')) {
      fallback = `Here are the extracted action items:\n\n${meeting.action_items || 'No specific action items recorded.'}`
    } else if (lower.includes('decision') || lower.includes('decide') || lower.includes('agreed')) {
      fallback = `Here are the key decisions from this meeting:\n\n${meeting.key_decisions || 'No formal decisions recorded.'}`
    } else if (lower.includes('question') || lower.includes('open') || lower.includes('unresolved') || lower.includes('follow-up')) {
      fallback = `Here are the open questions identified:\n\n${meeting.open_questions || 'No open questions noted.'}`
    } else if (lower.includes('summary') || lower.includes('takeaway') || lower.includes('overview') || lower.includes('about')) {
      fallback = `Executive Summary:\n\n${meeting.summary || 'Summary unavailable.'}`
    } else {
      // Search transcript for keywords
      const words = prompt.split(/\s+/).filter(w => w.length > 3)
      const matches = []
      if (meeting.transcript) {
        const lines = meeting.transcript.split('\n')
        for (const line of lines) {
          if (words.some(w => line.toLowerCase().includes(w.toLowerCase()))) {
            matches.push(line)
            if (matches.length >= 3) break
          }
        }
      }
      if (matches.length > 0) {
        fallback = `Relevant context from the transcript:\n\n${matches.join('\n\n')}`
      } else {
        fallback = `Based on the meeting transcript for "${meeting.title}":\n\n${meeting.summary?.split('\n').slice(0, 3).join('\n') || 'Please see the Summary and Transcript tabs for details.'}`
      }
    }

    const updated = [...newMessages, { role: 'assistant', content: fallback }]
    setMessages(updated)
    onUpdateMeeting({ ...meeting, messages: updated })
    setBusyChat(false)
  }

  const tabs = [
    { name: 'Summary', icon: Sparkles },
    { name: 'Transcript', icon: Subtitles },
    { name: 'Action items', icon: ListTodo, count: totalCount },
    { name: 'Decisions', icon: Activity },
    { name: 'Questions', icon: HelpCircle },
  ]

  return (
    <div className="detail-layout">
      {/* Main Left Content Section */}
      <section className="detail-main">
        {/* Media Header / Player Section */}
        <div style={{ background: '#10221c', padding: '12px', borderBottom: '1px solid #1c382f' }}>
          {meeting.youtubeId ? (
            <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${meeting.youtubeId}`}
                title={meeting.title}
                style={{ width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : meeting.mediaUrl ? (
            meeting.sourceType === 'video' || (meeting.source && meeting.source.match(/\.(mp4|mov|webm|mkv)$/i)) ? (
              <video
                src={meeting.mediaUrl}
                controls
                style={{ width: '100%', maxHeight: '320px', borderRadius: '8px', background: '#000' }}
              />
            ) : (
              <div
                style={{
                  background: 'linear-gradient(145deg, #18332b, #122822)',
                  borderRadius: '8px',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#88e3b5' }}>
                  <Volume2 size={24} />
                  <div>
                    <b style={{ fontSize: '13px', color: '#eef8f3' }}>{meeting.source || 'Audio Recording'}</b>
                    <small style={{ display: 'block', color: '#8ba89c', fontSize: '10px' }}>
                      {meeting.duration || 'Audio track'} · {meeting.language || 'English'}
                    </small>
                  </div>
                </div>
                <audio src={meeting.mediaUrl} controls style={{ width: '100%', height: '40px' }} />
              </div>
            )
          ) : (
            /* Standalone analyzed recording card */
            <div
              style={{
                background: 'linear-gradient(135deg, #183830 0%, #122b25 100%)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#e4f1eb',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: '#234f43',
                    color: '#8be5b6',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {meeting.sourceType === 'youtube' ? <Video size={24} /> : <AudioLines size={24} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: '700',
                        letterSpacing: '0.8px',
                        background: '#285548',
                        color: '#9de8c1',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {meeting.sourceType || 'Recording'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#97b1a6' }}>{meeting.duration || '42 min'}</span>
                  </div>
                  <b style={{ fontSize: '14px', color: '#ffffff' }}>{meeting.source || meeting.title}</b>
                </div>
              </div>

              {meeting.source?.startsWith('http') && (
                <a
                  href={meeting.source}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#234e42',
                    color: '#d6f4e4',
                    border: '1px solid #36695a',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={13} /> Open Source
                </a>
              )}
            </div>
          )}
        </div>

        {/* Title and Action Controls */}
        <div className="detail-title-row">
          <div>
            <div className="detail-meta">
              <button
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: '#466c5c',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '6px',
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>
              <span className="meta-tag">
                <Video size={12} /> {meeting.sourceType === 'youtube' ? 'YouTube' : 'File Upload'}
              </span>
              <span>{meeting.formattedDate || formatMeetingDate(meeting.createdAt)}</span>
              <span>·</span>
              <span>{meeting.duration || estimateDuration(meeting.transcript)}</span>
              {meeting.isSample && (
                <span
                  style={{
                    background: '#e9f1ed',
                    color: '#3d6c57',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: '700',
                  }}
                >
                  Demo Sample
                </span>
              )}
            </div>
            <h2>{meeting.title}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <button
              className="share-btn"
              onClick={() => handleCopy(window.location.href, 'Meeting link')}
              title="Copy link to clipboard"
            >
              <Share2 size={14} /> Share
            </button>

            <div style={{ position: 'relative' }}>
              <button
                className="share-btn"
                onClick={() => setExportMenuOpen(prev => !prev)}
                title="Download notes"
              >
                <Download size={14} /> Export
              </button>

              {exportMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    zIndex: 50,
                    background: '#fff',
                    border: '1px solid #dce4e0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    display: 'grid',
                    minWidth: '170px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => handleExport('markdown')}
                    style={{
                      padding: '9px 12px',
                      fontSize: '11px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid #f0f3f1',
                      color: '#33443e',
                      cursor: 'pointer',
                    }}
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleExport('text')}
                    style={{
                      padding: '9px 12px',
                      fontSize: '11px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#33443e',
                      cursor: 'pointer',
                    }}
                  >
                    Plain Text (.txt)
                  </button>
                </div>
              )}
            </div>

            <button
              className="share-btn"
              style={{ color: '#b84444', borderColor: '#f0d2d2' }}
              onClick={() => {
                if (window.confirm(`Delete meeting "${meeting.title}"?`)) {
                  onDeleteMeeting(meeting.id)
                  showToast('Meeting deleted')
                }
              }}
              title="Delete meeting"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="detail-tabs">
          {tabs.map(t => (
            <button
              className={activeTab === t.name ? 'tab-active' : ''}
              key={t.name}
              onClick={() => setActiveTab(t.name)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <t.icon size={13} />
              <span>{t.name}</span>
              {t.count !== undefined && (
                <span
                  style={{
                    fontSize: '9px',
                    background: activeTab === t.name ? '#e1f3ea' : '#f0f3f1',
                    color: activeTab === t.name ? '#1f664b' : '#778881',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontWeight: '700',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="detail-content">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'Summary' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div className="content-label" style={{ margin: 0 }}>
                  <span className="content-icon">
                    <Sparkles size={15} />
                  </span>
                  Executive Summary
                </div>
                <button
                  onClick={() => handleCopy(meeting.summary, 'Summary')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: '1px solid #dbe3df',
                    background: '#fff',
                    borderRadius: '6px',
                    padding: '5px 9px',
                    fontSize: '10px',
                    color: '#496256',
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={12} /> Copy Summary
                </button>
              </div>

              <div className="content-text" style={{ fontSize: '12px', lineHeight: '1.75' }}>
                {meeting.summary ? (
                  meeting.summary.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '0 0 10px 0' }}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p style={{ color: '#889891' }}>No summary generated.</p>
                )}
              </div>

              <div className="takeaway-box">
                <span className="takeaway-icon">
                  <Sparkles size={16} />
                </span>
                <div>
                  <b>Meeting Takeaway</b>
                  <p>
                    {meeting.title} summary and follow-up items are grounded in the full transcript and ready
                    to share with your team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSCRIPT */}
          {activeTab === 'Transcript' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div className="content-label" style={{ margin: 0 }}>
                  <span className="content-icon">
                    <Subtitles size={15} />
                  </span>
                  Full Meeting Transcript
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleCopy(meeting.transcript, 'Transcript')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid #dbe3df',
                      background: '#fff',
                      borderRadius: '6px',
                      padding: '5px 9px',
                      fontSize: '10px',
                      color: '#496256',
                      cursor: 'pointer',
                    }}
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    onClick={() => downloadFile(`${meeting.title}_transcript.txt`, meeting.transcript)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid #dbe3df',
                      background: '#fff',
                      borderRadius: '6px',
                      padding: '5px 9px',
                      fontSize: '10px',
                      color: '#496256',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={12} /> .txt
                  </button>
                </div>
              </div>

              {/* Transcript Search Bar */}
              <div style={{ marginBottom: '14px', position: 'relative' }}>
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={e => setTranscriptSearch(e.target.value)}
                  placeholder="Filter or search in transcript..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: '1px solid #dbe4df',
                    fontSize: '11px',
                    color: '#31443c',
                    outline: 'none',
                    background: '#f9fbf9',
                  }}
                />
                {transcriptSearch && (
                  <button
                    onClick={() => setTranscriptSearch('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#899992',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div
                className="content-text"
                style={{
                  maxHeight: '380px',
                  background: '#fcfdfc',
                  border: '1px solid #edf2ee',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  lineHeight: '1.8',
                  fontFamily: 'inherit',
                }}
              >
                {filteredTranscript ? (
                  filteredTranscript.split('\n\n').map((paragraph, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '14px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f1f5f2',
                      }}
                    >
                      {paragraph.split('\n').map((line, lineIdx) => {
                        const isMatch =
                          transcriptSearch.trim() &&
                          line.toLowerCase().includes(transcriptSearch.toLowerCase())
                        return (
                          <div
                            key={lineIdx}
                            style={{
                              background: isMatch ? '#fff5c4' : 'transparent',
                              borderRadius: '3px',
                              padding: isMatch ? '2px 4px' : '0',
                            }}
                          >
                            {line}
                          </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#889891' }}>Transcript not available.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTION ITEMS (INTERACTIVE CHECKLIST) */}
          {activeTab === 'Action items' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div className="content-label" style={{ margin: 0 }}>
                  <span className="content-icon">
                    <ListTodo size={15} />
                  </span>
                  Extracted Action Items
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleCopy(meeting.action_items, 'Action items')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid #dbe3df',
                      background: '#fff',
                      borderRadius: '6px',
                      padding: '5px 9px',
                      fontSize: '10px',
                      color: '#496256',
                      cursor: 'pointer',
                    }}
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  background: '#f2f7f4',
                  border: '1px solid #e1ebe5',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#566e63', marginBottom: '5px' }}>
                    <b>Checklist Progress</b>
                    <span>
                      {completedCount} of {totalCount} completed ({progressPercent}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#d7e6de', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: '#2d8463',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action items list */}
              <div style={{ display: 'grid', gap: '10px' }}>
                {actionsState.length > 0 ? (
                  actionsState.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleAction(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        background: item.completed ? '#f7fbf8' : '#ffffff',
                        border: `1px solid ${item.completed ? '#c8e2d4' : '#e3ebe7'}`,
                        borderRadius: '9px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px',
                          color: item.completed ? '#287d5b' : '#9bb0a5',
                          cursor: 'pointer',
                          display: 'grid',
                          placeItems: 'center',
                          marginTop: '1px',
                        }}
                        aria-label="Toggle completed"
                      >
                        {item.completed ? <CheckSquare size={17} /> : <Square size={17} />}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: item.completed ? '#788f84' : '#2d3f37',
                            textDecoration: item.completed ? 'line-through' : 'none',
                            lineHeight: '1.4',
                          }}
                        >
                          {item.task}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '10px' }}>
                          <span
                            style={{
                              background: '#edf4f0',
                              color: '#3b6754',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: '500',
                            }}
                          >
                            Owner: <b>{item.owner}</b>
                          </span>
                          <span
                            style={{
                              background: '#fef3e7',
                              color: '#935817',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: '500',
                            }}
                          >
                            Due: <b>{item.deadline}</b>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#889891', fontSize: '11px' }}>No action items extracted.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DECISIONS */}
          {activeTab === 'Decisions' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div className="content-label" style={{ margin: 0 }}>
                  <span className="content-icon">
                    <Activity size={15} />
                  </span>
                  Key Decisions Made
                </div>
                <button
                  onClick={() => handleCopy(meeting.key_decisions, 'Key Decisions')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: '1px solid #dbe3df',
                    background: '#fff',
                    borderRadius: '6px',
                    padding: '5px 9px',
                    fontSize: '10px',
                    color: '#496256',
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={12} /> Copy Decisions
                </button>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {parseBulletList(meeting.key_decisions).length > 0 ? (
                  parseBulletList(meeting.key_decisions).map((decision, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px 14px',
                        background: '#ffffff',
                        border: '1px solid #e1ece6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#e0f1e8',
                          color: '#21704f',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '10px',
                          fontWeight: '700',
                          flexShrink: 0,
                          marginTop: '1px',
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ fontSize: '12px', color: '#33473e', lineHeight: '1.6', flex: 1 }}>
                        {decision}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="content-text">{meeting.key_decisions || 'No decisions recorded.'}</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: OPEN QUESTIONS */}
          {activeTab === 'Questions' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div className="content-label" style={{ margin: 0 }}>
                  <span className="content-icon">
                    <HelpCircle size={15} />
                  </span>
                  Open Questions & Follow-ups
                </div>
                <button
                  onClick={() => handleCopy(meeting.open_questions, 'Open Questions')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: '1px solid #dbe3df',
                    background: '#fff',
                    borderRadius: '6px',
                    padding: '5px 9px',
                    fontSize: '10px',
                    color: '#496256',
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={12} /> Copy Questions
                </button>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {parseBulletList(meeting.open_questions).length > 0 ? (
                  parseBulletList(meeting.open_questions).map((q, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px 14px',
                        background: '#fffbf5',
                        border: '1px solid #f2e3cd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <span
                        style={{
                          background: '#f6e4cc',
                          color: '#8b5113',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          marginTop: '2px',
                        }}
                      >
                        Q{index + 1}
                      </span>
                      <div style={{ fontSize: '12px', color: '#443b31', lineHeight: '1.6', flex: 1 }}>
                        {q}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="content-text">{meeting.open_questions || 'No open questions found.'}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Assistant Chat Panel (Right Side) */}
      <aside className="chat-panel">
        <div className="chat-header">
          <div className="chat-header-icon">
            <Sparkles size={17} />
          </div>
          <div>
            <b>Ask Meeting AI</b>
            <small>Grounded in transcript & notes</small>
          </div>
          <button
            className="icon-btn"
            title="Clear chat"
            onClick={() => {
              setMessages([])
              onUpdateMeeting({ ...meeting, messages: [] })
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="chat-context">
          <span className="context-dot" />
          <span>
            Querying <b>{meeting.title}</b>
          </span>
        </div>

        <div className="chat-body">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="chat-orbit">
                <Sparkles size={22} />
              </div>
              <h3>Ask anything about this meeting</h3>
              <p>Find details, verify action items, or ask for clarifications.</p>
              <div className="suggestions">
                {[
                  'What were the key takeaways?',
                  'List all action items with owners',
                  'What key decisions were approved?',
                  'What questions are still unresolved?',
                ].map(prompt => (
                  <button key={prompt} onClick={() => sendQuestion(prompt)}>
                    {prompt}
                    <ArrowLeft size={13} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`chat-message ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="assistant-avatar">
                    <Sparkles size={13} />
                  </div>
                )}
                <div className="chat-bubble">
                  {m.content}
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.content, 'Answer')}
                      style={{
                        display: 'block',
                        marginTop: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#658577',
                        fontSize: '9px',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    >
                      Copy answer
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {busyChat && (
            <div className="chat-message assistant">
              <div className="assistant-avatar">
                <Sparkles size={13} />
              </div>
              <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LoaderCircle size={14} className="spin" />
                <span>Searching transcript...</span>
              </div>
            </div>
          )}
        </div>

        <form
          className="chat-composer"
          onSubmit={e => {
            e.preventDefault()
            sendQuestion()
          }}
        >
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask about this meeting..."
            disabled={busyChat}
          />
          <button type="submit" disabled={!question.trim() || busyChat} aria-label="Send">
            <Send size={14} />
          </button>
        </form>

        <p className="chat-disclaimer">Grounded in this meeting's transcript & notes.</p>
      </aside>
    </div>
  )
}
