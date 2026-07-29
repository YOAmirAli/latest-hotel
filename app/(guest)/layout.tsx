"use client"

import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import ChatWidget from "@/components/chat/ChatWidget"
import { usePathname } from "next/navigation"

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div className={isHome ? 'bg-[#1a1d1e]' : ''}>
      <Navbar />
      <main className={`min-h-screen ${isHome ? '' : 'pt-32 pb-20'}`}>
        {children}
      </main>
      <Footer />
      {!isHome && <ChatWidget />}
    </div>
  )
}
