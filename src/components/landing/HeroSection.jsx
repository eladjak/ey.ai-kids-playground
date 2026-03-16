import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Star, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/i18nProvider';

const FloatingShape = ({ className, delay = 0, duration = 6, children }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    {children}
  </motion.div>
);

const BookMockup = ({ isRTL, t }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, rotateY: isRTL ? 15 : -15 }}
    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
    className="relative w-64 sm:w-72 md:w-80 mx-auto mt-8 lg:mt-0"
    style={{ perspective: '1000px' }}
  >
    {/* Book cover */}
    <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden aspect-[3/4] border-4 border-white/20">
      {/* Spine effect */}
      <div className="absolute inset-y-0 start-0 w-4 bg-gradient-to-r from-black/20 to-transparent" />

      {/* Cover content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
        <Sparkles className="h-12 w-12 mb-4 text-yellow-300" />
        <h3 className="text-xl font-bold mb-2 leading-tight">
          {t('landing.hero.bookMockupTitle')}
        </h3>
        <div className="w-12 h-0.5 bg-yellow-300/60 mb-3" />
        <p className="text-sm text-purple-100 mb-4">
          {t('landing.hero.bookMockupAuthor')}
        </p>
        {/* Mini illustration placeholder */}
        <div className="w-32 h-24 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <Star className="h-8 w-8 text-yellow-300/80" />
        </div>
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: [-200, 400] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
      />
    </div>

    {/* Shadow */}
    <div className="absolute -bottom-4 inset-x-8 h-8 bg-black/10 rounded-full blur-xl" />
  </motion.div>
);

const HeroSection = () => {
  const { t, isRTL } = useI18n();

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120,60,200,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(120,60,200,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 20%, rgba(120,60,200,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(120,60,200,0.4) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating decorative shapes */}
      <FloatingShape className="top-20 start-[10%]" delay={0} duration={7}>
        <BookOpen className="h-10 w-10 text-white/20" />
      </FloatingShape>
      <FloatingShape className="top-40 end-[15%]" delay={1} duration={5}>
        <Star className="h-8 w-8 text-yellow-300/30" />
      </FloatingShape>
      <FloatingShape className="bottom-32 start-[20%]" delay={2} duration={6}>
        <Sparkles className="h-6 w-6 text-purple-300/30" />
      </FloatingShape>
      <FloatingShape className="top-60 start-[60%]" delay={0.5} duration={8}>
        <Wand2 className="h-7 w-7 text-white/15" />
      </FloatingShape>
      <FloatingShape className="bottom-40 end-[25%]" delay={1.5} duration={6}>
        <Star className="h-5 w-5 text-yellow-200/25" />
      </FloatingShape>
      <FloatingShape className="top-32 start-[45%]" delay={3} duration={7}>
        <BookOpen className="h-6 w-6 text-white/10" />
      </FloatingShape>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={`text-center lg:text-start ${isRTL ? 'lg:order-1' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm text-white/90">{t('landing.hero.badge')}</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {t('landing.hero.title')}
            </h1>

            <p className="text-lg sm:text-xl text-purple-100 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/BookWizard">
                <Button
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-gray-100 shadow-xl text-base px-8 py-6 rounded-xl font-bold w-full sm:w-auto"
                >
                  <Wand2 className="h-5 w-5" />
                  {t('landing.hero.primaryCta')}
                </Button>
              </Link>
              <Link to="/Community">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-base px-8 py-6 rounded-xl font-medium w-full sm:w-auto"
                >
                  <BookOpen className="h-5 w-5" />
                  {t('landing.hero.secondaryCta')}
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-white/70 text-sm"
            >
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-indigo-400 border-2 border-white/30 flex items-center justify-center text-xs text-white font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>{t('landing.hero.socialProof')}</span>
            </motion.div>
          </motion.div>

          {/* Book Mockup */}
          <div className={`flex justify-center ${isRTL ? 'lg:order-0' : ''}`}>
            <BookMockup isRTL={isRTL} t={t} />
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,120 L0,120 Z"
            fill="white"
            className="dark:fill-gray-950"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
