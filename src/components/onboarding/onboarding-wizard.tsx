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

  const current = ONBOARDING_STEPS[step];
  const selectedValue = answers[current.key];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const handleSelect = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  }, [current.key]);

  async function handleNext() {
    if (!selectedValue) return;

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const preferences = {
      travel_type: answers.travel_type,
      budget: answers.budget,
      group_type: answers.group_type,
      onboarding_completed: true,
    };

    await supabase
      .from("profiles")
      .update({ travel_preferences: preferences } as never)
      .eq("id", user.id);

    router.push("/dashboard");
    router.refresh();
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
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
