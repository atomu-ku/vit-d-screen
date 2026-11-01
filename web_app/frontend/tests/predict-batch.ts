import { readFileSync } from 'node:fs';
import { assessLocally, predictFeatures, preprocess } from '../src/services/browserModel.ts';
const model = JSON.parse(readFileSync(new URL('../src/model/vitd-model.json', import.meta.url), 'utf8'));
const cases = JSON.parse(readFileSync(0, 'utf8'));
const results = cases.map((item: { features?: Record<string, number>; payload?: Parameters<typeof preprocess>[0] }) => {
  const features = item.payload ? preprocess(item.payload, model) : item.features!;
  const prediction = predictFeatures(features, model);
  return { ...prediction, features, result: item.payload ? assessLocally(item.payload, model) : null };
});
process.stdout.write(JSON.stringify(results));
