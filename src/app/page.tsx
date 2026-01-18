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
  Zap,
  Play,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSVGUnderline } from "@/components/ui/animated-svg-underline";
import { motion } from "framer-motion";

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-black text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            PALA
          </h1>
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="#how-it-works" className="text-sm lg:text-base text-[#6B7280] hover:text-[#2D3142] transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm lg:text-base text-[#6B7280] hover:text-[#2D3142] transition-colors">
              Testimonials
            </Link>
            <Link href="/login">
              <Button className="bg-[#FF6B35] hover:bg-[#E85A2A] text-sm lg:text-base">
                Get Started
              </Button>
            </Link>
          </div>
          <Link href="/login" className="md:hidden">
            <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E85A2A]">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 sm:left-20 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-[#FF6B35]/35 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 sm:right-20 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-[#4ECDC4]/35 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 text-[#2D3142] leading-tight px-2" style={{ fontFamily: "var(--font-display)" }}>
              Your Pickleball Pal,
              <br />
              Always in Your Corner
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
              Upload your game footage. Get instant AI analysis. Level up your pickleball skills with personalized coaching from PALA.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#E85A2A] text-base sm:text-lg px-6 sm:px-8 group">
                  Start Improving Now
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
              >
                <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Hero video embed */}
            <div className="mt-8 sm:mt-12 lg:mt-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#FFF5EB] to-[#FFFAF5] p-4 sm:p-6 lg:p-8 border-2 border-[#FFB84D]/20 shadow-xl relative">
              {/* Pickleball image in top right corner */}
              <div className="absolute -top-6 sm:-top-8 lg:-top-10 -right-4 sm:-right-6 z-50">
                <img 
                  src="/pickball.png" 
                  alt="Pickleball" 
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
                />
              </div>
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/XiMNP5voSE4"
                  title="PALA Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <Badge className="mb-4 bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20 text-sm">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[#2D3142] px-4" style={{ fontFamily: "var(--font-display)" }}>
              Three Steps to Better Play
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto px-4">
              PALA makes improving your game as easy as 1-2-3
            </p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] via-[#4ECDC4] to-[#FFB84D] opacity-20" />
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-gradient-to-br from-white to-[#FFF5EB] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-[#FFB84D]/20 hover:border-[#FF6B35] transition-all hover:shadow-2xl hover:-translate-y-2 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <Badge className="mb-3 sm:mb-4 bg-[#FF6B35]/10 text-[#E85A2A] border-[#FF6B35]/20 text-xs">STEP 01</Badge>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-[#2D3142]">Upload Your Game</h3>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                  Drop in your pickleball footage. We handle the rest—no setup required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-br from-white to-[#FFF5EB] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-[#FFB84D]/20 hover:border-[#4ECDC4] transition-all hover:shadow-2xl hover:-translate-y-2 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#4ECDC4] to-[#2D9A94] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <Badge className="mb-3 sm:mb-4 bg-[#4ECDC4]/10 text-[#2D3142] border-[#4ECDC4]/20 text-xs">STEP 02</Badge>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-[#2D3142]">AI Analysis</h3>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                  PALA analyzes your form, footwork, and strategy in real-time.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-br from-white to-[#FFF5EB] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-[#FFB84D]/20 hover:border-[#FFB84D] transition-all hover:shadow-2xl hover:-translate-y-2 group sm:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FFB84D] to-[#FFA726] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <Badge className="mb-3 sm:mb-4 bg-[#FFB84D]/10 text-[#E85A2A] border-[#FFB84D]/20 text-xs">STEP 03</Badge>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-[#2D3142]">Level Up</h3>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                  Get personalized feedback with voice coaching to improve every match.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <Badge className="mb-4 bg-[#4ECDC4]/10 text-[#2D3142] border-[#4ECDC4]/20 text-sm">
              Community Love
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[#2D3142] px-4" style={{ fontFamily: "var(--font-display)" }}>
              Players Love{" "}
              <span className="relative inline-block">
                PALA
                <AnimatedSVGUnderline color="#FF6B35" />
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto px-4">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB84D] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white relative">
            {/* Pengu in top left corner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
              <img 
                src="/pengu.gif" 
                alt="Pengu" 
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 object-contain -rotate-12"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4" style={{ fontFamily: "var(--font-display)" }}>
              Ready to Transform Your Game?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
              Join PALA today and start your journey to pickleball mastery
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-[#FF6B35] hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-10">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
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
