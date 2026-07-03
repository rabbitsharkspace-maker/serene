import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  COUNTRIES,
  LANGUAGES,
  REGIONS,
  getCountryContent,
  getInterpreterName,
  LocaleProvider,
  useLocale,
} from './locale';

// A tiny harness that surfaces the locale context as testable DOM + controls.
function LocaleProbe() {
  const { country, language, region, setCountry, setLanguage, setRegion } = useLocale();
  return (
    <div>
      <span data-testid="country">{country}</span>
      <span data-testid="language">{language}</span>
      <span data-testid="region">{region || 'none'}</span>
      <button onClick={() => setCountry('US')}>to-US</button>
      <button onClick={() => setLanguage('es')}>to-ES</button>
      <button onClick={() => setRegion('VIC')}>set-region</button>
    </div>
  );
}

describe('locale data integrity (A1–A3)', () => {
  it('ships the four advertised destination countries with unique codes', () => {
    expect(COUNTRIES.map((c) => c.code)).toEqual(['AU', 'US', 'UK', 'CA']);
    expect(new Set(COUNTRIES.map((c) => c.code)).size).toBe(COUNTRIES.length);
  });

  it('every country has a flag and a label', () => {
    for (const c of COUNTRIES) {
      expect(c.flag).toBeTruthy();
      expect(c.label).toBeTruthy();
    }
  });

  it('offers the five display languages with unique codes', () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(['zh', 'es', 'hi', 'vi', 'ar']);
    expect(new Set(LANGUAGES.map((l) => l.code)).size).toBe(LANGUAGES.length);
  });

  it('every country has a non-empty region list', () => {
    for (const c of COUNTRIES) {
      expect(REGIONS[c.code]?.length, `${c.code} regions`).toBeGreaterThan(0);
    }
  });

  it('US exposes all 50 states', () => {
    expect(REGIONS.US).toHaveLength(50);
  });
});

describe('locale helpers (fallbacks)', () => {
  it('returns the matching country content', () => {
    expect(getCountryContent('US').emergency).toBe('911');
    expect(getCountryContent('UK').currency).toBe('£');
  });

  it('falls back to AU for an unknown country code', () => {
    expect(getCountryContent('ZZ')).toEqual(getCountryContent('AU'));
  });

  it('maps language code to interpreter name, defaulting to Mandarin', () => {
    expect(getInterpreterName('es')).toBe('Spanish');
    expect(getInterpreterName('xx')).toBe('Mandarin Chinese');
  });
});

describe('LocaleProvider behaviour (A1, A2, A4)', () => {
  it('defaults to AU / zh / VIC (Melbourne-first launch)', () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    );
    expect(screen.getByTestId('country')).toHaveTextContent('AU');
    expect(screen.getByTestId('language')).toHaveTextContent('zh');
    expect(screen.getByTestId('region')).toHaveTextContent('VIC');
  });

  it('changing country clears the previously selected region (A4)', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    );
    await user.click(screen.getByText('set-region'));
    expect(screen.getByTestId('region')).toHaveTextContent('VIC');
    await user.click(screen.getByText('to-US'));
    expect(screen.getByTestId('country')).toHaveTextContent('US');
    expect(screen.getByTestId('region')).toHaveTextContent('none');
  });

  it('persists country and language to localStorage (A1, A2)', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    );
    await user.click(screen.getByText('to-US'));
    await user.click(screen.getByText('to-ES'));
    expect(localStorage.getItem('serene_country')).toBe('US');
    expect(localStorage.getItem('serene_language')).toBe('es');
  });

  it('AU_FOCUS overrides any persisted non-AU country on mount (Melbourne-first)', () => {
    localStorage.setItem('serene_country', 'CA');
    localStorage.setItem('serene_region', 'Ontario');
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    );
    // The multi-country architecture persists, but the shipped product locks to AU/VIC.
    expect(screen.getByTestId('country')).toHaveTextContent('AU');
    expect(screen.getByTestId('region')).toHaveTextContent('VIC');
  });

  it('useLocale outside a provider yields safe no-op defaults', () => {
    render(<LocaleProbe />);
    expect(screen.getByTestId('country')).toHaveTextContent('AU');
    // setters are no-ops, so this must not throw
    expect(() => act(() => screen.getByText('to-US').click())).not.toThrow();
    expect(screen.getByTestId('country')).toHaveTextContent('AU');
  });
});
