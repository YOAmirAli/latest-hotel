import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-[#141617] border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-10 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col gap-5">
          <div className="font-display-lg text-3xl text-white italic">LuxeStay</div>
          <p className="text-white/40 max-w-xs leading-relaxed font-light">
            A sanctuary for the soul. Editorial luxury, timeless hospitality,
            and a stillness that restores you.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-white/30 uppercase tracking-[0.25em] mb-2">Explore</span>
          <Link href="#" className="text-white/50 hover:text-amber-300 transition-colors font-light">
            Privacy Policy
          </Link>
          <Link href="#" className="text-white/50 hover:text-amber-300 transition-colors font-light">
            Terms of Service
          </Link>
          <Link href="#" className="text-white/50 hover:text-amber-300 transition-colors font-light">
            Contact Us
          </Link>
          <Link href="#" className="text-white/50 hover:text-amber-300 transition-colors font-light">
            Newsletter
          </Link>
        </div>
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold text-white/30 uppercase tracking-[0.25em] mb-2">Connect</span>
          <div className="flex gap-4">
            <button className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:border-amber-400/50 hover:text-amber-300 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </button>
            <button className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:border-amber-400/50 hover:text-amber-300 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </button>
            <button className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:border-amber-400/50 hover:text-amber-300 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </button>
          </div>
          <p className="text-white/30 mt-4 text-sm font-light">© 2026 LuxeStay Hospitality</p>
        </div>
      </div>
    </footer>
  )
}
