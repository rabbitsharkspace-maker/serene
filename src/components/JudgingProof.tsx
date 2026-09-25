import React from 'react';
import { Camera, Search, ListChecks, Mail, Check, ChevronDown, Sparkles, Database, ExternalLink } from 'lucide-react';
import { useLocale } from '../lib/locale';

const FLOW = [
  { icon: Camera, n: '01', title: '拍下公文', detail: '罚单、Show Cause、押金通知', titleEn: 'Snap the letter', detailEn: 'Fines, Show Cause, bond notices' },
  { icon: Sparkles, n: '02', title: 'Gemini 读懂', detail: '多模态识别事实、金额与期限', titleEn: 'Gemini reads it', detailEn: 'Multimodal extraction of facts, amounts and deadlines' },
  { icon: Search, n: '03', title: '核验依据', detail: 'Google Search Grounding 检索官方来源', titleEn: 'Verify the basis', detailEn: 'Google Search Grounding finds official sources' },
  { icon: ListChecks, n: '04', title: '生成行动', detail: '风险、权利、材料与下一步', titleEn: 'Plan the action', detailEn: 'Risks, rights, documents and next steps' },
  { icon: Mail, n: '05', title: '发起申诉', detail: '英文草稿保存到 Gmail', titleEn: 'Lodge an appeal', detailEn: 'English draft saved to Gmail' },
];

const PERSONAS = [
  { name: '林同学', flag: '🇨🇳', context: '新留学生 · 中文', case: '停车罚单', expected: '识别金额与期限；只引用 VIC 官方复核入口',
    nameEn: 'Lin', contextEn: 'New international student · Chinese', caseEn: 'Parking fine', expectedEn: 'Extracts amount and deadline; cites only the official VIC review channel' },
  { name: 'Ana', flag: '🇪🇸', context: 'Working Holiday · Español', case: '租房押金', expected: '西语解释；区分合理磨损与待核实损坏',
    nameEn: 'Ana', contextEn: 'Working Holiday · Español', caseEn: 'Rental bond', expectedEn: 'Explains in Spanish; separates fair wear and tear from damage to be verified' },
  { name: 'Minh', flag: '🇻🇳', context: '技术新移民 · Tiếng Việt', case: '劳动合同', expected: '越语解释关键条款；引导至 Fair Work 官方渠道',
    nameEn: 'Minh', contextEn: 'Skilled migrant · Tiếng Việt', caseEn: 'Employment contract', expectedEn: 'Explains key clauses in Vietnamese; points to official Fair Work channels' },
  { name: 'Asha', flag: '🇮🇳', context: '陪读家庭 · हिन्दी', case: '水电催缴', expected: '印地语说明；给出 hardship 与 EWOV 官方路径',
    nameEn: 'Asha', contextEn: 'Accompanying family · हिन्दी', caseEn: 'Utility overdue notice', expectedEn: 'Explains in Hindi; gives official hardship and EWOV pathways' },
  { name: 'Noor', flag: '🇸🇦', context: '外派新居民 · العربية', case: '可疑催款', expected: '阿语风险提示；不把模型判断表述为最终裁决',
    nameEn: 'Noor', contextEn: 'Expat newcomer · العربية', caseEn: 'Suspicious debt demand', expectedEn: 'Flags risks in Arabic; never presents the model\'s judgement as a final ruling' },
];

export default function JudgingProof() {
  const { language } = useLocale();
  const isZh = language === 'zh';
  return (
    <section className="mb-8 space-y-3" aria-label={isZh ? 'Serene 核心能力与验证证据' : 'Serene core capabilities and validation evidence'}>
      <div className="overflow-hidden rounded-3xl border border-hairline bg-surface-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-hairline px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold tracking-[.12em] text-primary">
              <Sparkles size={12} /> ONE HERO JOURNEY
            </div>
            <h3 className="text-xl font-bold text-ink md:text-2xl">{isZh ? '一封看不懂的信，五步变成可执行的下一步' : 'One confusing letter, five steps to a clear next move'}</h3>
          </div>
          <p className="max-w-sm text-xs leading-5 text-muted">{isZh ? '路演只演示这一条核心链路；生活圈与社区能力作为后续扩展，不参与主叙事。' : 'The demo focuses on this one core flow; lifestyle and community features are later extensions, not part of the main story.'}</p>
        </div>

        <div className="grid md:grid-cols-5">
          {FLOW.map(({ icon: Icon, n, title, detail, titleEn, detailEn }, index) => (
            <div key={n} className={`relative px-5 py-4 ${index < FLOW.length - 1 ? 'border-b border-hairline md:border-b-0 md:border-r' : ''}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-muted-soft">{n}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-soft text-ink"><Icon size={16}/></span>
              </div>
              <p className="text-sm font-bold text-ink">{isZh ? title : titleEn}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">{isZh ? detail : detailEn}</p>
            </div>
          ))}
        </div>

        <div className="grid border-t border-hairline bg-surface-soft/55 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">Input</p>
            <p className="mt-1 text-xs font-semibold text-ink">{isZh ? '图片 + 签证 / 学校 / 州别上下文' : 'Photo + visa / school / state context'}</p>
          </div>
          <span className="hidden text-muted-soft lg:block">→</span>
          <div className="border-y border-hairline px-5 py-4 lg:border-x lg:border-y-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">Google AI Core</p>
            <p className="mt-1 text-xs font-semibold text-ink">Gemini Vision + Search Grounding</p>
          </div>
          <span className="hidden text-muted-soft lg:block">→</span>
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">Action</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink"><Database size={13}/> {isZh ? 'Firebase 案头 + Gmail 草稿' : 'Firebase My Desk + Gmail draft'}</p>
          </div>
        </div>
      </div>

      <details className="group overflow-hidden rounded-2xl border border-hairline bg-surface-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-soft text-ink"><Check size={17}/></span>
            <div>
              <p className="text-sm font-bold text-ink">{isZh ? '5 个模拟澳洲新居民情境测试' : '5 simulated newcomer scenario tests in Australia'}</p>
              <p className="mt-0.5 text-[11px] text-muted">{isZh ? '覆盖留学生、新移民、Working Holiday、陪读家庭与外派人员 · 可复现，不冒充访谈' : 'Covers international students, new migrants, Working Holiday makers, accompanying families and expats · reproducible, not presented as interviews'}</p>
            </div>
          </div>
          <ChevronDown size={17} className="shrink-0 text-muted transition-transform group-open:rotate-180"/>
        </summary>

        <div className="border-t border-hairline px-5 py-5">
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-5 text-amber-900">
            {isZh ? (
              <><strong>验证口径：</strong>以下为 Synthetic Scenario Testing（模拟情境测试），用于覆盖边界条件，不代表已采访这些人物。创作者本人有留学与海外落地经历，产品问题来自亲身处境观察；真实新居民访谈将在下一阶段补充。</>
            ) : (
              <><strong>Validation scope: </strong>These are Synthetic Scenario Tests designed to cover edge cases; they do not represent interviews with these people. The creator has studied and settled overseas, and the product problems come from first-hand experience; real newcomer interviews will follow in the next phase.</>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {PERSONAS.map((p) => (
              <article key={p.nameEn} className="rounded-2xl border border-hairline bg-surface-soft/55 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg">{p.flag}</span>
                  <span className="rounded-full bg-surface-card px-2 py-0.5 text-[9px] font-bold text-muted">SIMULATED</span>
                </div>
                <p className="mt-2 text-sm font-bold text-ink">{isZh ? p.name : p.nameEn}</p>
                <p className="mt-0.5 text-[10px] text-muted">{isZh ? p.context : p.contextEn}</p>
                <p className="mt-3 text-[10px] font-bold text-primary">{isZh ? `测试：${p.case}` : `Test: ${p.caseEn}`}</p>
                <p className="mt-1 text-[10px] leading-4 text-body">{isZh ? `通过标准：${p.expected}` : `Pass criteria: ${p.expectedEn}`}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-[10px] text-muted"><ExternalLink size={11}/> {isZh ? '所有测试均可用页面内置案例和语言切换器现场复现。' : 'Every test can be reproduced live with the built-in sample cases and the language switcher.'}</p>
        </div>
      </details>
    </section>
  );
}
