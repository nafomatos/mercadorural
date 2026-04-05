"use server";

import { supabase } from "@/lib/supabase";

export type ReviewFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitReview(
  providerId: string,
  formData: { author_name: string; rating: number; comment: string }
): Promise<ReviewFormState> {
  const { author_name, rating, comment } = formData;

  if (!author_name || author_name.trim().length < 2) {
    return { status: "error", message: "Informe seu nome (mínimo 2 caracteres)." };
  }
  if (!rating || rating < 1 || rating > 5) {
    return { status: "error", message: "Selecione uma nota de 1 a 5 estrelas." };
  }

  const { error } = await supabase.from("reviews").insert({
    provider_id: providerId,
    author_name: author_name.trim(),
    rating,
    comment: comment.trim() || null,
  });

  if (error) {
    console.error("Erro ao inserir avaliação:", error.message);
    return { status: "error", message: "Não foi possível salvar sua avaliação. Tente novamente." };
  }

  return { status: "success" };
}
