import os
import json
from datetime import datetime
from typing import Optional
import google.generativeai as genai
from .schemas import VideoScript, GeminiRequest


class GeminiClient:
    """Gemini AI client for generating video scripts"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
            generation_config={
                "temperature": 0.9,
                "top_k": 40,
                "top_p": 0.95,
                "max_output_tokens": 8192,
            },
        )
    
    def generate_script(self, request: GeminiRequest) -> VideoScript:
        """Generate a video script from a topic using Gemini"""
        
        prompt = self._build_prompt(request)
        
        try:
            print(f"🤖 Calling Gemini API for topic: {request.topic}")
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise ValueError("Empty response from Gemini")
            
            # Parse JSON response
            script_data = self._parse_response(response.text)
            
            # Add metadata
            script_data["id"] = f"script_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            script_data["topic"] = request.topic
            script_data["metadata"]["created_at"] = datetime.now().isoformat()
            script_data["metadata"]["target_platforms"] = request.target_platforms
            
            # Validate and create VideoScript
            script = VideoScript(**script_data)
            
            print(f"✅ Script generated: {script.id}")
            print(f"   - Title: {script.title}")
            print(f"   - Duration: {script.total_duration}s")
            print(f"   - Scenes: {len(script.scenes)}")
            print(f"   - Captions: {len(script.captions)}")
            
            return script
            
        except Exception as e:
            print(f"❌ Error generating script: {e}")
            raise
    
    def _build_prompt(self, request: GeminiRequest) -> str:
        """Build the prompt for Gemini"""
        
        return f"""You are an expert video script writer for short-form vertical videos (TikTok, Instagram Reels, YouTube Shorts).

Generate a complete video script in JSON format for the following topic:
Topic: {request.topic}
Style: {request.style}
Target Duration: {request.target_duration} seconds
Target Platforms: {', '.join(request.target_platforms)}

Requirements:
1. Create a hook in the first 3 seconds
2. Use vertical format (9:16 aspect ratio)
3. Include engaging captions with proper timing
4. Suggest appropriate background music
5. Make it suitable for {', '.join(request.target_platforms)}
6. Total duration should be around {request.target_duration} seconds

Return ONLY valid JSON matching this exact structure:
{{
  "title": "Video title",
  "description": "Video description",
  "total_duration": {request.target_duration},
  "scenes": [
    {{
      "id": "scene_1",
      "duration": 3.0,
      "type": "text",
      "content": "Hook text that grabs attention",
      "transition": "fade",
      "transition_duration": 0.5
    }}
  ],
  "captions": [
    {{
      "text": "Caption text",
      "start_time": 0.0,
      "end_time": 3.0,
      "style": {{
        "font_size": 48,
        "font_color": "#FFFFFF",
        "background_color": "#000000AA",
        "position": "bottom"
      }}
    }}
  ],
  "audio_tracks": [
    {{
      "type": "music",
      "url": "https://example.com/music.mp3",
      "start_time": 0.0,
      "volume": 0.3,
      "fade_in": 1.0,
      "fade_out": 2.0
    }}
  ],
  "metadata": {{
    "hashtags": ["relevant", "hashtags"]
  }}
}}

Generate an engaging {request.style} video script now. Return ONLY the JSON, no other text."""

    def _parse_response(self, response_text: str) -> dict:
        """Parse and clean the Gemini response"""
        
        # Remove markdown code blocks if present
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        
        cleaned = cleaned.strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Response: {cleaned[:500]}...")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
