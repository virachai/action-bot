# 🚀 Quick Start Guide - Auto-Short-Factory

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check Python (need 3.11+)
python --version

# Check FFmpeg (need 6.0+)
ffmpeg -version

# Check pnpm (need 8+)
pnpm --version
```

## First Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Install Python dependencies for AI Logic
cd apps/ai-logic
pip install -r requirements.txt
cd ../..

# 3. Install Python dependencies for Video Engine
cd apps/video-engine
pip install -r requirements.txt
cd ../..

# 4. Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 5. Build all packages
pnpm run build
```

## Running in Development

### Option 1: Run All Services (Recommended)

Open 3 terminals:

**Terminal 1 - AI Logic Service:**
```bash
cd apps/ai-logic
pnpm run dev
# Runs on http://localhost:8001
```

**Terminal 2 - Video Engine Service:**
```bash
cd apps/video-engine
pnpm run dev
# Runs on http://localhost:8002
```

**Terminal 3 - Orchestrator:**
```bash
cd apps/orchestrator
export VIDEO_TOPIC="Your Video Topic Here"
pnpm run dev
```

### Option 2: Run Services Individually

**Just test AI script generation:**
```bash
cd apps/ai-logic
pnpm run dev
# Visit http://localhost:8001/docs
```

**Just test video assembly:**
```bash
cd apps/video-engine
pnpm run dev
# Visit http://localhost:8002/docs
```

## Testing APIs

### AI Logic API

**Generate a script:**
```bash
curl -X POST http://localhost:8001/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Future of Artificial Intelligence",
    "target_duration": 60,
    "target_platforms": ["tiktok", "instagram", "youtube"],
    "style": "entertaining"
  }'
```

### Video Engine API

**Generate a video (requires a script):**
```bash
curl -X POST http://localhost:8002/generate-video \
  -H "Content-Type: application/json" \
  -d @sample-script.json
```

## Running the Complete Pipeline

```bash
# Set your video topic
export VIDEO_TOPIC="Amazing AI Innovations 2026"

# Run orchestrator
cd apps/orchestrator
pnpm run start
```

## Common Commands

```bash
# From root directory:
pnpm run build        # Build all packages
pnpm run dev          # Run all in dev mode
pnpm run lint         # Lint all code
pnpm run type-check   # Type check TypeScript
pnpm run format       # Format code
pnpm run clean        # Clean build artifacts
```

## Environment Variables Required

```bash
# Gemini AI (REQUIRED)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash

# AWS S3 (REQUIRED for production)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_OUTPUT=your-output-bucket

# Video Settings (OPTIONAL)
VIDEO_TOPIC="Your Default Topic"
VIDEO_WIDTH=1080
VIDEO_HEIGHT=1920
VIDEO_FPS=30
```

## Troubleshooting

### "Cannot find module '@repo/config'"
```bash
# Build shared packages first
pnpm run build
```

### "GEMINI_API_KEY not found"
```bash
# Make sure .env.local exists and has your API key
cat .env.local | grep GEMINI_API_KEY
```

### "FFmpeg not found"
```bash
# Install FFmpeg
# macOS: brew install ffmpeg
# Ubuntu: sudo apt-get install ffmpeg
# Windows: Download from ffmpeg.org
```

### "Port already in use"
```bash
# Kill processes on ports 8001, 8002
# macOS/Linux:
lsof -ti:8001 | xargs kill
lsof -ti:8002 | xargs kill

# Windows:
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

## API Documentation

Once services are running:

- **AI Logic Docs:** http://localhost:8001/docs
- **Video Engine Docs:** http://localhost:8002/docs

## Output Locations

- **Generated Videos:** `apps/video-engine/output/`
- **Generated Scripts:** `apps/orchestrator/output/`
- **Temp Files:** `apps/video-engine/temp/`

## GitHub Actions

### Manual Trigger
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Auto Video Factory"
4. Click "Run workflow"
5. Enter custom topic (optional)
6. Wait for completion
7. Download artifacts

### View Logs
- Check workflow runs for detailed logs
- Download video and script artifacts
- Review any error messages

## Next Steps

1. ✅ Test each service individually
2. ✅ Run complete pipeline locally
3. ✅ Configure GitHub secrets
4. ✅ Test GitHub Actions workflow
5. ✅ Set up S3 buckets
6. ✅ Deploy to production

## Support

- 📚 Read the [README.md](../README.md)
- 📖 Check [walkthrough.md](walkthrough.md)
- 🔍 Review [implementation_plan.md](implementation_plan.md)

---

**Happy video creating! 🎬**
