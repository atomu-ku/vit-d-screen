import { LifestyleState, NhanesSunProtectionCode } from '../types/assessment';

export interface QuestionOption {
  value: NhanesSunProtectionCode;
  label: string;
  labelTh: string;
}

export interface LifestyleQuestionConfig {
  id: keyof LifestyleState;
  nhanesVariable: string;
  shortTitle: string;
  shortTitleTh: string;
  question: string;
  questionTh: string;
  type: 'minutes_with_skip' | 'ordinal_choice';
  specialSkipCode?: number;
  specialSkipLabel?: string;
  specialSkipLabelTh?: string;
  options?: QuestionOption[];
}

export const SUN_PROTECTION_OPTIONS: QuestionOption[] = [
  { value: 1, label: 'Always', labelTh: 'เป็นประจำทุกครั้ง' },
  { value: 2, label: 'Most of the time', labelTh: 'เกือบทุกครั้ง' },
  { value: 3, label: 'Sometimes', labelTh: 'บางครั้ง' },
  { value: 4, label: 'Rarely', labelTh: 'นานๆ ครั้ง' },
  { value: 5, label: 'Never', labelTh: 'ไม่เคยเลย' },
  {
    value: 6,
    label: "Don't go out in the sun",
    labelTh: 'ไม่ได้ออกแดดเกิน 1 ชั่วโมง',
  },
];

export const LIFESTYLE_QUESTIONS: LifestyleQuestionConfig[] = [
  {
    id: 'sunWorkdays',
    nhanesVariable: 'DED120',
    shortTitle: 'Work / School Days Outdoors',
    shortTitleTh: 'เวลากลางแจ้งในวันทำงาน/เรียน',
    question:
      'On work or school days over the past 30 days, how many minutes per day did you usually spend outdoors between 9:00 AM and 5:00 PM?',
    questionTh:
      'ในช่วง 30 วันที่ผ่านมา ในวันที่คุณทำงานหรือไปเรียน คุณใช้เวลากลางแจ้งระหว่าง 09:00–17:00 น. เฉลี่ยวันละกี่นาที?',
    type: 'minutes_with_skip',
    specialSkipCode: 3333,
    specialSkipLabel: 'I do not work or go to school',
    specialSkipLabelTh: 'ไม่ได้ทำงานหรือไปเรียน',
  },
  {
    id: 'sunNonWorkdays',
    nhanesVariable: 'DED125',
    shortTitle: 'Days Off Outdoors',
    shortTitleTh: 'เวลากลางแจ้งในวันหยุด',
    question:
      'On days off (non-work / non-school days) over the past 30 days, how many minutes per day did you usually spend outdoors between 9:00 AM and 5:00 PM?',
    questionTh:
      'ในช่วง 30 วันที่ผ่านมา ในวันหยุด (วันที่ไม่ได้ทำงานหรือไปเรียน) คุณใช้เวลากลางแจ้งระหว่าง 09:00–17:00 น. เฉลี่ยวันละกี่นาที?',
    type: 'minutes_with_skip',
    specialSkipCode: 3333,
    specialSkipLabel: 'I work or attend school 7 days/week (no days off)',
    specialSkipLabelTh: 'ทำงานหรือเรียนทั้ง 7 วันต่อสัปดาห์ (ไม่มีวันหยุด)',
  },
  {
    id: 'stayInShade',
    nhanesVariable: 'DEQ034A',
    shortTitle: 'Staying in the Shade',
    shortTitleTh: 'การหลบในที่ร่ม',
    question:
      'When outside on a very sunny day for more than one hour, how often do you stay in the shade?',
    questionTh:
      'เมื่อต้องอยู่กลางแจ้งในวันที่แดดจัดนานเกิน 1 ชั่วโมง คุณหลบอยู่ในที่ร่มบ่อยเพียงใด?',
    type: 'ordinal_choice',
    options: SUN_PROTECTION_OPTIONS,
  },
  {
    id: 'wearSleeves',
    nhanesVariable: 'DEQ034C',
    shortTitle: 'Wearing Long Sleeves',
    shortTitleTh: 'การสวมเสื้อแขนยาว',
    question:
      'When outside on a very sunny day for more than one hour, how often do you wear a long-sleeved shirt?',
    questionTh:
      'เมื่อต้องอยู่กลางแจ้งในวันที่แดดจัดนานเกิน 1 ชั่วโมง คุณสวมเสื้อแขนยาวบ่อยเพียงใด?',
    type: 'ordinal_choice',
    options: SUN_PROTECTION_OPTIONS,
  },
  {
    id: 'useSunscreen',
    nhanesVariable: 'DEQ034D',
    shortTitle: 'Using Sunscreen',
    shortTitleTh: 'การทาครีมกันแดด',
    question:
      'When outside on a very sunny day for more than one hour, how often do you use sunscreen?',
    questionTh:
      'เมื่อต้องอยู่กลางแจ้งในวันที่แดดจัดนานเกิน 1 ชั่วโมง คุณทาครีมกันแดดบ่อยเพียงใด?',
    type: 'ordinal_choice',
    options: SUN_PROTECTION_OPTIONS,
  },
];
