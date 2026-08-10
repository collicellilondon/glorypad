import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://glorypad.vercel.app"),
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
  return <html lang="pt-BR"><body>{children}</body></html>;
}
