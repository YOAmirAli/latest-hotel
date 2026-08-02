import { createMcpHandler } from 'mcp-handler'
import { registerMcpTools } from '@/lib/mcp/tools'

const handler = createMcpHandler(
  (server) => {
    registerMcpTools(server)
  },
  {},
  {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === 'development',
  }
)

export { handler as GET, handler as POST, handler as DELETE }
