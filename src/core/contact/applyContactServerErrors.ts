import type { FieldPath, UseFormClearErrors, UseFormSetError } from 'react-hook-form';
import { fieldErrors, toUserMessage, type DullahanError } from 'dullahan-web/client';

const CONTACT_FORM_FIELDS = [
  'name',
  'company',
  'email',
  'role',
  'message'
] as const;

export type ContactFormFieldName = (typeof CONTACT_FORM_FIELDS)[number];

const FORM_FIELD_SET = new Set<string>(CONTACT_FORM_FIELDS);

function isContactFormField(key: string): key is ContactFormFieldName {
  return FORM_FIELD_SET.has(key);
}

/**
 * Maps a dullahan submit error onto RHF field errors when possible.
 * Returns a form-level message for unmapped / non-field failures (or null
 * when every validation issue landed on a form field).
 */
export function applyContactServerErrors<TFieldValues extends Record<string, unknown>>(
  error: DullahanError,
  setError: UseFormSetError<TFieldValues>,
  clearErrors: UseFormClearErrors<TFieldValues>,
  fallbackMessage: string
): string | null {
  clearErrors();

  if (error.kind === 'validation') {
    const map = fieldErrors(error);
    let appliedFieldError = false;
    let unmapped: string | null = null;

    for (const [key, message] of Object.entries(map)) {
      const top = key.split('.')[0] ?? key;
      if (isContactFormField(top)) {
        setError(top as FieldPath<TFieldValues>, {
          type: 'server',
          message
        });
        appliedFieldError = true;
      } else if (!unmapped) {
        unmapped = message;
      }
    }

    if (unmapped) return unmapped;
    if (appliedFieldError) return null;
    return toUserMessage(error) || fallbackMessage;
  }

  if (
    error.kind === 'domain' &&
    error.path?.[0] != null &&
    isContactFormField(String(error.path[0]))
  ) {
    setError(String(error.path[0]) as FieldPath<TFieldValues>, {
      type: 'server',
      message: error.message
    });
    return null;
  }

  return toUserMessage(error) || fallbackMessage;
}
