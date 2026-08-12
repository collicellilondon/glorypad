import Link from "next/link";
import Image from "next/image";
import { BrandMark, Footer, SupportContent } from "./components/site";
import { MotionObserver } from "./components/motion-observer";

const features = [
  "Pads em todas as tonalidades",
  "Afinador embutido",
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

const soundCollections = [
  { name: "Foundation", description: "Uma base ampla e equilibrada para cultos, ensaios e ministrações." },
  { name: "Organic", description: "Texturas naturais e acolhedoras para momentos íntimos de adoração." },
  { name: "Studio", description: "Camadas profundas e definidas para equipes que buscam mais presença sonora." },
];

export default function Home() {
  return (
    <main>
      <MotionObserver />
      <header className="nav shell">
        <Link href="/" aria-label="GloryPad — início"><BrandMark compact /></Link>
        <nav aria-label="Navegação principal">
          <a href="#app">O app</a>
          <a href="#afinador">Afinador</a>
          <a href="#recursos">Recursos</a>
          <a href="#sons">Sons</a>
          <a href="#support">Suporte</a>
        </nav>
      </header>

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy hero-enter">
          <p className="eyebrow">Sound That Lifts</p>
          <h1 id="hero-title">Atmosfera para cada momento de adoração.</h1>
          <p className="hero-text">Pads ambientes contínuos para músicos, ministros de louvor e momentos de oração. Escolha a tonalidade, afine seu instrumento, ajuste o som e mantenha a atmosfera sem interrupções.</p>
          <span className="coming-soon" aria-label="GloryPad estará disponível em breve na App Store">
            <span aria-hidden="true">●</span> Disponível em breve na App Store
          </span>
        </div>
        <div className="hero-art hero-enter hero-enter-late" aria-hidden="true">
          <div className="soundmark large"><i /><i /><i /><i /><i /><i /><i /></div>
          <span>GLORY<span>PAD</span></span>
        </div>
      </section>

      <section className="intro section shell" id="app" aria-labelledby="about-title" data-reveal>
        <p className="section-label">O aplicativo</p>
        <div className="section-grid">
          <h2 id="about-title">Simples para tocar.<br />Feito para adorar.</h2>
          <p>O GloryPad foi criado para oferecer uma base sonora contínua e envolvente durante ministrações, ensaios, cultos e momentos pessoais de adoração. Com afinador embutido e uma interface direta, sem distrações, foi desenvolvido para uso ao vivo.</p>
        </div>
      </section>

      <section className="section tuner shell" id="afinador" aria-labelledby="tuner-title" data-reveal>
        <div className="tuner-copy">
          <p className="section-label">Novo no GloryPad</p>
          <h2 id="tuner-title">Afine. Toque.<br />Permaneça no momento.</h2>
          <p>O afinador agora faz parte do GloryPad. Prepare seu instrumento com rapidez e precisão sem sair do aplicativo — menos interrupções antes do ensaio, do culto ou da ministração.</p>
          <ul className="tuner-benefits" aria-label="Benefícios do afinador GloryPad">
            <li><span>01</span>Afinação integrada ao seu fluxo</li>
            <li><span>02</span>Leitura clara e objetiva</li>
            <li><span>03</span>Pronto para músicos no palco</li>
          </ul>
        </div>
        <div className="tuner-visual" aria-label="Representação visual do afinador embutido">
          <span className="tuner-kicker">Afinador embutido</span>
          <div className="tuner-scale" aria-hidden="true">
            {Array.from({ length: 15 }, (_, index) => <i key={index} />)}
          </div>
          <strong>A</strong>
          <p>440.0 <span>Hz</span></p>
          <div className="tuner-status"><span aria-hidden="true" /> Afinado</div>
        </div>
      </section>

      <section className="section shell" id="recursos" aria-labelledby="features-title" data-reveal>
        <div className="section-heading">
          <p className="section-label">Recursos</p>
          <h2 id="features-title">O essencial, no momento certo.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature" key={feature} data-reveal style={{ "--reveal-delay": `${index * 45}ms` } as React.CSSProperties}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section showcase" aria-labelledby="showcase-title" data-reveal>
        <div className="shell section-heading">
          <p className="section-label">Por dentro do GloryPad</p>
          <h2 id="showcase-title">Tudo ao alcance de um toque.</h2>
          <p>Interface clara, contraste preciso, afinador embutido e controles preparados para o palco.</p>
        </div>
        <div className="screens shell">
          {screenshots.map((shot, index) => (
            <figure className={`screen screen-${index + 1}`} key={shot.src} data-reveal style={{ "--reveal-delay": `${index * 100}ms` } as React.CSSProperties}>
              <Image src={shot.src} alt={shot.alt} width={804} height={1600} priority={index === 0} sizes="(max-width: 620px) 42vw, (max-width: 900px) 34vw, 28vw" />
            </figure>
          ))}
        </div>
      </section>

      <section className="section sounds-market shell" id="sons" aria-labelledby="sounds-title" data-reveal>
        <div className="market-intro">
          <div>
            <p className="section-label">Biblioteca GloryPad</p>
            <h2 id="sounds-title">Sons criados para servir à igreja.</h2>
          </div>
          <div>
            <p>Uma futura coleção de pads e atmosferas para equipes de louvor, músicos e ministérios. Pacotes com identidade própria, compra simples e uso direto no GloryPad.</p>
            <span className="market-status"><span aria-hidden="true">●</span> Coleções em preparação</span>
          </div>
        </div>
        <div className="collection-grid">
          {soundCollections.map((collection, index) => (
            <article className="collection-card" key={collection.name} data-reveal style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}>
              <div className="mini-wave" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <span>Collection {String(index + 1).padStart(2, "0")}</span>
              <h3>{collection.name}</h3>
              <p>{collection.description}</p>
              <small>Em breve</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section support-home shell" id="support" aria-labelledby="support-title" data-reveal>
        <SupportContent headingId="support-title" />
      </section>

      <Footer />
    </main>
  );
}
