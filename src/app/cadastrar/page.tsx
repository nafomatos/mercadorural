"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, type ServiceCategory } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────

const CITIES = [
  "Ribeirão Preto",
  "Sertãozinho",
  "Jaboticabal",
  "Uberaba",
  "Uberlândia",
  "Araguari",
];

const TOTAL_STEPS = 3;

// ─── Types ────────────────────────────────────────────────────

type FormData = {
  name: string;
  whatsapp: string;
  city: string;
  category_slug: string;
  bio: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMPTY_FORM: FormData = {
  name: "",
  whatsapp: "",
  city: "",
  category_slug: "",
  bio: "",
};

// ─── Validation ───────────────────────────────────────────────

function validateStep1(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2)
    errors.name = "Informe seu nome completo (mínimo 2 caracteres).";
  const digits = form.whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11)
    errors.whatsapp = "Informe um WhatsApp válido com DDD (ex: 16987654321).";
  if (!form.city)
    errors.city = "Selecione sua cidade.";
  return errors;
}

function validateStep2(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.category_slug)
    errors.category_slug = "Selecione uma categoria de serviço.";
  if (!form.bio.trim() || form.bio.trim().length < 20)
    errors.bio = "A apresentação deve ter pelo menos 20 caracteres.";
  return errors;
}

// ─── Progress Bar ─────────────────────────────────────────────

const STEP_LABELS = ["Dados pessoais", "Serviços", "Confirmação"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  done
                    ? "bg-verde border-verde text-white"
                    : active
                    ? "bg-white border-verde text-verde"
                    : "bg-white border-stone-200 text-stone-400"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                  active ? "text-verde" : done ? "text-verde" : "text-stone-400"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors ${
                  done ? "bg-verde" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-stone-700 mb-1.5">
      {children}
      {required && <span className="text-terra ml-0.5">*</span>}
    </label>
  );
}

const inputClass = (hasError?: string) =>
  `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-verde/40 focus:border-verde transition ${
    hasError ? "border-red-400 bg-red-50" : "border-stone-200 bg-white"
  }`;

// ─── Step 1: Dados pessoais ───────────────────────────────────

function Step1({
  form,
  errors,
  onChange,
}: {
  form: FormData;
  errors: FormErrors;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Seus dados</h2>
        <p className="text-stone-500 text-sm mt-0.5">
          Como produtores vão te encontrar no MercadoRural.
        </p>
      </div>

      {/* Nome */}
      <div>
        <Label htmlFor="name" required>Nome completo</Label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Ex: João da Silva"
          maxLength={100}
          className={inputClass(errors.name)}
          autoComplete="name"
        />
        <FieldError msg={errors.name} />
      </div>

      {/* WhatsApp */}
      <div>
        <Label htmlFor="whatsapp" required>WhatsApp com DDD</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm select-none">
            +55
          </span>
          <input
            id="whatsapp"
            type="tel"
            inputMode="numeric"
            value={form.whatsapp}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              onChange("whatsapp", digits);
            }}
            placeholder="16987654321"
            className={`${inputClass(errors.whatsapp)} pl-12`}
            autoComplete="tel"
          />
        </div>
        <p className="text-xs text-stone-400 mt-1">Somente números. Ex: 16987654321</p>
        <FieldError msg={errors.whatsapp} />
      </div>

      {/* Cidade */}
      <div>
        <Label htmlFor="city" required>Cidade</Label>
        <select
          id="city"
          value={form.city}
          onChange={(e) => onChange("city", e.target.value)}
          className={inputClass(errors.city)}
        >
          <option value="">Selecione sua cidade...</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <FieldError msg={errors.city} />
      </div>
    </div>
  );
}

// ─── Step 2: Serviços ─────────────────────────────────────────

function Step2({
  form,
  errors,
  categories,
  categoriesLoading,
  onChange,
}: {
  form: FormData;
  errors: FormErrors;
  categories: ServiceCategory[];
  categoriesLoading: boolean;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  const bioLen = form.bio.trim().length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Seus serviços</h2>
        <p className="text-stone-500 text-sm mt-0.5">
          Conte o que você oferece para que os produtores te encontrem.
        </p>
      </div>

      {/* Categoria */}
      <div>
        <Label htmlFor="category_slug" required>Categoria de serviço</Label>
        <select
          id="category_slug"
          value={form.category_slug}
          onChange={(e) => onChange("category_slug", e.target.value)}
          disabled={categoriesLoading}
          className={inputClass(errors.category_slug)}
        >
          <option value="">
            {categoriesLoading ? "Carregando categorias..." : "Selecione uma categoria..."}
          </option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.emoji} {cat.name_pt}
            </option>
          ))}
        </select>
        <FieldError msg={errors.category_slug} />
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio" required>Apresentação / Bio</Label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={(e) => onChange("bio", e.target.value.slice(0, 300))}
          placeholder="Descreva sua experiência, serviços que oferece e diferenciais. Ex: Veterinário com 10 anos de experiência em pecuária bovina e equina..."
          rows={5}
          className={`${inputClass(errors.bio)} resize-none`}
        />
        <div className="flex items-center justify-between mt-1">
          <FieldError msg={errors.bio} />
          <span
            className={`text-xs ml-auto shrink-0 ${
              bioLen < 20 ? "text-stone-400" : bioLen >= 280 ? "text-terra" : "text-verde"
            }`}
          >
            {bioLen}/300
          </span>
        </div>
        {bioLen > 0 && bioLen < 20 && !errors.bio && (
          <p className="text-xs text-stone-400">
            Faltam {20 - bioLen} caracteres para o mínimo.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Confirmação ──────────────────────────────────────

function Step3({
  form,
  categories,
  submitError,
}: {
  form: FormData;
  categories: ServiceCategory[];
  submitError: string | null;
}) {
  const cat = categories.find((c) => c.slug === form.category_slug);
  const wpp = form.whatsapp.replace(/\D/g, "");
  const wppFormatted =
    wpp.length === 11
      ? `(${wpp.slice(0, 2)}) ${wpp.slice(2, 7)}-${wpp.slice(7)}`
      : wpp.length === 10
      ? `(${wpp.slice(0, 2)}) ${wpp.slice(2, 6)}-${wpp.slice(6)}`
      : form.whatsapp;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Confirme seus dados</h2>
        <p className="text-stone-500 text-sm mt-0.5">
          Revise tudo antes de publicar seu perfil.
        </p>
      </div>

      <div className="bg-stone-50 rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
        <Row label="Nome" value={form.name} />
        <Row label="WhatsApp" value={`+55 ${wppFormatted}`} />
        <Row label="Cidade" value={form.city} />
        <Row
          label="Categoria"
          value={cat ? `${cat.emoji} ${cat.name_pt}` : form.category_slug}
        />
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
            Apresentação
          </p>
          <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">{form.bio}</p>
        </div>
      </div>

      <div className="bg-palha border border-verde/20 rounded-xl px-4 py-3 flex gap-3 text-sm text-stone-700">
        <span className="text-lg shrink-0">ℹ️</span>
        <p>
          Seu perfil será publicado como <strong>não verificado</strong>. Nossa equipe pode
          entrar em contato para verificação via WhatsApp.
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex items-start gap-4">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide w-24 shrink-0 mt-0.5">
        {label}
      </p>
      <p className="text-sm text-stone-800 font-medium">{value}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function CadastrarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("service_categories")
      .select("*")
      .order("order_index")
      .then(({ data }) => {
        setCategories(data ?? []);
        setCategoriesLoading(false);
      });
  }, []);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleNext() {
    const errs = step === 1 ? validateStep1(form) : validateStep2(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const { data, error } = await supabase
      .from("providers")
      .insert({
        name: form.name.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        city: form.city,
        category_slug: form.category_slug,
        bio: form.bio.trim(),
        verified: false,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error(error);
      setSubmitError("Não foi possível publicar seu perfil. Tente novamente.");
      setSubmitting(false);
      return;
    }

    router.push(`/prestador/${data.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="bg-verde text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-lg leading-tight">
              Mercado<span className="text-verde-claro">Rural</span>
            </span>
          </Link>
          <p className="text-sm text-green-100 hidden sm:block">
            Cadastre-se gratuitamente
          </p>
          <Link
            href="/buscar"
            className="text-green-200 hover:text-white text-sm transition-colors shrink-0"
          >
            Ver profissionais
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8 pb-24 sm:pb-8">
        <div className="w-full max-w-lg">
          {/* Page title */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-stone-900">
              Cadastre-se no MercadoRural
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Apareça para milhares de produtores rurais gratuitamente.
            </p>
          </div>

          <ProgressBar step={step} />

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-sm">
            {step === 1 && (
              <Step1 form={form} errors={errors} onChange={handleChange} />
            )}
            {step === 2 && (
              <Step2
                form={form}
                errors={errors}
                categories={categories}
                categoriesLoading={categoriesLoading}
                onChange={handleChange}
              />
            )}
            {step === 3 && (
              <Step3
                form={form}
                categories={categories}
                submitError={submitError}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="flex-1 sm:flex-none border border-stone-200 text-stone-600 font-semibold px-6 py-3 rounded-full hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  ← Voltar
                </button>
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-verde hover:bg-verde-escuro text-white font-semibold px-6 py-3 rounded-full transition-colors"
                >
                  Continuar →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-terra hover:bg-terra-claro disabled:opacity-60 text-white font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Publicando...
                    </>
                  ) : (
                    "🌾 Publicar meu perfil"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Step counter (mobile) */}
          <p className="text-center text-xs text-stone-400 mt-4 sm:hidden">
            Passo {step} de {TOTAL_STEPS}
          </p>
        </div>
      </main>

      {/* Bottom Nav – mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center py-2 z-40">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        <Link href="/buscar" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">🔍</span>
          <span className="text-[10px] font-medium">Buscar</span>
        </Link>
        <Link href="/cadastrar" className="flex flex-col items-center gap-0.5 text-verde">
          <span className="text-xl">➕</span>
          <span className="text-[10px] font-medium">Anunciar</span>
        </Link>
        <Link href="/mensagens" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">💬</span>
          <span className="text-[10px] font-medium">Mensagens</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center gap-0.5 text-stone-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
