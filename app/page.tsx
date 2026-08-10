import Link from "next/link";
import Image from "next/image";
import { BrandMark, Footer, SupportContent } from "./components/site";

const features = [
  "Pads em todas as tonalidades",
  "Reprodução contínua",
  "Coleções de sons",
  "Controle de volume",
  "Seleção rápida de tonalidade",
  "Interface para uso ao vivo",
  "Sem anúncios",
  "Sem assinatura",
];

const screenshots = [
  { src: "/screenshots/glorypad-splash.jpeg", alt: "Tela de abertura do GloryPad com o logotipo Sound That Lifts" },
  { src: "/screenshots/glorypad-live.jpeg", alt: "Tela Live do GloryPad com seleção de tonalidades" },
  { src: "/screenshots/glorypad-sounds.jpeg", alt: "Tela Sounds do GloryPad com coleções e controle de volume" },
];

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <Link href="/" aria-label="GloryPad — início"><BrandMark compact /></Link>
        <nav aria-label="Navegação principal">
          <a href="#app">O app</a>
          <a href="#recursos">Recursos</a>
          <a href="#support">Suporte</a>
        </nav>
      </header>

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Sound That Lifts</p>
          <h1 id="hero-title">Atmosfera para cada momento de adoração.</h1>
          <p className="hero-text">Pads ambientes contínuos para músicos, ministros de louvor e momentos de oração. Escolha a tonalidade, ajuste o som e mantenha a atmosfera sem interrupções.</p>
          <span className="coming-soon" aria-label="GloryPad estará disponível em breve na App Store">
            <span aria-hidden="true">●</span> Disponível em breve na App Store
          </span>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="soundmark large"><i /><i /><i /><i /><i /><i /><i /></div>
          <span>GLORY<span>PAD</span></span>
        </div>
      </section>

      <section className="intro section shell" id="app" aria-labelledby="about-title">
        <p className="section-label">O aplicativo</p>
        <div className="section-grid">
          <h2 id="about-title">Simples para tocar.<br />Feito para adorar.</h2>
          <p>O GloryPad foi criado para oferecer uma base sonora contínua e envolvente durante ministrações, ensaios, cultos e momentos pessoais de adoração. Uma interface direta, sem distrações, desenvolvida para uso ao vivo.</p>
        </div>
      </section>

      <section className="section shell" id="recursos" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="section-label">Recursos</p>
          <h2 id="features-title">O essencial, no momento certo.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature" key={feature}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section showcase" aria-labelledby="showcase-title">
        <div className="shell section-heading">
          <p className="section-label">Por dentro do GloryPad</p>
          <h2 id="showcase-title">Tudo ao alcance de um toque.</h2>
          <p>Interface clara, contraste preciso e controles preparados para o palco.</p>
        </div>
        <div className="screens shell">
          {screenshots.map((shot, index) => (
            <figure className={`screen screen-${index + 1}`} key={shot.src}>
              <Image src={shot.src} alt={shot.alt} width={804} height={1600} priority={index === 0} sizes="(max-width: 620px) 42vw, (max-width: 900px) 34vw, 28vw" />
            </figure>
          ))}
        </div>
      </section>

      <section className="section support-home shell" id="support" aria-labelledby="support-title">
        <SupportContent headingId="support-title" />
      </section>

      <Footer />
    </main>
  );
}
