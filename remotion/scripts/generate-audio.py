import json
import os
import pathlib
import urllib.request
import urllib.error

KEY = os.environ.get("ELEVENLABS_API_KEY")
if not KEY:
    raise SystemExit("ElevenLabs is not connected")

OUT = pathlib.Path("public/audio")
OUT.mkdir(parents=True, exist_ok=True)
VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ"  # Liam: energetic, clear
LINES = [
    "Stop collecting AI tools. Tools alone don't build a business.",
    "You need a system that keeps working, even when you don't.",
    "Connect smart prompts, automated workflows, and products people actually want.",
    "Welcome to AI Income Systems Lab. Fifteen modules. Eighty-nine lessons. Start free.",
    "Grab the AI Income Operating System, absolutely free.",
    "Visit AI income systems dot com slash O S. Start building today.",
]

def post(url, payload):
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs request failed [{error.code}]: {detail}") from error

for index, text in enumerate(LINES, start=1):
    audio = post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
        {
            "text": text,
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.38,
                "similarity_boost": 0.78,
                "style": 0.58,
                "use_speaker_boost": True,
                "speed": 1.12,
            },
        },
    )
    (OUT / f"voice-{index}.mp3").write_bytes(audio)
    print(f"Generated voice-{index}.mp3")

music = post(
    "https://api.elevenlabs.io/v1/music",
    {
        "prompt": "Original upbeat royalty-free instrumental advertising bed, 20 seconds. Energetic modern funk-pop with punchy drums, muted electric guitar, bright brass accents and a confident uplifting groove. No vocals, no spoken words, no long intro. Strong immediate hook, subtle builds every three seconds, clean resolved ending. Designed to sit quietly beneath an energetic commercial voiceover.",
        "duration_seconds": 20,
    },
)
(OUT / "upbeat-bed.mp3").write_bytes(music)
print("Generated upbeat-bed.mp3")
