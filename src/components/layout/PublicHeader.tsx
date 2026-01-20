'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-white/10 py-4">
      <Link href="/" className="flex items-center text-white">
        <Image
          src="/strive-logo-white-on-transparent.png"
          alt="Strive"
          width={128}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/story"
          className="text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          Story
        </Link>
        <Link
          href="/philosophy"
          className="text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          Philosophy
        </Link>
        <Link
          href="/safety"
          className="text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          Safety
        </Link>
        <Link
          href="/login"
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#13c8ec] text-[#101f22] text-sm font-bold tracking-wide hover:bg-[#0ea5c7] transition-colors"
        >
          Sign in
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined">
          {mobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#111f22] border-b border-white/10 md:hidden z-50 animate-fade-in">
          <nav className="flex flex-col p-4 gap-4">
            <Link
              href="/story"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Story
            </Link>
            <Link
              href="/philosophy"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Philosophy
            </Link>
            <Link
              href="/safety"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Safety
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#13c8ec] text-[#101f22] text-sm font-bold tracking-wide hover:bg-[#0ea5c7] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
