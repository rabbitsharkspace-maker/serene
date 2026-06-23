import React, { useState } from 'react';
import { Scale, Phone, Globe, Shield, BookOpen, AlertCircle, HelpCircle, Check, ArrowRight, ExternalLink } from 'lucide-react';

interface ContactInfo {
  name: string;
  phone: string;
  website: string;
  desc: string;
}

interface DisputeScenario {
  title: string;
  steps: string[];
  template: string;
  contacts: string[];
}

export default function LegalHubDemo() {
  const [selectedState, setSelectedState] = useState<'VIC' | 'NSW' | 'QLD'>('VIC');
  const [selectedDomain, setSelectedDomain] = useState<'rent' | 'fines' | 'work' | 'academic'>('rent');

  const contactsByState: Record<'VIC' | 'NSW' | 'QLD', Record<string, ContactInfo[]>> = {
    VIC: {
      rent: [
        { name: 'Consumer Affairs Victoria (CAV)', phone: '1300 558 181', website: 'https://www.consumer.vic.gov.au', desc: '维多利亚州消费者协会：受理除房东与房客纠纷，提供调解及维权判定，是交涉租房纠纷的第一站。' },
        { name: 'Tenants Victoria', phone: '03 9416 2577', website: 'https://www.tenantsvic.org.au', desc: '维州租客工会：NGO公益组织，专为租客提供完全免费的法律咨询和出庭代理服务。' },
        { name: 'VCAT (Victorian Civil & Administrative Tribunal)', phone: '1300 018 228', website: 'https://www.vcat.vic.gov.au', desc: '维州民事行政法庭：具有法律约束力的纠纷仲裁庭，若房东侵占押金不退，可在此发起起诉。' }
      ],
      fines: [
        { name: 'Fines Victoria', phone: '1300 369 819', website: 'https://www.fines.vic.gov.au', desc: '维州罚单管理处：统一处理车辆、垃圾、停车等各项公共管理罚单，可在此在线申请初犯豁免或分期缴纳。' },
        { name: 'Victoria Legal Aid', phone: '1300 792 387', website: 'https://www.legalaid.vic.gov.au', desc: '维州法律援助中心：政府免费法律诊所，若罚单涉嫌上诉至地方法庭，可寻求其代表律师协助。' }
      ],
      work: [
        { name: 'Fair Work Ombudsman (FWO)', phone: '13 13 94', website: 'https://www.fairwork.gov.au', desc: '联邦公平工作署：国家法定劳资纠纷监察部门。极力保护留学生，遇到任何克扣薪水、克扣养老金或老板威胁，免费受理调查，且不影响签证！' },
        { name: 'JobWatch Victoria', phone: '1800 331 617', website: 'https://jobwatch.org.au', desc: '维州工作法律求助：提供免费、独立的法律援助服务。' }
      ],
      academic: [
        { name: 'University Student Union Support', phone: '同所属校区服务台', website: '各大学官网/USU', desc: '大学学生会学术权利支持部：在读大学均常设独立学生会，会有委派的 Student Advocacy 陪同你参加学校学术听证会，自证清白必备。' }
      ]
    },
    NSW: {
      rent: [
        { name: 'NSW Fair Trading', phone: '13 32 20', website: 'https://www.fairtrading.nsw.gov.au', desc: '新南威尔士州公平交易署：处理房屋租赁以及押金（Rental Bond）纠纷纠偏。' },
        { name: 'Tenants NSW', phone: '02 8117 3700', website: 'https://www.tenants.org.au', desc: '新州租客保护协会：免费解答租约和押金追讨。' },
        { name: 'NCAT (NSW Civil & Administrative Tribunal)', phone: '1300 006 228', website: 'https://www.ncat.nsw.gov.au', desc: '新州民事行政法庭：裁决NSW境内一切民商事、住宅租用冲突的核心机构。' }
      ],
      fines: [
        { name: 'Revenue NSW', phone: '1300 138 118', website: 'https://www.revenue.nsw.gov.au', desc: '新州政税及交通罚金局：申诉交通、违停、违反宵禁罚单的主控平台。' },
        { name: 'LawAccess NSW', phone: '1300 888 529', website: 'https://www.lawaccess.nsw.gov.au', desc: '新州免费法律解答引导线，可直接为您指派法援执业律师协助罚款辩护。' }
      ],
      work: [
        { name: 'Fair Work Ombudsman (FWO)', phone: '13 13 94', website: 'https://www.fairwork.gov.au', desc: '联邦公平工作署。留学生维权利器。即使现金黑工工作，根据澳洲判例亦受最低薪水保护。' }
      ],
      academic: [
        { name: 'University Advocacy Services', phone: '校内热线', website: '各大学 Student Advocate', desc: '悉大 (USYD)、新南 (UNSW) 等学校的学术顾问组，提供学术诚信会审前期免费模拟与答抗。' }
      ]
    },
    QLD: {
      rent: [
        { name: 'RTA Queensland', phone: '1300 366 311', website: 'https://www.rta.qld.gov.au', desc: '昆士兰租房管理局：托管所有租房押金，并主持强制性争议调解。' },
        { name: 'QSTARS (QLD Tenants Advice Service)', phone: '1300 744 263', website: 'https://qstars.org.au', desc: '昆州租户支持热线：为昆士兰全境租客提供点对点免费法律电话解答。' },
        { name: 'QCAT (Queensland Civil & Administrative Tribunal)', phone: '1300 753 228', website: 'https://www.qcat.qld.gov.au', desc: '昆州民事行政法庭：昆州押金最后裁决庭。' }
      ],
      fines: [
        { name: 'SMR Queensland', phone: '1300 360 610', website: 'https://www.tmr.qld.gov.au', desc: '昆州路政管理局罚款催缴专区，提供初审及复议申请通道。' }
      ],
      work: [
        { name: 'Fair Work Ombudsman (FWO)', phone: '13 13 94', website: 'https://www.fairwork.gov.au', desc: '国家最高公平劳工保障组织。可直接说中文（可呼叫 131 450 免费翻译转换专线直通 FWO）。' }
      ],
      academic: [
        { name: 'Student Legal Clinic Support', phone: '校内预约', website: '各学校 Student Advocacy Office', desc: 'UQ, QUT 等高校设有免费校内法律诊所，由高年级法学生及带教执业律师亲理申诉，完全免费且严格保密。' }
      ]
    }
  };

  const domainScenarios: Record<'rent' | 'fines' | 'work' | 'academic', DisputeScenario> = {
    rent: {
      title: '🏠 退房房东/中介恶意扣押金 (Tenancy Bond Recovery)',
      steps: [
        '登入押金托管机构（VIC：RTBA / NSW：Fair Trading Portal / QLD：RTA）先发制人主动申请 “全额退还押金 (Claim Entire Bond)”。',
        '退房后立即将全屋退房清洁、搬空后所有细节拍照摄像，并将搬入时的 Condition Report 发送给中介证明无恶劣损坏。',
        '维权铁律：一旦你自发提交了 Claim Bond 申请，如果中介/房东要扣你一分钱，法律强制中介必须在14天内向 VCAT/NCAT 自费自证发起诉讼提请听证。中介如嫌起诉繁琐或资料不足，会自动放弃并让你拿回全额押金！'
      ],
      template: 'Dear Property Manager,\n\nI refer to the final inspection for the tenancy at [租房地址] which ended on [退房时间].\n\nI confirm that the exit carpets and cleaning conform fully to the local Residential Tenancies Act guidelines, considering normal fair wear and tear. I have already applied directly via [RTBA/RTA/Fair Trading Portal] for the automatic release of my entire bond amount of $[押金金额].\n\nShould you intend to dispute this release, please proceed to file an official hearing application directly with [VCAT/NCAT/QCAT] within the statutory 14-day limit. Otherwise, please approve my refund claim. Thank you for your lease cooperation.\n\nBest regards,\n[你的名字]',
      contacts: ['Consumer Affairs / Fair Trading', 'Tenant Advice Service']
    },
    fines: {
      title: '🎫 交通/违章停车/公共管理罚单申诉 (Fine Appeal)',
      steps: [
        '查看罚单发出的机构是否可以提供 “内部行政复议书 (Request an Internal Review)”。大多数市政府对于 10 年内表现优良或 3 年内干净无违章的初犯极易酌情改发非罚款性 “Official Warning”。',
        '收集强力豁免证明材料：拍摄罚单发生地点由于树枝或者阴影遮蔽的标识图，或者提供RACV救援单、诊所病假单证明车辆由于机械故障或人道主义迫切原因导致不得已违停。',
        '递交 Review Review 并耐心等待。在 Review 处理的通常 1-2 个月内，罚单的法定缴纳期限将自动完全冻结，不在此期间产生任何滞纳金，可放心等待答复。'
      ],
      template: 'To Whom It May Concern,\n\nI am writing to request an administrative internal review for the Infringement Notice No. [罚单编号] issued to vehicle [车牌号].\n\nI request an exemption or conversion to a non-financial Official Warning because this is my very first parking issue in Australia over [驾驶年限] years of perfect record, and at the time of parking, the restrictions signpost was heavily obscured by overgrown tree branches as shown on the attached photographs.\n\nThank you for considering my request and review variables.\n\nSincerely,\n[你的名字]',
      contacts: ['Fines Victoria / Revenue NSW', 'Legal Aid Support']
    },
    work: {
      title: '💼 黑工被克扣薪资/遭遇职场不公 (Wage Theft & Work Rights)',
      steps: [
        '记录详尽的证据链：每天记录你开始、结束工作的精确时间，排班表(Roster)，微信老板的派单记录，现金发放袋的拍摄，老板对扣发薪资的聊天截图。',
        '澳洲法律铁律：即使你是持 500 学生签证并做着不符合签证小时数（比如超出两周 48 小时）的现金工作，澳洲公平工作署（FWO）一贯执行“保护弱者”原则。你完全享用和本地人一模一样的 $23.23+/hour 法定最低薪资保障，老板克扣即构成偷窃犯罪(Wage Theft)！',
        '免费致电 FWO。FWO 不会向移民局举报留学生的签证违规，你可以100%放心地追讨拖欠应得的所有薪。'
      ],
      template: 'Dear [老板名字/公司名称],\n\nI worked as a [你的职位] for [公司名称] from [开始时间] to [结束时间] for a total of [总工时] hours. During this period, my basic flat hourly pay rate was $[收到的小时薪资], which is significantly below the National Minimum Wage of Australia.\n\nAccording to the Fair Work Ombudsman (FWO) legally binding regulations, all staff (including international student visa holders) are strictly protected by the National Employment Standards. I am prepared to escalate this matter to the FWO and Lodge an official wage theft investigation team, unless my backpaid outstanding amount of $[拖欠总额] is wired to my account in 7 days.\n\nMy bank transfer details: [银行账号信息].\n\nRegards,\n[你的名字]',
      contacts: ['Fair Work Ombudsman (FWO)']
    },
    academic: {
      title: '🎓 大学学术诚信/挂科开除 Show Cause 抗辩',
      steps: [
        '收到大学正式 Show Cause（解释信）或学术诚信剽窃（Integrity）指控，二十天或者限定答辩期即是最后的黄金二十天，必须最速回复。',
        '绝不可只写一句“对不起”。学校要听得是具理、可追溯、令人信服的“同情因素”，如个人无法抗力导致的心理抑郁（附医嘱）、直系家属灾病。',
        '找到自己作业的所有版本 Git历史、Word 本地编辑备份、平时笔记纸张，作为原创纯属手写的有力凭据。'
      ],
      template: 'Dear Academic Progression Committee Members,\n\nI write in heartfelt response to the Notice to Show Cause dated [信件日期] regarding my recent academic progress under Course ID: [课程编号].\n\nI acknowledge that my pass rate in Semester 1 fell below safety limits. This drop in progress was unfortunately driven by a sudden severe emergency medical incident. My doctor has provided an official Victorian Medical Certificate confirming my partial temporary cognitive disruption as enclosed in this file.\n\nI have now crafted a rigorous, structured study plan for Semester 2 in collaboration with university educational counsellors (attached), and I intend to restrict myself to 3 subjects to guarantee safety and regain pristine standings.\n\nSincerely,\n[你的中文拼音名]',
      contacts: ['USU Student Advocates', 'Student Legal Services']
    }
  };

  const activeContacts = contactsByState[selectedState][selectedDomain];
  const activeScenario = domainScenarios[selectedDomain];

  return (
    <div className="w-full text-gray-900 px-1 animate-in fade-in duration-500">
      
      {/* Visual Header */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center space-x-2 bg-white px-5 py-2 rounded-full border border-gray-100 shadow-sm mb-4">
          <Scale className="text-[#cc785c]" size={18} />
          <span className="text-[#141413] text-xs font-black tracking-wider uppercase font-mono">澳洲高校生存指南 / 法援工具箱</span>
        </div>
        <h2 className="text-4xl font-extrabold text-[#141413] mb-4">
          留学生维权与法援大本营
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
          面对外国中介扣押金、议会发高额停车罚单、老板克扣薪资或是大学挂科警告通知？Serene 为你精选汇总全澳权威法律救助及一键模板工具，无需花重金请华人律师。
        </p>
      </div>

      {/* State & Domain Selector Panel */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 max-w-6xl mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-gray-150 gap-4">
           {/* State Select Badges */}
           <div className="flex items-center gap-2">
             <span className="text-xs font-black text-gray-400 uppercase tracking-wider mr-2">📍选择所在澳洲州府:</span>
             <button 
               onClick={() => setSelectedState('VIC')}
               className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedState === 'VIC' ? 'bg-[#141413] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               维多利亚州 (墨尔本 VIC)
             </button>
             <button 
               onClick={() => setSelectedState('NSW')}
               className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedState === 'NSW' ? 'bg-[#141413] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               新南威尔士 (悉尼 NSW)
             </button>
             <button 
               onClick={() => setSelectedState('QLD')}
               className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedState === 'QLD' ? 'bg-[#141413] text-white shadow' : 'bg-gray-100 text-gray-200'}`}
             >
               昆士兰 (布里斯班 QLD)
             </button>
           </div>
           
           {/* State Legal Badge */}
           <div>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
               <Shield size={14} className="mr-1" />
               100% 官方合规合法咨询通道
             </span>
           </div>
         </div>

         {/* Domain Tab Selector */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-6">
           <button 
             onClick={() => setSelectedDomain('rent')}
             className={`p-4 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all ${selectedDomain === 'rent' ? 'border-amber-500 bg-amber-500/10 text-[#141413] font-black' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 text-gray-600 hover:bg-gray-100'}`}
           >
             <span className="text-xl">🏠</span>
             <span className="text-xs font-bold">租房押金与退租争议</span>
           </button>
           <button 
             onClick={() => setSelectedDomain('fines')}
             className={`p-4 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all ${selectedDomain === 'fines' ? 'border-[#cc785c] bg-[#cc785c]/10 text-[#141413] font-black' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 text-gray-600 hover:bg-gray-100'}`}
           >
             <span className="text-xl">🎫</span>
             <span className="text-xs font-bold">违章罚单行政申诉</span>
           </button>
           <button 
             onClick={() => setSelectedDomain('work')}
             className={`p-4 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all ${selectedDomain === 'work' ? 'border-[#141413] bg-[#141413]/10 text-[#141413] font-black' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 text-gray-600 hover:bg-gray-100'}`}
           >
             <span className="text-xl">💼</span>
             <span className="text-xs font-bold">打工薪资克扣维权</span>
           </button>
           <button 
             onClick={() => setSelectedDomain('academic')}
             className={`p-4 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all ${selectedDomain === 'academic' ? 'border-[#cc785c] bg-[#cc785c]/10 text-[#141413] font-black' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 text-gray-600 hover:bg-gray-100'}`}
           >
             <span className="text-xl">🎓</span>
             <span className="text-xs font-bold">学术舞弊与停学警告</span>
           </button>
         </div>
      </div>

      {/* Main Legal Content Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
         
         {/* Left Column: Official Contact List (5/12) */}
         <div className="lg:col-span-4 flex flex-col gap-4">
           <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#141413] border-b pb-3 mb-4 flex items-center gap-2">
                  <Phone size={18} className="text-[#cc785c]" />
                  <span>全官方免费接洽联络站</span>
                </h3>
                <p className="text-[11px] text-gray-400 mb-4 leading-normal">
                  以下机构均向澳洲留学生群体提供无偿、保密的母语级翻译和法律援助协助。点击进入官方了解。
                </p>
                
                <div className="space-y-4">
                  {activeContacts.map((contact, index) => (
                    <div key={index} className="p-3.5 bg-neutral-50/70 border border-neutral-100 rounded-2xl hover:bg-white hover:shadow-sm transition-all group">
                      <h4 className="text-xs font-extrabold text-neutral-850 flex items-center justify-between">
                        <span>{contact.name}</span>
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#141413] transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      </h4>
                      <p className="text-[10px] text-red-750 font-bold font-mono mt-1 flex items-center gap-1">
                        📞 服务专线：{contact.phone}
                      </p>
                      <p className="text-[10.5px] text-gray-500 mt-1.5 leading-normal">
                        {contact.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-neutral-100 pt-4 mt-6 bg-amber-50/55 p-3.5 rounded-2xl border border-amber-100 text-[11px] text-amber-900 leading-normal flex items-start gap-1.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>需要中文口译员配合？</strong><br/>
                  在致电任何澳洲机构前，你可以先拨打 <strong>131 450</strong> 呼叫全澳免费 TIS 官方口译专线，接通后说出 "Chinese, please"，翻译会直接帮你呼叫对应的政府或NGO客服，全程完全免费！
                </div>
              </div>
           </div>
         </div>

         {/* Right Column: Standard Steps & English Copyable Template (8/12) */}
         <div className="lg:col-span-8 flex flex-col gap-4">
           <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm flex-1 flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-[#cc785c] uppercase font-mono mb-2">流向攻略 / STEP-BY-STEP</span>
              <h3 className="text-lg font-black text-neutral-900 mb-4">{activeScenario.title}</h3>
              
              {/* Flowchart Steps */}
              <div className="bg-[#FAF9F5] p-5 rounded-3xl border border-amber-100/40 mb-6">
                <h4 className="text-xs font-extrabold text-[#141413] mb-3 flex items-center gap-1.5 uppercase font-mono">🛡️ 专家级抗辩自卫流程:</h4>
                <div className="space-y-4">
                  {activeScenario.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-normal">
                      <div className="w-5 h-5 rounded-full bg-[#141413] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="text-gray-700">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copyable Email draft template */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} className="text-[#141413]" />
                    <span>官方抗辩申诉英文草稿模板 (带中括号处可根据自身情况修改)</span>
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(activeScenario.template);
                      alert('攻略信模板内容已成功拷贝至剪切板！');
                    }}
                    className="text-[#cc785c] hover:text-[#141413] font-bold cursor-pointer transition-colors text-[11px]"
                  >
                    💡 复制该信件草案
                  </button>
                </div>
                <textarea 
                  className="w-full flex-1 min-h-[220px] bg-neutral-900 text-teal-40 p-4 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner border border-neutral-800 focus:outline-none"
                  value={activeScenario.template}
                  readOnly
                />
                
                <div className="mt-4 text-[10.5px] text-gray-400 flex items-center gap-1 justify-center border-t pt-3">
                  <span className="w-1.5 h-1.5 bg-[#cc785c] rounded-full animate-pulse"></span>
                  <span>可以直接把这一副草案或你收到的信，在 【信件官】 选项里一键生成最顶尖的书面反制报告。</span>
                </div>
              </div>
           </div>
         </div>

      </div>

    </div>
  );
}
