export type Language = 'en' | 'th';

export const TRANSLATIONS = {
  en: {
    appTitle: 'Vitamin D Deficiency Screening',
    stepPersonal: 'Personal Info',
    stepResults: 'Results',
    footerText:
      'Screening & research tool only • Not a substitute for clinical diagnosis or serum 25(OH)D testing',

    // Welcome Page
    welcomeTitle: 'Vitamin D Deficiency Screening',
    welcomeDesc:
      'Estimates the probability of vitamin D deficiency using machine learning based on personal health and lifestyle information.',
    stat1Title: '9 Factors',
    stat1Sub: 'Predicting vitamin D def.',
    stat2Title: 'Machine Learning Model',
    stat2Sub: 'Using NHANES data',
    stat3Title: '95.1% Sensitivity',
    stat3Sub: '35% Cutoff',
    limitationsLabel: 'Limitations: ',
    limitationsText:
      'Intended for screening and research purposes only. Does not provide a definitive diagnosis and cannot replace clinical evaluation or laboratory testing.',
    sampleGroupLabel: 'Sample Group: ',
    sampleGroupText:
      'Developed using data from non-pregnant Asian adults aged 20–59 years; results may have limited generalizability to other populations.',
    startBtn: 'Start Assessment',

    // Personal Info Page
    personalHeader: 'Personal Information',
    ageLabel: 'Age',
    ageUnit: 'yrs',
    sexLabel: 'Sex',
    female: 'Female',
    male: 'Male',
    weightLabel: 'Weight',
    weightUnit: 'kg',
    heightLabel: 'Height',
    heightUnit: 'cm',
    suppLabel: 'Vitamin D Supplement',
    suppSub: 'International Units per Week',
    suppUnit: 'IU/wk',
    suppZeroPreset: '0 if none',
    smokingLabel: 'Smoking Status',
    smokingSub: 'Smoked in past 5 days',
    no: 'No',
    yes: 'Yes',
    backBtn: 'Back',
    continueBtn: 'Continue',
    errAge: 'Enter a whole number (18–120).',
    errSex: 'Select Female or Male.',
    errWeight: 'Enter weight (20.1–300 kg).',
    errHeight: 'Enter height (100.1–250 cm).',
    errSupp: 'Enter 0–350,000 IU/week.',
    errSmoke: 'Select No or Yes.',

    // Questionnaire Page
    outdoorTimeLabel: 'Outdoor Time',
    outdoorTimeHint: '0–480 min/day',
    outdoorTimeUnit: 'min/d',
    nextBtn: 'Next',
    calcBtn: 'Calculate Risk',
    calculatingBtn: 'Calculating...',
    errMinutes: 'Enter minutes per day (0–480) or select the schedule option.',
    errSelectOption: 'Please select an option.',

    // Results Page & Gauge
    resultHeader: 'Risk Assessment Result',
    cutoffBadge: 'Cutoff',
    cutoffGauge: (cutoff: string) => `${cutoff}% Cutoff`,
    probSubtitle: 'Predicted Deficiency Probability',
    lowRisk: 'Low Risk',
    highRisk: 'High Risk',
    highRiskExplanation: (pct: string, cutoff: string) =>
      `Predicted deficiency risk (${pct}%) is at or above the ${cutoff}% screening threshold. Confirmatory serum 25(OH)D testing and clinical evaluation are recommended.`,
    lowRiskExplanation: (pct: string, cutoff: string) =>
      `Predicted deficiency risk (${pct}%) is below the ${cutoff}% screening threshold, indicating a lower likelihood of vitamin D deficiency (< 50 nmol/L).`,
    noteLabel: 'Note:',
    disclaimerText:
      'For screening and research purposes only. This result is not a definitive diagnosis and cannot replace clinical evaluation or laboratory testing.',
    factorBreakdown: 'Factor Breakdown (SHAP Impact)',
    editBtn: 'Edit',
    restartBtn: 'Start New Assessment',
  },
  th: {
    appTitle: 'คัดกรองความเสี่ยงภาวะขาดวิตามินดี',
    stepPersonal: 'ข้อมูลส่วนตัว',
    stepResults: 'ผลประเมิน',
    footerText:
      'สำหรับคัดกรองเบื้องต้นและงานวิจัยเท่านั้น • ไม่ใช่การวินิจฉัยทางการแพทย์หรือการตรวจเลือด',

    // Welcome Page
    welcomeTitle: 'Vitamin D Deficiency Screening',
    welcomeDesc:
      'ประเมินโอกาสเสี่ยงภาวะขาดวิตามินดีด้วย Machine Learning จากข้อมูลสุขภาพและพฤติกรรมการใช้ชีวิต',
    stat1Title: '9 Factors',
    stat1Sub: 'ปัจจัยทำนายภาวะขาดวิตามินดี',
    stat2Title: 'Machine Learning Model',
    stat2Sub: 'พัฒนาจากฐานข้อมูล NHANES',
    stat3Title: '95.1% Sensitivity',
    stat3Sub: 'เกณฑ์คัดกรอง 35% Cutoff',
    limitationsLabel: 'ข้อจำกัด: ',
    limitationsText:
      'ใช้สำหรับการคัดกรองเบื้องต้นและงานวิจัยเท่านั้น ไม่ใช่การวินิจฉัยโรคที่ยืนยันผล และไม่สามารถทดแทนการตรวจประเมินโดยแพทย์หรือการตรวจวัดระดับวิตามินดีในเลือดทางห้องปฏิบัติการได้',
    sampleGroupLabel: 'กลุ่มตัวอย่าง: ',
    sampleGroupText:
      'พัฒนาจากข้อมูลผู้ใหญ่ชาวเอเชียอายุ 20–59 ปี ที่ไม่ได้ตั้งครรภ์ ผลลัพธ์อาจมีข้อจำกัดในการนำไปใช้กับกลุ่มประชากรอื่น',
    startBtn: 'เริ่มทำแบบประเมิน',

    // Personal Info Page
    personalHeader: 'ข้อมูลส่วนบุคคล',
    ageLabel: 'อายุ',
    ageUnit: 'ปี',
    sexLabel: 'เพศ',
    female: 'หญิง',
    male: 'ชาย',
    weightLabel: 'น้ำหนัก',
    weightUnit: 'kg',
    heightLabel: 'ส่วนสูง',
    heightUnit: 'cm',
    suppLabel: 'วิตามินดีเสริม',
    suppSub: 'International Units per Week',
    suppUnit: 'IU/wk',
    suppZeroPreset: '0 หากไม่ทาน',
    smokingLabel: 'การสูบบุหรี่',
    smokingSub: 'สูบบุหรี่/บุหรี่ไฟฟ้าใน 5 วันที่ผ่านมา',
    no: 'ไม่สูบ',
    yes: 'สูบ',
    backBtn: 'ย้อนกลับ',
    continueBtn: 'ถัดไป',
    errAge: 'กรอกอายุเป็นจำนวนเต็ม (18–120 ปี)',
    errSex: 'กรุณาเลือกเพศ',
    errWeight: 'กรอกน้ำหนัก (20.1–300 kg)',
    errHeight: 'กรอกส่วนสูง (100.1–250 cm)',
    errSupp: 'กรอกปริมาณ 0–350,000 IU/สัปดาห์',
    errSmoke: 'กรุณาเลือกสถานะการสูบบุหรี่',

    // Questionnaire Page
    outdoorTimeLabel: 'เวลากลางแจ้ง',
    outdoorTimeHint: '0–480 นาที/วัน',
    outdoorTimeUnit: 'นาที/วัน',
    nextBtn: 'ถัดไป',
    calcBtn: 'ดูผลประเมิน',
    calculatingBtn: 'กำลังคำนวณ...',
    errMinutes: 'กรุณากรอกจำนวนนาทีต่อวัน (0–480) หรือเลือกตัวเลือกด้านล่าง',
    errSelectOption: 'กรุณาเลือกคำตอบ',

    // Results Page & Gauge
    resultHeader: 'ผลการประเมินความเสี่ยง',
    cutoffBadge: 'เกณฑ์ตัดสิน',
    cutoffGauge: (cutoff: string) => `เกณฑ์ ${cutoff}%`,
    probSubtitle: 'โอกาสเสี่ยงภาวะขาดวิตามินดี',
    lowRisk: 'ความเสี่ยงต่ำ',
    highRisk: 'ความเสี่ยงสูง',
    highRiskExplanation: (pct: string, cutoff: string) =>
      `ความเสี่ยงของคุณ (${pct}%) อยู่ในเกณฑ์ตั้งแต่ ${cutoff}% ขึ้นไป แนะนำให้รับคำปรึกษาจากบุคลากรทางการแพทย์หรือตรวจระดับวิตามินดีในเลือดเพื่อยืนยันผล`,
    lowRiskExplanation: (pct: string, cutoff: string) =>
      `ความเสี่ยงของคุณ (${pct}%) ต่ำกว่าเกณฑ์คัดกรอง ${cutoff}% บ่งชี้ว่ามีแนวโน้มต่ำที่จะมีภาวะขาดวิตามินดี`,
    noteLabel: 'หมายเหตุ:',
    disclaimerText:
      'ใช้สำหรับการคัดกรองเบื้องต้นและงานวิจัยเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์ และไม่สามารถทดแทนการตรวจประเมินโดยแพทย์หรือการตรวจเลือดได้',
    factorBreakdown: 'ผลกระทบของแต่ละปัจจัย',
    editBtn: 'แก้ไข',
    restartBtn: 'เริ่มทำแบบประเมินใหม่',
  },
} as const;

