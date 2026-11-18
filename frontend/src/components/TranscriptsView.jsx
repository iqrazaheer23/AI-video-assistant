import { useState, useMemo } from 'react'
import { Copy, Download, FileText, Search, Subtitles, X } from 'lucide-react'
import { copyToClipboard, downloadFile, estimateDuration, formatMeetingDate } from '../utils/helpers'

export default function TranscriptsView({ meetings, onSelectMeeting, showToast }) {
  const [selectedMeetingId, setSelectedMeetingId] = useState(meetings[0]?.id || null)
  const [searchQuery, setSearchQuery] = useState('')

  const activeMeeting = useMemo(() => {
    return meetings.find(m => m.id === selectedMeetingId) || meetings[0] || null
  }, [meetings, selectedMeetingId])

  // Filter meetings if search query is entered
  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings
    const q = searchQuery.toLowerCase()
    return meetings.filter(
      m => m.title.toLowerCase().includes(q) || (m.transcript && m.transcript.toLowerCase().includes(q))
    )
  }, [meetings, searchQuery])

  const wordCount = activeMeeting?.transcript
    ? activeMeeting.transcript.trim().split(/\s+/).length
    : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '290px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
      {/* Left List of Meetings with Transcripts */}
      <div style={{ background: '#ffffff', border: '1px solid #e3ebe7', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px', borderBottom: '1px solid #edf1ef' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#91a29a' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transcripts..."
              style={{
                width: '100%',
                padding: '8px 10px 8px 30px',
                borderRadius: '7px',
                border: '1px solid #dce4e0',
                fontSize: '11px',
                outline: 'none',
                color: '#2a3a34',
                background: '#f9fbf9',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#91a29a',
                  cursor: 'pointer',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map(m => {
              const isSelected = m.id === activeMeeting?.id
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #f2f5f3',
                    background: isSelected ? '#edf6f1' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: isSelected ? '#1b6348' : '#2e4139',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.title}
                  </div>
                  <div style={{ fontSize: '9px', color: '#8b9b94' }}>
                    {m.formattedDate || formatMeetingDate(m.createdAt)} ·{' '}
                    {m.transcript ? `${m.transcript.trim().split(/\s+/).length} words` : 'No transcript'}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#889891', fontSize: '11px' }}>
              No transcripts matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Right Detailed Transcript Viewer */}
      {activeMeeting ? (
        <div style={{ background: '#ffffff', border: '1px solid #e3ebe7', borderRadius: '10px', overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #edf1ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '9px',
                    background: '#e9f4ef',
                    color: '#21704e',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: '700',
                  }}
                >
                  TRANSCRIPT
                </span>
                <span style={{ fontSize: '10px', color: '#8ca097' }}>
                  {wordCount.toLocaleString()} words · ~{estimateDuration(activeMeeting.transcript)} reading time
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#25352f' }}>
                {activeMeeting.title}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  copyToClipboard(activeMeeting.transcript)
                  showToast('Transcript copied to clipboard')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid #dce4e0',
                  background: '#fff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#466054',
                  cursor: 'pointer',
                }}
              >
                <Copy size={12} /> Copy
              </button>

              <button
                onClick={() =>
                  downloadFile(`${activeMeeting.title}_transcript.txt`, activeMeeting.transcript)
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid #dce4e0',
                  background: '#fff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#466054',
                  cursor: 'pointer',
                }}
              >
                <Download size={12} /> Download (.txt)
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '20px',
              maxHeight: '620px',
              overflowY: 'auto',
              fontSize: '12px',
              lineHeight: '1.85',
              color: '#34473e',
            }}
          >
            {activeMeeting.transcript ? (
              activeMeeting.transcript.split('\n\n').map((para, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: '16px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid #f1f5f3',
                  }}
                >
                  {para.split('\n').map((line, j) => (
                    <div key={j} style={{ margin: '2px 0' }}>
                      {line}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p style={{ color: '#889891' }}>No transcript text found.</p>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3ebe7',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center',
            color: '#889891',
          }}
        >
          No meeting selected.
        </div>
      )}
    </div>
  )
}
