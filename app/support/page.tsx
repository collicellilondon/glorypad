import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark, Footer, SupportContent } from "../components/site";

export const metadata: Metadata = { title: "Suporte — GloryPad", description: "Ajuda e perguntas frequentes sobre o GloryPad." };

export default function SupportPage() {
  return <main><header className="nav shell"><Link href="/" aria-label="Voltar para o início"><BrandMark compact /></Link><Link className="back-link" href="/">Voltar ao início</Link></header><section className="legal-page support-route shell" aria-labelledby="support-page-title"><SupportContent headingId="support-page-title" /></section><Footer /></main>;
}
