import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import GeminiRequest, GeminiResponse
from .gemini_client import GeminiClient

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Logic Service",
    description="AI-powered video script generation using Gemini 1.5 Flash",
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

# Initialize Gemini client
try:
    gemini_client = GeminiClient()
except Exception as e:
    print(f"⚠️  Warning: Failed to initialize Gemini client: {e}")
    gemini_client = None


@app.get("/")
async def root():
    """Root endpoint"""
    return {"service": "AI Logic Service", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "gemini_configured": gemini_client is not None}


@app.post("/generate-script", response_model=GeminiResponse)
async def generate_script(request: GeminiRequest):
    """
    Generate a video script from a topic using Gemini AI

    Args:
        request: GeminiRequest with topic and parameters

    Returns:
        GeminiResponse with generated script or error
    """
    if not gemini_client:
        raise HTTPException(
            status_code=500,
            detail="Gemini client not initialized. Check GEMINI_API_KEY.",
        )

    try:
        print(f"\n{'=' * 50}")
        print("📝 New script generation request")
        print(f"   Topic: {request.topic}")
        print(f"   Style: {request.style}")
        print(f"   Duration: {request.target_duration}s")
        print(f"{'=' * 50}\n")

        script = gemini_client.generate_script(request)

        return GeminiResponse(success=True, script=script)

    except ValueError as e:
        error_msg = str(e)
        print(f"❌ Validation error: {error_msg}")
        return GeminiResponse(success=False, error=error_msg)
    except Exception as e:
        error_msg = f"Failed to generate script: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8001"))

    print("\n╔════════════════════════════════════════╗")
    print("║       AI LOGIC SERVICE STARTING        ║")
    print("╚════════════════════════════════════════╝\n")
    print(f"🚀 Starting server on http://localhost:{port}")
    print(f"📚 API docs: http://localhost:{port}/docs\n")

    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)
