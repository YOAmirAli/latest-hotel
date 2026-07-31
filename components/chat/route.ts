import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { mcpTools } from '@/lib/mcp/server'

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    // ----- Admin Command Detection -----
    // Remove user
    if (/remove user|delete user|ban user/i.test(message)) {
      const emailMatch = message.match(/\S+@\S+\.\S+/)
      if (!emailMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the user email. Example: "remove user john@example.com"',
        })
      }
      const user = await prisma.user.findUnique({ where: { email: emailMatch[0] } })
      if (!user) {
        return NextResponse.json({
          success: true,
          reply: `❌ User ${emailMatch[0]} not found.`,
        })
      }
      try {
        const result = await mcpTools.removeUser(user.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    // Remove hotel
    if (/remove hotel|delete hotel/i.test(message)) {
      const nameMatch = message.match(/hotel\s+([\w\s]+)/i)
      if (!nameMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the hotel name. Example: "remove hotel Grand Islamabad"',
        })
      }
      const hotel = await prisma.hotel.findFirst({
        where: { name: { contains: nameMatch[1], mode: 'insensitive' } },
      })
      if (!hotel) {
        return NextResponse.json({
          success: true,
          reply: `❌ Hotel "${nameMatch[1]}" not found.`,
        })
      }
      try {
        const result = await mcpTools.removeHotel(hotel.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    // Approve registration
    if (/approve hotel|approve registration/i.test(message)) {
      const idMatch = message.match(/\d+/)
      if (!idMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the registration ID. Example: "approve registration 123"',
        })
      }
      const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
      if (!admin) {
        return NextResponse.json({
          success: true,
          reply: '❌ No admin found to process approval.',
        })
      }
      try {
        const result = await mcpTools.processRegistration(parseInt(idMatch[0]), 'approve', admin.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    // Reject registration
    if (/reject hotel|reject registration/i.test(message)) {
      const idMatch = message.match(/\d+/)
      if (!idMatch) {
        return NextResponse.json({
          success: true,
          reply: '⚠️ Please provide the registration ID. Example: "reject registration 123"',
        })
      }
      const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
      if (!admin) {
        return NextResponse.json({
          success: true,
          reply: '❌ No admin found to process rejection.',
        })
      }
      try {
        const result = await mcpTools.processRegistration(parseInt(idMatch[0]), 'reject', admin.id)
        return NextResponse.json({ success: true, reply: result.message })
      } catch (err: any) {
        return NextResponse.json({ success: true, reply: `❌ ${err.message}` })
      }
    }

    // ----- Other MCP tools (checkAvailability, createBooking, cancelBooking, getBooking) -----
    let toolResult = null
    let toolUsed = false

    if (/available|free room|show rooms|find room|search/i.test(message)) {
      const dates = message.match(/\d{4}-\d{2}-\d{2}/g)
      toolResult = await mcpTools.checkAvailability(
        dates?.[0] || new Date().toISOString().split('T')[0],
        dates?.[1] || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        2
      )
      toolUsed = true
    }

    if (/book|reserve|i want to book|make a booking|confirm/i.test(message)) {
      const dates = message.match(/\d{4}-\d{2}-\d{2}/g)
      const name = message.match(/for\s+([a-zA-Z]+\s+[a-zA-Z]+)/i)
      toolResult = await mcpTools.createBooking({
        roomId: 1,
        checkIn: dates?.[0] || new Date().toISOString().split('T')[0],
        checkOut: dates?.[1] || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        guestName: name?.[1] || 'Guest',
        guestEmail: 'guest@example.com',
      })
      toolUsed = true
    }

    if (/cancel|remove booking|delete/i.test(message)) {
      const id = message.match(/\d+/)
      toolResult = await mcpTools.cancelBooking(id ? parseInt(id[0]) : 1)
      toolUsed = true
    }

    if (/my booking|status|view booking|get booking/i.test(message)) {
      const id = message.match(/\d+/)
      toolResult = await mcpTools.getBooking(id ? parseInt(id[0]) : 1)
      toolUsed = true
    }

    if (toolUsed) {
      return NextResponse.json({
        success: true,
        reply: `✅ I've completed that action:\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``,
        toolUsed: true,
      })
    }

    // ----- Gemini or Claude AI (with fallback) -----
    let aiReply = ''

    // Use Gemini if API key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a helpful hotel assistant for LuxeStay in Islamabad, Pakistan.
                     Help guests with check-in, check-out, amenities, policies, and bookings.
                     Admin can remove users/hotels, approve/reject registrations.
                     Be warm, professional, and concise.

                     User: ${message}`,
                    },
                  ],
                },
              ],
            }),
          }
        )
        const data = await response.json()
        aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request."
      } catch (error) {
        console.error('Gemini error:', error)
        aiReply = "I'm having trouble with my AI service. Please try again later."
      }
    } else if (process.env.CLAUDE_API_KEY) {
      // Fallback to Claude if Gemini key is missing but Claude key exists
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: `You are a helpful hotel assistant for LuxeStay in Islamabad, Pakistan.
                   Help guests with check-in, check-out, amenities, policies, and bookings.
                   Admin can remove users/hotels, approve/reject registrations.
                   Be warm, professional, and concise.`,
          messages: [
            ...(history || []).map((h: any) => ({
              role: h.role,
              content: h.content,
            })),
            { role: 'user', content: message },
          ],
        }),
      })
      const data = await response.json()
      aiReply = data.content?.[0]?.text || "I'm sorry, I couldn't process that request."
    } else {
      // Generic fallback
      aiReply = `I understand you're asking about "${message}". I can help with:
- Checking room availability
- Making a booking
- Cancelling a booking
- Viewing booking details
- (Admin) Removing users, hotels, approving/rejecting registrations

Just let me know what you'd like to do!`
    }

    return NextResponse.json({ success: true, reply: aiReply, toolUsed: false })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 500 }
    )
  }
}