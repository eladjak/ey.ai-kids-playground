import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/components/i18n/i18nProvider';

const PricingSection = () => {
  const { t, isRTL } = useI18n();

  const plans = [
    {
      name: t('landing.pricing.free.name'),
      price: t('landing.pricing.free.price'),
      period: t('landing.pricing.period'),
      features: [
        t('landing.pricing.free.f1'),
        t('landing.pricing.free.f2'),
        t('landing.pricing.free.f3'),
      ],
      cta: t('landing.pricing.free.cta'),
      highlighted: false,
      gradient: '',
    },
    {
      name: t('landing.pricing.premium.name'),
      price: t('landing.pricing.premium.price'),
      period: t('landing.pricing.period'),
      features: [
        t('landing.pricing.premium.f1'),
        t('landing.pricing.premium.f2'),
        t('landing.pricing.premium.f3'),
        t('landing.pricing.premium.f4'),
      ],
      cta: t('landing.pricing.premium.cta'),
      highlighted: true,
      badge: t('landing.pricing.premium.badge'),
      gradient: 'from-purple-600 to-indigo-600',
    },
    {
      name: t('landing.pricing.family.name'),
      price: t('landing.pricing.family.price'),
      period: t('landing.pricing.period'),
      features: [
        t('landing.pricing.family.f1'),
        t('landing.pricing.family.f2'),
        t('landing.pricing.family.f3'),
        t('landing.pricing.family.f4'),
      ],
      cta: t('landing.pricing.family.cta'),
      highlighted: false,
      gradient: '',
    },
  ];

  return (
    <section
      id="pricing"
      className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('landing.pricing.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('landing.pricing.sectionSubtitle')}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={plan.highlighted ? 'md:-mt-4' : ''}
            >
              <Card
                className={`h-full relative overflow-hidden ${
                  plan.highlighted
                    ? 'border-2 border-purple-500 shadow-xl shadow-purple-500/10'
                    : 'border-0 shadow-sm'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 px-4 py-1 text-sm shadow-lg">
                      <Sparkles className="h-3 w-3 me-1" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardContent className={`p-6 sm:p-8 ${plan.highlighted ? 'pt-8' : ''}`}>
                  {/* Plan name */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      /{plan.period}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check
                          className={`h-5 w-5 shrink-0 mt-0.5 ${
                            plan.highlighted
                              ? 'text-purple-500'
                              : 'text-green-500'
                          }`}
                        />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link to="/BookWizard">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                          : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
