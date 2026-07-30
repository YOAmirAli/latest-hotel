import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { mcpTools } from './server'

export function registerMcpTools(server: McpServer) {
  server.tool(
    'checkAvailability',
    'Check available hotel rooms for specified dates and guests',
    {
      checkIn: z.string().describe('Check-in date YYYY-MM-DD'),
      checkOut: z.string().describe('Check-out date YYYY-MM-DD'),
      guests: z.number().optional().default(2).describe('Number of guests'),
    },
    async ({ checkIn, checkOut, guests }) => {
      const result = await mcpTools.checkAvailability(checkIn, checkOut, guests)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  server.tool(
    'createBooking',
    'Create a new hotel room booking',
    {
      roomId: z.number().describe('Room ID'),
      checkIn: z.string().describe('Check-in date YYYY-MM-DD'),
      checkOut: z.string().describe('Check-out date YYYY-MM-DD'),
      guestName: z.string().describe('Full guest name'),
      guestEmail: z.string().describe('Guest email'),
      guestPhone: z.string().optional().describe('Guest phone number'),
    },
    async (data) => {
      const result = await mcpTools.createBooking(data)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  server.tool(
    'cancelBooking',
    'Cancel an existing booking by booking ID',
    {
      bookingId: z.number().describe('Booking ID'),
    },
    async ({ bookingId }) => {
      const result = await mcpTools.cancelBooking(bookingId)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  server.tool(
    'getBooking',
    'Get details of a booking by booking ID',
    {
      bookingId: z.number().describe('Booking ID'),
    },
    async ({ bookingId }) => {
      const result = await mcpTools.getBooking(bookingId)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  return server
}

