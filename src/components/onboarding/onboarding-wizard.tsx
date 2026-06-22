"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { OptionCard } from "./option-card";
import { ProgressBar } from "./progress-bar";
import { ONBOARDING_STEPS, type OnboardingAnswers } from "./steps";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = ONBOARDING_STEPS[step];
  const selectedValue = answers[current.key];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const handleSelect = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
    setError(null);
  }, [current.key]);

  async function handleNext() {
    if (!selectedValue) return;

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Convertir le budget en int4
    const budgetMap: Record<string, number> = {
      economique: 500,
      moyen: 1500,
      eleve: 3000,
    };
    const budgetValue = answers.budget ? budgetMap[answers.budget] ?? null : null;

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          travel_style: answers.travel_type ?? null,
          budget_preference: budgetValue,
          interests: answers.group_type ? [answers.group_type] : [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[Onboarding] Supabase UPDATE error:", {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          userId: user.id,
          payload: {
            travel_style: answers.travel_type,
            budget_preference: budgetValue,
            interests: answers.group_type ? [answers.group_type] : [],
          },
        });
        setError(`Erreur de sauvegarde : ${updateError.message}`);
        setSaving(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[Onboarding] Unexpected error during UPDATE:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        userId: user.id,
      });
      setError("Erreur inattendue lors de la sauvegarde. Veuillez réessayer.");
      setSaving(false);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((s) => s - 1);
      setError(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-12">
      {/* Header */}
      <div className="mb-4">
        <ProgressBar current={step} total={ONBOARDING_STEPS.length} />
      </div>

      {/* Content — grows to center vertically */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {current.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {current.subtitle}
          </p>
        </div>

        <div className={
          current.options.length <= 3
            ? "grid grid-cols-3 gap-3"
            : "grid grid-cols-3 gap-3"
        }>
          {current.options.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              selected={selectedValue === option.value}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Actions — pinned at bottom */}
      <div className="flex items-center gap-3 pt-8">
        {step > 0 ? (
          <Button variant="ghost" onClick={handleBack} className="px-6">
            Retour
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={handleNext}
          disabled={!selectedValue || saving}
          className="ml-auto h-11 rounded-full px-8 text-base shadow-lg shadow-primary/20"
        >
          {saving ? "Enregistrement..." : isLast ? "Terminer" : "Continuer"}
          {!isLast && !saving && (
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
