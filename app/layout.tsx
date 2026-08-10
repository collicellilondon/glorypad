import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GloryPad — Sound That Lifts",
  description: "Pads ambientes contínuos para músicos, louvor, adoração e momentos de oração.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "GloryPad — Sound That Lifts",
    description: "Pads ambientes contínuos para músicos, louvor, adoração e momentos de oração.",
    siteName: "GloryPad",
    type: "website",
    images: [{ url: "/og.png", width: 1732, height: 910, alt: "GloryPad — Sound That Lifts" }],
  },
  twitter: { card: "summary_large_image", title: "GloryPad — Sound That Lifts", description: "Pads ambientes contínuos para músicos, louvor, adoração e momentos de oração.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={geist.variable}>{children}</body></html>;
}
