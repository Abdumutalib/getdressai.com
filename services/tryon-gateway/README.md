# Try-On Gateway Examples

This folder contains two production-oriented examples that match the contract documented in `docs/TRYON_ARCHITECTURE.md`.

## Options

- `hf-endpoint-server.mjs`
  - Use this when your real model is deployed on a Hugging Face Inference Endpoint.
  - This server accepts the app request, forwards it to Hugging Face, and returns a normalized response.

- `local-gpu-server.py`
  - Use this when you run your own GPU machine with Python/PyTorch.
  - Replace the stubbed inference section with your actual try-on pipeline.

## Expected request body

```json
{
  "mode": "photo",
  "sourceImageUrl": "https://signed-url.example.com/source.jpg",
  "style": "Luxury",
  "gender": "female",
  "prompt": "A polished editorial outfit with realistic fabric detail",
  "clothingRequest": "silk evening dress | size: M",
  "measurements": {
    "height": 170,
    "chest": 92,
    "waist": 74,
    "hips": 98
  }
}
```

## Supported normalized response

```json
{
  "imageUrl": "https://example.com/result.png",
  "summary": "Photo-based try-on generated for silk evening dress.",
  "tookMs": 12450
}
```

or

```json
{
  "imageBase64": "data:image/png;base64,...",
  "summary": "Photo-based try-on generated for silk evening dress.",
  "tookMs": 12450
}
```

## Environment variables

### For `hf-endpoint-server.mjs`

- `PORT`
- `HF_ENDPOINT_URL`
- `HF_API_TOKEN`
- `HF_TIMEOUT_MS`
- `TRYON_SHARED_SECRET` (optional bearer token for your Next.js app)

### For `local-gpu-server.py`

- `PORT`
- `TRYON_SHARED_SECRET` (optional bearer token for your Next.js app)

## Wiring to the main app

Set these in the Next.js app:

- `TRYON_SERVICE_URL`
- `TRYON_SERVICE_API_KEY`
- `TRYON_SERVICE_TIMEOUT_MS`

If you use `TRYON_SHARED_SECRET` on the gateway, use the same value in `TRYON_SERVICE_API_KEY`.
