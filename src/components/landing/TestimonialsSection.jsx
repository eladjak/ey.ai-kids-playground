import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/components/i18n/i18nProvider';

const TestimonialsSection = () => {
  const { t, isRTL } = useI18n();

  const testimonials = [
    {
      name: t('landing.testimonials.t1.name'),
      role: t('landing.testimonials.t1.role'),
      quote: t('landing.testimonials.t1.quote'),
      initials: t('landing.testimonials.t1.initials'),
      gradient: 'from-purple-400 to-indigo-500',
    },
    {
      name: t('landing.testimonials.t2.name'),
      role: t('landing.testimonials.t2.role'),
      quote: t('landing.testimonials.t2.quote'),
      initials: t('landing.testimonials.t2.initials'),
      gradient: 'from-pink-400 to-rose-500',
    },
    {
      name: t('landing.testimonials.t3.name'),
      role: t('landing.testimonials.t3.role'),
      quote: t('landing.testimonials.t3.quote'),
      initials: t('landing.testimonials.t3.initials'),
      gradient: 'from-amber-400 to-orange-500',
    },
  ];

  return (
    <section
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
            {t('landing.testimonials.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('landing.testimonials.sectionSubtitle')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                {/* Subtle gradient top border */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${testimonial.gradient}`} />
                <CardContent className="p-6 sm:p-8">
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-purple-200 dark:text-purple-800 mb-4" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
