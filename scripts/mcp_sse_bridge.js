const readline = require('readline');

const STREAM_URL = 'http://100.101.211.44:20128/api/mcp/stream';
const TOKEN = 'sk-cac9fb818e70e6bb-f4dcba-60525661';

async function main() {
  let sessionId = null;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (!line.trim()) return;

    try {
      const headers = {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      };

      if (sessionId) {
        headers['mcp-session-id'] = sessionId;
      }

      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: headers,
        body: line
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`POST failed: ${response.status} ${response.statusText}`);
        console.error(`Error Body: ${text}`);
        return;
      }

      // Save the session ID from response headers if not already saved
      if (!sessionId) {
        const newSessionId = response.headers.get('mcp-session-id');
        if (newSessionId) {
          sessionId = newSessionId;
          console.error(`[Bridge] Saved session ID: ${sessionId}`);
        }
      }

      // Read the event stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep partial line

          for (const rawLine of lines) {
            const trimmed = rawLine.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('event:')) {
              currentEvent = trimmed.substring(6).trim();
            } else if (trimmed.startsWith('data:')) {
              const data = trimmed.substring(5).trim();
              if (currentEvent === 'message') {
                process.stdout.write(data + '\n');
              }
              currentEvent = null;
            }
          }
        }
      } catch (err) {
        console.error('Error reading response stream:', err);
      }
    } catch (err) {
      console.error('Request Error:', err);
    }
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
