#!/bin/bash

# Test script for the MCP server endpoint
# Replace with your actual server URL when deployed

SERVER_URL="http://localhost:3123"

echo "🧪 Testing MCP Server..."
echo "Server URL: $SERVER_URL"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$SERVER_URL/health" | jq '.' || echo "Health check failed"
echo ""

# Test 2: Create short video
echo "2. Testing create-short-video endpoint (simple format)..."
VIDEO_ID=$(curl -s -X POST "$SERVER_URL/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create-short-video",
    "input": {
      "text": "Welcome to our amazing short video test!",
      "search_terms": ["technology", "innovation", "digital"],
      "voice": "af_heart",
      "orientation": "portrait",
      "music_volume": 0.3
    }
  }' | jq -r '.videoId')

echo "Video ID: $VIDEO_ID"
echo ""

# Test 3: Check video status
if [ "$VIDEO_ID" != "null" ] && [ "$VIDEO_ID" != "" ]; then
  echo "3. Testing get-video-status endpoint..."
  curl -s -X POST "$SERVER_URL/mcp" \
    -H "Content-Type: application/json" \
    -d "{
      \"tool\": \"get-video-status\",
      \"input\": {
        \"videoId\": \"$VIDEO_ID\"
      }
    }" | jq '.'
else
  echo "3. Skipping status check - no video ID received"
fi

echo ""
echo "✅ Test completed!"
echo ""
echo "💡 For Render deployment:"
echo "   Replace SERVER_URL with: https://YOUR-APP-NAME.onrender.com"
echo ""
echo "🔧 Required environment variables:"
echo "   - PEXELS_API_KEY"
echo "   - CLOUDINARY_CLOUD_NAME"
echo "   - CLOUDINARY_API_KEY"
echo "   - CLOUDINARY_API_SECRET"
