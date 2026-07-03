import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// --- Mock the heavy leaf modules so App can be tested in isolation. ---
// firebase.ts runs initializeApp + a live network check at import time; stub it out.
// vi.hoisted lets these exist before the hoisted vi.mock factory runs, while staying
// referenceable in assertions below.
const { initAuth, googleSignIn, consumeRedirectResult, logout } = vi.hoisted(() => ({
  initAuth: vi.fn(() => () => {}),
  googleSignIn: vi.fn(),
  consumeRedirectResult: vi.fn(() => Promise.resolve(null)),
  logout: vi.fn(() => Promise.resolve()),
}));
vi.mock('./lib/firebase', () => ({ initAuth, googleSignIn, consumeRedirectResult, logout }));
vi.mock('./lib/gmail', () => ({ createGmailDraft: vi.fn() }));

// Each tab is a real, network-touching component — replace with identifiable stubs.
vi.mock('./components/LiveDemo', () => ({ default: () => <div data-testid="tab-letter">letter officer</div> }));
vi.mock('./components/SafetyShieldDemo', () => ({ default: () => <div data-testid="tab-shield">safety shield</div> }));
vi.mock('./components/EmergencyAidDemo', () => ({ default: () => <div data-testid="tab-emergency">emergency aid</div> }));
vi.mock('./components/EcosystemHub', () => ({ default: () => <div data-testid="tab-roadmap">ecosystem</div> }));
vi.mock('./components/HistoryView', () => ({ default: () => <div data-testid="tab-history">history</div> }));
vi.mock('./components/LegalHubDemo', () => ({
  default: ({ onOpenLetterOfficer }: { onOpenLetterOfficer: () => void }) => (
    <div data-testid="tab-legalhub">
      legal station
      <button onClick={onOpenLetterOfficer}>open-letter</button>
    </div>
  ),
}));

import App from './App';
import { LocaleProvider } from './lib/locale';

const renderApp = () =>
  render(
    <LocaleProvider>
      <App />
    </LocaleProvider>
  );

// Desktop nav buttons carry title={label} (mobile nav does not), so getByTitle is unique.
const navTo = (user: ReturnType<typeof userEvent.setup>, label: string) =>
  user.click(screen.getByTitle(label));

beforeEach(() => vi.clearAllMocks());

describe('App shell (A5, A6 — navigation)', () => {
  it('subscribes to auth on mount', () => {
    renderApp();
    expect(initAuth).toHaveBeenCalledTimes(1);
  });

  it('defaults to the Letter Officer tab', () => {
    renderApp();
    expect(screen.getByTestId('tab-letter')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-shield')).not.toBeInTheDocument();
  });

  it.each([
    ['防坑盾', 'tab-shield'],
    ['法援站', 'tab-legalhub'],
    ['我的案头', 'tab-history'],
    ['急救包', 'tab-emergency'],
    ['生态', 'tab-roadmap'],
  ])('navigates to %s', async (label, testid) => {
    const user = userEvent.setup();
    renderApp();
    await navTo(user, label);
    expect(screen.getByTestId(testid)).toBeInTheDocument();
    expect(screen.queryByTestId('tab-letter')).not.toBeInTheDocument();
  });

  it('returns to Letter Officer after visiting another tab', async () => {
    const user = userEvent.setup();
    renderApp();
    await navTo(user, '急救包');
    expect(screen.getByTestId('tab-emergency')).toBeInTheDocument();
    await navTo(user, '信件官');
    expect(screen.getByTestId('tab-letter')).toBeInTheDocument();
  });

  it('Legal Station can hand off to Letter Officer (cross-link, case 33)', async () => {
    const user = userEvent.setup();
    renderApp();
    await navTo(user, '法援站');
    await user.click(screen.getByText('open-letter'));
    expect(screen.getByTestId('tab-letter')).toBeInTheDocument();
  });
});

describe('App header — global selectors (A1–A3, Melbourne-first)', () => {
  it('renders a fixed AU badge plus language and region selects', () => {
    renderApp();
    const countryBadge = screen.getByTitle('目的国 Destination country');
    expect(countryBadge).toBeInTheDocument();
    // Country is locked to AU: a static badge, not a <select>.
    expect(countryBadge.tagName).not.toBe('SELECT');
    expect(countryBadge).toHaveTextContent('澳大利亚');
    expect(screen.getByTitle('显示语言 Display language')).toBeInTheDocument();
    expect(screen.getByTitle('州/省 State or province')).toBeInTheDocument();
  });

  it('defaults the region select to VIC (Melbourne) and only offers AU states', () => {
    renderApp();
    const region = screen.getByTitle('州/省 State or province') as HTMLSelectElement;
    expect(region.value).toBe('VIC');
    const codes = Array.from(region.options).map((o) => o.value).filter(Boolean);
    expect(codes).toContain('VIC');
    expect(codes).not.toContain('California');
    expect(codes).not.toContain('Ontario');
  });
});
