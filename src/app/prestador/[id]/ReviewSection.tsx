"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitReview, type ReviewFormState } from "./actions";

type Props = {
  providerId: string;
  providerName: string;
};

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Nota">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          className="focus:outline-none"
        >
          <svg
            className={`w-9 h-9 transition-colors ${
              star <= active ? "text-yellow-400" : "text-stone-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const STAR_LABELS = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"];

export default function ReviewSection({ providerId, providerName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ReviewFormState>({ status: "idle" });

  // Form fields
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  function handleOpen() {
    setState({ status: "idle" });
    setAuthorName("");
    setRating(0);
    setComment("");
    setOpen(true);
  }

  function handleClose() {
    if (!isPending) setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitReview(providerId, {
        author_name: authorName,
        rating,
        comment,
      });
      setState(result);
      if (result.status === "success") {
        router.refresh(); // re-fetch reviews server-side
      }
    });
  }

  return (
    <>
      {/* Sticky CTA */}
      <div className="sticky bottom-16 sm:bottom-0 z-40 flex justify-center pb-4 pointer-events-none">
        <button
          onClick={handleOpen}
          className="pointer-events-auto bg-terra hover:bg-terra-claro text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors"
        >
          ✏️ Deixar avaliação
        </button>
      </div>

      {/* Modal / bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Formulário de avaliação"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl px-5 pt-5 pb-8 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            {/* Drag handle (mobile) */}
            <div className="sm:hidden w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-bold text-stone-900 text-lg">Avaliar profissional</h2>
                <p className="text-stone-500 text-sm">{providerName}</p>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="text-stone-400 hover:text-stone-600 transition-colors p-1 -mt-1 -mr-1"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {state.status === "success" ? (
              /* Success state */
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <span className="text-5xl">🌟</span>
                <p className="font-semibold text-stone-900 text-lg">Avaliação enviada!</p>
                <p className="text-stone-500 text-sm">
                  Obrigado por ajudar outros produtores a encontrar bons profissionais.
                </p>
                <button
                  onClick={handleClose}
                  className="bg-verde text-white font-semibold px-6 py-2.5 rounded-full hover:bg-verde-escuro transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Star picker */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Sua nota <span className="text-terra">*</span>
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <p className="text-sm text-stone-500 mt-1">{STAR_LABELS[rating]}</p>
                  )}
                </div>

                {/* Author name */}
                <div>
                  <label
                    htmlFor="author_name"
                    className="block text-sm font-semibold text-stone-700 mb-1.5"
                  >
                    Seu nome <span className="text-terra">*</span>
                  </label>
                  <input
                    id="author_name"
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex: João Silva"
                    maxLength={80}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde/40 focus:border-verde transition"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-semibold text-stone-700 mb-1.5"
                  >
                    Comentário
                    <span className="font-normal text-stone-400 ml-1">(opcional)</span>
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte como foi sua experiência com este profissional..."
                    rows={4}
                    maxLength={500}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde/40 focus:border-verde transition resize-none"
                  />
                  <p className="text-xs text-stone-400 text-right mt-1">{comment.length}/500</p>
                </div>

                {/* Error message */}
                {state.status === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    {state.message}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-verde hover:bg-verde-escuro disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors"
                >
                  {isPending ? "Enviando..." : "Enviar avaliação"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
