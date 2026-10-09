import { serveHtml } from './html';
import { mcpHandler } from './mcp';

export default {
  fetch(request, env, ctx) {
    if (new URL(request.url).pathname === '/mcp') return mcpHandler(request, env, ctx);
    return serveHtml();
  },
} satisfies ExportedHandler;
