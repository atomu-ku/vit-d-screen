import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';
import { LIFESTYLE_QUESTIONS } from '../data/questions';
import { LifestyleState, NhanesSunProtectionCode } from '../types/assessment';

interface QuestionnairePageProps {
  lang?: Language;
  questionIndex: number;
  lifestyle: LifestyleState;
  onUpdateLifestyle: (updated: LifestyleState) => void;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const QuestionnairePage: React.FC<QuestionnairePageProps> = ({
  lang = 'en',
  questionIndex,
  lifestyle,
  onUpdateLifestyle,
  onBack,
  onNext,
  isSubmitting,
  submitError,
}) => {
  const t = TRANSLATIONS[lang];
  const totalQuestions = LIFESTYLE_QUESTIONS.length;
  const currentConfig = LIFESTYLE_QUESTIONS[questionIndex];
  const currentValue = lifestyle[currentConfig.id];

  const [minutesInput, setMinutesInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);
    if (currentConfig.type === 'minutes_with_skip') {
      const val = lifestyle[currentConfig.id];
      if (val === null || val === 3333) {
        setMinutesInput('');
      } else {
        setMinutesInput(String(val));
      }
    }
  }, [questionIndex, currentConfig.id, currentConfig.type, lifestyle]);

  const progressPercentage = Math.round(((questionIndex + 1) / totalQuestions) * 100);
  const isLastQuestion = questionIndex === totalQuestions - 1;
  const isSkipDisabled =
    currentConfig.id === 'sunNonWorkdays' && lifestyle.sunWorkdays === 3333;

  const handleMinutesChange = (raw: string) => {
    setMinutesInput(raw);
    setValidationError(null);
    if (raw.trim() === '') {
      onUpdateLifestyle({ ...lifestyle, [currentConfig.id]: null });
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      onUpdateLifestyle({ ...lifestyle, [currentConfig.id]: parsed });
    }
  };

  const handleToggleSpecialSkip = () => {
    if (isSkipDisabled) return;
    setValidationError(null);
    if (currentValue === 3333) {
      onUpdateLifestyle({ ...lifestyle, [currentConfig.id]: null });
      setMinutesInput('');
    } else {
      onUpdateLifestyle({ ...lifestyle, [currentConfig.id]: 3333 });
      setMinutesInput('');
    }
  };

  const handleSelectOrdinal = (code: NhanesSunProtectionCode) => {
    setValidationError(null);
    const updated: LifestyleState = {
      ...lifestyle,
      [currentConfig.id]: code,
    };
    if (currentConfig.id === 'stayInShade' && code === 6) {
      if (updated.wearSleeves === null) updated.wearSleeves = 6;
      if (updated.useSunscreen === null) updated.useSunscreen = 6;
    }
    onUpdateLifestyle(updated);
  };

  const validateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentConfig.type === 'minutes_with_skip') {
      if (currentValue === null || Number.isNaN(currentValue)) {
        setValidationError(t.errMinutes);
        return;
      }
      if (currentValue !== 3333 && (currentValue < 0 || currentValue > 480)) {
        setValidationError(t.errMinutes);
        return;
      }
      if (
        currentConfig.id === 'sunNonWorkdays' &&
        currentValue === 3333 &&
        lifestyle.sunWorkdays === 3333
      ) {
        setValidationError(t.errMinutes);
        return;
      }
    } else if (currentValue === null) {
      setValidationError(t.errSelectOption);
      return;
    }

    setValidationError(null);
    onNext();
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-[#d6dec0] bg-[#fffdf7] shadow-sm">
        {/* Progress Header */}
        <div className="border-b border-[#e4ead2] bg-gradient-to-r from-[#eef4dc] to-[#f9f3cf] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between text-xs font-bold text-[#3b523e]">
            <span>{lang === 'th' ? currentConfig.shortTitleTh : currentConfig.shortTitle}</span>
            <span className="text-[#3f6d48]">
              {questionIndex + 1} / {totalQuestions} ({progressPercentage}%)
            </span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#dce3c6]"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3f6d48] via-[#689f52] to-[#d9b640] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <form onSubmit={validateAndProceed} noValidate className="space-y-4 p-4 sm:p-5">
          <h1 className="text-base font-bold leading-snug text-[#253628] sm:text-lg">
            {lang === 'th' ? currentConfig.questionTh : currentConfig.question}
          </h1>

          {/* Minutes Input + Quick Presets + 3333 Skip Button */}
          {currentConfig.type === 'minutes_with_skip' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#dce3c6] bg-[#f7f9ee] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="minutes-input" className="text-sm font-semibold text-[#253628]">
                    {t.outdoorTimeLabel}
                    <span className="block text-[11px] font-normal text-[#60735b]">
                      {t.outdoorTimeHint}
                    </span>
                  </label>
                  <div className="relative w-36 sm:w-44">
                    <input
                      id="minutes-input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={480}
                      disabled={currentValue === 3333}
                      placeholder="0–480"
                      value={minutesInput}
                      onChange={(e) => handleMinutesChange(e.target.value)}
                      className="w-full rounded-lg border border-[#ccd6b4] bg-[#fffef9] px-3 py-2 pr-14 text-right text-base font-medium text-[#253628] focus:border-[#487850] focus:outline-none focus:ring-2 focus:ring-[#e3ecc8] disabled:bg-[#eff2e4]"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] text-[#73856d]">
                      {t.outdoorTimeUnit}
                    </span>
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {[
                    { label: '0m', val: 0 },
                    { label: '15m', val: 15 },
                    { label: '30m', val: 30 },
                    { label: '60m', val: 60 },
                    { label: '120m', val: 120 },
                  ].map((preset) => {
                    const active = currentValue === preset.val;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => {
                          setValidationError(null);
                          setMinutesInput(String(preset.val));
                          onUpdateLifestyle({
                            ...lifestyle,
                            [currentConfig.id]: preset.val,
                          });
                        }}
                        className={`rounded-lg border py-1.5 text-xs font-bold transition ${
                          active
                            ? 'border-[#3f6d48] bg-[#3f6d48] text-[#fffdf5]'
                            : 'border-[#ccd6b4] bg-[#fffdf7] text-[#3b523e]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isSkipDisabled && (
                <button
                  type="button"
                  onClick={handleToggleSpecialSkip}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    currentValue === 3333
                      ? 'border-[#487850] bg-[#eef5df] text-[#2e5436]'
                      : 'border-[#d6dec0] bg-[#fffdf7] text-[#3b523e]'
                  }`}
                >
                  <span>
                    {lang === 'th'
                      ? currentConfig.specialSkipLabelTh
                      : currentConfig.specialSkipLabel}
                  </span>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      currentValue === 3333
                        ? 'border-[#3f6d48] bg-[#3f6d48] text-[#fffdf5]'
                        : 'border-[#b9c69e]'
                    }`}
                  >
                    {currentValue === 3333 && <Check className="h-3 w-3" />}
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Compact Single Choice List */}
          {currentConfig.type === 'ordinal_choice' && currentConfig.options && (
            <div className="grid gap-2" role="radiogroup" aria-label={currentConfig.question}>
              {currentConfig.options.map((option) => {
                const selected = currentValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleSelectOrdinal(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.99] ${
                      selected
                        ? 'border-[#487850] bg-gradient-to-r from-[#edf4dc] to-[#faf4d3] text-[#284b30] shadow-sm'
                        : 'border-[#dce3c6] bg-[#fffdf9] text-[#2b3f2e] hover:bg-[#f6f8ec]'
                    }`}
                  >
                    <span>{lang === 'th' ? option.labelTh : option.label}</span>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? 'border-[#3f6d48] bg-[#3f6d48] text-[#fffdf5]'
                          : 'border-[#b9c69e] bg-[#fffdf7]'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {(validationError || submitError) && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{validationError || submitError}</span>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="flex items-center justify-between gap-3 border-t border-[#e8eed8] pt-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ccd6b4] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#3b523e] active:scale-[0.99] disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.backBtn}</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3f6d48] to-[#538451] px-5 py-2.5 text-sm font-bold text-[#fffdf5] shadow-sm active:scale-[0.99] disabled:opacity-60 sm:flex-initial"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.calculatingBtn}</span>
                </>
              ) : (
                <>
                  <span>{isLastQuestion ? t.calcBtn : t.nextBtn}</span>
                  <ArrowRight className="h-4 w-4 text-[#fde68a]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
