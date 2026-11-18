import { Activity, AudioLines, CheckCircle2, Clock3, Copy, FileText, HelpCircle, ListTodo, Plus, Sparkles, Video, ArrowRight } from 'lucide-react'
import { copyToClipboard, formatMeetingDate } from '../utils/helpers'

export default function DashboardView({
  meetings,
  onSelectMeeting,
  onStartNewMeeting,
  backendStatus,
  onTestBackend,
  showToast,
}) {
  // Aggregate statistics
  const totalMeetings = meetings.length
  const totalActionItems = meetings.reduce((acc, m) => {
    const lines = (m.action_items || '').split('\n').filter(l => l.trim().match(/^(\d+[\.\)]|\*|-)/))
    return acc + Math.max(1, lines.length)
  }, 0)
  const totalDecisions = meetings.reduce((acc, m) => {
    const lines = (m.key_decisions || '').split('\n').filter(l => l.trim().match(/^(\d+[\.\)]|\*|-)/))
    return acc + Math.max(1, lines.length)
  }, 0)
  const totalWords = meetings.reduce((acc, m) => {
    return acc + (m.transcript ? m.transcript.trim().split(/\s+/).length : 0)
  }, 0)

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #102c27 0%, #19463e 100%)',
          borderRadius: '12px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 6px 20px rgba(16, 44, 39, 0.12)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '1px',
              color: '#8fe3bd',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={13} /> INTELLIGENCE DASHBOARD
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', fontFamily: 'Manrope, sans-serif' }}>
            Meeting Intelligence Overview
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#b9d4ca', maxWidth: '480px' }}>
            All your conversations transcribed, synthesized into executive summaries, action items, and searchable RAG memory.
          </p>
        </div>

        <button
          onClick={onStartNewMeeting}
          style={{
            background: '#2ba879',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(43, 168, 121, 0.3)',
          }}
        >
          <Plus size={16} /> Analyze New Meeting
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e7f5ef',
              color: '#247957',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Video size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#7a8c84', fontWeight: '600' }}>TOTAL MEETINGS</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#25352f', fontFamily: 'Manrope' }}>
              {totalMeetings}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e9f1fa',
              color: '#286bb5',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ListTodo size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#7a8c84', fontWeight: '600' }}>ACTION ITEMS</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#25352f', fontFamily: 'Manrope' }}>
              {totalActionItems}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#fcf3e6',
              color: '#b06f1d',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#7a8c84', fontWeight: '600' }}>KEY DECISIONS</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#25352f', fontFamily: 'Manrope' }}>
              {totalDecisions}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#f2ecfc',
              color: '#6e44b8',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#7a8c84', fontWeight: '600' }}>WORDS INDEXED</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#25352f', fontFamily: 'Manrope' }}>
              {totalWords.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Backend Status & Health Diagnostic Strip */}
      <div
        style={{
          background: backendStatus.online ? '#f3fbf6' : '#fff9f9',
          border: `1px solid ${backendStatus.online ? '#cce8d7' : '#f5d5d5'}`,
          borderRadius: '9px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: backendStatus.online ? '#2ba879' : '#d9534f',
              boxShadow: `0 0 0 3px ${backendStatus.online ? '#d7f3e5' : '#fbe2e2'}`,
            }}
          />
          <div style={{ fontSize: '11px', color: '#33443e' }}>
            <b>Backend Engine (FastAPI)</b>:{' '}
            {backendStatus.online ? (
              <span style={{ color: '#1a774f' }}>
                Online & Connected ({backendStatus.latency}ms)
              </span>
            ) : (
              <span style={{ color: '#b53b3b' }}>
                Offline · Start with <code>uvicorn api:app --reload</code>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onTestBackend}
          style={{
            background: '#ffffff',
            border: '1px solid #d5dfdb',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '10px',
            fontWeight: '600',
            color: '#3e584d',
            cursor: 'pointer',
          }}
        >
          Check Health
        </button>
      </div>

      {/* Recent Meetings Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e3ebe7', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e9efec',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#273832' }}>
              Recent Analyzed Meetings
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#889891' }}>
              Click any meeting to review the transcript, action checklist, and ask questions.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid' }}>
          {meetings.slice(0, 5).map(m => (
            <div
              key={m.id}
              onClick={() => onSelectMeeting(m)}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f2f5f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fbf9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: m.sourceType === 'youtube' ? '#fae8e8' : '#e6f3ec',
                    color: m.sourceType === 'youtube' ? '#c53030' : '#237854',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {m.sourceType === 'youtube' ? <Video size={18} /> : <AudioLines size={18} />}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b
                      style={{
                        fontSize: '12px',
                        color: '#2a3a34',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {m.title}
                    </b>
                    {m.isSample && (
                      <span
                        style={{
                          fontSize: '8px',
                          background: '#e9f1ed',
                          color: '#426a58',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                        }}
                      >
                        Sample
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8d9c95', marginTop: '3px' }}>
                    {m.formattedDate || formatMeetingDate(m.createdAt)} · {m.duration || '30 min'} ·{' '}
                    {m.language || 'English'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    copyToClipboard(m.summary)
                    showToast('Summary copied')
                  }}
                  style={{
                    border: '1px solid #dbe3df',
                    background: '#fff',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    fontSize: '9px',
                    color: '#556b61',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Copy size={11} /> Copy Summary
                </button>
                <div style={{ color: '#276e55', display: 'flex', alignItems: 'center' }}>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
