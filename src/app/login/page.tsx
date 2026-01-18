"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-login for hackathon demo
    router.push("/upload");
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-2 border-[#FFB84D]/20 shadow-xl">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <h1 className="text-3xl font-black text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            PALA
          </h1>
          <div>
            <CardTitle className="text-2xl font-bold text-[#2D3142]">
              Welcome to PALA
            </CardTitle>
            <CardDescription className="text-[#6B7280] mt-2">
              Your pickleball pal is ready
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Hardcoded login for hackathon */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#2D3142]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#E5E7EB] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#2D3142]">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#E5E7EB] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E85A2A] text-lg py-6"
            >
              <Zap className="mr-2 w-5 h-5" />
              Start Coaching Session
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Hackathon Demo • Auto-login enabled
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
