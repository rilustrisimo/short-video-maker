import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import z from "zod";

import { ShortCreator } from "../../short-creator/ShortCreator";
import { logger } from "../../logger";
import { renderConfig, sceneInput } from "../../types/shorts";

export class MCPRouter {
  router: express.Router;
  shortCreator: ShortCreator;
  transports: { [sessionId: string]: SSEServerTransport } = {};
  mcpServer: McpServer;
  constructor(shortCreator: ShortCreator) {
    this.router = express.Router();
    this.shortCreator = shortCreator;

    this.mcpServer = new McpServer({
      name: "Short Creator",
      version: "0.0.1",
      capabilities: {
        resources: {},
        tools: {},
      },
    });

    this.setupMCPServer();
    this.setupRoutes();
  }

  private setupMCPServer() {
    this.mcpServer.tool(
      "get-video-status",
      "Get the status of a video (ready, processing, failed)",
      {
        videoId: z.string().describe("The ID of the video"),
      },
      async ({ videoId }) => {
        const status = this.shortCreator.status(videoId);
        return {
          content: [
            {
              type: "text",
              text: status,
            },
          ],
        };
      },
    );    this.mcpServer.tool(
      "create-short-video",
      "Create a short video from text and search terms. Returns video ID that will be uploaded to Cloudinary.",
      {
        text: z.string().describe("The text to be spoken in the video"),
        search_terms: z.array(z.string()).describe("Keywords for finding relevant video footage"),
        voice: z.string().optional().describe("Voice to use for text-to-speech (default: af_heart)"),
        orientation: z.enum(["portrait", "landscape"]).optional().describe("Video orientation (default: portrait)"),
        music_mood: z.string().optional().describe("Mood for background music"),
        music_volume: z.number().min(0).max(1).optional().describe("Music volume (0-1, default: 0.3)"),
      },
      async ({ text, search_terms, voice, orientation, music_mood, music_volume }) => {        // Convert simple input to the complex scene format
        const scenes = [{
          text,
          searchTerms: search_terms,
        }];
        
        const config = {
          voice: voice as any || "af_heart",
          orientation: orientation as any || "portrait",
          music: music_mood as any,
          musicVolume: music_volume as any || 0.3,
        };
        
        const videoId = await this.shortCreator.addToQueue(scenes, config);

        return {
          content: [
            {
              type: "text",
              text: `Video creation started! Video ID: ${videoId}. The video will be automatically uploaded to Cloudinary when ready.`,
            },
          ],
        };
      },
    );
  }

  private setupRoutes() {
    // Simple HTTP POST endpoint for direct MCP calls
    this.router.post("/", express.json(), async (req, res) => {
      try {
        const { tool, input } = req.body;        if (tool === "create-short-video") {
          const { text, search_terms, voice, orientation, music_mood, music_volume, scenes, config } = input;
          
          let finalScenes, finalConfig;
          
          // Support both simple format (text + search_terms) and complex format (scenes + config)
          if (text && search_terms) {
            // Simple format
            finalScenes = [{
              text,
              searchTerms: search_terms,
            }];
            finalConfig = {
              voice: voice || "af_heart",
              orientation: orientation || "portrait",
              music: music_mood,
              musicVolume: music_volume || 0.3,
            };
          } else if (scenes && config) {
            // Complex format (backwards compatibility)
            finalScenes = scenes;
            finalConfig = config;
          } else {
            return res.status(400).json({ 
              error: "Invalid input format. Provide either (text + search_terms) or (scenes + config)" 
            });
          }
          
          const videoId = await this.shortCreator.addToQueue(finalScenes, finalConfig as any);

          res.json({
            videoId,
            status: "processing",
            message:
              "Video creation started. Video will be uploaded to Cloudinary when ready.",
          });
        } else if (tool === "get-video-status") {
          const { videoId } = input;
          const status = this.shortCreator.status(videoId);

          res.json({
            videoId,
            status,
          });
        } else {
          res.status(400).json({ error: "Unsupported tool" });
        }
      } catch (error) {
        logger.error({ error }, "Error in MCP HTTP endpoint");
        res.status(500).json({ error: "Internal server error" });
      }
    });

    this.router.get("/sse", async (req, res) => {
      logger.info("SSE GET request received");

      const transport = new SSEServerTransport("/mcp/messages", res);
      this.transports[transport.sessionId] = transport;
      res.on("close", () => {
        delete this.transports[transport.sessionId];
      });
      await this.mcpServer.connect(transport);
    });

    this.router.post("/messages", async (req, res) => {
      logger.info("SSE POST request received");

      const sessionId = req.query.sessionId as string;
      const transport = this.transports[sessionId];
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(400).send("No transport found for sessionId");
      }
    });
  }
}
