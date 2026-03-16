import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import { updateMeta, resetMeta } from '@/lib/seo';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FooterSection from '@/components/landing/FooterSection';
import { useI18n } from '@/components/i18n/i18nProvider';

const LandingPage = () => {
  const { t, isRTL } = useI18n();

  useEffect(() => {
    updateMeta({
      title: t('landing.meta.title'),
      description: t('landing.meta.description'),
    });
    return () => resetMeta();
  }, [t]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
