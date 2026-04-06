"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, type Provider, type ServiceCategory } from "@/lib/supabase";
import { CITY_GROUPS, ALL_CITIES } from "@/lib/cities";
import CitySelect from "@/app/components/CitySelect";

type Tab = "providers" | "add" | "pending" | "importar";

type AddForm = {
  name: string;
  whatsapp: string;
  city: string;
  category_slug: string;
  bio: string;
  verified: boolean;
  status: "active" | "pending";
};

const EMPTY_ADD_FORM: AddForm = {
  name: "",
  whatsapp: "",
  city: "",
  category_slug: "",
  bio: "",
  verified: false,
  status: "active",
};

// ─── Shared helpers ───────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatWhatsApp(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:   { label: "Ativo",     cls: "bg-green-100 text-green-700" },
    pending:  { label: "Pendente",  cls: "bg-amber-100 text-amber-700" },
    rejected: { label: "Rejeitado", cls: "bg-red-100 text-red-700" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-stone-100 text-stone-600" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-verde/10 text-verde">
      ✔ Sim
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-400">
      Não
    </span>
  );
}

const inputCls =
  "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde/30 focus:border-verde transition bg-white";
const selectCls = inputCls;
const labelCls = "block text-xs font-semibold text-stone-600 mb-1 uppercase tracking-wide";

// ─── Tab 1 — Providers list ────────────────────────────────────

function TabProviders({
  providers,
  categories,
  onVerify,
  onDelete,
  onStatusChange,
}: {
  providers: Provider[];
  categories: ServiceCategory[];
  onVerify: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
  onStatusChange: (id: string, status: "active" | "pending" | "rejected") => Promise<void>;
}) {
  const [filterCity, setFilterCity]     = useState("");
  const [filterCat, setFilterCat]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loadingId, setLoadingId]       = useState<string | null>(null);

  const filtered = providers.filter((p) => {
    if (filterCity   && p.city           !== filterCity)   return false;
    if (filterCat    && p.category_slug  !== filterCat)    return false;
    if (filterStatus && p.status         !== filterStatus) return false;
    return true;
  });

  async function act(id: string, fn: () => Promise<void>) {
    setLoadingId(id);
    await fn();
    setLoadingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-stone-50 border border-stone-200 rounded-xl p-4">
        <div className="flex-1 min-w-36">
          <label className={labelCls}>Cidade</label>
          <select className={selectCls} value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
            <option value="">Todas</option>
            {CITY_GROUPS.map((g) => (
              <optgroup key={g.state} label={g.state}>
                {g.cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className={labelCls}>Categoria</label>
          <select className={selectCls} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">Todas</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.emoji} {c.name_pt}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-32">
          <label className={labelCls}>Status</label>
          <select className={selectCls} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="pending">Pendente</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setFilterCity(""); setFilterCat(""); setFilterStatus(""); }}
            className="text-xs text-stone-400 hover:text-terra transition-colors px-2 py-2"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <p className="text-xs text-stone-400">
        {filtered.length} de {providers.length} prestador{providers.length !== 1 ? "es" : ""}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {["Nome", "Cidade", "Categoria", "Status", "Verificado", "Aval.", "Cadastro", "Ações"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-stone-400 text-sm">
                  Nenhum prestador encontrado.
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const cat = categories.find((c) => c.slug === p.category_slug);
              const busy = loadingId === p.id;
              return (
                <tr key={p.id} className={`hover:bg-stone-50 transition-colors ${busy ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 font-medium text-stone-900 whitespace-nowrap">
                    <Link href={`/prestador/${p.id}`} target="_blank" className="hover:text-verde transition-colors">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{p.city}</td>
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                    {cat ? `${cat.emoji} ${cat.name_pt}` : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={p.status}
                      disabled={busy}
                      onChange={(e) => act(p.id, () => onStatusChange(p.id, e.target.value as "active" | "pending" | "rejected"))}
                      className="border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-verde/30 bg-white"
                    >
                      <option value="active">Ativo</option>
                      <option value="pending">Pendente</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      disabled={busy}
                      onClick={() => act(p.id, () => onVerify(p.id, p.verified))}
                      className="hover:opacity-70 transition-opacity"
                      title={p.verified ? "Remover verificação" : "Marcar como verificado"}
                    >
                      <VerifiedBadge verified={p.verified} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-center">{p.review_count}</td>
                  <td className="px-4 py-3 text-stone-400 whitespace-nowrap">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      disabled={busy}
                      onClick={() => act(p.id, () => onDelete(p.id, p.name))}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-40"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab 2 — Add provider manually ────────────────────────────

function TabAddProvider({
  categories,
  onAdd,
}: {
  categories: ServiceCategory[];
  onAdd: (form: AddForm) => Promise<{ error: string | null }>;
}) {
  const [form, setForm]       = useState<AddForm>(EMPTY_ADD_FORM);
  const [errors, setErrors]   = useState<Partial<Record<keyof AddForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: keyof AddForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof AddForm, string>> = {};
    if (!form.name.trim())     e.name      = "Nome obrigatório.";
    const digits = form.whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11)
      e.whatsapp = "WhatsApp inválido (10 ou 11 dígitos com DDD).";
    if (!form.city)            e.city      = "Selecione a cidade.";
    if (!form.category_slug)   e.category_slug = "Selecione a categoria.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await onAdd(form);
    setSubmitting(false);
    if (error) {
      setErrors({ name: error });
    } else {
      setSuccess(true);
      setForm(EMPTY_ADD_FORM);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nome */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Nome completo *</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="Ex: João da Silva" maxLength={100} className={inputCls} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelCls}>WhatsApp com DDD *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">+55</span>
            <input
              type="tel" inputMode="numeric"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="16987654321"
              className={`${inputCls} pl-10`}
            />
          </div>
          {errors.whatsapp && <p className="text-xs text-red-600 mt-1">{errors.whatsapp}</p>}
        </div>

        {/* Cidade */}
        <div>
          <label className={labelCls}>Cidade *</label>
          <CitySelect
            value={form.city}
            onChange={(v) => set("city", v)}
            className={selectCls}
            placeholder="Selecione..."
          />
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
        </div>

        {/* Categoria */}
        <div>
          <label className={labelCls}>Categoria *</label>
          <select value={form.category_slug} onChange={(e) => set("category_slug", e.target.value)} className={selectCls}>
            <option value="">Selecione...</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.emoji} {c.name_pt}</option>)}
          </select>
          {errors.category_slug && <p className="text-xs text-red-600 mt-1">{errors.category_slug}</p>}
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as "active" | "pending")}
            className={selectCls}
          >
            <option value="active">Ativo</option>
            <option value="pending">Pendente</option>
          </select>
        </div>

        {/* Verificado */}
        <div className="flex items-center gap-3 pt-5">
          <input
            id="verified-check"
            type="checkbox"
            checked={form.verified}
            onChange={(e) => set("verified", e.target.checked)}
            className="w-4 h-4 accent-verde"
          />
          <label htmlFor="verified-check" className="text-sm font-medium text-stone-700 cursor-pointer">
            Marcar como verificado
          </label>
        </div>

        {/* Bio */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Bio / Apresentação</label>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value.slice(0, 300))}
            placeholder="Descreva os serviços e experiência do prestador..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
          <p className="text-xs text-stone-400 text-right mt-1">{form.bio.length}/300</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          ✅ Prestador adicionado com sucesso!
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-verde hover:bg-verde-escuro disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-full transition-colors flex items-center gap-2"
        >
          {submitting ? "Salvando..." : "Adicionar prestador"}
        </button>
        <button
          type="button"
          onClick={() => { setForm(EMPTY_ADD_FORM); setErrors({}); setSuccess(false); }}
          className="border border-stone-200 text-stone-600 px-6 py-2.5 rounded-full hover:bg-stone-50 transition-colors text-sm"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}

// ─── Tab 3 — Pending approval ─────────────────────────────────

function TabPending({
  pending,
  categories,
  onApprove,
  onReject,
}: {
  pending: Provider[];
  categories: ServiceCategory[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, name: string) => Promise<void>;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function act(id: string, fn: () => Promise<void>) {
    setLoadingId(id);
    await fn();
    setLoadingId(null);
  }

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="text-4xl">✅</span>
        <p className="font-semibold text-stone-700">Nenhum cadastro pendente</p>
        <p className="text-sm text-stone-400">Todos os prestadores estão aprovados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
        {pending.length} prestador{pending.length > 1 ? "es" : ""} aguardando aprovação.
      </p>

      <div className="flex flex-col gap-3">
        {pending.map((p) => {
          const cat = categories.find((c) => c.slug === p.category_slug);
          const busy = loadingId === p.id;
          return (
            <div
              key={p.id}
              className={`bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-4 transition-opacity ${busy ? "opacity-60 pointer-events-none" : ""}`}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-stone-900">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-stone-500">
                  📍 {p.city}
                  {cat && <> · {cat.emoji} {cat.name_pt}</>}
                </p>
                <p className="text-sm text-stone-500">
                  📞 {formatWhatsApp(p.whatsapp)}
                </p>
                {p.bio && (
                  <p className="text-sm text-stone-600 mt-2 line-clamp-2">{p.bio}</p>
                )}
                <p className="text-xs text-stone-400 mt-2">
                  Cadastrado em {formatDate(p.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Link
                  href={`/prestador/${p.id}`}
                  target="_blank"
                  className="text-xs text-verde hover:underline font-medium text-center"
                >
                  Ver perfil ↗
                </Link>
                <button
                  onClick={() => act(p.id, () => onApprove(p.id))}
                  className="bg-verde hover:bg-verde-escuro text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  ✔ Aprovar
                </button>
                <button
                  onClick={() => act(p.id, () => onReject(p.id, p.name))}
                  className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  ✕ Rejeitar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 4 — Google Places importer ──────────────────────────

function TabImportar({ categories }: { categories: ServiceCategory[] }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity]         = useState("");
  const [log, setLog]                           = useState("");
  const [running, setRunning]                   = useState(false);
  const [summary, setSummary]                   = useState<{ inserted: number; skipped: number } | null>(null);
  const logRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll the log textarea as new lines arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  // Live count of expected combinations
  const catCount   = selectedCategory ? 1 : categories.length;
  const cityCount  = selectedCity     ? 1 : ALL_CITIES.length;
  const combos     = catCount * cityCount;
  const maxProviders = combos * 3;

  async function handleStart() {
    setRunning(true);
    setLog("");
    setSummary(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const body: Record<string, string> = {};
    if (selectedCategory) body.category_slug = selectedCategory;
    if (selectedCity)     body.city           = selectedCity;

    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setLog(`✗ Erro ${res.status}: ${await res.text()}`);
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let fullLog   = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullLog += decoder.decode(value, { stream: true });
        setLog(fullLog);
      }

      // Parse machine-readable summary line
      const m = fullLog.match(/TOTAL:inserted=(\d+),skipped=(\d+)/);
      if (m) setSummary({ inserted: parseInt(m[1]), skipped: parseInt(m[2]) });
    } catch (err: unknown) {
      const isAbort = (err as { name?: string }).name === "AbortError";
      if (!isAbort) setLog((prev) => prev + `\n✗ Erro de conexão: ${err}\n`);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setRunning(false);
    setLog((prev) => prev + "\n⚠ Importação interrompida pelo usuário.\n");
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Controls */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-44">
          <label className={labelCls}>Categoria</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={running}
            className={selectCls}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.emoji} {c.name_pt}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-44">
          <label className={labelCls}>Cidade</label>
          <CitySelect
            value={selectedCity}
            onChange={setSelectedCity}
            className={selectCls}
            placeholder="Todas"
            disabled={running}
          />
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <p className="text-xs font-mono text-stone-400 whitespace-nowrap">
            {combos} combinaç{combos === 1 ? "ão" : "ões"} · máx.{" "}
            <span className="text-stone-600 font-semibold">{maxProviders}</span> prestadores
          </p>
          {!running ? (
            <button
              onClick={handleStart}
              className="bg-verde hover:bg-verde-escuro text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              🔍 Iniciar importação
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold px-5 py-2 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Parar
            </button>
          )}
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex gap-2">
        <span className="shrink-0 mt-0.5">⚠️</span>
        <span>
          A importação pode levar <strong>10–15 minutos</strong> para todas as combinações.
          Não feche esta página. Resultados entram como <strong>Pendentes</strong> — revise
          na aba Pendentes antes de publicar.
        </span>
      </div>

      {/* Live log */}
      {(log || running) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Log</label>
            {running && (
              <span className="text-xs text-stone-400 animate-pulse">● importando...</span>
            )}
          </div>
          <textarea
            ref={logRef}
            value={log}
            readOnly
            rows={22}
            className="w-full font-mono text-xs bg-stone-900 text-green-400 rounded-xl p-4 resize-y focus:outline-none leading-relaxed"
          />
        </div>
      )}

      {/* Summary card */}
      {summary && (
        <div className="bg-verde/5 border border-verde/20 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex gap-8 flex-1">
            <div className="text-center">
              <p className="text-3xl font-bold text-verde">{summary.inserted}</p>
              <p className="text-xs text-stone-500 mt-0.5">inserido(s)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-stone-300">{summary.skipped}</p>
              <p className="text-xs text-stone-500 mt-0.5">ignorado(s)</p>
            </div>
          </div>
          <p className="text-sm text-stone-600 max-w-xs">
            Novos perfis aguardam revisão na aba{" "}
            <strong className="text-amber-700">Pendentes</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab]     = useState<Tab>("providers");
  const [providers, setProviders]     = useState<Provider[]>([]);
  const [categories, setCategories]   = useState<ServiceCategory[]>([]);
  const [loading, setLoading]         = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: provs }, { data: cats }] = await Promise.all([
      supabase.from("providers").select("*").order("created_at", { ascending: false }),
      supabase.from("service_categories").select("*").order("order_index"),
    ]);
    setProviders(provs ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Mutations ──────────────────────────────────────────────

  async function handleVerify(id: string, current: boolean) {
    await supabase.from("providers").update({ verified: !current }).eq("id", id);
    await fetchAll();
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    await supabase.from("providers").delete().eq("id", id);
    await fetchAll();
  }

  async function handleStatusChange(id: string, status: "active" | "pending" | "rejected") {
    await supabase.from("providers").update({ status }).eq("id", id);
    await fetchAll();
  }

  async function handleApprove(id: string) {
    await supabase.from("providers").update({ status: "active" }).eq("id", id);
    await fetchAll();
  }

  async function handleReject(id: string, name: string) {
    if (!window.confirm(`Rejeitar e excluir "${name}"?`)) return;
    await supabase.from("providers").delete().eq("id", id);
    await fetchAll();
  }

  async function handleAdd(form: AddForm): Promise<{ error: string | null }> {
    const { error } = await supabase.from("providers").insert({
      name:          form.name.trim(),
      whatsapp:      form.whatsapp.replace(/\D/g, ""),
      city:          form.city,
      category_slug: form.category_slug || null,
      bio:           form.bio.trim() || null,
      verified:      form.verified,
      status:        form.status,
    });
    if (error) return { error: error.message };
    await fetchAll();
    return { error: null };
  }

  // ── Tab config ─────────────────────────────────────────────

  const pending = providers.filter((p) => p.status === "pending");

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "providers", label: "Prestadores", badge: providers.length },
    { id: "add",       label: "Adicionar"   },
    { id: "pending",   label: "Pendentes",   badge: pending.length  },
    { id: "importar",  label: "Importar"    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin header */}
      <header className="bg-verde-escuro text-white px-4 py-4 shadow-md">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌾</span>
            <div>
              <p className="font-bold text-base leading-tight">MercadoRural</p>
              <p className="text-green-300 text-xs">Painel Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-green-200 hover:text-white transition-colors">
              ← Site
            </Link>
            <Link href="/buscar" className="text-green-200 hover:text-white transition-colors">
              Prestadores
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Tab navigation */}
        <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1 w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-verde text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : tab.id === "pending" && tab.badge > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-400 gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Carregando dados...
          </div>
        ) : (
          <>
            {activeTab === "providers" && (
              <TabProviders
                providers={providers}
                categories={categories}
                onVerify={handleVerify}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            )}
            {activeTab === "add" && (
              <TabAddProvider categories={categories} onAdd={handleAdd} />
            )}
            {activeTab === "pending" && (
              <TabPending
                pending={pending}
                categories={categories}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
            {activeTab === "importar" && (
              <TabImportar categories={categories} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
