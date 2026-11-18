// Utility functions for Meetwise

/**
 * Extracts YouTube video ID from various YouTube URL formats.
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/i
  const match = url.match(regExp)
  return match ? match[1] : null
}

/**
 * Formats date into human-readable string.
 */
export function formatMeetingDate(dateInput) {
  if (!dateInput) return 'Recently'
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return String(dateInput)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (isToday) return `Today · ${timeStr}`
    if (isYesterday) return `Yesterday · ${timeStr}`
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${timeStr}`
  } catch {
    return String(dateInput)
  }
}

/**
 * Calculates estimated reading or listening duration from text.
 */
export function estimateDuration(text) {
  if (!text) return '5 min'
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 130)) // ~130 wpm speaking rate
  return `${minutes} min`
}

/**
 * Copies text to clipboard safely.
 */
export async function copyToClipboard(text) {
  if (!text) return false
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    console.warn('Clipboard writeText failed, falling back:', err)
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)
    return successful
  } catch (err) {
    console.error('Fallback copy failed:', err)
    return false
  }
}

/**
 * Triggers browser download of a text or markdown file.
 */
export function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Parses action items from LLM numbered or bulleted list into structured objects.
 */
export function parseActionItems(actionItemsText) {
  if (!actionItemsText || typeof actionItemsText !== 'string') return []
  const lines = actionItemsText.split('\n').map(l => l.trim()).filter(Boolean)
  const items = []
  let current = null

  for (const line of lines) {
    // Check if new numbered item e.g. "1. Task description:" or "1. Task:" or "1."
    const itemMatch = line.match(/^(\d+[\.\)]|\*|-)\s+(.*)/)
    if (itemMatch) {
      if (current) items.push(current)
      current = {
        id: `action-${items.length + 1}`,
        raw: line,
        task: itemMatch[2].replace(/^Task description:?\s*/i, '').replace(/^Task:?\s*/i, ''),
        owner: 'Not specified',
        deadline: 'Not specified',
        completed: false,
      }
    } else if (current) {
      // Sub-bullets for Owner or Deadline
      if (/owner:/i.test(line)) {
        current.owner = line.replace(/^[-*•]?\s*Owner:?\s*/i, '').trim()
      } else if (/deadline:/i.test(line)) {
        current.deadline = line.replace(/^[-*•]?\s*Deadline:?\s*/i, '').trim()
      } else if (/task description:/i.test(line)) {
        current.task = line.replace(/^[-*•]?\s*Task description:?\s*/i, '').trim()
      } else {
        current.task += ' ' + line
      }
    }
  }
  if (current) items.push(current)

  // If no numbered match was found, split by lines as raw items
  if (items.length === 0) {
    return lines
      .filter(l => !l.toLowerCase().includes('no action items'))
      .map((l, i) => ({
        id: `action-${i + 1}`,
        raw: l,
        task: l.replace(/^[-*•\d.]+\s*/, ''),
        owner: 'Team',
        deadline: 'Pending',
        completed: false,
      }))
  }

  return items
}

/**
 * Parses numbered or bulleted text into a simple list of string items.
 */
export function parseBulletList(text) {
  if (!text || typeof text !== 'string') return []
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-*•\d.]+\s*/, ''))
    .filter(line => line.length > 0)
}
