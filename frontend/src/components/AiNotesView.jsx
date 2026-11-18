import { useState, useMemo } from 'react'
import { Activity, CheckSquare, Copy, Download, HelpCircle, ListTodo, Sparkles, Square } from 'lucide-react'
import { copyToClipboard, downloadFile, parseActionItems, parseBulletList } from '../utils/helpers'

export default function AiNotesView({ meetings, onSelectMeeting, showToast }) {
  const [activeSubtab, setActiveSubtab] = useState('actions')
  const [filterStatus, setFilterStatus] = useState('all') // all, pending, completed

  // Extract all action items across all meetings
  const allActions = useMemo(() => {
    const list = []
    meetings.forEach(m => {
      const parsed = parseActionItems(m.action_items)
      parsed.forEach(p => {
        list.push({
          ...p,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.formattedDate || m.createdAt,
        })
      })
    })
    return list
  }, [meetings])

  const [actionsState, setActionsState] = useState(allActions)

  const toggleAction = (meetingId, actionId) => {
    setActionsState(prev =>
      prev.map(item =>
        item.meetingId === meetingId && item.id === actionId
          ? { ...item, completed: !item.completed }
          : item
      )
    )
  }

  const displayedActions = useMemo(() => {
    if (filterStatus === 'completed') return actionsState.filter(a => a.completed)
    if (filterStatus === 'pending') return actionsState.filter(a => !a.completed)
    return actionsState
  }, [actionsState, filterStatus])

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Subtab Navigation Strip */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e3ebe7',
          borderRadius: '10px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'actions', label: 'Action Items', icon: ListTodo, count: allActions.length },
            { id: 'decisions', label: 'Key Decisions', icon: Activity },
            { id: 'questions', label: 'Open Questions', icon: HelpCircle },
            { id: 'summaries', label: 'Executive Summaries', icon: Sparkles },
          ].map(tab => {
            const isActive = activeSubtab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubtab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#102c27' : 'transparent',
                  color: isActive ? '#ffffff' : '#576f64',
                  fontSize: '11px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <tab.icon size={13} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      fontSize: '9px',
                      background: isActive ? '#2b5f54' : '#eaf2ee',
                      color: isActive ? '#c6eedb' : '#335e4e',
                      padding: '1px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {activeSubtab === 'actions' && (
          <div style={{ display: 'flex', gap: '4px', background: '#f2f6f4', padding: '3px', borderRadius: '6px' }}>
            {['all', 'pending', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                style={{
                  border: 'none',
                  background: filterStatus === f ? '#ffffff' : 'transparent',
                  color: filterStatus === f ? '#1f654b' : '#72887d',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: filterStatus === f ? '700' : '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  boxShadow: filterStatus === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SUBTAB 1: ACTION ITEMS */}
      {activeSubtab === 'actions' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {displayedActions.length > 0 ? (
            displayedActions.map(action => (
              <div
                key={`${action.meetingId}-${action.id}`}
                onClick={() => toggleAction(action.meetingId, action.id)}
                style={{
                  background: action.completed ? '#f9fcf9' : '#ffffff',
                  border: `1px solid ${action.completed ? '#cde7d8' : '#e3ebe7'}`,
                  borderRadius: '9px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    color: action.completed ? '#27805b' : '#9bb0a5',
                    cursor: 'pointer',
                    marginTop: '1px',
                  }}
                  aria-label="Toggle completed"
                >
                  {action.completed ? <CheckSquare size={17} /> : <Square size={17} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: action.completed ? '#788f84' : '#273831',
                      textDecoration: action.completed ? 'line-through' : 'none',
                    }}
                  >
                    {action.task}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '7px', fontSize: '10px' }}>
                    <span
                      onClick={e => {
                        e.stopPropagation()
                        const target = meetings.find(m => m.id === action.meetingId)
                        if (target) onSelectMeeting(target)
                      }}
                      style={{
                        background: '#e9f3ee',
                        color: '#28684d',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                      title="View meeting"
                    >
                      📁 {action.meetingTitle}
                    </span>

                    <span style={{ background: '#f1f5f3', color: '#4a6458', padding: '2px 8px', borderRadius: '4px' }}>
                      Owner: <b>{action.owner}</b>
                    </span>

                    <span style={{ background: '#fef3e7', color: '#8d5516', padding: '2px 8px', borderRadius: '4px' }}>
                      Due: <b>{action.deadline}</b>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ background: '#fff', padding: '36px', textAlign: 'center', borderRadius: '10px', color: '#889891', fontSize: '11px' }}>
              No action items found in this view.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: KEY DECISIONS */}
      {activeSubtab === 'decisions' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {meetings.map(m => {
            const decisions = parseBulletList(m.key_decisions)
            if (decisions.length === 0) return null
            return (
              <div key={m.id} style={{ background: '#ffffff', border: '1px solid #e3ebe7', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <b
                    onClick={() => onSelectMeeting(m)}
                    style={{ fontSize: '13px', color: '#273832', cursor: 'pointer' }}
                  >
                    {m.title}
                  </b>
                  <button
                    onClick={() => {
                      copyToClipboard(m.key_decisions)
                      showToast('Decisions copied')
                    }}
                    style={{
                      border: '1px solid #dce4e0',
                      background: '#fff',
                      borderRadius: '5px',
                      padding: '4px 8px',
                      fontSize: '9px',
                      color: '#496055',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {decisions.map((dec, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        background: '#f8faf9',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#34473e',
                        lineHeight: '1.6',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <span style={{ color: '#277051', fontWeight: '700' }}>#{i + 1}</span>
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SUBTAB 3: OPEN QUESTIONS */}
      {activeSubtab === 'questions' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {meetings.map(m => {
            const questions = parseBulletList(m.open_questions)
            if (questions.length === 0) return null
            return (
              <div key={m.id} style={{ background: '#ffffff', border: '1px solid #e3ebe7', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <b
                    onClick={() => onSelectMeeting(m)}
                    style={{ fontSize: '13px', color: '#273832', cursor: 'pointer' }}
                  >
                    {m.title}
                  </b>
                  <button
                    onClick={() => {
                      copyToClipboard(m.open_questions)
                      showToast('Questions copied')
                    }}
                    style={{
                      border: '1px solid #dce4e0',
                      background: '#fff',
                      borderRadius: '5px',
                      padding: '4px 8px',
                      fontSize: '9px',
                      color: '#496055',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        background: '#fffbf5',
                        border: '1px solid #f6e7d2',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#443a2f',
                        lineHeight: '1.6',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <span style={{ color: '#975c1a', fontWeight: '700' }}>Q{i + 1}</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SUBTAB 4: SUMMARIES */}
      {activeSubtab === 'summaries' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {meetings.map(m => (
            <div key={m.id} style={{ background: '#ffffff', border: '1px solid #e3ebe7', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <b
                    onClick={() => onSelectMeeting(m)}
                    style={{ fontSize: '13px', color: '#273832', cursor: 'pointer' }}
                  >
                    {m.title}
                  </b>
                  <div style={{ fontSize: '9px', color: '#889891', marginTop: '2px' }}>
                    {m.formattedDate || m.createdAt}
                  </div>
                </div>

                <button
                  onClick={() => {
                    copyToClipboard(m.summary)
                    showToast('Summary copied')
                  }}
                  style={{
                    border: '1px solid #dce4e0',
                    background: '#fff',
                    borderRadius: '5px',
                    padding: '4px 8px',
                    fontSize: '9px',
                    color: '#496055',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Copy size={11} /> Copy Summary
                </button>
              </div>

              <div style={{ fontSize: '11px', lineHeight: '1.7', color: '#384d43' }}>
                {m.summary?.split('\n').map((line, idx) => (
                  <p key={idx} style={{ margin: '0 0 6px 0' }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
