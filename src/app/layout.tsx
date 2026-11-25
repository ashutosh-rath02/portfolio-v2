import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import SectionWrapper from "@/components/SectionWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ashutosh | Portfolio",
  description:
    "Ashutosh Rath, an AI engineer from India building LLM agents, agent tooling, evals and full stack products. See my projects and experience.",
  keywords:
    "Ashutosh Rath, AI Engineer, LLM Agents, Agentic AI, RAG, Evals, Python, TypeScript, Full Stack Developer, NIT Rourkela, Portfolio",
  openGraph: {
    url: "https://www.ashutoshrath.me",
    type: "website",
    locale: "en_US",
    siteName: "Ashutosh | Portfolio",
    images: [
      {
        url: "https://res.cloudinary.com/dhnkuonev/image/upload/v1718546853/portfolio/Screenshot_2024-06-16_193714_w8twc2.png",
        width: 1200,
        height: 630,
      },
    ],
    countryName: "India",
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
        <meta property="og:url" content="https://www.ashutoshrath.me" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ashutosh | Portfolio" />
        <meta
          property="og:description"
          content="Ashutosh Rath, an AI engineer from India building LLM agents, agent tooling, evals and full stack products. See my projects and experience."
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dhnkuonev/image/upload/v1718546853/portfolio/Screenshot_2024-06-16_193714_w8twc2.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="ashutoshrath.me" />
        <meta property="twitter:url" content="https://www.ashutoshrath.me" />
        <meta name="twitter:title" content="Ashutosh's Portfolio" />
        <meta
          name="twitter:description"
          content="Ashutosh Rath, an AI engineer from India building LLM agents, agent tooling, evals and full stack products. See my projects and experience."
        />
        <meta
          name="twitter:image"
          content="https://res.cloudinary.com/dhnkuonev/image/upload/v1718546853/portfolio/Screenshot_2024-06-16_193714_w8twc2.png"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SectionWrapper>
            <Navbar />
            {children}
          </SectionWrapper>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
