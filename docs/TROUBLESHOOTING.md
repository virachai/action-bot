# 🔧 Troubleshooting Guide

Common issues and solutions for `auto-short-factory`.

---

## 🎥 Video Engine & FFmpeg

### "FFmpeg exited with code 1"
**Symptoms**: Video generation fails immediately.
**Causes**:
1.  **Missing Assets**: The code tried to load a file that doesn't exist.
2.  **Invalid Font**: `arial.ttf` not found in the Docker container/system.
3.  **Memory Limit**: Processing 4K video on a 512MB RAM instance.

**Solution**:
1.  Check `apps/video-engine/temp/` to see which scene failed.
2.  Run with full logs: `python src/main.py --debug`.
3.  Ensure fonts are installed: `apt-get install fonts-liberation`.

### "Video file size is 0 bytes"
**Cause**: FFmpeg started but didn't write any packets (codec issue).
**Solution**: Check if you are using `libx264`. Ensure `h264` codec is installed.

---

## 🤖 AI & Gemini

### "429 Too Many Requests" / "Quota Exceeded"
**Cause**: You hit the free tier limit of Gemini 1.5 Flash.
**Solution**:
1.  Add more API keys in `.env.local` (`GEMINI_API_KEY_2`, etc.).
2.  The system will automatically rotate to the next key.
3.  Upgrade to a paid Gemini plan (Pay-as-you-go).

### "Invalid JSON response"
**Cause**: The LLM hallucinated text outside the JSON block.
**Solution**: Nothing. The `GeminiClient` has auto-retry logic to regenerate the response.

---

## 💾 Database & Prisma

### "P1001: Can't reach database server"
**Cause**: Postgres is down or credentials are wrong.
**Solution**:
1.  Check Docker: `docker ps | grep postgres`.
2.  Check `.env`: Is `DATABASE_URL` pointing to `localhost` or `postgres` (service name)?

### "Schema mismatch"
**Cause**: Code expects a column that isn't in DB.
**Solution**: Run `pnpm db:push` to sync the schema.

---

## 🐳 Docker & Deployment

### "No space left on device"
**Cause**: `apps/video-engine/temp/` is full of uncleaned videos.
**Solution**:
1.  Run `pnpm run clean`.
2.  Ensure the "Cleanup" logic in `VideoAssembler` is running.

### "Permission denied" (Linux)
**Cause**: The node process can't write to `output/`.
**Solution**: `chown -R node:node apps/video-engine/output`.
