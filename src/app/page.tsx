"use client";

import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const pixKey = "victorya.a.v.a.s.b.b@gmail.com";
  const [copied, setCopied] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState("yes");
  const [acompanhantes, setAcompanhantes] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [showModal, setShowModal] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const storedName = typeof window !== "undefined" ? localStorage.getItem("guestName") : null;
    if (storedName) {
      setGuestName(storedName);
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setFeedback(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const trimmedName = guestName.trim();
    if (!trimmedName) {
      setFeedback({ type: "error", message: "Informe o nome completo." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: trimmedName,
          vai: attendance === "yes",
          acompanhantes: Number(acompanhantes) || 0,
          presentesIds: [],
          presenteNome: null,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Não foi possível enviar sua resposta.");
      }

      setFeedback({ type: "success", message: "Presença registrada com sucesso!" });
      if (typeof window !== "undefined") {
        localStorage.setItem("guestName", trimmedName);
      }
      setGuestName("");
      setAttendance("yes");
      setAcompanhantes("0");
      setShowModal(true);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error?.message || "Erro inesperado ao enviar sua resposta.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--color-cream)] text-[var(--color-text)]">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-24 text-center js-fade"
        style={{ transform: "translateY(-50px)" }}
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

        <div className="absolute bottom-15 text-[var(--color-gold)] animate-bounce text-xs md:text-base tracking-[0.4em] uppercase">
          role para descobrir
        </div>
      </section>

      {/* Nossa História */}
      <section id="historia" className="section-wrapper js-fade">
        <div className="section-heading">
          <p className="accent-pill">Nossa História</p>
          <h2>Amor escrito nas pequenas coisas</h2>
          <p >
            Há 10 anos, Deus cruzou nossos caminhos em uma rua simples.
            Entre risadas, amizade, igreja, encontros e promessas, o amor cresceu.
            Hoje, escolhemos caminhar juntos para sempre.
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
            <p className="detail-value">Por volta das 15:00</p>
          </div>
          <div className="section-card">
            <p className="detail-label">Local</p>
            <p className="detail-value">Condomínio Residencial Orion</p>
          </div>
        </div>
        <div className="mt-10 space-y-4">
          <iframe
            title="Mapa do local"
            src="https://www.google.com/maps?q=-21.788695045929597,-41.297876050024705&output=embed"
            loading="lazy"
            className="w-full h-72 rounded-3xl border border-[var(--color-gold)]/30 shadow-soft"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href="https://www.google.com/maps?q=-21.788695045929597,-41.297876050024705"
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
          <p>Por favor, confirme até 30 de janeiro para organizarmos tudo com carinho.</p>
        </div>
        <form className="section-card rsvp-form" onSubmit={handleSubmit}>
          <label>
            Nome completo
            <input
              type="text"
              placeholder="Digite seu nome"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              required
            />
          </label>
          <label className="mt-5">
            Você poderá comparecer?
            <select
              required
              value={attendance}
              onChange={(event) => setAttendance(event.target.value)}
            >
              <option value="yes">Sim, estarei presente</option>
              <option value="no">Infelizmente não poderei</option>
            </select>
          </label>
          <div className="mt-6 flex flex-col gap-3" id="presentes-rsvp">
            <p className="text-sm text-[var(--color-muted)]">
              Gostaria de nos presentear? Veja a lista completa e selecione seus itens na página dedicada.
            </p>
            <a
              href="/presentes"
              className="btn-secondary w-full md:w-auto text-center"
            >
              Gostaria de presentear?
            </a>
          </div>
          {feedback && (
            <p
              className={`mt-3 text-sm ${
                feedback.type === "success"
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {feedback.message}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary w-full md:w-auto mt-5"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Resposta"}
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
              {copied ? "Chave pix copiada! " : "Clique para copiar a chave Pix."}
            </p>
          </button>
          <a
            href="/presentes"
            className="section-card block hover:border-[var(--color-gold)]/50 transition"
          >
            <p className="detail-label">Lista de Presentes</p>
            <p className="detail-value">Escolher presentes</p>
            <p className="text-sm text-[var(--color-muted)]">
              Abrir página dedicada para seleção de presentes.
            </p>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center bg-white text-[var(--color-muted)]">
        <p className="font-script text-3xl text-[var(--color-gold)]">Marlon & Victorya</p>
        <p className="text-sm mt-2">Agradecemos por fazer parte deste sonho.</p>
        <p className="text-xs mt-4 tracking-[0.3em] uppercase">12 • 02 • 2026</p>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white text-[var(--color-text)] rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-7 border border-[var(--color-gold)]/20">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Presença confirmada!</h3>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Obrigado pelo carinho. Em breve entraremos em contato com mais detalhes.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="btn-primary w-full md:w-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
