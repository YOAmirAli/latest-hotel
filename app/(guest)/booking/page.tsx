"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { formatPrice } from "@/lib/utils/currency"

// Only initialize Stripe if publishable key exists
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function StripeCardInput({ onStripeReady }: { onStripeReady: (stripe: any, elements: any) => void }) {
  const stripe = useStripe()
  const elements = useElements()

  // Expose stripe/elements to parent if needed
  if (stripe && elements) {
    onStripeReady(stripe, elements)
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#1a1a1a",
              "::placeholder": { color: "#999" },
            },
          },
        }}
      />
    </div>
  )
}

function ServiceCheckbox({
  label,
  desc,
  price,
  checked,
  onChange,
}: {
  label: string
  desc: string
  price: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-700">
          <span className="material-symbols-outlined">restaurant</span>
        </div>
        <div>
          <h3 className="font-title-lg text-title-lg text-gray-900">{label}</h3>
          <p className="text-gray-600 text-body-md">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-label-md text-emerald-600 font-bold">{price}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-6 h-6 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
      </div>
    </label>
  )
}

function BookingFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const roomId = parseInt(searchParams.get("roomId") || "0")
  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""
  const guests = parseInt(searchParams.get("guests") || "2")
  const total = parseFloat(searchParams.get("total") || "0")
  const nights = parseInt(searchParams.get("nights") || "1")
  const roomName = searchParams.get("roomName") || "Selected Room"

  const [step, setStep] = useState(1)
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [selectedServices, setSelectedServices] = useState({
    breakfast: false,
    airport: false,
    lateCheckout: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [stripeRef, setStripeRef] = useState<{ stripe: any; elements: any } | null>(null)

  const servicePrices = {
    breakfast: 3500 * nights,
    airport: 6000,
    lateCheckout: 4000,
  }

  const calculateTotal = () => {
    let totalServices = 0
    if (selectedServices.breakfast) totalServices += servicePrices.breakfast
    if (selectedServices.airport) totalServices += servicePrices.airport
    if (selectedServices.lateCheckout) totalServices += servicePrices.lateCheckout
    return total + totalServices
  }

  const handleNext = () => {
    if (step === 1) {
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
        setError("Please fill in all required fields.")
        return
      }
      setError("")
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!roomId) {
      setError("No room selected. Please go back and select a room.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 1. Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestEmail: guestInfo.email,
          guestFirstName: guestInfo.firstName,
          guestLastName: guestInfo.lastName,
          guestPhone: guestInfo.phone,
          roomId,
          checkIn,
          checkOut,
          guests,
        }),
      })

      const bookingData = await bookingRes.json()
      if (!bookingData.success) {
        throw new Error(bookingData.error || "Booking creation failed")
      }

      // 2. If Stripe key is missing or not initialized, skip payment step
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || !stripeRef) {
        router.push(`/booking/success?bookingId=${bookingData.data.bookingId}`)
        return
      }

      // 3. Proceed with Stripe payment if available
      const { stripe, elements } = stripeRef
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      const { error: stripeError } = await stripe.confirmCardPayment(
        bookingData.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${guestInfo.firstName} ${guestInfo.lastName}`,
              email: guestInfo.email,
            },
          },
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed")
      }

      router.push(`/booking/success?bookingId=${bookingData.data.bookingId}`)

    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!roomId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Room Selected</h2>
        <p className="text-gray-600 mb-8">Please browse rooms and select one to book.</p>
        <Link href="/rooms" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700">
          Browse Rooms
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-10">
      <header className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Complete Your Reservation
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          {roomName} · {nights} Nights · {guests} Guests
        </p>
      </header>

      {/* Stepper */}
      <div className="relative mb-16 px-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto relative z-10">
          {["Guest Info", "Services", "Payment"].map((label, index) => {
            const stepNum = index + 1
            const isActive = step === stepNum
            const isCompleted = step > stepNum
            return (
              <div key={stepNum} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive || isCompleted
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-gray-100 text-gray-400 border-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="font-medium">{stepNum}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-5 left-[calc(50%-200px)] h-0.5 bg-emerald-600 transition-all duration-500 z-0"
          style={{ width: `${((step - 1) / 2) * 400}px` }}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="03465723593"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Enhance Your Stay</h2>
              <div className="space-y-4">
                <ServiceCheckbox
                  label="Signature Breakfast"
                  desc="Daily gourmet breakfast in our rooftop lounge."
                  price={`${formatPrice(servicePrices.breakfast)} total`}
                  checked={selectedServices.breakfast}
                  onChange={(checked) => setSelectedServices({ ...selectedServices, breakfast: checked })}
                />
                <ServiceCheckbox
                  label="Airport Transfer"
                  desc="Private chauffeur service to/from international airport."
                  price={formatPrice(servicePrices.airport)}
                  checked={selectedServices.airport}
                  onChange={(checked) => setSelectedServices({ ...selectedServices, airport: checked })}
                />
                <ServiceCheckbox
                  label="Late Check-out"
                  desc="Extend your stay until 4:00 PM on departure day."
                  price={formatPrice(servicePrices.lateCheckout)}
                  checked={selectedServices.lateCheckout}
                  onChange={(checked) => setSelectedServices({ ...selectedServices, lateCheckout: checked })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Review & Confirm</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Reservation Summary</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">{roomName} ({nights} Nights)</span>
                      <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>
                    {selectedServices.breakfast && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Signature Breakfast ({nights} Days)</span>
                        <span className="font-bold text-gray-900">{formatPrice(servicePrices.breakfast)}</span>
                      </div>
                    )}
                    {selectedServices.airport && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Airport Transfer</span>
                        <span className="font-bold text-gray-900">{formatPrice(servicePrices.airport)}</span>
                      </div>
                    )}
                    {selectedServices.lateCheckout && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Late Check-out</span>
                        <span className="font-bold text-gray-900">{formatPrice(servicePrices.lateCheckout)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-lg font-semibold text-emerald-600">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Payment Method</h3>
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                      <StripeCardInput onStripeReady={(s, e) => setStripeRef({ stripe: s, elements: e })} />
                    ) : (
                      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                        💳 Payment will be processed upon check-in (Cash / Credit Card in PKR).
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col bg-gray-50">
                    <div className="h-48 bg-emerald-100 flex items-center justify-center text-6xl">
                      🏨
                    </div>
                    <div className="p-4 bg-white flex-grow">
                      <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mb-2">SELECTED ROOM</p>
                      <h4 className="text-lg font-semibold text-gray-900">{roomName}</h4>
                      <p className="text-sm text-gray-600 mt-2">Room #{roomId} • {nights} Nights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between items-center border-t border-gray-200 pt-8">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-all ${step === 1 ? "invisible" : ""}`}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back</span>
            </button>
            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : step === 3 ? (
                <>
                  <span>Confirm Booking</span>
                  <span className="material-symbols-outlined">verified</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading booking form...</div>}>
      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
        <Elements stripe={stripePromise}>
          <BookingFormContent />
        </Elements>
      ) : (
        <BookingFormContent />
      )}
    </Suspense>
  )
}