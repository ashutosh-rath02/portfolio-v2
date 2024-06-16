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
    "Hey, I'm Ashutosh Rath, a Full Stack Developer from India. I love building web applications and solving problems. Check out my portfolio to know more about me.",
  keywords:
    "Portfolio, Ashutosh Rath, Web Developer, Software Engineer, Full Stack Developer, React Developer, Next.js Developer, Tailwind CSS Developer, JavaScript Developer, TypeScript Developer, Node.js Developer, MongoDB Developer, Express Developer, React Developer, Redux Developer,Go Developer, GoLang developer, Devops, devops engineer, backend developer, Web Developer in India, Web Developer in Odisha, Web Developer in Bhubaneswar, Web Developer in Rourkela, Web Developer in Bangalore, Web Developer in Bengaluru, Web Developer in Karnataka, Web Developer in India, Web Developer in Asia, Web Developer in World, Web Developer in USA, Web Developer in Canada, Web Developer in Australia, Web Developer in UK, Web Developer in Europe, Web Developer in Africa, Web Developer in South America, Web Developer in North America, Web Developer in Antarctica, Web Developer in Mars, Web Developer in Jupiter, Web Developer in Saturn, Web Developer in Pluto, Web Developer in Neptune, Web Developer in Uranus, Web Developer in Venus, Web Developer in Mercury, Web Developer in Sun, Web Developer in Moon, Web Developer in Earth, Web Developer in Milky Way, Web Developer in Universe, Web Developer in Multiverse, Web Developer in Metaverse, Web Developer in Hyperspace, Web Developer in Hypertime. Freelancer, Internship, Hiring",
  openGraph: {
    url: "https://ashutoshrath.me",
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
        <meta property="og:url" content="https://ashutoshrath.me" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ashutosh | Portfolio" />
        <meta
          property="og:description"
          content="Hey, I'm Ashutosh Rath, a Full Stack Developer from India. I love building web applications and solving problems. Check out my portfolio to know more about me."
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dhnkuonev/image/upload/v1718546853/portfolio/Screenshot_2024-06-16_193714_w8twc2.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="ashutoshrath.me" />
        <meta property="twitter:url" content="https://ashutoshrath.me" />
        <meta name="twitter:title" content="Ashutosh's Portfolio" />
        <meta
          name="twitter:description"
          content="Hey, I'm Ashutosh Rath, a Full Stack Developer from India. I love building web applications and solving problems. Check out my portfolio to know more about me."
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
