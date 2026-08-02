import type { ConsentCategoryId } from '@/components/consent/consentCookie';
import type { AppMessages } from '@/i18n';
import type { AppTranslator } from '@/i18n/t';
import type { PathValue } from '@/lib/typing';

type ConsentMessages = PathValue<AppMessages, 'UI.consent'>;

export function translateConsentCategory(
  t: AppTranslator<ConsentMessages>,
  id: ConsentCategoryId,
  field: 'name' | 'description'
): string {
  switch (id) {
    case 'functional':
      return field === 'name'
        ? t('categories.functional.name')('Functional Cookies')()
        : t('categories.functional.description')('These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies then some or all of these services may not function properly.')();
    case 'targeting':
      return field === 'name'
        ? t('categories.targeting.name')('Targeting Cookies')()
        : t('categories.targeting.description')('These cookies are used to make advertising messages more relevant to you and may be set through our site by us or by our advertising partners. They may be used to build a profile of your interests and show you relevant advertising on our site or on other sites. They do not store directly personal information, but are based on uniquely identifying your browser and internet device.')();
    case 'performance':
      return field === 'name'
        ? t('categories.performance.name')('Performance Cookies')()
        : t('categories.performance.description')('These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance.')();
    case 'necessary':
      return field === 'name'
        ? t('categories.necessary.name')('Necessary Cookies')()
        : t('categories.necessary.description')('These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.')();
    case 'security':
      return field === 'name'
        ? t('categories.security.name')('Ensure security, prevent and detect fraud, and fix errors')()
        : t('categories.security.description')('Your data can be used to monitor for and prevent unusual and possibly fraudulent activity (for example, regarding advertising, ad clicks by bots), and ensure systems and processes work properly and securely. It can also be used to correct any problems you, the publisher or the advertiser may encounter in the delivery of content and ads and in your interaction with them.')();
  }
}
