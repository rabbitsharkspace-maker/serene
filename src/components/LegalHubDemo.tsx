import React, { useState, useEffect } from 'react';
import { Scale, Phone, Shield, BookOpen, AlertCircle, ExternalLink, Loader2, ListChecks, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { useLocale, getCountryContent, getCountryName, REGIONS } from '../lib/locale';
import { useT, StringKey } from '../lib/i18n';
import GroundingSources, { Grounding } from './GroundingSources';

interface ContactInfo { name: string; phone?: string; website?: string; desc: string; }
interface Scenario { title: string; rights?: string[]; steps: string[]; template: string; interpreterTip?: string; }
interface LegalData { contacts: ContactInfo[]; scenario: Scenario; _grounding?: Grounding | null; }

type Domain = 'rent' | 'fines' | 'work' | 'academic';

const DOMAINS: { id: Domain; emoji: string; label: string }[] = [
  { id: 'rent', emoji: '🏠', label: '租房押金与退租争议' },
  { id: 'fines', emoji: '🎫', label: '违章罚单行政申诉' },
  { id: 'work', emoji: '💼', label: '打工薪资克扣维权' },
  { id: 'academic', emoji: '🎓', label: '学术舞弊与停学警告' },
];

// High-fidelity Australia data — kept ONLY as a rate-limit fallback for AU; the live path is AI.
const AU_FALLBACK: Record<Domain, LegalData> = {
  rent: {
    contacts: [
      { name: 'Consumer Affairs Victoria (CAV)', phone: '1300 558 181', website: 'https://www.consumer.vic.gov.au', desc: '维州消费者协会：受理房东与房客纠纷调解，是交涉租房纠纷的第一站。' },
      { name: 'Tenants Victoria', phone: '03 9416 2577', website: 'https://www.tenantsvic.org.au', desc: '维州租客工会：NGO 公益组织，为租客提供完全免费的法律咨询与出庭代理。' },
      { name: 'VCAT', phone: '1300 018 228', website: 'https://www.vcat.vic.gov.au', desc: '维州民事行政法庭：有法律约束力的纠纷仲裁庭，房东侵占押金可在此起诉。' },
    ],
    scenario: {
      title: '🏠 退房房东/中介恶意扣押金',
      rights: [
        '押金不是房东的钱：除非房东能在法定期限内证明你造成了超出「合理磨损」的损坏，否则必须全额退还（Residential Tenancies Act）。',
        '「合理磨损 (Fair Wear and Tear)」受法律保护：地毯自然变旧、墙面细微挂痕，房东不得据此扣款。',
        '举证责任在房东：你向 RTBA 申请全额退还后，是房东必须主动起诉证明，否则你拿回全款。',
      ],
      steps: [
        '登入押金托管机构（VIC: RTBA）先发制人申请「全额退还押金 (Claim Entire Bond)」。',
        '退房后立即拍照摄像全屋清洁与搬空细节，并附上搬入时的 Condition Report。',
        '一旦你提交了 Claim Bond，中介若要扣钱必须在 14 天内自费向 VCAT 起诉；嫌麻烦就会放弃，你拿回全额。',
      ],
      template: 'Dear Property Manager,\n\nI refer to the final inspection for the tenancy at [租房地址] which ended on [退房时间]. The property was returned in a reasonably clean condition allowing for fair wear and tear, per the Residential Tenancies Act. I have applied via the RTBA for the full release of my bond of $[押金金额].\n\nIf you intend to dispute this, please file at VCAT within the statutory 14-day limit. Otherwise, please approve my refund.\n\nBest regards,\n[你的名字]',
      interpreterTip: '致电任何机构前可先拨 131 450（全澳免费 TIS 口译），接通后说 "Chinese, please"。',
    },
  },
  fines: {
    contacts: [
      { name: 'Fines Victoria', phone: '1300 369 819', website: 'https://www.fines.vic.gov.au', desc: '维州罚单管理处：可在线申请初犯豁免或分期缴纳。' },
      { name: 'Victoria Legal Aid', phone: '1300 792 387', website: 'https://www.legalaid.vic.gov.au', desc: '维州法律援助中心：政府免费法律诊所。' },
    ],
    scenario: {
      title: '🎫 违章/停车罚单行政申诉',
      rights: [
        '你有权申请「内部复议 (Internal Review)」并书面陈述理由，初犯且记录良好常可改为警告。',
        '复议期间罚款缴纳期限自动冻结，不产生任何滞纳金。',
        '你有权要求查看违章证据（照片/标识），证据不足可据此申诉撤销。',
      ],
      steps: [
        '向发单机构申请「内部行政复议 (Internal Review)」，初犯且记录良好极易改为警告。',
        '收集豁免证据：标识被树枝遮挡照片、病假单、救援单等。',
        '提交复议后缴纳期限自动冻结，安心等待 1–2 个月答复。',
      ],
      template: 'To Whom It May Concern,\n\nI request an internal review of Infringement Notice No. [罚单编号] issued to vehicle [车牌号]. As a first-time offender with a clean record, and given the signage was heavily obscured (see attached photos), I request an exemption or Official Warning.\n\nSincerely,\n[你的名字]',
      interpreterTip: '致电任何机构前可先拨 131 450（全澳免费 TIS 口译）。',
    },
  },
  work: {
    contacts: [
      { name: 'Fair Work Ombudsman (FWO)', phone: '13 13 94', website: 'https://www.fairwork.gov.au', desc: '联邦公平工作署：保护包括留学生在内的所有员工，追讨欠薪不影响签证。' },
    ],
    scenario: {
      title: '💼 黑工被克扣薪资 / 职场不公',
      rights: [
        '即使是现金黑工、或工时超出签证规定，你依然受法定最低时薪保护，克扣即属 Wage Theft（偷薪）。',
        '公平工作署（FWO）受理欠薪不会因签证问题向移民局举报你。',
        '你有权获得工资单（payslip）与法定养老金（super），雇主不给即违法。',
      ],
      steps: [
        '记录证据链：每日工时、排班表、派单与发薪聊天记录、现金袋照片。',
        '即使现金黑工，也受法定最低时薪保护，克扣即构成 Wage Theft。',
        '免费致电 FWO，它不会因签证问题向移民局举报你。',
      ],
      template: 'Dear [公司名称],\n\nI worked as [职位] from [开始] to [结束], totalling [总工时] hours at $[时薪], below the National Minimum Wage. Per Fair Work regulations, all staff incl. student-visa holders are protected. Please pay the outstanding $[拖欠总额] within 7 days, or I will lodge a claim with the FWO.\n\nRegards,\n[你的名字]',
      interpreterTip: '可拨 131 450 免费 TIS 口译直通 FWO，说 "Chinese, please"。',
    },
  },
  academic: {
    contacts: [
      { name: 'University Student Advocacy', phone: '校内服务台', website: '各大学 Student Union / Advocacy', desc: '学生会学术权利支持部：可委派顾问陪同你参加学术听证会。' },
    ],
    scenario: {
      title: '🎓 学术诚信 / 挂科 Show Cause 抗辩',
      rights: [
        '你有权在限定答辩期内陈情，并提交「同情因素 (special consideration)」证据，而非只能认错。',
        '你有权要求免费的学生顾问 (Student Advocate) 陪同出席听证会。',
        '指控必须基于证据，你有权查看并逐条回应。',
      ],
      steps: [
        '在限定答辩期（通常 20 天）内最速回复，绝不能只写一句道歉。',
        '提供可追溯的「同情因素」：医嘱、家庭变故等无法抗力证明。',
        '找出作业的 Git 历史、Word 备份、手写笔记作为原创凭据。',
      ],
      template: 'Dear Academic Progression Committee,\n\nI respond to the Notice to Show Cause dated [信件日期] for Course [课程编号]. My drop in progress was driven by [困境/医疗原因], evidenced by the attached certificate. I have prepared a structured study plan for next semester (attached) and will limit myself to [科目数] subjects.\n\nSincerely,\n[你的名字]',
      interpreterTip: '学校多设免费学生顾问 (Student Advocate)，务必预约陪同。',
    },
  },
};

function auFallbackFor(domain: Domain): LegalData {
  return AU_FALLBACK[domain];
}

export default function LegalHubDemo({ onOpenLetterOfficer }: { onOpenLetterOfficer?: () => void }) {
  const { country, region, language, setRegion } = useLocale();
  const t = useT();
  const content = getCountryContent(country);
  const countryName = getCountryName(country, language);
  const place = `${countryName}${region ? ' · ' + region : ''}`;
  const regionOptions = REGIONS[country] || [];

  const [selectedDomain, setSelectedDomain] = useState<Domain>('rent');
  const [data, setData] = useState<LegalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);
    fetch('/api/legal-hub', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, region, language, domain: selectedDomain }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((d: LegalData) => { if (!cancelled) setData(d); })
      .catch(() => {
        if (cancelled) return;
        // The bundled AU fallback is VIC-specific. Only serve it for VIC (or the
        // national default, which this product treats as Melbourne-first). Other
        // states must NOT show Victoria's phone numbers — fall through to retry.
        // The bundled fallback is Chinese-only; never show it to a non-Chinese user.
        if (language === 'zh' && country === 'AU' && (region === '' || region === 'VIC')) setData(auFallbackFor(selectedDomain));
        else setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [country, region, language, selectedDomain]);

  const contacts = data?.contacts || [];
  const scenario = data?.scenario;

  return (
    <div className="w-full text-ink px-1 animate-in fade-in duration-500">

      {/* Header — positioned as the "process & agencies" desk (distinct from 信件官 = read documents) */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center space-x-2 bg-white px-5 py-2 rounded-full border border-hairline shadow-sm mb-4">
          <Scale className="text-primary" size={18} />
          <span className="text-ink text-xs font-black tracking-wider uppercase">{t('lh_eyebrow')}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-ink mb-4 tracking-tight">{t('lh_hero')}</h2>
        <p className="text-muted text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          {t('lh_intro')}
        </p>
      </div>

      {/* Region + Domain selector */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-hairline mb-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-hairline gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-muted uppercase tracking-wider mr-1">📍 {countryName} · {t('lh_select_region')}</span>
            <button
              onClick={() => setRegion('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${region === '' ? 'bg-ink text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{t('lh_nationwide')}</button>
            {regionOptions.slice(0, 8).map((r) => (
              <button
                key={r.code}
                onClick={() => setRegion(r.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${region === r.code ? 'bg-ink text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >{r.label}</button>
            ))}
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-surface-soft text-ink border border-hairline shrink-0">
            <Shield size={14} className="mr-1" /> {t('lh_badge')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-6">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`p-4 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all ${selectedDomain === d.id ? 'border-primary bg-primary-soft text-ink font-black' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              <span className="text-xl">{d.emoji}</span>
              <span className="text-xs font-bold">{t(('dom_' + d.id) as StringKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="max-w-6xl mx-auto bg-white border border-hairline rounded-3xl p-10 text-center text-muted">
          {t('lh_error')}「{countryName} {t(('dom_' + selectedDomain) as StringKey)} legal aid」
        </div>
      ) : (
        <>
        {/* 你的法律权利 — the differentiator. 信件官 reads YOUR document; 法援站 tells you the
            rights a local takes for granted but a newcomer never learns. */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="dark-stage rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-primary" />
              <span className="text-xs font-black tracking-widest uppercase text-on-dark-soft">{t('lh_rights_title')}</span>
            </div>
            <p className="text-on-dark-soft text-xs mb-5">{t('lh_rights_sub')}</p>
            {loading ? (
              <div className="text-on-dark-soft text-sm flex items-center gap-2 py-4">
                <Loader2 size={16} className="animate-spin text-primary" /> {t('lh_rights_loading').replace('{place}', place)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {(scenario?.rights || []).map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/25 text-primary flex items-center justify-center shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></span>
                    <p className="text-[13.5px] text-on-dark leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">

          {/* Left: official contacts */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white border border-hairline rounded-3xl p-5 md:p-6 shadow-sm flex-1 flex flex-col">
              <h3 className="text-base font-extrabold text-ink border-b border-hairline pb-3 mb-4 flex items-center gap-2">
                <Phone size={18} className="text-primary" />
                <span>{countryName} {t('lh_intake')}</span>
              </h3>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-soft py-10 gap-2">
                  <Loader2 size={22} className="animate-spin text-primary" />
                  <span className="text-xs">{t('lh_agencies_loading').replace('{place}', place)}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact, index) => (
                    <div key={index} className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
                      <h4 className="text-xs font-extrabold text-ink flex items-center justify-between gap-2">
                        <span className="break-words">{contact.name}</span>
                        {contact.website && (
                          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-ink transition-colors shrink-0">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </h4>
                      {contact.phone && (
                        <p className="text-[10px] text-primary font-bold font-mono mt-1">📞 {contact.phone}</p>
                      )}
                      <p className="text-[10.5px] text-muted mt-1.5 leading-normal">{contact.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {scenario?.interpreterTip && (
                <div className="mt-5 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100 text-[11px] text-amber-900 leading-normal flex items-start gap-1.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div><strong>{t('lh_interpreter')}</strong> {scenario.interpreterTip}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: steps + English template */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white border border-hairline rounded-3xl p-6 md:p-8 shadow-sm flex-1 flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-primary uppercase mb-2 flex items-center gap-1.5">
                <ListChecks size={14} /> {t('lh_steps_label')}
              </span>
              <h3 className="text-lg font-black text-ink mb-4">{loading ? t('lh_generating') : scenario?.title}</h3>

              <div className="bg-surface-soft p-5 rounded-3xl border border-hairline mb-6">
                <h4 className="text-xs font-extrabold text-ink mb-3 uppercase">🛡️ 专家级抗辩自卫流程</h4>
                <div className="space-y-4">
                  {(loading ? ['AI 正在按当地法律生成步骤…'] : (scenario?.steps || [])).map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-normal">
                      <div className="w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">{idx + 1}</div>
                      <div className="text-body">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center text-xs font-bold text-muted mb-2">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} className="text-ink" />
                    <span>{t('lh_template_label')}</span>
                  </span>
                  {scenario?.template && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(scenario.template); alert('模板已复制到剪贴板!'); }}
                      className="text-primary hover:text-ink font-bold cursor-pointer transition-colors text-[11px]"
                    >💡 复制信件草案</button>
                  )}
                </div>
                <textarea
                  className="w-full flex-1 min-h-[220px] bg-neutral-900 text-on-dark p-4 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner border border-neutral-800 focus:outline-none"
                  value={loading ? '正在生成英文申诉模板…' : (scenario?.template || '')}
                  readOnly
                />
                <div className="mt-4 border-t border-hairline pt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <p className="text-[11px] text-muted-soft leading-normal max-w-sm">
                    这是<strong className="text-muted">通用起草模板</strong>。要针对<strong className="text-muted">你手里那张具体的信/罚单</strong>生成个性化抗辩，请交给信件官——它会拍照读懂原件再逐条回。
                  </p>
                  <button
                    onClick={() => onOpenLetterOfficer?.()}
                    disabled={!onOpenLetterOfficer}
                    className="cta-3d inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold shrink-0 disabled:opacity-40 disabled:shadow-none"
                  >
                    用信件官个性化这封信 <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {data?._grounding && <GroundingSources grounding={data._grounding} />}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
