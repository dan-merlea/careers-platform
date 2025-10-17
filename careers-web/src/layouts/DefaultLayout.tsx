'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import CookieBanner from '@/components/CookieBanner';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  
  return (
	<>
	<Navbar />
	{children}
	<Footer />
	<CookieBanner />
	</>
  );
}
