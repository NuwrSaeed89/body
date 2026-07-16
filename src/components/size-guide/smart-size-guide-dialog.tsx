"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BODY_TYPES,
  HEIGHT_CM_LIMITS,
  MBODY_SIZE_CHART,
  WEIGHT_KG_LIMITS,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  recommendSize,
  type BodyType,
  type MbodySize,
  type SizeRecommendation,
} from "@/lib/size-guide";

type UnitSystem = "metric" | "imperial";

type SmartSizeGuideDialogProps = {
  open: boolean;
  onClose: () => void;
  availableSizes?: readonly string[];
  onApplySize?: (size: MbodySize) => void;
};

export function SmartSizeGuideDialog({
  open,
  onClose,
  availableSizes,
  onApplySize,
}: SmartSizeGuideDialogProps) {
  const t = useTranslations("sizeGuide");
  const titleId = useId();
  const heightId = useId();
  const weightId = useId();

  const [units, setUnits] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("165");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("5");
  const [weightKg, setWeightKg] = useState("60");
  const [weightLb, setWeightLb] = useState("132");
  const [bodyType, setBodyType] = useState<BodyType>("athletic");
  const [result, setResult] = useState<SizeRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const chartRows = useMemo(() => MBODY_SIZE_CHART, []);

  if (!open) return null;

  function resolveMetricInput(): { heightCm: number; weightKg: number } | null {
    if (units === "metric") {
      const h = Number(heightCm);
      const w = Number(weightKg);
      if (!Number.isFinite(h) || !Number.isFinite(w)) return null;
      return { heightCm: h, weightKg: w };
    }

    const ft = Number(heightFt);
    const inch = Number(heightIn);
    const lb = Number(weightLb);
    if (!Number.isFinite(ft) || !Number.isFinite(inch) || !Number.isFinite(lb)) return null;
    return {
      heightCm: feetInchesToCm(ft, inch),
      weightKg: lbToKg(lb),
    };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const metrics = resolveMetricInput();
    if (!metrics) {
      setError(t("errors.invalid"));
      setResult(null);
      return;
    }

    if (
      metrics.heightCm < HEIGHT_CM_LIMITS.min ||
      metrics.heightCm > HEIGHT_CM_LIMITS.max ||
      metrics.weightKg < WEIGHT_KG_LIMITS.min ||
      metrics.weightKg > WEIGHT_KG_LIMITS.max
    ) {
      setError(t("errors.outOfRange"));
      setResult(null);
      return;
    }

    const recommendation = recommendSize({
      ...metrics,
      bodyType,
      availableSizes,
    });

    if (!recommendation) {
      setError(t("errors.noMatch"));
      setResult(null);
      return;
    }

    setResult(recommendation);
  }

  function switchUnits(next: UnitSystem) {
    if (next === units) return;

    if (next === "imperial") {
      const h = Number(heightCm);
      const w = Number(weightKg);
      if (Number.isFinite(h) && h > 0) {
        const totalInches = h / 2.54;
        setHeightFt(String(Math.floor(totalInches / 12)));
        setHeightIn(String(Math.round(totalInches % 12)));
      }
      if (Number.isFinite(w) && w > 0) {
        setWeightLb(String(kgToLb(w)));
      }
    } else {
      const ft = Number(heightFt);
      const inch = Number(heightIn);
      const lb = Number(weightLb);
      if (Number.isFinite(ft) && Number.isFinite(inch)) {
        setHeightCm(String(feetInchesToCm(ft, inch)));
      }
      if (Number.isFinite(lb) && lb > 0) {
        setWeightKg(String(lbToKg(lb)));
      }
    }

    setUnits(next);
    setResult(null);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t("close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-outline-variant bg-surface shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/40 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
              {t("eyebrow")}
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-medium tracking-tight text-primary">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-container hover:text-primary"
            aria-label={t("close")}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="mb-5 flex rounded-lg border border-outline-variant/50 p-1">
            {(["metric", "imperial"] as const).map((system) => (
              <button
                key={system}
                type="button"
                onClick={() => switchUnits(system)}
                className={`flex-1 rounded-md py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                  units === system
                    ? "bg-primary text-on-primary"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {t(`units.${system}`)}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor={heightId}
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
              >
                {t("fields.height")}
              </label>
              {units === "metric" ? (
                <div className="relative">
                  <input
                    id={heightId}
                    type="number"
                    inputMode="decimal"
                    min={HEIGHT_CM_LIMITS.min}
                    max={HEIGHT_CM_LIMITS.max}
                    step="1"
                    value={heightCm}
                    onChange={(e) => {
                      setHeightCm(e.target.value);
                      setResult(null);
                    }}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 pr-12 text-sm text-primary outline-none focus:border-primary"
                    required
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-secondary">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      id={heightId}
                      type="number"
                      inputMode="numeric"
                      min={4}
                      max={7}
                      value={heightFt}
                      onChange={(e) => {
                        setHeightFt(e.target.value);
                        setResult(null);
                      }}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 pr-10 text-sm text-primary outline-none focus:border-primary"
                      required
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={11}
                      value={heightIn}
                      onChange={(e) => {
                        setHeightIn(e.target.value);
                        setResult(null);
                      }}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 pr-10 text-sm text-primary outline-none focus:border-primary"
                      required
                      aria-label={t("fields.heightInches")}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor={weightId}
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
              >
                {t("fields.weight")}
              </label>
              <div className="relative">
                <input
                  id={weightId}
                  type="number"
                  inputMode="decimal"
                  min={units === "metric" ? WEIGHT_KG_LIMITS.min : 77}
                  max={units === "metric" ? WEIGHT_KG_LIMITS.max : 265}
                  step="1"
                  value={units === "metric" ? weightKg : weightLb}
                  onChange={(e) => {
                    if (units === "metric") setWeightKg(e.target.value);
                    else setWeightLb(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 pr-12 text-sm text-primary outline-none focus:border-primary"
                  required
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-secondary">
                  {units === "metric" ? "kg" : "lb"}
                </span>
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                {t("fields.bodyType")}
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {BODY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setBodyType(type);
                      setResult(null);
                    }}
                    className={`rounded-lg border px-2 py-3 text-center transition-all ${
                      bodyType === type
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant text-secondary hover:border-primary hover:text-primary"
                    }`}
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.08em]">
                      {t(`bodyTypes.${type}.label`)}
                    </span>
                    <span
                      className={`mt-1 block text-[10px] leading-snug ${
                        bodyType === type ? "text-on-primary/80" : "text-on-surface-variant"
                      }`}
                    >
                      {t(`bodyTypes.${type}.hint`)}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-primary transition-opacity hover:opacity-90"
            >
              {t("submit")}
            </button>
          </form>

          {result && (
            <div
              className="mt-6 rounded-xl border border-outline-variant/50 bg-surface-container-low p-4"
              role="status"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
                {t("result.eyebrow")}
              </p>
              <p className="mt-2 text-3xl font-medium tracking-tight text-primary">{result.size}</p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {t(`result.notes.${result.notes}`)}
              </p>
              <p className="mt-1 text-xs text-secondary">
                {t(`result.confidence.${result.confidence}`)}
                {result.alternateSize
                  ? ` · ${t("result.alternate", { size: result.alternateSize })}`
                  : null}
              </p>
              {onApplySize && (
                <button
                  type="button"
                  onClick={() => {
                    onApplySize(result.size);
                    onClose();
                  }}
                  className="mt-4 w-full rounded-lg border border-primary py-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
                >
                  {t("result.apply", { size: result.size })}
                </button>
              )}
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {t("chart.title")}
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">{t("chart.subtitle")}</p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-outline-variant/40">
              <table className="w-full min-w-[320px] text-left text-xs">
                <thead className="bg-surface-container text-[10px] uppercase tracking-[0.08em] text-secondary">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{t("chart.size")}</th>
                    <th className="px-3 py-2 font-semibold">{t("chart.height")}</th>
                    <th className="px-3 py-2 font-semibold">{t("chart.weight")}</th>
                  </tr>
                </thead>
                <tbody>
                  {chartRows.map((row) => (
                    <tr
                      key={row.size}
                      className={`border-t border-outline-variant/30 ${
                        result?.size === row.size ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 font-semibold text-primary">{row.size}</td>
                      <td className="px-3 py-2.5 text-on-surface-variant">
                        {row.heightCm[0]}–{row.heightCm[1]} cm
                      </td>
                      <td className="px-3 py-2.5 text-on-surface-variant">
                        {row.weightKg[0]}–{row.weightKg[1]} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant">
              {t("chart.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
