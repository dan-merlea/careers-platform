'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  
  return (
	<>
	<Navbar />
	{children}
	<Footer />
	</>
  );
}
