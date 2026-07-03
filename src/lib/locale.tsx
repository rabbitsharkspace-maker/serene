import React, { createContext, useContext, useEffect, useState } from 'react';

// Destination countries: the four largest English-speaking immigration destinations.
// Official letters are always English; only the user-facing display language varies.
export const COUNTRIES: { code: string; flag: string; label: string }[] = [
  { code: 'AU', flag: '🇦🇺', label: '澳大利亚 Australia' },
  { code: 'US', flag: '🇺🇸', label: '美国 United States' },
  { code: 'UK', flag: '🇬🇧', label: '英国 United Kingdom' },
  { code: 'CA', flag: '🇨🇦', label: '加拿大 Canada' },
];

// Display language for explanations/analysis (chosen by top immigrant source languages).
export const LANGUAGES: { code: string; flag: string; label: string }[] = [
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'hi', flag: '🇮🇳', label: 'हिन्दी' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
];

// Per-country front-end content so switching country instantly changes the visible UI
// (default identity, emergency number, currency) — not just the AI output.
export type CountryContent = {
  nameZh: string;
  nameEn: string;        // shown when display language is not Chinese (non-zh users can't read 中文)
  defaultVisaZh: string;   // shown in the "记忆副驾" identity pill by default (Chinese UI)
  defaultVisaEn: string;   // same pill for non-Chinese UI
  emergency: string;       // emergency phone number
  currency: string;        // currency symbol shown in UI
  currencyCode: string;
  sampleAddress: string;   // demo "GPS location" sample to read to the operator
};

export const COUNTRY_CONTENT: Record<string, CountryContent> = {
  AU: { nameZh: '澳大利亚', nameEn: 'Australia', defaultVisaZh: '500 学生签证', defaultVisaEn: 'Subclass 500 Student visa', emergency: '000', currency: '$', currencyCode: 'AUD', sampleAddress: '123 Swanston St, Melbourne VIC 3000' },
  US: { nameZh: '美国', nameEn: 'United States', defaultVisaZh: 'F-1 学生签证', defaultVisaEn: 'F-1 Student visa', emergency: '911', currency: '$', currencyCode: 'USD', sampleAddress: '350 5th Ave, New York, NY 10118' },
  UK: { nameZh: '英国', nameEn: 'United Kingdom', defaultVisaZh: 'Student visa 学生签证', defaultVisaEn: 'Student visa', emergency: '999', currency: '£', currencyCode: 'GBP', sampleAddress: '10 Downing St, London SW1A 2AA' },
  CA: { nameZh: '加拿大', nameEn: 'Canada', defaultVisaZh: 'Study Permit 学习许可', defaultVisaEn: 'Study Permit', emergency: '911', currency: '$', currencyCode: 'CAD', sampleAddress: '290 Bremner Blvd, Toronto ON M5V 3L9' },
};

export function getCountryContent(code: string): CountryContent {
  return COUNTRY_CONTENT[code] || COUNTRY_CONTENT.AU;
}

// Country name in the user's display language. Chinese users see 中文; everyone else
// sees the English name (they can't read 中文), never the raw nameZh.
export function getCountryName(code: string, language: string): string {
  const c = getCountryContent(code);
  return language === 'zh' ? c.nameZh : c.nameEn;
}

// Default visa label in the user's display language (Chinese users see 中文, others English).
export function getDefaultVisa(code: string, language: string): string {
  const c = getCountryContent(code);
  return language === 'zh' ? c.defaultVisaZh : c.defaultVisaEn;
}

// English name of the user's language, for shouting to the emergency interpreter line
// e.g. "Mandarin Chinese, Please!" / "Spanish, Please!"
const LANG_INTERPRETER: Record<string, string> = {
  zh: 'Mandarin Chinese',
  es: 'Spanish',
  hi: 'Hindi',
  vi: 'Vietnamese',
  ar: 'Arabic',
  en: 'English',
};

export function getInterpreterName(language: string): string {
  return LANG_INTERPRETER[language] || 'Mandarin Chinese';
}

// State / province lists. Tenancy law, fines and deposit disputes are jurisdiction-specific,
// so the chosen region is passed to the AI for accurate, locally-grounded answers.
export const REGIONS: Record<string, { code: string; label: string }[]> = {
  AU: [
    { code: 'NSW', label: 'New South Wales' },
    { code: 'VIC', label: 'Victoria' },
    { code: 'QLD', label: 'Queensland' },
    { code: 'WA', label: 'Western Australia' },
    { code: 'SA', label: 'South Australia' },
    { code: 'TAS', label: 'Tasmania' },
    { code: 'ACT', label: 'ACT' },
    { code: 'NT', label: 'Northern Territory' },
  ],
  US: [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
    'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
    'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
    'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
    'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  ].map((s) => ({ code: s, label: s })),
  UK: [
    { code: 'England', label: 'England' },
    { code: 'Scotland', label: 'Scotland' },
    { code: 'Wales', label: 'Wales' },
    { code: 'Northern Ireland', label: 'Northern Ireland' },
  ],
  CA: [
    { code: 'Ontario', label: 'Ontario' },
    { code: 'Quebec', label: 'Quebec' },
    { code: 'British Columbia', label: 'British Columbia' },
    { code: 'Alberta', label: 'Alberta' },
    { code: 'Manitoba', label: 'Manitoba' },
    { code: 'Saskatchewan', label: 'Saskatchewan' },
    { code: 'Nova Scotia', label: 'Nova Scotia' },
    { code: 'New Brunswick', label: 'New Brunswick' },
    { code: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador' },
    { code: 'Prince Edward Island', label: 'Prince Edward Island' },
  ],
};

type LocaleState = {
  country: string;
  language: string;
  region: string;
  setCountry: (c: string) => void;
  setLanguage: (l: string) => void;
  setRegion: (r: string) => void;
};

const LocaleContext = createContext<LocaleState | null>(null);

// Melbourne-first launch: the product currently ships for Australia only. The multi-country
// architecture stays intact (COUNTRY_CONTENT/REGIONS above) so other markets can be re-enabled
// by flipping this flag — but the UI locks to AU and defaults to VIC (Melbourne).
export const AU_FOCUS = true;

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<string>(() => {
    if (AU_FOCUS) return 'AU';
    return localStorage.getItem('serene_country') || 'AU';
  });
  const [language, setLanguageState] = useState<string>(
    () => localStorage.getItem('serene_language') || 'zh'
  );
  const [region, setRegionState] = useState<string>(() => {
    const stored = localStorage.getItem('serene_region') || '';
    if (AU_FOCUS) {
      // A region persisted from another country (or none) falls back to VIC (Melbourne).
      return REGIONS.AU.some((r) => r.code === stored) ? stored : 'VIC';
    }
    return stored;
  });

  useEffect(() => { localStorage.setItem('serene_country', country); }, [country]);
  useEffect(() => { localStorage.setItem('serene_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('serene_region', region); }, [region]);

  // Switching country invalidates the previously-selected region.
  const setCountry = (c: string) => {
    setCountryState(c);
    setRegionState('');
  };

  return (
    <LocaleContext.Provider
      value={{ country, language, region, setCountry, setLanguage: setLanguageState, setRegion: setRegionState }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleState {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return { country: 'AU', language: 'zh', region: '', setCountry: () => {}, setLanguage: () => {}, setRegion: () => {} };
  }
  return ctx;
}
