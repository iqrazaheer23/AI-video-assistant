// Initial sample meetings loaded if localStorage is empty

export const INITIAL_MEETINGS = [
  {
    id: 'sample-meeting-1',
    session_id: 'sample-session-1',
    title: 'Product Sync — Q3 Roadmap & Beta Launch',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    formattedDate: 'Today · 10:30 AM',
    duration: '42 min',
    sourceType: 'youtube',
    source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    language: 'english',
    color: 'lavender',
    isSample: true,
    summary: `• Finalized the Q3 feature milestones, prioritizing realtime transcription and instant AI executive summaries.
• Reviewed user feedback from the private preview: 94% of testers highlighted automated action item extraction as their top requested capability.
• Approved the technical migration to FastAPI and React with Vite for lower latency and better client-side responsiveness.
• Scheduled the public beta rollout for the 15th of next month, with engineering freeze set for 5 days prior.
• Assigned ownership for documentation, load testing with 50+ concurrent audio streams, and security audits.`,
    transcript: `Alex (00:00): Good morning everyone. Let's kick off our Q3 product synchronization. Today we have three core items: the roadmap timeline, beta readiness, and the infrastructure updates.

Priya (01:15): Thanks Alex. On the product side, we reviewed feedback from all 40 preview enterprise accounts. The top highlight was transcription accuracy and the action item breakdown. Users love not having to manually take meeting notes.

David (04:30): From the engineering perspective, moving the backend from Streamlit to FastAPI gives us a clean RESTful architecture. We can handle async audio processing and separate the React frontend completely.

Alex (08:20): That's fantastic. What is our target date for the beta launch?

Priya (08:45): We are aiming for November 15th. We need the final QA signoff by November 10th.

David (12:10): We will complete the load testing by next Friday. I'll take ownership of benchmarking Whisper transcription chunk processing.

Alex (15:40): Perfect. Sarah, can your team finalize the updated API documentation and onboarding guides by next Wednesday?

Sarah (16:02): Yes, we're already drafting the onboarding tour and interactive shortcuts. It will be ready ahead of schedule.

Alex (20:30): Great. To summarize: launch date is locked for November 15th. David owns load testing, Sarah owns documentation, and Priya will coordinate with marketing. Thanks everyone!`,
    action_items: `1. Task description: Complete Whisper transcription load testing and benchmark chunking performance
   Owner: David
   Deadline: Next Friday

2. Task description: Finalize updated API documentation, onboarding walkthrough, and shortcut guide
   Owner: Sarah
   Deadline: Next Wednesday

3. Task description: Coordinate beta launch announcements and prepare customer communication assets
   Owner: Priya
   Deadline: November 10th

4. Task description: Conduct end-to-end security audit of audio storage and temporary file cleanup
   Owner: Alex
   Deadline: November 8th`,
    key_decisions: `1. Approved official Q3 beta launch date as November 15th, with engineering freeze on November 10th.
2. Migrated architecture to decoupled FastAPI backend and React + Vite frontend.
3. Standardized audio chunking at 10-minute intervals for optimal Whisper speech-to-text accuracy and memory efficiency.
4. Designated Priya as the single point of contact for external customer communications during the beta.`,
    open_questions: `1. What is the peak concurrent audio file upload limit we can support without GPU acceleration?
2. Should we support direct cloud storage imports (Google Drive / OneDrive) in the beta or postpone to v1.1?
3. How should expired Q&A RAG sessions be archived or refreshed for returning users?`,
    messages: [
      { role: 'user', content: 'What were the main decisions made in this meeting?' },
      {
        role: 'assistant',
        content:
          'Based on the meeting transcript, the key decisions were:\n1. The official Q3 beta launch date is set for November 15th, with a code freeze on November 10th.\n2. The architecture has officially transitioned to a decoupled FastAPI backend with a React + Vite frontend.\n3. Audio processing will use 10-minute chunking intervals for speech transcription.',
      },
    ],
  },
  {
    id: 'sample-meeting-2',
    session_id: 'sample-session-2',
    title: 'Design Weekly — UI Overhaul & Meeting Intelligence Hub',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    formattedDate: 'Yesterday · 2:00 PM',
    duration: '36 min',
    sourceType: 'file',
    source: 'design-weekly-sync.mp4',
    language: 'english',
    color: 'mint',
    isSample: true,
    summary: `• Evaluated redesigned user flows for meeting capture, interactive audio playback, and side-by-side meeting intelligence panels.
• Chose an Emerald and Slate modern palette with Manrope typography for enhanced legibility and professional aesthetic.
• Agreed to implement dedicated views for Transcripts, AI Notes (with interactive action item checklists), and System Diagnostics.
• Added keyboard shortcuts (Cmd+K / Ctrl+K) for rapid global meeting search across transcripts and summaries.`,
    transcript: `Maya (00:00): Welcome to this week's design critique. Let's look at the new workspace UI prototypes.

Liam (02:10): Our primary objective was making the interface feel like a premium command center rather than a static form. We replaced the dummy previews with active media players and full tabs for Transcripts, Action Items, and Open Questions.

Maya (05:40): The interactive checklist for action items is a huge improvement. Users can now check off items directly in the UI as they complete tasks.

Liam (09:15): We also introduced search that indexes deep into meeting transcripts, so if someone searches for a phrase spoken during a meeting, it immediately highlights the meeting.

Maya (14:00): Love that. Let's hand off the updated Figma component library to frontend development by Thursday.`,
    action_items: `1. Task description: Export finalized Figma design tokens and component specs for frontend engineering
   Owner: Liam
   Deadline: Thursday

2. Task description: Build interactive action item checklist component with local storage persistence
   Owner: Frontend Team
   Deadline: Friday

3. Task description: Validate accessibility contrast ratios for dark and light UI elements
   Owner: Maya
   Deadline: Next Monday`,
    key_decisions: `1. Adopted interactive tabbed layout featuring Summary, Searchable Transcript, Action Checklist, Key Decisions, and Open Questions.
2. Embedded native media players for YouTube URLs and uploaded audio/video files.
3. Enabled persistent local storage for user meetings and notes.`,
    open_questions: `1. Should users be able to tag meetings with custom project categories?
2. Would an audio waveform seekbar provide significant value over the native audio player?`,
    messages: [
      { role: 'user', content: 'What is Liam responsible for?' },
      {
        role: 'assistant',
        content:
          'According to the transcript, Liam is responsible for exporting the finalized Figma design tokens and component specifications for frontend engineering by Thursday.',
      },
    ],
  },
  {
    id: 'sample-meeting-3',
    session_id: 'sample-session-3',
    title: 'Engineering Standup & Sprint 14 Planning',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    formattedDate: 'Oct 22 · 9:15 AM',
    duration: '18 min',
    sourceType: 'file',
    source: 'standup-oct22.wav',
    language: 'english',
    color: 'peach',
    isSample: true,
    summary: `• Reviewed Sprint 13 deliverables: Whisper Hinglish model integration via Sarvam AI API completed and validated.
• Addressed an intermittent CORS constraint in local development by enabling permissive CORS headers on the FastAPI backend.
• Prioritized frontend state persistence to eliminate data loss upon page reloads.
• Assigned deployment pipeline setup and container health checks for staging.`,
    transcript: `Rohan (00:00): Quick standup today team. Sprint 13 wrap-up first. Any blockers?

Kavita (01:20): Sarvam AI API integration for Hinglish speech transcription is done and tested. English whisper works seamlessly out of the box.

Rohan (03:15): Good. Did we resolve the CORS policy issues when Vite connects to port 8000?

Kavita (04:00): Yes, updated CORS middleware in api.py to allow all local origins.

Rohan (06:30): Excellent. Let's make sure the client UI can gracefully handle cases where the backend is temporarily offline, with clear status indicators and retry prompts.

Kavita (09:00): Understood, adding that to Sprint 14 backlog.`,
    action_items: `1. Task description: Implement client-side backend connection health checker with retry logic
   Owner: Kavita
   Deadline: Wednesday

2. Task description: Write unit tests for audio conversion and chunking pipeline
   Owner: Rohan
   Deadline: Friday`,
    key_decisions: `1. Confirmed Sarvam AI API for Hinglish speech and local Whisper model for English.
2. Standardized CORS configuration across all local development ports.`,
    open_questions: `1. Are there specific rate limits on the Mistral API during high-volume batch processing?`,
    messages: [],
  },
]
