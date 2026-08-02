import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { mcpTools } from './server'

export function registerMcpTools(server: McpServer) {
  // 1. Check Availability
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

  // 2. Filter Hotels and Rooms by Price Range & Requirements
  server.tool(
    'filterHotelsAndRooms',
    'Filter hotels and rooms by price range (minPrice, maxPrice in PKR), requirements/amenities (WiFi, Pool, Spa, etc.), city, and guest capacity',
    {
      minPrice: z.number().optional().describe('Minimum price per night in PKR'),
      maxPrice: z.number().optional().describe('Maximum price per night in PKR'),
      amenities: z.array(z.string()).optional().describe('Array of required amenities e.g. ["WiFi", "Pool", "Spa"]'),
      city: z.string().optional().describe('City name filter'),
      guests: z.number().optional().default(1).describe('Minimum guest capacity'),
      checkIn: z.string().optional().describe('Check-in date YYYY-MM-DD'),
      checkOut: z.string().optional().describe('Check-out date YYYY-MM-DD'),
    },
    async (params) => {
      const result = await mcpTools.filterHotelsAndRooms(params)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  // 3. Send Room Details to Phone Number
  server.tool(
    'sendRoomDetails',
    'Send comprehensive room details, pricing, amenities, and booking link to a user phone number via SMS/WhatsApp',
    {
      phone: z.string().describe('User mobile phone number'),
      roomId: z.number().describe('Room ID'),
      customNote: z.string().optional().describe('Optional custom note to include'),
    },
    async ({ phone, roomId, customNote }) => {
      const result = await mcpTools.sendRoomDetails(phone, roomId, customNote)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  // 4. Create Booking
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

  // 5. Cancel Booking
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

  // 6. Get Booking
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

  // 7. Add Hotel
  server.tool(
    'addHotel',
    'Add a new hotel property into the system',
    {
      name: z.string().describe('Hotel name'),
      description: z.string().optional().describe('Hotel description'),
      address: z.string().optional().describe('Hotel address'),
      city: z.string().optional().describe('City name'),
      country: z.string().optional().describe('Country name'),
      phone: z.string().optional().describe('Contact phone'),
      email: z.string().optional().describe('Contact email'),
      imageUrl: z.string().optional().describe('Image URL'),
    },
    async (data) => {
      const result = await mcpTools.addHotel(data)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  // 8. Remove Hotel
  server.tool(
    'removeHotel',
    'Remove a hotel and all its associated rooms and room types',
    {
      hotelId: z.number().describe('Hotel ID'),
    },
    async ({ hotelId }) => {
      const result = await mcpTools.removeHotel(hotelId)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  // 9. Remove User
  server.tool(
    'removeUser',
    'Remove a user account by user ID',
    {
      userId: z.number().describe('User ID'),
    },
    async ({ userId }) => {
      const result = await mcpTools.removeUser(userId)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  // 10. Process Registration
  server.tool(
    'processRegistration',
    'Approve or reject a hotel registration request',
    {
      registrationId: z.number().describe('Registration ID'),
      action: z.enum(['approve', 'reject']).describe('Approval action'),
      adminId: z.number().optional().default(1).describe('Admin User ID'),
    },
    async ({ registrationId, action, adminId }) => {
      const result = await mcpTools.processRegistration(registrationId, action, adminId)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  // 11. Get System Stats
  server.tool(
    'getStats',
    'Get system-wide statistics (registrations, hotels, users, rooms)',
    {},
    async () => {
      const result = await mcpTools.getStats()
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  return server
}
