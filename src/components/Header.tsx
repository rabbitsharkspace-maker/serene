import React from 'react';
import { motion } from 'motion/react';

export default function Header() {
  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full absolute top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-2 text-[#1C362B] font-bold text-xl tracking-tight cursor-pointer">
        <div className="w-8 h-8 bg-[#1C362B] text-white rounded-lg flex items-center justify-center text-sm font-black">落</div>
        <span>Landed</span>
      </div>
      
      <nav className="hidden md:flex space-x-8 text-sm text-gray-500 font-medium">
        <a href="#features" className="hover:text-gray-900 transition-colors">能帮你什么</a>
        <a href="#demo-section" className="hover:text-gray-900 transition-colors">看它怎么用</a>
        <a href="#roadmap" className="hover:text-gray-900 transition-colors">我们要去哪</a>
      </nav>

      <button 
        onClick={scrollToDemo}
        className="bg-[#FF6A56] hover:bg-[#ff5642] text-white px-6 py-2 rounded-full font-medium text-sm transition-transform active:scale-95 shadow-sm"
      >
        免费试一次
      </button>
    </header>
  );
}
