'use client'

import React from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/common/container'
import { Section } from '@/components/common/section'
import { Logo } from '@/components/common/logo'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  Activity,
  Flame,
  CheckCircle,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

// Fade-in-up transition configuration
const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
} as const

// Stagger child animation configuration
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      {/* HERO SECTION */}
      <Section className="relative pt-24 pb-20 md:pt-36 md:pb-32 bg-background flex items-center justify-center border-b border-border/20">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        {/* Gradient Blur Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <Container className="relative z-10 text-center space-y-8 max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/25 bg-accent/5 text-accent text-xs font-semibold"
          >
            <Sparkles className="h-3 w-3" />
            <span>Introducing Loop</span>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-3">
              <Logo className="h-10 sm:h-14 w-auto" />
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                Loop
              </h1>
            </div>
            <p className="text-display mt-2">
              Stay in the loop.
            </p>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-subheading max-w-xl mx-auto"
          >
            A high-performance habit tracker designed with atomic focus and premium aesthetics to keep you consistently moving forward.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/signup"
              className={buttonVariants({
                size: 'lg',
                className:
                  'w-full sm:w-auto bg-accent hover:bg-accent/90 text-white cursor-pointer font-medium tracking-tight justify-center',
              })}
            >
              Get Started
            </Link>
            <a
              href="#features"
              className={buttonVariants({
                variant: 'outline',
                size: 'lg',
                className:
                  'w-full sm:w-auto cursor-pointer font-medium tracking-tight justify-center',
              })}
            >
              Learn More
            </a>
          </motion.div>
        </Container>
      </Section>

      {/* FEATURES SECTION */}
      <Section id="features" className="border-b border-border/20 bg-card/30">
        <Container className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-heading">Features built for focus.</h2>
            <p className="text-subheading text-sm">
              We stripped away the clutter and built a system optimized for long-term consistency.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="border-border/50 bg-card hover:border-border transition-colors h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="p-3 w-fit rounded-lg bg-accent/10 text-accent">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Atomic Tracking</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Check off habits daily with a single tap. Minimal friction, maximal momentum.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-border/50 bg-card hover:border-border transition-colors h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="p-3 w-fit rounded-lg bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Aesthetic Insights</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Understand your trends, streaks, and completion rates with clean data grids.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-border/50 bg-card hover:border-border transition-colors h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="p-3 w-fit rounded-lg bg-orange-500/10 text-orange-500">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Streak Incentives</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Visualise your streaks with flame indicators. Maintain your flow and avoid missing twice.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* WHY LOOP SECTION */}
      <Section id="why-loop" className="border-b border-border/20">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-heading text-left">Why choose Loop?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Standard trackers overload you with inputs, reminders, and notifications. Loop focuses on absolute clarity. Our layout is designed to let you track habits in 5 seconds and stay focused on executing them.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: 'Keyboard Accessible', desc: 'Fully navigates without a mouse.' },
                { title: 'Responsive Workspace', desc: 'Saves states seamlessly across mobile, tablet, and desktop.' },
                { title: 'Dark Mode First', desc: 'Clean, zinc-based dark theme to protect your eyes.' },
                { title: 'Performant & Light', desc: 'Optimized next-gen routes load under 1s.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 bg-accent/5 rounded-2xl filter blur-3xl" />
            <Card className="relative border-border/50 shadow-xl max-w-md w-full bg-card overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                    <span className="font-bold text-sm">Loop Standards</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 px-2 rounded-full border-accent/30 text-accent">
                    A Grade
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Accessibility Rating</span>
                      <span className="font-semibold">100%</span>
                    </div>
                    <Progress value={100} className="h-1.5 bg-muted [&>div]:bg-success" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Lighthouse Performance</span>
                      <span className="font-semibold">99%</span>
                    </div>
                    <Progress value={99} className="h-1.5 bg-muted [&>div]:bg-success" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Form Validation Speed</span>
                      <span className="font-semibold">Instant</span>
                    </div>
                    <Progress value={100} className="h-1.5 bg-muted [&>div]:bg-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* PREVIEW SECTION */}
      <Section id="preview" className="border-b border-border/20 bg-card/15">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-heading">A system built for consistency.</h2>
            <p className="text-subheading text-sm">
              See what your dashboard will look like. Premium layout, collapsible sidebar, and clean streaks.
            </p>
          </div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl border border-border/50 rounded-xl overflow-hidden shadow-2xl bg-card"
            >
              {/* Fake Window Header */}
              <div className="h-12 border-b border-border bg-muted/40 px-4 flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded-full bg-red-500/20 border border-red-500/35" />
                <div className="h-3.5 w-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/35" />
                <div className="h-3.5 w-3.5 rounded-full bg-green-500/20 border border-green-500/35" />
                <span className="text-xs text-muted-foreground/60 ml-4 font-mono select-none">
                  loop.app/dashboard
                </span>
              </div>

              {/* Fake Application UI */}
              <div className="flex h-[380px] bg-background text-foreground text-xs select-none">
                {/* Fake Sidebar */}
                <div className="w-48 border-r border-border p-4 space-y-4 hidden sm:block bg-card">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Logo className="h-5 w-auto text-indigo-500" />
                    <span className="font-bold text-sm">Loop</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-accent text-white font-medium">
                      <Target className="h-3.5 w-3.5" />
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Habits</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
                      <Activity className="h-3.5 w-3.5" />
                      <span>Analytics</span>
                    </div>
                  </div>
                </div>

                {/* Fake Page Content */}
                <div className="flex-1 p-6 space-y-6 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">Dashboard</div>
                      <div className="text-muted-foreground text-[10px]">Welcome back! Here is your summary.</div>
                    </div>
                    <Button size="sm" className="h-8 bg-accent text-white text-[10px] rounded-md pointer-events-none">
                      New Habit
                    </Button>
                  </div>

                  {/* Habit Card Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-border/50 p-4 space-y-3 bg-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm">Read 20 pages</div>
                          <div className="text-[10px] text-muted-foreground">Goal: 20 pages • Daily</div>
                        </div>
                        <Badge variant="outline" className="border-orange-500/20 bg-orange-500/5 text-orange-500 gap-0.5 text-[9px] py-0 px-1.5 rounded-full font-bold">
                          <Flame className="h-3 w-3 fill-orange-500" />
                          <span>7d</span>
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Today Completion</span>
                          <span>100%</span>
                        </div>
                        <Progress value={100} className="h-1 bg-muted [&>div]:bg-accent" />
                      </div>
                    </Card>

                    <Card className="border-border/50 p-4 space-y-3 bg-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm">Gym workout</div>
                          <div className="text-[10px] text-muted-foreground">Goal: 60 mins • 4x/week</div>
                        </div>
                        <Badge variant="outline" className="border-orange-500/20 bg-orange-500/5 text-orange-500 gap-0.5 text-[9px] py-0 px-1.5 rounded-full font-bold">
                          <Flame className="h-3 w-3 fill-orange-500" />
                          <span>12d</span>
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Today Completion</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-1 bg-muted [&>div]:bg-accent" />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* CALL TO ACTION */}
      <Section className="bg-gradient-to-b from-background to-card/40 relative">
        <Container className="text-center space-y-8 max-w-3xl py-12">
          <h2 className="text-heading">Start building your loop today.</h2>
          <p className="text-subheading max-w-lg mx-auto text-sm">
            Consistency is built one day at a time. Track your routines in a clean environment focused entirely on your success.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              href="/signup"
              className={buttonVariants({
                size: 'lg',
                className:
                  'bg-accent hover:bg-accent/90 text-white cursor-pointer gap-2 font-medium tracking-tight group justify-center',
              })}
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Container>
      </Section>
    </div>
  )
}

// Inline fallback icon for target
function Target({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
