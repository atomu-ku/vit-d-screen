import React, { useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PersonalInfoPage } from './components/PersonalInfoPage';
import { QuestionnairePage } from './components/QuestionnairePage';
import { ResultsPage } from './components/ResultsPage';
import { WelcomePage } from './components/WelcomePage';
import { Language, TRANSLATIONS } from './data/i18n';
import { LIFESTYLE_QUESTIONS } from './data/questions';
import { submitAssessment } from './services/assessment';
import {
  AssessmentPayload,
  AssessmentResponse,
  LifestyleState,
  PersonalInfoState,
} from './types/assessment';

type ScreenStep = 'welcome' | 'personal' | 'questionnaire' | 'results';

const INITIAL_PERSONAL_INFO: PersonalInfoState = {
  age: '',
  sex: '',
  weightKg: '',
  heightCm: '',
  vitdSupplementIuPerWeek: '',
  smokingStatus: '',
};

const INITIAL_LIFESTYLE: LifestyleState = {
  sunWorkdays: null,
  sunNonWorkdays: null,
  stayInShade: null,
  wearSleeves: null,
  useSunscreen: null,
};

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [step, setStep] = useState<ScreenStep>('welcome');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoState>(INITIAL_PERSONAL_INFO);
  const [lifestyle, setLifestyle] = useState<LifestyleState>(INITIAL_LIFESTYLE);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResponse | null>(null);

  const t = TRANSLATIONS[lang];

  const handleStartNewAssessment = () => {
    setPersonalInfo(INITIAL_PERSONAL_INFO);
    setLifestyle(INITIAL_LIFESTYLE);
    setQuestionIndex(0);
    setResult(null);
    setSubmitError(null);
    setStep('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionnaireBack = () => {
    setSubmitError(null);
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
    } else {
      setStep('personal');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionnaireNext = async () => {
    setSubmitError(null);
    if (questionIndex < LIFESTYLE_QUESTIONS.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      personalInfo.sex === '' ||
      personalInfo.smokingStatus === '' ||
      lifestyle.sunWorkdays === null ||
      lifestyle.sunNonWorkdays === null ||
      lifestyle.stayInShade === null ||
      lifestyle.wearSleeves === null ||
      lifestyle.useSunscreen === null
    ) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    const payload: AssessmentPayload = {
      age: Number(personalInfo.age),
      sex: personalInfo.sex,
      weight_kg: Number(personalInfo.weightKg),
      height_cm: Number(personalInfo.heightCm),
      vitd_supplement_iu_per_week: Number(personalInfo.vitdSupplementIuPerWeek),
      smoking_status: personalInfo.smokingStatus,
      sun_workdays: lifestyle.sunWorkdays,
      sun_non_workdays: lifestyle.sunNonWorkdays,
      stay_in_shade: lifestyle.stayInShade,
      wear_sleeves: lifestyle.wearSleeves,
      use_sunscreen: lifestyle.useSunscreen,
    };

    try {
      setIsSubmitting(true);
      const response = await submitAssessment(payload);
      setResult(response);
      setStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to load the assessment model. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepBadgeLabel = (): string | undefined => {
    if (step === 'personal') return t.stepPersonal;
    if (step === 'questionnaire') return `Q${questionIndex + 1}/${LIFESTYLE_QUESTIONS.length}`;
    if (step === 'results') return t.stepResults;
    return undefined;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3e4] text-[#253628]">
      <Header
        onReset={handleStartNewAssessment}
        stepLabel={getStepBadgeLabel()}
        lang={lang}
        onToggleLang={setLang}
      />

      <main className="mx-auto w-full max-w-xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
        {step === 'welcome' && (
          <WelcomePage
            lang={lang}
            onStart={() => {
              setStep('personal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {step === 'personal' && (
          <PersonalInfoPage
            lang={lang}
            data={personalInfo}
            onChange={setPersonalInfo}
            onBack={() => {
              setStep('welcome');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContinue={() => {
              setStep('questionnaire');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {step === 'questionnaire' && (
          <QuestionnairePage
            lang={lang}
            questionIndex={questionIndex}
            lifestyle={lifestyle}
            onUpdateLifestyle={setLifestyle}
            onBack={handleQuestionnaireBack}
            onNext={handleQuestionnaireNext}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {step === 'results' && result && (
          <ResultsPage
            lang={lang}
            result={result}
            onStartNew={handleStartNewAssessment}
            onReviewAnswers={() => {
              setQuestionIndex(LIFESTYLE_QUESTIONS.length - 1);
              setStep('questionnaire');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      <Footer lang={lang} />
    </div>
  );
};

export default App;
