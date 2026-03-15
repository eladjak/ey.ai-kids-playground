import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import { updateMeta, resetMeta } from '@/lib/seo';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FooterSection from '@/components/landing/FooterSection';

const LandingPage = () => {
  useEffect(() => {
    updateMeta({
      title: 'Sipurai - יצירת ספרי ילדים עם AI',
      description: 'פלטפורמה ליצירת ספרי ילדים מותאמים אישית עם בינה מלאכותית',
    });
    return () => resetMeta();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
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
