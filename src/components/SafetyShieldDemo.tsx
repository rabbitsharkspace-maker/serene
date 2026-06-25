import React, { useState, useRef } from 'react';
import { Camera, ShieldCheck, ArrowRight, ShieldAlert, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { useLocale } from '../lib/locale';
import GroundingSources from './GroundingSources';

type AppState = 'upload' | 'analyzing' | 'result';
type SubmoduleType = 'valuation' | 'scamCheck';

interface ShieldValueCheck {
  localPrice?: string;
  rmbEquivalent?: string;
  wittyComparison?: string;
}

interface ShieldResult {
  riskLevel: 'green' | 'yellow' | 'red';
  title: string;
  summary: string;
  redFlags: string[];
  valueCheck?: ShieldValueCheck;
}

interface ScamResult {
  riskLevel: 'green' | 'yellow' | 'red';
  scamProbability: string;
  scamType: string;
  whyDangerous: string[];
  whatToDo: string[];
  reassurance: string;
}

const SCAM_FLAG_GROUPS = [
  {
    category: "💰 金钱要求",
    items: [
      "对方要求你先转账/付押金/付定金",
      "贵重物品却只让你付'运费/手续费/税费'",
      "要求用礼品卡、加密货币或私下转账"
    ]
  },
  {
    category: "⏱️ 紧迫与稀缺",
    items: [
      "强调'只有这次机会''名额有限''今天不办就没了'",
      "催你立刻决定，不给你时间考虑"
    ]
  },
  {
    category: "✨ 太美好与激动",
    items: [
      "承诺'很好的机会''稳赚''高回报''轻松赚钱'",
      "你听了感到很激动/心动",
      "声称不需要专业知识技能就能赚钱"
    ]
  },
  {
    category: "👥 社会认同造假",
    items: [
      "说'已经很多人买了/参加了''别人都赚到了'"
    ]
  },
  {
    category: "🚨 冒充权威/恐吓 (高危)",
    items: [
      "对方自称使馆/移民局/警方/海关/快递",
      "威胁你'不配合就遣返/被捕/罚款/签证出问题'",
      "要求你保密，不许告诉家人、朋友或老师"
    ],
    isFatal: true
  },
  {
    category: "🔑 索取敏感信息 (高危)",
    items: [
      "索要银行卡号、验证码、密码、护照信息",
      "要求屏幕共享或安装指定 App"
    ],
    isFatal: true
  },
  {
    category: "🛡️ 可信度伪装",
    items: [
      "仅凭一个网站/公众号/链接就让你相信对方正规"
    ]
  },
  {
    category: "🍀 敏感领域承诺",
    items: [
      "涉及'包治大病''养老高回报投资''保录取/包毕业'等"
    ]
  }
];

export default function SafetyShieldDemo() {
  const { country, language, region } = useLocale();
  const [activeTab, setActiveTab] = useState<SubmoduleType>('valuation');
  const [appState, setAppState] = useState<AppState>('upload');

  // --- States for core shield (valuation) ---
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [textInfo, setTextInfo] = useState('');
  const [analysis, setAnalysis] = useState<ShieldResult | null>(null);
  const [activePreset, setActivePreset] = useState<'rent' | 'item' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- States for scam check module ---
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [scamText, setScamText] = useState('');
  const [scamFile, setScamFile] = useState<File | null>(null);
  const [scamFilePreview, setScamFilePreview] = useState<string | null>(null);
  const [scamAnalysis, setScamAnalysis] = useState<ScamResult | null>(null);
  const scamFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setActivePreset(null);
    }
  };

  const handleScamFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setScamFile(selectedFile);
      setScamFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const toggleFlag = (flag: string) => {
    setSelectedFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const submitForAnalysis = async () => {
    if (!file && !textInfo.trim()) return;
    setAppState('analyzing');
    
    try {
      const formData = new FormData();
      if (file) formData.append('image', file);
      if (textInfo.trim()) formData.append('textInfo', textInfo);
      formData.append('country', country);
      formData.append('language', language);
      formData.append('region', region);

      const res = await fetch('/api/analyze-shield', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      
      const data: ShieldResult = await res.json();
      setAnalysis(data);
      setAppState('result');
    } catch (err) {
      console.error(err);
      alert('防坑诊断失败，请重试');
      setAppState('upload');
    }
  };

  const submitScamCheck = async () => {
    if (selectedFlags.length === 0 && !scamText.trim() && !scamFile) {
      alert('请至少勾选任意红旗项、填写可疑段落或上传聊天截图才能诊断哦');
      return;
    }
    setAppState('analyzing');

    try {
      const formData = new FormData();
      if (scamFile) formData.append('image', scamFile);
      if (scamText.trim()) formData.append('scamText', scamText);
      formData.append('flags', JSON.stringify(selectedFlags));
      formData.append('country', country);
      formData.append('language', language);
      formData.append('region', region);

      const res = await fetch('/api/scam-check', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Scam check failed');

      const data: ScamResult = await res.json();
      setScamAnalysis(data);
      setAppState('result');
    } catch (err) {
      console.error(err);
      alert('反诈会诊失败，请重试');
      setAppState('upload');
    }
  };

  const reset = () => {
    setAppState('upload');
    setFile(null);
    setFilePreview(null);
    setTextInfo('');
    setAnalysis(null);
    setActivePreset(null);

    // Reset scam-check states too
    setSelectedFlags([]);
    setScamText('');
    setScamFile(null);
    setScamFilePreview(null);
    setScamAnalysis(null);
  };

  const loadExample = (type: 'rent' | 'item') => {
    setActivePreset(type);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 600, 800);
    ctx.fillStyle = '#1d1d1f';
    
    if (type === 'rent') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 20, 560, 400);
      ctx.fillStyle = '#1d1d1f';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('CBD Luxury Apartment $200/w', 50, 70);
      ctx.font = '24px sans-serif';
      ctx.fillText('Super cheap! Fully furnished.', 50, 120);
      ctx.fillText('Owner is in UK, send Western Union', 50, 180);
      ctx.fillText('first to secure keys and contract.', 50, 220);
      
      setTextInfo('房东说他目前在英国工作，无法带我实地看房。他要求我先通过西联汇款（Western Union）给他打 1000 澳币押金锁房，之后把钥匙和正规合同邮寄给我。但在CBD繁华地段每周只有 $200，是不是有点不寻常？');
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 20, 560, 400);
      ctx.fillStyle = '#1d1d1f';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Used Microwave Oven - $80', 50, 70);
      ctx.font = '24px sans-serif';
      ctx.fillText('Good condition. Cash or Transfer.', 50, 120);
      ctx.fillText('Pick up only.', 50, 160);
      
      setTextInfo('在Facebook Marketplace上看到一架九成新微波炉，卖家要价 80 刀自提。这二手价格划算吗？不知道澳洲全新基础款大概什么行情？');
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const fileObj = new File([blob], `${type}.png`, { type: 'image/png' });
        setFile(fileObj);
        setFilePreview(URL.createObjectURL(fileObj));
      }
    });
  };

  // Derive a numeric % for the gauge: prefer a number Gemini stated, else map by level.
  const riskPercent = (a: { scamProbability?: string; riskLevel: string }) => {
    const m = (a.scamProbability || '').match(/(\d{1,3})\s*%/);
    if (m) return Math.min(100, Math.max(1, parseInt(m[1], 10)));
    return a.riskLevel === 'red' ? 90 : a.riskLevel === 'yellow' ? 55 : 12;
  };
  const riskColor = (level: string) => level === 'red' ? '#d33a2c' : level === 'yellow' ? '#c2820a' : '#2fa84f';

  const getRiskUI = (level: string) => {
    switch(level) {
      case 'red': 
        return { 
          bg: 'bg-[#FFF4F2]', 
          border: 'border-[#FEE6E3]', 
          text: 'text-[#D84C3E]', 
          icon: <ShieldAlert size={24} />, 
          label: '极高风险 / 骗局高发' 
        };
      case 'yellow': 
        return { 
          bg: 'bg-[#FFF9F0]', 
          border: 'border-[#FBEAC8]', 
          text: 'text-[#D48806]', 
          icon: <ShieldAlert size={24} />, 
          label: '中度嫌疑 / 溢价可能' 
        };
      case 'green': 
        return { 
          bg: 'bg-[#F2FBF5]', 
          border: 'border-[#E0F4E8]', 
          text: 'text-[#1d1d1f]', 
          icon: <ShieldCheck size={24} />, 
          label: '相对安全 / 正规合理' 
        };
      default: 
        return { 
          bg: 'bg-gray-50', 
          border: 'border-gray-200', 
          text: 'text-gray-500', 
          icon: <ShieldCheck size={24} />, 
          label: '暂无异常' 
        };
    }
  };

  return (
    <div className="w-full px-2 pb-16">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ff5a3c]/20 to-transparent blur-3xl rounded-full pointer-events-none -mr-20 -mt-20"></div>

      <div className="mb-8 relative z-10">
        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheck size={24} className="text-[#ff5a3c]" />
          <p className="text-gray-500 text-sm font-bold tracking-widest uppercase font-mono">SAFETY SHIELD</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1d1d1f] leading-tight font-display">
          防诈防坑安全盾
        </h2>
        <p className="text-[#3C4D43] text-sm mt-1">海外新移民的全能排雷盾牌。扫房源租房套路、估算二手物价，深度反诈安心自检。</p>
      </div>

      <div className="flex flex-col relative z-10 w-full">
        {/* Interactive Main Area */}
        <div className="flex flex-col w-full min-h-[550px] bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          
          {/* Submodule Tab Switcher */}
          {appState === 'upload' && (
            <div className="flex bg-gray-100/80 p-1.5 rounded-2xl mb-6 max-w-md border border-gray-200/50">
              <button
                onClick={() => setActiveTab('valuation')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'valuation'
                    ? 'bg-[#1d1d1f] text-[#ff5a3c] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🏠 房源与好物估值
              </button>
              <button
                onClick={() => setActiveTab('scamCheck')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'scamCheck'
                    ? 'bg-[#1d1d1f] text-[#ff5a3c] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🛡️ 反诈自检
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Tab 1: Valuation Forms */}
            {appState === 'upload' && activeTab === 'valuation' && (
              <motion.div 
                key="upload-val"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col justify-center"
              >
                <div className="text-sm font-bold text-gray-500 mb-4 font-display">第一步：上传估价线索 (截屏或具体描述)</div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6 flex-1">
                  {/* Image Upload Box */}
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[1.5rem] p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[#ff5a3c]/50 transition-colors overflow-hidden relative group min-h-[220px]"
                  >
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center p-3">
                        <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform animate-pulse">
                          <Camera className="text-gray-400 group-hover:text-[#ff5a3c] transition-colors" size={24} />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">拖入或上传聊天截图 / 租房广告 / 二手机报价单</p>
                        <p className="text-gray-400 text-xs mt-1">支持常见图片格式（如 WhatsApp，Marketplace 截图等）</p>
                      </div>
                    )}
                  </div>

                  {/* Text Input Box */}
                  <div className="flex-1 border border-gray-200 rounded-[1.5rem] bg-white p-4 focus-within:border-[#ff5a3c] focus-within:ring-2 ring-[#ff5a3c]/20 transition-all flex flex-col min-h-[220px]">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider font-mono">补充背景描述 / 对方说辞</span>
                      </div>
                    </div>
                    <textarea 
                      className="flex-1 w-full bg-transparent resize-none focus:outline-none text-sm text-gray-700 min-h-[80px]"
                      placeholder="例：“房东叫我先电汇订金锁看房钥匙，说定金可以全额退款合理吗？” 或 “微波炉要 $80 同城去提，Kmart 全新的怎么卖？”..."
                      value={textInfo}
                      onChange={e => setTextInfo(e.target.value)}
                    ></textarea>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-[10px] font-bold text-gray-400 mb-2 font-mono">一键快速载入经典案例：</div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => loadExample('rent')} className="text-xs text-left bg-gray-50 hover:bg-[#ff5a3c]/10 text-gray-600 hover:text-[#1d1d1f] p-2.5 rounded-xl transition-colors truncate border border-gray-100 font-medium">
                          🏠 “房东在英国，让西联打定金...” (租房骗局)
                        </button>
                        <button onClick={() => loadExample('item')} className="text-xs text-left bg-gray-50 hover:bg-[#ff5a3c]/10 text-gray-600 hover:text-[#1d1d1f] p-2.5 rounded-xl transition-colors truncate border border-gray-100 font-medium">
                          📺 “二手微波炉 Marketplace 喊价 $80 划算吗？”
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={submitForAnalysis}
                  disabled={!file && !textInfo.trim()}
                  className={`w-full py-4 rounded-xl font-bold flex justify-center items-center space-x-2 transition-all ${file || textInfo.trim() ? 'bg-[#1d1d1f] hover:bg-[#254839] text-[#ff5a3c] shadow-lg active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <span>全网大数据比对与防坑诊断</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* Tab 2: Scam Self-Check Form */}
            {appState === 'upload' && activeTab === 'scamCheck' && (
              <motion.div 
                key="upload-scam"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col justify-center"
              >
                <div className="text-sm font-bold text-gray-500 mb-4 font-display">
                  请勾选您当前遇到的可疑特征（支持多选，若命中致命红旗，AI 将强力介入预警）：
                </div>

                {/* Grid of group checklists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {SCAM_FLAG_GROUPS.map((group, groupIdx) => (
                    <div 
                      key={groupIdx} 
                      className={`p-4 rounded-2xl border transition-all ${
                        group.isFatal 
                          ? 'bg-[#FFF5F5]/60 border-[#FEE3E3] hover:bg-[#FFF5F5]' 
                          : 'bg-stone-50/50 border-stone-200/60 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-700 tracking-wide">{group.category}</h4>
                        {group.isFatal && (
                          <span className="bg-[#D84C3E] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-widest uppercase">
                            致命红旗
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {group.items.map((item, itemIdx) => {
                          const isChecked = selectedFlags.includes(item);
                          return (
                            <label 
                              key={itemIdx}
                              className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer text-xs transition-colors select-none ${
                                isChecked 
                                  ? 'bg-white shadow-xs text-gray-900 border border-[#ff5a3c]/50' 
                                  : 'text-gray-600 hover:bg-white/50 border border-transparent'
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFlag(item)}
                                className="mt-0.5 rounded border-stone-300 text-[#1d1d1f] focus:ring-[#1d1d1f] accent-[#1d1d1f]"
                              />
                              <span className="leading-snug">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Descriptive section */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* File Upload component for screenshot */}
                  <div className="flex-1 flex flex-col justify-between">
                    <input type="file" ref={scamFileInputRef} onChange={handleScamFileSelect} accept="image/*" className="hidden" />
                    <div 
                      onClick={() => scamFileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[#ff5a3c]/50 transition-all overflow-hidden relative min-h-[140px] group"
                    >
                      {scamFilePreview ? (
                        <img src={scamFilePreview} alt="Scam Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center p-2">
                          <Camera className="text-gray-400 group-hover:text-[#ff5a3c] transition-colors mx-auto mb-2" size={20} />
                          <p className="text-gray-600 text-[11px] font-semibold">上传短信/微信/WhatsApp聊天截屏</p>
                          <p className="text-gray-400 text-[10px] mt-0.5">可直接识图中高危话术字眼</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suspicious transcript input */}
                  <div className="flex-1 border border-gray-200 rounded-2xl bg-white p-4 focus-within:border-[#ff5a3c] focus-within:ring-2 ring-[#ff5a3c]/10 transition-all flex flex-col min-h-[140px]">
                    <div className="flex items-center space-x-1.5 text-gray-400 mb-1.5">
                      <FileText size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono">粘贴可疑文字信息 / 电话大意</span>
                    </div>
                    <textarea 
                      className="flex-1 w-full bg-transparent resize-none focus:outline-none text-xs text-gray-700 min-h-[70px]"
                      placeholder="如果对方向你索要汇款，或是自称澳洲邮政（AusPost）、中国大使馆、海关，请在此粘贴对方的信息或致电的核心要求..."
                      value={scamText}
                      onChange={e => setScamText(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <button 
                  onClick={submitScamCheck}
                  disabled={selectedFlags.length === 0 && !scamText.trim() && !scamFile}
                  className={`w-full py-4 rounded-xl font-bold flex justify-center items-center space-x-2 transition-all ${
                    selectedFlags.length > 0 || scamText.trim() || scamFile
                      ? 'bg-[#1d1d1f] hover:bg-[#254839] text-[#ff5a3c] shadow-lg active:scale-95' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>🚀 启动国际反诈 AI 深度会诊</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* State 2: Analyzing / Thinking */}
            {appState === 'analyzing' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 border-4 border-[#ff5a3c]/20 border-t-[#ff5a3c] rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">
                  {activeTab === 'scamCheck' ? '反诈安全官 AI 正在深度会诊' : '防诈安全盾 正在深度研判'}
                </h3>
                <p className="text-[#3C4D43] text-sm leading-relaxed max-w-sm">
                  {activeTab === 'scamCheck' 
                    ? '正在调用 Google Search 联动澳洲诈骗预防监察网 (Scamwatch) 的最新通报，深度判定当前情况是否属于高频已知骗局...'
                    : '正在调用实时智能技术，查询 Kmart、IKEA、Target 等本地连锁零售店的相关对标物价，全面规避溢价圈套中...'
                  }
                </p>
              </motion.div>
            )}

            {/* State 3: Results for Valuation */}
            {appState === 'result' && activeTab === 'valuation' && analysis && (
              <motion.div 
                key="result-val"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col w-full h-full overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="flex justify-between items-start mb-6">
                  <button onClick={reset} className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center space-x-1 border border-gray-100 hover:border-gray-300 py-1.5 px-3 rounded-lg bg-gray-50 transition-colors">
                    <span>← 返回重新排雷</span>
                  </button>
                  
                  {/* Risk Badge */}
                  <div className={`px-4 py-1.5 rounded-full flex items-center space-x-2 border ${getRiskUI(analysis.riskLevel).bg} ${getRiskUI(analysis.riskLevel).border} ${getRiskUI(analysis.riskLevel).text}`}>
                    {getRiskUI(analysis.riskLevel).icon}
                    <span className="font-bold text-sm tracking-wide">{getRiskUI(analysis.riskLevel).label}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-4 font-display">{analysis.title}</h3>

                {/* Summary block */}
                <div className={`p-5 rounded-2xl mb-4 border ${getRiskUI(analysis.riskLevel).bg} ${getRiskUI(analysis.riskLevel).border}`}>
                  <div className="text-gray-900 font-medium leading-relaxed markdown-body text-sm">
                    <Markdown>{analysis.summary}</Markdown>
                  </div>
                </div>

                {/* Red Flags / Specific Checks */}
                {analysis.redFlags && analysis.redFlags.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-400 tracking-widest mb-3 uppercase font-mono">🔍 安全诊断细节：</div>
                    <ul className="space-y-3">
                      {analysis.redFlags.map((flag, idx) => (
                        <li key={idx} className="flex items-start space-x-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <span className="text-[#ff5a3c] flex-shrink-0 mt-0.5 font-bold">•</span>
                          <div className="font-medium leading-relaxed markdown-body w-full text-xs md:text-sm">
                            <Markdown>{flag}</Markdown>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Value Check / Witty Module (if present) */}
                {analysis.valueCheck?.wittyComparison && (
                  <div className="mt-4">
                    <div className="bg-[#1d1d1f] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#ff5a3c] text-[#1d1d1f] text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider font-mono">物价体感换算</div>
                      
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <div className="text-white/50 text-xs mb-1">估值对标折合约</div>
                          <div className="text-2xl font-bold font-display">{analysis.valueCheck.rmbEquivalent || "￥-"}</div>
                        </div>
                        {analysis.valueCheck.localPrice && (
                          <div className="text-right">
                            <div className="text-white/50 text-xs mb-1">澳洲实体零售参考价</div>
                            <div className="text-sm font-semibold text-[#ff5a3c] font-mono">{analysis.valueCheck.localPrice}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-xl border border-white/15">
                        <div className="text-xs md:text-sm text-[#ff5a3c] font-medium leading-relaxed markdown-body">
                          <Markdown>{analysis.valueCheck.wittyComparison}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <GroundingSources grounding={(analysis as any)._grounding} />
              </motion.div>
            )}

            {/* State 3: Results for Scam Check */}
            {appState === 'result' && activeTab === 'scamCheck' && scamAnalysis && (
              <motion.div 
                key="result-scam"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col w-full h-full overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="flex justify-between items-start mb-6">
                  <button onClick={reset} className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center space-x-1 border border-gray-100 hover:border-gray-300 py-1.5 px-3 rounded-lg bg-gray-50 transition-colors">
                    <span>← 返回重新评估</span>
                  </button>
                  
                  {/* Risk Badge */}
                  <div className={`px-4 py-1.5 rounded-full flex items-center space-x-2 border ${getRiskUI(scamAnalysis.riskLevel).bg} ${getRiskUI(scamAnalysis.riskLevel).border} ${getRiskUI(scamAnalysis.riskLevel).text}`}>
                    {getRiskUI(scamAnalysis.riskLevel).icon}
                    <span className="font-bold text-sm tracking-wide">{getRiskUI(scamAnalysis.riskLevel).label}</span>
                  </div>
                </div>

                {/* Risk Level Highlight + Percentage */}
                <div className={`p-6 rounded-2xl mb-6 border ${getRiskUI(scamAnalysis.riskLevel).bg} ${getRiskUI(scamAnalysis.riskLevel).border} flex flex-col md:flex-row items-start md:items-center justify-between gap-5`}>
                  <div className="flex items-center space-x-4">
                    <span className="p-3 bg-white rounded-2xl shadow-xs inline-block">
                      {getRiskUI(scamAnalysis.riskLevel).icon}
                    </span>
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-widest font-mono ${getRiskUI(scamAnalysis.riskLevel).text}`}>
                        系统评估报告 ｜ RISK INTENSITY
                      </div>
                      <div className="text-lg font-bold text-gray-900 mt-1 leading-snug font-display">
                        {scamAnalysis.scamProbability}
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const pct = riskPercent(scamAnalysis);
                    const col = riskColor(scamAnalysis.riskLevel);
                    const C = 2 * Math.PI * 38;
                    return (
                      <div className="relative shrink-0 w-[108px] h-[108px] self-center">
                        <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
                          <circle cx="54" cy="54" r="38" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="11" />
                          <circle cx="54" cy="54" r="38" fill="none" stroke={col} strokeWidth="11" strokeLinecap="round"
                            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
                            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)' }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[26px] font-extrabold leading-none" style={{ color: col }}>{pct}%</span>
                          <span className="text-[10px] font-bold text-gray-400 mt-1">诈骗概率</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <h3 className="text-2xl font-bold font-display text-[#1d1d1f] mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#ff5a3c] rounded-full inline-block"></span>
                  {scamAnalysis.scamType}
                </h3>

                {/* Two Col layout for whyDangerous and whatToDo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Danger explanations */}
                  <div className="flex flex-col">
                    <div className="text-xs font-bold text-gray-400 tracking-widest mb-3 uppercase font-mono">⛔️ 欺诈深度揭露 (套路剖析)：</div>
                    <div className="space-y-3 flex-1">
                      {scamAnalysis.whyDangerous.map((why, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 text-xs md:text-sm text-gray-750 bg-stone-50 p-4 rounded-2xl border border-stone-200/50 leading-relaxed font-normal">
                          <span className="w-1.5 h-1.5 bg-[#D84C3E] rounded-full mt-2 flex-shrink-0"></span>
                          <span>{why}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions checklist */}
                  <div className="flex flex-col">
                    <div className="text-xs font-bold text-gray-400 tracking-widest mb-3 uppercase font-mono">💡 避坑专家安全指令：</div>
                    <div className="space-y-3 flex-1">
                      {scamAnalysis.whatToDo.map((action, idx) => (
                        <div key={idx} className="flex items-start space-x-3 text-xs md:text-sm text-gray-800 bg-[#FFFCE6]/40 p-4 rounded-2xl border border-[#FFF9CC]/80 leading-relaxed">
                          <CheckCircle2 size={18} className="text-[#ff5a3c] flex-shrink-0 mt-0.5" />
                          <span className="font-semibold text-[#1d1d1f]">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reassurance Banner at Bottom */}
                <div className="bg-[#1d1d1f] text-white p-5 rounded-3xl border border-[#234335] mt-6 relative overflow-hidden shadow-md">
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#ff5a3c]/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="text-xs font-bold text-[#ff5a3c] mb-1 px-2.5 py-0.5 bg-white/15 rounded-md inline-block uppercase tracking-wider font-mono">
                    🌟 留学生心理安抚线长
                  </div>
                  <p className="text-xs md:text-sm text-stone-100 font-normal leading-relaxed mt-2 pl-1">
                    {scamAnalysis.reassurance}
                  </p>
                </div>

                <GroundingSources grounding={(scamAnalysis as any)._grounding} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
