"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const pixKey = "victorya.a.v.a.s.b.b@gmail.com";
  const [copied, setCopied] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Não foi possível copiar a chave Pix", error);
    }
  };

  // Intersection Observer keeps sections animated as they enter the viewport
  useEffect(() => {
    const elements = document.querySelectorAll(".js-fade");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[var(--color-cream)] text-[var(--color-text)]">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-24 text-center js-fade"
      >
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 opacity-[0.08] bg-hero-pattern" />

        <div className="relative z-10 space-y-8 max-w-4xl">
          <p className="tracking-[0.4em] text-xs md:text-sm uppercase text-[var(--color-muted)]">
            Celebrando o amor
          </p>
          <h1 className="font-script text-5xl md:text-7xl text-[var(--color-gold)] leading-tight">
            Marlon & Victorya
          </h1>
          <p className="font-serif text-lg md:text-2xl text-[var(--color-rose)]">
            &ldquo;Duas almas, um só coração&rdquo;
          </p>
          <div className="inline-flex flex-col gap-1 text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
            <span>12 de Fevereiro de 2026</span>
            <span>Campos dos Goytacazes • Rio de Janeiro</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#detalhes" className="btn-secondary">
              Detalhes do Evento
            </a>
            <a href="#rsvp" className="btn-primary">
              Confirmar Presença
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 text-[var(--color-gold)] animate-bounce text-xs md:text-base tracking-[0.4em] uppercase">
          role para descobrir
        </div>
      </section>

      {/* Nossa História */}
      <section id="historia" className="section-wrapper js-fade">
        <div className="section-heading">
          <p className="accent-pill">Nossa História</p>
          <h2>Amor escrito nas pequenas coisas</h2>
          <p>
            Há 10 anos, Deus cruzou nossos caminhos em uma rua simples.
            Entre risadas, amizade, igreja, encontros e promessas, o amor cresceu.
            Hoje, escolhemos caminhar juntos para sempre.
          </p>
        </div>
        <div className="section-card">
          <p>
            &ldquo;Prometemos continuar escrevendo nossa história com delicadeza, companhia e
            amor. E desejamos que você faça parte deste sonho.&rdquo;
          </p>
        </div>
      </section>

      {/* Detalhes do Evento */}
      <section id="detalhes" className="section-wrapper js-fade">
        <div className="section-heading">
          <p className="accent-pill">Detalhes do Evento</p>
          <h2>Reserve esta data</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="section-card">
            <p className="detail-label">Data</p>
            <p className="detail-value">12 • Fevereiro • 2026</p>
          </div>
          <div className="section-card">
            <p className="detail-label">Horário</p>
            <p className="detail-value">Por volta das 19:00</p>
          </div>
          <div className="section-card">
            <p className="detail-label">Local</p>
            <p className="detail-value">Recanto das Palmeiras, Próximo ao Partage</p>
          </div>
        </div>
        <div className="mt-10 space-y-4">
          <iframe
            title="Mapa do local"
            src="https://www.google.com/maps?q=Condom%C3%ADnio%20Recanto%20das%20Palmeiras%2C%20Campos%20dos%20Goytacazes%20-%20RJ&output=embed"
            loading="lazy"
            className="w-full h-72 rounded-3xl border border-[var(--color-gold)]/30 shadow-soft"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href="https://maps.app.goo.gl/KseQXJ45oYyhZUVP6"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary w-full md:w-auto text-center"
          >
            Abrir no Google Maps
          </a>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="section-wrapper js-fade">
        <div className="section-heading">
          <p className="accent-pill">Confirmação de Presença</p>
          <h2>Ficaremos felizes com sua resposta</h2>
          <p>Por favor, confirme até 20 de janeiro para organizarmos tudo com carinho.</p>
        </div>
        <form className="section-card rsvp-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Nome completo
            <input type="text" placeholder="Digite seu nome" required />
          </label>
          <label className="mt-5">
            Você poderá comparecer?
            <select required >
              <option value="yes">Sim, estarei presente</option>
              <option value="no">Infelizmente não poderei</option>
            </select>
          </label>
          <label className="mt-5">
            Quantidade de acompanhantes
            <input type="number" min="0" max="5" placeholder="0" />
          </label>
          <button type="submit" className="btn-primary w-full md:w-auto mt-5">
            Enviar Resposta
          </button>
        </form>
      </section>

      {/* Lista de Presentes */}
      <section id="presentes" className="section-wrapper js-fade">
        <div className="section-heading">
          <p className="accent-pill">Lista de Presentes</p>
          <h2>O melhor presente é você aqui</h2>
          <p>
            Mas, se desejar nos presentear, deixamos opções preparadas com muito carinho.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={handleCopyPix}
            className="section-card text-left w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="detail-label">Chave Pix</p>
                <p className="detail-value break-all">{pixKey}</p>
              </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M8 3a2 2 0 0 0-2 2v10h2V5h9V3H8Z" />
                  <path d="M9 7a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h9a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H9Zm0 2h9v10H9V9Z" />
                </svg>
            </div>
            <p className="text-sm text-[var(--color-muted)] mt-4">
              {copied ? "Chave copiada!" : "Clique para copiar e incluir seu nome na mensagem."}
            </p>
          </button>
          <div className="section-card">
            <p className="detail-label">Lista Online</p>
            <p className="detail-value">bit.ly/lista-marlon-victorya</p>
            <p className="text-sm text-[var(--color-muted)]">
              Você será direcionado para nossa curadoria de presentes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center bg-white text-[var(--color-muted)]">
        <p className="font-script text-3xl text-[var(--color-gold)]">Marlon & Victorya</p>
        <p className="text-sm mt-2">Agradecemos por fazer parte deste sonho.</p>
        <p className="text-xs mt-4 tracking-[0.3em] uppercase">12 • 02 • 2026</p>
      </footer>
    </div>
  );
}
