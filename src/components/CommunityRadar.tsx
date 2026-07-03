import React, { useState } from 'react';
import {
  Radar, Users, CalendarDays, Sparkles, Loader2, ExternalLink,
  ShieldAlert, MapPin, GraduationCap, Search,
} from 'lucide-react';
import { useLocale, getCountryContent } from '../lib/locale';
import FallbackNotice from './FallbackNotice';
import GroundingSources, { Grounding } from './GroundingSources';

type Group = { name: string; platform: string; url: string; who: string; safetyTip: string };
type EventItem = { name: string; when: string; where: string; url: string; why: string };
type Result = {
  summary: string;
  groups: Group[];
  events: EventItem[];
  isQuotaFallback?: boolean;
  _grounding?: Grounding | null;
};

// Country-aware starter school so the demo runs out of the box.
const DEMO_SCHOOL: Record<string, string> = {
  AU: 'University of Melbourne 墨尔本大学',
  US: 'New York University 纽约大学',
  UK: 'University College London UCL',
  CA: 'University of Toronto 多伦多大学',
};

const INTEREST_CHIPS = ['租房/二手', '拼饭/美食', '找工作/实习', '语言交换', '同乡/老乡会', '户外/运动', '学业互助'];

const platformStyle = (p: string) => {
  const key = p.toLowerCase();
  if (key.includes('facebook')) return 'bg-[#1877f2]/10 text-[#1877f2] border-[#1877f2]/25';
  if (key.includes('wechat') || key.includes('微信')) return 'bg-[#07c160]/10 text-[#07c160] border-[#07c160]/25';
  if (key.includes('discord')) return 'bg-[#5865f2]/10 text-[#5865f2] border-[#5865f2]/25';
  if (key.includes('meetup')) return 'bg-[#f6405f]/10 text-[#f6405f] border-[#f6405f]/25';
  return 'bg-primary/10 text-primary border-primary/25';
};

// 社区雷达 — Search-grounded scan of the newcomer's city + campus for REAL local Facebook/WeChat
// groups and upcoming events. Every card links to a live source (see GroundingSources), so it
// informs rather than fabricates: the #1 thing a just-landed student wants but can't find.
export default function CommunityRadar() {
  const { country, region, language } = useLocale();
  const content = getCountryContent(country);

  const [school, setSchool] = useState<string>(DEMO_SCHOOL[country] || DEMO_SCHOOL.AU);
  const [interests, setInterests] = useState<string[]>(['租房/二手', '拼饭/美食']);
  const [timeframe, setTimeframe] = useState('本周');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  // Google Maps embed query for the event the user tapped (null = map hidden).
  const [mapQuery, setMapQuery] = useState<string | null>(null);

  const toggleInterest = (chip: string) =>
    setInterests((prev) => (prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]));

  const scan = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    setMapQuery(null);
    try {
      const res = await fetch('/api/community-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country, region, language,
          school,
          interests: interests.join('、'),
          timeframe,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const d: Result = await res.json();
      if (!d.groups?.length && !d.events?.length) throw new Error('empty');
      setResult(d);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-hairline rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-primary bg-primary rounded-full px-2.5 py-1 mb-2">
          <Radar size={12} /> 社区雷达 · Community Radar
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
          落地就找到组织
        </h3>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          告诉我你的学校和兴趣，Gemini 联网实时帮你搜出 {content.nameZh} 当地真实的留学生群、二手/租房群和本周活动——每条都带可点开的真实来源，绝不编造。
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-muted-soft uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <GraduationCap size={13} className="text-primary" /> 学校 / 城市区域
          </label>
          <div className="flex items-center gap-1.5 bg-surface-soft border border-hairline rounded-xl px-3 py-2.5">
            <MapPin size={14} className="text-primary shrink-0" />
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="例如：墨尔本大学 / Clayton, Monash"
              className="bg-transparent text-sm text-body focus:outline-none w-full"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-soft uppercase tracking-wider mb-1.5 block">
            我想找的
          </label>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => toggleInterest(chip)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  interests.includes(chip)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-white text-muted border-hairline hover:border-primary'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-soft uppercase tracking-wider mb-1.5 block">
            时间范围
          </label>
          <div className="flex flex-wrap gap-1.5">
            {['本周', '本月', '开学季', '不限'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  timeframe === tf
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-muted border-hairline hover:border-ink'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={scan}
        disabled={loading}
        className="cta-3d disabled:opacity-60 text-sm font-bold px-5 py-2.5 flex items-center gap-2 mt-5"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> 正在联网扫描当地社区…</>
          : <><Search size={16} /> 扫描当地社区</>}
      </button>

      {error && <p className="text-xs text-error mt-2">扫描失败，请稍后重试。</p>}

      {/* Result */}
      {result && (
        <div className="mt-6 pt-6 border-t border-hairline animate-in fade-in slide-in-from-bottom-3 duration-400">
          {result.isQuotaFallback && <FallbackNotice className="mb-5" />}

          <div className="bg-primary-soft border border-primary/20 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-body leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Groups */}
          {result.groups?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs font-black text-ink uppercase tracking-wider mb-3">
                <Users size={14} className="text-primary" /> 值得加入的群组
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.groups.map((g, i) => (
                  <div key={i} className="rounded-2xl border border-hairline bg-white p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-sm font-bold text-ink leading-snug">{g.name}</span>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${platformStyle(g.platform)}`}>
                        {g.platform}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed flex-1">{g.who}</p>
                    {g.safetyTip && (
                      <div className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 rounded-lg px-2 py-1.5">
                        <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                        <span className="leading-normal">{g.safetyTip}</span>
                      </div>
                    )}
                    {g.url && (
                      <a
                        href={g.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <ExternalLink size={12} /> 打开
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {result.events?.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-ink uppercase tracking-wider mb-3">
                <CalendarDays size={14} className="text-primary" /> 近期活动
              </div>
              <div className="space-y-2.5">
                {result.events.map((ev, i) => (
                  <div key={i} className="rounded-2xl border border-hairline bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-ink leading-snug">{ev.name}</span>
                      <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                        {ev.when}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-1.5 leading-relaxed">{ev.why}</p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => setMapQuery(mapQuery === ev.where ? null : ev.where)}
                        className={`text-[10px] flex items-center gap-1 rounded-full border px-2 py-1 transition-all ${
                          mapQuery === ev.where
                            ? 'bg-primary text-on-primary border-primary'
                            : 'text-muted-soft border-hairline hover:border-primary hover:text-primary'
                        }`}
                        title="在 Google 地图中查看"
                      >
                        <MapPin size={11} /> {ev.where}
                      </button>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
                        >
                          <ExternalLink size={12} /> 详情
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Google Map for the tapped venue (same free embed as the 拼饭 planner) */}
              {mapQuery && (
                <div className="mt-3 animate-in fade-in duration-300">
                  <div className="rounded-2xl overflow-hidden border border-hairline bg-surface-soft">
                    <iframe
                      title="community-event-map"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                      className="w-full"
                      style={{ border: 0, height: 280 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <p className="text-[10px] text-muted-soft mt-1.5">🗺️ Google Maps · 点击地点标签可收起</p>
                </div>
              )}
            </div>
          )}

          {result._grounding && <GroundingSources grounding={result._grounding} />}
        </div>
      )}
    </div>
  );
}
