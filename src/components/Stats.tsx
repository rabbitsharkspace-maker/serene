import React from 'react';

export default function Stats() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto w-full">
      <div className="bg-[#F5F2EB] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row gap-16 items-center">
        
        <div className="md:w-1/2 space-y-8">
          <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-[#1C362B] leading-tight">
            澳洲 <span className="text-[#FE6D5D]">15万</span> 中国留学生，<br/>
            每一个落地，都会撞上这些坑。
          </h2>
          <p className="text-gray-600 leading-relaxed font-medium max-w-md">
            你不是第一个收到天价罚单、看不懂警告信、半夜不知道找谁的人。我们把这些"坑"提前整理好，陪你一个个跨过去。
          </p>
        </div>

        <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-white/50 flex flex-col justify-center min-h-[180px]">
            <div className="text-4xl font-black text-[#1C362B] mb-3">73%</div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">第一年就收到过看不懂的官方信件</p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-[#1C362B] rounded-3xl p-8 shadow-xl flex flex-col justify-center min-h-[180px]">
             <div className="text-4xl font-black text-white mb-3 tracking-tighter">$0</div>
             <p className="text-xs text-[#A2B5A9] font-medium leading-relaxed">读懂一封信、起草一封回信的成本</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-white/50 flex flex-col justify-center min-h-[180px]">
             <div className="text-4xl font-black text-[#1C362B] mb-3 tracking-tighter">14<span className="text-2xl ml-1 tracking-normal">天</span></div>
             <p className="text-xs text-gray-500 font-medium leading-relaxed">大多数罚单/警告信的回应窗口</p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#EAB252] rounded-3xl p-8 shadow-md flex flex-col justify-center min-h-[180px]">
             <div className="text-4xl font-black text-[#1C362B] mb-3 tracking-tighter">2<span className="text-2xl ml-1 tracking-normal">分钟</span></div>
             <p className="text-xs text-[#1C362B]/70 font-bold leading-relaxed">从拍照到拿到一封写好的回信</p>
          </div>
        </div>

      </div>
    </section>
  );
}
