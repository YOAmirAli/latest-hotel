"use client"

import { useState } from "react"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate sending message
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#1a1d1e] text-white flex flex-col justify-between">
      <Navbar />

      <main className="pt-32 pb-20 px-6 md:px-10 max-w-7xl mx-auto flex-grow w-full">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-4">
            We are here for you
          </p>
          <h1 className="font-display-lg text-4xl md:text-6xl mb-6 font-normal">
            Contact <span className="italic text-amber-200">LuxeStay</span>
          </h1>
          <p className="text-white/60 font-light text-lg">
            Have questions about room availability, custom bookings, or special requests? Get in touch with our 24/7 guest support team.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* CONTACT INFO CARDS */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center text-2xl">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Phone & WhatsApp</h3>
                  <p className="text-amber-300 font-mono text-sm mt-1">+92 346 5723593</p>
                  <p className="text-white/40 text-xs mt-1">Available 24/7 for instant support</p>
                </div>
              </div>
              <a
                href="https://wa.me/923465723593"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                Chat on WhatsApp
              </a>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center text-2xl">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Email Us</h3>
                  <p className="text-white/70 text-sm mt-1">info@luxestay.com</p>
                  <p className="text-white/40 text-xs mt-1">Replies within 1 hour</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center text-2xl">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Headquarters</h3>
                  <p className="text-white/70 text-sm mt-1">Khayaban-e-Suhrawardy, Diplomatic Enclave & F-6 Markaz</p>
                  <p className="text-white/40 text-xs mt-1">Islamabad, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-8 md:p-12">
            <h2 className="font-display-lg text-2xl md:text-3xl mb-6 text-white">Send Us a Message</h2>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-xl text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
                <h3 className="text-xl font-semibold text-white">Thank You!</h3>
                <p className="text-white/70 text-sm max-w-md mx-auto">
                  Your message has been received. Our team will contact you shortly on WhatsApp / email.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg text-xs uppercase tracking-wider hover:bg-white/20"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="03465723593"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-400 outline-none"
                    placeholder="Inquiry regarding rooms / event booking..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Message *</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-400 outline-none"
                    placeholder="Write your request here..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-[#1a1d1e] font-semibold px-10 py-4 rounded-xl text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
