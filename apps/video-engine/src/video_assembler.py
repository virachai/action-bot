import os
import json
import ffmpeg
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from PIL import Image, ImageDraw, ImageFont


class VideoAssembler:
    """FFmpeg-based video assembler for creating vertical videos"""
    
    def __init__(self, width: int = 1080, height: int = 1920, fps: int = 30):
        self.width = width
        self.height = height
        self.fps = fps
        self.temp_dir = Path("temp")
        self.temp_dir.mkdir(exist_ok=True)
    
    def assemble_video(
        self,
        script: Dict[str, Any],
        output_path: str
    ) -> Dict[str, Any]:
        """
        Assemble video from script
        
        Args:
            script: Video script dictionary
            output_path: Output file path
        
        Returns:
            Video metadata dictionary
        """
        print(f"🎬 Assembling video: {script['id']}")
        print(f"   Output: {output_path}\n")
        
        try:
            # Create scene videos
            scene_files = self._create_scenes(script['scenes'])
            
            # Concatenate scenes
            concat_file = self.temp_dir / f"{script['id']}_concat.mp4"
            self._concatenate_videos(scene_files, str(concat_file))
            
            # Add captions
            captioned_file = self.temp_dir / f"{script['id']}_captioned.mp4"
            self._add_captions(str(concat_file), script['captions'], str(captioned_file))
            
            # Add audio (if any)
            if script.get('audio_tracks'):
                final_file = output_path
                self._add_audio(str(captioned_file), script['audio_tracks'], final_file)
            else:
                # No audio, just copy
                os.rename(str(captioned_file), output_path)
            
            # Get file stats
            file_size = os.path.getsize(output_path)
            
            print(f"✅ Video assembled successfully!")
            print(f"   Size: {file_size / 1024 / 1024:.2f} MB\n")
            
            # Cleanup temp files
            self._cleanup([concat_file, captioned_file] + scene_files)
            
            return {
                "id": f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "scriptId": script['id'],
                "topic": script['topic'],
                "title": script['title'],
                "duration": script['total_duration'],
                "width": self.width,
                "height": self.height,
                "fps": self.fps,
                "fileSize": file_size,
                "codec": "h264",
                "outputUrl": output_path,
                "createdAt": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error assembling video: {e}")
            raise
    
    def _create_scenes(self, scenes: List[Dict[str, Any]]) -> List[Path]:
        """Create video files for each scene"""
        scene_files = []
        
        for i, scene in enumerate(scenes):
            scene_file = self.temp_dir / f"scene_{i:03d}.mp4"
            
            if scene['type'] == 'text':
                self._create_text_scene(scene, str(scene_file))
            elif scene['type'] == 'image':
                self._create_image_scene(scene, str(scene_file))
            elif scene['type'] == 'video':
                self._create_video_scene(scene, str(scene_file))
            
            scene_files.append(scene_file)
            print(f"   ✓ Scene {i+1}/{len(scenes)} created")
        
        return scene_files
    
    def _create_text_scene(self, scene: Dict[str, Any], output: str):
        """Create a scene with text overlay"""
        # Create a solid color background image
        img = Image.new('RGB', (self.width, self.height), color='#1a1a1a')
        draw = ImageDraw.Draw(img)
        
        # Try to load a nice font, fallback to default
        try:
            font = ImageFont.truetype("arial.ttf", 72)
        except:
            font = ImageDraw.getfont()
        
        # Draw text (centered)
        text = scene['content']
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        position = (
            (self.width - text_width) // 2,
            (self.height - text_height) // 2
        )
        
        draw.text(position, text, fill='white', font=font)
        
        # Save temp image
        temp_img = self.temp_dir / f"temp_{scene['id']}.png"
        img.save(str(temp_img))
        
        # Create video from image
        (
            ffmpeg
            .input(str(temp_img), loop=1, t=scene['duration'], framerate=self.fps)
            .output(
                output,
                vcodec='libx264',
                pix_fmt='yuv420p',
                s=f'{self.width}x{self.height}'
            )
            .overwrite_output()
            .run(quiet=True)
        )
        
        # Cleanup temp image
        temp_img.unlink()
    
    def _create_image_scene(self, scene: Dict[str, Any], output: str):
        """Create a scene from an image URL"""
        # For now, create a placeholder
        # In production, you'd download the image from S3
        self._create_text_scene({**scene, 'content': 'Image Scene'}, output)
    
    def _create_video_scene(self, scene: Dict[str, Any], output: str):
        """Create a scene from a video URL"""
        # For now, create a placeholder
        # In production, you'd download and process the video from S3
        self._create_text_scene({**scene, 'content': 'Video Scene'}, output)
    
    def _concatenate_videos(self, video_files: List[Path], output: str):
        """Concatenate multiple video files"""
        # Create concat file
        concat_list = self.temp_dir / "concat_list.txt"
        with open(concat_list, 'w') as f:
            for video in video_files:
                f.write(f"file '{video.absolute()}'\n")
        
        # Concatenate using FFmpeg
        (
            ffmpeg
            .input(str(concat_list), format='concat', safe=0)
            .output(output, c='copy')
            .overwrite_output()
            .run(quiet=True)
        )
        
        concat_list.unlink()
    
    def _add_captions(self, input_file: str, captions: List[Dict[str, Any]], output: str):
        """Add captions to video"""
        # For simplicity, we'll skip caption overlay in this version
        # In production, you'd use FFmpeg's drawtext filter
        # For now, just copy the file
        import shutil
        shutil.copy(input_file, output)
        print(f"   ℹ Caption overlay skipped (implement with drawtext filter)")
    
    def _add_audio(self, input_file: str, audio_tracks: List[Dict[str, Any]], output: str):
        """Add audio tracks to video"""
        # For simplicity, we'll skip audio in this version
        # In production, you'd download audio from S3 and mix it
        import shutil
        shutil.copy(input_file, output)
        print(f"   ℹ Audio mixing skipped (implement with audio filter)")
    
    def _cleanup(self, files: List[Path]):
        """Remove temporary files"""
        for file in files:
            try:
                if file.exists():
                    file.unlink()
            except:
                pass
