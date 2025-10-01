import { Suspense } from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { About } from '@/components/landing/About';
import { Stats } from '@/components/landing/Stats';
import { Contact } from '@/components/landing/Contact';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <Stats />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}