"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8">
      <main className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
            Pickleball Analysis
          </h1>
          <p className="mt-2 text-lg text-black">
            Real-time AI vision analysis on live video streams
          </p>
          <div className="mt-4">
            <a
              href="/analyze"
              className="inline-block px-8 py-4 bg-gradient-to-r from-black to-gray-800 hover:from-green-500 hover:to-green-600 text-white font-bold text-xl rounded-lg border border-gray-200 hover:border-green-500 transition-all"
            >
              Analyze Video
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
