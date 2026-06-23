import React from 'react';
import { ShieldCheck, Mail, BriefcaseMedical, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Features() {
  return (
    <section id="features" className="py-24 px-8 max-w-7xl mx-auto w-full relative">
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#EAB252]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      
      <div className="mb-20">
        <p className="text-[#FE6D5D] text-sm font-bold tracking-wider mb-2">三个随时在线的人</p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1C362B] leading-tight">
          不是一个 App，<br />是三个站在你这边的人。
        </h2>
      </div>

      <div className="space-y-32">
        {/* Feature 1 - Safety Shield */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between md:space-x-12 relative">
          <div className="md:w-[45%] space-y-6">
            <div className="w-14 h-14 bg-[#1C362B] rounded-2xl flex items-center justify-center text-[#EAB252] shadow-lg">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">SAFETY SHIELD</p>
              <h3 className="text-3xl font-extrabold text-[#1C362B]">安全盾</h3>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              在你踩坑之前先提醒你。这个国家哪里会罚你、哪里会坑你、哪些"看起来没事"其实很危险 —— 提前告诉你。
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[#1C362B]/5 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">租房陷阱预警</span>
              <span className="bg-[#1C362B]/5 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">签证关键日期</span>
              <span className="bg-[#1C362B]/5 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">本地生活红线</span>
            </div>
          </div>
          <div className="md:w-1/2 w-full mt-12 md:mt-0 relative">
             <div className="bg-[#F8F6F1] rounded-[2.5rem] p-8 md:p-12 border border-[#EBE8E0]">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                   <div className="p-6 flex items-start space-x-4">
                      <div className="bg-[#FFF4E5] text-[#D48806] p-2.5 rounded-xl mt-0.5">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">签证还有 21 天到期</h4>
                        <p className="text-xs text-gray-500 font-medium">续签材料清单已为你准备</p>
                      </div>
                   </div>
                   <div className="p-6 flex items-start space-x-4">
                      <div className="bg-[#EBF1ED] text-[#1C362B] p-2.5 rounded-xl mt-0.5">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">这份租约第 7 条要小心</h4>
                        <p className="text-xs text-gray-500 font-medium">押金条款对你很不利，建议改</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Feature 2 - Letter Officer */}
        <div className="flex flex-col md:flex-row-reverse items-center justify-between md:space-x-12 md:space-x-reverse relative">
          <div className="md:w-[45%] space-y-6">
            <div className="w-14 h-14 bg-[#FE6D5D] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#FE6D5D]/20">
              <Mail size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">LETTER OFFICER</p>
              <h3 className="text-3xl font-extrabold text-[#1C362B]">信件官</h3>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              任何看不懂的官方信件、邮件、罚单，拍下来就行。我们用中文告诉你它在说什么、你该怎么办，并替你起草好回信 —— 中英文都有。
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[#FE6D5D]/5 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold bg-[#F4EFEX] border border-transparent">逐句中文翻译</span>
              <span className="bg-[#FE6D5D]/5 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">一键起草回信</span>
              <span className="bg-[#FE6D5D]/5 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">截止日期提醒</span>
            </div>
          </div>
          <div className="md:w-1/2 w-full mt-12 md:mt-0 relative">
             <div className="bg-[#1C362B] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="bg-[#2A483B] p-6 rounded-2xl mb-6 border border-white/5 relative z-10">
                   <div className="text-[10px] text-[#A2B5A9] font-bold tracking-widest uppercase mb-2">INCOMING · ENGLISH</div>
                   <p className="text-white/80 text-sm font-medium leading-relaxed font-sans block">"...you are required to respond within 14 days or further action may be taken..."</p>
                </div>
                <div className="my-4 flex items-center justify-center text-[#A2B5A9] text-xs font-bold space-x-2 relative z-10">
                   <ArrowDown size={14} />
                   <span>中文解读</span>
                </div>
                <div className="bg-white p-6 rounded-2xl relative z-10">
                   <div className="text-[10px] text-[#FE6D5D] font-bold tracking-widest mb-1.5">它在说什么</div>
                   <p className="text-gray-900 text-sm leading-relaxed font-medium">对方要你 14 天内回复，否则会继续追究。别怕，我已经替你写好了一封得体的回信。</p>
                </div>
                
                {/* Decorative background circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
             </div>
          </div>
        </div>

        {/* Feature 3 - First Aid Kit */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between md:space-x-12 relative">
          <div className="md:w-[45%] space-y-6">
            <div className="w-14 h-14 bg-[#EAB252] rounded-2xl flex items-center justify-center text-[#1C362B] shadow-lg">
              <BriefcaseMedical size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">FIRST-AID KIT</p>
              <h3 className="text-3xl font-extrabold text-[#1C362B]">急救包</h3>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              最慌的时候，打开它就好。落地必办清单、紧急联系人、救命话术模板 —— 把"我现在该怎么办"变成"照着做就行"。
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[#EAB252]/10 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">落地 7 件事清单</span>
              <span className="bg-[#EAB252]/10 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">紧急联系人</span>
              <span className="bg-[#EAB252]/10 text-[#1C362B] px-4 py-1.5 rounded-full text-xs font-bold">救命话术模板</span>
            </div>
          </div>
          <div className="md:w-1/2 w-full mt-12 md:mt-0 relative">
             <div className="bg-[#F8F6F1] rounded-[2.5rem] p-8 md:p-12 border border-[#EBE8E0]">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                   <div className="text-xs font-bold text-gray-500 mb-6">落地第一周 · 必办清单</div>
                   
                   <div className="flex items-center space-x-4">
                     <div className="w-6 h-6 rounded-full bg-[#1C362B] flex items-center justify-center flex-shrink-0">
                       <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <span className="text-gray-400 font-medium line-through decoration-1 decoration-gray-300">办本地手机卡</span>
                   </div>
                   
                   <div className="flex items-center space-x-4">
                     <div className="w-6 h-6 rounded-full bg-[#1C362B] flex items-center justify-center flex-shrink-0">
                       <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <span className="text-gray-400 font-medium line-through decoration-1 decoration-gray-300">开本地银行账户</span>
                   </div>

                   <div className="flex items-center space-x-4">
                     <div className="w-6 h-6 rounded-full border-2 border-[#FE6D5D] flex items-center justify-center flex-shrink-0"></div>
                     <span className="text-[#1C362B] font-bold">注册当地诊所 GP</span>
                   </div>

                   <div className="flex items-center space-x-4 opacity-50">
                     <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0"></div>
                     <span className="text-gray-700 font-medium">登记学校紧急联系人</span>
                   </div>
                   
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Inline ArrowDown for this file if lucide stops working or to avoid multiple imports
function ArrowDown({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  );
}
