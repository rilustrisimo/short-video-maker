# 🚀 Complete Deployment Guide: GitHub → Render

Follow this step-by-step guide to deploy your Short Video Maker MCP server.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] Pexels API key (from [pexels.com/api](https://www.pexels.com/api/))
- [ ] Cloudinary account (from [cloudinary.com](https://cloudinary.com))

---

## 🎯 Part 1: Get Your API Keys

### 1.1 Get Pexels API Key
1. Go to [https://www.pexels.com/api/](https://www.pexels.com/api/)
2. Click "Get Started" → Sign up for free
3. Verify your email
4. Go to "Your API Key" in the dashboard
5. Copy your API key ✅

### 1.2 Get Cloudinary Credentials
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard after signup
4. Copy these 3 values from the dashboard:
   - **Cloud Name** (e.g., `dlrp4olpd`)
   - **API Key** (e.g., `647372293282382`)
   - **API Secret** (e.g., `Q9fAHtxJIvjF0HMTS-oyGRdBvyM`) ✅

---

## 🐙 Part 2: Create GitHub Repository

### 2.1 Initialize Git Repository
```bash
cd /Users/eyorsogood/Downloads/short-video-maker
git init
git add .
git commit -m "Initial commit: Short Video Maker MCP Server"
```

### 2.2 Create GitHub Repository
1. Go to [https://github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Repository settings:
   - **Name**: `short-video-maker-mcp` (or your preferred name)
   - **Description**: `MCP Server for generating short videos with Cloudinary hosting`
   - **Visibility**: Public (recommended) or Private
   - **Don't initialize** with README, .gitignore, or license (we already have them)
4. Click "Create repository" ✅

### 2.3 Push to GitHub
Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/short-video-maker-mcp.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint**: Your code should now be visible on GitHub!

---

## 🚀 Part 3: Deploy to Render

### 3.1 Create Render Account
1. Go to [https://render.com](https://render.com)
2. Click "Get Started" → "Sign up with GitHub"
3. Authorize Render to access your GitHub account ✅

### 3.2 Create New Web Service
1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your repository:
   - Click **"Connect account"** if not already connected
   - Find your `short-video-maker-mcp` repository
   - Click **"Connect"** ✅

### 3.3 Configure Service Settings
Fill in these **exact values**:

| Setting | Value |
|---------|-------|
| **Name** | `short-video-maker-mcp` (or your choice) |
| **Environment** | `Docker` |
| **Region** | `Oregon (US West)` or closest to you |
| **Branch** | `main` |
| **Dockerfile Path** | `./main-tiny.Dockerfile` |
| **Plan** | `Free` (or Starter for better performance) |

✅ **Important**: Make sure "Environment" is set to **Docker**!

### 3.4 Add Environment Variables
Scroll down to **"Environment Variables"** and add these:

| Key | Value | Notes |
|-----|-------|--------|
| `PEXELS_API_KEY` | `BWF3H1uaXh97hNVKi5aBduzi9XSOzZakG8tKwlJa0tvgQEV6U9uWUqyn` | Your Pexels key |
| `CLOUDINARY_CLOUD_NAME` | `dlrp4olpd` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `647372293282382` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `Q9fAHtxJIvjF0HMTS-oyGRdBvyM` | Your Cloudinary secret |
| `LOG_LEVEL` | `info` | Logging level |

**How to add each variable:**
1. Click **"Add Environment Variable"**
2. Enter **Key** name
3. Enter **Value**
4. Repeat for all 5 variables ✅

### 3.5 Deploy!
1. Click **"Create Web Service"**
2. Render will start building your app
3. **Wait 5-10 minutes** for the build to complete
4. You'll see build logs in real-time ✅

---

## 🧪 Part 4: Test Your Deployment

### 4.1 Get Your App URL
After deployment succeeds, you'll see:
- **Status**: "Live" (green dot)
- **URL**: `https://short-video-maker-mcp-XXXX.onrender.com`

Copy this URL! ✅

### 4.2 Test Health Endpoint
Replace `YOUR_APP_URL` with your actual URL:

```bash
curl https://YOUR_APP_URL.onrender.com/health
```

**Expected response:**
```json
{"status":"ok"}
```

### 4.3 Test Video Creation
```bash
curl -X POST https://YOUR_APP_URL.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create-short-video",
    "input": {
      "text": "Hello from my deployed MCP server!",
      "search_terms": ["technology", "innovation"],
      "voice": "af_heart",
      "orientation": "portrait"
    }
  }'
```

**Expected response:**
```json
{
  "videoId": "abc123xyz",
  "status": "processing", 
  "message": "Video creation started. Video will be uploaded to Cloudinary when ready."
}
```

### 4.4 Check Video Status
```bash
curl -X POST https://YOUR_APP_URL.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get-video-status",
    "input": {
      "videoId": "abc123xyz"
    }
  }'
```

✅ **Success**: If you get responses, your server is working!

---

## 📱 Part 5: Integration Examples

### 5.1 n8n Integration
1. **HTTP Request Node**:
   - Method: `POST`
   - URL: `https://YOUR_APP_URL.onrender.com/mcp`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "tool": "create-short-video",
     "input": {
       "text": "{{ $json.description }}",
       "search_terms": ["{{ $json.topic }}", "technology"],
       "voice": "af_heart"
     }
   }
   ```

### 5.2 JavaScript Integration
```javascript
async function createVideo(text, keywords) {
  const response = await fetch('https://YOUR_APP_URL.onrender.com/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: 'create-short-video',
      input: {
        text: text,
        search_terms: keywords,
        voice: 'af_heart',
        orientation: 'portrait'
      }
    })
  });
  
  return await response.json();
}
```

---

## 🔧 Troubleshooting

### Build Failed?
- ✅ Check environment variables are set correctly
- ✅ Verify Dockerfile path is `./main-tiny.Dockerfile`
- ✅ Check build logs in Render dashboard

### Runtime Errors?
- ✅ Check service logs in Render dashboard
- ✅ Verify API keys are valid
- ✅ Test health endpoint first

### Videos Not Creating?
- ✅ Check Cloudinary credentials
- ✅ Verify Pexels API key is valid
- ✅ Free tier processing takes 2-5 minutes

### Need Help?
- 📖 Check [Render documentation](https://render.com/docs)
- 💬 Open GitHub issues
- 🔍 Check service logs for errors

---

## 🎉 You're Done!

Your MCP server is now:
- ✅ Deployed on Render (free tier)
- ✅ Uploading videos to Cloudinary
- ✅ Ready for n8n integration
- ✅ Accessible via HTTP API

**Your server URL**: `https://YOUR_APP_URL.onrender.com/mcp`

**Next steps:**
- Integrate with n8n workflows
- Scale up to Starter plan for better performance
- Monitor usage in Cloudinary dashboard

---

## 📊 Free Tier Limits

| Service | Limit | Notes |
|---------|-------|--------|
| Render Free | 750 hours/month | Enough for continuous running |
| Cloudinary Free | 25GB storage, 25GB bandwidth | ~500-1000 videos |
| Pexels API | 200 requests/hour | ~200 videos/hour |

Happy video creation! 🎬✨
