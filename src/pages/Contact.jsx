import React, { useState } from 'react';
import { useI18n } from '@/components/i18n/i18nProvider';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const SUPPORT_EMAIL = 'support@sipurai.ai';

const translations = {
  english: {
    title: 'Contact Us',
    subtitle: 'We\'d love to hear from you. Send us a message and we\'ll get back to you as soon as possible.',
    emailLabel: 'Direct Email',
    formTitle: 'Send a Message',
    name: 'Full Name',
    namePlaceholder: 'Your name...',
    email: 'Email Address',
    emailPlaceholder: 'your@email.com',
    subject: 'Subject',
    subjectPlaceholder: 'Select a subject...',
    subjects: {
      general: 'General Question',
      bug: 'Bug Report',
      billing: 'Billing & Subscription',
      feature: 'Feature Request',
    },
    message: 'Message',
    messagePlaceholder: 'Tell us how we can help...',
    send: 'Send Message',
    sending: 'Sending...',
    successTitle: 'Message Sent!',
    successText: 'Thank you for reaching out. We\'ll get back to you within 1-2 business days.',
    sendAnother: 'Send Another Message',
    responseTime: 'We typically respond within 1-2 business days.',
  },
  hebrew: {
    title: 'צור קשר',
    subtitle: 'נשמח לשמוע מכם. שלחו לנו הודעה ונחזור אליכם בהקדם.',
    emailLabel: 'אימייל ישיר',
    formTitle: 'שליחת הודעה',
    name: 'שם מלא',
    namePlaceholder: '...השם שלך',
    email: 'כתובת אימייל',
    emailPlaceholder: 'your@email.com',
    subject: 'נושא',
    subjectPlaceholder: '...בחרו נושא',
    subjects: {
      general: 'שאלה כללית',
      bug: 'דיווח על תקלה',
      billing: 'חיוב ומנוי',
      feature: 'בקשת פיצ\'ר',
    },
    message: 'הודעה',
    messagePlaceholder: '...ספרו לנו כיצד נוכל לעזור',
    send: 'שליחת הודעה',
    sending: '...שולח',
    successTitle: '!ההודעה נשלחה',
    successText: 'תודה על הפנייה. נחזור אליכם תוך 1-2 ימי עסקים.',
    sendAnother: 'שליחת הודעה נוספת',
    responseTime: 'אנו בדרך כלל עונים תוך 1-2 ימי עסקים.',
  },
  yiddish: {
    title: 'קאָנטאַקטירט אונדז',
    subtitle: 'מיר וועלן שמחה זיין צו הערן פֿון אייך.',
    emailLabel: 'דירעקטע בליצפּאָסט',
    formTitle: 'שיקט אַ מעסעדזש',
    name: 'פֿולן נאָמען',
    namePlaceholder: '...אייער נאָמען',
    email: 'בליצפּאָסט אַדרעס',
    emailPlaceholder: 'your@email.com',
    subject: 'טעמע',
    subjectPlaceholder: '...קלויבט אַ טעמע',
    subjects: {
      general: 'אַלגעמיינע פֿראַגע',
      bug: 'פעלער באַריכט',
      billing: 'צאָלונג',
      feature: 'בקשה',
    },
    message: 'מעסעדזש',
    messagePlaceholder: '...דערציילט אונדז ווי מיר קענען העלפֿן',
    send: 'שיקן מעסעדזש',
    sending: '...שיקן',
    successTitle: '!מעסעדזש געשיקט',
    successText: 'אַ דאַנק פֿאַר זיך צו ווענדן. מיר וועלן ענטפֿערן אין 1-2 אַרבעטס טעג.',
    sendAnother: 'שיקן נאָך אַ מעסעדזש',
    responseTime: 'מיר ענטפֿערן בדרך כלל אין 1-2 אַרבעטס טעג.',
  },
};

export default function Contact() {
  const { language, isRTL } = useI18n();
  const lang = language in translations ? language : 'english';
  const tx = translations[lang];

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;

    setSubmitting(true);

    // Build a mailto link as the fallback submission mechanism
    const subjectLabel = tx.subjects[form.subject] || form.subject;
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${subjectLabel}\n\n${form.message}`;
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[Sipurai] ${subjectLabel}`)}&body=${encodeURIComponent(body)}`;

    // Open mailto in a new tab so the form stays visible
    window.open(mailtoUrl, '_blank');

    // Brief delay to show "sending" state, then show success
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitted(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-14 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-5 backdrop-blur-sm">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{tx.title}</h1>
          <p className="text-purple-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {tx.subtitle}
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">

          {/* Left: Direct email card */}
          <motion.div
            className="md:col-span-2 space-y-4"
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-gray-900 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{tx.emailLabel}</h3>
                </div>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-purple-600 dark:text-purple-400 font-medium hover:underline break-all text-sm"
                >
                  {SUPPORT_EMAIL}
                </a>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {tx.responseTime}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-gray-900 overflow-hidden">
              <CardContent className="p-6">
                {submitted ? (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {tx.successTitle}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                      {tx.successText}
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20"
                    >
                      {tx.sendAnother}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className={`text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {tx.formTitle}
                    </h2>

                    {/* Name + Email row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name" className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right block' : ''}`}>
                          {tx.name}
                        </Label>
                        <Input
                          id="contact-name"
                          value={form.name}
                          onChange={e => handleChange('name', e.target.value)}
                          placeholder={tx.namePlaceholder}
                          required
                          className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email" className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right block' : ''}`}>
                          {tx.email}
                        </Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={form.email}
                          onChange={e => handleChange('email', e.target.value)}
                          placeholder={tx.emailPlaceholder}
                          required
                          className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400/20"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <Label className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right block' : ''}`}>
                        {tx.subject}
                      </Label>
                      <Select
                        value={form.subject}
                        onValueChange={val => handleChange('subject', val)}
                        required
                      >
                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400/20">
                          <SelectValue placeholder={tx.subjectPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">{tx.subjects.general}</SelectItem>
                          <SelectItem value="bug">{tx.subjects.bug}</SelectItem>
                          <SelectItem value="billing">{tx.subjects.billing}</SelectItem>
                          <SelectItem value="feature">{tx.subjects.feature}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-message" className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right block' : ''}`}>
                        {tx.message}
                      </Label>
                      <Textarea
                        id="contact-message"
                        value={form.message}
                        onChange={e => handleChange('message', e.target.value)}
                        placeholder={tx.messagePlaceholder}
                        required
                        rows={5}
                        className="rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400/20 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || !form.name || !form.email || !form.subject || !form.message}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-5 font-semibold shadow-md transition-all"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2 justify-center">
                          <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          {tx.sending}
                        </span>
                      ) : (
                        <span className={`flex items-center gap-2 justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Send className="h-4 w-4" />
                          {tx.send}
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
