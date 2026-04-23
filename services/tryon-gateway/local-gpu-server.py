import base64
import io
import os
import time
from typing import Optional

import requests
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageOps, ImageDraw


class TryOnRequest(BaseModel):
    mode: str = "photo"
    sourceImageUrl: str
    style: str
    gender: str
    prompt: str
    clothingRequest: Optional[str] = None
    measurements: Optional[dict] = None


app = FastAPI()
SHARED_SECRET = os.getenv("TRYON_SHARED_SECRET", "").strip()


def require_auth(authorization: Optional[str]) -> None:
    if not SHARED_SECRET:
        return
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized.")
    token = authorization.split(" ", 1)[1].strip()
    if token != SHARED_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized.")


def fake_tryon(image_bytes: bytes, style: str) -> bytes:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = ImageOps.contain(image, (1024, 1280))

    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rounded_rectangle(
        [(40, 40), (image.size[0] - 40, 180)],
        radius=28,
        fill=(15, 59, 102, 180),
    )
    draw.text((70, 80), f"TRY-ON PREVIEW: {style}", fill=(255, 255, 255, 255))

    merged = Image.alpha_composite(image.convert("RGBA"), overlay)
    out = io.BytesIO()
    merged.convert("RGB").save(out, format="PNG")
    return out.getvalue()


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/tryon")
def tryon(payload: TryOnRequest, authorization: Optional[str] = Header(default=None)):
    require_auth(authorization)

    started = time.time()
    try:
        response = requests.get(payload.sourceImageUrl, timeout=30)
        response.raise_for_status()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not download source image: {exc}") from exc

    # Replace this stub with your real PyTorch / diffusers / custom VTON pipeline.
    result_bytes = fake_tryon(response.content, payload.style)
    encoded = base64.b64encode(result_bytes).decode("utf-8")

    summary_subject = payload.clothingRequest or payload.style
    return {
        "imageBase64": f"data:image/png;base64,{encoded}",
        "summary": f"Photo-based try-on generated for {summary_subject}.",
        "tookMs": int((time.time() - started) * 1000),
    }
