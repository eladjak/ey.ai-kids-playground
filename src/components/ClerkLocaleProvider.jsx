import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { heIL, enUS } from '@clerk/localizations';
import { useI18n } from '@/components/i18n/i18nProvider';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const localeMap = {
  he: heIL,
  en: enUS,
  yi: heIL, // Yiddish falls back to Hebrew (closest RTL locale)
};

const ClerkLocaleProvider = ({ children }) => {
  const { language } = useI18n();
  const clerkLocale = localeMap[language] || enUS;

  if (!CLERK_PUBLISHABLE_KEY) return children;

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      clerkJSUrl="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
      localization={clerkLocale}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkLocaleProvider;
