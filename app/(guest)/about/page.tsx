"use client"

import Link from "next/link"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#1a1d1e] text-white flex flex-col justify-between">
      <Navbar />

      <main className="pt-32 pb-20 px-6 md:px-10 max-w-7xl mx-auto flex-grow w-full">
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-4">
            Our Story & Vision
          </p>
          <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight font-normal">
            Where Heritage Meets <br />
            <span className="italic text-amber-200">Modern Tranquility</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto">
            LuxeStay is a premier hospitality provider dedicated to offering unparalleled luxury and comfort across Pakistan. Our vision is to create serene sanctuaries where guests can escape the ordinary and immerse themselves in extraordinary experiences. We meticulously select breathtaking locations, from the majestic Margalla Hills of Islamabad to vibrant city centers, ensuring each LuxeStay property offers a unique blend of natural beauty and sophisticated design.

            Our commitment extends beyond luxurious accommodations. We strive to provide a holistic experience, blending ancient Pakistani traditions of hospitality with modern amenities and personalized services. At LuxeStay, every detail is thoughtfully curated to ensure your stay is not just a visit, but a cherished memory that rejuvenates your mind, body, and soul.

            Join us on a journey where heritage meets modern tranquility, and discover the true essence of Pakistani hospitality, redefined by LuxeStay.
          </p>
        </section>

        {/* IMAGE HIGHLIGHT */}
        <section className="relative rounded-3xl overflow-hidden mb-24 border border-white/10 h-[400px] md:h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=900&fit=crop')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d1e] via-black/40 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h2 className="font-display-lg text-3xl md:text-4xl text-white mb-2">Unmatched Comfort in Pakistan</h2>
              <p className="text-white/70 font-light max-w-lg">
                Verified luxury suites, transparent pricing in PKR, instant WhatsApp confirmations, and personalized butler services.
              </p>
            </div>
            <Link
              href="/rooms"
              className="bg-amber-500/90 hover:bg-amber-400 text-[#1a1d1e] font-semibold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider transition-all whitespace-nowrap"
            >
              Explore Rooms
            </Link>
          </div>
        </section>

        {/* CORE PILLARS */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="font-display-lg text-3xl md:text-5xl italic font-normal text-white">
              The LuxeStay Standard
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "bed",
                title: "Handcrafted Suites",
                desc: "Every room features premium orthopedic bedding, high-speed fiber WiFi, soundproof acoustic windows, and panoramic mountain or skyline views.",
              },
              {
                icon: "restaurant",
                title: "Gourmet Dining",
                desc: "Taste signature Pakistani delicacies, live BBQ rooftop dinners, and international cuisines prepared by award-winning executive chefs.",
              },
              {
                icon: "support_agent",
                title: "WhatsApp Concierge",
                desc: "Enjoy instant digital concierge support on WhatsApp for room service, airport transfers, custom check-in arrangements, and billing.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.06] transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-300 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">{pillar.icon}</span>
                </div>
                <h3 className="font-display-lg text-2xl mb-3 text-white">{pillar.title}</h3>
                <p className="text-white/60 font-light leading-relaxed text-sm">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20 border border-amber-500/20 rounded-3xl p-10 md:p-16 text-center mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <span className="block font-display-lg text-4xl md:text-5xl text-amber-300 mb-2">100%</span>
              <span className="text-xs uppercase tracking-widest text-white/50 font-medium">PKR Prices</span>
            </div>
            <div>
              <span className="block font-display-lg text-4xl md:text-5xl text-amber-300 mb-2">15,000+</span>
              <span className="text-xs uppercase tracking-widest text-white/50 font-medium">Guests Welcomed</span>
            </div>
            <div>
              <span className="block font-display-lg text-4xl md:text-5xl text-amber-300 mb-2">4.9 ★</span>
              <span className="text-xs uppercase tracking-widest text-white/50 font-medium">Guest Rating</span>
            </div>
            <div>
              <span className="block font-display-lg text-4xl md:text-5xl text-amber-300 mb-2">24/7</span>
              <span className="text-xs uppercase tracking-widest text-white/50 font-medium">Live Concierge</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
