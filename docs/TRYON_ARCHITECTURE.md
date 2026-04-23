# Try-On Architecture

## Recommended production layout

- `Next.js` handles auth, uploads, signed URLs, history, and marketplace recommendations.
- `Supabase Storage` stores user source photos and generated results.
- `Supabase Postgres` stores `user_generations`, `guest_generations`, preferences, quotas, and subscriptions.
- An external GPU try-on service handles photo-based generation.

This keeps heavy inference off Vercel while preserving the current UI flow.

## Request flow

1. The user uploads a source photo through `/api/preferences`.
2. The source photo is stored in the `user-generations` bucket.
3. `/api/generate` creates a short-lived signed URL for the source image.
4. `/api/generate` calls the external GPU service with metadata plus the signed source image URL.
5. The GPU service returns either:
   - a downloadable image URL, or
   - a base64 image payload.
6. The Next.js app stores the final result back in Supabase Storage.
7. The result is written to `user_generations` for authenticated users, or `guest_generations` for guests.
8. The UI receives signed URLs for both source and result images.

## Why this is the best fit for the current repo

- The repo already uses Supabase for auth, storage, and generation history.
- Vercel should not run heavy PyTorch or virtual try-on inference directly.
- The current studio UI expects a synchronous response and can stay unchanged.
- The architecture can later evolve into async jobs without rewriting the frontend contract.

## Required environment variables

Add these to the Next.js app environment:

- `TRYON_SERVICE_URL`
- `TRYON_SERVICE_API_KEY`
- `TRYON_SERVICE_TIMEOUT_MS`

Keep existing storage/auth variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## External GPU service contract

`POST ${TRYON_SERVICE_URL}`

Request body:

```json
{
  "mode": "photo",
  "sourceImageUrl": "https://signed-url.example.com/...",
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

Supported response shapes:

```json
{
  "imageUrl": "https://gpu-service.example.com/result.png",
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

Also accepted:

- `resultUrl`
- `resultImage`
- `mimeType`
- `contentType`
- `extension`

## Scale notes

- For high traffic, put a queue in front of the GPU service and return job IDs.
- For now, the repo remains synchronous to avoid a frontend rewrite.
- If throughput grows, move `checkRateLimit` from memory into Redis or a database-backed limiter.
- Keep signed URL lifetimes short.
