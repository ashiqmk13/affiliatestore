'use client'
// src/app/page.tsx
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Store, Zap, Globe, Shield, BarChart2, Link2, CheckCircle2, Star, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

const features = [
  {
    icon: Zap,
    title: 'Add Products Instantly',
    desc: 'Paste any affiliate link and we automatically pull product details, images, and pricing.',
  },
  {
    icon: Store,
    title: 'Beautiful Store Builder',
    desc: 'Customize your store with themes, colors, and layouts that convert visitors to buyers.',
  },
  {
    icon: Globe,
    title: 'Custom Domain Support',
    desc: 'Use your own domain or a free subdomain. SSL included, zero configuration needed.',
  },
  {
    icon: BarChart2,
    title: 'Built-in Analytics',
    desc: 'Track visitors, clicks, and conversions from your dashboard in real time.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    desc: 'Enterprise-grade security, encrypted sessions, and role-based access controls.',
  },
  {
    icon: Link2,
    title: 'SEO Optimized',
    desc: 'Meta tags, sitemaps, and structured data automatically generated for every product.',
  },
]

const steps = [
  { n: '01', title: 'Create your account', desc: 'Sign up in 30 seconds. No credit card needed for your first month.' },
  { n: '02', title: 'Build your store', desc: 'Give your store a name, pick a style, and add your branding.' },
  { n: '03', title: 'Add affiliate products', desc: 'Paste product links from Amazon, Flipkart, ShareASale, or any retailer.' },
  { n: '04', title: 'Publish & earn', desc: 'Share your store link and start earning affiliate commissions.' },
]

const FadeIn = ({ children, delay = 0, y = 30, className = '' }: any) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

export default function HomePage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-700 tracking-tight">
            <span className="gradient-text">Sample</span>
            <span className="text-white"> Website</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-900/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-brand-800/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-950/30 rounded-full blur-[100px]" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <motion.div style={{ y: heroY }} className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-brand-700/40 bg-brand-950/30 text-brand-400 text-xs px-3 py-1.5 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            First month completely free — no credit card required
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-6xl md:text-7xl lg:text-8xl font-800 tracking-tight leading-[0.95] mb-6"
          >
            Your affiliate store,
            <br />
            <span className="gradient-text">live in minutes.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Paste an affiliate link, watch the product auto-populate, publish your store.
            No coding, no design skills, no nonsense.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:shadow-brand-900/50 hover:-translate-y-0.5"
            >
              Launch my store for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white px-6 py-4 rounded-xl text-base transition-colors"
            >
              Already have an account? <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Store preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 relative"
          >
            <div className="absolute inset-x-0 -top-8 h-24 bg-gradient-to-b from-transparent to-transparent pointer-events-none" />
            <div className="relative mx-auto max-w-4xl glass rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/60">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                    <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-xs text-white/30 font-mono">
                  yourstore.samplewebsite.com
                </div>
              </div>
              {/* Store preview */}
              <div className="p-6 bg-[#0d0d0d]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display font-700 text-white">My Affiliate Store</span>
                  </div>
                  <div className="flex gap-3 text-xs text-white/40">
                    <span>Products</span><span>About</span><span>Contact</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: 'Wireless Headphones', price: '$49.99', badge: 'Hot' },
                    { name: 'Smart Watch Series X', price: '$129.00', badge: 'New' },
                    { name: 'Laptop Stand Pro', price: '$34.99', badge: null },
                  ].map((p, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative">
                        <div className="w-12 h-12 rounded-lg bg-white/5" />
                        {p.badge && (
                          <span className="absolute top-2 left-2 text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">{p.badge}</span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-white/80 font-medium mb-1 truncate">{p.name}</p>
                        <p className="text-sm font-700 text-brand-400 font-mono">{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow under mockup */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-brand-600/10 blur-3xl rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <p className="text-brand-400 text-sm font-medium mb-4 tracking-widest uppercase">Everything you need</p>
            <h2 className="font-display text-5xl md:text-6xl font-800 tracking-tight mb-4">
              Built for affiliate marketers
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Every feature you need to run a professional affiliate store, without the complexity.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="glass rounded-2xl p-7 card-hover group cursor-default h-full">
                  <div className="w-11 h-11 rounded-xl bg-brand-900/40 border border-brand-700/30 flex items-center justify-center mb-5 group-hover:bg-brand-800/50 transition-colors">
                    <f.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <h3 className="font-display font-700 text-lg mb-2 text-white">{f.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <p className="text-brand-400 text-sm font-medium mb-4 tracking-widest uppercase">Simple process</p>
            <h2 className="font-display text-5xl md:text-6xl font-800 tracking-tight">
              Four steps to launch
            </h2>
          </FadeIn>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.1}>
                <div className="flex items-start gap-8 glass rounded-2xl p-8 card-hover group">
                  <span className="font-display text-5xl font-800 gradient-text leading-none">{s.n}</span>
                  <div>
                    <h3 className="font-display font-700 text-xl mb-1">{s.title}</h3>
                    <p className="text-white/45 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-brand-400 text-sm font-medium mb-4 tracking-widest uppercase">Pricing</p>
            <h2 className="font-display text-5xl md:text-6xl font-800 tracking-tight mb-4">Simple, honest pricing</h2>
            <p className="text-white/40 text-lg">One plan. Everything included.</p>
          </FadeIn>
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free trial card */}
              <div className="glass rounded-2xl p-8 border border-white/8">
                <div className="mb-6">
                  <p className="text-white/50 text-sm mb-1">First month</p>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-6xl font-800 text-white">Free</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Full platform access', 'Unlimited products', 'Custom domain', 'Analytics dashboard', 'Email support'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block text-center bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all border border-white/8">
                  Start your free month
                </Link>
              </div>

              {/* Paid plan */}
              <div className="relative rounded-2xl p-8 border border-brand-600/40 bg-gradient-to-b from-brand-950/40 to-transparent overflow-hidden">
                <div className="absolute top-4 right-4 text-xs bg-brand-600 text-white px-2 py-1 rounded-full font-medium">
                  After trial
                </div>
                <div className="mb-6">
                  <p className="text-white/50 text-sm mb-1">Per month</p>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-6xl font-800 text-white">$13</span>
                    <span className="text-white/40 mb-2">/mo</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in trial', 'Priority support', 'Advanced analytics', 'Custom branding', 'Multiple payment gateways', 'SEO tools', 'Cancel anytime'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block text-center bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium transition-all">
                  Get started free →
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-radial from-brand-950/30 via-transparent to-transparent pointer-events-none" />
        <FadeIn className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-6xl font-800 tracking-tight mb-6">
            Ready to build your store?
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Join affiliate marketers building their online presence today.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-brand-900/50 hover:-translate-y-0.5"
          >
            Launch my store — it's free <ArrowRight className="w-5 h-5" />
          </Link>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-700 text-lg">
            <span className="gradient-text">Sample</span>
            <span className="text-white"> Website</span>
          </div>
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} Sample Website. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
