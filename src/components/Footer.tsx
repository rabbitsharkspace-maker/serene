import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1C362B] text-white rounded-t-[3rem] mt-20 pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-16 mb-12">
          <div className="w-full md:w-auto mb-10 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-white">
              下一封看不懂的信，<br/>让我们替你扛。
            </h2>
            <p className="text-[#FE6D5D] text-lg font-medium">You just landed. We've got the rest.</p>
          </div>
          
          <button 
            onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center space-x-2 bg-[#FE6D5D] hover:bg-[#ff5642] text-white px-8 py-4 rounded-full font-bold transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#FE6D5D]/20 active:scale-95 w-full md:w-auto justify-center"
          >
            <span>免费试一次</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-2 font-bold text-xl tracking-tight mb-6 md:mb-0">
            <div className="w-8 h-8 bg-white/10 text-white rounded-lg flex items-center justify-center text-sm font-black text-white mix-blend-overlay">落</div>
            <span>Landed</span>
          </div>

          <div className="flex items-center space-x-4 text-[#A2B5A9] font-medium text-xs">
            <span>Built with</span>
            <div className="flex space-x-2">
              <span className="flex items-center space-x-1.5 bg-white/5 py-1 px-3 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-[#EAB252]"></div><span>Gemini</span></span>
              <span className="flex items-center space-x-1.5 bg-white/5 py-1 px-3 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-[#FE6D5D]"></div><span>Google Search</span></span>
              <span className="flex items-center space-x-1.5 bg-white/5 py-1 px-3 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-white"></div><span>Gmail</span></span>
              <span className="flex items-center space-x-1.5 bg-white/5 py-1 px-3 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-[#EAB252]"></div><span>Firebase</span></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
