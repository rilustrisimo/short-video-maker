# Deploy to Render with Cloudinary Integration

This guide will help you deploy the Short Video Maker MCP server to Render with automatic Cloudinary upload.

## Prerequisites

1. **Pexels API Key**: Sign up at [Pexels](https://www.pexels.com/api/) to get your API key
2. **Cloudinary Account**: Sign up at [Cloudinary](https://cloudinary.com/) for free video hosting
3. **GitHub Repository**: Fork this repository to your GitHub account
4. **Render Account**: Sign up at [Render.com](https://render.com)

## Setup Instructions

### 1. Get Your API Keys

#### Pexels API Key
1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up for a free account
3. Generate your API key

#### Cloudinary Credentials
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

### 2. Deploy to Render

#### Option A: One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/short-video-maker)

#### Option B: Manual Deploy
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Environment**: Docker
   - **Dockerfile Path**: `./main-tiny.Dockerfile`
   - **Plan**: Free (or Starter for better performance)

### 3. Configure Environment Variables

In your Render service settings, add these environment variables:

```
PEXELS_API_KEY=your_pexels_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
LOG_LEVEL=info
```

### 4. Deploy

Click "Deploy" and wait for the build to complete (usually 5-10 minutes).

## Testing Your Deployment

Once deployed, you can test your MCP server:

```bash
curl -X POST https://YOUR-APP-URL.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create-short-video",
    "input": {
      "text": "Welcome to our amazing short video!",
      "search_terms": ["technology", "innovation"],
      "voice": "af_heart",
      "orientation": "portrait",
      "music_volume": 0.3
    }
  }'
```

Response:
```json
{
  "videoId": "abc123",
  "status": "processing",
  "message": "Video creation started. Video will be uploaded to Cloudinary when ready."
}
```

Check status:
```bash
curl -X POST https://YOUR-APP-URL.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get-video-status",
    "input": {
      "videoId": "abc123"
    }
  }'
```

## Integration with n8n

1. Add an HTTP Request node in n8n
2. Set Method to POST
3. Set URL to `https://YOUR-APP-URL.onrender.com/mcp`
4. Set Headers: `Content-Type: application/json`
5. Set Body to:
```json
{
  "tool": "create-short-video",
  "input": {
    "text": "{{ $json.text }}",
    "search_terms": {{ $json.searchTerms }},
    "voice": "af_heart",
    "orientation": "portrait",
    "music_volume": 0.3
  }
}
```

## Video Access

- Videos are automatically uploaded to Cloudinary
- On Render's free tier, local files are deleted after upload to save space
- Access videos via Cloudinary URLs in your applications
- Videos remain accessible even when the Render service restarts

## Cost Optimization

**Free Tier Limits:**
- Render Free: 750 hours/month (enough for continuous running)
- Cloudinary Free: 25GB storage, 25GB bandwidth/month
- Pexels API: 200 requests/hour

**Tips:**
- Use `tiny.en` Whisper model for faster processing
- Set `CONCURRENCY=1` on free tier
- Videos auto-delete locally but remain on Cloudinary

## Troubleshooting

### Build Failures
- Check that all environment variables are set
- Verify your API keys are correct
- Review build logs in Render dashboard

### Runtime Issues
- Check service logs for error messages
- Verify Cloudinary credentials in logs
- Test API endpoints individually

### Memory Issues
- Reduce `VIDEO_CACHE_SIZE_IN_BYTES` if needed
- Consider upgrading to Starter plan for more resources

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PEXELS_API_KEY` | Yes | API key for video footage |
| `CLOUDINARY_CLOUD_NAME` | Yes | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Your Cloudinary API secret |
| `PORT` | No | Server port (auto-set by Render) |
| `LOG_LEVEL` | No | Logging level (default: info) |
| `WHISPER_MODEL` | No | Whisper model (default: tiny.en) |
| `KOKORO_MODEL_PRECISION` | No | TTS precision (default: q4) |
| `CONCURRENCY` | No | Parallel renders (default: 1) |
| `VIDEO_CACHE_SIZE_IN_BYTES` | No | Cache size (default: 2GB) |

## Next Steps

- Integrate with your n8n workflows
- Set up webhooks for completion notifications
- Scale up to Starter plan for better performance
- Consider implementing video analytics via Cloudinary

For support, check the [main README](./README.md) or open an issue.
