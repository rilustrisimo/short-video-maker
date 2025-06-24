# 🚀 Short Video Maker MCP Server - Render Deployment Ready

This MCP server has been configured for easy deployment to Render with automatic Cloudinary video hosting.

## ✨ What's Been Added

### 🔧 Core Integration
- **Cloudinary Service**: Automatic video upload after generation
- **Docker Optimization**: Uses tiny models for free tier deployment
- **Smart Storage**: Local files auto-deleted on Render to save space
- **Environment Support**: Proper configuration for Render deployment

### 🌐 API Endpoints
- **Simple MCP Format**: Easy integration with n8n and other tools
- **Health Check**: `/health` endpoint for Render monitoring
- **Direct HTTP POST**: `/mcp` endpoint for simple API calls

### 📱 Simple API Format
Instead of complex scene/config objects, use this simple format:

```json
{
  "tool": "create-short-video",
  "input": {
    "text": "Your video text here",
    "search_terms": ["keyword1", "keyword2"],
    "voice": "af_heart",
    "orientation": "portrait", 
    "music_volume": 0.3
  }
}
```

## 🚀 Quick Deploy to Render

### 1. Prerequisites
- [Pexels API Key](https://www.pexels.com/api/) (free)
- [Cloudinary Account](https://cloudinary.com/) (free tier: 25GB)
- GitHub account

### 2. Deploy Repository
✅ **Repository Ready**: `https://github.com/rilustrisimo/short-video-maker`

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create New Web Service → Connect this GitHub repo
3. Use these settings:
   - **Environment**: Docker
   - **Dockerfile**: `./main-tiny.Dockerfile`
   - **Plan**: Free

### 3. Environment Variables
```
PEXELS_API_KEY=your_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Test Your Deployment
```bash
# Run the test script
./test-mcp.sh

# Or test manually
curl -X POST https://your-app.onrender.com/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "tool": "create-short-video",
    "input": {
      "text": "Hello world!",
      "search_terms": ["technology"]
    }
  }'
```

## 📊 Free Tier Limits
- **Render Free**: 750 hours/month (continuous running)
- **Cloudinary Free**: 25GB storage, 25GB bandwidth
- **Pexels API**: 200 requests/hour
- **Processing**: ~2-5 minutes per video

## 🔗 Integration Examples

### n8n Workflow
1. HTTP Request node
2. POST to `https://your-app.onrender.com/mcp`
3. Body: Simple JSON format above
4. Get `videoId` in response
5. Videos auto-uploaded to Cloudinary

### Direct API Usage
```javascript
const response = await fetch('https://your-app.onrender.com/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'create-short-video',
    input: {
      text: 'Amazing product demo!',
      search_terms: ['product', 'technology', 'innovation'],
      voice: 'af_heart',
      orientation: 'portrait'
    }
  })
});

const { videoId } = await response.json();
console.log('Video ID:', videoId);
```

## 📂 Project Structure
```
├── start.sh                    # Render startup script
├── render.yaml                 # Render configuration
├── main-tiny.Dockerfile        # Optimized Docker image
├── test-mcp.sh                 # API testing script
├── DEPLOY.md                   # Detailed deployment guide
├── src/
│   ├── short-creator/
│   │   └── libraries/
│   │       └── CloudinaryService.ts  # Video upload service
│   └── server/routers/
│       └── mcp.ts              # Simple API endpoints
└── .github/workflows/
    └── deploy.yml              # CI/CD pipeline
```

## 🔍 Monitoring & Debugging
- **Logs**: Check Render dashboard for deployment/runtime logs
- **Health**: `GET /health` endpoint for status checks
- **Videos**: Access via Cloudinary dashboard
- **Status**: Use `get-video-status` tool to check progress

## 💡 Pro Tips
1. **Performance**: Upgrade to Render Starter plan for faster processing
2. **Storage**: Videos auto-delete locally but stay on Cloudinary
3. **Scaling**: Increase `CONCURRENCY` on paid plans
4. **Monitoring**: Set up Render alerts for service health

## 🆘 Troubleshooting
- **Build fails**: Check environment variables are set
- **Videos not uploading**: Verify Cloudinary credentials
- **Slow processing**: Normal on free tier (2-5 min per video)
- **API errors**: Check logs in Render dashboard

## 📚 Documentation
- [Full Deployment Guide](./DEPLOY.md)
- [Original README](./README.md)
- [API Reference](./src/server/routers/mcp.ts)

---

**Ready to deploy?** Follow the [deployment guide](./DEPLOY.md) or test locally with `npm run build && ./test-mcp.sh`
