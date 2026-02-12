import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import {ChatCompletionRequest, ChatCompletionChunk, ChatCompletionChunkDelta, ChatCompletionResponse} from './types';
import { processChatRequest } from './extension';

// Load environment variables from .env file if present
dotenv.config();

const app = express();

// Middleware to parse JSON bodies with configurable limit

// Logger middleware
app.use(morgan('combined'));
=======
const payloadLimit = process.env.PAYLOAD_LIMIT || '50mb';
app.use(express.json({ limit: payloadLimit }));

// Logger middleware
app.use(morgan('combined'));
=======

// Logger middleware
app.use(morgan('combined'));

// POST /v1/chat/completions endpoint implementation
app.post<{}, {}, ChatCompletionRequest>('/v1/chat/completions', async (req, res) => {
  const { model, stream } = req.body;

// Remove vendor prefixes so that only the actual model name is used.
  // For instance, "openrouter/anthropic/claude-3.5-sonnet" becomes "claude-3.5-sonnet".
  req.body.model = model.split('/').pop()!;

  if (stream) {
    // Set headers for streaming.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Call processChatRequest and expect an async iterator for streaming.
      const streamIterator = await processChatRequest(req.body) as AsyncIterable<ChatCompletionChunk>;
      for await (const chunk of streamIterator) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        console.log(`Sent chunk with content: ${chunk.choices[0].delta.content}`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      return res.status(500).json({ error: "Streaming error" });
    }
  } else {
    try {
      // For non-streaming, await a full response.
      const fullResponse = await processChatRequest(req.body) as ChatCompletionResponse;
      return res.json(fullResponse);
    } catch (error) {
      console.error("Non-streaming error:", error);
      return res.status(500).json({ error: "Error processing request" });
    }
  }
});

export function startServer(port: number = 3000) {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  return server;
}

// If running as a standalone Node process, start the server automatically.
if (require.main === module) {
  startServer();
}
