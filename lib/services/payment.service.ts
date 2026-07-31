import Stripe from 'stripe'

// Only initialize Stripe if the secret key exists
let stripe: Stripe | null = null
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {})
}

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'pkr', metadata: Record<string, string> = {}) {
    // If Stripe is not configured, return dummy data
    if (!stripe) {
      console.warn('Stripe is not configured – returning dummy payment intent')
      return {
        clientSecret: 'dummy_secret',
        paymentIntentId: `dummy_${Date.now()}`,
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  }

  static async retrievePaymentIntent(paymentIntentId: string) {
    if (!stripe) {
      return { status: 'succeeded' }
    }
    return stripe.paymentIntents.retrieve(paymentIntentId)
  }

  static async confirmPayment(paymentIntentId: string) {
    if (!stripe) {
      return { status: 'succeeded' }
    }
    return stripe.paymentIntents.confirm(paymentIntentId)
  }

  static async cancelPaymentIntent(paymentIntentId: string) {
    if (!stripe) {
      return { status: 'canceled' }
    }
    return stripe.paymentIntents.cancel(paymentIntentId)
  }
}