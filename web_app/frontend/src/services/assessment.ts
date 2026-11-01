import type { AssessmentPayload, AssessmentResponse } from '../types/assessment';
import { assessLocally } from './browserModel';

export async function submitAssessment(payload: AssessmentPayload): Promise<AssessmentResponse> {
  // Load only the static model asset. Questionnaire answers never leave this browser.
  const { default: model } = await import('../model/vitd-model.json');
  return assessLocally(payload, model);
}
