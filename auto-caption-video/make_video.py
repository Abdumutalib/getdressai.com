#!/usr/bin/env python3
"""
Mahalliy 'robot': matn faylidan vertikal video (1080x1920).
Ixtiyoriy ovoz: Microsoft Edge TTS (bepul, kalit shart emas).

Talablar:
  - Python 3.10+
  - FFmpeg PATH da (Windows: winget install ffmpeg)
  - pip install -r requirements.txt

Ishlatish:
  python make_video.py --input captions.txt --out out.mp4
  python make_video.py --input captions.txt --out out.mp4 --target-seconds 600
  python make_video.py --input captions.txt --out out.mp4 --tts --target-seconds 600
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
BG = (18, 18, 28)
FG = (245, 245, 250)
ACCENT = (130, 110, 255)
PAD = 80
LINE_GAP = 12


def find_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        p = Path(path)
        if p.is_file():
            try:
                return ImageFont.truetype(str(p), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.replace("\n", " ").split()
    if not words:
        return []
    lines: list[str] = []
    cur: list[str] = []
    draw = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    for w in words:
        test = " ".join(cur + [w])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            cur.append(w)
        else:
            if cur:
                lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))
    return lines


def render_slide(text: str, path: Path) -> None:
    font_body = find_font(44)
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    max_w = W - 2 * PAD

    lines = wrap_text(text.strip(), font_body, max_w)
    if not lines:
        lines = [" "]

    line_heights = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_body)
        line_heights.append(bbox[3] - bbox[1])

    total_h = sum(line_heights) + LINE_GAP * (len(lines) - 1)
    y = (H - total_h) // 2

    draw.rectangle([PAD - 20, y - 30, W - PAD + 20, y + total_h + 30], outline=ACCENT, width=3)

    for line, lh in zip(lines, line_heights):
        bbox = draw.textbbox((0, 0), line, font=font_body)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        draw.text((x, y), line, font=font_body, fill=FG)
        y += lh + LINE_GAP

    img.save(path, "PNG")


def parse_slides(raw: str) -> list[str]:
    blocks = re.split(r"\n\s*\n", raw.strip())
    slides = [b.strip() for b in blocks if b.strip()]
    if not slides:
        raise SystemExit("Slaydlar topilmadi: bo'sh qatorlar bilan ajrating.")
    return slides


def run_ffmpeg(args: list[str]) -> None:
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr or r.stdout or "ffmpeg xato\n")
        raise SystemExit(r.returncode)


def ffprobe_duration(path: Path) -> float:
    r = subprocess.run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            str(path),
        ],
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        raise RuntimeError("ffprobe ishlamadi")
    data = json.loads(r.stdout)
    return float(data["format"]["duration"])


def ffprobe_has_audio(path: Path) -> bool:
    r = subprocess.run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-show_entries",
            "stream=codec_type",
            "-of",
            "csv=p=0",
            str(path),
        ],
        capture_output=True,
        text=True,
    )
    return "audio" in (r.stdout or "")


def get_audio_sample_rate(path: Path) -> int:
    r = subprocess.run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=sample_rate",
            "-of",
            "csv=p=0",
            str(path),
        ],
        capture_output=True,
        text=True,
    )
    try:
        line = (r.stdout or "").strip().split("\n")[0].strip()
        return int(float(line))
    except (ValueError, IndexError):
        return 48000


def pad_file_to_min_duration(src: Path, dst: Path, target_sec: float) -> None:
    """Ovoz/video tugagach oxirgi kadr + jimlik (agar audio bo'lsa)."""
    d = ffprobe_duration(src)
    if d >= target_sec - 0.05:
        shutil.copy2(src, dst)
        return
    pad = target_sec - d
    has_audio = ffprobe_has_audio(src)
    sr = get_audio_sample_rate(src) if has_audio else 48000
    vf = f"tpad=stop_mode=clone:stop_duration={pad}"
    cmd: list[str] = ["ffmpeg", "-y", "-i", str(src), "-vf", vf]
    if has_audio:
        cmd.extend(["-af", f"apad=pad_dur={max(1, int(pad * sr))}"])
    cmd.extend(
        [
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
        ]
    )
    if has_audio:
        cmd.extend(["-c:a", "aac", "-b:a", "192k"])
    else:
        cmd.append("-an")
    cmd.append(str(dst))
    run_ffmpeg(cmd)


async def tts_full_text(text: str, voice: str, wav_path: Path) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(wav_path))


def distribute_durations(slides: list[str], total_sec: float) -> list[float]:
    weights = [max(1, len(s)) for s in slides]
    ssum = sum(weights)
    raw = [total_sec * (w / ssum) for w in weights]
    # kamida ~1.2s har slayd
    raw = [max(1.2, x) for x in raw]
    scale = total_sec / sum(raw)
    return [max(1.0, x * scale) for x in raw]


def build_video_with_tts(
    slides: list[str], out: Path, voice: str, target_seconds: float | None
) -> None:
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg topilmadi.")

    tmp = Path(tempfile.mkdtemp(prefix="capvidtts_"))
    try:
        full_text = "\n".join(slides)
        audio_mp3 = tmp / "voice.mp3"
        asyncio.run(tts_full_text(full_text, voice, audio_mp3))
        total_dur = ffprobe_duration(audio_mp3)
        durs = distribute_durations(slides, total_dur)

        list_path = tmp / "list.txt"
        list_lines: list[str] = []
        for i, slide in enumerate(slides):
            png = tmp / f"slide_{i:04d}.png"
            render_slide(slide, png)
            list_lines.append(f"file '{png.as_posix()}'")
            list_lines.append(f"duration {durs[i]}")
        last_slide_png = tmp / f"slide_{len(slides) - 1:04d}.png"
        list_lines.append(f"file '{last_slide_png.as_posix()}'")
        list_path.write_text("\n".join(list_lines), encoding="utf-8")

        vconcat = tmp / "v.mp4"
        run_ffmpeg(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_path),
                "-vf",
                f"format=yuv420p,scale={W}:{H}",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                str(vconcat),
            ]
        )
        merged = tmp / "merged.mp4"
        run_ffmpeg(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(vconcat),
                "-i",
                str(audio_mp3),
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-shortest",
                str(merged),
            ]
        )
        if target_seconds is not None and ffprobe_duration(merged) < target_seconds - 0.05:
            pad_file_to_min_duration(merged, out, target_seconds)
        else:
            shutil.copy2(merged, out)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main() -> None:
    ap = argparse.ArgumentParser(description="Matndan vertikal video")
    ap.add_argument("--input", "-i", required=True, help="Matn fayli (slaydlar: bo'sh qator)")
    ap.add_argument("--out", "-o", default="output_vertical.mp4")
    ap.add_argument("--sec", type=float, default=3.5, help="TTS yo'q: har slayd sekund")
    ap.add_argument("--tts", action="store_true", help="Edge TTS ovoz")
    ap.add_argument(
        "--lang",
        default="uz-UZ-SardorNeural",
        help="edge-tts ovoz (masalan ru-RU-DmitryNeural, en-US-AriaNeural)",
    )
    ap.add_argument(
        "--target-seconds",
        type=float,
        default=None,
        help="Jami davomiylik (sek). TTS yo'q: slaydlarga teng bo'linadi. TTS: ovoz qisqa bo'lsa, oxirgi kadr+jimlik cho'ziladi.",
    )
    args = ap.parse_args()

    raw = Path(args.input).read_text(encoding="utf-8")
    slides = parse_slides(raw)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    if args.target_seconds is not None and args.target_seconds <= 0:
        raise SystemExit("--target-seconds musbat bo'lishi kerak.")

    if args.tts:
        build_video_with_tts(slides, out, args.lang, args.target_seconds)
    else:
        if args.target_seconds is not None:
            sec_per = args.target_seconds / len(slides)
            if sec_per < 0.2:
                raise SystemExit(
                    "Juda ko'p slayd: har biri <0.2s bo'ladi. Kamroq blok qiling yoki --target-seconds ni oshiring."
                )
        else:
            sec_per = args.sec
        tmp = Path(tempfile.mkdtemp(prefix="caprend_"))
        try:
            for i, s in enumerate(slides):
                render_slide(s, tmp / f"slide_{i:04d}.png")
            list_path = tmp / "list.txt"
            lines: list[str] = []
            for i in range(len(slides)):
                png = tmp / f"slide_{i:04d}.png"
                lines.append(f"file '{png.as_posix()}'")
                lines.append(f"duration {sec_per}")
            last = tmp / f"slide_{len(slides) - 1:04d}.png"
            lines.append(f"file '{last.as_posix()}'")
            list_path.write_text("\n".join(lines), encoding="utf-8")
            if shutil.which("ffmpeg") is None:
                raise SystemExit("ffmpeg topilmadi.")
            run_ffmpeg(
                [
                    "ffmpeg",
                    "-y",
                    "-f",
                    "concat",
                    "-safe",
                    "0",
                    "-i",
                    str(list_path),
                    "-vf",
                    f"format=yuv420p,scale={W}:{H}",
                    "-c:v",
                    "libx264",
                    "-pix_fmt",
                    "yuv420p",
                    str(out),
                ]
            )
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    print(f"Tayyor: {out.resolve()}")


if __name__ == "__main__":
    main()
