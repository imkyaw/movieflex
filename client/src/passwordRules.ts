/** Password rules enforced by the identity provider; shown as a live checklist. */
export const PASSWORD_RULES: Array<{ label: string; test(value: string): boolean }> = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'An uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'A lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'A number', test: (value) => /[0-9]/.test(value) },
  { label: 'A special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function meetsPasswordRules(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}
