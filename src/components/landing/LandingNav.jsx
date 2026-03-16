import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/i18nProvider';

const LandingNav = () => {
  const { t, isRTL, language, changeLanguage, languages } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: t('landing.nav.features') },
    { href: '#how-it-works', label: t('landing.nav.howItWorks') },
    { href: '#pricing', label: t('landing.nav.pricing') },
  ];

  const languageOptions = Object.entries(languages).map(([key, lang]) => ({
    key,
    name: lang.name,
    code: lang.code,
  }));

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className={`h-8 w-8 text-purple-600 ${scrolled ? '' : 'text-white'}`} />
            <span className={`text-xl font-bold ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
              Sipurai
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                  scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side: Language + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative group">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  scrolled
                    ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>{languages[language]?.name}</span>
              </button>
              <div className="absolute end-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px]">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.key}
                    onClick={() => changeLanguage(lang.key)}
                    className={`block w-full text-start px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                      language === lang.key
                        ? 'text-purple-600 font-medium bg-purple-50 dark:bg-purple-900/20'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign In */}
            <Link to="/sign-in">
              <Button variant="ghost" className={`font-medium ${
                scrolled ? 'text-gray-700 hover:text-purple-600 dark:text-gray-300' : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}>
                {t('landing.nav.signIn')}
              </Button>
            </Link>
            {/* CTA Button */}
            <Link to="/sign-up">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                {t('landing.nav.cta')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
            }`}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white dark:bg-gray-900 border-t shadow-lg"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex gap-2">
              {languageOptions.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => {
                    changeLanguage(lang.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    language === lang.key
                      ? 'bg-purple-100 text-purple-700 font-medium dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
            <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full mt-2">
                {t('landing.nav.signIn')}
              </Button>
            </Link>
            <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-1">
                {t('landing.nav.cta')}
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default LandingNav;
