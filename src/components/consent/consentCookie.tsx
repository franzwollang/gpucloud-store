import { z } from "zod";

export const consentStatuses = ["granted", "denied"] as const;
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
	ad_user_data: "denied",
	ad_personalization: "denied",
	ad_storage: "denied",
	analytics_storage: "denied",
	personalization_storage: "denied",
	security_storage: "granted",
	functionality_storage: "granted"
};

export const allConsentCookie: ConsentCookie = {
	ad_user_data: "granted",
	ad_personalization: "granted",
	ad_storage: "granted",
	analytics_storage: "granted",
	personalization_storage: "granted",
	security_storage: "granted",
	functionality_storage: "granted"
};

// TODO: pull and structure these from the TFC API as static content (refresh every 24 hours)
// https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md#the-global-vendor-list
// https://vendor-list.consensu.org/v3/vendor-list.json
export const consentCategories: Array<{
	name: string;
	keys: Array<keyof Omit<ConsentCookie, "wait_for_update">>;
	description: string;
}> = [
	{
		name: "Functional Cookies",
		keys: ["personalization_storage"],
		description:
			"These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies then some or all of these services may not function properly."
	},
	{
		name: "Targeting Cookies",
		keys: ["ad_user_data", "ad_personalization", "ad_storage"],
		description:
			"These cookies are used to make advertising messages more relevant to you and may be set through our site by us or by our advertising partners. They may be used to build a profile of your interests and show you relevant advertising on our site or on other sites. They do not store directly personal information, but are based on uniquely identifying your browser and internet device."
	},
	{
		name: "Performance Cookies",
		keys: ["analytics_storage"],
		description:
			"These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance."
	},
	{
		name: "Necessary Cookies",
		keys: [],
		description:
			"These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information."
	},
	{
		name: "Ensure security, prevent and detect fraud, and fix errors",
		keys: [],
		description:
			"Your data can be used to monitor for and prevent unusual and possibly fraudulent activity (for example, regarding advertising, ad clicks by bots), and ensure systems and processes work properly and securely. It can also be used to correct any problems you, the publisher or the advertiser may encounter in the delivery of content and ads and in your interaction with them."
	}
];
