# Meetwise — AI Video Assistant

React + Tailwind CSS interface backed by the existing Python transcription and meeting analysis pipeline.

## Run locally

1. Install the Python dependencies in `Requirements.txt` and make sure FFmpeg is installed and available on `PATH`.
2. Set `MISTRAL_API_KEY` in `.env`. For Hinglish transcription, also set `SARVAM_API_KEY`. The English Whisper model downloads on first use.
3. Start the API from the repository root:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   uvicorn api:app --reload
   ```

4. In another terminal, install and start the React app:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

The API accepts YouTube/video URLs and uploaded audio or video files. The in-memory Q&A session lasts until the API process restarts.

## Stack

- React and Vite
- Tailwind CSS with custom responsive meeting-workspace styling
- FastAPI API for analysis and meeting Q&A
- Existing Whisper/Sarvam transcription, Mistral summarization, extraction, and RAG modules
