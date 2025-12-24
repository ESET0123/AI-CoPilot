# FFmpeg Setup Instructions for ai-services-3

## Why FFmpeg is Needed

FFmpeg is required for the speech-to-text functionality (when you install `faster-whisper` in the future). The code in `main.py` adds the current directory to the PATH so it can find `ffmpeg.exe`.

## How to Add FFmpeg

### Option 1: Download FFmpeg (Recommended for Portability)

1. **Download FFmpeg for Windows**:
   - Go to: https://www.gyan.dev/ffmpeg/builds/
   - Download: `ffmpeg-release-essentials.zip` (smaller) or `ffmpeg-release-full.zip`

2. **Extract the files**:
   - Extract the downloaded ZIP file
   - Navigate to the `bin` folder inside the extracted directory
   - You'll find: `ffmpeg.exe`, `ffprobe.exe`, `ffplay.exe`

3. **Copy to ai-services-3 root**:
   ```
   Copy these files to: c:\Users\RishavShah\Desktop\Projects\chatbot\ai-services-3\
   
   Final structure:
   ai-services-3/
   ├── ffmpeg.exe      ← Add this
   ├── ffprobe.exe     ← Add this (optional but recommended)
   ├── main.py
   ├── requirements.txt
   └── modules/
   ```

### Option 2: Use System FFmpeg (Alternative)

If you already have FFmpeg installed system-wide:
- The code will automatically find it in your system PATH
- No need to copy files to the project folder

### Option 3: Install via Package Manager

Using Chocolatey (if installed):
```powershell
choco install ffmpeg
```

Using Scoop (if installed):
```powershell
scoop install ffmpeg
```

## Verify FFmpeg Installation

After adding ffmpeg, verify it's accessible:

```powershell
# If in ai-services-3 directory
.\ffmpeg.exe -version

# Or if installed system-wide
ffmpeg -version
```

## When is FFmpeg Actually Used?

FFmpeg is only needed when you:
1. Install `faster-whisper`: `pip install faster-whisper`
2. Use the `/api/transcribe` endpoint for speech-to-text

**For now**, since you're only using the `/chat` and `/stop` endpoints, FFmpeg is **not required** and the service will run fine without it.

## Future: Enabling Speech-to-Text

When you're ready to enable STT:

1. **Add FFmpeg** (using instructions above)
2. **Install faster-whisper**:
   ```powershell
   pip install faster-whisper
   ```
3. **Restart the service** - it will automatically load the Whisper model
4. **Use the `/api/transcribe` endpoint**

## Current Status

✅ Service runs without FFmpeg (STT disabled)
✅ `/chat` and `/stop` endpoints work perfectly
⏳ FFmpeg needed only when enabling speech-to-text

## Quick Download Links

- **FFmpeg Windows Builds**: https://www.gyan.dev/ffmpeg/builds/
- **Official FFmpeg**: https://ffmpeg.org/download.html
