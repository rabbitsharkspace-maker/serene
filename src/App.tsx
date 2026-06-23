import React, { useEffect, useState } from 'react';
import LiveDemo from './components/LiveDemo';
import SafetyShieldDemo from './components/SafetyShieldDemo';
import EmergencyAidDemo from './components/EmergencyAidDemo';
import EcosystemHub from './components/EcosystemHub';
import HistoryView from './components/HistoryView';
import LegalHubDemo from './components/LegalHubDemo';
import { Mail, Shield, AlertTriangle, Compass, LogIn, LogOut, Clock, Scale, ListTodo } from 'lucide-react';

import { initAuth, googleSignIn, logout } from './lib/firebase';
import { sendEmail } from './lib/gmail';
import { User } from 'firebase/auth';
import { useLocale, COUNTRIES, LANGUAGES, REGIONS } from './lib/locale';

type TabView = 'letter' | 'shield' | 'legalhub' | 'emergency' | 'roadmap' | 'history';

export default function App() {
  const { country, language, region, setCountry, setLanguage, setRegion } = useLocale();
  const regionOptions = REGIONS[country] || [];
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('emergency');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthError(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setAuthError('popup-closed');
      } else {
        setAuthError(err?.message || 'unknown');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSendEmail = async (recipient: string, subject: string, body: string) => {
    if (!accessToken) throw new Error("No token");
    await sendEmail(accessToken, recipient, subject, body);
  };

  const tabs: { id: TabView; label: string; icon: React.ReactNode }[] = [
    { id: 'letter', label: '信件官', icon: <Mail size={24} /> },
    { id: 'shield', label: '防坑盾', icon: <Shield size={24} /> },
    { id: 'legalhub', label: '法援站', icon: <Scale size={24} /> },
    { id: 'history', label: '我的案头', icon: <ListTodo size={24} /> },
    { id: 'emergency', label: '急救包', icon: <AlertTriangle size={24} /> },
    { id: 'roadmap', label: '生态', icon: <Compass size={24} /> }
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-canvas font-sans text-body overflow-hidden pb-16 md:pb-0 md:pl-20 relative">

      {/* Top App Bar */}
      <header className="bg-canvas/85 backdrop-blur-md border-b border-hairline flex items-center justify-between px-5 md:px-6 py-3.5 z-20 sticky top-0 w-full">
        <h1 className="flex items-center gap-2.5 text-lg md:text-xl">
          <span className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-on-primary font-display text-lg shadow-sm">S</span>
          <span className="flex flex-col leading-none">
            <span className="font-display font-medium text-ink tracking-tight">Serene</span>
            <span className="hidden sm:block text-[11px] font-sans font-medium text-muted mt-0.5 tracking-wide">海外落地安心副驾 · Landing Copilot</span>
          </span>
        </h1>
        <div className="flex items-center gap-2 md:gap-2.5">
          {/* Destination country + display language selectors — the "无界" controls */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            title="目的国 Destination country"
            className="text-xs md:text-sm font-medium text-body bg-surface-soft border border-hairline rounded-lg px-2.5 py-2 cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
            ))}
          </select>
          {regionOptions.length > 0 && (
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              title="州/省 State or province"
              className="hidden sm:block text-xs md:text-sm font-medium text-body bg-surface-soft border border-hairline rounded-lg px-2.5 py-2 cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary max-w-[9rem]"
            >
              <option value="">州/省 (可选)</option>
              {regionOptions.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          )}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            title="显示语言 Display language"
            className="text-xs md:text-sm font-medium text-body bg-surface-soft border border-hairline rounded-lg px-2.5 py-2 cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
         <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
            {activeTab === 'letter' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LiveDemo 
                   user={user} 
                   accessToken={accessToken} 
                   onLogin={handleLogin} 
                   onLogout={handleLogout} 
                   onSendEmail={handleSendEmail} 
                />
              </div>
            )}
            {activeTab === 'shield' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SafetyShieldDemo />
              </div>
            )}
            {activeTab === 'legalhub' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LegalHubDemo />
              </div>
            )}
            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <HistoryView />
              </div>
            )}
            {activeTab === 'emergency' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <EmergencyAidDemo />
              </div>
            )}
            {activeTab === 'roadmap' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                <EcosystemHub />
              </div>
            )}
         </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-canvas/90 backdrop-blur-md border-t border-hairline px-6 pt-2 pb-[max(env(safe-area-inset-bottom),1rem)] flex justify-between items-center z-50">
         {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-muted-soft hover:text-body'}`}
            >
               <div className={`mb-1 ${activeTab === tab.id ? 'scale-110 transition-transform' : ''}`}>
                 {tab.icon}
               </div>
               <span className={`text-[10px] ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
         ))}
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-20 bg-canvas border-r border-hairline flex-col items-center pt-24 pb-8 z-10">
         <div className="flex-1 flex flex-col gap-3 w-full px-3">
            {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 title={tab.label}
                 className={`flex flex-col items-center py-3 rounded-xl w-full transition-all ${activeTab === tab.id ? 'bg-ink text-on-dark shadow-sm' : 'text-muted-soft hover:text-body hover:bg-surface-soft'}`}
               >
                  <div className={`${activeTab === tab.id ? 'scale-110 transition-transform' : ''}`}>
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-medium mt-1.5">{tab.label}</span>
               </button>
            ))}
         </div>
      </nav>

    </div>
  );
}
