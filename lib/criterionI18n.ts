import { Criterion, CriterionType } from '@/types/game';

type Translator = (key: string, params?: Record<string, string | number>) => string;

function translateOrFallback(t: Translator, key: string, fallback: string): string {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function getCriterionLabel(criterion: Criterion, t: Translator): string {
  return translateOrFallback(t, `criterion.${criterion.id}`, criterion.label);
}

export function getCriterionTypeLabel(type: CriterionType, t: Translator): string {
  return translateOrFallback(t, `criterionType.${type}`, type);
}
