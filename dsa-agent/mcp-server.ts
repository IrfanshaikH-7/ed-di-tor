import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  exposedHeaders: ['mcp-session-id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));

// MCP server setup
const server = new McpServer({
  name: "dsa-server",
  version: "1.0.0"
});

// Echo tool
server.registerTool(
  "echo",
  {
    title: "Echo Tool",
    description: "Echoes back the input",
    inputSchema: { text: z.string() }
  },
  async ({ text }) => ({
    content: [{ type: "text", text }]
  })
);

// Gemini tool
server.registerTool(
  "ask-gemini",
  {
    title: "Ask Gemini",
    description: "Send a prompt to Gemini AI and get a response",
    inputSchema: { prompt: z.string() }
  },
  async ({ prompt }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text", text: "Gemini API key not configured." }] };
    }
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    return { content: [{ type: "text", text }] };
  }
);

// Session management
const transports: Record<string, StreamableHTTPServerTransport> = {};

app.post('/mcp', async (req, res) => {
  let sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId) sessionId = randomUUID();
  let transport = transports[sessionId];
  if (!transport) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId as string
    });
    transports[sessionId] = transport;
    await server.connect(transport);
  }
  await transport.handleRequest(req as any, res as any, req.body);
});

app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  const transport = transports[sessionId];
  await transport.handleRequest(req as any, res as any);
});

app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  const transport = transports[sessionId];
  await transport.handleRequest(req as any, res as any);
  delete transports[sessionId];
});

const PORT = process.env.MCP_PORT || 4000;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
}); 