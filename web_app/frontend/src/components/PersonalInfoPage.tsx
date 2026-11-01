import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';
import { PersonalInfoState } from '../types/assessment';

interface PersonalInfoPageProps {
  lang?: Language;
  data: PersonalInfoState;
  onChange: (updated: PersonalInfoState) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const PersonalInfoPage: React.FC<PersonalInfoPageProps> = ({
  lang = 'en',
  data,
  onChange,
  onBack,
  onContinue,
}) => {
  const t = TRANSLATIONS[lang];
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfoState, string>>>({});

  const updateField = <K extends keyof PersonalInfoState>(
    field: K,
    value: PersonalInfoState[K]
  ) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const parsedWeight = parseFloat(data.weightKg);
  const parsedHeight = parseFloat(data.heightCm);
  const liveBmi =
    !Number.isNaN(parsedWeight) &&
    !Number.isNaN(parsedHeight) &&
    parsedWeight > 20 &&
    parsedHeight > 100
      ? (parsedWeight / Math.pow(parsedHeight / 100, 2)).toFixed(1)
      : null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalInfoState, string>> = {};

    const ageNum = Number(data.age);
    if (
      data.age.trim() === '' ||
      Number.isNaN(ageNum) ||
      !Number.isInteger(ageNum) ||
      ageNum < 18 ||
      ageNum > 120
    ) {
      newErrors.age = t.errAge;
    }

    if (data.sex !== 'male' && data.sex !== 'female') {
      newErrors.sex = t.errSex;
    }

    const weightNum = Number(data.weightKg);
    if (
      data.weightKg.trim() === '' ||
      Number.isNaN(weightNum) ||
      weightNum <= 20 ||
      weightNum > 300
    ) {
      newErrors.weightKg = t.errWeight;
    }

    const heightNum = Number(data.heightCm);
    if (
      data.heightCm.trim() === '' ||
      Number.isNaN(heightNum) ||
      heightNum <= 100 ||
      heightNum > 250
    ) {
      newErrors.heightCm = t.errHeight;
    }

    const suppNum = Number(data.vitdSupplementIuPerWeek);
    if (
      data.vitdSupplementIuPerWeek.trim() === '' ||
      Number.isNaN(suppNum) ||
      suppNum < 0 ||
      suppNum > 350000
    ) {
      newErrors.vitdSupplementIuPerWeek = t.errSupp;
    }

    if (data.smokingStatus !== 'yes' && data.smokingStatus !== 'no') {
      newErrors.smokingStatus = t.errSmoke;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onContinue();
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-[#d6dec0] bg-[#fffdf7] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e4ead2] bg-gradient-to-r from-[#eef4dc] to-[#f9f3cf] px-4 py-3 sm:px-5">
          <h1 className="text-base font-bold text-[#253628]">{t.personalHeader}</h1>
          {liveBmi && (
            <span className="rounded-full border border-[#c5d49f] bg-[#e3ecc8] px-2.5 py-0.5 text-xs font-bold text-[#35593c]">
              BMI: {liveBmi} kg/m²
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="divide-y divide-[#ebeede]">
          {/* 1. Age */}
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="age-input" className="text-sm font-semibold text-[#253628]">
                {t.ageLabel}
              </label>
              <div className="relative w-36 sm:w-44">
                <input
                  id="age-input"
                  type="number"
                  inputMode="numeric"
                  min={18}
                  max={120}
                  placeholder="20–59"
                  value={data.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  className={`w-full rounded-lg border bg-[#fffef9] px-3 py-2 pr-11 text-right text-base font-medium text-[#253628] focus:outline-none focus:ring-2 ${
                    errors.age
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[#ccd6b4] focus:border-[#487850] focus:ring-[#e3ecc8]'
                  }`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[#73856d]">
                  {t.ageUnit}
                </span>
              </div>
            </div>
            {errors.age && <p className="mt-1 text-right text-xs text-red-600">{errors.age}</p>}
          </div>

          {/* 2. Sex */}
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#253628]">{t.sexLabel}</span>
              <div
                className="grid w-44 grid-cols-2 overflow-hidden rounded-lg border border-[#ccd6b4] bg-[#eff3e3] p-0.5"
                role="radiogroup"
                aria-label="Sex"
              >
                {(
                  [
                    { value: 'female', label: t.female },
                    { value: 'male', label: t.male },
                  ] as const
                ).map((item) => {
                  const selected = data.sex === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => updateField('sex', item.value)}
                      className={`rounded-md py-1.5 text-xs font-bold transition sm:text-sm ${
                        selected
                          ? 'bg-[#3f6d48] text-[#fffdf5] shadow-sm'
                          : 'text-[#4a5d47] hover:text-[#253628]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.sex && <p className="mt-1 text-right text-xs text-red-600">{errors.sex}</p>}
          </div>

          {/* 3. Weight */}
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="weight-input" className="text-sm font-semibold text-[#253628]">
                {t.weightLabel}
              </label>
              <div className="relative w-36 sm:w-44">
                <input
                  id="weight-input"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="65"
                  value={data.weightKg}
                  onChange={(e) => updateField('weightKg', e.target.value)}
                  className={`w-full rounded-lg border bg-[#fffef9] px-3 py-2 pr-10 text-right text-base font-medium text-[#253628] focus:outline-none focus:ring-2 ${
                    errors.weightKg
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[#ccd6b4] focus:border-[#487850] focus:ring-[#e3ecc8]'
                  }`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[#73856d]">
                  {t.weightUnit}
                </span>
              </div>
            </div>
            {errors.weightKg && (
              <p className="mt-1 text-right text-xs text-red-600">{errors.weightKg}</p>
            )}
          </div>

          {/* 4. Height */}
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="height-input" className="text-sm font-semibold text-[#253628]">
                {t.heightLabel}
              </label>
              <div className="relative w-36 sm:w-44">
                <input
                  id="height-input"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="168"
                  value={data.heightCm}
                  onChange={(e) => updateField('heightCm', e.target.value)}
                  className={`w-full rounded-lg border bg-[#fffef9] px-3 py-2 pr-10 text-right text-base font-medium text-[#253628] focus:outline-none focus:ring-2 ${
                    errors.heightCm
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[#ccd6b4] focus:border-[#487850] focus:ring-[#e3ecc8]'
                  }`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[#73856d]">
                  {t.heightUnit}
                </span>
              </div>
            </div>
            {errors.heightCm && (
              <p className="mt-1 text-right text-xs text-red-600">{errors.heightCm}</p>
            )}
          </div>

          {/* 5. Vitamin D Supplement Intake */}
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="supplement-input" className="text-sm font-semibold text-[#253628]">
                {t.suppLabel}
                <span className="block text-[11px] font-normal text-[#60735b]">{t.suppSub}</span>
              </label>
              <div className="relative w-36 sm:w-44">
                <input
                  id="supplement-input"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="0"
                  value={data.vitdSupplementIuPerWeek}
                  onChange={(e) => updateField('vitdSupplementIuPerWeek', e.target.value)}
                  className={`w-full rounded-lg border bg-[#fffef9] px-3 py-2 pr-14 text-right text-base font-medium text-[#253628] focus:outline-none focus:ring-2 ${
                    errors.vitdSupplementIuPerWeek
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[#ccd6b4] focus:border-[#487850] focus:ring-[#e3ecc8]'
                  }`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] text-[#73856d]">
                  {t.suppUnit}
                </span>
              </div>
            </div>
            <div className="mt-2 flex justify-end gap-1.5">
              {[
                { label: t.suppZeroPreset, val: '0' },
                { label: '7,000', val: '7000' },
                { label: '20,000', val: '20000' },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => updateField('vitdSupplementIuPerWeek', preset.val)}
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold transition ${
                    data.vitdSupplementIuPerWeek === preset.val
                      ? 'border-[#3f6d48] bg-[#3f6d48] text-[#fffdf5]'
                      : 'border-[#d6dec0] bg-[#f6f8ec] text-[#4a5d47]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {errors.vitdSupplementIuPerWeek && (
              <p className="mt-1 text-right text-xs text-red-600">
                {errors.vitdSupplementIuPerWeek}
              </p>
            )}
          </div>

          {/* 6. Smoking Status */}
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-[#253628]">{t.smokingLabel}</span>
                <span className="block text-[11px] text-[#60735b]">{t.smokingSub}</span>
              </div>
              <div
                className="grid w-44 grid-cols-2 overflow-hidden rounded-lg border border-[#ccd6b4] bg-[#eff3e3] p-0.5"
                role="radiogroup"
                aria-label="Smoking Status"
              >
                {(
                  [
                    { value: 'no', label: t.no },
                    { value: 'yes', label: t.yes },
                  ] as const
                ).map((item) => {
                  const selected = data.smokingStatus === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => updateField('smokingStatus', item.value)}
                      className={`rounded-md py-1.5 text-xs font-bold transition sm:text-sm ${
                        selected
                          ? 'bg-[#3f6d48] text-[#fffdf5] shadow-sm'
                          : 'text-[#4a5d47] hover:text-[#253628]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.smokingStatus && (
              <p className="mt-1 text-right text-xs text-red-600">{errors.smokingStatus}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between gap-3 bg-[#f7f9ee] px-4 py-3.5 sm:px-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ccd6b4] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#3b523e] active:scale-[0.99]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.backBtn}</span>
            </button>

            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3f6d48] to-[#538451] px-5 py-2.5 text-sm font-bold text-[#fffdf5] shadow-sm active:scale-[0.99] sm:flex-initial"
            >
              <span>{t.continueBtn}</span>
              <ArrowRight className="h-4 w-4 text-[#fde68a]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
