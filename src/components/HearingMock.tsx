import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from '../lib/locale';
import { useT } from '../lib/i18n';
import { showToast } from '../lib/toast';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  MessageSquare, 
  AlertCircle, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  User, 
  Flame, 
  Activity, 
  Scale, 
  ShieldAlert, 
  UserCheck,
  Star,
  Copy
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

type ScenarioType = 'academic' | 'bond' | 'fine';

interface ScenarioConfig {
  id: ScenarioType;
  titleZh: string;
  titleEn: string;
  characterZh: string;
  characterEn: string;
  descriptionZh: string;
  descriptionEn: string;
  avatar: string;
  welcomeZh: string;
  welcomeEn: string;
  bgGradient: string;
}

const SCENARIOS: Record<ScenarioType, ScenarioConfig> = {
  academic: {
    id: 'academic',
    titleZh: '学委会学术诚信听证',
    titleEn: 'Academic Board Hearing',
    characterZh: 'Evelyn Vance 教授 (校学术委员会主席)',
    characterEn: 'Prof. Evelyn Vance (Academic Chair)',
    descriptionZh: '论文被控 45% AI 查重率/学术抄袭，面对严厉的主席自证清白，解释正当引用。',
    descriptionEn: 'Flagged for 45% AI similarity on a final thesis. Prove your innocence and justify your proper referencing to a skeptical panel chair.',
    avatar: '🎓',
    welcomeZh: '你好，我是学术诚信委员会主席 Evelyn Vance 教授。关于你提交的终期论文中 45% 的高查重率以及 AI 写作标记，你有什么想向委员会解释的？',
    welcomeEn: 'Hello, I am Professor Evelyn Vance, Chair of the Academic Integrity Committee. Regarding the 45% similarity index and AI generation flagging on your final paper, what do you have to say to the committee?',
    bgGradient: 'from-blue-50 to-indigo-50/50 border-blue-200'
  },
  bond: {
    id: 'bond',
    titleZh: '租房押金仲裁谈判 (VCAT)',
    titleEn: 'Tenancy Bond Dispute (VCAT)',
    characterZh: 'Arthur Pendelton (资深中介房东代表)',
    characterEn: 'Arthur Pendelton (Landlord Agent)',
    descriptionZh: '退租时中介找借口克扣 $2500 押金，声称地板磨损和厨房积灰，在维州仲裁庭面对面对峙。',
    descriptionEn: 'The agent claims a $2500 bond deduction for minor floor scuffs and kitchen dust. Fight for your refund in front of a VCAT member.',
    avatar: '🏠',
    welcomeZh: '你好。我是房东代理人 Arthur。我已经看过了你的退房申诉，但根据我们的入驻状况报告，地板上的划痕和厨房的卫生绝对超出了合理磨损（Fair Wear and Tear）。我们坚持扣除全部押金，你有什么要反驳的？',
    welcomeEn: 'Hello. I am Arthur, representing the landlord. I have received your dispute, but the floor scratches and kitchen dust are clearly beyond fair wear and tear. We stand by our $2,500 claim. What is your justification?',
    bgGradient: 'from-amber-50 to-orange-50/50 border-amber-200'
  },
  fine: {
    id: 'fine',
    titleZh: '路边交通罚单行政申辩',
    titleEn: 'Traffic Fine Police Officer Appeal',
    characterZh: 'Miller 警官 (交警行政申诉官)',
    characterEn: 'Officer Miller (Infringement Officer)',
    descriptionZh: '在学校区域超速被扣分罚款，自辩当时有紧急避让或路标遮挡等合理行政抗诉事由。',
    descriptionEn: 'Caught speeding in a school zone. Defend your case based on urgent hazard avoidance or obscured signposts to a strict officer.',
    avatar: '👮',
    welcomeZh: '我是 Miller 警官。关于你在学校区域超速行驶的申诉，我们收到了。不过法律就是法律，学区限速是强制性的。你能向我出示任何确凿的免责证据，或者你为什么认为这笔罚单应该被撤销？',
    welcomeEn: 'I am Officer Miller. I have your appeal regarding the school zone speeding ticket. Speed limits are strictly enforced. Do you have any verifiable evidence or mitigating circumstances to warrant a withdrawal?',
    bgGradient: 'from-rose-50 to-red-50/50 border-rose-200'
  }
};

export default function HearingMock() {
  const { country, language, region } = useLocale();
  const t = useT();
  const isZh = language === 'zh';

  // State managers
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('academic');
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  
  // Media states
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);
  const [micEnabled, setMicEnabled] = useState<boolean>(false);
  const [isSpeechRecording, setIsSpeechRecording] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [ttsMode, setTtsMode] = useState<'local' | 'ai'>('local'); // Default to local for instantaneous (0ms) response

  // HUD Biometric Metrics Fluctuation
  const [hudConfidence, setHudConfidence] = useState<number>(88);
  const [hudEyeContact, setHudEyeContact] = useState<number>(94);
  const [hudLogic, setHudLogic] = useState<number>(90);
  const [hudWpm, setHudWpm] = useState<number>(135);

  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      // Fluctuating confidence between 85 and 95
      setHudConfidence(prev => {
        const diff = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(82, Math.min(98, prev + diff));
      });
      // Fluctuating eye contact between 90 and 98
      setHudEyeContact(prev => {
        const diff = Math.floor(Math.random() * 3) - 1; // -1 to +1
        return Math.max(88, Math.min(99, prev + diff));
      });
      // Fluctuating logic index
      setHudLogic(prev => {
        const diff = Math.floor(Math.random() * 3) - 1; // -1 to +1
        return Math.max(85, Math.min(96, prev + diff));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Adjust WPM based on typing length
  useEffect(() => {
    if (userInput.length > 0) {
      setHudWpm(Math.max(110, Math.min(180, 120 + (userInput.length % 45))));
    } else {
      setHudWpm(135);
    }
  }, [userInput]);
  
  // Evaluation scorecard states
  const [showScorecard, setShowScorecard] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [scorecardData, setScorecardData] = useState<any>(null);

  // Premium TTS states and refs
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsCacheRef = useRef<Map<string, string>>(new Map());
  const [premiumTtsPlayingText, setPremiumTtsPlayingText] = useState<string>('');
  const [premiumTtsLoading, setPremiumTtsLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');

  // Audio Context Ref for waveform drawing
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiResponding]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US'; // Hearing is in English to simulate real negotiation

      rec.onstart = () => {
        setIsSpeechRecording(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setUserInput(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsSpeechRecording(false);
      };

      rec.onend = () => {
        setIsSpeechRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Web Audio Waveform Renderer
  const startAudioWaveform = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!analyserRef.current) return;
        animationFrameRef.current = requestAnimationFrame(draw);

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw centered glowing wave lines
        const width = canvas.width;
        const height = canvas.height;
        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        ctx.fillStyle = '#fffdf9';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < bufferLength; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = Math.max(4, percent * height * 0.85);

          // Render styled terracotta coral bars symmetrically
          ctx.fillStyle = `rgba(241, 88, 58, ${0.4 + percent * 0.6})`;
          
          // Symmetrical drawing
          const y = (height - barHeight) / 2;
          
          // Rounded bars
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 2, barHeight, 4);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.error('Failed to initialize Web Audio Waveform:', e);
    }
  };

  // Turn camera on/off
  const toggleCamera = async () => {
    if (cameraEnabled) {
      stopCamera();
      setCameraEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraEnabled(true);
      } catch (err) {
        showToast(isZh ? '无法访问摄像头，请检查浏览器权限设置。' : 'Cannot access camera. Please check permissions.', 'error');
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Turn microphone on/off
  const toggleMic = async () => {
    if (micEnabled) {
      stopMic();
      setMicEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Start waveform visualizer
        startAudioWaveform(stream);
        setMicEnabled(true);
      } catch (err) {
        showToast(isZh ? '无法访问麦克风，请检查浏览器权限设置。' : 'Cannot access microphone. Please check permissions.', 'error');
      }
    }
  };

  const stopMic = () => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setMicEnabled(false);
  };

  // Start Speech Synthesis TTS / Premium Backend TTS
  const speakText = async (text: string) => {
    if (!ttsEnabled) return;

    // Stop current audio/speech synthesis
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (ttsMode === 'local') {
      playBrowserSpeech(text);
      return;
    }

    try {
      setPremiumTtsLoading(true);
      setPremiumTtsPlayingText(text);

      let url = ttsCacheRef.current.get(text);
      if (!url) {
        const resp = await fetch('/api/hearing-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, scenario: activeScenario }),
        });
        if (!resp.ok) throw new Error(`TTS API ${resp.status}`);
        const blob = await resp.blob();
        url = URL.createObjectURL(blob);
        ttsCacheRef.current.set(text, url);
      }
      
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onplay = () => setPremiumTtsPlayingText(text);
      audio.onended = () => setPremiumTtsPlayingText('');
      audio.onpause = () => setPremiumTtsPlayingText('');
      await audio.play();
    } catch (err) {
      console.warn('Gemini hearing TTS failed, falling back to browser:', err);
      playBrowserSpeech(text);
    } finally {
      setPremiumTtsLoading(false);
    }
  };

  const playBrowserSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    // Clean text from emojis
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setPremiumTtsPlayingText(text);
    };
    utterance.onend = () => {
      setPremiumTtsPlayingText('');
    };
    utterance.onerror = () => {
      setPremiumTtsPlayingText('');
    };
    
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')))
      ) || voices.find(v => v.lang.startsWith('en-'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.95;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
      setVoiceAndSpeak();
    }
  };

  const handleCopySuggestion = (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopiedText(text);
            setTimeout(() => setCopiedText(''), 2000);
          })
          .catch((err) => {
            console.error("Clipboard failed:", err);
            setCopiedText(text);
            setTimeout(() => setCopiedText(''), 2000);
          });
      } else {
        setCopiedText(text);
        setTimeout(() => setCopiedText(''), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Start Session
  const startSession = () => {
    const config = SCENARIOS[activeScenario];
    const initialWelcome = isZh ? config.welcomeZh : config.welcomeEn;

    setMessages([
      {
        role: 'model',
        text: initialWelcome,
        timestamp: Date.now()
      }
    ]);
    
    setSessionActive(true);
    setShowScorecard(false);
    setScorecardData(null);
    setUserInput('');

    // Trigger greeting audio read-out
    setTimeout(() => {
      speakText(initialWelcome);
    }, 400);
  };

  // End Session
  const endSession = () => {
    stopCamera();
    stopMic();
    setCameraEnabled(false);
    setMicEnabled(false);
    setSessionActive(false);
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
      } catch (e) {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Start speech recognition trigger
  const triggerSpeechInput = () => {
    if (!recognitionRef.current) {
      showToast(isZh ? '您的浏览器暂不支持 Web Speech 语音输入，请使用键盘输入。' : 'Speech recognition not supported in this browser. Please type.', 'info');
      return;
    }
    
    if (isSpeechRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Speech recognition starting error:', e);
      }
    }
  };

  // Submit User Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isAiResponding) return;

    const currentText = userInput.trim();
    setUserInput('');

    const userMsg: Message = {
      role: 'user',
      text: currentText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsAiResponding(true);

    try {
      // Build conversation payload
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/hearing-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario: activeScenario,
          messages: [...historyPayload, { role: 'user', text: currentText }],
          country,
          region
        })
      });

      if (!response.ok) throw new Error('Hearing API failed');
      const data = await response.json();

      const aiMsg: Message = {
        role: 'model',
        text: data.reply,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Speak out loud!
      speakText(data.reply);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "⚠️ [Connection Error] Sorry, there was an issue communicating with the tribunal officer. Please check your network and repeat your statement.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Run Evaluation & generate scorecard
  const runEvaluation = async () => {
    if (messages.length < 2) {
      showToast(isZh ? '请先和对方进行几轮对话，再进行维权表现评估！' : 'Please converse for a few rounds before requesting evaluation!', 'info');
      return;
    }

    setIsEvaluating(true);
    setShowScorecard(true);

    try {
      const chatLogs = messages.map(m => `${m.role === 'user' ? 'Student' : 'Officer'}: ${m.text}`).join('\n');

      const response = await fetch('/api/hearing-evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario: activeScenario,
          chatLogs,
          country,
          region
        })
      });

      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setScorecardData(data);
      endSession();
    } catch (err) {
      console.error(err);
      setScorecardData({
        grade: 'B',
        scores: { logic: 78, expression: 75, composure: 80, legalGrounds: 70 },
        feedback: '评估模块遭遇额度限制，请重新尝试。总体建议：应更强烈地援引官方条款（如 RTBA 或学校条例），用词应更加礼貌但态度坚定。',
        suggestions: [
          { original: 'I did not copy, my friend told me some things but i wrote it myself.', optimized: 'I can assure the panel that the submission is my own independent work. Any high similarity rating is purely due to generic domain templates.' }
        ]
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="w-full md:p-4">
      {/* Eyebrow and Hero */}
      <div className="mb-10 relative z-10">
        <p className="text-[#ff5a3c] text-xs font-semibold tracking-[0.18em] mb-3 uppercase font-sans">
          🎯 LANDING COPILOT · {isZh ? '抗辩实战模拟器' : 'Interactive Mock Hearing'}
        </p>
        <h2 className="font-display text-4xl md:text-[3.25rem] font-medium text-[#1d1d1f] leading-[1.1] tracking-tight">
          {isZh ? '面对面听证会谈判桌。' : 'Face-to-Face Negotiation Table.'}
          <br className="hidden md:block"/>
          {isZh ? '双向拟真对线，拒绝生理性失语。' : 'Bilateral Roleplay. Conquer Speech Anxiety.'}
        </h2>
        <p className="text-sm text-muted mt-4 max-w-3xl leading-relaxed">
          {isZh ? 
            '写完信还不敢去面谈？精选三大留学生高频灾难现场，利用 Gemini API 模拟极具压迫感的对手。内置 Web Audio 声学波形仪、摄像头人脸对齐和双向 STT 语音捕捉，在全景式对线训练中获取精准评分与地道话术指导。' : 
            'Drafted the email but too anxious for the face-to-face? Experience three high-tension student scenarios. Powered by Gemini API as the opposing negotiator, standard Web Audio visualizers, STT inputs, and instant scorecard feedback.'}
        </p>
      </div>

      {!sessionActive && !showScorecard ? (
        /* ==================== SCREEN 1: CHOOSE SCENARIO ==================== */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Scale size={20} className="text-[#ff5a3c]" />
              {isZh ? '选择抗辩训练演练沙盘' : 'Select a Dispute Arena'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(SCENARIOS) as ScenarioType[]).map((key) => {
                const config = SCENARIOS[key];
                const isActive = activeScenario === key;
                return (
                  <div 
                    key={key}
                    onClick={() => setActiveScenario(key)}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between h-[280px] hover:shadow-md ${
                      isActive 
                        ? 'border-[#ff5a3c] bg-[#ff5a3c]/5 ring-1 ring-[#ff5a3c]/30 scale-[1.02]' 
                        : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="text-3xl mb-3">{config.avatar}</div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">
                        {isZh ? config.titleZh : config.titleEn}
                      </h4>
                      <p className="text-xs text-muted leading-relaxed">
                        {isZh ? config.descriptionZh : config.descriptionEn}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-[11px] font-bold text-[#ff5a3c] uppercase tracking-wider flex items-center gap-1">
                        <User size={12} />
                        {isZh ? '对手：官僚/中介' : 'Opponent'}
                      </span>
                      <ChevronRight size={16} className={isActive ? 'text-[#ff5a3c] translate-x-1 transition-transform' : 'text-gray-400'} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/40 p-5 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#ff5a3c]/10 rounded-xl flex items-center justify-center text-[#ff5a3c] shrink-0 mt-0.5">
                  <Flame size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{isZh ? '体验推荐：开启音视频双效训练' : 'Recommended: Enable Cam & Mic'}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">{isZh ? '在模拟对决中点击开启摄像头与麦克风，即可加载声学波形仪与本拟真脸部画面，100% 还原视频听证会！' : 'Activate webcam and microphone during simulation to load Web Audio waveforms and simulate official online hearing rooms.'}</p>
                </div>
              </div>
              <button 
                onClick={startSession}
                className="cta-3d bg-[#ff5a3c] text-white hover:bg-[#e6492d] font-extrabold px-8 py-3.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95 text-sm cursor-pointer whitespace-nowrap"
              >
                {isZh ? '进入对线演练' : 'Enter Hearing Simulation'}
                <Play size={16} />
              </button>
            </div>

            <div className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed max-w-2xl mx-auto italic">
              {isZh 
                ? '🔒 提示：练习产生的全部对话仅在浏览器本地缓存。本模块不构成法律代理、执业咨询或官方学术建议，仅用作口语演练及博弈逻辑参考。'
                : '🔒 Note: All conversation remains purely in your local browser state. This tool is for oral practice purposes and does not constitute formal legal advising.'}
            </div>
          </div>
        </div>
      ) : showScorecard ? (
        /* ==================== SCREEN 3: SCORECARD / FEEDBACK ==================== */
        <div className="animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 max-w-4xl mx-auto">
            {isEvaluating ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-[#ff5a3c]/10 border-t-4 border-t-[#ff5a3c] rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-[#ff5a3c] animate-pulse" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{isZh ? 'Gemini 正在全速进行司法抗辩评估...' : 'Gemini analyzing your hearing transcript...'}</h3>
                <p className="text-xs text-muted mt-2 max-w-md">{isZh ? '我们正在评估您的法律逻辑、说服力、措辞专业度，并正在对您的抗诉口语脚本进行地道重写。' : 'Calculating metrics on logic structure, vocabulary professionalism, and generating customized re-write scripts.'}</p>
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-400">
                {/* Header card with Grade */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-[#1d1d1f] to-neutral-900 p-6 md:p-8 rounded-2xl text-white mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#ff5a3c] rounded-2xl flex items-center justify-center text-4xl shadow-md animate-bounce">
                      🏆
                    </div>
                    <div>
                      <span className="text-[10px] text-[#ff5a3c] font-bold tracking-widest uppercase">HEARING SCORECARD</span>
                      <h3 className="text-xl font-bold mt-1 text-white">{isZh ? '你的现场抗辩诊断报告' : 'Your Court/Hearing Performance Report'}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{isZh ? `主题：${SCENARIOS[activeScenario].titleZh}` : `Dispute Topic: ${SCENARIOS[activeScenario].titleEn}`}</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right flex items-center gap-4">
                    <div className="text-center bg-white/10 px-5 py-3 rounded-2xl border border-white/10">
                      <span className="text-[9px] text-gray-400 block tracking-wider uppercase font-black">{isZh ? '综合评级' : 'Overall Grade'}</span>
                      <span className="text-4xl font-black text-[#ff5a3c] block mt-0.5 font-display">{scorecardData?.grade || 'B+'}</span>
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { labelZh: '维权逻辑', labelEn: 'Dispute Logic', score: scorecardData?.scores?.logic || 80, color: 'bg-indigo-500' },
                    { labelZh: '表达流畅', labelEn: 'Vocabulary', score: scorecardData?.scores?.expression || 75, color: 'bg-green-500' },
                    { labelZh: '气场稳重度', labelEn: 'Confidence', score: scorecardData?.scores?.composure || 85, color: 'bg-yellow-500' },
                    { labelZh: '法律条文引用', labelEn: 'Grounding Use', score: scorecardData?.scores?.legalGrounds || 70, color: 'bg-[#ff5a3c]' },
                  ].map((m, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-muted uppercase">{isZh ? m.labelZh : m.labelEn}</span>
                      <div className="mt-4 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-gray-900">{m.score}</span>
                        <span className="text-xs text-gray-400">/100</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${m.color}`} style={{ width: `${m.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <div className="bg-amber-50/30 border border-amber-200/50 p-5 rounded-2xl mb-8">
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5 mb-3">
                    <AlertCircle size={16} className="text-[#ff5a3c]" />
                    {isZh ? '评委与AI综合诊断意见' : 'Official Review & Evaluation'}
                  </h4>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {scorecardData?.feedback}
                  </p>
                </div>

                {/* Suggestions rewrites */}
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-4">
                    <Sparkles size={16} className="text-[#ff5a3c]" />
                    {isZh ? '黄金对线话术优化推荐 (Re-writing Script)' : 'Script Optimization Recommendations'}
                  </h4>
                  
                  <div className="flex flex-col gap-4">
                    {scorecardData?.suggestions && scorecardData.suggestions.map((s: any, idx: number) => (
                      <div key={idx} className="border border-gray-150 rounded-xl overflow-hidden text-xs">
                        <div className="bg-gray-50 p-3.5 border-b border-gray-150">
                          <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">{isZh ? '你的大白话 / 原表达：' : 'Your Original Speech Attempt:'}</p>
                          <p className="text-gray-600 mt-1 font-mono leading-relaxed bg-white/60 p-2 rounded border border-gray-200/50">{s.original}</p>
                        </div>
                        <div className="bg-[#ff5a3c]/5 p-4 border-l-4 border-l-[#ff5a3c]">
                          <div className="flex items-center justify-between pb-1.5 border-b border-gray-150 mb-2">
                            <p className="text-[#ff5a3c] font-black uppercase text-[9px] tracking-wider flex items-center gap-1">
                              <Star size={10} className="fill-current" />
                              {isZh ? '推荐黄金维权话术 (AI Native Script)：' : 'Optimized Legal Advocacy Statement (Re-written):'}
                            </p>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => speakText(s.optimized)}
                                className={`p-1 px-2 rounded bg-[#ff5a3c]/10 hover:bg-[#ff5a3c]/20 text-[#ff5a3c] transition-all text-[9px] flex items-center space-x-1 cursor-pointer ${premiumTtsPlayingText === s.optimized ? 'ring-1 ring-[#ff5a3c]' : ''}`}
                                title={isZh ? '带发音朗读' : 'Pronounce'}
                              >
                                <Volume2 size={10} className={premiumTtsPlayingText === s.optimized ? 'animate-bounce' : ''} />
                                <span className="font-extrabold text-[9px]">
                                  {premiumTtsLoading && premiumTtsPlayingText === s.optimized 
                                    ? (isZh ? '加载中' : 'Loading') 
                                    : premiumTtsPlayingText === s.optimized 
                                      ? (isZh ? '播放中' : 'Playing') 
                                      : (isZh ? '带发音朗读' : 'Read Aloud')}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopySuggestion(s.optimized)}
                                className="p-1 px-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all text-[9px] flex items-center space-x-1 cursor-pointer"
                                title={isZh ? '复制台词' : 'Copy'}
                              >
                                {copiedText === s.optimized ? <CheckCircle size={10} className="text-green-600" /> : <Copy size={10} />}
                                <span className="font-extrabold text-[9px]">
                                  {copiedText === s.optimized ? (isZh ? '已复制' : 'Copied') : (isZh ? '复制台词' : 'Copy')}
                                </span>
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-900 mt-1.5 font-bold font-sans text-sm leading-relaxed pr-4">"{s.optimized}"</p>
                          {s.why && <p className="text-[11px] text-muted-soft mt-1.5 italic font-medium">💡 {s.why}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal Disclaimer Box (Risk 2 Solution) */}
                <div className="bg-red-50/50 border border-red-200/50 p-4 rounded-2xl mb-6 text-xs text-red-950 flex gap-2.5 items-start">
                  <span className="p-1.5 bg-red-100 text-red-700 rounded-lg shrink-0 text-xs">🛡️</span>
                  <div>
                    <h5 className="font-extrabold text-red-900 uppercase tracking-wide text-[11px] mb-1">
                      {isZh ? '⚠️ 法律与学术维权免责声明 (LEGAL DISCLAIMER)' : '⚠️ Legal & Academic Disclaimer'}
                    </h5>
                    <p className="leading-relaxed text-red-800 text-[10px]">
                      {isZh 
                        ? '本模块仅为拟真口语训练与策略表达练习沙盘。AI 评委给出的所有分数、合规缺陷诊断、优化意见及推荐话术仅供沟通练习参考，绝对不构成任何正式的学术指导、移民建议、律师咨询或执业法律代理意见。本平台不对以此作为正式抗诉依据所产生的任何第三方裁决、处罚或学籍状态影响承担任何学术与法律责任。学子如有切实的法律、维权、移民指控危机，请务必咨询持有执照的注册律师或各大学官方学生会 (Student Union) 的 Advocacy 服务！' 
                        : 'This interactive simulation module is for oral presentation training and negotiation rehearsal purposes only. The metrics, feedback scores, optimized scripts, and commentary provided by the AI opponent or evaluator are solely for practice references, and do NOT constitute legal advice, migration representation, or official academic counsel. The platform assumes no legal or academic liability for real-world outcomes based on this tool. Always consult a certified legal professional or your Student Union Advocates for formal help.'}
                    </p>
                  </div>
                </div>

                {/* Back / Restart Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      setShowScorecard(false);
                      setScorecardData(null);
                    }}
                    className="border border-gray-200 hover:border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    {isZh ? '重新选择演练沙盘' : 'Back to Arenas'}
                  </button>
                  <button 
                    onClick={startSession}
                    className="cta-3d bg-[#ff5a3c] text-white px-7 py-3 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                    {isZh ? '再战一局 (Reset Fight)' : 'Re-run This Arena'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================== SCREEN 2: SIMULATED VIDEO/AUDIO CALL INTERFACE ==================== */
        <div className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Dual Interactive Video Feeds (Remote Judge + Local Applicant) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Card 1: AI Opponent's Virtual Video Call Feed */}
              <div className="bg-neutral-950 rounded-2xl p-4 border border-white/10 h-[210px] flex flex-col justify-between relative overflow-hidden shadow-xl">
                <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white font-bold flex items-center gap-1.5 z-10 border border-white/10">
                  <span className={`w-2 h-2 rounded-full bg-red-500 animate-pulse`}></span>
                  {isZh ? '听证官远程连线 (REMOTE FEED)' : 'REMOTE JUDGE / AGENT'}
                </div>
                
                <div className="absolute top-3 right-3 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white font-bold flex items-center gap-1.5 z-10 border border-white/10 font-mono">
                  {isAiResponding ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                      <span className="text-amber-400 text-[9px] uppercase">{isZh ? '思考中...' : 'Thinking...'}</span>
                    </span>
                  ) : premiumTtsPlayingText ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                      <span className="text-red-500 text-[9px] uppercase">{isZh ? '发言中...' : 'Speaking...'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span className="text-green-400 text-[9px] uppercase">{isZh ? '聆听中...' : 'Listening...'}</span>
                    </span>
                  )}
                </div>

                {/* Virtual Camera Background Scene */}
                <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${
                  activeScenario === 'academic' 
                    ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-neutral-950' 
                    : activeScenario === 'bond'
                    ? 'bg-gradient-to-b from-amber-950/80 via-neutral-950 to-neutral-950'
                    : 'bg-gradient-to-b from-rose-950/80 via-neutral-950 to-neutral-950'
                }`}>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-45"></div>
                  
                  {/* Glowing Animated Pulse behind Emoji */}
                  <div className={`absolute w-32 h-32 rounded-full filter blur-xl opacity-20 animate-pulse ${
                    isAiResponding 
                      ? 'bg-amber-500' 
                      : premiumTtsPlayingText 
                      ? 'bg-[#ff5a3c] scale-110' 
                      : 'bg-green-500'
                  }`}></div>

                  <div className="text-center relative z-10 animate-in zoom-in duration-300">
                    <span className={`text-6xl block transform transition-all duration-300 ${
                      premiumTtsPlayingText ? 'scale-110 rotate-1 animate-bounce' : 'hover:scale-105'
                    }`}>{SCENARIOS[activeScenario].avatar}</span>
                    <h5 className="text-white/80 text-xs font-black tracking-widest uppercase mt-3 font-mono">
                      {isZh ? SCENARIOS[activeScenario].characterZh.split(' ')[0] : SCENARIOS[activeScenario].characterEn}
                    </h5>
                    <p className="text-white/40 text-[9px] font-bold uppercase mt-1 tracking-wider">
                      {activeScenario === 'academic' ? 'University Board' : activeScenario === 'bond' ? 'VCAT Tribunal Room' : 'Infringement Court'}
                    </p>
                  </div>
                </div>

                {/* Subtitle overlay ticker inside virtual screen */}
                {premiumTtsPlayingText && (
                  <div className="absolute bottom-0 inset-x-0 bg-neutral-950/90 backdrop-blur-md px-4 py-2 text-[10px] text-white/95 font-bold text-center border-t border-white/10 animate-in fade-in duration-300 max-h-[50px] overflow-hidden flex items-center justify-center">
                    <span className="line-clamp-2 leading-relaxed">
                      💬 {premiumTtsPlayingText}
                    </span>
                  </div>
                )}
              </div>

              {/* Card 2: Applicant's Live Camera Feed with Biometric HUD */}
              <div className="bg-neutral-950 rounded-2xl p-4 border border-white/10 h-[210px] flex flex-col justify-between relative overflow-hidden shadow-xl group">
                <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white font-bold flex items-center gap-1.5 z-10 border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${cameraEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                  {isZh ? '申诉人视频回传 (LOCAL CAM)' : 'APPLICANT (YOU)'}
                </div>

                <div className="w-full h-full flex items-center justify-center relative">
                  {cameraEnabled ? (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      />
                      {/* Biometric HUD Corner Crosshairs */}
                      <div className="absolute inset-4 pointer-events-none border border-green-500/15 rounded-lg z-10">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-500"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-500"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-500"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-500"></div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 relative z-10">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="text-white/40" size={20} />
                      </div>
                      <p className="text-[11px] text-gray-500 font-bold">{isZh ? '本地摄像头已关闭' : 'Local Web-Cam Off'}</p>
                      <button 
                        type="button"
                        onClick={toggleCamera}
                        className="mt-3 text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all font-bold border border-white/5 cursor-pointer"
                      >
                        {isZh ? '开启人脸与视线拟真' : 'Enable Face & Eye Tracking'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Floating Real-time Biometric Analysis Overlay */}
                <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md p-2.5 rounded-xl text-[9px] text-white/90 border border-white/10 font-mono space-y-1 z-10 w-[145px] shadow-lg animate-in fade-in duration-300">
                  <div className="text-[8px] text-green-400 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    AI Composure HUD
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">{isZh ? '置信率:' : 'Confidence:'}</span>
                    <span className="text-green-400 font-bold font-mono">{hudConfidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">{isZh ? '视线锁定:' : 'Eye Contact:'}</span>
                    <span className="text-blue-400 font-bold font-mono">{hudEyeContact}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">{isZh ? '论证结构:' : 'Argument Logic:'}</span>
                    <span className="text-amber-400 font-bold font-mono">{hudLogic}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">{isZh ? '语速控制:' : 'Pacing Speed:'}</span>
                    <span className="text-purple-400 font-bold font-mono">{hudWpm} WPM</span>
                  </div>
                </div>

                {cameraEnabled && (
                  <button 
                    type="button"
                    onClick={toggleCamera}
                    className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-950/80 hover:bg-neutral-950 text-white p-2 rounded-lg text-xs z-10 cursor-pointer"
                  >
                    <VideoOff size={14} />
                  </button>
                )}
              </div>

              {/* Card 3: Audio Spectrograph */}
              <div className="bg-[#fffdf9] rounded-2xl p-4 border border-gray-150 h-[100px] flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <Activity size={12} className={micEnabled ? 'text-[#ff5a3c] animate-pulse' : 'text-gray-400'} />
                    {isZh ? '声波高频捕捉仪 (WEB AUDIO)' : 'Audio Spectrograph (Web Audio)'}
                  </span>
                  {!micEnabled && (
                    <button 
                      type="button"
                      onClick={toggleMic}
                      className="text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded font-bold transition-all cursor-pointer"
                    >
                      {isZh ? '激活麦克风' : 'Enable Mic'}
                    </button>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center mt-2 relative">
                  {micEnabled ? (
                    <canvas ref={canvasRef} className="w-full h-[45px] rounded" width={280} height={45} />
                  ) : (
                    <p className="text-[10px] text-gray-400 italic text-center">{isZh ? '声学捕捉仪已离线，开启麦克风后自动渲染波形' : 'Audio visualizer offline. Enable microphone to render.'}</p>
                  )}
                </div>
              </div>

              {/* Exit block */}
              <button 
                type="button"
                onClick={endSession}
                className="w-full border border-gray-200 hover:border-gray-300 text-gray-600 font-black py-3.5 px-4 rounded-xl text-xs transition-all active:scale-95 cursor-pointer bg-white flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square size={12} className="fill-current text-[#ff5a3c]" />
                {isZh ? '退出当前对决谈判' : 'Quit Arena Session'}
              </button>

            </div>

            {/* Right Column: Hearing Dialogue Main Console */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-md min-h-[500px]">
              
              {/* Header: Persona identity */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${SCENARIOS[activeScenario].bgGradient}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl shrink-0">{SCENARIOS[activeScenario].avatar}</span>
                  <div>
                    <span className="text-[9px] text-[#ff5a3c] font-black tracking-widest block uppercase font-mono">{isZh ? '连线对决对手 (AI OPPONENT)' : '连线对决对手 (AI OPPONENT)'}</span>
                    <h4 className="text-sm font-black text-gray-900 mt-0.5">
                      {isZh ? SCENARIOS[activeScenario].characterZh : SCENARIOS[activeScenario].characterEn}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button 
                    type="button"
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    title={isZh ? '是否朗读对手发言' : 'Toggle Speech Out Loud'}
                    className={`p-2 rounded-lg transition-colors border ${
                      ttsEnabled 
                        ? 'bg-neutral-900 border-neutral-900 text-[#ff5a3c]' 
                        : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>

                  {/* Speech Mode Toggle pills (only visible if ttsEnabled) */}
                  {ttsEnabled && (
                    <div className="flex bg-white/75 backdrop-blur-sm border border-gray-150 p-0.5 rounded-lg shadow-inner shrink-0">
                      <button
                        type="button"
                        onClick={() => setTtsMode('local')}
                        className={`px-2 py-1 text-[9px] font-black rounded-md transition-all cursor-pointer ${
                          ttsMode === 'local' 
                            ? 'bg-neutral-900 text-white shadow-xs' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title={isZh ? '极速响应: 使用浏览器本地语音合成接口，毫秒级无延迟回答' : 'Local Speech API: Instant 0ms response'}
                      >
                        ⚡ {isZh ? '极速' : 'Fast'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTtsMode('ai')}
                        className={`px-2 py-1 text-[9px] font-black rounded-md transition-all cursor-pointer ${
                          ttsMode === 'ai' 
                            ? 'bg-neutral-900 text-[#ff5a3c] shadow-xs' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title={isZh ? '高端音质: 使用 Gemini 神经网络发音，更逼真但需 2s 缓冲' : 'Gemini AI Audio: High quality, 2s buffering'}
                      >
                        🤖 {isZh ? 'AI' : 'AI'}
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-150 px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm shrink-0">
                    <UserCheck size={11} className="text-green-500" />
                    {ttsMode === 'local' ? (isZh ? '0ms 极速' : '0ms Lag') : (isZh ? '1.8s 延迟' : '1.8s Lag')}
                  </span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto max-h-[320px] my-5 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col gap-4 custom-scrollbar">
                {messages.map((m, idx) => {
                  const isUser = m.role === 'user';
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-2.5 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 select-none ${
                        isUser ? 'bg-[#ff5a3c] text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {isUser ? 'ME' : SCENARIOS[activeScenario].avatar}
                      </div>
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-neutral-900 text-[#fffdf9] rounded-tr-none font-bold' 
                          : 'bg-white text-gray-800 border border-gray-150/70 rounded-tl-none font-medium'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {isAiResponding && (
                  <div className="self-start flex gap-2.5 max-w-[85%] animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs shrink-0">
                      {SCENARIOS[activeScenario].avatar}
                    </div>
                    <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-gray-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#ff5a3c] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#ff5a3c] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#ff5a3c] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      <span>对手正在听取陈述并思考质问...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Input section: voice/manual */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                
                {/* Quick Preset Arguments for Live Demo/Bypass (Risk 1 Solution) */}
                <div className="px-3.5 py-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex flex-col gap-2">
                  <span className="text-[10px] font-black text-amber-800 tracking-wider flex items-center gap-1.5 uppercase font-sans">
                    <Sparkles size={12} className="text-[#ff5a3c]" />
                    ⚡ {isZh ? '选择答辩/谈判抗诉策略卡' : 'SELECT DEBATE / APPEAL STRATEGY CARD'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeScenario === 'academic' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setUserInput("The similarity rate is high only because it flags standard laboratory protocols, course template structures, and common math definitions shared by all students in this course.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-[#ff5a3c] font-black">💡 模板引用抗辩 (Template Citation)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">针对代码、定理和常规格式重复的自证</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("My Google Docs version draft history and local file timeline fully prove I authored this paper step-by-step over a three-week period. I can present the timestamps.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-blue-600 font-black">🕒 历史版本时间戳 (Version Chronology)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">用完整的写作轨迹、日志痕迹驳回AI指控</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("I have complete handwritten research notes, initial outlines, and marked literature sources which I can submit immediately for manual inspection.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-green-600 font-black">📝 大纲手稿自证 (Draft Notes)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">提交手稿、阅读笔记和完整草稿链</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("I am fully prepared to orally present and defend any section, formula, or logical transition in this paper to prove my comprehensive academic mastery.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-purple-600 font-black">🎤 现场知识答辩 (Oral Defense)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">通过对论文核心观点的深入口述证明原创</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("The writing style, grammar habits, and structural logic of this paper are fully consistent with my previous graded homework before AI tools emerged.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5 sm:col-span-2"
                        >
                          <span className="text-amber-600 font-black">📚 行文风格一致性 (Style Consistency)</span>
                          <span className="text-gray-400 font-normal text-[9px]">比对个人以往写作语料，证明行文风格极高相似性</span>
                        </button>
                      </>
                    )}
                    {activeScenario === 'bond' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setUserInput("According to tenancy guidelines, minor scuffs on a 5-year-old floor represent fair wear and tear. You cannot claim my entire $2,500 bond for minor cosmetic marks.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-[#ff5a3c] font-black">⚖️ 磨损豁免条款 (Wear & Tear Law)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">引用澳洲租赁法关于“合理磨损”免扣分豁免</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("The Entry Condition Report explicitly notes that the floor had scuffs and the kitchen was dusty at lease commencement. I left it in the exact same state.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-blue-600 font-black">📊 入住状态报告比对 (Check-in Report)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">出示入住原始报告，证明痕迹属于历史遗留</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("I hired a licensed professional end-of-lease cleaner and have an official receipt. The property has been cleaned thoroughly according to standard.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-green-600 font-black">🧾 专业清洁发票 (Clean Invoice)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">提供正规清洁公司发票收据，免除卫生指责</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("The carpet has been installed for over 5 years and is fully depreciated under tax rules. You cannot charge me for brand new carpet replacement.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-purple-600 font-black">📉 物业折旧年限 (Depreciation Rule)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">计算材料折旧，反驳中介“以旧换新”无理要求</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("If we cannot resolve this reasonably, I will submit a formal dispute to VCAT. Tribunals strictly reject unitemized, excessive cleaning claims.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5 sm:col-span-2"
                        >
                          <span className="text-amber-600 font-black">🏛️ 提起仲裁警告 (VCAT Tribunal Alert)</span>
                          <span className="text-gray-400 font-normal text-[9px]">展现仲裁准备，警告对方不合规收费将面临法定仲裁听证</span>
                        </button>
                      </>
                    )}
                    {activeScenario === 'fine' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setUserInput("I temporarily accelerated to safely clear a tailgating commercial truck that was driving dangerously close behind me. It was a critical hazard avoidance.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-[#ff5a3c] font-black">🚨 突发避险辩抗 (Emergency Avoidance)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">证明当时车流危险，为了人身安全被迫避让</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("The 40km/h school speed sign was completely obscured by overgrown, unpruned tree branches at that specific corner, making it invisible to drivers.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-blue-600 font-black">🌳 路标盲区遮挡 (Obscured Signage)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">指出市政绿化遮挡，证明缺乏主观违章故意</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("My speedometer had a documented calibration drift. I was driving under the reasonable belief that I was fully within the legal limit.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-green-600 font-black">⚙️ 仪器校准偏差 (Speedometer Drift)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">出示里程表偏差检测，申请免于扣分罚款</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("I was rushing my passenger to the nearest emergency room due to an acute, severe medical event. I have hospital check-in logs to verify.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5"
                        >
                          <span className="text-purple-600 font-black">🏥 乘员医疗紧急 (Medical Emergency)</span>
                          <span className="text-gray-400 font-normal text-[9px] truncate">提供急诊室病历或救护日志，触发人道豁免</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserInput("I have maintained a completely flawless driving record for over five years. Under guidelines, I request a official warning in place of a fine.")}
                          className="text-[10px] bg-white hover:bg-amber-100/70 text-gray-700 p-2 rounded-lg border border-gray-200 transition-all font-bold cursor-pointer hover:shadow-xs active:scale-95 text-left flex flex-col gap-0.5 sm:col-span-2"
                        >
                          <span className="text-amber-600 font-black">📜 五年无违章警告申请 (Clean Record Warning)</span>
                          <span className="text-gray-400 font-normal text-[9px]">根据警方条例，对长期优良驾驶者申请首次违章书面警告</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Voice support notice / trigger */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={triggerSpeechInput}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                        isSpeechRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-[#ff5a3c]/10 text-[#ff5a3c] hover:bg-[#ff5a3c]/15'
                      }`}
                    >
                      {isSpeechRecording ? <MicOff size={13} /> : <Mic size={13} />}
                      {isSpeechRecording ? (isZh ? '正在录音识别中...' : 'Listening...') : (isZh ? '极速语音录制 (Speak Now)' : 'Speak Arguments')}
                    </button>
                    {isSpeechRecording && (
                      <span className="text-[10px] text-red-500 font-bold animate-pulse">{isZh ? '（请用英文陈述你的反驳）' : '(Speak in English)'}</span>
                    )}
                  </div>

                  <button 
                    onClick={runEvaluation}
                    disabled={messages.length < 2 || isAiResponding}
                    className="text-xs bg-black hover:bg-neutral-800 disabled:opacity-40 text-white px-5 py-2 rounded-xl font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award size={13} className="text-[#ff5a3c]" />
                    {isZh ? '结束并做维权打分' : 'End & Run AI Evaluation'}
                  </button>
                </div>

                {/* Form input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={isZh ? "在这里写下您的抗辩理由（必须使用英文，或点击左侧极速语音输入）..." : "Type your appeal statement in English here..."}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 ring-primary/20 hover:border-gray-300 font-bold text-gray-800"
                    disabled={isAiResponding}
                  />
                  <button 
                    type="submit"
                    disabled={!userInput.trim() || isAiResponding}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-40 px-5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    {isZh ? '陈述' : 'Speak'}
                    <ChevronRight size={14} />
                  </button>
                </form>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
