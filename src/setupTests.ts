import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder, ReadableStream } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;

// Simple translation function
const translate = (key: string) => {
  const translations: { [key: string]: string } = {
    "Править": "Correct",
    "Улучшить": "Improve",
    "Исправление ошибок": "Correction of grammar",
    "Исправление ошибок текста для грамотного письма на любом языке.": "Correction of grammar mistakes for a professional look in any language.",
    "Введите ваш текст здесь...": "Enter your text here...",
    'grammarChecker.limitReached': "You've reached the character limit for anonymous users. Please sign in to continue with longer texts.",
    'grammarChecker.correcting': 'Correcting...',
    'grammarChecker.improving': 'Improving...',
    'grammarChecker.copy': 'Copy',
    'grammarChecker.revert': 'Revert',
    'grammarChecker.dailyLimitReached': 'Daily correction limit reached',
    'grammarChecker.error': 'An error occurred',
    'grammarChecker.premiumAccess': 'Premium access until {{date}}',
    'grammarChecker.premiumFeatures': 'You can check texts up to {{limit}} characters',
    'grammarChecker.freeAccount': 'Free account: {{limit}} chars limit, {{remaining}} corrections left today',
    'grammarChecker.upgradeToPremium': 'Upgrade to Premium for {{limit}} chars per check',
    'subscription.title': 'Subscription Plans',
    'subscription.subtitle': 'Choose the plan that fits your needs.',
    'subscription.free.title': 'Free',
    'subscription.free.features.0': 'Unlimited short text corrections',
    'subscription.free.features.1': '5 long text corrections (up to 500 chars) daily',
    'subscription.free.signUp': 'Sign Up',
    'subscription.premium.title': 'Premium',
    'subscription.premium.price': '{{price}} {{currency}}/{{interval}}',
    'subscription.premium.features.0': 'Unlimited corrections of long texts',
    'subscription.premium.features.1': '2000 chars per check (~1 page)',
    'subscription.premium.subscribe': 'Subscribe',
    'auth.signIn': 'Sign In with Google',
    'auth.signOut': 'Sign Out',
    'inviteLink.button': 'Invite & Extend Premium',
    'inviteLink.copied': 'Invite link copied to clipboard! Share it to extend your premium access.'
  };
  return translations[key] || key;
};

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string, params?: Record<string, any>) => {
        let translated = translate(str);
        if (params) {
          Object.keys(params).forEach(key => {
            translated = translated.replace(`{{${key}}}`, params[key]);
          });
        }
        return translated;
      },
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock i18next
jest.mock('i18next', () => ({
  use: () => ({
    init: () => {},
  }),
}));