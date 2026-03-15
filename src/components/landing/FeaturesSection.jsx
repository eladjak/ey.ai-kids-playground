import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Globe, UserCircle, Trophy, Smartphone, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/components/i18n/i18nProvider';

const featureIcons = [Palette, Globe, UserCircle, Trophy, Smartphone, Users];

const FeaturesSection = () => {
  const { t, isRTL } = useI18n();

  const features = [
    {
      icon: Palette,
      title: t('landing.features.artStyles.title'),
      description: t('landing.features.artStyles.description'),
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    },
    {
      icon: Globe,
      title: t('landing.features.trilingual.title'),
      description: t('landing.features.trilingual.description'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: UserCircle,
      title: t('landing.features.characters.title'),
      description: t('landing.features.characters.description'),
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    },
    {
      icon: Trophy,
      title: t('landing.features.gamification.title'),
      description: t('landing.features.gamification.description'),
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      icon: Smartphone,
      title: t('landing.features.pwa.title'),
      description: t('landing.features.pwa.description'),
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      icon: Users,
      title: t('landing.features.community.title'),
      description: t('landing.features.community.description'),
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
  ];

  return (
    <section
      id="features"
      className="py-20 sm:py-28 bg-white dark:bg-gray-950"
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
            {t('landing.features.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('landing.features.sectionSubtitle')}
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 sm:p-8">
                    <div
                      className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <div className={`bg-gradient-to-br ${feature.color} rounded-xl p-2.5`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
