import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, CheckCircle2, ArrowRight, Mail, AlignLeft, ExternalLink, Info, X, Eye, FileText, Globe, Calendar, Settings, Smile, UserCheck, Plus, Trash2 } from 'lucide-react';
import { renderDocumentHTML } from './DocumentRenderer';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { saveExtractedTasks, KanbanTask } from '../lib/kanbanService';
import Markdown from 'react-markdown';
import { useLocale, getCountryContent, getDefaultVisa } from '../lib/locale';
import { useT } from '../lib/i18n';
import GroundingSources from './GroundingSources';

type AppState = 'upload' | 'analyzing' | 'result' | 'sent';

interface AnalysisResult {
  type: string;
  summary: string;
  painConversion: string;
  actionPlan: string[];
  englishDraft: {
    intention: string;
    recipientEmail: string;
    subject: string;
    body: string;
    chineseTranslation: string;
  };
  // New structured fields
  documentType?: string;
  issuer?: {
    name: string;
    isOfficial: boolean;
  };
  summaryPlain?: string;
  deadline?: {
    date: string;
    time: string;
    businessDaysLeft: number;
  };
  amount?: {
    value: number;
    currency: string;
  };
  consequenceIfIgnored?: string;
  requiredActions?: {
    step: string;
    officialChannel: string;
    url: string;
  }[];
  userRights?: {
    claim: string;
    legalBasis: string;
    sourceUrl: string;
  }[];
  riskLevel?: 'low' | 'medium' | 'high' | string;
  confidence?: 'low' | 'medium' | 'high' | string;
  needsHumanConfirmation?: boolean;
  disclaimer?: string;
  isQuotaFallback?: boolean;
}

const CASE_GUIDES: Record<string, {
  title: string;
  org: string;
  amount: string;
  deadline: string;
  difficulty: string;
  summary: string;
  tips: string[];
  groundingSources: { label: string; url: string }[];
}> = {
  fine: {
    title: '城市维权：市政道路停车罚单申诉',
    org: 'City of Brentmoor (虚构市政厅)',
    amount: '$85.00 AUD',
    deadline: '2026年5月1日前缴纳或发起复议',
    difficulty: '⭐ (低，极易豁免警告)',
    summary: '收到 City of Brentmoor 市政厅开出的停车漏缴罚单，指控红色的丰田 Corolla 车辆（车牌 ABC-123）在 Flinders Lane 禁停路段违规逗留。',
    tips: [
      '过去3年驾驶表现良好、无违章记录，可向市政厅书面申请将罚单酌情改发非罚款性的“Official Warning”（初犯警告减免机制）。',
      '如因紧急避险、车辆故障抛锚或人道主义急病就医等无抗力导致违停，可提供 RACV 道路救援单或医院急诊假条，此类复议撤销率极高。',
      '若现场的“禁停/限时”标识被繁茂树枝遮挡，或者地面标线严重剥落不清，拍照取证后可作为强有力的法定权利抗辩。'
    ],
    groundingSources: [
      { label: 'Melbourne City Council Parking Fines Review Guide', url: 'https://www.melbourne.vic.gov.au/parking-infringements' },
      { label: 'Fines Victoria Official Internal Review Application', url: 'https://online.fines.vic.gov.au/Request-a-review' }
    ]
  },
  coe: {
    title: '学术存续：大学停学与CoE取消意向（Show Cause）',
    org: 'Westhaven University, Melbourne (虚构大学)',
    amount: '面临学籍开除及学费损失',
    deadline: '自收到信起20个工作日内提交学术申诉（2026年7月20日前）',
    difficulty: '⭐⭐⭐⭐ (高，签证吊销高危)',
    summary: '因第一学期挂科率达到100%，或者连续学期未达到最低学术进展，Westhaven University 拟对李伟臣同学作出终止学籍处分，并将取消其 CoE 签证入学确认函。',
    tips: [
      '必须在20个工作日的严苛法定期限内提交书面学术抗辩！逾期学校将直接上报移民局，学生签证将进入取消阶段。',
      '需详实搜集“同理怜悯性因素”（Compassionate & Compelling）证据，例如突发生病、心理抑郁（附澳洲医生执业证明与医学诊断报告）、直系亲属重大难测事件。',
      '草拟一份可行的“成绩重振及格计划书（Study Plan）”，附带辅导预约记录，明确向学术进展委员会自证有能力在下学期纠偏并步入正轨。'
    ],
    groundingSources: [
      { label: 'Australian Dept of Education (ESOS Framework Standards)', url: 'https://www.education.gov.au/esos-framework' },
      { label: 'Department of Home Affairs Student Visa (Subclass 500) Conditions', url: 'https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/see-your-visa-conditions?product=500' }
    ]
  },
  bond: {
    title: '租务维权：中介扣留租约押金纠纷',
    org: 'Horizon Residential VIC (虚构房屋中介房东)',
    amount: '$420.00 AUD (拟扣押金额)',
    deadline: '2026年7月14日下午5:00前 (10个工作日内)',
    difficulty: '⭐⭐ (中，依靠法定条款易悉数索回)',
    summary: '租客 Alex Thompson 结束 4/85 Bourke Street 租期后，中介 Horizon 提议扣除 $420 押金，原因为地毯蒸汽清洁费 $180、厨房瓷砖去油污 $90 以及客厅墙面挂痕刮花 $150。',
    tips: [
      '地毯清洁法定规范：根据维州《住宅租赁法 RTA》，除非租客留下超出正常范畴的顽固污渍，中介通常无法强制要求专业级蒸汽清洗。合理磨损（Fair Wear and Tear）属于租客受法律保护的法定权利。',
      '墙面轻度损伤界定：由于日常居住使用留下的细微刮花、轻度磨损，在法律层面完全归为合理折旧，房东通常无权转嫁此项修缮费。',
      '主动线上发起反弹：登录 RTBA 押金系统主动单方面申请“全额返还押金 (Claim Entire Bond)”。在此机制下，中介如果不同意，必须在14天内向 VCAT 发起诉讼维权自证，否则押金将自动被主张释放给租客。VCAT 为第三方民事仲裁庭，双方需举证，并非自动全退，但中介常因繁琐及自证困难选择协商和解。'
    ],
    groundingSources: [
      { label: 'Consumer Affairs Victoria Official Rental Bond Guide', url: 'https://www.consumer.vic.gov.au/housing/renting' },
      { label: 'RTBA Victoria (Residential Tenancies Bond Authority)', url: 'https://rentalbonds.vic.gov.au/' },
      { label: 'VCAT Residential Tenancies Disputes Portal', url: 'https://www.vcat.vic.gov.au/case-types/residential-tenancies' }
    ]
  },
  plagiarism: {
    title: '学术防卫：课业学术诚信剽窃疑云（Integrity Allegation）',
    org: 'Westhaven University (虚构大学学术诚信委员会)',
    amount: '阶段性课业0分 / 挂科警告',
    deadline: '2026年6月28日前确认出席，7月3日正式答辩',
    difficulty: '⭐⭐⭐⭐⭐ (极高，触碰合规底线)',
    summary: 'Sarah Chen 同学的 ECON101 经济学作业 Assignment 2 被指控论文库及在线源高度重合48%，涉嫌学术不诚实写作。',
    tips: [
      '收集保存您完整的电脑本地草稿演化线。例如 Word 的修改痕迹历史、Git 递交提交链、平时手写思路图、查阅的 Lecture 纸张。',
      '厘清“抄袭”与“参考引用”两者的差异。如果是引用不规范造成的漏引或拼写格式问题，可在听证中坚称是学术编撰失误（Non-intentional Academic Misconduct），从而使指控降为警告。',
      '可以免费指派校内独立的“Student Advocate”（学生学术权益官）全程陪同听证。他们能扮演你的专业顾问把关话术。'
    ],
    groundingSources: [
      { label: 'TEQSA National Academic Integrity Best Practice Toolkit', url: 'https://www.teqsa.gov.au/guides-resources/resources/academic-integrity/academic-integrity-toolkit' },
      { label: 'Australian Student Study Assist Resources Helpline', url: 'https://www.studyassist.gov.au/' }
    ]
  },
  noise: {
    title: '社区相处：邻里深夜社交噪音违禁警告',
    org: 'Meridian Strata Management VIC (虚构物业管理)',
    amount: '警告，若重犯面临 VCAT 禁力和罚金',
    deadline: '2026年7月6日前书面回邮抗辩（自收到信14日内）',
    difficulty: '⭐ (低，调整作息易归于相安无事)',
    summary: '88 Flinders Lane 4B 单元的住户因过去四周内多次在 22:00 之后大分贝播放音响、高声社交，遭到 Owners Corporation 业主委员会多方联名投诉，下达违禁整顿通知。',
    tips: [
      '法定安静时段界定：澳洲各州对住宅区噪音制定了严厉法规。工作日夜晚 22:00 / 23:00 至次日上午 07:05 属于强制肃静期，不可制造影响邻里休息的破坏性噪声音量。',
      '此文主要为正式警示（Breach Notice）。建议态度温和诚恳，在期限内书面回复物业，解释情况并承诺后续严格注意防噪减震，以温和态度达成和解撤诉。'
    ],
    groundingSources: [
      { label: 'EPA Victoria Community Noise Legislation Guide', url: 'https://www.epa.vic.gov.au/for-community/environmental-information/noise' },
      { label: 'Victoria Consumer Strata By-Laws Enforcement Rules', url: 'https://www.consumer.vic.gov.au/housing/owners-corporations' }
    ]
  },
  utility: {
    title: '民生防卫：水电能源逾期与准断能驱逐通知',
    org: 'Coastal Energy & Water (虚构公用事业单位)',
    amount: '$258.30 AUD (账单逾期含滞纳金)',
    deadline: '2026年7月1日前阻断并产生连接费机制',
    difficulty: '⭐ (低，可瞬间申请无息账单延期)',
    summary: 'Mrs. Eleanor Vance 账户 9876 543 210 存在两重周期的水电欠费 $258.30，接获断水/断电高危通知。',
    tips: [
      '受强力民生人道保护：法律严禁公用事业服务商在极端温度季节、周末、节假日前夕切断家庭的生活能源负荷。',
      '立刻拨打账单页面的专线或登录平台点击加入“Hardship Program”（特殊困难人群救助计划）。一旦提出，利息、滞纳金会被免除，且依法强制获得最少 12-24 个月的小额免息分期权。',
      '还可以由服务商协助向各州政府代申领几百刀一户的公共能源灾害补贴（如 Utility Relief Grant Scheme VIC），可一次性全额冲抵 or 大额冲减所欠账目。'
    ],
    groundingSources: [
      { label: 'Energy & Water Ombudsman Victoria (EWOV) Dispute Hub', url: 'https://www.ewov.com.au/' },
      { label: 'Victorian Government Utility Relief Grant Scheme (URGS)', url: 'https://www.services.dffh.vic.gov.au/utility-relief-grant-scheme' }
    ]
  }
};

interface LiveDemoProps {
  user: User | null;
  accessToken: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onSendEmail: (recipient: string, subject: string, body: string) => Promise<void>;
}

export default function LiveDemo({ user, accessToken, onLogin, onLogout, onSendEmail }: LiveDemoProps) {
  const { country, language, region } = useLocale();
  const t = useT();
  const content = getCountryContent(country);
  const [appState, setAppState] = useState<AppState>('upload');
  const [claimMode, setClaimMode] = useState<'single' | 'cross'>('single');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [draftBody, setDraftBody] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  
  // User Profile States for Personalized Memory
  const [profileVisaType, setProfileVisaType] = useState('');
  const [profileSchool, setProfileSchool] = useState('');
  const [profileLeaseKeyTerms, setProfileLeaseKeyTerms] = useState('');
  const [profileAdditionalDetails, setProfileAdditionalDetails] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [showProfileWidget, setShowProfileWidget] = useState(false);

  // Load user profile on mount or user change
  useEffect(() => {
    const loadProfile = async () => {
      // First try localStorage
      const local = localStorage.getItem('serene_user_profile');
      if (local) {
        try {
          const data = JSON.parse(local);
          setProfileVisaType(data.visaType || '');
          setProfileSchool(data.school || '');
          setProfileLeaseKeyTerms(data.leaseKeyTerms || '');
          setProfileAdditionalDetails(data.additionalDetails || '');
        } catch (e) {
          console.error("Local profile parse failed", e);
        }
      }

      // If user is logged in, sync from Firestore
      if (user) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const docRef = doc(db, 'userProfiles', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileVisaType(data.visaType || '');
            setProfileSchool(data.school || '');
            setProfileLeaseKeyTerms(data.leaseKeyTerms || '');
            setProfileAdditionalDetails(data.additionalDetails || '');
            // update local copy
            localStorage.setItem('serene_user_profile', JSON.stringify(data));
          }
        } catch (error) {
          console.error("Error loading profile from Firestore:", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);
    const profileData = {
      uid: user?.uid || 'guest',
      visaType: profileVisaType,
      school: profileSchool,
      leaseKeyTerms: profileLeaseKeyTerms,
      additionalDetails: profileAdditionalDetails,
      updatedAt: Date.now()
    };

    // Save to localStorage
    localStorage.setItem('serene_user_profile', JSON.stringify(profileData));

    // If logged in, persist securely to Firestore
    if (user) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'userProfiles', user.uid);
        await setDoc(docRef, profileData);
        console.log("Profile synchronized with Firestore successfully.");
      } catch (error) {
        console.error("Failed to synchronize profile with Firestore:", error);
      }
    }

    setIsSavingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => {
      setProfileSaveSuccess(false);
    }, 2500);
  };
  
  // New States for HD Previews, active presets, and "More Info"
  const [activeCase, setActiveCase] = useState<'fine' | 'coe' | 'bond' | 'plagiarism' | 'noise' | 'utility' | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [kanbanTasks, setKanbanTasks] = useState<{ id: string; step: string; status: 'todo' | 'done'; channel?: string; url?: string }[]>([]);
  
  // Cross mode states
  const [crossFileA, setCrossFileA] = useState<File | null>(null);
  const [crossPreviewA, setCrossPreviewA] = useState<string | null>(null);
  const [crossFileB, setCrossFileB] = useState<File | null>(null);
  const [crossPreviewB, setCrossPreviewB] = useState<string | null>(null);
  const [activeCrossPreset, setActiveCrossPreset] = useState<'bond_cross' | null>(null);
  const [crossAnalysis, setCrossAnalysis] = useState<any | null>(null);
  const [currentAgentStep, setCurrentAgentStep] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const crossFileInputRefA = useRef<HTMLInputElement>(null);
  const crossFileInputRefB = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setActiveCase(null); // Clear preset case when manually uploading
    }
  };

  const handleCrossFileSelectA = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setCrossFileA(selectedFile);
      setCrossPreviewA(URL.createObjectURL(selectedFile));
      setActiveCrossPreset(null);
    }
  };

  const handleCrossFileSelectB = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setCrossFileB(selectedFile);
      setCrossPreviewB(URL.createObjectURL(selectedFile));
      setActiveCrossPreset(null);
    }
  };

  const toggleTaskStatus = (id: string) => {
    setKanbanTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t));
  };

  const loadExample = async (type: 'fine' | 'coe' | 'bond' | 'plagiarism' | 'noise' | 'utility') => {
    setActiveCase(type);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 800);
    ctx.fillStyle = '#000000';
    ctx.font = '24px sans-serif';
    
    if (type === 'fine') {
      ctx.fillStyle = '#1d1d1f';
      ctx.fillRect(0, 0, 600, 15); // visual bar
      ctx.fillStyle = '#000000';
      ctx.fillText('CITY COUNCIL', 50, 100);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('INFRINGEMENT NOTICE', 50, 150);
      ctx.font = '24px sans-serif';
      ctx.fillText('Date: 21 Nov 2023', 50, 220);
      ctx.fillText('AMOUNT DUE: $385.00', 50, 270);
      ctx.fillText('OFFENCE: Parking in permit zone', 50, 320);
      ctx.fillText('Please pay within 14 days to avoid penalty.', 50, 420);
    } else if (type === 'coe') {
      ctx.fillStyle = '#ff5a3c';
      ctx.fillRect(0, 0, 600, 15); // visual bar
      ctx.fillStyle = '#000000';
      ctx.fillText('UNIVERSITY ADMINISTRATION', 50, 100);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('INTENTION TO CANCEL ENROLMENT', 50, 150);
      ctx.font = '24px sans-serif';
      ctx.fillText('Dear Student,', 50, 250);
      ctx.fillText('Due to unsatisfactory academic progress,', 50, 300);
      ctx.fillText('your CoE will be cancelled in 20 days.', 50, 350);
      ctx.fillText('You have the right to appeal.', 50, 400);
    } else if (type === 'bond') {
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(0, 0, 600, 15); // visual bar
      ctx.fillStyle = '#000000';
      ctx.fillText('EXCEL REAL ESTATE SERVICES', 50, 100);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('NOTICE OF BOND CLAIM', 50, 150);
      ctx.font = '24px sans-serif';
      ctx.fillText('Bond Reference: BX-9921', 50, 220);
      ctx.fillText('DEDUCTION CLAIMED: $650.00', 50, 270);
      ctx.fillText('Reason: Professional steam cleaning of carpet required', 50, 320);
      ctx.fillText('along with minor repairs to living room walls.', 50, 370);
      ctx.fillText('Please respond in 7 days or we will lodge.', 50, 470);
    } else if (type === 'plagiarism') {
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(0, 0, 600, 15); // visual bar
      ctx.fillStyle = '#000000';
      ctx.fillText('FACULTY OF SCIENCE & TECHNOLOGY', 50, 100);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('ACADEMIC INTEGRITY INQUIRY', 50, 150);
      ctx.font = '24px sans-serif';
      ctx.fillText('Dear student,', 50, 220);
      ctx.fillText('An allegation of plagiarism has been made regarding', 50, 270);
      ctx.fillText('your COMP3300 Assignment 2 submission.', 50, 320);
      ctx.fillText('A similarity index of 48% was detected.', 50, 370);
      ctx.fillText('You must submit a response or attend a hearing.', 50, 420);
    } else if (type === 'noise') {
      ctx.fillStyle = '#10B981';
      ctx.fillRect(0, 0, 600, 15); // visual bar
      ctx.fillStyle = '#000000';
      ctx.fillText('CITY ENVIRONMENTAL PROTECTION AGENCY', 50, 100);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('OFFICIAL WARNING: NOISE DISTURBANCE', 50, 150);
      ctx.font = '24px sans-serif';
      ctx.fillText('To Resident at Flat 4C / 12 Barkly St', 50, 220);
      ctx.fillText('We have received verified community complaints regarding', 50, 270);
      ctx.fillText('excessive music and loud bass sounds after 11:30 PM.', 50, 320);
      ctx.fillText('Further breaches may result in $500 penalty notices.', 50, 370);
    } else if (type === 'utility') {
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(0, 0, 600, 15); // visual bar
      ctx.fillStyle = '#000000';
      ctx.fillText('ORIGIN ENERGY SERVICES', 50, 100);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('OVERDUE PAYMENT & DISCONNECTION WARNING', 50, 150);
      ctx.font = '24px sans-serif';
      ctx.fillText('Account Number: 1002-3994', 50, 220);
      ctx.fillText('TOTAL OUTSTANDING: $421.50', 50, 270);
      ctx.fillText('Due Date: 12 Dec 2023', 50, 320);
      ctx.fillText('If you are experiencing hardship, please contact', 50, 370);
      ctx.fillText('our support team immediately to request extension.', 50, 420);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
         const file = new File([blob], `${type}.png`, { type: 'image/png' });
         setFile(file);
         setFilePreview(URL.createObjectURL(file));
      }
    });
  };

  const submitForAnalysis = async () => {
    if (claimMode === 'single') {
      if (!file) return;
      setAppState('analyzing');
      setCurrentAgentStep(1);
      try {
        const formData = new FormData();
        formData.append('image', file);
        if (activeCase) {
          formData.append('activeCase', activeCase);
        }
        
        // Append user profile for personalized memory context
        formData.append('visaType', profileVisaType || getDefaultVisa(country, language));
        formData.append('school', profileSchool);
        formData.append('leaseKeyTerms', profileLeaseKeyTerms);
        formData.append('additionalDetails', profileAdditionalDetails);
        formData.append('country', country);
        formData.append('language', language);
        formData.append('region', region);

        const res = await fetch('/api/analyze-bill', {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) throw new Error('Analysis failed');
        
        const data: AnalysisResult = await res.json();

        // High fidelity Agentic progress animation sequencing
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(2);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(3);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(4);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(5);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setAnalysis(data);
        setDraftBody(data.englishDraft.body);
        if (data.englishDraft.recipientEmail) {
          setRecipient(data.englishDraft.recipientEmail);
        }
        setCurrentTranslation(data.englishDraft.chineseTranslation);
        
        // Populate and save persistent kanban tasks across all letters
        const tasksToSave = data.requiredActions && Array.isArray(data.requiredActions) 
          ? data.requiredActions 
          : (data.actionPlan && Array.isArray(data.actionPlan) 
              ? data.actionPlan.map(act => ({ step: act })) 
              : []);
        
        if (tasksToSave.length > 0) {
          const finalSubject = data.englishDraft?.subject || (activeCase ? `对线案例 - ${activeCase}` : '未知公来函');
          const savedTasks = await saveExtractedTasks(
            tasksToSave, 
            finalSubject, 
            data.deadline?.date,
            data.riskLevel
          );
          setKanbanTasks(savedTasks.map(t => ({
            id: t.id,
            step: t.title,
            status: t.status,
            channel: t.channel,
            url: t.url
          })));
        } else {
          setKanbanTasks([]);
        }

        setAppState('result');
        
        // Save to draft history
        const currentHistoryStr = localStorage.getItem('serene_draft_history');
        const history = currentHistoryStr ? JSON.parse(currentHistoryStr) : [];
        history.push({
          id: Date.now().toString(),
          timestamp: Date.now(),
          subject: data.englishDraft.subject,
          body: data.englishDraft.body,
          recipientEmail: data.englishDraft.recipientEmail || ''
        });
        localStorage.setItem('serene_draft_history', JSON.stringify(history));
      } catch (err) {
        console.error(err);
        alert('解析失败，请重试');
        setAppState('upload');
      }
    } else {
      // CROSS MODE CO-OBJECTION
      if (!crossFileA && !crossFileB && !activeCrossPreset) {
        alert("请上传租房合同及扣款声明，或者载入高能大招演示。");
        return;
      }
      setAppState('analyzing');
      setCurrentAgentStep(1);
      try {
        const formData = new FormData();
        if (crossFileA) formData.append('images', crossFileA);
        if (crossFileB) formData.append('images', crossFileB);
        if (activeCrossPreset) {
          formData.append('activeCrossPreset', activeCrossPreset);
        }
        
        // Append user profile for personalized memory context
        formData.append('visaType', profileVisaType);
        formData.append('school', profileSchool);
        formData.append('leaseKeyTerms', profileLeaseKeyTerms);
        formData.append('additionalDetails', profileAdditionalDetails);
        formData.append('country', country);
        formData.append('language', language);
        formData.append('region', region);

        const res = await fetch('/api/cross-reference', {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) throw new Error('Cross reference analysis failed');
        
        const data = await res.json();

        // High fidelity Agentic progress animation sequencing
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(2);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(3);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(4);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentAgentStep(5);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCrossAnalysis(data);
        
        // Also map some draft fields so standard email modal can function
        setDraftBody(data.englishDraft.body);
        setRecipient(data.englishDraft.recipientEmail || 'claims@horizonresidential.com.au');
        setCurrentTranslation(data.englishDraft.chineseTranslation);
        
        // Populate and save persistent kanban tasks across all letters under unified store
        if (data.disputableItems && Array.isArray(data.disputableItems)) {
          const crossTasks = data.disputableItems.map((act: any) => ({
            step: `抗辩不合理扣项: ${act.name}`,
            officialChannel: 'VCAT和RTBA仲裁处',
            url: 'https://www.consumer.vic.gov.au/housing/renting'
          }));
          const finalSubject = data.englishDraft?.subject || '退房租房押金争议';
          const savedTasks = await saveExtractedTasks(
            crossTasks,
            finalSubject,
            '2026-07-10', // estimate
            'high' // riskLevel
          );
          setKanbanTasks(savedTasks.map(t => ({
            id: t.id,
            step: t.title,
            status: t.status,
            channel: t.channel,
            url: t.url
          })));
        } else {
          setKanbanTasks([]);
        }

        setAppState('result');
      } catch (err) {
        console.error(err);
        alert('交叉核验对线审查失败，请重试');
        setAppState('upload');
      }
    }
  };

  useEffect(() => {
    if (appState !== 'result' || !analysis) return;
    
    const timeoutId = setTimeout(async () => {
      if (draftBody && draftBody !== analysis.englishDraft.body) {
         setIsTranslating(true);
         try {
           const res = await fetch('/api/translate-stream', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ text: draftBody, language })
           });
           
           if (!res.ok) throw new Error("Stream failed");
           
           if (res.body) {
             const reader = res.body.getReader();
             const decoder = new TextDecoder();
             let done = false;
             setCurrentTranslation(""); // reset before streaming

             while (!done) {
               const { value, done: doneReading } = await reader.read();
               done = doneReading;
               if (value) {
                 const chunk = decoder.decode(value);
                 const lines = chunk.split('\n');
                 for (const line of lines) {
                   if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                     try {
                       const data = JSON.parse(line.slice(6));
                       if (data.text) {
                         setCurrentTranslation(prev => prev + data.text);
                       }
                     } catch (e) {
                       // ignore JSON parse errors from partial chunks
                     }
                   }
                 }
               }
             }
           }
         } catch (e) {
           console.error("Translation error", e);
         } finally {
           setIsTranslating(false);
           
           // Update this draft in history
           const currentHistoryStr = localStorage.getItem('serene_draft_history');
           if (currentHistoryStr) {
             let history = JSON.parse(currentHistoryStr);
             if (history.length > 0) {
               history[history.length - 1].body = draftBody;
               localStorage.setItem('serene_draft_history', JSON.stringify(history));
             }
           }
         }
      } else if (draftBody === analysis?.englishDraft.body) {
        setCurrentTranslation(analysis.englishDraft.chineseTranslation);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [draftBody, appState, analysis]);

  useEffect(() => {
    if (appState === 'analyzing') {
      setCurrentAgentStep(1);
      const interval = setInterval(() => {
        setCurrentAgentStep(prev => {
          if (prev < 5) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 1300);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const downloadICS = (dateStr: string, title: string, details: string) => {
    if (!dateStr) return;
    const yearStr = dateStr.replace(/-/g, '');
    const start = `${yearStr}T100000`;
    const end = `${yearStr}T110000`;
    
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Serene AI Services//EN',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@serene.ai',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART;TZID=Australia/Melbourne:' + start,
      'DTEND;TZID=Australia/Melbourne:' + end,
      'SUMMARY:' + title,
      'DESCRIPTION:' + details.replace(/\n/g, '\\n'),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${title.replace(/\s+/g, '_')}_deadline.ics`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSend = async () => {
    if (!analysis) return;
    // Open Gmail's web composer with the whole appeal pre-filled. This is a direct, synchronous
    // window.open inside the click handler, so popup blockers allow it — and it needs no login
    // or Firebase config (the Gmail API draft path requires a Firebase project we don't control).
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(analysis.englishDraft.subject)}&body=${encodeURIComponent(draftBody)}`;
    window.open(url, '_blank', 'noopener');
    setAppState('sent');
  };

  const reset = () => {
    setAppState('upload');
    setFile(null);
    setFilePreview(null);
    setAnalysis(null);
    setActiveCase(null);
    setCrossFileA(null);
    setCrossPreviewA(null);
    setCrossFileB(null);
    setCrossPreviewB(null);
    setActiveCrossPreset(null);
    setCrossAnalysis(null);
  };

  return (
      <div className="w-full md:p-4">
        
        <div className="mb-14 relative z-10">
          <p className="text-[#ff5a3c] text-xs font-semibold tracking-[0.18em] mb-3 uppercase font-sans">{t('lo_eyebrow')}</p>
          <h2 className="font-display text-4xl md:text-[3.25rem] font-medium text-[#1d1d1f] leading-[1.1] tracking-tight">
            {t('lo_hero_1')}<br className="hidden md:block"/>{t('lo_hero_2')}
          </h2>
        </div>

        <div className="flex flex-col relative z-10 w-full">
          {/* Interactive Main Area */}
          <div className={appState === 'upload' ? 'flex flex-col w-full' : 'flex flex-col w-full min-h-[500px] bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100'}>

             {appState === 'upload' && (
                <div className="flex-1 flex flex-col gap-7 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  
                  {/* Personalized AI Co-pilot Profile Widget — slim context bar */}
                  <div className="bg-surface-soft border border-hairline rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-on-primary bg-primary rounded-full px-2.5 py-1 shrink-0">
                          <Settings size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                          {t('lo_memory')}
                        </span>
                        <p className="text-xs text-muted truncate">
                          <strong className="text-body-strong font-semibold">{profileVisaType || getDefaultVisa(country, language)}</strong>
                          {profileSchool && <span className="text-muted-soft"> · {profileSchool}</span>}
                          {profileLeaseKeyTerms && <span className="text-muted-soft"> · {profileLeaseKeyTerms}</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowProfileWidget(!showProfileWidget)}
                        className="text-xs text-ink hover:text-primary font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {showProfileWidget ? t('lo_collapse_profile') : t('lo_edit_profile')}
                        <ArrowRight size={13} className={`transition-transform duration-300 ${showProfileWidget ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {showProfileWidget && (
                      <div className="mt-5 border-t border-gray-150/50 pt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">学签/签证类型</label>
                            <input 
                              type="text" 
                              value={profileVisaType} 
                              onChange={(e) => setProfileVisaType(e.target.value)} 
                              placeholder={`${t('lo_eg')} ${getDefaultVisa(country, language)}`}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">就读院校/专业团队</label>
                            <input 
                              type="text" 
                              value={profileSchool} 
                              onChange={(e) => setProfileSchool(e.target.value)} 
                              placeholder="例如: ANU, Master of Applied Data"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">租房合约关键条款</label>
                            <input 
                              type="text" 
                              value={profileLeaseKeyTerms} 
                              onChange={(e) => setProfileLeaseKeyTerms(e.target.value)} 
                              placeholder="例如: lease ends 30 June"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">额外背景特征 / 地址</label>
                            <input 
                              type="text" 
                              value={profileAdditionalDetails} 
                              onChange={(e) => setProfileAdditionalDetails(e.target.value)} 
                              placeholder="例如: 租住在 Flinder Lane 等"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-150/20 pt-4 flex-wrap gap-2">
                          <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                            <Smile size={13} className="text-[#ff5a3c]" />
                            {user ? (
                              <span className="text-ink font-bold flex items-center gap-1"><UserCheck size={12}/> 已通过 Firebase 账户同步至云端数据库</span>
                            ) : (
                              <span>您暂未登录。已保存在本地，登录后可同步至云端数据库保存</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={handleSaveProfile}
                              disabled={isSavingProfile}
                              className="text-xs bg-[#ff5a3c] text-white hover:bg-amber-600 disabled:opacity-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              {isSavingProfile ? "保存并同步中..." : "保存并更新记忆副驾"}
                            </button>
                          </div>
                        </div>

                        {profileSaveSuccess && (
                          <div className="mt-3 text-xs bg-surface-soft text-ink p-2.5 rounded-xl border border-hairline flex items-center gap-1.5 font-bold animate-in fade-in zoom-in-95 duration-200">
                            <CheckCircle2 size={14} className="text-ink animate-bounce" />
                            记忆载入成功！后续分析将全自动引入您的个人背景进行一对一定向抗诉诊断。
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                    {/* Left Column: Image/Canvas Preview Box on the Left */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-semibold text-muted mb-2.5 uppercase tracking-wider flex justify-between items-center">
                          <span>{t('lo_original_preview')}</span>
                          {activeCase && (
                            <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded font-bold">内置经典案例载入</span>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                        
                        <div 
                          onClick={() => { if (activeCase) return; fileInputRef.current?.click(); }}
                          className={`w-full ${activeCase ? 'cursor-default bg-white border-2 border-dashed border-hairline' : 'cursor-pointer hover:brightness-110 bg-[#0a0a0a] border border-white/10'} rounded-2xl flex flex-col items-center justify-center overflow-hidden relative transition-all duration-300`}
                          style={{ minHeight: '380px' }}
                        >
                           {/* Render High definition document directly in container if a preset is selected! */}
                           {activeCase ? (
                             <div className="w-full h-[380px] overflow-y-auto custom-scrollbar p-1 select-none flex justify-center bg-gray-50/50 rounded-xl">
                               {renderDocumentHTML(activeCase, true)}
                             </div>
                           ) : (
                             filePreview ? (
                               <img src={filePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2 bg-white/5" />
                             ) : (
                               <div className="text-center p-6">
                                 <div className="w-12 h-12 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border-dashed group-hover:border-[#ff5a3c]/50 transition-colors">
                                   <Camera className="text-white/50 group-hover:text-white transition-colors" size={24} />
                                 </div>
                                 <p className="text-white/60 text-xs font-bold font-sans">{t('lo_upload_hint1')}</p>
                                 <p className="text-white/30 text-[10px] mt-1 px-4 leading-normal">{t('lo_upload_hint2')}</p>
                                </div>
                             )
                           )}
                        </div>
                        
                        <div className="mt-3 flex gap-2 w-full">
                          {activeCase ? (
                            <button 
                              onClick={() => {
                                setFile(null);
                                setFilePreview(null);
                                setActiveCase(null);
                              }}
                              className="flex-1 text-xs font-bold border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 bg-white p-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                            >
                              清除案例，开始自选手传
                            </button>
                          ) : (
                            filePreview && (
                              <button 
                                onClick={reset}
                                className="flex-1 text-xs font-bold border border-gray-200 hover:border-gray-300 text-gray-650 bg-white p-2.5 rounded-xl transition-all"
                              >
                                重置上传
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button 
                          onClick={submitForAnalysis}
                          disabled={!file}
                          className={`w-full py-3.5 rounded-2xl font-extrabold flex justify-center items-center space-x-2 transition-all duration-350 ${file ? 'bg-[#ff5a3c] hover:bg-[#e6492d] text-white shadow-lg active:scale-95' : 'bg-gray-150 text-gray-400 cursor-not-allowed'}`}
                        >
                          <span className="tracking-wide">{t('lo_translate_btn')}</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Right Column: Case Choices Grid & "More Info" Guidance */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      
                      {/* Presets Grid */}
                      <div className="bg-surface-card/50 p-5 rounded-2xl border border-hairline">
                         <div className="text-[11px] font-semibold text-muted uppercase mb-3.5 tracking-wider flex items-center gap-1.5">
                           <span>{t('lo_load_examples')}</span>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <button onClick={() => loadExample('fine')} className={`text-xs font-bold border rounded-xl p-3 transition-all flex flex-col items-center gap-1 cursor-pointer ${activeCase === 'fine' ? 'border-[#1d1d1f] bg-[#1d1d1f]/5 shadow-sm text-neutral-900 ring-1 ring-[#1d1d1f]/25' : 'border-gray-100 bg-white hover:border-[#1d1d1f]/30 hover:bg-[#1d1d1f]/5 text-gray-700'}`}>
                              <span className="text-base">🎫</span>
                              <span className="text-gray-800">{t('ex_fine_t')}</span>
                              <span className="text-[10px] font-normal text-muted-soft text-center leading-tight">{t('ex_fine_d')}</span>
                            </button>
                            <button onClick={() => loadExample('coe')} className={`text-xs font-bold border rounded-xl p-3 transition-all flex flex-col items-center gap-1 cursor-pointer ${activeCase === 'coe' ? 'border-[#ff5a3c] bg-[#ff5a3c]/5 shadow-sm text-neutral-900 ring-1 ring-[#ff5a3c]/25' : 'border-gray-100 bg-white hover:border-[#ff5a3c]/30 hover:bg-[#ff5a3c]/5 text-gray-700'}`}>
                              <span className="text-base">⚠️</span>
                              <span className="text-gray-800">{t('ex_coe_t')}</span>
                              <span className="text-[10px] font-normal text-muted-soft text-center leading-tight">{t('ex_coe_d')}</span>
                            </button>
                            <button onClick={() => loadExample('bond')} className={`text-xs font-bold border rounded-xl p-3 transition-all flex flex-col items-center gap-1 cursor-pointer ${activeCase === 'bond' ? 'border-amber-500 bg-amber-500/10 shadow-sm text-neutral-900 ring-1 ring-amber-500/25' : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50 text-gray-700'}`}>
                              <span className="text-base">🏠</span>
                              <span className="text-gray-800">{t('ex_bond_t')}</span>
                              <span className="text-[10px] font-normal text-muted-soft text-center leading-tight">{t('ex_bond_d')}</span>
                            </button>
                            <button onClick={() => loadExample('plagiarism')} className={`text-xs font-bold border rounded-xl p-3 transition-all flex flex-col items-center gap-1 cursor-pointer ${activeCase === 'plagiarism' ? 'border-red-500 bg-red-50 shadow-sm text-neutral-900 ring-1 ring-red-500/25' : 'border-gray-100 bg-white hover:border-red-200 hover:bg-red-50 text-gray-700'}`}>
                              <span className="text-base">🎓</span>
                              <span className="text-gray-800">{t('ex_plag_t')}</span>
                              <span className="text-[10px] font-normal text-muted-soft text-center leading-tight">{t('ex_plag_d')}</span>
                            </button>
                            <button onClick={() => loadExample('noise')} className={`text-xs font-bold border rounded-xl p-3 transition-all flex flex-col items-center gap-1 cursor-pointer ${activeCase === 'noise' ? 'border-hairline bg-surface-soft shadow-sm text-neutral-900 ring-1 ring-primary/25' : 'border-gray-100 bg-white hover:border-hairline hover:bg-surface-soft text-gray-700'}`}>
                              <span className="text-base">📢</span>
                              <span className="text-gray-800">{t('ex_noise_t')}</span>
                              <span className="text-[10px] font-normal text-muted-soft text-center leading-tight">{t('ex_noise_d')}</span>
                            </button>
                            <button onClick={() => loadExample('utility')} className={`text-xs font-bold border rounded-xl p-3 transition-all flex flex-col items-center gap-1 cursor-pointer ${activeCase === 'utility' ? 'border-amber-500 bg-amber-50 shadow-sm text-neutral-900 ring-1 ring-amber-500/25' : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50 text-gray-700'}`}>
                              <span className="text-base">💧</span>
                              <span className="text-gray-800">{t('ex_util_t')}</span>
                              <span className="text-[10px] font-normal text-muted-soft text-center leading-tight">{t('ex_util_d')}</span>
                            </button>
                         </div>
                      </div>
                      
                      {/* "More Info / 案例要点及法援内参" Card */}
                      <div className="flex-1 border border-amber-200/60 bg-amber-50/20 rounded-3xl p-5 md:p-6 flex flex-col justify-between">
                         {activeCase ? (
                           <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-350">
                             <div>
                               <div className="flex justify-between items-start border-b border-amber-200 pb-3 mb-3">
                                 <div>
                                   <span className="text-[10px] font-black tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase font-mono">法援内参 · MORE INFO</span>
                                   <h3 className="text-base font-bold text-gray-900 mt-1">{CASE_GUIDES[activeCase].title}</h3>
                                 </div>
                                 <div className="text-right">
                                   <span className="text-[10px] text-gray-400 block font-bold">处理难度</span>
                                   <span className="text-xs font-semibold text-amber-950 block">{CASE_GUIDES[activeCase].difficulty}</span>
                                 </div>
                               </div>
                               
                               <div className="space-y-3 my-3 text-xs text-gray-700">
                                 <div>
                                   <span className="font-bold text-gray-900">🏢 发方机构:</span> <span className="font-mono text-gray-650 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{CASE_GUIDES[activeCase].org}</span>
                                 </div>
                                 <div>
                                   <span className="font-bold text-gray-900">🚨 涉诉金额/威胁:</span> <span className="font-extrabold text-red-650">{CASE_GUIDES[activeCase].amount}</span>
                                 </div>
                                 <div>
                                   <span className="font-bold text-gray-900">⏰ 行政抗诉死线:</span> <span className="font-bold text-[#1d1d1f] bg-white border px-1.5 py-0.5 rounded">{CASE_GUIDES[activeCase].deadline}</span>
                                 </div>
                                 <div className="bg-white/85 p-3 rounded-2xl border border-amber-100/50 leading-relaxed text-gray-600 mt-2">
                                   <p className="font-bold text-gray-900 border-l-2 border-[#ff5a3c] pl-1.5 mb-1.5 text-[10px]">事件描述 (Case Overview):</p>
                                   {CASE_GUIDES[activeCase].summary}
                                 </div>
                               </div>
                               
                               <div className="mt-4 pt-1">
                                 <h4 className="text-xs font-black text-amber-950 mb-2 flex items-center gap-1 uppercase tracking-wide">🛡️ 新移民与留学生维权防坑指南 (Strategy Guide):</h4>
                                 <ul className="space-y-2 mb-4">
                                   {CASE_GUIDES[activeCase].tips.map((tip, index) => (
                                     <li key={index} className="text-xs text-gray-700 flex items-start gap-1 pb-1 font-sans">
                                       <span className="text-amber-600 font-extrabold text-xs leading-none mt-0.5">•</span>
                                       <span>{tip}</span>
                                     </li>
                                   ))}
                                 </ul>

                                 {/* Grounding Sources Panel */}
                                 {CASE_GUIDES[activeCase].groundingSources && CASE_GUIDES[activeCase].groundingSources.length > 0 && (
                                   <div className="bg-white/85 border border-amber-200/50 p-4 rounded-2xl mb-4 text-[11px] font-sans">
                                     <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2.5 flex items-center gap-1.5 leading-none">
                                       <Globe size={13} className="text-amber-700 shrink-0"/>
                                       <span className="font-extrabold">🔍 澳洲官方监管及法规信源对齐 (Grounding Sources):</span>
                                     </h5>
                                     <ul className="space-y-2">
                                       {CASE_GUIDES[activeCase].groundingSources.map((source, index) => (
                                         <li key={index} className="leading-normal flex items-start gap-1">
                                           <span className="text-[#1d1d1f] shrink-0 mt-0.5 text-xs">🔗</span>
                                           <a 
                                             href={source.url} 
                                             target="_blank" 
                                             rel="noopener noreferrer" 
                                             className="text-[#1d1d1f] hover:text-[#ff5a3c] hover:underline font-bold transition-colors flex flex-wrap items-center gap-0.5"
                                           >
                                             <span>{source.label}</span>
                                             <span className="text-[9px] text-gray-400 font-normal">({new URL(source.url).hostname})</span>
                                           </a>
                                         </li>
                                       ))}
                                     </ul>
                                   </div>
                                 )}

                                 {/* Disclaimer Banner */}
                                 <div className="bg-amber-100/35 border border-amber-200/60 rounded-2xl p-3.5 text-[10px]/relaxed text-gray-650 font-sans mt-3">
                                   <div className="text-amber-800 font-bold flex items-center gap-1 mb-1 text-[11px]">
                                     <span>⚖️ R-AI 风险控制及责任声明 (Disclaimer):</span>
                                   </div>
                                   <p>
                                     本页面及平台服务解读的所有内容均基于澳大利亚联邦及各州公开法规之一般公共信息做梳理参考，<strong>不构成任何形式的执业律师正式法律意见（Legal Advice）</strong>。租客、学生或居民在正式进行法律抗辩、向法庭或审裁处（如 VCAT）提控前，请优先参阅上方对应官方直链，或向持牌顾问寻取协助。
                                   </p>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="border-t border-amber-100 pt-3 mt-5 flex flex-col sm:flex-row gap-2">
                               <button 
                                 onClick={() => setShowDocModal(true)}
                                 className="flex-1 bg-[#1d1d1f] hover:bg-neutral-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
                               >
                                 <Eye size={14}/>
                                 <span>📄 放大查阅高清原始公文 (HTML排版原件)</span>
                               </button>
                             </div>
                           </div>
                         ) : (
                           <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                              <Info className="text-amber-500 mb-3 animate-bounce" size={32} />
                              <h3 className="text-base font-bold text-[#1d1d1f] mb-1">{t('lo_waiting_title')}</h3>
                              <p className="text-xs text-gray-500 max-w-sm leading-relaxed px-4">
                                {t('lo_waiting_body')}
                              </p>
                           </div>
                         )}
                      </div>
                      
                    </div>
                  </div>
                </div>
             )}

             {appState === 'analyzing' && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 max-w-xl mx-auto animate-in fade-in duration-500">
                  <div className="relative mb-6 flex items-center justify-center">
                    <div className="w-14 h-14 border-4 border border-hairline border-t-ink rounded-full animate-spin"></div>
                    <span className="absolute text-ink font-extrabold text-[10px] uppercase font-sans tracking-tight">R-AI</span>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-gray-950 mb-1 flex items-center gap-1.5 justify-center">
                    <span>⭐ Agentic 案件深度处理链巡航中</span>
                  </h3>
                  <p className="text-gray-500 text-xs mb-6 text-center leading-relaxed">
                    正在执行 5 步自动闭环法务抗诉：为您编排最强合规信号。
                  </p>
                  
                  <div className="w-full space-y-3 text-left">
                    {[
                      {
                        step: 1,
                        title: "Step 1: 🔍 读画/扫描 → 结构化主干大纲抽取",
                        success: "成功录入关键信息、起草日期与收账金额/罚金主体。",
                        pending: "正在读取票据/公文/合同核心字段..."
                      },
                      {
                        step: 2,
                        title: "Step 2: ⚖️ Grounding 深度对齐澳洲最新法规",
                        success: "成功完成租务法/交通法合理磨损条款与 VCAT 民事审判历史判例对齐。",
                        pending: "正在联网调取本地民事审裁条例与争议仲裁法源..."
                      },
                      {
                        step: 3,
                        title: "Step 3: ✍️ 智能起草中英双语对线回信草稿",
                        success: "成功架构具有‘对线意图标注’的书面正式抗辩信件。",
                        pending: "正在分析双方合同条款冲突并构思最高效驳回话术..."
                      },
                      {
                        step: 4,
                        title: "Step 4: 📅 自动编码排版维权死线日历事件",
                        success: "成功核算行政纠纷诉讼死线时区并配置 .ics 文件一键写入。",
                        pending: "正在编码日历日程以防止诉讼效期失效..."
                      },
                      {
                        step: 5,
                        title: "Step 5: 📧 一键极速直达官方 / 中介 Gmail 信道",
                        success: "极速预置 Gmail 深链及自动发收口径，即刻呼之欲出！",
                        pending: "准备预热全能抗辩信道链接..."
                      }
                    ].map((item) => {
                      const isActive = item.step === currentAgentStep;
                      const isDone = item.step < currentAgentStep;
                      return (
                        <div 
                          key={item.step} 
                          className={`p-3.5 rounded-2.5xl border transition-all duration-300 ${isDone ? 'bg-surface-soft/50 border-hairline' : isActive ? 'bg-[#1d1d1f]/5 border-[#1d1d1f]/25 shadow-sm animate-pulse' : 'bg-gray-50/20 border-gray-100 opacity-45'}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="shrink-0">
                              {isDone ? (
                                <span className="w-5.5 h-5.5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold font-sans">✓</span>
                              ) : isActive ? (
                                <span className="w-5.5 h-5.5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold font-sans animate-spin">⟳</span>
                              ) : (
                                <span className="w-5.5 h-5.5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold font-sans">{item.step}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-[11px] font-black tracking-wide ${isDone ? 'text-ink' : isActive ? 'text-ink' : 'text-gray-450'}`}>
                                {item.title}
                              </h4>
                              <p className={`text-[10px] mt-0.5 leading-normal ${isDone ? 'text-ink' : isActive ? 'text-ink font-bold' : 'text-gray-400'}`}>
                                {isDone ? item.success : isActive ? item.pending : "排队待命..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
             )}

              {appState === 'result' && (claimMode === 'cross' ? !!crossAnalysis : !!analysis) && (
               <div className="flex-1 flex flex-col w-full h-full animate-in slide-in-from-bottom-4 duration-500">
                 <button onClick={reset} className="text-xs font-bold text-gray-400 hover:text-gray-900 mb-4 self-start flex items-center space-x-1 hover:underline">
                   <span>← {claimMode === 'cross' ? t('lo_back_cross') : t('lo_back_letter')}</span>
                 </button>

                 {/* Locally-powered failsafe mode alert banner */}
                 {((claimMode === 'cross' ? crossAnalysis?.isQuotaFallback : analysis?.isQuotaFallback)) && (
                   <div className="bg-amber-50 border border-amber-200/60 p-5 rounded-3xl flex items-start space-x-4 mb-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                     <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-sm font-sans font-bold">
                       💡
                     </div>
                     <div>
                       <h4 className="text-xs font-black text-amber-900 mb-1">
                         预置示例分析（非对您文件的实时识别）· Preset Sample — Not Live Analysis
                       </h4>
                       <p className="text-[11px] text-amber-850 leading-relaxed font-sans font-medium">
                         当前 Google Gemini 接口繁忙（限流），暂时无法对您刚上传的文件做实时视觉识别。以下展示的是<strong>同类案件的预置示例</strong>，用于演示分析与维权信生成能力，<strong>并非针对您这张文件的真实结果</strong>，其中的金额、机构、日期均为示例。请稍后点击「重新分析」以获取基于您文件的真实 Gemini + Google 实时检索结果。
                       </p>
                     </div>
                   </div>
                 )}

                 {/* Visual automatic-completion checking summary banner */}
                 <div className="bg-surface-soft border border-hairline/65 p-5 rounded-3xl flex items-start space-x-4 mb-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                   <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-sm font-sans font-bold">
                     🎉
                   </div>
                   <div>
                     <h4 className="text-xs font-black text-[#1d1d1f] mb-1">
                       AI 闭环护航申诉：整套法务复议流程已全面自动为您办妥！(AI Auto-Resolution Actions Complete)
                     </h4>
                     <p className="text-[11px] text-gray-700 leading-relaxed font-sans font-medium">
                       系统已瞬间为您完成：<span className="font-bold">① 极速识别并精细拆解</span> / <span className="font-bold">② 匹配澳洲 CAV/VCAT 法定条规并附高能 Grounding 信源链接</span> / <span className="font-bold">③ 自动化拟定中外对线驳回英文回信</span> / <span className="font-bold">④ 预排日历死线行政纠纷纠错事件</span> / <span className="font-bold">⑤ 直达一键极速 Gmail 对线发信</span>。全部抗辩诉求一气呵成！
                     </p>
                   </div>
                 </div>



                 {claimMode === 'cross' && crossAnalysis ? (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
                        {/* LEFT COLUMN: Disputable items list */}
                        <div className="lg:col-span-6 flex flex-col bg-neutral-100/60 p-5 rounded-3xl border border-gray-200/50 max-h-[85vh] overflow-y-auto custom-scrollbar">
                           <div className="text-[10px] font-black text-[#1d1d1f] tracking-wider uppercase mb-1">
                             ⚖️ 交叉匹配合同条目冲突分析栏 (CROSS DISPUTE ITEMS)
                           </div>
                           <h3 className="text-sm font-extrabold text-gray-900 mb-4">
                             共匹配识别出 <span className="text-red-650 text-base">{crossAnalysis.disputableItems.length}</span> 处严重违约或无理扣押标签：
                           </h3>

                           <div className="space-y-4">
                             {crossAnalysis.disputableItems.map((item: any, i: number) => (
                               <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-hairline transition-colors">
                                 <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                                   <span className="text-xs font-black text-gray-950 flex items-center gap-1">
                                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                     {item.name}
                                   </span>
                                   <span className="text-xs bg-red-50 border border-red-150 inline-block text-red-700 px-2 py-0.5 rounded font-black font-mono">
                                     -${item.amount} AUD
                                   </span>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-gray-500 font-sans leading-relaxed">
                                   <div className="bg-surface-soft/30 p-2.5 rounded-lg border border-hairline/50">
                                     <p className="font-bold text-ink mb-1">Clause A 住宅契约条款或规范：</p>
                                     <p>{item.clauseA}</p>
                                   </div>
                                   <div className="bg-red-50/20 p-2.5 rounded-lg border border-red-100/30">
                                     <p className="font-bold text-red-900 mb-1">Clause B 索赔发票/罚缴单指控：</p>
                                     <p>{item.clauseB}</p>
                                   </div>
                                 </div>

                                 <div className="bg-amber-50/35 p-3 rounded-xl border border-amber-100/50 text-xs font-sans text-gray-700 leading-relaxed font-normal">
                                   <p className="font-extrabold text-amber-900 flex items-center gap-1 mb-1">维权法源抗辩建议 (Strategy):</p>
                                   <p>{item.negotiableReason}</p>
                                 </div>

                                 <div className="bg-neutral-50 p-2.5 rounded-xl border border-gray-150 text-[11px] font-mono font-medium text-gray-600">
                                   <p className="font-bold text-gray-900 mb-0.5">💬 英文沟通回复模板 (Response Template):</p>
                                   <p className="italic">"{item.advicePlain}"</p>
                                 </div>
                               </div>
                             ))}
                           </div>
                        </div>

                        {/* RIGHT COLUMN: Overal suggestions + draft with cal & email buttons */}
                        <div className="lg:col-span-6 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar max-h-[85vh]">
                           {/* Global strategy card */}
                           <div className="bg-[#FFF4F2] p-5 rounded-3xl border border-[#FEE6E3]">
                             <div className="text-[10px] font-bold text-[#ff5a3c] tracking-widest mb-2 uppercase flex items-center space-x-2">
                               <span className="w-2 h-2 rounded-full bg-[#ff5a3c]"></span>
                               <span>总体驳回对线核心策略 (Chief Negotiator Directive)</span>
                             </div>
                             <p className="text-gray-900 text-xs font-medium leading-relaxed mb-3">
                               {crossAnalysis.recommendation}
                             </p>
                             <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-white font-black text-[11px] text-[#D84C3E] flex items-center justify-between shadow-sm font-sans">
                               <span>🎯 可安全挽回押金金额 (Total Recoverable Loss):</span>
                               <span className="text-sm text-red-650 font-black font-mono">
                                 ${crossAnalysis.disputableItems.reduce((acc: number, item: any) => acc + (item.amount || 0), 0)} AUD
                                </span>
                             </div>
                           </div>

                           {/* Intention and drafts */}
                           <div className="bg-[#f5f5f7] p-5 rounded-3xl border border-gray-200 flex flex-col gap-4 font-sans">
                             <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                               <span className="text-xs font-black text-gray-800 flex items-center gap-1">
                                 📝 主力英文维权正式声明书 (Drafting Response Document)
                               </span>
                               <span className="text-[9px] bg-surface-soft text-ink border border-hairline px-2 py-0.5 rounded-full font-black">对线意图高度匹配</span>
                             </div>

                             <div className="text-[11px]/relaxed text-gray-500 bg-surface-soft/10 p-2.5 rounded-xl border border-hairline/40 font-normal">
                               <span className="font-bold text-ink">对线意图：</span>
                               {crossAnalysis.englishDraft.intention}
                             </div>

                             <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-black uppercase text-gray-400">{t('lo_subject_label')}</label>
                               <input readOnly type="text" value={crossAnalysis.englishDraft.subject} className="bg-white text-xs font-bold border border-gray-200 rounded-lg p-2 focus:outline-none" />
                             </div>

                             <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-black uppercase text-gray-400">{t('lo_draft_label')}</label>
                               <textarea 
                                 value={draftBody}
                                 onChange={(e) => setDraftBody(e.target.value)}
                                 className="bg-white text-xs border border-gray-200 h-[220px] rounded-xl p-3 resize-none font-sans focus:outline-none focus:ring-1 focus:ring-[#1d1d1f] focus:border-[#1d1d1f] leading-relaxed select-text" 
                               />
                             </div>

                             {crossAnalysis.englishDraft.chineseTranslation && (
                               <div className="flex flex-col gap-1">
                                 <label className="text-[10px] font-black uppercase text-gray-400">CN REFERENCE (中文直观对照大意)</label>
                                 <div className="bg-gray-50 text-xs text-gray-600 border border-gray-100 rounded-xl p-3 max-h-[160px] overflow-y-auto leading-relaxed">
                                   <Markdown>{crossAnalysis.englishDraft.chineseTranslation}</Markdown>
                                 </div>
                               </div>
                             )}

                             {/* ACTION TOOLS BOX: Step 4 and 5 */}
                             <div className="border-t border-gray-150 pt-4 flex flex-col sm:flex-row gap-3">
                               <button 
                                 onClick={() => {
                                   const dateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                   downloadICS(
                                     dateStr, 
                                     "维州租务扣押争议 VCAT / RTBA 时效死线", 
                                     `请注意，今日向中介 Horizon 提交了正式抗诉信件，依据 14 天法定答复时限，若对方无理回绝，请立即单方面发起 RTBA 索赔！时效届满截止日期：${dateStr}`
                                   );
                                 }}
                                 className="flex-1 bg-white hover:bg-neutral-50 text-[#1d1d1f] border-2 border-[#1d1d1f]/35 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                               >
                                 <Calendar size={14} />
                                 <span>一键载入法定抗辩日历事件 (.ics)</span>
                               </button>

                               <button 
                                 onClick={() => {
                                   const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(crossAnalysis.englishDraft.recipientEmail || 'claims@horizonresidential.com.au')}&su=${encodeURIComponent(crossAnalysis.englishDraft.subject)}&body=${encodeURIComponent(draftBody)}`;
                                   window.open(url, '_blank');
                                   setAppState('sent');
                                 }}
                                 className="flex-1 bg-[#1d1d1f] hover:bg-neutral-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                               >
                                 <Send size={14} />
                                 <span>极速一键直达 Gmail 答复抗辩</span>
                               </button>
                             </div>
                           </div>
                        </div>
                     </div>
                 ) : (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
                   {/* Left Column: Side-by-side active original document preview */}
                   <div className="lg:col-span-5 flex flex-col bg-neutral-150/60 p-4 rounded-3xl border border-gray-150/50 max-h-[85vh] overflow-y-auto custom-scrollbar">
                     <div className="text-xs font-black text-gray-400 mb-2.5 uppercase tracking-wider flex justify-between items-center">
                       <span>{t('lo_current_original')}</span>
                       {activeCase ? (
                         <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">内置经典案例</span>
                       ) : (
                         <span className="text-[10px] text-on-dark bg-ink px-2 py-0.5 rounded font-bold">用户自选公文</span>
                       )}
                     </div>

                     <div className="w-full bg-white border border-gray-155 rounded-2xl flex flex-col items-center justify-center overflow-x-auto overflow-y-auto relative shadow-sm p-1.5 flex-1 min-h-[300px]">
                       {activeCase ? (
                         <div className="w-full h-full md:max-h-[500px] overflow-y-auto custom-scrollbar p-1 select-none flex justify-center bg-gray-50/20 rounded-xl">
                           {renderDocumentHTML(activeCase, true)}
                         </div>
                       ) : (
                         filePreview && (
                           <img src={filePreview} alt="Preview" className="w-full h-full max-h-[500px] object-contain p-2 bg-white/5" />
                         )
                       )}
                     </div>

                     <button 
                       onClick={() => setShowDocModal(true)}
                       className="mt-3.5 w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
                     >
                       <Eye size={13}/>
                       <span>📄 放大查阅高清原始公文 (1:1 A4放大)</span>
                     </button>
                   </div>

                   {/* Right Column: AI Translation & Responses */}
                   <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar max-h-[85vh]">
                     <div className="bg-[#FFF4F2] p-6 rounded-2xl border border-[#FEE6E3]">
                    <div className="text-[10px] font-bold text-[#ff5a3c] tracking-widest mb-3 uppercase flex items-center space-x-2">
                       <span className="w-2 h-2 rounded-full bg-[#ff5a3c]"></span>
                       <span>它在说什么 & 痛感折算</span>
                    </div>
                    <div className="text-gray-900 font-medium text-sm mb-4 markdown-body">
                       <Markdown>{analysis.summary}</Markdown>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white font-medium text-sm text-[#D84C3E] flex items-start space-x-3 shadow-sm">
                       <span className="text-xl leading-none mt-0.5">💔</span>
                       <div className="leading-snug markdown-body flex-1">
                          <Markdown>{analysis.painConversion}</Markdown>
                       </div>
                    </div>
                 </div>

                 <div className="bg-[#ececef] p-6 rounded-2xl mb-8 border border-[#EBE8E0]">
                    <div className="text-[10px] font-bold text-[#1d1d1f] tracking-widest mb-4 uppercase flex items-center space-x-2">
                       <span className="w-2 h-2 rounded-full bg-[#1d1d1f]"></span>
                       <span>🚀 抗辩执行清单 (To-Do Checklist Kanban)</span>
                     </div>
                     {analysis.deadline && (
                       <div className="bg-white p-4.5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col sm:flex-row items-center gap-4.5 mb-5 font-sans">
                         <div className="w-16 h-16 shrink-0 rounded-2xl border border-red-200 overflow-hidden shadow-sm flex flex-col items-center bg-white">
                           <div className="bg-red-500 text-white text-[9px] py-0.5 text-center w-full font-black tracking-widest uppercase">
                             {(() => {
                               const dStr = analysis.deadline?.date || "";
                               if (dStr) {
                                 const pts = dStr.split('-');
                                 if (pts.length === 3) return `${parseInt(pts[1], 10)}月`;
                               }
                               return "时限";
                             })()}
                           </div>
                           <div className="text-2xl font-black text-gray-800 my-auto">
                             {(() => {
                               const dStr = analysis.deadline?.date || "";
                               if (dStr) {
                                 const pts = dStr.split('-');
                                 if (pts.length === 3) return pts[2];
                               }
                               return "⏰";
                             })()}
                           </div>
                         </div>
                         
                         <div className="flex-1 text-center sm:text-left">
                           <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5">
                             <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase font-mono bg-red-50 text-red-800`}>
                               ⏰ 剩余 {analysis.deadline?.businessDaysLeft ?? 0} 天
                             </span>
                             {analysis.issuer?.isOfficial && (
                               <span className="bg-[#1d1d1f]/10 text-[#1d1d1f] text-[8px] font-black px-1.5 py-0.5 rounded">
                                 🏛️ 官方认证
                               </span>
                             )}
                           </div>
                           <h3 className="text-xs font-black text-gray-900 mt-1">抗诉截止日历：{analysis.deadline?.date}</h3>
                           <p className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">
                             发函机构：{analysis.issuer?.name || "未知机构"}
                           </p>
                         </div>
                       </div>
                     )}
                     
                     {/* Progress bar */}
                     {(() => {
                       const completedCount = kanbanTasks.filter(t => t.status === 'done').length;
                       const totalCount = kanbanTasks.length;
                       const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                       return (
                         <div className="mb-4 font-sans">
                           <div className="flex justify-between items-center mb-1 text-[10px] font-black text-[#1d1d1f] tracking-wider uppercase">
                             <span>申诉执行进度</span>
                             <span>{completedCount}/{totalCount} 已完成 ({percentage}%)</span>
                           </div>
                           <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden border border-gray-100">
                             <div className="bg-primary h-full transition-all duration-550" style={{ width: `${percentage}%` }} />
                           </div>
                         </div>
                       );
                     })()}
                                         <ul className="space-y-4">
                      {kanbanTasks.map((task, idx) => (
                        <li key={task.id || idx} className={`flex items-start space-x-3 text-sm bg-white p-3.5 rounded-xl border transition-all duration-200 ${task.status === 'done' ? 'border-gray-200 opacity-60' : 'border-gray-200/80 hover:shadow-sm shadow-xs'}`}>
                          <button 
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                              task.status === 'done' 
                                ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white' 
                                : 'border-gray-300 bg-white hover:border-[#1d1d1f]'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 size={11} className="stroke-[3]" />}
                          </button>
                          <div className="markdown-body -mt-0.5">
                             <p className={`text-xs font-bold leading-snug ${task.status === 'done' ? 'line-through text-gray-400 font-sans' : 'text-gray-800 font-sans'}`}>{task.step}</p>
                             {task.url && (
                               <a 
                                 href={task.url} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="inline-flex items-center gap-1 text-[10px] font-black text-ink hover:text-red-500 mt-1.5 transition-all bg-surface-soft px-2 py-0.5 rounded-md"
                               >
                                 <span>🌐 去官网对线：{task.channel || "在线申诉纠纷平台"}</span>
                                 <ExternalLink size={9} className="shrink-0" />
                               </a>
                             )}
                          </div>
                        </li>
                      ))}
                    </ul>
                 </div>

                 <div className="mt-8 flex-1 flex flex-col border-t border-gray-100 pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">{t('lo_draft_reply_title')}</h3>
                    
                    <div className="bg-[#FFF8E7] p-5 rounded-xl border border-[#FBEAC3] mb-6 flex items-start space-x-4 shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-[#ff5a3c]/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#ff5a3c]/30">
                          <AlignLeft size={18} className="text-[#B58529]" />
                       </div>
                       <div>
                          <h4 className="text-[11px] font-bold text-[#B58529] tracking-widest mb-1.5 uppercase">对线策略（中文意图）</h4>
                          <div className="text-sm font-medium text-gray-800 markdown-body leading-relaxed">
                             <Markdown>{analysis.englishDraft.intention}</Markdown>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col space-y-4 mb-6">
                     {/* Part 4: Verified Legal/Grounding Sources Display next to email strategy intent */}
                     {analysis.userRights && analysis.userRights.length > 0 && (
                       <div className="bg-surface-soft/15 border border-hairline p-5 rounded-2xl mb-6 flex flex-col gap-3 font-sans shadow-sm">
                         <div className="text-[10px] font-black text-[#1d1d1f] tracking-wider uppercase flex items-center gap-1.5 leading-none">
                           <Globe size={13} className="text-ink shrink-0"/>
                           <span>{t('lo_legal_basis')}</span>
                         </div>
                         <div className="divide-y divide-ink/60 flex flex-col">
                           {analysis.userRights.map((right, index) => (
                             <div key={index} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1 text-xs">
                               <p className="font-bold text-gray-900 leading-normal">
                                 💡 {right.claim}
                               </p>
                               <div className="flex flex-wrap items-center gap-2 mt-1">
                                 <span className="text-[10px] bg-red-50 text-red-800 border border-red-150 px-1.5 py-0.5 rounded font-bold font-sans">
                                   依据：{right.legalBasis}
                                 </span>
                                 {right.sourceUrl && (
                                   <a 
                                     href={right.sourceUrl} 
                                     target="_blank" 
                                     rel="noopener noreferrer" 
                                     className="inline-flex items-center gap-0.5 text-[#1d1d1f] font-black hover:text-[#ff5a3c] hover:underline whitespace-nowrap"
                                   >
                                     <span>🔗 查看官方原文条款</span>
                                     <ExternalLink size={9} />
                                   </a>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     <GroundingSources grounding={(analysis as any)._grounding} />

                       <div className="flex items-center space-x-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 focus-within:border-gray-300 focus-within:bg-white transition-colors">
                          <span className="text-xs font-bold text-gray-400 whitespace-nowrap uppercase tracking-wider w-12">发给</span>
                          <input 
                            type="email" 
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
                            placeholder="机构邮箱地址"
                          />
                       </div>
                       
                       <div className="flex items-center space-x-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 whitespace-nowrap uppercase tracking-wider w-12">主题</span>
                          <input 
                            type="text" 
                            value={analysis.englishDraft.subject}
                            readOnly
                            className="flex-1 bg-transparent text-sm font-bold text-gray-900 focus:outline-none placeholder-gray-400"
                            placeholder="邮件主题"
                          />
                       </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-4 mb-6">
                       <div className="flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-2 px-1">
                             <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">英文原稿（可自由修改）</label>
                             <span className="text-[10px] bg-ink text-on-dark px-2 py-0.5 rounded-full font-bold">Editable</span>
                          </div>
                          <textarea 
                            value={draftBody}
                            onChange={(e) => setDraftBody(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm font-sans focus:outline-none focus:ring-2 ring-gray-200 hover:border-gray-300 transition-colors resize-none h-[320px] shadow-sm leading-relaxed"
                          />
                       </div>
                       
                       {currentTranslation && (
                          <div className="flex-1 flex flex-col">
                             <div className="flex items-center justify-between mb-2 px-1">
                               <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">中文精准对照</label>
                               {isTranslating && <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><div className="w-2 h-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> 翻译中...</span>}
                             </div>
                             <div className="w-full bg-[#FBFBFA] border border-gray-100 rounded-2xl p-5 text-sm font-sans resize-none h-[320px] shadow-inner overflow-y-auto leading-relaxed text-gray-600 markdown-body">
                                <Markdown>{currentTranslation}</Markdown>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
                       <p className="text-xs text-gray-400 font-medium mb-5 text-center leading-relaxed max-w-md">
                         AI 仅辅助生成草稿，<strong className="text-gray-500">发送前请仔细检查 [中括号] 内的信息</strong>。本服务不构成法律或学术建议。
                       </p>
                       
                       <div className="w-full max-w-md">
                         <button
                           onClick={handleSend}
                           className="w-full bg-[#1d1d1f] hover:bg-[#1a1a1a] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-3 shadow-xl shadow-[#1d1d1f]/20 transition-all hover:-translate-y-0.5 active:scale-95"
                         >
                            <img src="https://www.gstatic.com/images/branding/product/1x/gmail_32dp.png" alt="Gmail" className="w-5 h-5 filter brightness-0 invert" />
                            <span>{t('lo_open_gmail')}</span>
                            <ExternalLink size={16} className="ml-1 opacity-70" />
                         </button>
                         <p className="text-[10px] text-gray-400 text-center mt-2">自动打开 Gmail 网页版，收件人、主题、正文已替你填好；你过目无误后点发送（不会自动发出）。</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
             )}

             {appState === 'sent' && (
               <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 py-12">
                  <div className="w-24 h-24 bg-[#EBF1ED] text-[#1d1d1f] rounded-full flex items-center justify-center mb-8 shadow-inner border border-[#1d1d1f]/10">
                    <Send size={40} className="ml-2" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4 font-serif">{t('lo_gmail_done_title')}</h3>
                  <p className="text-gray-500 text-base max-w-sm mb-8 leading-relaxed">
                    切到 Gmail 标签页，收件人、主题、正文都已预填；过目无误后点发送。这道难关，就快跨过去了。
                  </p>
                  
                  <button onClick={reset} className="text-[#1d1d1f] font-bold bg-white border-2 border-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white px-10 py-4 rounded-full transition-all shadow-sm flex items-center space-x-2 active:scale-95">
                     <span>{t('lo_next_letter')}</span>
                     <ArrowRight size={18} />
                  </button>
               </div>
             )}

          </div>
        </div>

        {/* High-Definition Original Document Overlay Modal */}
        {showDocModal && (activeCase || filePreview) && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-[#f5f5f7] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]">
              <div className="bg-[#1d1d1f] text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#ff5a3c]"/>
                  <span className="font-extrabold text-xs md:text-sm">
                    {activeCase ? `${CASE_GUIDES[activeCase].title} - 官方正本 A4 高清阅览` : '已上传公文 - 高清放大阅览'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowDocModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-white transition-colors cursor-pointer"
                  title="关闭"
                >
                  <X size={15}/>
                </button>
              </div>

              <div className="p-4 md:p-8 overflow-y-auto bg-gray-100 flex-1 flex justify-center custom-scrollbar">
                <div className="w-full max-w-2xl overflow-x-auto">
                  {activeCase ? (
                    renderDocumentHTML(activeCase, false)
                  ) : (
                    filePreview && (
                      <div className="flex justify-center bg-white p-4 rounded-xl border shadow-sm">
                        <img src={filePreview} alt="Uploaded Document Original" className="max-w-full max-h-[70vh] object-contain rounded" />
                      </div>
                    )
                  )}
                </div>
              </div>

              {appState !== 'result' && (
                <div className="bg-[#1d1d1f]/5 px-6 py-4 flex justify-end gap-2 border-t text-xs">
                  <button 
                    onClick={() => {
                      setShowDocModal(false);
                      submitForAnalysis();
                    }}
                    className="bg-[#ff5a3c] hover:bg-[#e6492d] text-white font-extrabold py-2.5 px-6 rounded-xl shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>一键对该公文进行Ai深度解析与写信申诉</span>
                    <ArrowRight size={14}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
