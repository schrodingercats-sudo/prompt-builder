import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://promptimizer-pi.vercel.app"),
  title: {
    default: "Promptimzer — Free AI Prompt Optimizer & Enhancer",
    template: "%s | Promptimzer",
  },
  description:
    "Optimize your AI prompts for free. Promptimzer is an AI-powered prompt optimizer for ChatGPT, Claude, Gemini & more. Get better AI responses instantly.",
  keywords: [
    "prompt optimizer",
    "ai prompt optimizer",
    "prompt enhancer",
    "free prompt optimizer",
    "ai prompt optimizer free",
    "chatgpt prompt generator",
    "claude prompt optimizer",
    "gemini prompt optimizer",
    "ai prompt improver",
    "promptimzer",
    "promptizer",
    "prompt builder",
    "prompt engineering tool",
    "prompt optimization tool",
    "optimize prompts for chatgpt",
  ],
  openGraph: {
    type: "website",
    siteName: "Promptimzer",
    title: "Promptimzer — Free AI Prompt Optimizer & Enhancer",
    description:
      "Optimize your AI prompts for free. Promptimzer is an AI-powered prompt optimizer for ChatGPT, Claude, Gemini & more.",
    url: "https://promptimizer-pi.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Promptimzer — AI Prompt Optimizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promptimzer — Free AI Prompt Optimizer",
    description:
      "Optimize your AI prompts for free. Get better responses from ChatGPT, Claude, Gemini & more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google3690ce1ff1168d6d",
  },
  alternates: {
    canonical: "https://promptimizer-pi.vercel.app",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="font-[DM_Sans] antialiased">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
