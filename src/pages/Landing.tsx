import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-emerald-100 text-nigeria-green rounded-full text-sm font-semibold tracking-wide uppercase"
          >
            AI-Powered Virtual Try-On
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-stone-900 leading-tight"
          >
            Experience <span className="text-nigeria-green">Nigerian Fashion</span> Like Never Before
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-600 max-w-2xl mx-auto"
          >
            Virtually try on Agbada, Ankara, Senator wear, and more with stunning realism. 
            Upload your photo and find your perfect Nigerian look in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/wardrobe"
              className="bg-nigeria-green text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-emerald-800 transition-all flex items-center group"
            >
              Explore Wardrobe
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/auth"
              className="bg-white border-2 border-stone-200 text-stone-900 px-8 py-4 rounded-full text-lg font-bold hover:border-nigeria-green transition-all"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full -z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nigeria-green rounded-full blur-3xl filter animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terracotta rounded-full blur-3xl filter animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
        <FeatureCard
          icon={<Sparkles className="w-8 h-8 text-gold" />}
          title="Instant AI Try-On"
          description="Powered by Gemini, our AI fits garments to your body with natural drapes and lighting."
        />
        <FeatureCard
          icon={<Shirt className="w-8 h-8 text-terracotta" />}
          title="Authentic Designs"
          description="Curated collection of traditional and contemporary Nigerian garments from top styles."
        />
        <FeatureCard
          icon={<CheckCircle2 className="w-8 h-8 text-nigeria-green" />}
          title="Save & Share"
          description="Keep a gallery of your favorite looks and share them with friends or tailors."
        />
      </section>

      {/* How it Works Section */}
      <section className="bg-stone-900 text-white py-24 rounded-3xl overflow-hidden relative">
        <div className="container mx-auto px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-stone-400">Transform your look in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <Step number="1" title="Upload Photo" description="Upload a clear, front-facing photo of yourself." />
            <Step number="2" title="Select Outfit" description="Browse our wardrobe and pick a garment you love." />
            <Step number="3" title="Try It On" description="Let our AI generate your new look in seconds." />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-nigeria-green/20 to-terracotta/20 pointer-events-none"></div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
      <div className="p-3 bg-stone-50 w-fit rounded-2xl">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="w-12 h-12 rounded-full border-2 border-nigeria-green flex items-center justify-center text-2xl font-bold text-nigeria-green">
        {number}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-stone-400">{description}</p>
    </div>
  );
}

import { Shirt } from 'lucide-react';
