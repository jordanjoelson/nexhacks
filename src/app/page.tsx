"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Sparkles,
  Video,
  TrendingUp,
  CheckCircle,
  Zap,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const palaReviews = [
  {
    name: "Sarah M.",
    username: "@sarahsmash",
    body: "PALA fixed my serve in one session. Now I'm winning tournaments!",
    img: "https://avatar.vercel.sh/sarah",
  },
  {
    name: "Mike T.",
    username: "@mikethepaddle",
    body: "Best pickleball investment I've made. It's like having a pro coach 24/7.",
    img: "https://avatar.vercel.sh/mike",
  },
  {
    name: "Jessica L.",
    username: "@jessicapickle",
    body: "The AI analysis is spot-on. Improved my third shot drop dramatically.",
    img: "https://avatar.vercel.sh/jessica",
  },
  {
    name: "David K.",
    username: "@courtking",
    body: "Finally understanding my footwork issues. PALA breaks it down perfectly.",
    img: "https://avatar.vercel.sh/david",
  },
  {
    name: "Emma R.",
    username: "@emmavolley",
    body: "Game-changer for my doubles strategy. The voice coaching is so helpful!",
    img: "https://avatar.vercel.sh/emma",
  },
  {
    name: "Chris P.",
    username: "@chrispickles",
    body: "I've tried other apps. Nothing comes close to PALA's detailed feedback.",
    img: "https://avatar.vercel.sh/chris",
  },
];

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 overflow-hidden rounded-xl p-4",
        "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-[#2D3142]">
            {name}
          </figcaption>
          <p className="text-xs text-[#6B7280]">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-[#2D3142]">
        {body}
      </blockquote>
    </figure>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFAF5]/80 backdrop-blur-xl border-b border-[#FF6B35]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            PALA
          </h1>
          <div className="flex items-center gap-6">
            <Link href="#how-it-works" className="text-[#6B7280] hover:text-[#2D3142] transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-[#6B7280] hover:text-[#2D3142] transition-colors">
              Testimonials
            </Link>
            <Link href="/login">
              <Button className="bg-[#FF6B35] hover:bg-[#E85A2A]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 relative overflow-hidden">
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4ECDC4]/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-[#FFB84D]/20 text-[#E85A2A] border-[#FFB84D] hover:bg-[#FFB84D]/30 hover:text-[#E85A2A]">
              <Sparkles className="w-3 h-3 mr-2" />
              AI-Powered Coaching
            </Badge>

            <h1 className="text-7xl font-black mb-6 text-[#2D3142] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Your Pickleball Pal,
              <br />
              Always in Your Corner
            </h1>

            <p className="text-xl text-[#6B7280] mb-10 leading-relaxed max-w-2xl mx-auto">
              Upload your game footage. Get instant AI analysis. Level up your pickleball skills with personalized coaching from PALA.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/login">
                <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E85A2A] text-lg px-8 group">
                  Start Improving Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Hero visual placeholder */}
            <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#FFF5EB] to-[#FFFAF5] p-8 border-2 border-[#FFB84D]/20 shadow-xl">
              <div className="aspect-video bg-[#4ECDC4]/10 rounded-xl flex items-center justify-center">
                <Video className="w-24 h-24 text-[#4ECDC4]" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20">
              Simple Process
            </Badge>
            <h2 className="text-5xl font-bold mb-4 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
              Three Steps to Better Play
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              PALA makes improving your game as easy as 1-2-3
            </p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] via-[#4ECDC4] to-[#FFB84D] opacity-20" />
            
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-gradient-to-br from-white to-[#FFF5EB] rounded-3xl p-8 border-2 border-[#FFB84D]/20 hover:border-[#FF6B35] transition-all hover:shadow-2xl hover:-translate-y-2 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <Badge className="mb-4 bg-[#FF6B35]/10 text-[#E85A2A] border-[#FF6B35]/20">STEP 01</Badge>
                <h3 className="text-2xl font-bold mb-3 text-[#2D3142]">Upload Your Game</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Drop in your pickleball footage. We handle the rest—no setup required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-br from-white to-[#FFF5EB] rounded-3xl p-8 border-2 border-[#FFB84D]/20 hover:border-[#4ECDC4] transition-all hover:shadow-2xl hover:-translate-y-2 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4ECDC4] to-[#2D9A94] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <Badge className="mb-4 bg-[#4ECDC4]/10 text-[#2D3142] border-[#4ECDC4]/20">STEP 02</Badge>
                <h3 className="text-2xl font-bold mb-3 text-[#2D3142]">AI Analysis</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  PALA analyzes your form, footwork, and strategy in real-time.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-br from-white to-[#FFF5EB] rounded-3xl p-8 border-2 border-[#FFB84D]/20 hover:border-[#FFB84D] transition-all hover:shadow-2xl hover:-translate-y-2 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFB84D] to-[#FFA726] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <Badge className="mb-4 bg-[#FFB84D]/10 text-[#E85A2A] border-[#FFB84D]/20">STEP 03</Badge>
                <h3 className="text-2xl font-bold mb-3 text-[#2D3142]">Level Up</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Get personalized feedback with voice coaching to improve every match.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#4ECDC4]/10 text-[#2D3142] border-[#4ECDC4]/20">
              Community Love
            </Badge>
            <h2 className="text-5xl font-bold mb-4 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
              Players Love PALA
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Join thousands of pickleball enthusiasts getting better every day
            </p>
          </div>

          <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden">
            {/* Top Marquee - Goes Right */}
            <div className="w-full border-2 border-[#FFB84D]/20 rounded-xl p-4 bg-white/50 backdrop-blur-sm">
              <Marquee className="[--duration:40s]">
                {palaReviews.slice(0, palaReviews.length / 2).map((review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
            </div>
            
            {/* Bottom Marquee - Goes Left */}
            <div className="w-full border-2 border-[#4ECDC4]/20 rounded-xl p-4 bg-white/50 backdrop-blur-sm">
              <Marquee reverse className="[--duration:40s]">
                {palaReviews.slice(palaReviews.length / 2).map((review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
            </div>
            
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#FFFAF5]"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#FFFAF5]"></div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB84D] rounded-3xl p-12 text-center text-white">
            <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Ready to Transform Your Game?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join PALA today and start your journey to pickleball mastery
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-[#FF6B35] hover:bg-gray-100 text-lg px-10">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#E5E7EB] bg-[#FFF5EB] py-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB84D] flex items-center justify-center font-black text-white text-lg">
                P
              </div>
              <h3 className="text-xl font-black text-[#2D3142]">PALA</h3>
            </div>
            <p className="text-[#6B7280] mb-2">Your Pickleball Pal</p>
            <p className="text-sm text-[#6B7280]">
              Built with ❤️ at Turing City NexHacks @ CMU
            </p>
            <p className="text-sm text-[#6B7280] mt-2">
              © 2026 PALA. Powered by AI. Built for players.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
