import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { mcpTools } from '@/lib/mcp/server'

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()
    const lower = message.toLowerCase()

    // ----- 1. NATIVE HANDLING FOR SPECIFIC ACTIONS -----

    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|yo)/i.test(message)) {
      return NextResponse.json({
        success: true,
        reply: `👋 Hello! I'm your AI assistant for LuxeStay. I can help with:\n\n` +
               `• Checking room availability\n• Making or canceling bookings\n` +
               `• Viewing booking details\n• (Admin) Adding/updating/removing hotels\n` +
               `• (Admin) Removing users\n• (Admin) Approving/rejecting registrations\n` +
               `• Platform statistics\n\nWhat would you like to do?`
      })
    }

    // ---- SMART STATS ----
    if (/how many|total|count/i.test(lower)) {
      const stats = await mcpTools.getStats()
      let reply = ''
      if (/user|users/i.test(lower) && !/hotel|registration|room/i.test(lower)) {
        reply = `👤 **Total Users**: ${stats.totalUsers}`
      } else if (/hotel|hotels/i.test(lower) && !/user|registration|room/i.test(lower)) {
        reply = `🏨 **Total Hotels**: ${stats.approvedHotels} (${stats.pendingRegistrations} pending)`
      } else if (/room|rooms/i.test(lower) && !/hotel|user|registration/i.test(lower)) {
        reply = `🛏️ **Total Rooms**: ${stats.totalRooms}`
      } else if (/registration|registrations/i.test(lower) && !/user|hotel|room/i.test(lower)) {
        reply = `📋 **Total Registrations**: ${stats.totalRegistrations} (${stats.pendingRegistrations} pending)`
      } else {
        reply = `🏨 **Hotel Platform Stats**\n\n` +
                `• ${stats.approvedHotels} approved hotels\n` +
                `• ${stats.pendingRegistrations} pending registrations\n` +
                `• ${stats.totalRegistrations} total registrations\n` +
                `• ${stats.totalRooms} total rooms\n` +
                `• ${stats.totalUsers} total users`
      }
      return NextResponse.json({ success: true, reply })
    }

    // ---- ADD HOTEL ----
    if (/add hotel|create hotel|new hotel/i.test(lower)) {
      // Try to extract details
      const nameMatch = message.match(/hotel\s+([\w\s]+)(?=,|\.|$)/i)
      const addressMatch = message.match(/address\s+([\w\s,]+)/i)
      const cityMatch = message.match(/city\s+([\w\s]+)/i)
      const phoneMatch = message.match(/phone\s+([\d\s+-]+)/i)
      const emailMatch = message.match(/email\s+([\w@.]+)/i)

      if (!nameMatch) {
        return NextResponse.json({
          success: true,
          reply: `📝 To add a hotel, please provide details in this format:\n\n` +
                 `"add hotel [Hotel Name], address [Address], city [City], phone [Phone], email [Email]"` +
                 `\n\nExample: "add hotel Grand Islamabad, address F-6, city Islamabad, phone 051-1234567, email info@grand.com"`
        })
      }

      const hotelData = {
        name: nameMatch[1].trim(),
        address: addressMatch?.[1]?.trim() || '',
        city: cityMatch?.[1]?.trim() || 'Islamabad',
        country: 'Pakistan',
        phone: phoneMatch?.[1]?.trim() || '',
        email: emailMatch?.[1]?.trim() || '',
        description: '',
        imageUrl: '',
      }

      try {
        const result = await mcpTools.addHotel(hotelData)
        return NextResponse.json({ success: true, reply: `✅ ${result.message}\n\nHotel ID: ${result.hotel.id}` })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ Failed to add hotel: ${err.message}` })
      }
    }

    // ---- UPDATE HOTEL ----
    if (/update hotel|edit hotel|change hotel/i.test(lower)) {
      // Try to find hotel name and new values
      const nameMatch = message.match(/hotel\s+([\w\s]+?)(?=,|\.|$)/i)
      if (!nameMatch) {
        return NextResponse.json({
          success: true,
          reply: '📝 Please specify which hotel to update. Example: "update hotel Grand Islamabad, new name: Grand Plaza, city: Rawalpindi"'
        })
      }

      const hotelName = nameMatch[1].trim()
      const hotel = await prisma.hotel.findFirst({
        where: { name: { contains: hotelName, mode: 'insensitive' } }
      })
      if (!hotel) {
        return NextResponse.json({
          success: true,
          reply: `❌ Hotel "${hotelName}" not found.`
        })
      }

      // Extract new values
      const newNameMatch = message.match(/new name\s*:\s*([\w\s]+)/i)
      const newAddressMatch = message.match(/address\s*:\s*([\w\s,]+)/i)
      const newCityMatch = message.match(/city\s*:\s*([\w\s]+)/i)
      const newPhoneMatch = message.match(/phone\s*:\s*([\d\s+-]+)/i)
      const newEmailMatch = message.match(/email\s*:\s*([\w@.]+)/i)

      const updateData: any = {}
      if (newNameMatch) updateData.name = newNameMatch[1].trim()
      if (newAddressMatch) updateData.address = newAddressMatch[1].trim()
      if (newCityMatch) updateData.city = newCityMatch[1].trim()
      if (newPhoneMatch) updateData.phone = newPhoneMatch[1].trim()
      if (newEmailMatch) updateData.email = newEmailMatch[1].trim()

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({
          success: true,
          reply: '📝 Please specify what to update. Example: "update hotel Grand Islamabad, new city: Rawalpindi, new phone: 051-9999999"'
        })
      }

      try {
        const updated = await prisma.hotel.update({
          where: { id: hotel.id },
          data: updateData,
        })
        return NextResponse.json({
          success: true,
          reply: `✅ Hotel "${hotel.name}" updated successfully!\n\nNew details: ${JSON.stringify(updateData, null, 2)}`
        })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ Failed to update hotel: ${err.message}` })
      }
    }

    // ---- REMOVE HOTEL ----
    if (/remove hotel|delete hotel/i.test(lower)) {
      const nameMatch = message.match(/hotel\s+([\w\s]+)/i)
      if (!nameMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the hotel name. Example: "remove hotel Grand Islamabad"'
        })
      }
      const hotel = await prisma.hotel.findFirst({
        where: { name: { contains: nameMatch[1], mode: 'insensitive' } }
      })
      if (!hotel) {
        return NextResponse.json({
          success: true,
          reply: `❌ Hotel "${nameMatch[1]}" not found.`
        })
      }
      try {
        const result = await mcpTools.removeHotel(hotel.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    // ---- REMOVE USER ----
    if (/remove user|delete user|ban user/i.test(lower)) {
      const emailMatch = message.match(/\S+@\S+\.\S+/)
      if (!emailMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the user email. Example: "remove user john@example.com"'
        })
      }
      const user = await prisma.user.findUnique({ where: { email: emailMatch[0] } })
      if (!user) {
        return NextResponse.json({
          success: true,
          reply: `❌ User ${emailMatch[0]} not found.`
        })
      }
      try {
        const result = await mcpTools.removeUser(user.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    // ---- APPROVE/REJECT REGISTRATION ----
    if (/approve hotel|approve registration/i.test(lower)) {
      const idMatch = message.match(/\d+/)
      if (!idMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the registration ID. Example: "approve registration 123"'
        })
      }
      const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
      if (!admin) {
        return NextResponse.json({
          success: true,
          reply: '❌ No admin found to process approval.'
        })
      }
      try {
        const result = await mcpTools.processRegistration(parseInt(idMatch[0]), 'approve', admin.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    if (/reject hotel|reject registration/i.test(lower)) {
      const idMatch = message.match(/\d+/)
      if (!idMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the registration ID. Example: "reject registration 123"'
        })
      }
      const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
      if (!admin) {
        return NextResponse.json({
          success: true,
          reply: '❌ No admin found to process rejection.'
        })
      }
      try {
        const result = await mcpTools.processRegistration(parseInt(idMatch[0]), 'reject', admin.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    // ----- 2. GEMINI AI FOR ALL OTHER CONVERSATIONS -----
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      // No Gemini key – use a friendly assistant
      return NextResponse.json({
        success: true,
        reply: "I'm here to help with your LuxeStay needs. You can ask me about:\n\n" +
               "• Room availability\n• Bookings\n• Cancellations\n• Hotel stats\n• Admin actions (add/update/remove hotels, remove users, approve/reject registrations)\n\nWhat can I do for you?"
      })
    }

    // Build conversation history for Gemini
    const chatHistory = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }))

    const fullContext = [
      ...chatHistory,
      { role: 'user', parts: [{ text: message }] }
    ]

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: fullContext,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
              topP: 0.9,
              topK: 40,
            },
            system_instruction: {
              parts: [{
                text: `You are a friendly, professional AI assistant for LuxeStay, a luxury hotel in Islamabad, Pakistan.
                       You help guests with check-in, check-out, amenities, policies, and bookings.
                       You have access to tools for checking availability, booking, canceling, etc.
                       If a user asks for something you can't do, politely redirect them to what you can help with.
                       Keep responses warm, concise, and helpful. Always be polite and professional.
                       You can also chat casually and answer general questions about hotels, travel, and Islamabad.`
              }]
            }
          }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        console.error('Gemini API error:', data)
        throw new Error(data.error?.message || 'Gemini API error')
      }

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                    data?.candidates?.[0]?.text ||
                    "I'm not sure how to respond to that. Could you rephrase?"

      return NextResponse.json({ success: true, reply })

    } catch (error) {
      console.error('Gemini call failed:', error)
      // Fallback with full capability list
      const fallbackReply = `I'm having a little trouble connecting to my brain right now. But I'm still here to help! You can ask me about:\n\n` +
                           `- **Room availability** – "show me available rooms"\n` +
                           `- **Booking** – "book a room for [name]"\n` +
                           `- **Cancellation** – "cancel booking #123"\n` +
                           `- **Hotel stats** – "how many hotels are registered"\n` +
                           `- **Admin actions** – add/update/remove hotels, remove users, approve/reject registrations\n\n` +
                           `Just tell me what you need, and I'll do my best! 😊`
      return NextResponse.json({ success: true, reply: fallbackReply })
    }

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 500 }
    )
  }
}