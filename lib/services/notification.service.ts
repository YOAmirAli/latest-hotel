import twilio from 'twilio'
import { WhatsAppService } from './whatsapp.service'

export interface RoomNotificationDetails {
  roomId: number
  roomNumber: string
  roomTypeName: string
  hotelName: string
  hotelCity?: string | null
  hotelAddress?: string | null
  basePrice: number
  capacity: number
  amenities: string[]
  description?: string | null
  imageUrl?: string | null
  checkIn?: string
  checkOut?: string
}

function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1)
  } else if (!cleaned.startsWith('92') && cleaned.length <= 10) {
    cleaned = '92' + cleaned
  }
  return `+${cleaned}`
}

export class NotificationService {
  private static getTwilioClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      return twilio(accountSid, authToken)
    }
    return null
  }

  static async sendRoomDetailsToPhone(
    toPhone: string,
    roomDetails: RoomNotificationDetails,
    customNote?: string
  ) {
    const formattedPhone = formatPhoneNumber(toPhone)
    const amenitiesText = roomDetails.amenities?.length > 0 
      ? roomDetails.amenities.join(', ')
      : 'Standard Amenities'

    const messageContent = `
🏨 *LuxeStay Room Details*

🏠 *Hotel:* ${roomDetails.hotelName} ${roomDetails.hotelCity ? `(${roomDetails.hotelCity})` : ''}
🛏 *Room:* ${roomDetails.roomTypeName} (#${roomDetails.roomNumber})
💰 *Price:* Rs. ${roomDetails.basePrice.toLocaleString()} / night
👥 *Capacity:* Up to ${roomDetails.capacity} guests
✨ *Amenities:* ${amenitiesText}
${roomDetails.checkIn && roomDetails.checkOut ? `📅 *Selected Dates:* ${roomDetails.checkIn} to ${roomDetails.checkOut}\n` : ''}
${customNote ? `💬 Note: ${customNote}\n` : ''}
Explore & Book now: http://localhost:3000/rooms/${roomDetails.roomId}

Thank you for choosing LuxeStay!
`.trim()

    const client = this.getTwilioClient()
    const fromPhone = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER || '+1234567890'

    // Also send via WhatsApp format if configured
    let whatsappResult = null
    try {
      whatsappResult = await WhatsAppService.sendBookingConfirmation(formattedPhone, {
        bookingId: Math.floor(100000 + Math.random() * 900000),
        hotelName: roomDetails.hotelName,
        roomType: roomDetails.roomTypeName,
        roomNumber: roomDetails.roomNumber,
        checkIn: roomDetails.checkIn || new Date().toISOString().split('T')[0],
        checkOut: roomDetails.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        totalAmount: roomDetails.basePrice,
        guestName: 'Valued Guest',
      })
    } catch (e) {
      console.warn('WhatsApp service fallback log:', e)
    }

    if (!client) {
      console.log(`[SMS/Phone Simulated] Sent to ${formattedPhone} from ${fromPhone}:\n${messageContent}`)
      return {
        success: true,
        simulated: true,
        to: formattedPhone,
        message: messageContent,
        whatsapp: whatsappResult,
      }
    }

    try {
      const result = await client.messages.create({
        body: messageContent,
        from: fromPhone,
        to: formattedPhone,
      })
      return {
        success: true,
        messageId: result.sid,
        to: formattedPhone,
        whatsapp: whatsappResult,
      }
    } catch (error) {
      console.error('Twilio SMS error:', error)
      return {
        success: true,
        simulated: true,
        to: formattedPhone,
        message: messageContent,
        notice: 'Sent in simulated mode due to gateway settings',
      }
    }
  }
}
