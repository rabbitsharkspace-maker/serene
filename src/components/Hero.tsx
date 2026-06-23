import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, RotateCcw } from 'lucide-react';

export default function Hero() {
  const [viewState, setViewState] = useState<'decoded' | 'decoding' | 'original'>('original');

  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDecodeClick = () => {
    setViewState('decoding');
    setTimeout(() => {
      setViewState('decoded');
    }, 1500);
  };

  const handleViewOriginal = () => {
    setViewState('original');
  };

  return (
    <section className="pt-32 pb-20 px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between min-h-[90vh]">
      <div className="md:w-[45%] mt-12 md:mt-0 space-y-8 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F0EEEA] text-[#8C887E] px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center space-x-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FE6D5D]"></span>
          <span>你落地的那一刻，它就上线了</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-[5rem] font-extrabold text-[#1C362B] leading-[1.1] tracking-tight"
        >
          落地海外的<br />第一天，先别<br/>慌。
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[#FE6D5D] text-xl font-medium tracking-wide"
        >
          Landed — your first responder abroad.
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[#6C6C6C] text-lg max-w-md leading-relaxed font-medium"
        >
          看不懂的罚单、警告信、官方邮件 —— 拍下来，我们用中文替你读懂它，再帮你一键回信。把异乡的第一道难关，交给一个站在你这边的人。
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center space-x-6 pt-4"
        >
          <button 
            onClick={scrollToDemo}
            className="flex items-center justify-center space-x-2 bg-[#FF6A56] hover:bg-[#ff5642] text-white px-8 py-4 rounded-full font-bold transition-transform hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#FF6A56]/20"
          >
            <span>免费试一次</span>
            <ArrowDown size={18} className="-rotate-90" />
          </button>
          
          <button 
            onClick={scrollToDemo}
            className="flex items-center space-x-2 text-[#1C362B] font-bold text-sm tracking-wide hover:opacity-70 transition-opacity"
          >
            <span>看它怎么工作</span>
            <ArrowDown size={14} className="mt-0.5" />
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center space-x-4 pt-8"
        >
          <div className="flex -space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#1C362B] border-2 border-[#F9F8F6]"></div>
            <div className="w-8 h-8 rounded-full bg-[#EAB252] border-2 border-[#F9F8F6]"></div>
            <div className="w-8 h-8 rounded-full bg-[#FE6D5D] border-2 border-[#F9F8F6]"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            已陪 <span className="font-bold text-gray-900">2,400+</span> 位留学生扛过第一封信
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 40, rotate: 2 }}
        animate={{ opacity: 1, x: 0, rotate: -2 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
        className="md:w-[50%] flex justify-end relative mt-20 md:mt-0"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-[#EAB252]/10 to-transparent blur-3xl -z-10 rounded-full h-[120%] w-[120%] -top-[10%] -left-[10%] pointer-events-none"></div>
        
        <div className="relative w-full max-w-[500px]">
          {/* Card Container with Perspective */}
          <div className="relative w-full min-h-[480px] perspective-1000">
            <AnimatePresence mode="wait">
              {viewState === 'original' || viewState === 'decoding' ? (
                <motion.div
                  key="original"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
                >
                  <div className="bg-[#1C1C1C] text-white px-6 py-4 flex justify-between items-center text-xs tracking-widest uppercase">
                    <div className="flex items-center space-x-2">
                      <span className="border border-white/30 px-1.5 py-0.5 rounded">VIC</span>
                      <span className="font-medium">CITY OF MELBOURNE</span>
                    </div>
                    <span className="text-white/50">OFFICIAL</span>
                  </div>
                  <div className="p-8 space-y-6 flex-1">
                    <div>
                      <h3 className="text-[#C14436] font-bold text-sm tracking-wider mb-1">PENALTY REMINDER NOTICE</h3>
                      <p className="text-gray-400 text-xs">Notice No. 3049 8821 174 • Issued 14 MAR 2026</p>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs tracking-wider mb-1">AMOUNT DUE</div>
                      <div className="text-5xl font-extrabold text-[#1C1C1C] tracking-tighter">$385.00</div>
                    </div>
                    <hr className="border-gray-200" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-[#1C1C1C]">OFFENCE:</span> STAND VEHICLE IN A PERMIT ZONE — NO CURRENT PERMIT DISPLAYED.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#C14436] font-semibold leading-relaxed">
                        FAILURE TO PAY BY 28 MAR 2026 MAY RESULT IN ADDITIONAL ENFORCEMENT COSTS AND LICENCE CONSEQUENCES.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="decoded"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
                >
                  <div className="bg-[#1C362B] text-white px-6 py-4 flex justify-between items-center text-xs tracking-widest rounded-t-[2rem]">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 w-6 h-6 flex items-center justify-center rounded text-[11px] font-black mix-blend-overlay text-white">落</div>
                      <span className="font-medium tracking-normal text-sm">已为你读懂这封信</span>
                    </div>
                    <span className="text-[#A2B5A9] uppercase">DECODED</span>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col bg-white rounded-b-[2rem]">
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="text-2xl font-bold text-gray-900">一张停车罚单</h3>
                       <div className="bg-[#FFF4E5] text-[#D48806] px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5">
                         <div className="w-1.5 h-1.5 bg-[#D48806] rounded-full"></div>
                         <span>风险中等 · 可申诉</span>
                       </div>
                    </div>

                    <div className="bg-[#F8F6F1] rounded-2xl p-5">
                       <div className="text-xs font-bold text-gray-500 mb-2">为什么被罚</div>
                       <p className="text-gray-900 text-sm font-medium leading-relaxed">
                         你停在了「许可证专用区」，但车上没放对应的停车许可证。
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-[#F8F6F1] rounded-2xl p-5">
                         <div className="text-xs font-bold text-gray-500 mb-2">截止日期</div>
                         <p className="text-gray-900 text-sm font-medium">
                           3月28日前 · <span className="text-[#D84C3E]">还剩14 天</span>
                         </p>
                       </div>
                       <div className="bg-[#FFF9F0] rounded-2xl p-5 border border-[#FBEAC8]">
                         <div className="text-xs font-bold text-[#D48806] mb-2">痛感折算</div>
                         <p className="text-gray-900 text-base font-bold">
                           ≈ 38 杯奶茶
                         </p>
                       </div>
                    </div>

                    <div className="mt-8 pt-4">
                      <button onClick={scrollToDemo} className="w-full bg-[#FF6A56] hover:bg-[#ff5642] text-white py-5 rounded-2xl font-bold flex justify-center items-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 text-lg">
                         <span>一键发申诉信</span>
                         <ArrowDown size={18} className="-rotate-90 ml-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons Below Card */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            {viewState === 'decoded' ? (
               <button 
                onClick={handleViewOriginal}
                className="bg-white border-2 border-[#1877F2] text-[#1877F2] px-6 py-2 rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
              >
                <RotateCcw size={14} />
                <span>查看英文原件</span>
              </button>
            ) : (
              <button 
                onClick={handleDecodeClick}
                disabled={viewState === 'decoding'}
                className={`bg-white px-6 py-2 rounded-full font-bold text-sm shadow-xl transition-all flex items-center space-x-2 ${viewState === 'decoding' ? 'border-2 border-[#1877F2] text-gray-900 scale-95 opacity-100' : 'border-2 border-[#1877F2] text-[#1877F2] hover:scale-105 active:scale-95'}`}
              >
                {viewState === 'decoding' ? (
                   <>
                     <div className="w-4 h-4 border-2 border-[#1877F2]/20 border-t-[#1877F2] rounded-full animate-spin"></div>
                     <span>解读中...</span>
                   </>
                ) : (
                   <span>一键帮你读懂</span>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

