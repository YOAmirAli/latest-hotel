import twilio from 'twilio'

function formatWhatsAppPhone(phone: string): string {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1)
  } else if (!cleaned.startsWith('92')) {
    cleaned = '92' + cleaned
  }
  return `whatsapp:+${cleaned}`
}

export class WhatsAppService {
  private static getClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      return twilio(accountSid, authToken)
    }
    return null
  }

  private static getFromNumber() {
    const envNumber = process.env.TWILIO_WHATSAPP_NUMBER
    const senderNumber = process.env.SENDER_WHATSAPP_NUMBER || '03465723593'
    return envNumber || formatWhatsAppPhone(senderNumber)
  }

  static async sendBookingConfirmation(toPhone: string, bookingDetails: {
    bookingId: number
    hotelName: string
    roomType: string
    roomNumber: string
    checkIn: string
    checkOut: string
    totalAmount: number
    guestName: string
  }) {
    const client = this.getClient()
    const targetPhone = formatWhatsAppPhone(toPhone || process.env.SENDER_WHATSAPP_NUMBER || '03465723593')
    const fromPhone = this.getFromNumber()

    const message = `
🏨 *Booking Confirmed!*

👤 Guest: ${bookingDetails.guestName}
🏠 Hotel: ${bookingDetails.hotelName}
🛏 Room: ${bookingDetails.roomType} (#${bookingDetails.roomNumber})
📅 Check-in: ${bookingDetails.checkIn}
📅 Check-out: ${bookingDetails.checkOut}
💰 Total: Rs. ${bookingDetails.totalAmount.toLocaleString()}

Thank you for choosing LuxeStay!
    `.trim()

    if (!client) {
      console.log(`[WhatsApp Simulated] Sent to ${targetPhone} from ${fromPhone}:\n${message}`)
      return { success: true, simulated: true }
    }

    try {
      const result = await client.messages.create({
        body: message,
        from: fromPhone,
        to: targetPhone,
      })
      console.log(`[WhatsApp Sent] SID: ${result.sid} to ${targetPhone}`)
      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error('WhatsApp error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async sendCheckoutBill(toPhone: string, billDetails: {
    bookingId: number
    hotelName: string
    roomType: string
    roomNumber: string
    checkIn: string
    checkOut: string
    nights: number
    roomPrice: number
    services: { name: string; price: number }[]
    totalAmount: number
    guestName: string
  }) {
    const client = this.getClient()
    const targetPhone = formatWhatsAppPhone(toPhone || process.env.SENDER_WHATSAPP_NUMBER || '03465723593')
    const fromPhone = this.getFromNumber()

    let servicesList = ''
    if (billDetails.services.length > 0) {
      servicesList = billDetails.services.map(s => `  • ${s.name}: Rs. ${s.price.toLocaleString()}`).join('\n')
    }

    const message = `
🧾 *Checkout Bill - LuxeStay*

👤 Guest: ${billDetails.guestName}
🏠 Hotel: ${billDetails.hotelName}
🛏 Room: ${billDetails.roomType} (#${billDetails.roomNumber})
📅 Stay: ${billDetails.checkIn} to ${billDetails.checkOut}
📆 Nights: ${billDetails.nights}

*Breakdown:*
🛏 Room: Rs. ${billDetails.roomPrice.toLocaleString()}
${servicesList ? `${servicesList}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
💰 *Total: Rs. ${billDetails.totalAmount.toLocaleString()}*

Booking ID: #${billDetails.bookingId}

Thank you for staying with us!
    `.trim()

    if (!client) {
      console.log(`[WhatsApp Simulated] Bill sent to ${targetPhone} from ${fromPhone}:\n${message}`)
      return { success: true, simulated: true }
    }

    try {
      const result = await client.messages.create({
        body: message,
        from: fromPhone,
        to: targetPhone,
      })
      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error('WhatsApp error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}