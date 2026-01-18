"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Gift = {
  id: number;
  nome: string;
  idconvidado: number | null;
};

export default function PresentesPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPresetIds, setSelectedPresetIds] = useState<number[]>([]);
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customGift, setCustomGift] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameModalError, setNameModalError] = useState<string | null>(null);
  const [modalGifts, setModalGifts] = useState<{ presetIds: number[]; custom: string }>(
    { presetIds: [], custom: "" }
  );

  useEffect(() => {
    const loadGifts = async () => {
      setLoadError(null);
      try {
        const response = await fetch("/api/presentes");
        if (!response.ok) {
          throw new Error("Não foi possível carregar os presentes.");
        }
        const data: Gift[] = await response.json();
        setGifts(data);
        setLoadError(null);
      } catch (error: any) {
        setLoadError(error?.message || "Erro ao carregar presentes.");
      } finally {
        setGiftsLoading(false);
      }
    };

    loadGifts();
  }, []);

  useEffect(() => {
    const storedName = typeof window !== "undefined" ? localStorage.getItem("guestName") : null;
    if (storedName) {
      setGuestName(storedName);
      setNameInput(storedName);
    }
  }, []);

  // Garante que as seções com js-fade fiquem visíveis nesta página
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".js-fade");
    elements.forEach((el) => {
      // usa next tick para aplicar a classe depois do paint inicial
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
  }, []);

  const handlePresetToggle = (gift: Gift) => {
    setSelectedPresetIds((prev) => {
      if (prev.includes(gift.id)) {
        return prev.filter((id) => id !== gift.id);
      }
      return [...prev, gift.id];
    });
    setFeedback(null);
  };

  const handleSelectOthers = () => {
    setCustomEnabled((prev) => !prev);
    if (customEnabled) {
      setCustomGift("");
    }
    setFeedback(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setFeedback(null);
  };

  const closeNameModal = () => {
    setShowNameModal(false);
    setNameModalError(null);
  };

  const sortedGifts = useMemo(() => {
    return [...gifts].sort((a, b) => {
      const aTaken = Boolean(a.idconvidado);
      const bTaken = Boolean(b.idconvidado);
      if (aTaken !== bTaken) return aTaken ? 1 : -1;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [gifts]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const giftName = customEnabled ? customGift.trim() : "";
    if (customEnabled && !giftName) {
      setFeedback({ type: "error", message: "Descreva o presente em 'Outros'." });
      return;
    }

    const trimmedName = guestName.trim();
    if (!trimmedName) {
      setNameModalError(null);
      setNameInput((value) => value || guestName || "");
      setShowNameModal(true);
      return;
    }

    await submitGifts(trimmedName, giftName);
  };

  const submitGifts = async (name: string, giftNameFromCaller?: string) => {
    const giftName = giftNameFromCaller ?? (customEnabled ? customGift.trim() : "");

    setIsSubmitting(true);
    try {
      const chosenPresetIds = [...selectedPresetIds];
      const chosenCustom = customEnabled ? giftName : "";

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: name,
          vai: true,
          acompanhantes: 0,
          presentesIds: selectedPresetIds,
          presenteNome: giftName || null,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Não foi possível reservar os presentes.");
      }

      const responseData = await response.json();
      if (Array.isArray(responseData?.presentes)) {
        const linkedIds = new Set<number>();
        responseData.presentes.forEach((p: any) => {
          if (typeof p?.id === "number") linkedIds.add(p.id);
        });
        setGifts((prev) =>
          prev.map((gift) =>
            linkedIds.has(gift.id)
              ? { ...gift, idconvidado: responseData.convidado?.id ?? gift.idconvidado }
              : gift
          )
        );
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("guestName", name);
      }
      setFeedback({ type: "success", message: "Presentes reservados com sucesso!" });
      setModalGifts({ presetIds: chosenPresetIds, custom: chosenCustom });
      setSelectedPresetIds([]);
      setCustomEnabled(false);
      setCustomGift("");
      setShowModal(true);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error?.message || "Erro inesperado ao reservar presentes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmNameAndSubmit = async () => {
    setNameModalError(null);
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameModalError("Informe seu nome para vincular os presentes.");
      return;
    }
    setGuestName(trimmed);
    setShowNameModal(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("guestName", trimmed);
    }
    await submitGifts(trimmed);
  };

  return (
    <div className="bg-[var(--color-cream)] text-[var(--color-text)] min-h-screen">
      <section className="section-wrapper js-fade">
        <div className="section-heading">
          <p className="accent-pill">Presentes</p>
          <h2>Escolha algo especial</h2>
          <p>
            Selecione os itens disponíveis ou descreva um presente personalizado. Usaremos o nome informado na
            confirmação de presença; se ainda não informou, vamos pedir antes de concluir.
          </p>
          {loadError && (
            <p className="text-sm text-red-700 mt-2">{loadError}</p>
          )}
        </div>

        <div className="section-card">
          <form className="rsvp-form" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] -mt-1">
              <span>Nome para vincular:</span>
              <strong className="text-[var(--color-text)]">{guestName.trim() || "não informado"}</strong>
            </div>
            <div className="mt-5">
              <label className="block mb-2">Selecione os presentes</label>
              <div className="bg-white rounded-2xl border-2 border-[var(--color-gold)]/60 shadow-soft p-4 max-h-[35rem] overflow-y-auto">
                {giftsLoading ? (
                  <p className="text-sm text-[var(--color-muted)]">Carregando presentes...</p>
                ) : !sortedGifts.length && !loadError ? (
                  <p className="text-sm text-[var(--color-muted)]">Nenhum presente cadastrado no momento.</p>
                ) : (
                  <div className="grid gap-2">
                    {sortedGifts.map((gift) => {
                      const isReceived = Boolean(gift.idconvidado);
                      const isSelected = selectedPresetIds.includes(gift.id);

                      return (
                        <button
                          key={gift.id}
                          type="button"
                          onClick={() => !isReceived && handlePresetToggle(gift)}
                          disabled={isReceived}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg text-left transition-all
                            ${isReceived 
                              ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                              : isSelected
                                ? 'bg-[var(--color-gold)]/10 border-2 border-[var(--color-gold)]' 
                                : 'hover:bg-[var(--color-gold)]/5 border-2 border-transparent'
                            }
                          `}
                        >
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                            ${isReceived 
                              ? 'border-[var(--color-gold)] bg-[var(--color-gold)]' 
                              : isSelected
                                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                                : 'border-gray-300'
                            }
                          `}>
                            {(isReceived || isSelected) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={isReceived ? 'line-through' : ''}>
                            {gift.nome}
                          </span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleSelectOthers}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg text-left transition-all
                        ${customEnabled
                          ? 'bg-[var(--color-gold)]/10 border-2 border-[var(--color-gold)]'
                          : 'hover:bg-[var(--color-gold)]/5 border-2 border-transparent'
                        }
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                        ${customEnabled ? 'border-[var(--color-gold)] bg-[var(--color-gold)]' : 'border-gray-300'}
                      `}>
                        {customEnabled && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span>Outro presente</span>
                    </button>
                  </div>
                )}
              </div>
              {selectedPresetIds.length > 0 && (
                <p className="text-sm text-[var(--color-muted)] mt-3">
                  Presente(s) selecionado(s): {gifts
                    .filter((gift) => selectedPresetIds.includes(gift.id))
                    .map((gift) => gift.nome)
                    .join(", ")}
                </p>
              )}
            </div>

            {customEnabled && (
              <label className="mt-5">
                Descreva o presente
                <input
                  type="text"
                  placeholder="Ex: Cesta de café da manhã"
                  value={customGift}
                  onChange={(e) => setCustomGift(e.target.value)}
                  required
                />
              </label>
            )}

            {feedback && (
              <p
                className={`mt-3 text-sm ${
                  feedback.type === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {feedback.message}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Confirmar presentes"}
              </button>
              <a href="/#rsvp" className="btn-secondary">
                Voltar para presença
              </a>
            </div>
          </form>
        </div>
      </section>

      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeNameModal}
          />
          <div className="relative bg-white text-[var(--color-text)] rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-7 border border-[var(--color-gold)]/20">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-semibold">Informe seu nome</h3>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Precisamos do nome para vincular os presentes à confirmação de presença.
                </p>
              </div>
              <label className="flex flex-col gap-2 text-sm text-[var(--color-text)]">
                Nome completo
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Digite seu nome"
                  autoFocus
                />
              </label>
              {nameModalError && (
                <p className="text-sm text-red-600">{nameModalError}</p>
              )}
              <div className="flex flex-wrap gap-3 justify-end">
                <button type="button" className="btn-secondary" onClick={closeNameModal}>
                  Voltar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmNameAndSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Continuar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Presentes reservados!</h3>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Obrigado pelo carinho. Esses itens já estão associados ao seu nome.
                </p>
              </div>
              {modalGifts.presetIds.length > 0 && (
                <p className="text-sm text-[var(--color-text)]">
                  Presente(s): <strong>{gifts
                    .filter((gift) => modalGifts.presetIds.includes(gift.id))
                    .map((gift) => gift.nome)
                    .join(", ")}</strong>
                </p>
              )}
              {modalGifts.custom && (
                <p className="text-sm text-[var(--color-text)]">
                  Presente informado: <strong>{modalGifts.custom}</strong>
                </p>
              )}
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

