import { getRequestConfig } from 'next-intl/server';

const locales = ['hu', 'en', 'sk', 'de'];

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  // LocaleLayout validates the route and calls setRequestLocale. A fallback is
  // needed for unmatched routes, whose 404 can render outside that layout.
  const locale = requestedLocale && locales.includes(requestedLocale) ? requestedLocale : 'hu';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
