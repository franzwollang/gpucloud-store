import { z } from 'zod';

export const consentStatuses = ['granted', 'denied'] as const;
export const consentStatusModel = z.enum(consentStatuses);
export type ConsentStatus = z.infer<typeof consentStatusModel>;

export const consentCookieModel = z.object({
  ad_user_data: consentStatusModel,
  ad_personalization: consentStatusModel,
  ad_storage: consentStatusModel,
  analytics_storage: consentStatusModel,
  personalization_storage: consentStatusModel,
  security_storage: consentStatusModel,
  functionality_storage: consentStatusModel
});

export const defaultConsentCookieModel = consentCookieModel.extend({
  wait_for_update: z.number().int().optional()
});

export type ConsentCookie = z.infer<typeof consentCookieModel>;

/**
 * @description Use 'wait_for_update' to delay GTM initialization if required for communication with a CMP; only add to a copy of a default consent cookie before injecting into GTM, not for local use!
 */
export type DefaultConsentCookie = z.infer<typeof defaultConsentCookieModel>;

export const defaultConsentCookie: DefaultConsentCookie = {
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  ad_storage: 'denied',
  analytics_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  functionality_storage: 'granted'
};

export const allConsentCookie: ConsentCookie = {
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  ad_storage: 'granted',
  analytics_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
  functionality_storage: 'granted'
};

export type ConsentCategoryId =
  | 'functional'
  | 'targeting'
  | 'performance'
  | 'necessary'
  | 'security';

// TODO: pull and structure these from the TCF API as static content (refresh every 24 hours)
export const consentCategories: Array<{
  id: ConsentCategoryId;
  keys: Array<keyof Omit<ConsentCookie, 'wait_for_update'>>;
}> = [
  {
    id: 'functional',
    keys: ['personalization_storage']
  },
  {
    id: 'targeting',
    keys: ['ad_user_data', 'ad_personalization', 'ad_storage']
  },
  {
    id: 'performance',
    keys: ['analytics_storage']
  },
  {
    id: 'necessary',
    keys: []
  },
  {
    id: 'security',
    keys: []
  }
];
