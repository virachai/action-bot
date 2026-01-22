import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any, Dict
from .video_assembler import VideoAssembler

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Video Engine Service",
    description="FFmpeg-based video assembly service for Auto-Short-Factory",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class VideoGenerationRequest(BaseModel):
    script: Dict[str, Any]
    output_bucket: str
    output_key: str


class VideoGenerationResponse(BaseModel):
    success: bool
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# Initialize video assembler
video_assembler = VideoAssembler(
    width=int(os.getenv("VIDEO_WIDTH", "1080")),
    height=int(os.getenv("VIDEO_HEIGHT", "1920")),
    fps=int(os.getenv("VIDEO_FPS", "30")),
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"service": "Video Engine Service", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ffmpeg_available": True,  # Would check ffmpeg availability in production
    }


@app.post("/generate-video", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest):
    """
    Generate a video from a script

    Args:
        request: VideoGenerationRequest with script and output info

    Returns:
        VideoGenerationResponse with video metadata or error
    """
    try:
        print(f"\n{'=' * 50}")
        print("🎬 New video generation request")
        print(f"   Script ID: {request.script.get('id', 'unknown')}")
        print(f"   Topic: {request.script.get('topic', 'unknown')}")
        print(f"   Output: {request.output_key}")
        print(f"{'=' * 50}\n")

        # Create output directory
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)

        output_path = output_dir / request.output_key.split("/")[-1]

        # Assemble video
        metadata = video_assembler.assemble_video(
            script=request.script, output_path=str(output_path)
        )

        # Update output URL (in production, this would be S3 URL)
        metadata["outputUrl"] = f"file://{output_path.absolute()}"

        return VideoGenerationResponse(success=True, metadata=metadata)

    except Exception as e:
        error_msg = f"Failed to generate video: {str(e)}"
        print(f"❌ Error: {error_msg}")
        return VideoGenerationResponse(success=False, error=error_msg)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8002"))

    print("\n╔════════════════════════════════════════╗")
    print("║     VIDEO ENGINE SERVICE STARTING      ║")
    print("╚════════════════════════════════════════╝\n")
    print(f"🚀 Starting server on http://localhost:{port}")
    print(f"📚 API docs: http://localhost:{port}/docs\n")

    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)
