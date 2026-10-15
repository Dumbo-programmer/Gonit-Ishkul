import type { Metadata, Viewport } from "next";
import { Baloo_Da_2, Hind_Siliguri, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";
import { SiteNavbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import type { Lang } from "@/lib/i18n/dictionary";

const bangla = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

const display = Baloo_Da_2({
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: "প্রথম আলো গণিত ইশকুল | Prothom Alo Gonit Ishkul",
  description:
    "গণিত দূত অ্যাম্বাসাডর প্রোগ্রাম, ভিডিও ক্লাস, সমস্যা সমাধান ও কনটেস্ট অ্যারিনা — প্রথম আলো গণিত ইশকুল।",
  applicationName: "Prothom Alo Gonit Ishkul",
  icons: { icon: "/brand/logo.png", apple: "/brand/logo.png" },
  openGraph: {
    title: "প্রথম আলো গণিত ইশকুল",
    description:
      "গণিতকে ভালোবাসার এক নতুন ইশকুল — অ্যাম্বাসাডর প্রোগ্রাম, ক্লাস ও কনটেস্ট।",
    images: ["/brand/slogan.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#7952B3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieLang = cookies().get("gi_lang")?.value;
  const lang: Lang = cookieLang === "en" ? "en" : "bn";

  return (
    <html lang={lang} className={`${bangla.variable} ${display.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white">
        <Providers initialLang={lang}>
          <ScrollProgress />
          <SiteNavbar />
          <main>{children}</main>
          <SiteFooter />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}