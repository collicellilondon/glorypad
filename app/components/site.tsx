import Link from "next/link";

export const SUPPORT_EMAIL = "support@glorypad.app";

const faqs = [
  { question: "O GloryPad precisa de internet?", answer: "Os recursos disponíveis podem variar conforme a versão do aplicativo. Consulte as informações da versão instalada." },
  { question: "O GloryPad possui assinatura?", answer: "Não. O GloryPad é vendido como compra única, sem mensalidade recorrente." },
  { question: "O GloryPad possui anúncios?", answer: "Não. O GloryPad não exibe anúncios." },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "compact" : ""}`}><span className="soundmark" aria-hidden="true"><i /><i /><i /><i /><i /></span><span>GloryPad<small>Sound That Lifts</small></span></span>;
}

export function SupportContent({ headingId }: { headingId: string }) {
  return <>
    <div className="support-lead">
      <p className="section-label">Atendimento</p>
      <h2 id={headingId}>Suporte</h2>
      <p>Precisa de ajuda com o GloryPad? Entre em contato conosco.</p>
      <a className="email" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
    </div>
    <div className="faq" aria-label="Perguntas frequentes">
      {faqs.map(({ question, answer }) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
    </div>
  </>;
}

export function Footer() {
  return <footer className="footer shell"><Link href="/" aria-label="GloryPad — início"><BrandMark compact /></Link><p>© 2026 GloryPad. All rights reserved.</p><nav aria-label="Links do rodapé"><Link href="/support">Suporte</Link><Link href="/privacy">Política de Privacidade</Link></nav></footer>;
}
