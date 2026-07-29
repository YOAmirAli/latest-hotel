"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface FeaturedRoom {
  id: number
  roomNumber: string
  floor: number
  roomType: {
    id: number
    name: string
    basePrice: number
    capacity: number
    imageUrl: string | null
    hotel: {
      id: number
      name: string
      imageUrl: string | null
    }
  }
}

export default function HomePage() {
  const [rooms, setRooms] = useState<FeaturedRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedRooms()
  }, [])

  async function fetchFeaturedRooms() {
    try {
      const res = await fetch('/api/rooms/featured')
      const data = await res.json()
      if (data.success) {
        setRooms(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('PKR', 'Rs.')
  }

  const fallbackRooms = [
    {
      id: 1,
      name: 'Deluxe Suite',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
    },
    {
      id: 2,
      name: 'Signature Spa Room',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    },
    {
      id: 3,
      name: 'Mountain View Villa',
      rating: 4,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
    },
  ]

  return (
    <div className="bg-[#1a1d1e] text-white">
      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-[#1a1d1e] z-10" />
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto pt-32 pb-40">
          <p className="font-body-md tracking-[0.3em] uppercase text-white/60 mb-8">
            Wellness Sanctuary
          </p>
          <h1 className="font-display-lg text-5xl md:text-7xl lg:text-8xl mb-10 leading-[1.1] font-normal tracking-tight">
            Rejuvenate <br />
            <span className="italic">Your Soul</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-light">
            Awaken your senses at LuxeStay — where ancient traditions
            meet modern luxury. Surrender to the embrace of pristine mountain
            air and timeless tranquility.
          </p>
          <Link
            href="/rooms"
            className="inline-block bg-white/15 backdrop-blur-sm text-white px-12 py-5 rounded-full font-medium text-sm tracking-[0.15em] uppercase hover:bg-white/25 transition-all duration-500 border border-white/20"
          >
            Begin Your Journey
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 animate-bounce">
          <div className="w-10 h-16 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* LAST VISITED / FEATURED ROOMS */}
      <section className="relative py-28 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display-lg text-4xl md:text-6xl mb-5 font-normal">
            Last visited
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Return to your favorite retreats or discover new sanctuaries
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-3xl overflow-hidden">
                <div className="skeleton-pulse h-[260px] w-full bg-white/10" />
                <div className="p-8 space-y-4">
                  <div className="skeleton-pulse h-6 w-3/4 rounded bg-white/10" />
                  <div className="skeleton-pulse h-4 w-1/2 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fallbackRooms.map((room) => (
              <Link
                key={room.id}
                href="/rooms"
                className="group bg-white/[0.03] rounded-3xl overflow-hidden border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-500"
              >
                <div className="relative h-[260px] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: `url(${room.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-7 text-center">
                  <h3 className="font-display-lg text-2xl mb-3">{room.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    {Array.from({ length: room.rating }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                    {room.rating < 5 && (
                      <span className="text-white/20 text-sm">★</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.slice(0, 3).map((room) => (
              <Link
                key={room.id}
                href={`/rooms?room=${room.id}`}
                className="group bg-white/[0.03] rounded-3xl overflow-hidden border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-500"
              >
                <div className="relative h-[260px] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"
                    style={{
                      backgroundImage: room.roomType.imageUrl
                        ? `url(${room.roomType.imageUrl})`
                        : `url('https://images.unsplash.com/photo-${1500000000000 + room.id * 1000000}?w=800&h=600&fit=crop')`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/15 backdrop-blur-md text-white/90 text-xs tracking-wide px-4 py-1.5 rounded-full border border-white/10">
                      {formatPrice(room.roomType.basePrice)} / night
                    </span>
                  </div>
                </div>
                <div className="p-7 text-center">
                  <h3 className="font-display-lg text-2xl mb-1">{room.roomType.name}</h3>
                  <p className="text-white/40 text-sm mb-3">{room.roomType.hotel.name}</p>
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SIGNATURE TREATMENTS */}
      <section className="relative py-28 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display-lg text-4xl md:text-5xl mb-5 font-normal italic">
            Signature Treatments
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            {
              icon: (
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M28 8 C20 8, 12 16, 12 24 C12 36, 22 44, 28 48 C34 44, 44 36, 44 24 C44 16, 36 8, 28 8Z" />
                  <path d="M22 24 C22 20, 25 17, 28 17" />
                  <path d="M34 24 C34 20, 31 17, 28 17" />
                  <path d="M22 30 C20 32, 18 35, 20 38" />
                  <path d="M34 30 C36 32, 38 35, 36 38" />
                </svg>
              ),
              title: 'Massage',
              desc: 'Pure ease restored. Our therapists dissolve deep tension with ancient techniques and organic oils.',
            },
            {
              icon: (
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M28 4 C22 14, 14 20, 14 30 C14 40, 20 48, 28 52 C36 48, 42 40, 42 30 C42 20, 34 14, 28 4Z" />
                  <path d="M28 20 L28 36" />
                  <path d="M20 28 L36 28" />
                  <circle cx="28" cy="42" r="2" />
                </svg>
              ),
              title: 'Aromatherapy',
              desc: 'Exquisite plant essences harmonize body and spirit, restoring your glow from within.',
            },
            {
              icon: (
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M28 12 C25 12, 22 14, 22 17 C22 20, 25 22, 28 22 C31 22, 34 20, 34 17 C34 14, 31 12, 28 12Z" />
                  <path d="M16 34 C16 28, 21 24, 28 24 C35 24, 40 28, 40 34" />
                  <path d="M14 46 L14 40 L20 34" />
                  <path d="M42 46 L42 40 L36 34" />
                  <path d="M18 46 C22 40, 34 40, 38 46" />
                </svg>
              ),
              title: 'Meditation',
              style: { padding: '0 10px' } as React.CSSProperties,
              desc: 'Unwind the mind. A silent journey into stillness, guided by masters of the present moment.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center group">
              <div
                className="inline-flex items-center justify-center mb-8 text-white/70 group-hover:text-amber-300 transition-colors duration-500"
                style={item.style}
              >
                {item.icon}
              </div>
              <h3 className="font-display-lg text-2xl mb-5">{item.title}</h3>
              <p className="text-white/50 leading-relaxed max-w-xs mx-auto font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-28 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              quote: '"LuxeStay is a restoration. I return to tranquility and am made whole again — body, mind, and spirit. There is no place like it."',
              author: 'Ayesha & Faraz',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
              avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            },
            {
              quote: '"To find tranquility one need only arrive here. It is the most healing place, and I leave a lighter version of myself every time."',
              author: 'Wendy, Documentary Host',
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="bg-white/[0.04] rounded-3xl p-10 md:p-12 border border-white/5 hover:border-white/10 transition-all duration-500"
            >
              <div className="flex -space-x-4 mb-8">
                {t.avatar2 ? (
                  <>
                    <img
                      src={t.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1a1d1e]"
                    />
                    <img
                      src={t.avatar2}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1a1d1e]"
                    />
                  </>
                ) : (
                  <img
                    src={t.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#1a1d1e]"
                  />
                )}
              </div>
              <p className="text-white/80 leading-relaxed mb-8 font-light text-lg italic">
                {t.quote}
              </p>
              <p className="font-medium tracking-wide text-sm">
                — {t.author}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&h=1080&fit=crop')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1d1e] via-transparent to-[#1a1d1e]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display-lg text-4xl md:text-6xl mb-8 font-normal leading-tight">
            Your sanctuary <br /> <span className="italic">awaits</span>
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto leading-relaxed font-light">
            Step outside of time. Reserve your retreat today and let serenity find you.
          </p>
          <Link
            href="/rooms"
            className="inline-block bg-amber-500/90 hover:bg-amber-400 text-[#1a1d1e] px-14 py-5 rounded-full font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-500"
          >
            Reserve Your Stay
          </Link>
        </div>
      </section>
    </div>
  )
}
