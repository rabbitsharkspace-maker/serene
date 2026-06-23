import React from 'react';

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 px-8 max-w-7xl mx-auto w-full">
      <div className="mb-16">
        <p className="text-[#FE6D5D] text-sm font-bold tracking-wider mb-2 uppercase">WHERE WE'RE GOING</p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1C362B] leading-tight">
          从一封信，<br />到陪你走完整段异乡路。
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Phase 02 */}
        <div className="bg-[#1C362B] rounded-[2rem] p-10 md:w-[45%] flex flex-col justify-between min-h-[250px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <span className="text-[#EAB252] font-bold tracking-widest text-sm">PHASE 02</span>
            <span className="bg-[#EAB252]/20 text-[#EAB252] px-3 py-1 rounded-full text-xs font-bold">进行中</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-4">主动盾</h3>
            <p className="text-[#A2B5A9] text-sm leading-relaxed">
              不只是回应。提前扫描你的邮箱与日历，在罚单到期、签证临近前主动提醒你。
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#EAB252]/10 rounded-full blur-[50px] pointer-events-none"></div>
        </div>

        {/* Phase 03 & 04 container */}
        <div className="md:w-[55%] flex flex-col sm:flex-row gap-6">
          <div className="bg-[#F5F2EB] rounded-[2rem] p-10 flex-1 flex flex-col justify-between min-h-[250px]">
            <div className="flex justify-between items-start mb-8">
              <span className="text-[#1C362B] font-bold tracking-widest text-sm">PHASE 03</span>
              <span className="bg-white text-gray-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm">规划中</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#1C362B] mb-4">本地人脉</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                当事情超出 AI 能解决的范围，一键接通靠谱的本地律师、医生、学长学姐。
              </p>
            </div>
          </div>

          <div className="bg-[#F5F2EB] rounded-[2rem] p-10 flex-1 flex flex-col justify-between min-h-[250px]">
            <div className="flex justify-between items-start mb-8">
              <span className="text-[#1C362B] font-bold tracking-widest text-sm">PHASE 04</span>
              <span className="bg-white text-gray-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm">愿景</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#1C362B] mb-4">不只是澳洲</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                英国、美国、加拿大 —— 让每一个落地异乡的中国学生，第一天都不再一个人慌。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
