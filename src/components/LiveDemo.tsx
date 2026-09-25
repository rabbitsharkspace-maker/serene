import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, CheckCircle2, ArrowRight, Mail, AlignLeft, ExternalLink, Info, X, Eye, FileText, Globe, Calendar, Settings, Smile, UserCheck, Plus, Trash2, Shield, BellRing, LogIn, LogOut } from 'lucide-react';
import { renderDocumentHTML } from './DocumentRenderer';
import { User } from 'firebase/auth';
import { getDb } from '../lib/firebase';
import { saveExtractedTasks, KanbanTask } from '../lib/kanbanService';
import { showToast } from '../lib/toast';
import Markdown from 'react-markdown';
import { useLocale, getCountryContent, getDefaultVisa } from '../lib/locale';
import { useT, useL } from '../lib/i18n';
import GroundingSources from './GroundingSources';
import { googleCalendarUrl } from '../lib/calendar';
import JudgingProof from './JudgingProof';

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
  confidence?: 'low' | 'medium' | 'high' | string | number;
  needsHumanConfirmation?: boolean;
  disclaimer?: string;
  isQuotaFallback?: boolean;
  status?: 'clean' | 'risky';
  violations?: {
    clause: string;
    description: string;
    penaltyRisk: string;
    solution: string;
  }[];
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

// English version of CASE_GUIDES (also the fallback for any language without its own set).
const CASE_GUIDES_EN: typeof CASE_GUIDES = {
  fine: {
    title: 'Parking fine appeal: council parking infringement',
    org: 'City of Brentmoor (fictional council)',
    amount: '$85.00 AUD',
    deadline: 'Pay or request a review by 1 May 2026',
    difficulty: '⭐ (Low — a warning instead of a fine is very achievable)',
    summary: 'City of Brentmoor issued a parking infringement alleging that a red Toyota Corolla (rego ABC-123) stopped in a no-stopping zone on Flinders Lane.',
    tips: [
      'If you have a clean driving record for the past 3 years, you can ask the council in writing to replace the fine with an "Official Warning" (first-offence leniency).',
      'If you stopped because of an emergency, a breakdown or an urgent medical need, attach an RACV roadside assistance record or a hospital certificate — reviews like these are very often successful.',
      'If the "No Stopping / time limit" sign was hidden by trees, or the road markings were badly faded, take photos — this is a strong ground for a review.'
    ],
    groundingSources: CASE_GUIDES.fine.groundingSources
  },
  coe: {
    title: 'Academic standing: Show Cause and intention to cancel your CoE',
    org: 'Westhaven University, Melbourne (fictional university)',
    amount: 'Enrolment termination and loss of tuition fees',
    deadline: 'Lodge an appeal within 20 business days of receiving the letter (by 20 July 2026)',
    difficulty: '⭐⭐⭐⭐ (High — risk of visa cancellation)',
    summary: 'After failing all units in the first semester (or not meeting minimum academic progress across consecutive semesters), Westhaven University intends to terminate Li Wei Chen\'s enrolment and cancel the CoE (Confirmation of Enrolment).',
    tips: [
      'You must lodge a written appeal within the strict 20-business-day deadline! If you miss it, the university will report you to Home Affairs and your student visa may move towards cancellation.',
      'Gather detailed evidence of "Compassionate & Compelling" circumstances — e.g. sudden illness or depression (with a letter and diagnosis from an Australian registered doctor), or a serious event affecting close family.',
      'Prepare a realistic Study Plan, with records of booked academic support sessions, to show the Academic Progress Committee you can get back on track next semester.'
    ],
    groundingSources: CASE_GUIDES.coe.groundingSources
  },
  bond: {
    title: 'Renting: agent withholding part of your rental bond',
    org: 'Horizon Residential VIC (fictional real estate agent)',
    amount: '$420.00 AUD (proposed deduction)',
    deadline: 'By 5:00 PM, 14 July 2026 (within 10 business days)',
    difficulty: '⭐⭐ (Medium — tenancy law usually lets you recover it in full)',
    summary: 'After tenant Alex Thompson moved out of 4/85 Bourke Street, the agent Horizon proposed deducting $420 from the bond: $180 for carpet steam cleaning, $90 for kitchen tile de-greasing and $150 for marks on the living-room wall.',
    tips: [
      'Carpet cleaning: under the Residential Tenancies Act (VIC), unless you left stains beyond normal use, the agent generally cannot require professional steam cleaning. Fair wear and tear is a right protected by law.',
      'Minor wall damage: small scuffs and light wear from everyday living count as fair wear and tear, so the landlord generally cannot pass the repair cost on to you.',
      'Act first online: log in to the RTBA bond system and apply to claim the entire bond. If the agent disagrees, they must apply to VCAT within 14 days to prove their claim, otherwise the bond is released to you. VCAT is an independent tribunal where both sides must provide evidence — it is not an automatic full refund, but agents often settle rather than go through the hassle of proving their claim.'
    ],
    groundingSources: CASE_GUIDES.bond.groundingSources
  },
  plagiarism: {
    title: 'Academic integrity: plagiarism allegation',
    org: 'Westhaven University (fictional academic integrity committee)',
    amount: 'Zero marks for the assessment / fail warning',
    deadline: 'Confirm attendance by 28 June 2026; interview on 3 July',
    difficulty: '⭐⭐⭐⭐⭐ (Very high — a serious compliance issue)',
    summary: 'Sarah Chen\'s ECON101 Assignment 2 is alleged to have a 48% similarity match with databases and online sources, raising suspected academic misconduct.',
    tips: [
      'Collect your full drafting history: Word version history and tracked changes, Git commits, handwritten mind maps and the lecture notes you used.',
      'Understand the difference between plagiarism and poor referencing. If the issue is missing or badly formatted citations, argue at the interview that it was non-intentional academic misconduct, which can reduce the outcome to a warning.',
      'You can ask for a free, independent Student Advocate from your university to attend the interview with you and advise you on what to say.'
    ],
    groundingSources: CASE_GUIDES.plagiarism.groundingSources
  },
  noise: {
    title: 'Community living: late-night noise breach notice',
    org: 'Meridian Strata Management VIC (fictional strata manager)',
    amount: 'Warning; repeat breaches could lead to VCAT orders and fines',
    deadline: 'Reply in writing by 6 July 2026 (within 14 days of receipt)',
    difficulty: '⭐ (Low — usually resolved by adjusting your habits)',
    summary: 'The occupant of Apartment 4B, 88 Flinders Lane received a breach notice from the Owners Corporation after multiple complaints about loud music and socialising after 10:00 PM over the past four weeks.',
    tips: [
      'Quiet hours: every Australian state regulates residential noise. On weeknights, from about 10:00 / 11:00 PM until 7:00 AM is a quiet period — avoid noise that disturbs your neighbours.',
      'This is mainly a formal warning (Breach Notice). Reply politely in writing before the deadline, explain the situation and commit to keeping noise down — a calm, cooperative reply usually settles the matter.'
    ],
    groundingSources: CASE_GUIDES.noise.groundingSources
  },
  utility: {
    title: 'Household bills: overdue utility bill and disconnection warning',
    org: 'Coastal Energy & Water (fictional utility provider)',
    amount: '$258.30 AUD (overdue, incl. late fee)',
    deadline: 'Pay by 1 July 2026 to avoid disconnection and reconnection fees',
    difficulty: '⭐ (Low — you can ask for an interest-free payment extension straight away)',
    summary: 'Mrs. Eleanor Vance\'s account 9876 543 210 has two billing periods overdue, totalling $258.30, and she has received a disconnection warning.',
    tips: [
      'Strong consumer protections: providers are generally not allowed to disconnect households during extreme weather, on weekends or just before public holidays.',
      'Call the number on your bill, or log in, and join the "Hardship Program". Once you ask, interest and late fees are waived and you can get a small interest-free payment plan over 12–24 months.',
      'Your provider can also help you apply for state government relief (e.g. the Utility Relief Grant Scheme in VIC), worth several hundred dollars per household, which can cover all or much of the debt.'
    ],
    groundingSources: CASE_GUIDES.utility.groundingSources
  }
};

type GuideLang = 'zh' | 'en' | 'es' | 'hi' | 'vi' | 'ar';

// Spanish (es) version of CASE_GUIDES. URLs, amounts, org names and proper-noun legal terms stay as-is.
const CASE_GUIDES_ES: typeof CASE_GUIDES = {
  fine: {
    title: 'Recurso de multa de aparcamiento: infracción municipal',
    org: 'City of Brentmoor (ayuntamiento ficticio)',
    amount: '$85.00 AUD',
    deadline: 'Paga o solicita una revisión antes del 1 de mayo de 2026',
    difficulty: '⭐ (Baja — es muy factible conseguir una advertencia en lugar de una multa)',
    summary: 'City of Brentmoor emitió una multa de aparcamiento alegando que un Toyota Corolla rojo (matrícula ABC-123) se detuvo en una zona de prohibido detenerse en Flinders Lane.',
    tips: [
      'Si no tienes infracciones en los últimos 3 años, puedes pedir por escrito al ayuntamiento que sustituya la multa por una "Official Warning" (indulgencia por primera infracción).',
      'Si te detuviste por una emergencia, una avería o una necesidad médica urgente, adjunta el parte de asistencia en carretera de RACV o un certificado del hospital — este tipo de revisiones suele prosperar.',
      'Si la señal de "No Stopping / tiempo límite" estaba tapada por árboles o las marcas viales estaban muy borrosas, haz fotos — es un motivo sólido para pedir la revisión.'
    ],
    groundingSources: CASE_GUIDES.fine.groundingSources
  },
  coe: {
    title: 'Situación académica: Show Cause e intención de cancelar tu CoE',
    org: 'Westhaven University, Melbourne (universidad ficticia)',
    amount: 'Baja de la matrícula y pérdida de las tasas de estudio',
    deadline: 'Presenta una apelación en un plazo de 20 días hábiles desde que recibas la carta (antes del 20 de julio de 2026)',
    difficulty: '⭐⭐⭐⭐ (Alta — riesgo de cancelación de la visa)',
    summary: 'Tras suspender todas las asignaturas del primer semestre (o no alcanzar el progreso académico mínimo en semestres consecutivos), Westhaven University pretende dar de baja la matrícula de Li Wei Chen y cancelar su CoE (Confirmation of Enrolment).',
    tips: [
      '¡Debes presentar una apelación por escrito dentro del estricto plazo de 20 días hábiles! Si no lo haces, la universidad informará a Home Affairs y tu visa de estudiante podría avanzar hacia la cancelación.',
      'Reúne pruebas detalladas de circunstancias "Compassionate & Compelling" — p. ej., una enfermedad repentina o depresión (con carta y diagnóstico de un médico registrado en Australia), o un hecho grave que afecte a tu familia cercana.',
      'Prepara un Study Plan realista, con registros de sesiones de apoyo académico reservadas, para demostrar al Academic Progress Committee que puedes retomar el buen camino el próximo semestre.'
    ],
    groundingSources: CASE_GUIDES.coe.groundingSources
  },
  bond: {
    title: 'Alquiler: la agencia retiene parte de tu fianza',
    org: 'Horizon Residential VIC (agencia inmobiliaria ficticia)',
    amount: '$420.00 AUD (deducción propuesta)',
    deadline: 'Antes de las 5:00 PM del 14 de julio de 2026 (en 10 días hábiles)',
    difficulty: '⭐⭐ (Media — la ley de alquileres suele permitir recuperarla por completo)',
    summary: 'Después de que el inquilino Alex Thompson dejara 4/85 Bourke Street, la agencia Horizon propuso descontar $420 de la fianza: $180 por limpieza de moqueta a vapor, $90 por desengrasar los azulejos de la cocina y $150 por marcas en la pared del salón.',
    tips: [
      'Limpieza de moqueta: según la Residential Tenancies Act (VIC), salvo que hayas dejado manchas más allá del uso normal, la agencia en general no puede exigir una limpieza profesional a vapor. El desgaste normal (fair wear and tear) es un derecho protegido por la ley.',
      'Daños leves en paredes: los pequeños roces y el desgaste ligero por el uso diario cuentan como desgaste normal, así que el propietario en general no puede cobrarte la reparación.',
      'Actúa primero en línea: entra en el sistema de fianzas de la RTBA y solicita la devolución de la fianza completa. Si la agencia no está de acuerdo, debe acudir a VCAT en 14 días para demostrar su reclamación; de lo contrario, la fianza se te devuelve. VCAT es un tribunal independiente donde ambas partes deben aportar pruebas — no es un reembolso automático, pero las agencias suelen llegar a un acuerdo antes que pasar por la molestia de demostrar su reclamación.'
    ],
    groundingSources: CASE_GUIDES.bond.groundingSources
  },
  plagiarism: {
    title: 'Integridad académica: acusación de plagio',
    org: 'Westhaven University (comité de integridad académica ficticio)',
    amount: 'Cero puntos en la evaluación / aviso de suspenso',
    deadline: 'Confirma tu asistencia antes del 28 de junio de 2026; entrevista el 3 de julio',
    difficulty: '⭐⭐⭐⭐⭐ (Muy alta — un problema grave de cumplimiento)',
    summary: 'Se alega que el Assignment 2 de ECON101 de Sarah Chen tiene un 48% de coincidencia con bases de datos y fuentes en línea, lo que hace sospechar de mala conducta académica.',
    tips: [
      'Reúne todo tu historial de borradores: historial de versiones y control de cambios de Word, commits de Git, mapas mentales a mano y los apuntes de clase que usaste.',
      'Entiende la diferencia entre plagio y citar mal. Si el problema son citas que faltan o con formato incorrecto, argumenta en la entrevista que fue una mala conducta académica no intencionada (non-intentional academic misconduct), lo que puede reducir el resultado a una advertencia.',
      'Puedes pedir que un Student Advocate independiente y gratuito de tu universidad te acompañe en la entrevista y te aconseje sobre qué decir.'
    ],
    groundingSources: CASE_GUIDES.plagiarism.groundingSources
  },
  noise: {
    title: 'Convivencia: aviso de infracción por ruido nocturno',
    org: 'Meridian Strata Management VIC (administrador de comunidad ficticio)',
    amount: 'Advertencia; si se repite, podría haber órdenes de VCAT y multas',
    deadline: 'Responde por escrito antes del 6 de julio de 2026 (en 14 días desde la recepción)',
    difficulty: '⭐ (Baja — suele resolverse ajustando tus hábitos)',
    summary: 'El ocupante del apartamento 4B, 88 Flinders Lane, recibió un aviso de infracción de la Owners Corporation tras varias quejas por música alta y reuniones después de las 10:00 PM durante las últimas cuatro semanas.',
    tips: [
      'Horas de silencio: todos los estados australianos regulan el ruido residencial. Entre semana, desde las 10:00 / 11:00 PM hasta las 7:00 AM aproximadamente es horario de silencio — evita ruidos que molesten a tus vecinos.',
      'Se trata principalmente de una advertencia formal (Breach Notice). Responde por escrito y con cortesía antes del plazo, explica la situación y comprométete a reducir el ruido — una respuesta tranquila y cooperativa suele zanjar el asunto.'
    ],
    groundingSources: CASE_GUIDES.noise.groundingSources
  },
  utility: {
    title: 'Facturas del hogar: factura vencida y aviso de corte de suministro',
    org: 'Coastal Energy & Water (proveedor de suministros ficticio)',
    amount: '$258.30 AUD (vencido, incl. recargo por demora)',
    deadline: 'Paga antes del 1 de julio de 2026 para evitar el corte y los cargos de reconexión',
    difficulty: '⭐ (Baja — puedes pedir de inmediato una prórroga de pago sin intereses)',
    summary: 'La cuenta 9876 543 210 de Mrs. Eleanor Vance tiene dos periodos de facturación vencidos, por un total de $258.30, y ha recibido un aviso de corte de suministro.',
    tips: [
      'Fuerte protección al consumidor: en general, los proveedores no pueden cortar el suministro a los hogares durante temperaturas extremas, fines de semana o justo antes de días festivos.',
      'Llama al número de tu factura, o inicia sesión, y únete al "Hardship Program". En cuanto lo pidas, se anulan los intereses y recargos, y puedes obtener un pequeño plan de pagos sin intereses de 12 a 24 meses.',
      'Tu proveedor también puede ayudarte a solicitar ayudas del gobierno estatal (p. ej., el Utility Relief Grant Scheme en VIC), de varios cientos de dólares por hogar, que pueden cubrir toda o gran parte de la deuda.'
    ],
    groundingSources: CASE_GUIDES.utility.groundingSources
  }
};

// Hindi (hi) version of CASE_GUIDES. URLs, amounts, org names and proper-noun legal terms stay as-is.
const CASE_GUIDES_HI: typeof CASE_GUIDES = {
  fine: {
    title: 'पार्किंग जुर्माने की अपील: काउंसिल का पार्किंग उल्लंघन नोटिस',
    org: 'City of Brentmoor (काल्पनिक काउंसिल)',
    amount: '$85.00 AUD',
    deadline: '1 मई 2026 तक भुगतान करें या समीक्षा का अनुरोध करें',
    difficulty: '⭐ (कम — जुर्माने की जगह चेतावनी मिलना काफ़ी संभव है)',
    summary: 'City of Brentmoor ने पार्किंग उल्लंघन नोटिस जारी किया है, जिसमें आरोप है कि एक लाल Toyota Corolla (रजिस्ट्रेशन ABC-123) Flinders Lane पर नो-स्टॉपिंग ज़ोन में रुकी थी।',
    tips: [
      'अगर पिछले 3 साल में आपका ड्राइविंग रिकॉर्ड साफ़ है, तो आप काउंसिल से लिखित में अनुरोध कर सकते हैं कि जुर्माने की जगह "Official Warning" दी जाए (पहली गलती पर नरमी)।',
      'अगर आप किसी आपात स्थिति, गाड़ी खराब होने या तुरंत इलाज की ज़रूरत की वजह से रुके थे, तो RACV रोडसाइड सहायता का रिकॉर्ड या अस्पताल का प्रमाणपत्र लगाएँ — ऐसी समीक्षाएँ अक्सर सफल होती हैं।',
      'अगर "No Stopping / समय-सीमा" का बोर्ड पेड़ों से ढका था, या सड़क के निशान बहुत फीके थे, तो फ़ोटो लें — यह समीक्षा का मज़बूत आधार है।'
    ],
    groundingSources: CASE_GUIDES.fine.groundingSources
  },
  coe: {
    title: 'शैक्षणिक स्थिति: Show Cause और आपका CoE रद्द करने का इरादा',
    org: 'Westhaven University, Melbourne (काल्पनिक विश्वविद्यालय)',
    amount: 'नामांकन समाप्ति और ट्यूशन फ़ीस का नुकसान',
    deadline: 'पत्र मिलने के 20 कार्यदिवसों के भीतर अपील दायर करें (20 जुलाई 2026 तक)',
    difficulty: '⭐⭐⭐⭐ (ज़्यादा — वीज़ा रद्द होने का खतरा)',
    summary: 'पहले सेमेस्टर में सभी विषयों में फेल होने (या लगातार सेमेस्टरों में न्यूनतम शैक्षणिक प्रगति न होने) के बाद, Westhaven University, Li Wei Chen का नामांकन समाप्त करने और CoE (Confirmation of Enrolment) रद्द करने का इरादा रखती है।',
    tips: [
      'आपको 20 कार्यदिवसों की सख़्त समय-सीमा के भीतर लिखित अपील दायर करनी ही होगी! चूक जाने पर विश्वविद्यालय Home Affairs को सूचित करेगा और आपका स्टूडेंट वीज़ा रद्द होने की ओर बढ़ सकता है।',
      '"Compassionate & Compelling" परिस्थितियों के विस्तृत सबूत जुटाएँ — जैसे अचानक बीमारी या डिप्रेशन (ऑस्ट्रेलिया में पंजीकृत डॉक्टर के पत्र और निदान के साथ), या परिवार के किसी करीबी सदस्य से जुड़ी गंभीर घटना।',
      'एक व्यावहारिक Study Plan तैयार करें, जिसमें बुक किए गए शैक्षणिक सहायता सत्रों का रिकॉर्ड हो, ताकि Academic Progress Committee को दिखा सकें कि आप अगले सेमेस्टर में पटरी पर लौट सकते हैं।'
    ],
    groundingSources: CASE_GUIDES.coe.groundingSources
  },
  bond: {
    title: 'किराया: एजेंट आपके बॉन्ड का हिस्सा रोक रहा है',
    org: 'Horizon Residential VIC (काल्पनिक रियल एस्टेट एजेंट)',
    amount: '$420.00 AUD (प्रस्तावित कटौती)',
    deadline: '14 जुलाई 2026, शाम 5:00 बजे तक (10 कार्यदिवसों के भीतर)',
    difficulty: '⭐⭐ (मध्यम — किरायेदारी कानून से आमतौर पर पूरी राशि वापस मिल जाती है)',
    summary: 'किरायेदार Alex Thompson के 4/85 Bourke Street छोड़ने के बाद, एजेंट Horizon ने बॉन्ड से $420 काटने का प्रस्ताव रखा: कालीन की स्टीम क्लीनिंग के $180, किचन टाइल्स की चिकनाई साफ़ करने के $90 और लिविंग रूम की दीवार पर निशानों के $150।',
    tips: [
      'कालीन की सफ़ाई: Residential Tenancies Act (VIC) के तहत, जब तक आपने सामान्य इस्तेमाल से ज़्यादा दाग नहीं छोड़े हैं, एजेंट आमतौर पर प्रोफ़ेशनल स्टीम क्लीनिंग की माँग नहीं कर सकता। सामान्य टूट-फूट (fair wear and tear) कानून द्वारा संरक्षित अधिकार है।',
      'दीवार पर मामूली नुकसान: रोज़मर्रा के रहने से आई छोटी खरोंचें और हल्की घिसावट सामान्य टूट-फूट मानी जाती हैं, इसलिए मकान मालिक आमतौर पर मरम्मत का खर्च आप पर नहीं डाल सकता।',
      'पहले ऑनलाइन कदम उठाएँ: RTBA बॉन्ड सिस्टम में लॉग इन करें और पूरा बॉन्ड वापस पाने का दावा करें। अगर एजेंट असहमत है, तो उसे अपना दावा साबित करने के लिए 14 दिनों के भीतर VCAT में आवेदन करना होगा, वरना बॉन्ड आपको लौटा दिया जाएगा। VCAT एक स्वतंत्र ट्रिब्यूनल है जहाँ दोनों पक्षों को सबूत देने होते हैं — यह अपने-आप पूरी वापसी नहीं है, लेकिन एजेंट अक्सर दावा साबित करने की झंझट के बजाय समझौता कर लेते हैं।'
    ],
    groundingSources: CASE_GUIDES.bond.groundingSources
  },
  plagiarism: {
    title: 'शैक्षणिक ईमानदारी: साहित्यिक चोरी (plagiarism) का आरोप',
    org: 'Westhaven University (काल्पनिक शैक्षणिक ईमानदारी समिति)',
    amount: 'असेसमेंट में शून्य अंक / फेल होने की चेतावनी',
    deadline: '28 जून 2026 तक उपस्थिति की पुष्टि करें; 3 जुलाई को इंटरव्यू',
    difficulty: '⭐⭐⭐⭐⭐ (बहुत ज़्यादा — गंभीर अनुपालन मामला)',
    summary: 'आरोप है कि Sarah Chen के ECON101 Assignment 2 में डेटाबेस और ऑनलाइन स्रोतों से 48% समानता है, जिससे शैक्षणिक कदाचार का संदेह पैदा हुआ है।',
    tips: [
      'अपने लेखन का पूरा इतिहास जुटाएँ: Word का वर्ज़न हिस्ट्री और ट्रैक चेंजेज़, Git कमिट, हाथ से बनाए माइंड मैप और आपके इस्तेमाल किए गए लेक्चर नोट्स।',
      'साहित्यिक चोरी और गलत संदर्भ देने का फ़र्क समझें। अगर समस्या छूटे हुए या गलत फ़ॉर्मैट वाले संदर्भों की है, तो इंटरव्यू में बताएँ कि यह अनजाने में हुआ शैक्षणिक कदाचार (non-intentional academic misconduct) था, जिससे नतीजा घटकर चेतावनी हो सकता है।',
      'आप अपने विश्वविद्यालय से एक मुफ़्त, स्वतंत्र Student Advocate माँग सकते हैं, जो इंटरव्यू में आपके साथ रहे और बताए कि क्या कहना है।'
    ],
    groundingSources: CASE_GUIDES.plagiarism.groundingSources
  },
  noise: {
    title: 'सामुदायिक जीवन: देर रात शोर का उल्लंघन नोटिस',
    org: 'Meridian Strata Management VIC (काल्पनिक स्ट्राटा मैनेजर)',
    amount: 'चेतावनी; दोबारा उल्लंघन पर VCAT आदेश और जुर्माना हो सकता है',
    deadline: '6 जुलाई 2026 तक लिखित जवाब दें (मिलने के 14 दिनों के भीतर)',
    difficulty: '⭐ (कम — आमतौर पर अपनी आदतें बदलने से सुलझ जाता है)',
    summary: 'पिछले चार हफ़्तों में रात 10:00 बजे के बाद तेज़ संगीत और मेल-जोल की कई शिकायतों के बाद, Apartment 4B, 88 Flinders Lane के निवासी को Owners Corporation से उल्लंघन नोटिस मिला है।',
    tips: [
      'शांत समय: ऑस्ट्रेलिया का हर राज्य रिहायशी शोर को नियंत्रित करता है। कामकाजी दिनों में लगभग रात 10:00 / 11:00 बजे से सुबह 7:00 बजे तक शांत समय होता है — ऐसा शोर न करें जिससे पड़ोसी परेशान हों।',
      'यह मुख्य रूप से एक औपचारिक चेतावनी (Breach Notice) है। समय-सीमा से पहले विनम्रता से लिखित जवाब दें, स्थिति समझाएँ और शोर कम रखने का वादा करें — शांत और सहयोगी जवाब से आमतौर पर मामला सुलझ जाता है।'
    ],
    groundingSources: CASE_GUIDES.noise.groundingSources
  },
  utility: {
    title: 'घरेलू बिल: बकाया यूटिलिटी बिल और कनेक्शन काटने की चेतावनी',
    org: 'Coastal Energy & Water (काल्पनिक यूटिलिटी कंपनी)',
    amount: '$258.30 AUD (बकाया, लेट फ़ीस सहित)',
    deadline: 'कनेक्शन कटने और दोबारा जोड़ने की फ़ीस से बचने के लिए 1 जुलाई 2026 तक भुगतान करें',
    difficulty: '⭐ (कम — आप तुरंत बिना ब्याज भुगतान की मोहलत माँग सकते हैं)',
    summary: 'Mrs. Eleanor Vance के खाते 9876 543 210 में दो बिलिंग अवधियों का कुल $258.30 बकाया है, और उन्हें कनेक्शन काटने की चेतावनी मिली है।',
    tips: [
      'मज़बूत उपभोक्ता सुरक्षा: कंपनियों को आमतौर पर अत्यधिक मौसम में, सप्ताहांत पर या सार्वजनिक छुट्टियों से ठीक पहले घरों का कनेक्शन काटने की अनुमति नहीं होती।',
      'अपने बिल पर दिए नंबर पर कॉल करें, या लॉग इन करें, और "Hardship Program" से जुड़ें। अनुरोध करते ही ब्याज और लेट फ़ीस माफ़ हो जाती है और आपको 12–24 महीनों की छोटी, बिना ब्याज वाली भुगतान योजना मिल सकती है।',
      'आपकी कंपनी राज्य सरकार की राहत योजना (जैसे VIC में Utility Relief Grant Scheme) के लिए आवेदन करने में भी मदद कर सकती है, जो प्रति घर कई सौ डॉलर की होती है और पूरे या ज़्यादातर बकाये को चुका सकती है।'
    ],
    groundingSources: CASE_GUIDES.utility.groundingSources
  }
};

// Vietnamese (vi) version of CASE_GUIDES. URLs, amounts, org names and proper-noun legal terms stay as-is.
const CASE_GUIDES_VI: typeof CASE_GUIDES = {
  fine: {
    title: 'Khiếu nại phạt đỗ xe: vi phạm đỗ xe của hội đồng thành phố',
    org: 'City of Brentmoor (hội đồng thành phố hư cấu)',
    amount: '$85.00 AUD',
    deadline: 'Nộp phạt hoặc yêu cầu xem xét lại trước ngày 1/5/2026',
    difficulty: '⭐ (Thấp — rất có thể được đổi thành cảnh cáo thay vì phạt tiền)',
    summary: 'City of Brentmoor đã ra thông báo vi phạm đỗ xe, cho rằng một chiếc Toyota Corolla màu đỏ (biển số ABC-123) đã dừng trong khu vực cấm dừng trên Flinders Lane.',
    tips: [
      'Nếu bạn không có vi phạm lái xe nào trong 3 năm qua, bạn có thể gửi văn bản đề nghị hội đồng thay khoản phạt bằng "Official Warning" (khoan hồng cho lần vi phạm đầu).',
      'Nếu bạn dừng xe vì tình huống khẩn cấp, xe hỏng hoặc cần cấp cứu y tế, hãy đính kèm biên bản cứu hộ RACV hoặc giấy xác nhận của bệnh viện — những trường hợp xem xét lại như vậy thường thành công.',
      'Nếu biển "No Stopping / giới hạn thời gian" bị cây che khuất, hoặc vạch kẻ đường bị mờ nặng, hãy chụp ảnh — đây là căn cứ mạnh để yêu cầu xem xét lại.'
    ],
    groundingSources: CASE_GUIDES.fine.groundingSources
  },
  coe: {
    title: 'Tình trạng học tập: Show Cause và ý định hủy CoE của bạn',
    org: 'Westhaven University, Melbourne (trường đại học hư cấu)',
    amount: 'Bị chấm dứt ghi danh và mất học phí',
    deadline: 'Nộp đơn khiếu nại trong vòng 20 ngày làm việc kể từ khi nhận thư (trước ngày 20/7/2026)',
    difficulty: '⭐⭐⭐⭐ (Cao — nguy cơ bị hủy thị thực)',
    summary: 'Sau khi trượt tất cả các môn trong học kỳ đầu (hoặc không đạt tiến độ học tập tối thiểu qua nhiều học kỳ liên tiếp), Westhaven University dự định chấm dứt ghi danh của Li Wei Chen và hủy CoE (Confirmation of Enrolment).',
    tips: [
      'Bạn bắt buộc phải nộp đơn khiếu nại bằng văn bản trong thời hạn nghiêm ngặt 20 ngày làm việc! Nếu lỡ hạn, trường sẽ báo cáo lên Home Affairs và thị thực du học của bạn có thể bị xem xét hủy.',
      'Thu thập bằng chứng chi tiết về hoàn cảnh "Compassionate & Compelling" — ví dụ ốm đột ngột hoặc trầm cảm (kèm thư và chẩn đoán của bác sĩ đăng ký hành nghề tại Úc), hoặc biến cố nghiêm trọng của người thân trong gia đình.',
      'Chuẩn bị một Study Plan thực tế, kèm lịch các buổi hỗ trợ học tập đã đặt, để chứng minh với Academic Progress Committee rằng bạn có thể trở lại đúng hướng trong học kỳ tới.'
    ],
    groundingSources: CASE_GUIDES.coe.groundingSources
  },
  bond: {
    title: 'Thuê nhà: đại lý giữ lại một phần tiền đặt cọc',
    org: 'Horizon Residential VIC (đại lý bất động sản hư cấu)',
    amount: '$420.00 AUD (đề xuất khấu trừ)',
    deadline: 'Trước 5:00 PM ngày 14/7/2026 (trong vòng 10 ngày làm việc)',
    difficulty: '⭐⭐ (Trung bình — luật thuê nhà thường giúp bạn lấy lại toàn bộ)',
    summary: 'Sau khi người thuê Alex Thompson dọn khỏi 4/85 Bourke Street, đại lý Horizon đề xuất trừ $420 từ tiền cọc: $180 giặt hơi thảm, $90 tẩy dầu mỡ gạch bếp và $150 cho vết bẩn trên tường phòng khách.',
    tips: [
      'Vệ sinh thảm: theo Residential Tenancies Act (VIC), trừ khi bạn để lại vết bẩn vượt quá mức sử dụng bình thường, đại lý thường không được yêu cầu giặt hơi chuyên nghiệp. Hao mòn hợp lý (fair wear and tear) là quyền được pháp luật bảo vệ.',
      'Hư hại nhẹ trên tường: các vết trầy nhỏ và hao mòn nhẹ do sinh hoạt hằng ngày được tính là hao mòn hợp lý, nên chủ nhà thường không được bắt bạn chịu chi phí sửa chữa.',
      'Chủ động trực tuyến trước: đăng nhập hệ thống tiền cọc RTBA và yêu cầu hoàn toàn bộ tiền cọc. Nếu đại lý không đồng ý, họ phải nộp đơn lên VCAT trong vòng 14 ngày để chứng minh yêu cầu của mình, nếu không tiền cọc sẽ được trả lại cho bạn. VCAT là tòa trọng tài độc lập, hai bên đều phải đưa ra bằng chứng — đây không phải hoàn tiền tự động, nhưng đại lý thường chọn thương lượng thay vì mất công chứng minh.'
    ],
    groundingSources: CASE_GUIDES.bond.groundingSources
  },
  plagiarism: {
    title: 'Liêm chính học thuật: cáo buộc đạo văn',
    org: 'Westhaven University (hội đồng liêm chính học thuật hư cấu)',
    amount: 'Điểm 0 cho bài đánh giá / cảnh báo trượt môn',
    deadline: 'Xác nhận tham dự trước ngày 28/6/2026; buổi làm việc vào ngày 3/7',
    difficulty: '⭐⭐⭐⭐⭐ (Rất cao — vấn đề tuân thủ nghiêm trọng)',
    summary: 'Bài ECON101 Assignment 2 của Sarah Chen bị cho là trùng lặp 48% với cơ sở dữ liệu và nguồn trực tuyến, dẫn đến nghi ngờ vi phạm học thuật.',
    tips: [
      'Thu thập toàn bộ lịch sử soạn thảo: lịch sử phiên bản và theo dõi thay đổi trong Word, các commit Git, sơ đồ tư duy viết tay và ghi chép bài giảng bạn đã dùng.',
      'Hiểu rõ sự khác nhau giữa đạo văn và trích dẫn sai. Nếu vấn đề là thiếu trích dẫn hoặc trích dẫn sai định dạng, hãy trình bày trong buổi làm việc rằng đây là vi phạm học thuật không cố ý (non-intentional academic misconduct), có thể giúp giảm xuống mức cảnh cáo.',
      'Bạn có thể yêu cầu một Student Advocate độc lập, miễn phí của trường tham dự buổi làm việc cùng bạn và tư vấn bạn nên nói gì.'
    ],
    groundingSources: CASE_GUIDES.plagiarism.groundingSources
  },
  noise: {
    title: 'Sống chung cộng đồng: thông báo vi phạm tiếng ồn ban đêm',
    org: 'Meridian Strata Management VIC (ban quản lý chung cư hư cấu)',
    amount: 'Cảnh cáo; tái phạm có thể dẫn đến lệnh của VCAT và tiền phạt',
    deadline: 'Trả lời bằng văn bản trước ngày 6/7/2026 (trong vòng 14 ngày kể từ khi nhận)',
    difficulty: '⭐ (Thấp — thường giải quyết được bằng cách điều chỉnh sinh hoạt)',
    summary: 'Người ở căn hộ 4B, 88 Flinders Lane nhận thông báo vi phạm từ Owners Corporation sau nhiều lần bị phàn nàn về nhạc to và tụ tập sau 10:00 PM trong bốn tuần qua.',
    tips: [
      'Giờ yên tĩnh: mọi tiểu bang của Úc đều quy định về tiếng ồn khu dân cư. Vào các đêm trong tuần, khoảng từ 10:00 / 11:00 PM đến 7:00 AM là giờ yên tĩnh — tránh gây tiếng ồn làm phiền hàng xóm.',
      'Đây chủ yếu là cảnh cáo chính thức (Breach Notice). Hãy trả lời lịch sự bằng văn bản trước hạn, giải thích tình huống và cam kết giữ yên lặng — một phản hồi bình tĩnh, hợp tác thường giải quyết được vấn đề.'
    ],
    groundingSources: CASE_GUIDES.noise.groundingSources
  },
  utility: {
    title: 'Hóa đơn gia đình: hóa đơn tiện ích quá hạn và cảnh báo cắt dịch vụ',
    org: 'Coastal Energy & Water (nhà cung cấp tiện ích hư cấu)',
    amount: '$258.30 AUD (quá hạn, gồm phí trễ hạn)',
    deadline: 'Thanh toán trước ngày 1/7/2026 để tránh bị cắt và phí kết nối lại',
    difficulty: '⭐ (Thấp — bạn có thể xin gia hạn thanh toán không lãi ngay lập tức)',
    summary: 'Tài khoản 9876 543 210 của Mrs. Eleanor Vance có hai kỳ hóa đơn quá hạn, tổng cộng $258.30, và bà đã nhận được cảnh báo cắt dịch vụ.',
    tips: [
      'Bảo vệ người tiêu dùng mạnh mẽ: nhà cung cấp thường không được cắt dịch vụ của hộ gia đình khi thời tiết khắc nghiệt, vào cuối tuần hoặc ngay trước ngày lễ.',
      'Gọi số điện thoại trên hóa đơn, hoặc đăng nhập, và tham gia "Hardship Program". Khi bạn yêu cầu, lãi và phí trễ hạn sẽ được miễn và bạn có thể được trả góp nhỏ không lãi trong 12–24 tháng.',
      'Nhà cung cấp cũng có thể giúp bạn xin trợ cấp của chính quyền tiểu bang (ví dụ Utility Relief Grant Scheme ở VIC), trị giá vài trăm đô mỗi hộ, có thể trả toàn bộ hoặc phần lớn khoản nợ.'
    ],
    groundingSources: CASE_GUIDES.utility.groundingSources
  }
};

// Arabic (ar) version of CASE_GUIDES. URLs, amounts, org names and proper-noun legal terms stay as-is.
const CASE_GUIDES_AR: typeof CASE_GUIDES = {
  fine: {
    title: 'الاعتراض على مخالفة وقوف: مخالفة صادرة عن المجلس البلدي',
    org: 'City of Brentmoor (مجلس بلدي خيالي)',
    amount: '$85.00 AUD',
    deadline: 'ادفع أو اطلب المراجعة قبل 1 مايو 2026',
    difficulty: '⭐ (منخفضة — من الممكن جدًا الحصول على إنذار بدل الغرامة)',
    summary: 'أصدر City of Brentmoor مخالفة وقوف تدّعي أن سيارة Toyota Corolla حمراء (لوحة ABC-123) توقفت في منطقة يُمنع فيها التوقف في Flinders Lane.',
    tips: [
      'إذا كان سجل قيادتك نظيفًا خلال السنوات الثلاث الماضية، يمكنك أن تطلب كتابيًا من المجلس استبدال الغرامة بـ "Official Warning" (تساهل في المخالفة الأولى).',
      'إذا توقفت بسبب حالة طارئة أو عطل في السيارة أو حاجة طبية عاجلة، فأرفق سجل مساعدة الطريق من RACV أو شهادة من المستشفى — فمثل هذه المراجعات تنجح في كثير من الأحيان.',
      'إذا كانت لافتة "No Stopping / الحد الزمني" محجوبة بالأشجار، أو كانت علامات الطريق باهتة جدًا، فالتقط صورًا — فهذا سبب قوي لطلب المراجعة.'
    ],
    groundingSources: CASE_GUIDES.fine.groundingSources
  },
  coe: {
    title: 'الوضع الأكاديمي: Show Cause ونية إلغاء CoE الخاص بك',
    org: 'Westhaven University, Melbourne (جامعة خيالية)',
    amount: 'إنهاء التسجيل وخسارة الرسوم الدراسية',
    deadline: 'قدّم طعنًا خلال 20 يوم عمل من استلام الرسالة (قبل 20 يوليو 2026)',
    difficulty: '⭐⭐⭐⭐ (عالية — خطر إلغاء التأشيرة)',
    summary: 'بعد الرسوب في جميع المواد في الفصل الأول (أو عدم تحقيق الحد الأدنى من التقدم الأكاديمي في فصول متتالية)، تعتزم Westhaven University إنهاء تسجيل Li Wei Chen وإلغاء CoE (Confirmation of Enrolment).',
    tips: [
      'يجب أن تقدّم طعنًا مكتوبًا خلال المهلة الصارمة البالغة 20 يوم عمل! إذا فاتتك، ستُبلغ الجامعة Home Affairs وقد تتجه تأشيرتك الدراسية نحو الإلغاء.',
      'اجمع أدلة مفصّلة على الظروف "Compassionate & Compelling" — مثل مرض مفاجئ أو اكتئاب (مع رسالة وتشخيص من طبيب مسجَّل في أستراليا)، أو حدث خطير أصاب أحد أفراد عائلتك المقرّبين.',
      'أعدّ Study Plan واقعية، مع سجلات جلسات الدعم الأكاديمي المحجوزة، لتُثبت لـ Academic Progress Committee أنك قادر على العودة إلى المسار الصحيح في الفصل القادم.'
    ],
    groundingSources: CASE_GUIDES.coe.groundingSources
  },
  bond: {
    title: 'الإيجار: الوكيل يحتجز جزءًا من تأمين الإيجار',
    org: 'Horizon Residential VIC (وكيل عقاري خيالي)',
    amount: '$420.00 AUD (الخصم المقترح)',
    deadline: 'قبل الساعة 5:00 مساءً في 14 يوليو 2026 (خلال 10 أيام عمل)',
    difficulty: '⭐⭐ (متوسطة — يسمح لك قانون الإيجار عادةً باسترداده كاملًا)',
    summary: 'بعد أن غادر المستأجر Alex Thompson العقار 4/85 Bourke Street، اقترح الوكيل Horizon خصم $420 من التأمين: $180 لتنظيف السجاد بالبخار، و$90 لإزالة الدهون عن بلاط المطبخ، و$150 لعلامات على جدار غرفة المعيشة.',
    tips: [
      'تنظيف السجاد: بموجب Residential Tenancies Act (VIC)، ما لم تترك بقعًا تتجاوز الاستخدام العادي، لا يحق للوكيل عمومًا أن يشترط التنظيف الاحترافي بالبخار. الاستهلاك العادي (fair wear and tear) حق يحميه القانون.',
      'الأضرار الطفيفة في الجدران: الخدوش الصغيرة والاهتراء الخفيف الناتج عن السكن اليومي يُعدّان استهلاكًا عاديًا، لذا لا يحق للمالك عمومًا تحميلك تكلفة الإصلاح.',
      'بادر أولًا عبر الإنترنت: سجّل الدخول إلى نظام التأمينات لدى RTBA واطلب استرداد التأمين كاملًا. إذا اعترض الوكيل، فعليه التقدّم إلى VCAT خلال 14 يومًا لإثبات مطالبته، وإلا يُعاد التأمين إليك. VCAT هيئة قضائية مستقلة يقدّم فيها الطرفان الأدلة — فهو ليس استردادًا كاملًا تلقائيًا، لكن الوكلاء كثيرًا ما يفضّلون التسوية على عناء إثبات مطالبتهم.'
    ],
    groundingSources: CASE_GUIDES.bond.groundingSources
  },
  plagiarism: {
    title: 'النزاهة الأكاديمية: اتهام بالانتحال',
    org: 'Westhaven University (لجنة نزاهة أكاديمية خيالية)',
    amount: 'صفر درجات في التقييم / إنذار بالرسوب',
    deadline: 'أكّد حضورك قبل 28 يونيو 2026؛ المقابلة في 3 يوليو',
    difficulty: '⭐⭐⭐⭐⭐ (عالية جدًا — مسألة امتثال خطيرة)',
    summary: 'يُدّعى أن Assignment 2 في مادة ECON101 للطالبة Sarah Chen يتطابق بنسبة 48% مع قواعد بيانات ومصادر على الإنترنت، مما يثير الاشتباه في سوء سلوك أكاديمي.',
    tips: [
      'اجمع سجل مسوّداتك كاملًا: سجل الإصدارات وتتبّع التغييرات في Word، وعمليات commit في Git، والخرائط الذهنية المكتوبة بخط اليد، وملاحظات المحاضرات التي استخدمتها.',
      'افهم الفرق بين الانتحال وضعف التوثيق. إذا كانت المشكلة في مراجع ناقصة أو سيئة التنسيق، فاحتجّ في المقابلة بأنه سوء سلوك أكاديمي غير متعمَّد (non-intentional academic misconduct)، مما قد يخفّف النتيجة إلى إنذار.',
      'يمكنك أن تطلب من جامعتك Student Advocate مستقلًا ومجانيًا يحضر المقابلة معك وينصحك بما تقوله.'
    ],
    groundingSources: CASE_GUIDES.plagiarism.groundingSources
  },
  noise: {
    title: 'العيش المشترك: إشعار مخالفة بسبب الضوضاء ليلًا',
    org: 'Meridian Strata Management VIC (إدارة عقارات مشتركة خيالية)',
    amount: 'إنذار؛ وقد يؤدي تكرار المخالفة إلى أوامر من VCAT وغرامات',
    deadline: 'ردّ كتابيًا قبل 6 يوليو 2026 (خلال 14 يومًا من الاستلام)',
    difficulty: '⭐ (منخفضة — تُحلّ عادةً بتعديل عاداتك)',
    summary: 'تلقّى ساكن الشقة 4B في 88 Flinders Lane إشعار مخالفة من Owners Corporation بعد شكاوى متعددة من الموسيقى الصاخبة والتجمعات بعد الساعة 10:00 مساءً خلال الأسابيع الأربعة الماضية.',
    tips: [
      'ساعات الهدوء: تنظّم كل ولاية أسترالية الضوضاء في المناطق السكنية. في ليالي أيام الأسبوع، تكون الفترة من نحو 10:00 / 11:00 مساءً حتى 7:00 صباحًا فترة هدوء — تجنّب الضوضاء التي تزعج جيرانك.',
      'هذا في الأساس إنذار رسمي (Breach Notice). ردّ كتابيًا وبأدب قبل الموعد النهائي، واشرح الموقف والتزم بخفض الضوضاء — فالرد الهادئ والمتعاون يُنهي المسألة عادةً.'
    ],
    groundingSources: CASE_GUIDES.noise.groundingSources
  },
  utility: {
    title: 'فواتير المنزل: فاتورة خدمات متأخرة وإنذار بقطع الخدمة',
    org: 'Coastal Energy & Water (مزوّد خدمات خيالي)',
    amount: '$258.30 AUD (متأخرة، شاملة رسوم التأخير)',
    deadline: 'ادفع قبل 1 يوليو 2026 لتجنّب القطع ورسوم إعادة التوصيل',
    difficulty: '⭐ (منخفضة — يمكنك طلب تمديد للدفع دون فوائد فورًا)',
    summary: 'على حساب Mrs. Eleanor Vance رقم 9876 543 210 فترتا فوترة متأخرتان بإجمالي $258.30، وقد تلقّت إنذارًا بقطع الخدمة.',
    tips: [
      'حماية قوية للمستهلك: لا يُسمح للمزوّدين عمومًا بقطع الخدمة عن المنازل في الطقس القاسي أو في عطلات نهاية الأسبوع أو قبيل العطلات الرسمية.',
      'اتصل بالرقم المدوّن على فاتورتك، أو سجّل الدخول، وانضم إلى "Hardship Program". بمجرد أن تطلب ذلك، تُلغى الفوائد ورسوم التأخير ويمكنك الحصول على خطة سداد صغيرة دون فوائد على مدى 12–24 شهرًا.',
      'يمكن لمزوّدك أيضًا مساعدتك في التقدّم للحصول على دعم حكومة الولاية (مثل Utility Relief Grant Scheme في VIC)، بقيمة عدة مئات من الدولارات لكل منزل، مما قد يغطي الدين كله أو معظمه.'
    ],
    groundingSources: CASE_GUIDES.utility.groundingSources
  }
};

const CASE_GUIDES_BY_LANG: Record<GuideLang, typeof CASE_GUIDES> = {
  zh: CASE_GUIDES,
  en: CASE_GUIDES_EN,
  es: CASE_GUIDES_ES,
  hi: CASE_GUIDES_HI,
  vi: CASE_GUIDES_VI,
  ar: CASE_GUIDES_AR
};

// Short month labels for the deadline calendar badge (zh renders "N月" inline).
const MONTH_ABBR: Record<Exclude<GuideLang, 'zh'>, string[]> = {
  en: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
  es: ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'],
  hi: ['जन','फ़र','मार्च','अप्रैल','मई','जून','जुल','अग','सित','अक्टू','नव','दिस'],
  vi: ['TH1','TH2','TH3','TH4','TH5','TH6','TH7','TH8','TH9','TH10','TH11','TH12'],
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
};

// The 5 "agent steps" shown while a letter is being analysed.
const AGENT_STEPS: Record<GuideLang, { step: number; title: string; success: string; pending: string }[]> = {
  zh: [
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
                    
  ],
  en: [
    {
      step: 1,
      title: "Step 1: 🔍 Read / scan → extract key structure",
      success: "Captured key details, dates, and amounts or fines.",
      pending: "Reading the key fields of the notice, letter or contract..."
    },
    {
      step: 2,
      title: "Step 2: ⚖️ Grounding against current Australian law",
      success: "Matched the relevant tenancy / traffic rules, fair wear and tear provisions and past VCAT decisions.",
      pending: "Searching local tribunal rules and dispute resolution sources online..."
    },
    {
      step: 3,
      title: "Step 3: ✍️ Drafting a bilingual reply",
      success: "Built a formal written response with its intent clearly labelled.",
      pending: "Checking for conflicts between the parties' terms and working out the most effective response..."
    },
    {
      step: 4,
      title: "Step 4: 📅 Creating a deadline calendar event",
      success: "Calculated the deadline in the right time zone and prepared a one-click .ics file.",
      pending: "Encoding a calendar event so you don't miss the deadline..."
    },
    {
      step: 5,
      title: "Step 5: 📧 Straight to Gmail for the agency / agent",
      success: "Gmail link pre-filled with recipient and message — ready to go!",
      pending: "Preparing your Gmail link..."
    }
                    
  ],
  es: [
    {
      step: 1,
      title: "Paso 1: 🔍 Leer / escanear → extraer la estructura clave",
      success: "Datos clave, fechas e importes o multas registrados.",
      pending: "Leyendo los campos clave del aviso, carta o contrato..."
    },
    {
      step: 2,
      title: "Paso 2: ⚖️ Contraste con la legislación australiana vigente",
      success: "Normas de alquiler / tráfico aplicables, disposiciones sobre desgaste normal y resoluciones previas de VCAT localizadas.",
      pending: "Buscando en línea normas de tribunales locales y fuentes de resolución de disputas..."
    },
    {
      step: 3,
      title: "Paso 3: ✍️ Redactando una respuesta bilingüe",
      success: "Respuesta formal por escrito creada, con su intención claramente indicada.",
      pending: "Revisando conflictos entre las condiciones de ambas partes y buscando la respuesta más eficaz..."
    },
    {
      step: 4,
      title: "Paso 4: 📅 Creando un evento de calendario con el plazo",
      success: "Plazo calculado en la zona horaria correcta y archivo .ics listo con un clic.",
      pending: "Codificando un evento de calendario para que no se te pase el plazo..."
    },
    {
      step: 5,
      title: "Paso 5: 📧 Directo a Gmail para la organización / agencia",
      success: "Enlace de Gmail con destinatario y mensaje ya completados: ¡listo para enviar!",
      pending: "Preparando tu enlace de Gmail..."
    }
  ],
  hi: [
    {
      step: 1,
      title: "चरण 1: 🔍 पढ़ना / स्कैन → मुख्य ढाँचा निकालना",
      success: "मुख्य विवरण, तारीखें और राशि या जुर्माना दर्ज किए गए।",
      pending: "नोटिस, पत्र या अनुबंध के मुख्य फ़ील्ड पढ़े जा रहे हैं..."
    },
    {
      step: 2,
      title: "चरण 2: ⚖️ मौजूदा ऑस्ट्रेलियाई कानून से मिलान",
      success: "संबंधित किरायेदारी / यातायात नियम, सामान्य टूट-फूट के प्रावधान और पिछले VCAT फ़ैसले मिलाए गए।",
      pending: "स्थानीय ट्रिब्यूनल नियम और विवाद समाधान स्रोत ऑनलाइन खोजे जा रहे हैं..."
    },
    {
      step: 3,
      title: "चरण 3: ✍️ द्विभाषी जवाब का मसौदा",
      success: "औपचारिक लिखित जवाब तैयार, उसकी मंशा साफ़ तौर पर चिह्नित।",
      pending: "दोनों पक्षों की शर्तों में टकराव जाँचा जा रहा है और सबसे असरदार जवाब तय किया जा रहा है..."
    },
    {
      step: 4,
      title: "चरण 4: 📅 समय-सीमा का कैलेंडर इवेंट बनाना",
      success: "सही टाइम ज़ोन में समय-सीमा की गणना हुई और एक-क्लिक .ics फ़ाइल तैयार है।",
      pending: "कैलेंडर इवेंट बनाया जा रहा है ताकि आपकी समय-सीमा न छूटे..."
    },
    {
      step: 5,
      title: "चरण 5: 📧 संस्था / एजेंट के लिए सीधे Gmail",
      success: "प्राप्तकर्ता और संदेश के साथ Gmail लिंक तैयार — भेजने के लिए तैयार!",
      pending: "आपका Gmail लिंक तैयार किया जा रहा है..."
    }
  ],
  vi: [
    {
      step: 1,
      title: "Bước 1: 🔍 Đọc / quét → trích xuất cấu trúc chính",
      success: "Đã ghi nhận thông tin chính, ngày tháng và số tiền hoặc tiền phạt.",
      pending: "Đang đọc các trường chính của thông báo, thư hoặc hợp đồng..."
    },
    {
      step: 2,
      title: "Bước 2: ⚖️ Đối chiếu với luật hiện hành của Úc",
      success: "Đã đối chiếu các quy định thuê nhà / giao thông liên quan, điều khoản hao mòn hợp lý và các phán quyết VCAT trước đây.",
      pending: "Đang tìm trực tuyến quy định của tòa trọng tài địa phương và nguồn giải quyết tranh chấp..."
    },
    {
      step: 3,
      title: "Bước 3: ✍️ Soạn thư trả lời song ngữ",
      success: "Đã soạn phản hồi chính thức bằng văn bản, ghi rõ ý định.",
      pending: "Đang kiểm tra mâu thuẫn giữa điều khoản của hai bên và tìm cách phản hồi hiệu quả nhất..."
    },
    {
      step: 4,
      title: "Bước 4: 📅 Tạo sự kiện lịch cho hạn chót",
      success: "Đã tính hạn chót theo đúng múi giờ và chuẩn bị tệp .ics một chạm.",
      pending: "Đang tạo sự kiện lịch để bạn không lỡ hạn chót..."
    },
    {
      step: 5,
      title: "Bước 5: 📧 Gửi thẳng qua Gmail tới cơ quan / đại lý",
      success: "Liên kết Gmail đã điền sẵn người nhận và nội dung — sẵn sàng gửi!",
      pending: "Đang chuẩn bị liên kết Gmail của bạn..."
    }
  ],
  ar: [
    {
      step: 1,
      title: "الخطوة 1: 🔍 القراءة / المسح → استخراج البنية الأساسية",
      success: "تم التقاط التفاصيل الأساسية والتواريخ والمبالغ أو الغرامات.",
      pending: "جارٍ قراءة الحقول الأساسية في الإشعار أو الرسالة أو العقد..."
    },
    {
      step: 2,
      title: "الخطوة 2: ⚖️ المطابقة مع القانون الأسترالي الحالي",
      success: "تمت مطابقة قواعد الإيجار / المرور ذات الصلة وأحكام الاستهلاك العادي وقرارات VCAT السابقة.",
      pending: "جارٍ البحث عبر الإنترنت في قواعد الهيئات القضائية المحلية ومصادر حل النزاعات..."
    },
    {
      step: 3,
      title: "الخطوة 3: ✍️ صياغة رد ثنائي اللغة",
      success: "تم إعداد رد رسمي مكتوب مع توضيح الغرض منه بجلاء.",
      pending: "جارٍ فحص التعارض بين شروط الطرفين وتحديد الرد الأكثر فاعلية..."
    },
    {
      step: 4,
      title: "الخطوة 4: 📅 إنشاء حدث تقويم للموعد النهائي",
      success: "تم حساب الموعد النهائي بالمنطقة الزمنية الصحيحة وتجهيز ملف .ics بنقرة واحدة.",
      pending: "جارٍ إنشاء حدث التقويم حتى لا يفوتك الموعد النهائي..."
    },
    {
      step: 5,
      title: "الخطوة 5: 📧 مباشرة إلى Gmail للجهة / الوكيل",
      success: "رابط Gmail مُعبّأ مسبقًا بالمستلم والرسالة — جاهز للإرسال!",
      pending: "جارٍ تجهيز رابط Gmail الخاص بك..."
    }
  ]
};

// Normalize confidence into a 0-100 percentage: the live Gemini path returns a number,
// while fallback/legacy payloads may carry 'high' / 'medium' / 'low' strings.
function confidencePct(c: unknown): number {
  if (typeof c === 'number' && isFinite(c)) return Math.round(c <= 1 ? c * 100 : c);
  if (c === 'high') return 95;
  if (c === 'medium') return 75;
  if (c === 'low') return 50;
  const n = parseFloat(String(c));
  return isFinite(n) ? Math.round(n) : 90;
}

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
  const L = useL();
  // Per-language JSX (for copy that mixes text with <strong>/<span> elements).
  const LJ = (m: Record<GuideLang, React.ReactNode>) => m[language as GuideLang] ?? m.en;
  const guides = CASE_GUIDES_BY_LANG[language as GuideLang] ?? CASE_GUIDES_EN;
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
          const docRef = doc(getDb(), 'userProfiles', user.uid);
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

  useEffect(() => {
    // Setup real-time SSE stream for push notification callbacks (FCM fallback/sim)
    const eventSource = new EventSource("/api/fcm-notifications");
    
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("[FCM Push Received]", payload);
        
        // Show HTML5 browser Notification if granted
        if (Notification.permission === "granted") {
          new Notification(payload.title, {
            body: payload.body
          });
        }
        
        // Always show in-app toast for perfect visible clarity during jury testing!
        showToast(`🔔 ${payload.title}\n${payload.body}`, 'info');
      } catch (err) {
        console.error("Failed to parse incoming push notification payload:", err);
      }
    };
    
    eventSource.onerror = (e) => {
      console.warn("[FCM SSE] EventSource disconnected, retrying in background...", e);
    };

    return () => {
      eventSource.close();
    };
  }, []);

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
        const docRef = doc(getDb(), 'userProfiles', user.uid);
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
  
  // Offline Privacy Shield states
  const [privacyShieldActive, setPrivacyShieldActive] = useState(true);
  const [isScanningPII, setIsScanningPII] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  // Starts 'idle' — the shield only reports anything after a document is actually loaded.
  const [shieldStatus, setShieldStatus] = useState<'idle' | 'scanning' | 'secured'>('idle');

  useEffect(() => {
    if ((activeCase || filePreview) && privacyShieldActive) {
      setIsScanningPII(true);
      setShieldStatus('scanning');
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsScanningPII(false);
            setShieldStatus('secured');
            return 100;
          }
          return p + 20;
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (!privacyShieldActive) {
      setShieldStatus('idle');
      setIsScanningPII(false);
      setScanProgress(0);
    }
  }, [activeCase, filePreview, privacyShieldActive]);
  
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

  // The canvas image actually sent to Gemini mirrors the SAME facts as the on-screen
  // HTML document (renderDocumentHTML) and the CASE_GUIDES sidebar — issuer, amounts,
  // reference numbers and deadlines must all match, so the live AI analysis never
  // contradicts what the user sees as the "original letter".
  const loadExample = async (type: 'fine' | 'coe' | 'bond' | 'plagiarism' | 'noise' | 'utility') => {
    setActiveCase(type);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DOC_FACTS: Record<string, { bar: string; org: string; orgSub: string; title: string; lines: string[] }> = {
      fine: {
        bar: '#1d1d1f',
        org: 'CITY OF BRENTMOOR',
        orgSub: 'Municipal Corporation VIC · PO Box 15, Brentmoor VIC 3108',
        title: 'PARKING INFRINGEMENT NOTICE',
        lines: [
          'Notice No: INF0432198    Date of Issue: 5 April 2026',
          'Vehicle Reg: ABC-123 (Red Toyota Corolla sedan)',
          'Location: Flinders Lane, Melbourne VIC 3000',
          '',
          'Offence Code 204: Stopped in a Clearway / resident',
          'permit zone during restricted hours (Road Safety Act 1986).',
          '',
          'TOTAL AMOUNT OUTSTANDING: $85.00 AUD',
          'Payment is required no later than 1 May 2026.',
          'Failure to pay will result in referral to Fines Victoria.',
          '',
          'You may request an internal review of this notice in',
          'writing within 28 days, stating compassionate factors.',
        ],
      },
      coe: {
        bar: '#ff5a3c',
        org: 'WESTHAVEN UNIVERSITY',
        orgSub: 'Academic Progress Office, Melbourne · CRICOS 00123G',
        title: 'OUTCOME OF ACADEMIC PROGRESS COMMITTEE',
        lines: [
          'Student: Li Wei Chen    Student ID: 10987654',
          'Course: Master of Applied Data Analytics',
          'Notice Date: 18 June 2026    Ref: CAPC-2026-T1-881',
          '',
          'The CAPC noted that you failed all enrolled units in',
          'Semester 1 2026. The Committee has decided to',
          'TERMINATE your enrolment, effective 22 June 2026.',
          '',
          'Your Confirmation of Enrolment (CoE) will be cancelled',
          'and reported to the Department of Home Affairs; your',
          'Student Visa (Subclass 500) may be subject to cancellation.',
          '',
          'Right of appeal: a formal written appeal must be',
          'submitted within 20 business days,',
          'by 5:00 PM on 20 July 2026.',
        ],
      },
      bond: {
        bar: '#3B82F6',
        org: 'HORIZON RESIDENTIAL VIC',
        orgSub: 'Suite 401, 123 Flinders Lane, Melbourne VIC 3000',
        title: 'NOTICE OF INTENTION TO CLAIM RENTAL BOND',
        lines: [
          'Tenant: Alex Thompson',
          'Premises: 4/85 Bourke Street, Melbourne VIC 3000',
          'Date: 30 June 2026    Ref: HZN-2026-8839',
          'Total bond held: $2,100.00 AUD',
          '',
          'Proposed deductions:',
          '  1. Carpet steam cleaning ............. $180.00',
          '  2. Kitchen tile de-greasing .......... $90.00',
          '  3. Living-room wall repair ........... $150.00',
          'TOTAL PROPOSED CLAIM DEDUCTION: $420.00 AUD',
          '',
          'If you disagree, respond in writing or dispute via',
          'Consumer Affairs Victoria no later than',
          '5:00 PM on 14 July 2026.',
        ],
      },
      plagiarism: {
        bar: '#EF4444',
        org: 'WESTHAVEN UNIVERSITY',
        orgSub: 'Academic Integrity Office, Melbourne',
        title: 'ACADEMIC INTEGRITY ALLEGATION',
        lines: [
          'Student: Sarah Chen    Student ID: 10987654',
          'Unit: ECON101 Introduction to Economics',
          'Reference No: AIO-2026-PL-492    Date: 21 June 2026',
          '',
          'Your submission "Case Study 2: Market Dynamics"',
          'returned a 48% duplication similarity rate with',
          'external publications and other academic papers.',
          '',
          'Mandatory interview: 3 July 2026, 10:00 AM,',
          'Room 4.12, Melbourne campus.',
          'Confirm attendance by 5:00 PM on 28 June 2026.',
          '',
          'Potential penalties: zero marks for the assignment,',
          'unit fail grade, or suspension.',
        ],
      },
      noise: {
        bar: '#10B981',
        org: 'MERIDIAN STRATA',
        orgSub: 'Strata & Owners Corporation VIC · Plan No. PS 123456',
        title: 'NOISE COMPLAINT & BREACH NOTICE',
        lines: [
          'To: The Occupier, Apartment 4B,',
          '88 Flinders Lane, Melbourne VIC 3000',
          'Date: 22 June 2026    Ref: BN/220626/110',
          '',
          'Multiple complaints document excessive noise after',
          '10:00 PM over the past four weeks, including shouting',
          'and loud party music, in breach of strata model bylaws.',
          '',
          'If further violations occur, the Owners Corporation',
          'will apply to VCAT; fines may reach $1,000.00 AUD.',
          '',
          'Respond in writing within 14 days (by 6 July 2026)',
          'to compliance@meridianstrata.com.au.',
        ],
      },
      utility: {
        bar: '#F59E0B',
        org: 'COASTAL ENERGY & WATER',
        orgSub: 'Public Civil Utility Services VIC · 200 Spencer Street',
        title: 'URGENT: SERVICE DISCONNECTION WARNING',
        lines: [
          'Customer: Mrs. Eleanor Vance',
          'Account No: 9876 543 210    Notice Date: 22 June 2026',
          '',
          'Original usage bill (due 1 June) ........ $245.80',
          'Overdue administration late fee ......... $12.50',
          'GRAND TOTAL OVERDUE BALANCE: $258.30 AUD',
          '',
          'The outstanding amount must be cleared no later than',
          '1 July 2026 to avoid disconnection of electricity',
          'and water services.',
          '',
          'Hardship Program: call 1800 882 110 for payment plans.',
          'National Debt Helpline (free): 1800 007 007.',
        ],
      },
    };

    const facts = DOC_FACTS[type];
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 800);
    ctx.fillStyle = facts.bar;
    ctx.fillRect(0, 0, 600, 14);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(facts.org, 40, 72);
    ctx.fillStyle = '#555555';
    ctx.font = '13px sans-serif';
    ctx.fillText(facts.orgSub, 40, 98);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(facts.title, 40, 148);
    ctx.font = '17px sans-serif';
    let y = 196;
    for (const line of facts.lines) {
      if (line) ctx.fillText(line, 40, y);
      y += 30;
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
        formData.append('isAnonymized', privacyShieldActive && shieldStatus === 'secured' ? 'true' : 'false');
        
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
          const finalSubject = data.englishDraft?.subject || (activeCase ? (L({ zh: `对线案例 - ${activeCase}`, en: `Sample case - ${activeCase}`, es: `Caso de ejemplo - ${activeCase}`, hi: `नमूना मामला - ${activeCase}`, vi: `Vụ việc mẫu - ${activeCase}`, ar: `حالة نموذجية - ${activeCase}` })) : (L({ zh: '未知公来函', en: 'Unknown letter', es: 'Carta desconocida', hi: 'अज्ञात पत्र', vi: 'Thư không rõ nguồn', ar: 'رسالة غير معروفة' })));
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
        showToast(L({ zh: '解析失败，请重试', en: 'Analysis failed. Please try again.', es: 'El análisis falló. Inténtalo de nuevo.', hi: 'विश्लेषण विफल रहा। कृपया फिर से कोशिश करें।', vi: 'Phân tích thất bại. Vui lòng thử lại.', ar: 'فشل التحليل. يُرجى المحاولة مرة أخرى.' }), 'error');
        setAppState('upload');
      }
    } else {
      // CROSS MODE CO-OBJECTION
      if (!crossFileA && !crossFileB && !activeCrossPreset) {
        showToast(L({ zh: '请上传租房合同及扣款声明，或者载入高能大招演示。', en: 'Please upload your lease and the deduction notice, or load the demo case.', es: 'Sube tu contrato de alquiler y el aviso de deducción, o carga el caso de demostración.', hi: 'कृपया अपना किराया अनुबंध और कटौती नोटिस अपलोड करें, या डेमो मामला लोड करें।', vi: 'Vui lòng tải lên hợp đồng thuê nhà và thông báo khấu trừ, hoặc tải vụ việc demo.', ar: 'يُرجى رفع عقد الإيجار وإشعار الخصم، أو تحميل الحالة التجريبية.' }), 'info');
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
        
        // Normalize before storing: the result page renders disputableItems.length/.map/.reduce
        // directly, so a live response missing the field must not white-screen the page.
        setCrossAnalysis({ ...data, disputableItems: Array.isArray(data.disputableItems) ? data.disputableItems : [] });

        // Also map some draft fields so standard email modal can function
        setDraftBody(data.englishDraft.body);
        setRecipient(data.englishDraft.recipientEmail || 'claims@horizonresidential.com.au');
        setCurrentTranslation(data.englishDraft.chineseTranslation);
        
        // Populate and save persistent kanban tasks across all letters under unified store
        if (data.disputableItems && Array.isArray(data.disputableItems)) {
          const crossTasks = data.disputableItems.map((act: any) => ({
            step: L({ zh: `抗辩不合理扣项: ${act.name}`, en: `Dispute unfair deduction: ${act.name}`, es: `Impugnar deducción injusta: ${act.name}`, hi: `अनुचित कटौती पर आपत्ति: ${act.name}`, vi: `Phản đối khoản khấu trừ bất hợp lý: ${act.name}`, ar: `الاعتراض على خصم غير عادل: ${act.name}` }),
            officialChannel: L({ zh: 'VCAT和RTBA仲裁处', en: 'VCAT and RTBA', es: 'VCAT y RTBA', hi: 'VCAT और RTBA', vi: 'VCAT và RTBA', ar: 'VCAT و RTBA' }),
            url: 'https://www.consumer.vic.gov.au/housing/renting'
          }));
          const finalSubject = data.englishDraft?.subject || (L({ zh: '退房租房押金争议', en: 'Rental bond dispute at move-out', es: 'Disputa por la fianza al dejar el alquiler', hi: 'घर छोड़ते समय बॉन्ड विवाद', vi: 'Tranh chấp tiền đặt cọc khi trả nhà', ar: 'نزاع على تأمين الإيجار عند المغادرة' }));
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
        showToast(L({ zh: '交叉核验对线审查失败，请重试', en: 'Cross-check failed. Please try again.', es: 'La verificación cruzada falló. Inténtalo de nuevo.', hi: 'क्रॉस-जांच विफल रही। कृपया फिर से कोशिश करें।', vi: 'Đối chiếu thất bại. Vui lòng thử lại.', ar: 'فشل التحقق المتقاطع. يُرجى المحاولة مرة أخرى.' }), 'error');
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
    
    // Advance reminders so this is a real 提醒, not just a mark on the deadline day: the
    // calendar app will alert the user 3 days and 1 day before the legal cut-off.
    const alarm = (trigger: string, label: string) => [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:' + trigger,
      'DESCRIPTION:' + label,
      'END:VALARM',
    ];
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
      ...alarm('-P3D', title + (L({ zh: '（还剩 3 天）', en: ' (3 days left)', es: ' (quedan 3 días)', hi: ' (3 दिन बाकी)', vi: ' (còn 3 ngày)', ar: ' (بقي 3 أيام)' }))),
      ...alarm('-P1D', title + (L({ zh: '（明天截止！）', en: ' (due tomorrow!)', es: ' (¡vence mañana!)', hi: ' (कल अंतिम तिथि!)', vi: ' (hạn chót ngày mai!)', ar: ' (الموعد النهائي غدًا!)' }))),
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

        <JudgingProof />

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
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">{L({ zh: '学签/签证类型', en: 'Visa type', es: 'Tipo de visa', hi: 'वीज़ा प्रकार', vi: 'Loại thị thực', ar: 'نوع التأشيرة' })}</label>
                            <input 
                              type="text" 
                              value={profileVisaType} 
                              onChange={(e) => setProfileVisaType(e.target.value)} 
                              placeholder={`${t('lo_eg')} ${getDefaultVisa(country, language)}`}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">{L({ zh: '就读院校/专业团队', en: 'School / course', es: 'Centro de estudios / curso', hi: 'संस्थान / कोर्स', vi: 'Trường / khóa học', ar: 'المؤسسة التعليمية / التخصص' })}</label>
                            <input 
                              type="text" 
                              value={profileSchool} 
                              onChange={(e) => setProfileSchool(e.target.value)} 
                              placeholder={L({ zh: '例如: ANU, Master of Applied Data', en: 'e.g. ANU, Master of Applied Data', es: 'p. ej.: ANU, Master of Applied Data', hi: 'उदा.: ANU, Master of Applied Data', vi: 'VD: ANU, Master of Applied Data', ar: 'مثال: ANU, Master of Applied Data' })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">{L({ zh: '租房合约关键条款', en: 'Key lease terms', es: 'Cláusulas clave del alquiler', hi: 'किराया अनुबंध की मुख्य शर्तें', vi: 'Điều khoản chính của hợp đồng thuê', ar: 'البنود الرئيسية لعقد الإيجار' })}</label>
                            <input 
                              type="text" 
                              value={profileLeaseKeyTerms} 
                              onChange={(e) => setProfileLeaseKeyTerms(e.target.value)} 
                              placeholder={L({ zh: '例如: lease ends 30 June', en: 'e.g. lease ends 30 June', es: 'p. ej.: el contrato termina el 30 de junio', hi: 'उदा.: अनुबंध 30 जून को समाप्त', vi: 'VD: hợp đồng hết hạn 30/6', ar: 'مثال: ينتهي العقد في 30 يونيو' })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase">{L({ zh: '额外背景特征 / 地址', en: 'Other details / address', es: 'Otros datos / dirección', hi: 'अन्य विवरण / पता', vi: 'Thông tin khác / địa chỉ', ar: 'تفاصيل أخرى / العنوان' })}</label>
                            <input 
                              type="text" 
                              value={profileAdditionalDetails} 
                              onChange={(e) => setProfileAdditionalDetails(e.target.value)} 
                              placeholder={L({ zh: '例如: 租住在 Flinder Lane 等', en: 'e.g. renting on Flinders Lane', es: 'p. ej.: alquilo en Flinders Lane', hi: 'उदा.: Flinders Lane पर किराये पर', vi: 'VD: thuê nhà ở Flinders Lane', ar: 'مثال: أستأجر في Flinders Lane' })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 ring-[#1d1d1f]/10 hover:border-gray-300 font-bold"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-150/20 pt-4 flex-wrap gap-2">
                          <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                            <Smile size={13} className="text-[#ff5a3c]" />
                            {user ? (
                              <span className="text-ink font-bold flex items-center gap-1"><UserCheck size={12}/> {L({ zh: '已通过 Firebase 账户同步至云端数据库', en: 'Synced to the cloud with your Firebase account', es: 'Sincronizado en la nube con tu cuenta de Firebase', hi: 'आपके Firebase खाते से क्लाउड पर सिंक किया गया', vi: 'Đã đồng bộ lên đám mây bằng tài khoản Firebase', ar: 'تمت المزامنة مع السحابة عبر حسابك في Firebase' })}</span>
                            ) : (
                              <span>{L({ zh: '您暂未登录。已保存在本地，登录后可同步至云端数据库保存', en: 'You\'re not signed in. Saved on this device — sign in to sync it to the cloud.', es: 'No has iniciado sesión. Guardado en este dispositivo — inicia sesión para sincronizarlo en la nube.', hi: 'आपने साइन इन नहीं किया है। इस डिवाइस पर सहेजा गया — क्लाउड पर सिंक करने के लिए साइन इन करें।', vi: 'Bạn chưa đăng nhập. Đã lưu trên thiết bị này — đăng nhập để đồng bộ lên đám mây.', ar: 'لم تسجّل الدخول. تم الحفظ على هذا الجهاز — سجّل الدخول لمزامنته مع السحابة.' })}</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            {user ? (
                              <button
                                onClick={onLogout}
                                className="text-xs bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <LogOut size={13}/> {L({ zh: '退出登录', en: 'Sign out', es: 'Cerrar sesión', hi: 'साइन आउट', vi: 'Đăng xuất', ar: 'تسجيل الخروج' })}
                              </button>
                            ) : (
                              <button
                                onClick={onLogin}
                                className="text-xs bg-white text-[#1d1d1f] border border-gray-200 hover:border-gray-400 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <LogIn size={13}/> {L({ zh: 'Google 登录并同步云端', en: 'Sign in with Google to sync', es: 'Inicia sesión con Google para sincronizar', hi: 'सिंक करने के लिए Google से साइन इन करें', vi: 'Đăng nhập Google để đồng bộ', ar: 'سجّل الدخول عبر Google للمزامنة' })}
                              </button>
                            )}
                            <button
                              onClick={handleSaveProfile}
                              disabled={isSavingProfile}
                              className="text-xs bg-[#ff5a3c] text-white hover:bg-amber-600 disabled:opacity-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              {isSavingProfile ? (L({ zh: '保存并同步中...', en: 'Saving and syncing...', es: 'Guardando y sincronizando...', hi: 'सहेजा और सिंक किया जा रहा है...', vi: 'Đang lưu và đồng bộ...', ar: 'جارٍ الحفظ والمزامنة...' })) : (L({ zh: '保存并更新记忆副驾', en: 'Save and update Memory Co-pilot', es: 'Guardar y actualizar el Copiloto con memoria', hi: 'सहेजें और स्मृति सहायक अपडेट करें', vi: 'Lưu và cập nhật Trợ lý ghi nhớ', ar: 'حفظ وتحديث المساعد الذكي' }))}
                            </button>
                          </div>
                        </div>

                        {profileSaveSuccess && (
                          <div className="mt-3 text-xs bg-surface-soft text-ink p-2.5 rounded-xl border border-hairline flex items-center gap-1.5 font-bold animate-in fade-in zoom-in-95 duration-200">
                            <CheckCircle2 size={14} className="text-ink animate-bounce" />
                            {L({ zh: '记忆载入成功！后续分析将全自动引入您的个人背景进行一对一定向抗诉诊断。', en: 'Memory saved! Future analyses will automatically use your background for advice tailored to you.', es: '¡Memoria guardada! Los próximos análisis usarán automáticamente tu perfil para darte consejos a tu medida.', hi: 'स्मृति सहेजी गई! आगे के विश्लेषण आपकी पृष्ठभूमि का अपने-आप उपयोग करके आपके अनुरूप सलाह देंगे।', vi: 'Đã lưu bộ nhớ! Các lần phân tích sau sẽ tự động dùng thông tin của bạn để đưa ra lời khuyên phù hợp.', ar: 'تم حفظ الذاكرة! ستستخدم التحليلات القادمة خلفيتك تلقائيًا لتقديم نصائح مخصّصة لك.' })}
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
                            <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded font-bold">{L({ zh: '内置经典案例载入', en: 'Sample case loaded', es: 'Caso de ejemplo cargado', hi: 'नमूना मामला लोड हुआ', vi: 'Đã tải vụ việc mẫu', ar: 'تم تحميل الحالة النموذجية' })}</span>
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
                               {renderDocumentHTML(activeCase, true, privacyShieldActive && shieldStatus === 'secured', language)}
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

                           {/* Laser line scanning overlay */}
                           {isScanningPII && (
                             <div className="absolute inset-0 bg-[#2dd4bf]/5 z-20 pointer-events-none flex flex-col items-center justify-center backdrop-blur-[0.5px]">
                               <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf]" style={{ top: `${scanProgress}%`, transition: 'top 0.15s ease-out' }} />
                               <div className="bg-teal-950/90 border border-teal-500/30 text-teal-300 font-mono text-[9px] px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
                                 <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
                                 <span>Privacy Pre-Scan: {scanProgress}%</span>
                               </div>
                             </div>
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
                              {L({ zh: '清除案例，开始自选手传', en: 'Clear sample and upload your own', es: 'Quitar el ejemplo y subir el tuyo', hi: 'नमूना हटाएँ और अपना अपलोड करें', vi: 'Xóa mẫu và tải thư của bạn', ar: 'إزالة النموذج ورفع رسالتك' })}
                            </button>
                          ) : (
                            filePreview && (
                              <button 
                                onClick={reset}
                                className="flex-1 text-xs font-bold border border-gray-200 hover:border-gray-300 text-gray-650 bg-white p-2.5 rounded-xl transition-all"
                              >
                                {L({ zh: '重置上传', en: 'Reset upload', es: 'Reiniciar carga', hi: 'अपलोड रीसेट करें', vi: 'Tải lên lại', ar: 'إعادة ضبط الرفع' })}
                              </button>
                            )
                          )}
                        </div>

                        {/* Offline Privacy Shield Controller Card */}
                        <div className="mt-4 bg-surface-card border border-hairline rounded-2xl p-4 shadow-sm transition-all">
                          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <Shield size={16} className={privacyShieldActive ? "text-teal-500" : "text-gray-400"} />
                              <span className="text-xs font-black text-gray-900 tracking-wide">{L({ zh: '隐私脱敏盾 (Privacy Redaction Shield)', en: 'Privacy Redaction Shield', es: 'Escudo de privacidad (Privacy Redaction Shield)', hi: 'गोपनीयता सुरक्षा कवच (Privacy Redaction Shield)', vi: 'Lá chắn ẩn thông tin cá nhân (Privacy Redaction Shield)', ar: 'درع حجب البيانات الخاصة (Privacy Redaction Shield)' })}</span>
                            </div>
                            <button 
                              onClick={() => {
                                setPrivacyShieldActive(!privacyShieldActive);
                              }}
                              className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${privacyShieldActive ? 'bg-teal-500' : 'bg-gray-200'}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${privacyShieldActive ? 'translate-x-5' : 'translate-x-0'}`}
                              />
                            </button>
                          </div>

                          <div className="pt-3 flex flex-col gap-2.5">
                            {privacyShieldActive ? (
                              <>
                                {shieldStatus === 'scanning' ? (
                                  <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-teal-600 font-mono">
                                      <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                                        {L({ zh: '正在标记待脱敏的敏感字段...', en: 'Marking sensitive fields for redaction...', es: 'Marcando campos sensibles para ocultarlos...', hi: 'संवेदनशील फ़ील्ड छिपाने के लिए चिह्नित किए जा रहे हैं...', vi: 'Đang đánh dấu các trường nhạy cảm cần che...', ar: 'جارٍ تحديد الحقول الحساسة لحجبها...' })}
                                      </span>
                                      <span>{scanProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                      <div className="bg-teal-400 h-1.5 rounded-full transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                                    </div>
                                    <p className="text-[10px] text-muted-soft leading-relaxed">
                                      {L({ zh: '正在为本次分析登记脱敏规则：姓名、学号、住址、单号等字段将在 AI 输出中被打码替换。', en: 'Setting redaction rules for this analysis: names, student IDs, addresses and reference numbers will be masked in the AI output.', es: 'Configurando las reglas de ocultación para este análisis: nombres, números de estudiante, direcciones y números de referencia se ocultarán en la respuesta de la IA.', hi: 'इस विश्लेषण के लिए छिपाने के नियम तय किए जा रहे हैं: AI के आउटपुट में नाम, स्टूडेंट ID, पते और संदर्भ संख्याएँ छिपा दी जाएँगी।', vi: 'Đang thiết lập quy tắc che thông tin cho lần phân tích này: tên, mã sinh viên, địa chỉ và số tham chiếu sẽ được che trong kết quả AI.', ar: 'جارٍ ضبط قواعد الحجب لهذا التحليل: ستُخفى الأسماء وأرقام الطلاب والعناوين والأرقام المرجعية في مخرجات الذكاء الاصطناعي.' })}
                                    </p>
                                  </div>
                                ) : shieldStatus === 'secured' ? (
                                  <div className="animate-in fade-in duration-500 flex items-start gap-2.5">
                                    <div className="p-1 bg-teal-50 text-teal-600 rounded-lg text-xs mt-0.5">
                                      🔒
                                    </div>
                                    <div>
                                      <span className="text-[11px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{L({ zh: '输出层脱敏已启用', en: 'Output redaction on', es: 'Ocultación de datos activada', hi: 'आउटपुट में गोपनीयता चालू', vi: 'Đã bật che thông tin đầu ra', ar: 'حجب المخرجات مُفعّل' })}</span>
                                      <p className="text-[10px] text-muted-soft leading-relaxed mt-1">
                                        {LJ({
                                          zh: <>AI 返回的分析结论与生成信件中，姓名、学号、住址、单号等个人字段将替换为 <span className="text-teal-700 font-extrabold">[REDACTED]</span> 打码标签；内置案例预览已同步打上黑条。</>,
                                          en: <>In the AI analysis and the generated letter, personal fields such as names, student IDs, addresses and reference numbers will be replaced with <span className="text-teal-700 font-extrabold">[REDACTED]</span> tags; the sample case preview is blacked out too.</>,
                                          es: <>En el análisis de la IA y en la carta generada, los datos personales como nombres, números de estudiante, direcciones y números de referencia se sustituirán por etiquetas <span className="text-teal-700 font-extrabold">[REDACTED]</span>; la vista previa del caso de ejemplo también aparece tachada.</>,
                                          hi: <>AI विश्लेषण और तैयार पत्र में नाम, स्टूडेंट ID, पते और संदर्भ संख्याएँ जैसी निजी जानकारी <span className="text-teal-700 font-extrabold">[REDACTED]</span> टैग से बदल दी जाएगी; नमूना मामले के पूर्वावलोकन पर भी काली पट्टी लगाई गई है।</>,
                                          vi: <>Trong kết quả phân tích AI và thư được tạo, các thông tin cá nhân như tên, mã sinh viên, địa chỉ và số tham chiếu sẽ được thay bằng nhãn <span className="text-teal-700 font-extrabold">[REDACTED]</span>; bản xem trước vụ việc mẫu cũng đã được bôi đen.</>,
                                          ar: <>في تحليل الذكاء الاصطناعي والرسالة المُنشأة، ستُستبدَل البيانات الشخصية مثل الأسماء وأرقام الطلاب والعناوين والأرقام المرجعية بوسوم <span className="text-teal-700 font-extrabold">[REDACTED]</span>؛ كما حُجبت معاينة الحالة النموذجية بأشرطة سوداء.</>,
                                        })}
                                      </p>
                                      <p className="text-[9px] text-teal-600 font-semibold mt-1">
                                        {L({ zh: '🛡️ 原件仅经我们的后端转发给 Gemini 用于本次分析，不落库、不缓存、不用于训练。', en: '🛡️ The original is only passed through our backend to Gemini for this analysis — never stored, cached or used for training.', es: '🛡️ El original solo pasa por nuestro servidor hacia Gemini para este análisis — nunca se guarda, se almacena en caché ni se usa para entrenar.', hi: '🛡️ मूल दस्तावेज़ केवल इस विश्लेषण के लिए हमारे बैकएंड से Gemini को भेजा जाता है — इसे कभी सहेजा, कैश या प्रशिक्षण के लिए इस्तेमाल नहीं किया जाता।', vi: '🛡️ Bản gốc chỉ được chuyển qua máy chủ của chúng tôi đến Gemini cho lần phân tích này — không lưu trữ, không lưu đệm, không dùng để huấn luyện.', ar: '🛡️ يمرّ المستند الأصلي عبر خادمنا إلى Gemini لهذا التحليل فقط — لا يُخزَّن ولا يُحفظ مؤقتًا ولا يُستخدم للتدريب.' })}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="animate-in fade-in duration-300 flex items-start gap-2.5">
                                    <div className="p-1 bg-gray-50 text-gray-400 rounded-lg text-xs mt-0.5">
                                      ⏳
                                    </div>
                                    <div>
                                      <span className="text-[11px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{L({ zh: '脱敏盾待命中', en: 'Shield on standby', es: 'Escudo en espera', hi: 'कवच स्टैंडबाय पर', vi: 'Lá chắn đang chờ', ar: 'الدرع في وضع الاستعداد' })}</span>
                                      <p className="text-[10px] text-muted-soft leading-relaxed mt-1">
                                        {L({ zh: '载入经典案例或上传公文后，将自动为本次分析启用输出层脱敏（姓名、学号、住址、单号打码）。', en: 'Once you load a sample case or upload a letter, output redaction turns on automatically for this analysis (names, student IDs, addresses and reference numbers masked).', es: 'Al cargar un caso de ejemplo o subir una carta, la ocultación de datos se activa automáticamente para este análisis (nombres, números de estudiante, direcciones y números de referencia ocultos).', hi: 'नमूना मामला लोड करने या पत्र अपलोड करने पर इस विश्लेषण के लिए आउटपुट गोपनीयता अपने-आप चालू हो जाती है (नाम, स्टूडेंट ID, पते और संदर्भ संख्याएँ छिपी रहेंगी)।', vi: 'Khi bạn tải vụ việc mẫu hoặc tải lên một lá thư, tính năng che thông tin đầu ra sẽ tự động bật cho lần phân tích này (che tên, mã sinh viên, địa chỉ và số tham chiếu).', ar: 'بمجرد تحميل حالة نموذجية أو رفع رسالة، يُفعَّل حجب المخرجات تلقائيًا لهذا التحليل (إخفاء الأسماء وأرقام الطلاب والعناوين والأرقام المرجعية).' })}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-start gap-2.5 animate-in fade-in duration-300">
                                <div className="p-1 bg-amber-50 text-amber-600 rounded-lg text-xs mt-0.5">
                                  ⚠️
                                </div>
                                <div>
                                  <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{L({ zh: '端侧隐私扫描已关闭', en: 'Privacy scan off', es: 'Análisis de privacidad desactivado', hi: 'गोपनीयता स्कैन बंद', vi: 'Đã tắt quét quyền riêng tư', ar: 'فحص الخصوصية متوقف' })}</span>
                                  <p className="text-[10px] text-muted-soft leading-relaxed mt-1">
                                    {L({ zh: '此时公文正本中的个人敏感隐私信息（如果存在）将以原始文本明文传送至 AI。为了您的个人隐私安全，推荐重新开启保护。', en: 'Any sensitive personal information in the letter will be sent to the AI as-is. For your privacy, we recommend turning protection back on.', es: 'Cualquier dato personal sensible de la carta se enviará a la IA tal cual. Por tu privacidad, te recomendamos volver a activar la protección.', hi: 'पत्र में मौजूद कोई भी संवेदनशील निजी जानकारी AI को ज्यों की त्यों भेजी जाएगी। आपकी गोपनीयता के लिए, सुरक्षा फिर से चालू करने की सलाह दी जाती है।', vi: 'Mọi thông tin cá nhân nhạy cảm trong thư sẽ được gửi nguyên văn cho AI. Để bảo vệ quyền riêng tư, chúng tôi khuyên bạn bật lại chế độ bảo vệ.', ar: 'ستُرسَل أي معلومات شخصية حساسة في الرسالة إلى الذكاء الاصطناعي كما هي. حفاظًا على خصوصيتك، ننصح بإعادة تفعيل الحماية.' })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
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
                                   <span className="text-[10px] font-black tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase font-mono">{L({ zh: '法援内参 · MORE INFO', en: 'MORE INFO', es: 'MÁS INFORMACIÓN', hi: 'अधिक जानकारी', vi: 'THÊM THÔNG TIN', ar: 'مزيد من المعلومات' })}</span>
                                   <h3 className="text-base font-bold text-gray-900 mt-1">{guides[activeCase].title}</h3>
                                 </div>
                                 <div className="text-right">
                                   <span className="text-[10px] text-gray-400 block font-bold">{L({ zh: '处理难度', en: 'Difficulty', es: 'Dificultad', hi: 'कठिनाई', vi: 'Độ khó', ar: 'الصعوبة' })}</span>
                                   <span className="text-xs font-semibold text-amber-950 block">{guides[activeCase].difficulty}</span>
                                 </div>
                               </div>
                               
                               <div className="space-y-3 my-3 text-xs text-gray-700">
                                 <div>
                                   <span className="font-bold text-gray-900">{L({ zh: '🏢 发方机构:', en: '🏢 Issuer:', es: '🏢 Emisor:', hi: '🏢 जारीकर्ता:', vi: '🏢 Cơ quan gửi:', ar: '🏢 الجهة المُصدِرة:' })}</span> <span className="font-mono text-gray-650 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{guides[activeCase].org}</span>
                                 </div>
                                 <div>
                                   <span className="font-bold text-gray-900">{L({ zh: '🚨 涉诉金额/威胁:', en: '🚨 Amount / risk:', es: '🚨 Importe / riesgo:', hi: '🚨 राशि / जोखिम:', vi: '🚨 Số tiền / rủi ro:', ar: '🚨 المبلغ / المخاطر:' })}</span> <span className="font-extrabold text-red-650">{guides[activeCase].amount}</span>
                                 </div>
                                 <div>
                                   <span className="font-bold text-gray-900">{L({ zh: '⏰ 行政抗诉死线:', en: '⏰ Deadline:', es: '⏰ Plazo:', hi: '⏰ समय-सीमा:', vi: '⏰ Hạn chót:', ar: '⏰ الموعد النهائي:' })}</span> <span className="font-bold text-[#1d1d1f] bg-white border px-1.5 py-0.5 rounded">{guides[activeCase].deadline}</span>
                                 </div>
                                 <div className="bg-white/85 p-3 rounded-2xl border border-amber-100/50 leading-relaxed text-gray-600 mt-2">
                                   <p className="font-bold text-gray-900 border-l-2 border-[#ff5a3c] pl-1.5 mb-1.5 text-[10px]">{L({ zh: '事件描述 (Case Overview):', en: 'Case Overview:', es: 'Resumen del caso:', hi: 'मामले का सारांश:', vi: 'Tóm tắt vụ việc:', ar: 'نظرة عامة على الحالة:' })}</p>
                                   {guides[activeCase].summary}
                                 </div>
                               </div>
                               
                               <div className="mt-4 pt-1">
                                 <h4 className="text-xs font-black text-amber-950 mb-2 flex items-center gap-1 uppercase tracking-wide">{L({ zh: '🛡️ 新移民与留学生维权防坑指南 (Strategy Guide):', en: '🛡️ Strategy Guide for Newcomers & Students:', es: '🛡️ Guía de estrategia para recién llegados y estudiantes:', hi: '🛡️ नए प्रवासियों और छात्रों के लिए रणनीति गाइड:', vi: '🛡️ Hướng dẫn chiến lược cho người mới đến và du học sinh:', ar: '🛡️ دليل استراتيجي للقادمين الجدد والطلاب:' })}</h4>
                                 <ul className="space-y-2 mb-4">
                                   {guides[activeCase].tips.map((tip, index) => (
                                     <li key={index} className="text-xs text-gray-700 flex items-start gap-1 pb-1 font-sans">
                                       <span className="text-amber-600 font-extrabold text-xs leading-none mt-0.5">•</span>
                                       <span>{tip}</span>
                                     </li>
                                   ))}
                                 </ul>

                                 {/* Grounding Sources Panel */}
                                 {guides[activeCase].groundingSources && guides[activeCase].groundingSources.length > 0 && (
                                   <div className="bg-white/85 border border-amber-200/50 p-4 rounded-2xl mb-4 text-[11px] font-sans">
                                     <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2.5 flex items-center gap-1.5 leading-none">
                                       <Globe size={13} className="text-amber-700 shrink-0"/>
                                       <span className="font-extrabold">{L({ zh: '🔍 澳洲官方监管及法规信源对齐 (Grounding Sources):', en: '🔍 Official Australian Sources (Grounding Sources):', es: '🔍 Fuentes oficiales australianas (Grounding Sources):', hi: '🔍 आधिकारिक ऑस्ट्रेलियाई स्रोत (Grounding Sources):', vi: '🔍 Nguồn chính thức của Úc (Grounding Sources):', ar: '🔍 مصادر أسترالية رسمية (Grounding Sources):' })}</span>
                                     </h5>
                                     <ul className="space-y-2">
                                       {guides[activeCase].groundingSources.map((source, index) => (
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
                                     <span>{L({ zh: '⚖️ R-AI 风险控制及责任声明 (Disclaimer):', en: '⚖️ Disclaimer:', es: '⚖️ Aviso legal:', hi: '⚖️ अस्वीकरण:', vi: '⚖️ Tuyên bố miễn trừ:', ar: '⚖️ إخلاء المسؤولية:' })}</span>
                                   </div>
                                   <p>
                                     {LJ({
                                       zh: <>本页面及平台服务解读的所有内容均基于澳大利亚联邦及各州公开法规之一般公共信息做梳理参考，<strong>不构成任何形式的执业律师正式法律意见（Legal Advice）</strong>。租客、学生或居民在正式进行法律抗辩、向法庭或审裁处（如 VCAT）提控前，请优先参阅上方对应官方直链，或向持牌顾问寻取协助。</>,
                                       en: <>Everything explained on this page is general information based on publicly available Australian federal and state laws, and <strong>does not constitute legal advice from a practising lawyer</strong>. Before formally disputing a matter or applying to a court or tribunal (such as VCAT), tenants, students and residents should check the official links above or get help from a licensed adviser.</>,
                                       es: <>Todo lo que se explica en esta página es información general basada en leyes federales y estatales australianas de acceso público, y <strong>no constituye asesoramiento legal de un abogado en ejercicio</strong>. Antes de impugnar formalmente un asunto o acudir a un tribunal (como VCAT), inquilinos, estudiantes y residentes deben consultar los enlaces oficiales de arriba o pedir ayuda a un asesor con licencia.</>,
                                       hi: <>इस पेज पर दी गई सारी जानकारी ऑस्ट्रेलिया के सार्वजनिक रूप से उपलब्ध संघीय और राज्य कानूनों पर आधारित सामान्य जानकारी है, और <strong>यह किसी प्रैक्टिसिंग वकील की कानूनी सलाह नहीं है</strong>। औपचारिक रूप से विवाद उठाने या किसी अदालत या ट्रिब्यूनल (जैसे VCAT) में आवेदन करने से पहले, किरायेदार, छात्र और निवासी ऊपर दिए आधिकारिक लिंक देखें या किसी लाइसेंसधारी सलाहकार से मदद लें।</>,
                                       vi: <>Mọi nội dung giải thích trên trang này là thông tin chung dựa trên luật liên bang và tiểu bang của Úc được công bố công khai, và <strong>không phải là tư vấn pháp lý của luật sư hành nghề</strong>. Trước khi chính thức khiếu nại hoặc nộp đơn lên tòa án hay tòa trọng tài (như VCAT), người thuê nhà, sinh viên và cư dân nên xem các liên kết chính thức ở trên hoặc nhờ cố vấn có giấy phép hỗ trợ.</>,
                                       ar: <>كل ما يُشرح في هذه الصفحة معلومات عامة مستندة إلى القوانين الأسترالية الاتحادية وقوانين الولايات المتاحة للعموم، و<strong>لا يُعدّ استشارة قانونية من محامٍ ممارس</strong>. قبل الاعتراض رسميًا أو التقدّم إلى محكمة أو هيئة قضائية (مثل VCAT)، ينبغي للمستأجرين والطلاب والمقيمين مراجعة الروابط الرسمية أعلاه أو طلب المساعدة من مستشار مرخّص.</>,
                                     })}
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
                                 <span>{L({ zh: '📄 放大查阅高清原始公文 (HTML排版原件)', en: '📄 View the full original letter (HD)', es: '📄 Ver la carta original completa (HD)', hi: '📄 पूरा मूल पत्र देखें (HD)', vi: '📄 Xem toàn bộ thư gốc (HD)', ar: '📄 عرض الرسالة الأصلية كاملة (HD)' })}</span>
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
                    <span>{L({ zh: '⭐ Agentic 案件深度处理链巡航中', en: '⭐ Agentic case pipeline running', es: '⭐ Flujo de trabajo del caso en marcha', hi: '⭐ एजेंटिक केस प्रक्रिया चल रही है', vi: '⭐ Quy trình xử lý vụ việc đang chạy', ar: '⭐ مسار معالجة الحالة قيد التشغيل' })}</span>
                  </h3>
                  <p className="text-gray-500 text-xs mb-6 text-center leading-relaxed">
                    {L({ zh: '正在执行 5 步自动闭环法务抗诉：为您编排最强合规信号。', en: 'Running the 5-step automated workflow to build your strongest, compliant response.', es: 'Ejecutando el flujo automatizado de 5 pasos para preparar tu respuesta más sólida y conforme a la ley.', hi: 'आपका सबसे मज़बूत और नियमों के अनुरूप जवाब तैयार करने के लिए 5-चरणों वाली स्वचालित प्रक्रिया चल रही है।', vi: 'Đang chạy quy trình tự động 5 bước để soạn phản hồi mạnh nhất và đúng quy định cho bạn.', ar: 'جارٍ تنفيذ سير العمل الآلي المكوّن من 5 خطوات لإعداد أقوى رد متوافق مع القانون.' })}
                  </p>
                  
                  <div className="w-full space-y-3 text-left">
                    {(AGENT_STEPS[language as GuideLang] ?? AGENT_STEPS.en).map((item) => {
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
                                {isDone ? item.success : isActive ? item.pending : (L({ zh: '排队待命...', en: 'Queued...', es: 'En cola...', hi: 'कतार में...', vi: 'Đang chờ...', ar: 'في قائمة الانتظار...' }))}
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
                         {L({ zh: '预置示例分析（非对您文件的实时识别）· Preset Sample — Not Live Analysis', en: 'Preset Sample — Not Live Analysis of Your File', es: 'Ejemplo predefinido — no es un análisis en vivo de tu archivo', hi: 'पूर्व-निर्धारित नमूना — आपकी फ़ाइल का लाइव विश्लेषण नहीं', vi: 'Mẫu dựng sẵn — không phải phân tích trực tiếp tệp của bạn', ar: 'نموذج مُعدّ مسبقًا — ليس تحليلًا مباشرًا لملفك' })}
                       </h4>
                       <p className="text-[11px] text-amber-850 leading-relaxed font-sans font-medium">
                         {LJ({
                           zh: <>当前 Google Gemini 接口繁忙（限流），暂时无法对您刚上传的文件做实时视觉识别。以下展示的是<strong>同类案件的预置示例</strong>，用于演示分析与维权信生成能力，<strong>并非针对您这张文件的真实结果</strong>，其中的金额、机构、日期均为示例。请稍后点击「重新分析」以获取基于您文件的真实 Gemini + Google 实时检索结果。</>,
                           en: <>Google Gemini is busy (rate-limited), so we can't read the file you just uploaded in real time. Below is a <strong>preset example of a similar case</strong> that demonstrates the analysis and letter drafting — <strong>it is not a real result for your file</strong>, and the amounts, organisations and dates are examples only. Please try again later to get a real Gemini + Google Search result based on your file.</>,
                           es: <>Google Gemini está saturado (límite de uso), así que no podemos leer en tiempo real el archivo que acabas de subir. Abajo se muestra un <strong>ejemplo predefinido de un caso similar</strong> que demuestra el análisis y la redacción de la carta — <strong>no es un resultado real de tu archivo</strong>, y los importes, organizaciones y fechas son solo ejemplos. Vuelve a intentarlo más tarde para obtener un resultado real de Gemini + Google Search basado en tu archivo.</>,
                           hi: <>Google Gemini अभी व्यस्त है (रेट-लिमिट), इसलिए हम आपकी अभी अपलोड की गई फ़ाइल को रीयल-टाइम में नहीं पढ़ सकते। नीचे <strong>एक मिलते-जुलते मामले का पूर्व-निर्धारित उदाहरण</strong> है, जो विश्लेषण और पत्र लेखन दिखाता है — <strong>यह आपकी फ़ाइल का असली परिणाम नहीं है</strong>, और इसमें राशियाँ, संस्थाएँ और तारीखें केवल उदाहरण हैं। अपनी फ़ाइल पर आधारित असली Gemini + Google Search परिणाम के लिए कृपया बाद में फिर कोशिश करें।</>,
                           vi: <>Google Gemini đang quá tải (giới hạn tốc độ), nên chúng tôi chưa thể đọc trực tiếp tệp bạn vừa tải lên. Bên dưới là <strong>ví dụ dựng sẵn của một vụ việc tương tự</strong> để minh họa khả năng phân tích và soạn thư — <strong>đây không phải kết quả thật cho tệp của bạn</strong>, số tiền, tổ chức và ngày tháng chỉ là ví dụ. Vui lòng thử lại sau để nhận kết quả thật từ Gemini + Google Search dựa trên tệp của bạn.</>,
                           ar: <>خدمة Google Gemini مشغولة حاليًا (تجاوز حد الطلبات)، لذا لا يمكننا قراءة الملف الذي رفعته للتو بشكل مباشر. يظهر أدناه <strong>مثال مُعدّ مسبقًا لحالة مشابهة</strong> يوضّح التحليل وصياغة الرسالة — <strong>وهو ليس نتيجة حقيقية لملفك</strong>، والمبالغ والجهات والتواريخ مجرد أمثلة. يُرجى المحاولة لاحقًا للحصول على نتيجة حقيقية من Gemini + Google Search مبنية على ملفك.</>,
                         })}
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
                       {L({ zh: 'AI 闭环护航申诉：整套法务复议流程已全面自动为您办妥！(AI Auto-Resolution Actions Complete)', en: 'AI Auto-Resolution Actions Complete: your whole appeal workflow is ready!', es: 'Acciones automáticas de la IA completadas: ¡todo tu proceso de apelación está listo!', hi: 'AI की स्वचालित कार्रवाइयाँ पूरी: आपकी पूरी अपील प्रक्रिया तैयार है!', vi: 'AI đã hoàn tất các bước tự động: toàn bộ quy trình khiếu nại của bạn đã sẵn sàng!', ar: 'اكتملت إجراءات الذكاء الاصطناعي التلقائية: مسار الاعتراض بالكامل جاهز!' })}
                     </h4>
                     <p className="text-[11px] text-gray-700 leading-relaxed font-sans font-medium">
                       {LJ({
                         zh: <>系统已瞬间为您完成：<span className="font-bold">① 极速识别并精细拆解</span> / <span className="font-bold">② 匹配澳洲 CAV/VCAT 法定条规并附高能 Grounding 信源链接</span> / <span className="font-bold">③ 自动化拟定中外对线驳回英文回信</span> / <span className="font-bold">④ 预排日历死线行政纠纷纠错事件</span> / <span className="font-bold">⑤ 直达一键极速 Gmail 对线发信</span>。全部抗辩诉求一气呵成！</>,
                         en: <>Done for you: <span className="font-bold">① Read and broke down the letter</span> / <span className="font-bold">② Matched the relevant Australian rules (CAV / VCAT) with grounded source links</span> / <span className="font-bold">③ Drafted an English reply</span> / <span className="font-bold">④ Prepared a deadline calendar event</span> / <span className="font-bold">⑤ One click to send via Gmail</span>. Everything you need, in one go!</>,
                         es: <>Ya lo hicimos por ti: <span className="font-bold">① Leímos y desglosamos la carta</span> / <span className="font-bold">② Cotejamos las normas australianas aplicables (CAV / VCAT) con enlaces a las fuentes</span> / <span className="font-bold">③ Redactamos una respuesta en inglés</span> / <span className="font-bold">④ Preparamos un evento de calendario con el plazo</span> / <span className="font-bold">⑤ Envío por Gmail con un clic</span>. ¡Todo lo que necesitas, de una vez!</>,
                         hi: <>आपके लिए पूरा किया गया: <span className="font-bold">① पत्र पढ़कर उसे बिंदुओं में बाँटा</span> / <span className="font-bold">② संबंधित ऑस्ट्रेलियाई नियमों (CAV / VCAT) से मिलान, स्रोत लिंक सहित</span> / <span className="font-bold">③ अंग्रेज़ी जवाब का मसौदा तैयार</span> / <span className="font-bold">④ समय-सीमा का कैलेंडर इवेंट तैयार</span> / <span className="font-bold">⑤ एक क्लिक में Gmail से भेजें</span>। जो कुछ चाहिए, सब एक साथ!</>,
                         vi: <>Đã làm xong cho bạn: <span className="font-bold">① Đọc và phân tích lá thư</span> / <span className="font-bold">② Đối chiếu quy định liên quan của Úc (CAV / VCAT) kèm liên kết nguồn</span> / <span className="font-bold">③ Soạn thư trả lời bằng tiếng Anh</span> / <span className="font-bold">④ Chuẩn bị sự kiện lịch cho hạn chót</span> / <span className="font-bold">⑤ Gửi qua Gmail chỉ với một cú nhấp</span>. Mọi thứ bạn cần, trong một lần!</>,
                         ar: <>أنجزنا لك: <span className="font-bold">① قراءة الرسالة وتحليلها</span> / <span className="font-bold">② مطابقة القواعد الأسترالية ذات الصلة (CAV / VCAT) مع روابط المصادر</span> / <span className="font-bold">③ صياغة رد بالإنجليزية</span> / <span className="font-bold">④ إعداد حدث تقويم للموعد النهائي</span> / <span className="font-bold">⑤ الإرسال عبر Gmail بنقرة واحدة</span>. كل ما تحتاجه دفعة واحدة!</>,
                       })}
                     </p>
                   </div>
                 </div>



                 {claimMode === 'cross' && crossAnalysis ? (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
                        {/* LEFT COLUMN: Disputable items list */}
                        <div className="lg:col-span-6 flex flex-col bg-neutral-100/60 p-5 rounded-3xl border border-gray-200/50 max-h-[85vh] overflow-y-auto custom-scrollbar">
                           <div className="text-[10px] font-black text-[#1d1d1f] tracking-wider uppercase mb-1">
                             {L({ zh: '⚖️ 交叉匹配合同条目冲突分析栏 (CROSS DISPUTE ITEMS)', en: '⚖️ CROSS DISPUTE ITEMS', es: '⚖️ PUNTOS EN DISPUTA (CRUZADOS)', hi: '⚖️ क्रॉस-विवाद बिंदु', vi: '⚖️ CÁC MỤC TRANH CHẤP ĐỐI CHIẾU', ar: '⚖️ بنود النزاع المتقاطعة' })}
                           </div>
                           <h3 className="text-sm font-extrabold text-gray-900 mb-4">
                             {LJ({
                               zh: <>共匹配识别出 <span className="text-red-650 text-base">{crossAnalysis.disputableItems.length}</span> 处严重违约或无理扣押标签：</>,
                               en: <>Found <span className="text-red-650 text-base">{crossAnalysis.disputableItems.length}</span> breaches or unfair deductions:</>,
                               es: <>Se encontraron <span className="text-red-650 text-base">{crossAnalysis.disputableItems.length}</span> infracciones o deducciones injustas:</>,
                               hi: <><span className="text-red-650 text-base">{crossAnalysis.disputableItems.length}</span> उल्लंघन या अनुचित कटौतियाँ मिलीं:</>,
                               vi: <>Tìm thấy <span className="text-red-650 text-base">{crossAnalysis.disputableItems.length}</span> vi phạm hoặc khoản khấu trừ bất hợp lý:</>,
                               ar: <>تم العثور على <span className="text-red-650 text-base">{crossAnalysis.disputableItems.length}</span> من المخالفات أو الخصومات غير العادلة:</>,
                             })}
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
                                     <p className="font-bold text-ink mb-1">{L({ zh: 'Clause A 住宅契约条款或规范：', en: 'Clause A — lease term or rule:', es: 'Cláusula A — condición del contrato o norma:', hi: 'खंड A — अनुबंध की शर्त या नियम:', vi: 'Điều khoản A — điều khoản hợp đồng hoặc quy định:', ar: 'البند A — شرط العقد أو القاعدة:' })}</p>
                                     <p>{item.clauseA}</p>
                                   </div>
                                   <div className="bg-red-50/20 p-2.5 rounded-lg border border-red-100/30">
                                     <p className="font-bold text-red-900 mb-1">{L({ zh: 'Clause B 索赔发票/罚缴单指控：', en: 'Clause B — claim invoice / allegation:', es: 'Cláusula B — factura reclamada / acusación:', hi: 'खंड B — दावा चालान / आरोप:', vi: 'Điều khoản B — hóa đơn yêu cầu / cáo buộc:', ar: 'البند B — فاتورة المطالبة / الادعاء:' })}</p>
                                     <p>{item.clauseB}</p>
                                   </div>
                                 </div>

                                 <div className="bg-amber-50/35 p-3 rounded-xl border border-amber-100/50 text-xs font-sans text-gray-700 leading-relaxed font-normal">
                                   <p className="font-extrabold text-amber-900 flex items-center gap-1 mb-1">{L({ zh: '维权法源抗辩建议 (Strategy):', en: 'Strategy:', es: 'Estrategia:', hi: 'रणनीति:', vi: 'Chiến lược:', ar: 'الاستراتيجية:' })}</p>
                                   <p>{item.negotiableReason}</p>
                                 </div>

                                 <div className="bg-neutral-50 p-2.5 rounded-xl border border-gray-150 text-[11px] font-mono font-medium text-gray-600">
                                   <p className="font-bold text-gray-900 mb-0.5">{L({ zh: '💬 英文沟通回复模板 (Response Template):', en: '💬 Response Template:', es: '💬 Plantilla de respuesta:', hi: '💬 जवाब का टेम्पलेट:', vi: '💬 Mẫu phản hồi:', ar: '💬 نموذج الرد:' })}</p>
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
                               <span>{L({ zh: '总体驳回对线核心策略 (Chief Negotiator Directive)', en: 'Chief Negotiator Directive', es: 'Estrategia principal de negociación', hi: 'मुख्य वार्ता रणनीति', vi: 'Chỉ đạo đàm phán chính', ar: 'توجيه المفاوض الرئيسي' })}</span>
                             </div>
                             <p className="text-gray-900 text-xs font-medium leading-relaxed mb-3">
                               {crossAnalysis.recommendation}
                             </p>
                             <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-white font-black text-[11px] text-[#D84C3E] flex items-center justify-between shadow-sm font-sans">
                               <span>{L({ zh: '🎯 可安全挽回押金金额 (Total Recoverable Loss):', en: '🎯 Total Recoverable Loss:', es: '🎯 Total recuperable:', hi: '🎯 कुल वसूली योग्य राशि:', vi: '🎯 Tổng số tiền có thể đòi lại:', ar: '🎯 إجمالي المبلغ القابل للاسترداد:' })}</span>
                               <span className="text-sm text-red-650 font-black font-mono">
                                 ${crossAnalysis.disputableItems.reduce((acc: number, item: any) => acc + (item.amount || 0), 0)} AUD
                                </span>
                             </div>
                           </div>

                           {/* Intention and drafts */}
                           <div className="bg-[#f5f5f7] p-5 rounded-3xl border border-gray-200 flex flex-col gap-4 font-sans">
                             <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                               <span className="text-xs font-black text-gray-800 flex items-center gap-1">
                                 {L({ zh: '📝 主力英文维权正式声明书 (Drafting Response Document)', en: '📝 Drafting Response Document', es: '📝 Borrador del documento de respuesta', hi: '📝 जवाबी दस्तावेज़ का मसौदा', vi: '📝 Soạn văn bản phản hồi', ar: '📝 صياغة مستند الرد' })}
                               </span>
                               <span className="text-[9px] bg-surface-soft text-ink border border-hairline px-2 py-0.5 rounded-full font-black">{L({ zh: '对线意图高度匹配', en: 'Intent matched', es: 'Intención alineada', hi: 'मंशा मेल खाती है', vi: 'Đúng ý định', ar: 'النية متطابقة' })}</span>
                             </div>

                             <div className="text-[11px]/relaxed text-gray-500 bg-surface-soft/10 p-2.5 rounded-xl border border-hairline/40 font-normal">
                               <span className="font-bold text-ink">{L({ zh: '对线意图：', en: 'Intent: ', es: 'Intención: ', hi: 'मंशा: ', vi: 'Ý định: ', ar: 'النية: ' })}</span>
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
                                 <label className="text-[10px] font-black uppercase text-gray-400">{L({ zh: 'CN REFERENCE (中文直观对照大意)', en: 'REFERENCE TRANSLATION', es: 'TRADUCCIÓN DE REFERENCIA', hi: 'संदर्भ अनुवाद', vi: 'BẢN DỊCH THAM KHẢO', ar: 'ترجمة مرجعية' })}</label>
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
                                     L({ zh: "维州租务扣押争议 VCAT / RTBA 时效死线", en: "VIC bond dispute: VCAT / RTBA deadline", es: 'Disputa de fianza en VIC: plazo de VCAT / RTBA', hi: 'VIC बॉन्ड विवाद: VCAT / RTBA समय-सीमा', vi: 'Tranh chấp tiền cọc VIC: hạn chót VCAT / RTBA', ar: 'نزاع تأمين الإيجار في VIC: موعد VCAT / RTBA النهائي' }), 
                                     L({ zh: `请注意，今日向中介 Horizon 提交了正式抗诉信件，依据 14 天法定答复时限，若对方无理回绝，请立即单方面发起 RTBA 索赔！时效届满截止日期：${dateStr}`, en: `You sent a formal dispute letter to the agent Horizon today. Under the 14-day response period, if they refuse without good reason, lodge your own RTBA claim straight away! Deadline: ${dateStr}`, es: `Hoy enviaste una carta formal de disputa a la agencia Horizon. Según el plazo de respuesta de 14 días, si se niegan sin motivo justificado, ¡presenta tu propia reclamación ante la RTBA de inmediato! Fecha límite: ${dateStr}`, hi: `आज आपने एजेंट Horizon को औपचारिक विवाद पत्र भेजा। 14 दिनों की जवाब अवधि के तहत, अगर वे बिना उचित कारण मना करें, तो तुरंत खुद RTBA दावा दायर करें! समय-सीमा: ${dateStr}`, vi: `Hôm nay bạn đã gửi thư khiếu nại chính thức tới đại lý Horizon. Theo thời hạn phản hồi 14 ngày, nếu họ từ chối không có lý do chính đáng, hãy tự nộp yêu cầu RTBA ngay! Hạn chót: ${dateStr}`, ar: `أرسلتَ اليوم رسالة اعتراض رسمية إلى الوكيل Horizon. خلال مهلة الرد البالغة 14 يومًا، إذا رفضوا دون سبب وجيه، فقدّم مطالبتك الخاصة لدى RTBA فورًا! الموعد النهائي: ${dateStr}` })
                                   );
                                 }}
                                 className="flex-1 bg-white hover:bg-neutral-50 text-[#1d1d1f] border-2 border-[#1d1d1f]/35 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                               >
                                 <Calendar size={14} />
                                 <span>{L({ zh: '一键载入法定抗辩日历事件 (.ics)', en: 'Add deadline to calendar (.ics)', es: 'Añadir el plazo al calendario (.ics)', hi: 'समय-सीमा कैलेंडर में जोड़ें (.ics)', vi: 'Thêm hạn chót vào lịch (.ics)', ar: 'أضف الموعد النهائي إلى التقويم (.ics)' })}</span>
                               </button>

                               <button
                                 onClick={() => {
                                   const dateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                   const url = googleCalendarUrl({
                                     title: L({ zh: '⚠️ 维州租务扣押争议 VCAT / RTBA 时效死线', en: '⚠️ VIC bond dispute: VCAT / RTBA deadline', es: '⚠️ Disputa de fianza en VIC: plazo de VCAT / RTBA', hi: '⚠️ VIC बॉन्ड विवाद: VCAT / RTBA समय-सीमा', vi: '⚠️ Tranh chấp tiền cọc VIC: hạn chót VCAT / RTBA', ar: '⚠️ نزاع تأمين الإيجار في VIC: موعد VCAT / RTBA النهائي' }),
                                     dueDate: dateStr,
                                     details: L({ zh: `依据 14 天法定答复时限，若中介无理回绝，请立即单方面发起 RTBA 索赔！时效届满截止日期：${dateStr}`, en: `Under the 14-day response period, if the agent refuses without good reason, lodge your own RTBA claim straight away! Deadline: ${dateStr}`, es: `Según el plazo de respuesta de 14 días, si la agencia se niega sin motivo justificado, ¡presenta tu propia reclamación ante la RTBA de inmediato! Fecha límite: ${dateStr}`, hi: `14 दिनों की जवाब अवधि के तहत, अगर एजेंट बिना उचित कारण मना करे, तो तुरंत खुद RTBA दावा दायर करें! समय-सीमा: ${dateStr}`, vi: `Theo thời hạn phản hồi 14 ngày, nếu đại lý từ chối không có lý do chính đáng, hãy tự nộp yêu cầu RTBA ngay! Hạn chót: ${dateStr}`, ar: `خلال مهلة الرد البالغة 14 يومًا، إذا رفض الوكيل دون سبب وجيه، فقدّم مطالبتك الخاصة لدى RTBA فورًا! الموعد النهائي: ${dateStr}` }),
                                     remindDaysBefore: 3,
                                   });
                                   if (url) window.open(url, '_blank', 'noopener');
                                 }}
                                 className="flex-1 bg-white hover:bg-neutral-50 text-[#1d1d1f] border-2 border-[#1d1d1f]/35 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                               >
                                 <Calendar size={14} />
                                 <span>{L({ zh: '加入 Google 日历（提前 3 天提醒）', en: 'Add to Google Calendar (3-day reminder)', es: 'Añadir a Google Calendar (aviso 3 días antes)', hi: 'Google Calendar में जोड़ें (3 दिन पहले रिमाइंडर)', vi: 'Thêm vào Google Calendar (nhắc trước 3 ngày)', ar: 'أضف إلى تقويم Google (تذكير قبل 3 أيام)' })}</span>
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
                                 <span>{L({ zh: '极速一键直达 Gmail 答复抗辩', en: 'Reply via Gmail in one click', es: 'Responder por Gmail con un clic', hi: 'एक क्लिक में Gmail से जवाब दें', vi: 'Trả lời qua Gmail chỉ với một cú nhấp', ar: 'الرد عبر Gmail بنقرة واحدة' })}</span>
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
                         <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">{L({ zh: '内置经典案例', en: 'Sample case', es: 'Caso de ejemplo', hi: 'नमूना मामला', vi: 'Vụ việc mẫu', ar: 'حالة نموذجية' })}</span>
                       ) : (
                         <span className="text-[10px] text-on-dark bg-ink px-2 py-0.5 rounded font-bold">{L({ zh: '用户自选公文', en: 'Your letter', es: 'Tu carta', hi: 'आपका पत्र', vi: 'Thư của bạn', ar: 'رسالتك' })}</span>
                       )}
                     </div>

                     <div className="w-full bg-white border border-gray-155 rounded-2xl flex flex-col items-center justify-center overflow-x-auto overflow-y-auto relative shadow-sm p-1.5 flex-1 min-h-[300px]">
                       {activeCase ? (
                         <div className="w-full h-full md:max-h-[500px] overflow-y-auto custom-scrollbar p-1 select-none flex justify-center bg-gray-50/20 rounded-xl">
                           {renderDocumentHTML(activeCase, true, false, language)}
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
                       <span>{L({ zh: '📄 放大查阅高清原始公文 (1:1 A4放大)', en: '📄 View the full original letter (1:1 A4)', es: '📄 Ver la carta original completa (1:1 A4)', hi: '📄 पूरा मूल पत्र देखें (1:1 A4)', vi: '📄 Xem toàn bộ thư gốc (1:1 A4)', ar: '📄 عرض الرسالة الأصلية كاملة (1:1 A4)' })}</span>
                     </button>
                   </div>

                   {/* Right Column: AI Translation & Responses */}
                   <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar max-h-[85vh]">
                      {/* Document Verification Status & AI Confidence Card.
                          Rendered only when the analysis actually carries these fields —
                          the preset fallback has no status, and must never fake a verdict. */}
                      {(analysis.status || analysis.confidence != null) && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-4">
                          <div className={`p-3 rounded-xl ${analysis.status === 'risky' ? 'bg-red-50 text-red-600 border border-red-100' : analysis.status === 'clean' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'} flex items-center justify-center shrink-0`}>
                            <Shield size={24} className={analysis.status === 'risky' ? "animate-pulse" : ""} />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                              {analysis.status && (
                                <span className={`text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase ${analysis.status === 'risky' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {analysis.status === 'risky' ? (L({ zh: '⚠️ RISKY / 存在违规风险', en: '⚠️ RISKY', es: '⚠️ RISKY / Con riesgo', hi: '⚠️ RISKY / जोखिम भरा', vi: '⚠️ RISKY / Có rủi ro', ar: '⚠️ RISKY / ينطوي على مخاطر' })) : (L({ zh: '✅ CLEAN / 合规安全', en: '✅ CLEAN', es: '✅ CLEAN / Sin riesgo', hi: '✅ CLEAN / सुरक्षित', vi: '✅ CLEAN / An toàn', ar: '✅ CLEAN / آمن' }))}
                                </span>
                              )}
                              {analysis.confidence != null && (
                                <span className="bg-blue-50 text-blue-800 border border-blue-100 text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wider font-mono">
                                  🧠 {L({ zh: 'AI 置信度', en: 'AI confidence', es: 'Confianza de la IA', hi: 'AI विश्वसनीयता', vi: 'Độ tin cậy AI', ar: 'ثقة الذكاء الاصطناعي' })}: {confidencePct(analysis.confidence)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-sans">
                              {analysis.status === 'risky'
                                ? (L({ zh: '经过高级 AI 视觉模型及消保法例深度交叉研判，本公函中存在以下潜在违规细节、霸王条款或权益被损害细节，请予以审慎对线。', en: 'After cross-checking with an AI vision model and consumer protection law, this letter appears to contain the potential breaches, unfair terms or harm to your rights listed below. Respond carefully.', es: 'Tras contrastarla con un modelo de visión de IA y la ley de protección al consumidor, esta carta parece contener las posibles infracciones, cláusulas abusivas o perjuicios a tus derechos que se indican abajo. Responde con cuidado.', hi: 'AI विज़न मॉडल और उपभोक्ता संरक्षण कानून से मिलान के बाद, इस पत्र में नीचे दिए गए संभावित उल्लंघन, अनुचित शर्तें या आपके अधिकारों को नुकसान दिखाई देते हैं। सावधानी से जवाब दें।', vi: 'Sau khi đối chiếu bằng mô hình thị giác AI và luật bảo vệ người tiêu dùng, lá thư này có vẻ chứa các vi phạm tiềm ẩn, điều khoản bất công hoặc tổn hại đến quyền lợi của bạn được liệt kê dưới đây. Hãy phản hồi thận trọng.', ar: 'بعد المطابقة باستخدام نموذج رؤية بالذكاء الاصطناعي وقانون حماية المستهلك، يبدو أن هذه الرسالة تتضمن المخالفات المحتملة أو الشروط المجحفة أو الإضرار بحقوقك المذكورة أدناه. تعامَل معها بحذر.' }))
                                : analysis.status === 'clean'
                                  ? (L({ zh: '经 AI 研判，此文件属于常规凭证或合规往来公函，暂未扫描到明显的霸王条款、消费欺诈或无故扣款风险。', en: 'The AI assessment found this to be a routine or compliant letter, with no obvious unfair terms, consumer fraud or unjustified charges.', es: 'Según la evaluación de la IA, se trata de una carta rutinaria o conforme, sin cláusulas abusivas evidentes, fraude al consumidor ni cargos injustificados.', hi: 'AI आकलन के अनुसार यह एक सामान्य या नियमों के अनुरूप पत्र है, जिसमें कोई स्पष्ट अनुचित शर्त, उपभोक्ता धोखाधड़ी या अनुचित शुल्क नहीं मिला।', vi: 'Theo đánh giá của AI, đây là thư thông thường hoặc hợp lệ, không có điều khoản bất công, gian lận tiêu dùng hay khoản phí vô lý rõ ràng.', ar: 'وجد تقييم الذكاء الاصطناعي أن هذه رسالة روتينية أو متوافقة، دون شروط مجحفة واضحة أو احتيال على المستهلك أو رسوم غير مبرَّرة.' }))
                                  : (L({ zh: '预置示例模式下不出具合规风险研判；恢复实时分析后将展示 RISKY / CLEAN 结论。', en: 'No compliance risk assessment is given in preset sample mode; a RISKY / CLEAN result will show once live analysis is back.', es: 'En el modo de ejemplo predefinido no se ofrece evaluación de riesgo; el resultado RISKY / CLEAN aparecerá cuando vuelva el análisis en vivo.', hi: 'पूर्व-निर्धारित नमूना मोड में अनुपालन जोखिम का आकलन नहीं दिया जाता; लाइव विश्लेषण लौटने पर RISKY / CLEAN परिणाम दिखेगा।', vi: 'Chế độ mẫu dựng sẵn không đưa ra đánh giá rủi ro tuân thủ; kết quả RISKY / CLEAN sẽ hiển thị khi phân tích trực tiếp hoạt động trở lại.', ar: 'لا يُقدَّم تقييم لمخاطر الامتثال في وضع النموذج المُعدّ مسبقًا؛ ستظهر نتيجة RISKY / CLEAN عند عودة التحليل المباشر.' }))}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Violations / Clause Warning Cards Panel */}
                      {analysis.violations && analysis.violations.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <span>{L({ zh: '违规及霸王条款解析卡片', en: 'Breaches & unfair terms', es: 'Infracciones y cláusulas abusivas', hi: 'उल्लंघन और अनुचित शर्तें', vi: 'Vi phạm và điều khoản bất công', ar: 'المخالفات والشروط المجحفة' })} ({analysis.violations.length})</span>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {analysis.violations.map((v, i) => (
                              <div key={i} className="bg-red-50/20 hover:bg-red-50/40 p-5 rounded-2xl border border-red-100/60 shadow-xs flex flex-col gap-3 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                  <h4 className="text-xs font-bold text-red-900 bg-red-100/60 px-2.5 py-1 rounded-lg">
                                    📜 {L({ zh: '触及条款 / 条约:', en: 'Clause:', es: 'Cláusula:', hi: 'खंड:', vi: 'Điều khoản:', ar: 'البند:' })} {v.clause}
                                  </h4>
                                  <span className="bg-red-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-2xs font-mono">
                                    {v.penaltyRisk}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                  {v.description}
                                </p>
                                <div className="bg-white/80 p-3.5 rounded-xl border border-red-100 text-[11px] text-red-800 flex items-start gap-2 shadow-2xs">
                                  <span className="text-sm shrink-0">💡</span>
                                  <div className="leading-normal">
                                    <strong className="font-bold font-sans">{L({ zh: '对线突击方案:', en: 'How to respond:', es: 'Cómo responder:', hi: 'कैसे जवाब दें:', vi: 'Cách phản hồi:', ar: 'كيفية الرد:' })}</strong> {v.solution}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FCM 48H Proactive Push Alert Guardian Card */}
                      <div className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-red-200/50 shadow-sm flex flex-col md:flex-row items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                          <BellRing size={22} className="animate-bounce" />
                        </div>
                        <div className="flex-1 text-center md:text-left font-sans">
                          <h4 className="text-xs font-black text-gray-900 tracking-wider uppercase">
                            {L({ zh: '🚨 48小时申诉红线提醒守护', en: '🚨 48-hour deadline guard', es: '🚨 Alerta de plazo de 48 horas', hi: '🚨 48 घंटे की समय-सीमा चेतावनी', vi: '🚨 Cảnh báo hạn chót 48 giờ', ar: '🚨 تنبيه الموعد النهائي قبل 48 ساعة' })}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                            {L({ zh: '申诉硬截止日期是留学生的生命线，错失将面临遣返、退学或大额罚金。一键开启后，截止前 48 小时触发浏览器桌面通知与应用内红线警报（保持 Serene 页面开启即可接收；离线 FCM 推送在路线图中）。', en: 'Hard appeal deadlines are critical for international students — missing one can mean losing your visa, your enrolment or a big fine. Turn this on to get a desktop notification and an in-app alert 48 hours before the deadline (keep Serene open to receive them; offline FCM push is on the roadmap).', es: 'Los plazos de apelación son cruciales para los estudiantes internacionales: perder uno puede costarte la visa, la matrícula o una multa elevada. Actívalo para recibir una notificación de escritorio y una alerta en la app 48 horas antes del plazo (mantén Serene abierto para recibirlas; las notificaciones push FCM sin conexión están en la hoja de ruta).', hi: 'अपील की पक्की समय-सीमाएँ अंतरराष्ट्रीय छात्रों के लिए बेहद अहम हैं — एक भी चूकने पर वीज़ा, नामांकन या भारी जुर्माने का खतरा हो सकता है। इसे चालू करें ताकि समय-सीमा से 48 घंटे पहले डेस्कटॉप सूचना और ऐप में अलर्ट मिले (इन्हें पाने के लिए Serene खुला रखें; ऑफ़लाइन FCM पुश रोडमैप में है)।', vi: 'Hạn chót khiếu nại cực kỳ quan trọng với du học sinh — lỡ một lần có thể mất thị thực, mất chỗ học hoặc bị phạt nặng. Bật tính năng này để nhận thông báo trên máy tính và cảnh báo trong ứng dụng 48 giờ trước hạn chót (giữ Serene mở để nhận; thông báo đẩy FCM ngoại tuyến đang trong lộ trình).', ar: 'المواعيد النهائية للطعون بالغة الأهمية للطلاب الدوليين — فقد يعني تفويت أحدها خسارة تأشيرتك أو تسجيلك الدراسي أو غرامة كبيرة. فعّل هذا الخيار لتصلك إشعارات على سطح المكتب وتنبيه داخل التطبيق قبل الموعد النهائي بـ48 ساعة (أبقِ Serene مفتوحًا لاستلامها؛ إشعارات FCM دون اتصال ضمن خطة التطوير).' })}
                          </p>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                            <button
                              onClick={async () => {
                                try {
                                  const permission = await Notification.requestPermission();
                                  if (permission === 'granted') {
                                    // Register this browser session as an alert subscriber. The id is a
                                    // plain session identifier — deadline alerts are delivered over the
                                    // SSE stream + HTML5 Notification (not a real FCM device token).
                                    await fetch('/api/register-fcm', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        token: 'web-session-' + Math.random().toString(36).substring(2, 11),
                                        userId: 'anonymous-user',
                                        email: 'student@serene.org'
                                      })
                                    });
                                    showToast(L({ zh: '🎉 成功开启 48小时红线提醒守护！截止前 48 小时将收到桌面通知与应用内警报。', en: '🎉 48-hour deadline guard is on! You\'ll get a desktop notification and in-app alert 48 hours before the deadline.', es: '🎉 ¡Alerta de plazo de 48 horas activada! Recibirás una notificación de escritorio y una alerta en la app 48 horas antes del plazo.', hi: '🎉 48 घंटे की समय-सीमा चेतावनी चालू हो गई! समय-सीमा से 48 घंटे पहले आपको डेस्कटॉप सूचना और ऐप में अलर्ट मिलेगा।', vi: '🎉 Đã bật cảnh báo hạn chót 48 giờ! Bạn sẽ nhận thông báo trên máy tính và cảnh báo trong ứng dụng 48 giờ trước hạn chót.', ar: '🎉 تم تفعيل تنبيه الموعد النهائي قبل 48 ساعة! سيصلك إشعار على سطح المكتب وتنبيه داخل التطبيق قبل الموعد النهائي بـ48 ساعة.' }), 'success');
                                  } else {
                                    showToast(L({ zh: '⚠️ 浏览器通知权限被拒绝，将退化为应用内弹窗守护。', en: '⚠️ Browser notifications were blocked, so you\'ll get in-app alerts instead.', es: '⚠️ Las notificaciones del navegador están bloqueadas, así que recibirás alertas dentro de la app.', hi: '⚠️ ब्राउज़र सूचनाएँ ब्लॉक हैं, इसलिए आपको ऐप के अंदर अलर्ट मिलेंगे।', vi: '⚠️ Thông báo trình duyệt đã bị chặn, bạn sẽ nhận cảnh báo trong ứng dụng thay thế.', ar: '⚠️ تم حظر إشعارات المتصفح، لذا ستصلك التنبيهات داخل التطبيق بدلًا منها.' }), 'info');
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              {L({ zh: '🚀 一键开启 48h 申诉守护', en: '🚀 Turn on 48h deadline guard', es: '🚀 Activar alerta de plazo de 48 h', hi: '🚀 48 घंटे की चेतावनी चालू करें', vi: '🚀 Bật cảnh báo hạn chót 48 giờ', ar: '🚀 تفعيل تنبيه الـ48 ساعة' })}
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await fetch('/api/test-fcm-push', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      token: 'test-fcm-token'
                                    })
                                  });
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="bg-neutral-800 hover:bg-neutral-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              {L({ zh: '🧪 立即测试 48h 紧急推送', en: '🧪 Test the 48h alert now', es: '🧪 Probar ahora la alerta de 48 h', hi: '🧪 48 घंटे का अलर्ट अभी आज़माएँ', vi: '🧪 Thử cảnh báo 48 giờ ngay', ar: '🧪 اختبر تنبيه الـ48 ساعة الآن' })}
                            </button>
                          </div>
                        </div>
                      </div>
                     <div className="bg-[#FFF4F2] p-6 rounded-2xl border border-[#FEE6E3]">
                    <div className="text-[10px] font-bold text-[#ff5a3c] tracking-widest mb-3 uppercase flex items-center space-x-2">
                       <span className="w-2 h-2 rounded-full bg-[#ff5a3c]"></span>
                       <span>{L({ zh: '它在说什么 & 痛感折算', en: 'What it says & what\'s at stake', es: 'Qué dice y qué está en juego', hi: 'इसमें क्या लिखा है और क्या दांव पर है', vi: 'Thư nói gì & bạn có thể mất gì', ar: 'ماذا تقول الرسالة وما المخاطر' })}</span>
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
                       <span>{L({ zh: '🚀 抗辩执行清单 (To-Do Checklist Kanban)', en: '🚀 To-Do Checklist', es: '🚀 Lista de tareas', hi: '🚀 करने योग्य काम', vi: '🚀 Danh sách việc cần làm', ar: '🚀 قائمة المهام' })}</span>
                     </div>
                     {analysis.deadline && (
                       <div className="bg-white p-4.5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col sm:flex-row items-center gap-4.5 mb-5 font-sans">
                         <div className="w-16 h-16 shrink-0 rounded-2xl border border-red-200 overflow-hidden shadow-sm flex flex-col items-center bg-white">
                           <div className="bg-red-500 text-white text-[9px] py-0.5 text-center w-full font-black tracking-widest uppercase">
                             {(() => {
                               const dStr = analysis.deadline?.date || "";
                               if (dStr) {
                                 const pts = dStr.split('-');
                                 if (pts.length === 3) return language === 'zh' ? `${parseInt(pts[1], 10)}月` : ((MONTH_ABBR[language as GuideLang] ?? MONTH_ABBR.en)[parseInt(pts[1], 10) - 1] || pts[1]);
                               }
                               return L({ zh: '时限', en: 'DUE', es: 'PLAZO', hi: 'अंतिम', vi: 'HẠN', ar: 'الموعد' });
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
                               ⏰ {L({ zh: `剩余 ${analysis.deadline?.businessDaysLeft ?? 0} 天`, en: `${analysis.deadline?.businessDaysLeft ?? 0} days left`, es: `quedan ${analysis.deadline?.businessDaysLeft ?? 0} días`, hi: `${analysis.deadline?.businessDaysLeft ?? 0} दिन बाकी`, vi: `còn ${analysis.deadline?.businessDaysLeft ?? 0} ngày`, ar: `الأيام المتبقية: ${analysis.deadline?.businessDaysLeft ?? 0}` })}
                             </span>
                             {analysis.issuer?.isOfficial && (
                               <span className="bg-[#1d1d1f]/10 text-[#1d1d1f] text-[8px] font-black px-1.5 py-0.5 rounded">
                                 {L({ zh: '🏛️ 官方认证', en: '🏛️ Official', es: '🏛️ Oficial', hi: '🏛️ आधिकारिक', vi: '🏛️ Chính thức', ar: '🏛️ رسمي' })}
                               </span>
                             )}
                           </div>
                           <h3 className="text-xs font-black text-gray-900 mt-1">{L({ zh: '抗诉截止日历：', en: 'Deadline: ', es: 'Plazo: ', hi: 'समय-सीमा: ', vi: 'Hạn chót: ', ar: 'الموعد النهائي: ' })}{analysis.deadline?.date}</h3>
                           <p className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">
                             {L({ zh: '发函机构：', en: 'Issuer: ', es: 'Emisor: ', hi: 'जारीकर्ता: ', vi: 'Cơ quan gửi: ', ar: 'الجهة المُصدِرة: ' })}{analysis.issuer?.name || (L({ zh: '未知机构', en: 'Unknown issuer', es: 'Emisor desconocido', hi: 'अज्ञात जारीकर्ता', vi: 'Không rõ cơ quan gửi', ar: 'جهة مُصدِرة غير معروفة' }))}
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
                             <span>{L({ zh: '申诉执行进度', en: 'Progress', es: 'Progreso', hi: 'प्रगति', vi: 'Tiến độ', ar: 'التقدّم' })}</span>
                             <span>{completedCount}/{totalCount} {L({ zh: '已完成', en: 'done', es: 'hechas', hi: 'पूरे', vi: 'đã xong', ar: 'مكتملة' })} ({percentage}%)</span>
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
                                 <span>🌐 {L({ zh: '去官网对线：', en: 'Go to official site: ', es: 'Ir al sitio oficial: ', hi: 'आधिकारिक साइट पर जाएँ: ', vi: 'Đến trang chính thức: ', ar: 'اذهب إلى الموقع الرسمي: ' })}{task.channel || (L({ zh: '在线申诉纠纷平台', en: 'Online dispute portal', es: 'Portal de reclamaciones en línea', hi: 'ऑनलाइन विवाद पोर्टल', vi: 'Cổng khiếu nại trực tuyến', ar: 'بوابة النزاعات الإلكترونية' }))}</span>
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
                          <h4 className="text-[11px] font-bold text-[#B58529] tracking-widest mb-1.5 uppercase">{L({ zh: '对线策略（中文意图）', en: 'Strategy (plain-language intent)', es: 'Estrategia (intención en lenguaje sencillo)', hi: 'रणनीति (सरल भाषा में मंशा)', vi: 'Chiến lược (ý định bằng lời dễ hiểu)', ar: 'الاستراتيجية (النية بلغة مبسّطة)' })}</h4>
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
                                   {L({ zh: '依据：', en: 'Basis: ', es: 'Base legal: ', hi: 'आधार: ', vi: 'Căn cứ: ', ar: 'الأساس: ' })}{right.legalBasis}
                                 </span>
                                 {right.sourceUrl && (
                                   <a 
                                     href={right.sourceUrl} 
                                     target="_blank" 
                                     rel="noopener noreferrer" 
                                     className="inline-flex items-center gap-0.5 text-[#1d1d1f] font-black hover:text-[#ff5a3c] hover:underline whitespace-nowrap"
                                   >
                                     <span>{L({ zh: '🔗 查看官方原文条款', en: '🔗 View official source', es: '🔗 Ver fuente oficial', hi: '🔗 आधिकारिक स्रोत देखें', vi: '🔗 Xem nguồn chính thức', ar: '🔗 عرض المصدر الرسمي' })}</span>
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
                          <span className="text-xs font-bold text-gray-400 whitespace-nowrap uppercase tracking-wider w-12">{L({ zh: '发给', en: 'To', es: 'Para', hi: 'प्रति', vi: 'Gửi', ar: 'إلى' })}</span>
                          <input 
                            type="email" 
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
                            placeholder={L({ zh: '机构邮箱地址', en: 'Organisation email address', es: 'Correo de la organización', hi: 'संस्था का ईमेल पता', vi: 'Địa chỉ email của tổ chức', ar: 'البريد الإلكتروني للجهة' })}
                          />
                       </div>
                       
                       <div className="flex items-center space-x-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 whitespace-nowrap uppercase tracking-wider w-12">{L({ zh: '主题', en: 'Subject', es: 'Asunto', hi: 'विषय', vi: 'Tiêu đề', ar: 'الموضوع' })}</span>
                          <input 
                            type="text" 
                            value={analysis.englishDraft.subject}
                            readOnly
                            className="flex-1 bg-transparent text-sm font-bold text-gray-900 focus:outline-none placeholder-gray-400"
                            placeholder={L({ zh: '邮件主题', en: 'Email subject', es: 'Asunto del correo', hi: 'ईमेल का विषय', vi: 'Tiêu đề email', ar: 'موضوع البريد' })}
                          />
                       </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-4 mb-6">
                       <div className="flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-2 px-1">
                             <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">{L({ zh: '英文原稿（可自由修改）', en: 'English draft (editable)', es: 'Borrador en inglés (editable)', hi: 'अंग्रेज़ी मसौदा (संपादन योग्य)', vi: 'Bản nháp tiếng Anh (có thể sửa)', ar: 'المسودة بالإنجليزية (قابلة للتعديل)' })}</label>
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
                               <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">{L({ zh: '中文精准对照', en: 'Reference translation', es: 'Traducción de referencia', hi: 'संदर्भ अनुवाद', vi: 'Bản dịch tham khảo', ar: 'ترجمة مرجعية' })}</label>
                               {isTranslating && <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><div className="w-2 h-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> {L({ zh: '翻译中...', en: 'Translating...', es: 'Traduciendo...', hi: 'अनुवाद हो रहा है...', vi: 'Đang dịch...', ar: 'جارٍ الترجمة...' })}</span>}
                             </div>
                             <div className="w-full bg-[#FBFBFA] border border-gray-100 rounded-2xl p-5 text-sm font-sans resize-none h-[320px] shadow-inner overflow-y-auto leading-relaxed text-gray-600 markdown-body">
                                <Markdown>{currentTranslation}</Markdown>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
                       <p className="text-xs text-gray-400 font-medium mb-5 text-center leading-relaxed max-w-md">
                         {LJ({
                           zh: <>AI 仅辅助生成草稿，<strong className="text-gray-500">发送前请仔细检查 [中括号] 内的信息</strong>。本服务不构成法律或学术建议。</>,
                           en: <>AI only helps you draft — <strong className="text-gray-500">check everything in [square brackets] carefully before sending</strong>. This service is not legal or academic advice.</>,
                           es: <>La IA solo te ayuda a redactar — <strong className="text-gray-500">revisa con cuidado todo lo que está entre [corchetes] antes de enviar</strong>. Este servicio no constituye asesoramiento legal ni académico.</>,
                           hi: <>AI केवल मसौदा बनाने में मदद करता है — <strong className="text-gray-500">भेजने से पहले [वर्गाकार कोष्ठकों] में दी गई हर जानकारी ध्यान से जाँचें</strong>। यह सेवा कानूनी या शैक्षणिक सलाह नहीं है।</>,
                           vi: <>AI chỉ hỗ trợ bạn soạn thảo — <strong className="text-gray-500">hãy kiểm tra kỹ mọi thông tin trong [ngoặc vuông] trước khi gửi</strong>. Dịch vụ này không phải là tư vấn pháp lý hay học thuật.</>,
                           ar: <>الذكاء الاصطناعي يساعدك في الصياغة فقط — <strong className="text-gray-500">راجِع بعناية كل ما بين [الأقواس المربعة] قبل الإرسال</strong>. هذه الخدمة لا تُعدّ استشارة قانونية أو أكاديمية.</>,
                         })}
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
                         <p className="text-[10px] text-gray-400 text-center mt-2">{L({ zh: '自动打开 Gmail 网页版，收件人、主题、正文已替你填好；你过目无误后点发送（不会自动发出）。', en: 'Opens Gmail on the web with the recipient, subject and body filled in. Review it, then hit Send yourself (nothing is sent automatically).', es: 'Abre Gmail en la web con el destinatario, el asunto y el cuerpo ya completados. Revísalo y pulsa Enviar tú mismo (no se envía nada automáticamente).', hi: 'Gmail वेब पर खुलेगा, जिसमें प्राप्तकर्ता, विषय और संदेश पहले से भरे होंगे। जाँच लें, फिर खुद Send दबाएँ (कुछ भी अपने-आप नहीं भेजा जाता)।', vi: 'Mở Gmail trên web với người nhận, tiêu đề và nội dung đã điền sẵn. Hãy xem lại rồi tự bấm Gửi (không có gì được gửi tự động).', ar: 'يفتح Gmail على الويب مع تعبئة المستلم والموضوع والنص مسبقًا. راجِعه ثم اضغط إرسال بنفسك (لا يُرسَل شيء تلقائيًا).' })}</p>
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
                    {L({ zh: '切到 Gmail 标签页，收件人、主题、正文都已预填；过目无误后点发送。这道难关，就快跨过去了。', en: 'Switch to the Gmail tab — the recipient, subject and body are already filled in. Review it and hit Send. You\'re almost through this one.', es: 'Cambia a la pestaña de Gmail: el destinatario, el asunto y el cuerpo ya están completados. Revísalo y pulsa Enviar. Ya casi lo tienes.', hi: 'Gmail टैब पर जाएँ — प्राप्तकर्ता, विषय और संदेश पहले से भरे हैं। जाँचें और Send दबाएँ। यह मुश्किल लगभग पार हो गई।', vi: 'Chuyển sang tab Gmail — người nhận, tiêu đề và nội dung đã được điền sẵn. Xem lại rồi bấm Gửi. Bạn sắp vượt qua chuyện này rồi.', ar: 'انتقل إلى علامة تبويب Gmail — المستلم والموضوع والنص معبّأة مسبقًا. راجِعها واضغط إرسال. أوشكت على تجاوز هذه العقبة.' })}
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
                    {activeCase ? `${guides[activeCase].title} - ${L({ zh: '官方正本 A4 高清阅览', en: 'original letter, A4 HD view', es: 'carta original, vista A4 en HD', hi: 'मूल पत्र, A4 HD दृश्य', vi: 'thư gốc, xem A4 HD', ar: 'الرسالة الأصلية، عرض A4 بدقة عالية' })}` : (L({ zh: '已上传公文 - 高清放大阅览', en: 'Uploaded letter - HD view', es: 'Carta subida - vista en HD', hi: 'अपलोड किया गया पत्र - HD दृश्य', vi: 'Thư đã tải lên - xem HD', ar: 'الرسالة المرفوعة - عرض بدقة عالية' }))}
                  </span>
                </div>
                <button 
                  onClick={() => setShowDocModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-white transition-colors cursor-pointer"
                  title={L({ zh: '关闭', en: 'Close', es: 'Cerrar', hi: 'बंद करें', vi: 'Đóng', ar: 'إغلاق' })}
                >
                  <X size={15}/>
                </button>
              </div>

              <div className="p-4 md:p-8 overflow-y-auto bg-gray-100 flex-1 flex justify-center custom-scrollbar">
                <div className="w-full max-w-2xl overflow-x-auto">
                  {activeCase ? (
                    renderDocumentHTML(activeCase, false, privacyShieldActive && shieldStatus === 'secured', language)
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
                    <span>{L({ zh: '一键对该公文进行Ai深度解析与写信申诉', en: 'Analyse this letter with AI and draft an appeal', es: 'Analizar esta carta con IA y redactar una apelación', hi: 'इस पत्र का AI से विश्लेषण करें और अपील का मसौदा बनाएँ', vi: 'Phân tích thư này bằng AI và soạn đơn khiếu nại', ar: 'حلّل هذه الرسالة بالذكاء الاصطناعي وصِغ اعتراضًا' })}</span>
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
