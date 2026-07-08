import React, { useState, useEffect, useRef } from 'react';
import { Mic, Phone, MapPin, AlertCircle, Volume2, ShieldAlert, BookOpen, Sparkles, Copy, Check, HeartHandshake, ExternalLink, ArrowRight, ShieldCheck, CheckSquare, Square, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import RescueMap from './RescueMap';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== '';

const SAMPLE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  AU: { lat: -37.8124, lng: 144.9648 },
  US: { lat: 40.7484, lng: -73.9857 },
  UK: { lat: 51.5033, lng: -0.1276 },
  CA: { lat: 43.6426, lng: -79.3871 },
};

import { useLocale, getCountryContent, getCountryName, getInterpreterName } from '../lib/locale';
import { useT, type StringKey } from '../lib/i18n';
import FallbackNotice from './FallbackNotice';
import { generateEmergencyGuideOnDevice, onDeviceAIStatus } from '../lib/onDeviceAI';

interface CheatsheetType {
  titleKey: StringKey;
  emoji: string;
  english: string;
  meaningKey: StringKey;
}

const EMERGENCY_CHEATSHEETS: CheatsheetType[] = [
  {
    titleKey: "ea_cs1_title",
    emoji: "🚑",
    english: "I need an ambulance, someone passed out and has severe difficulty breathing.",
    meaningKey: "ea_cs1_meaning"
  },
  {
    titleKey: "ea_cs2_title",
    emoji: "🛡️",
    english: "I was just mugged and assaulted. I need immediate police assistance at my location.",
    meaningKey: "ea_cs2_meaning"
  },
  {
    titleKey: "ea_cs3_title",
    emoji: "🚪",
    english: "My residence is being broken into right now. There is an active intruder and we are in danger.",
    meaningKey: "ea_cs3_meaning"
  },
  {
    titleKey: "ea_cs4_title",
    emoji: "🔥",
    english: "There is a fire breaking out at this address. Please send a fire brigade immediately.",
    meaningKey: "ea_cs4_meaning"
  }
];

interface TenancyContact {
  name: string;
  phone?: string;
  url?: string;
  desc: string;
}

interface TenancyEmergency {
  title: string;
  emoji: string;
  situation: string;
  calmAdvice: string;
  contacts: TenancyContact[];
  steps: string[];
  lawShield: string;
}

// titleKey/situationKey drive the (localized) picker UI; the zh calmAdvice/contacts/
// steps/lawShield are the static AU source-of-truth shown only to zh users — other
// locales get an AI-generated, localized guide (see /api/tenancy-guide below).
interface TenancyScenario {
  titleKey: StringKey;
  situationKey: StringKey;
  emoji: string;
  calmAdvice: string;
  contacts: TenancyContact[];
  steps: string[];
  lawShield: string;
}

const TENANCY_EMERGENCIES: TenancyScenario[] = [
  {
    titleKey: "ea_t1_title",
    situationKey: "ea_t1_situation",
    emoji: "🚪",
    calmAdvice: "【保持冷静】切记不要与对方发生暴力冲突。在澳洲，只要存在合法事实租约，您对居所享有完完全全、不可分割的【排他占有权 (Exclusive Possession)】。任何未经正规书面通告的擅自闯入，均构成重度违规乃至非法侵入罪 (Trespassing)！",
    contacts: [
      { name: "澳洲非紧急报警中心 (Police Assistance Branch)", phone: "131444", desc: "如遭遇房东暴力推门、拒绝离开，大声抗议未果后，直接该号报警协助驱赶非法侵入者。" },
      { name: "维多利亚消费者事务局 (Consumer Affairs Victoria)", phone: "1300558181", url: "https://www.consumer.vic.gov.au", desc: "澳洲官方租屋法务监管处，负责针对中介/房东非法进入查处书面警告。" },
      { name: "维州租客工会 (Tenants Victoria Legal Advocacy)", phone: "0394111444", url: "https://tenantsvic.org.au", desc: "完全免费的中立租客援助网络，直接为您起草抗辩发函文件。" }
    ],
    steps: [
      "锁定并留存视频证据：立即使用手机全程录影，或留存中介在未发信时突然闯入的物证、聊天记录及锁芯情况。",
      "当面抗议并大声宣读守则：告知对方：'According to Section 85 of the Victoria RTA, you must provide me 24 hours written notice. You are currently trespassing!'，要求对方即刻跨出门外。",
      "邮寄正式追责发函：书面邮件致中介/房东。直斥其非法行为严重侵犯您的「安静享有权 (Quiet Enjoyment)」，警告若有再犯，将直接提请 VCAT 维州法庭申请限制令，并可抵扣主租金赔偿。"
    ],
    lawShield: "维多利亚州《住宅租约法》(RTA) 第 85-91 条严格规定：房东或中介只有在极少数极个别法定义务下（如发生24小时紧急水漏事件、或提前不少于 24 小时发放法定纸质 / 邮件书面许可通知），方可进屋。未有通知者擅入一律犯法。"
  },
  {
    titleKey: "ea_t2_title",
    situationKey: "ea_t2_situation",
    emoji: "🎒",
    calmAdvice: "【保持冷静】请在心底坚信澳洲法律的坚韧度！没有任何一个房东可以自说自话“驱赶”合法事实定居的租户，甚至本地警察也绝无哪怕一丝权力在没有 VCAT 判决书（Warrant of Possession）的情况下强行请您离开。只要您还在锁内，任何自力赶人换锁行为皆触犯澳洲刑法！",
    contacts: [
      { name: "当地公办安全派出所", phone: "131444", desc: "若房东正对您实施野蛮撬锁暴力，立即叫警察说：“My landlord is performing an illegal self-help eviction right now.”。巡警会当场勒令房东停止违法行为。" },
      { name: "VCAT 紧急求助纠纷专线", phone: "1300018228", url: "https://www.vcat.vic.gov.au", desc: "提供闪电求救通道，专门为被锁在大门外、行李被抛流落街头的弱势留学生出具最高级24h紧急准入法令。" },
      { name: "墨大Monash等持牌大学无偿学生法援 (Monash Legal Clinic)", desc: "提供完全保密的一对一免费代理律师服务，帮助起诉恶霸房东并主张高达万刀的紧急临时赔款渠道。" }
    ],
    steps: [
      "死守防线，绝不交付钥匙：锁匠无权听信未持法执的房东换锁。如果中途被迫锁在大门外，请保持警惕，并立即宣称有护照物品在内有被非法侵占风险，呼叫警察陪同护送并合法找锁匠归复进入。",
      "严词书面发送反非法驱退申明：向其发微信警告：'Under Australian laws, only VCAT with a warrant executed by police can evict me. Self-eviction is a criminal offense.' 促使对方收敛情绪。",
      "一键搜集证据链用于 VCAT 法庭审理索赔：微信中只要包含“不给你搬/断网/滚回去/扔行李”的一言半语，全部截图保存，对方只要动手，法院将罚没并当面清算高额惩罚性精神抚慰费。"
    ],
    lawShield: "维特州 RTA 行政规定：房东赶人必须严格执行发送 Notice to Vacate（正常情况下需提前 14-120 天不等），随后自费走完开庭程序，最终拿到 VCAT 签发的占有证，交由维州警察局总法警执行。不走此渠道的任何硬碰硬驱赶都被认定构成租务民事重大违法犯罪。"
  },
  {
    titleKey: "ea_t3_title",
    situationKey: "ea_t3_situation",
    emoji: "💧",
    calmAdvice: "【保持冷静】请注意这在大洋洲法律中被清晰认定为“紧急维修（Urgent Repairs）”范畴！一旦属于紧急抢修事件，维州租客被赋予極高的“极速自保额度保护”。若中介或房东失联 24 小时，您全权享有最高 $2,500 AUD 的自理雇工处理并向房东按日等值报销、1分钱不少退还的硬核权利！",
    contacts: [
      { name: "维多利亚民防灾难局 (SES Disaster Service)", phone: "132500", desc: "如暴风雨引发严重断瓦、树木爆倒压塌、整栋楼彻底淹水引发不安全，请无偿找 SES 出动进行救援。" },
      { name: "Lease 正规合同上的指定紧急管工", desc: "查看您签署的租期合同最上面一行，法定必须留有 Emergency Water/Electrical Service 水电急抢师父备用联系人。" },
      { name: "Google 本地持牌执业水电管道团队 (Licensed Plumber)", desc: "如 24 小时失音讯，可直接安排本地合格师傅到场修补，告知商家必须开单列明 GST 的标准发票以便退额。" }
    ],
    steps: [
      "精细全方位录像拍照：必须保留 15 秒连贯的淹水、渗水、电表不供热的带有当前音画的视频。切记留存，这将是向保险及房东反诉理赔的核心资产。",
      "全天候邮件微信通知加缀“URGENT”：发微信写明：'This is an URGENT REPAIR as defined in s 3 of RTA. Pls arrange plumber within 24 hours.' 触发法定时限计时器。",
      "24小时无响应则直接启动自费应急：直接自主联系水管师傅修护，保留好完备的 Receipt 收据，回寄给中介（法律规定房东大房东必须在 7 天内无理由退还您垫资的最高 2,500 刀应急款）。"
    ],
    lawShield: "维省《住宅租约法》第 3 条与第 72 条款明规：大暴水、天然气煤气泄露、主大门进不去或断热水属于法定「急速紧急维修」。其倒计时为 24 小时内必须修复，租商故意拖延，会被课以全额垫付款归还和庭外高价追讨索赔。"
  },
  {
    titleKey: "ea_t4_title",
    situationKey: "ea_t4_situation",
    emoji: "🔑",
    calmAdvice: "【保持冷静】请不要害怕。丢配钥匙虽然会耽误行程，但绝对是单纯极普通的民事无心之失！在澳洲法律上，任何人一律绝对禁止以“丢失钥匙”为把柄非法霸占、物理压扣、没收您的护照、学生卡、包箱、数码设备等人身生活必需品。这涉及非法占执！",
    contacts: [
      { name: "本地合法挂牌配匙锁匠 (Licensed Locksmith)", desc: "如果房子只属于您名下租套。您是当前绝对权利人，有权在出示身份证前提下直接聘锁匠合法换新锁芯并拿到钥匙，房主无权干预。" },
      { name: "墨大/蒙纳士中国留学生紧急安全协作群", desc: "可紧急求助于同学或校务处留学生部，为您支招并陪同到现场，避免单人面对粗暴房东被讹人情纠纷。" }
    ],
    steps: [
      "常规工作日先到中介柜台借备用：如果只是纯钥匙忘带，在工作日上午可带上护照前去中介实体门锁店借用 Master Key 备份，通常只需二三十刀甚至免费归还即可，绝对别冲动踹木门导致天价损坏赔偿。",
      "严正书面控告对方侵吞：如被二房东扣人身行李，发微信大声告知对方：'Withholding my bag and passport after key loss is a major offence under Victorian criminal laws. I will summon the police.'",
      "警务力量护航搬取个人高货行李物：不要只身打群架，带着房屋租期租金收据和账单直接求助非紧急安全局 131 444。预约执勤警察驱车守店在门前护送您堂堂正正搬走存货及行李，房东只能服服帖帖交出行李，不敢吭一声。"
    ],
    lawShield: "依照《租务住宅法》Section 411A 条款明字： 禁止房东及二房东由于一切租房纠纷，擅自搜缴、压扣租户床褥、行装、微波炉、电脑和随行卡包证件，此行当场触发民法重惩违法警铃。"
  },
  {
    titleKey: "ea_t5_title",
    situationKey: "ea_t5_situation",
    emoji: "⚡",
    calmAdvice: "【保持冷静】在澳洲法治社会，私掐民生大电网、故意停水断网被明确定性为极其嚣张的【严重非合规租约侵犯行为】！即便真的在经济上稍有扯皮过错，对方只要使用这种私刑，法官对他的倾向度会直接降到冰点！您已占领100%正义神主高地，请沉住气搜集他的证据！",
    contacts: [
      { name: "维多利亚水电能源监理署 (EWOV)", phone: "1800500509", url: "https://www.ewov.com.au", desc: "极强大一级的公共水电能源局。由于只要提供无端被房东掐电地址，将上报由电力水务集团严惩该房东，令其强开供能通道。" },
      { name: "CAV 消费者纠错热线办", phone: "1300558181", desc: "向稽查队当即登记反馈被逼掐水断网行为。会致函给予中介极其凶猛的行政红线罚款通告。" }
    ],
    steps: [
      "不间断物理全能拍片存照：走到后院去拍摄已断电空空的总电闸盒、空流水龙头，以及手机上路由器无法发信、WiFi连不上的高清全屏截图。用极强的电子时钟定死精确断能源时分，绝不放过任何一个黑房东。",
      "大声明确宣读法律警告：用书面（微信/邮件）对准对方：'S S27 of Victorian RTA clearly bans cutting utilities. We demand full restoration now or we seek thousands of AUD of damages in VCAT.' 给对方十万伏特法律威慑。",
      "向 VCAT 起诉主张按双倍日宿索还赔偿：如果被故意断水断电甚至断网。由于极度影响人类常理生活，您可以直接通过学校律师在 VCAT 提出起索。开庭可以直接要求房东承担并报销你这几天出去住五星级饭店及临时办公网络的全部昂贵自筹单据！"
    ],
    lawShield: "《住宅租约法》第 27 条例严格严厉宣布：房东或任何人绝不可以用直接或蓄意妨碍的方法切断、干预、暂停或终结向承租物业供应基本电力、自来水、互联网、下水道等必备公用事业，犯规人必受严厉民事仲裁大额惩戒。"
  },
  {
    titleKey: "ea_t6_title",
    situationKey: "ea_t6_situation",
    emoji: "💰",
    calmAdvice: "【保持冷静】最要紧的一点认识是：中介/房东【完全没有一丝主动直接拿走您一分钱押金的任何物理权利】。全澳所有正规房租押金都是由省独立押金局（比如维州的 RTBA）在联邦级安全看护下闭包托管的。没有你的数字签名，他就是抢破头一分钱也提现不了！",
    contacts: [
      { name: "住宅押金存管最高主管局 (RTBA)", url: "https://rentalbonds.vic.gov.au", desc: "掌握着核心押金生杀大权。您可以在这直接操作不经中介、由租客自主申请 100% 完全退还押金的无尚密钥！" },
      { name: "VCAT 行政小争议审判庭", phone: "1300018228", desc: "当中介拒绝你全退时。中介如果不愿彻底认输，则中介【必须自费】去起诉并说服 VCAT 裁判法官是租户“破坏”了屋子。由于中介嫌麻烦、无铁证或算不赢开庭账，九成会中途退缩求和。" }
    ],
    steps: [
      "全网最强王炸对阵策略：抢先秒提 RTBA 100% 自主退款申请！：退房并且交钥匙的当天第一秒，立刻自己登录 RTBA 手机端或网页，越过中介直接填写您的退款申请（Refund Bond Request）。别傻站着等中介的做贼折旧报告！",
      "静静对耗，享受 14 天倒计时：一旦您的自主申请成功进入 RTBA。根据维特州新法，中介只被给予 14 天的申诉宽限期。如果中介死活想要扣钱：【中介必须在 14 天里，自掏开庭起诉费把你在 VCAT 起诉开庭，由法官判】；如果 14 天内中介没胆量完成去 VCAT 起诉走流程，RTBA 安全金库将在第 15 天凌晨【原封不动 100% 自动打回您的澳洲银行卡】！这一招能直接逼退 90% 的讹钱中介！",
      "深刻熟记“自然折旧 (Fair Wear and Tear)”免责金印：在澳洲，诸如墙壁由于时间陈旧开缝、门框开合轻微生锈、长年阳光暴晒掉漆、地毯正常行走磨薄、烤箱用久发黄、老窗纱开丝等，一律统统判定为【自然磨损折旧】，完全是房东的资产风险，租客绝对不需要做任何折旧赔付、烤漆。VCAT 听证会上裁判官看到类似的小划痕，向来都会以白眼直接对中介无情驳回！"
    ],
    lawShield: "维特州 RTA 新条款（2021修订）宣布： 租约期满后，如果物业已达“合理干净程度”，中介绝不可强索指定地毯高昂洗护；只要租客先在 RTBA 发起退款声讨，后续全部开庭及搜证自证的巨额举证责任一律全部【强行转加扣于中介与老房东身上】。不自证即退回！"
  },
  {
    titleKey: "ea_t7_title",
    situationKey: "ea_t7_situation",
    emoji: "⚖️",
    calmAdvice: "【保持冷静】请在胸中重重长舒一口气！VCAT 不是刑事大法院，没有派人关押、剥夺签证、或记入刑事有罪判决的任何警务威能。它只是平等的【小额民事消费纠纷仲裁庭】，在这里不留一切背景案底，不需要哪怕一毛钱巨款找私人大律师，完全是一个只认事实的公开摆摊说理庭。它是最保护咱们留学生语言弱势的，裁判Member对蛮梁大中介、大房东一向严打得紧，这甚至是你的绝地大反击阵地！",
    contacts: [
      { name: "VCAT 免费同声翻译客户窗口 (Request Interpreter)", phone: "1300018228", desc: "直接给客服打电话报告，您的开庭注册号，告知您是 international student，需要：‘Free Chinese Mandarin Interpreter Support’。开庭时会委派中澳最高级权威翻译官在线全程帮您中英精准翻译辩护，分文不取！" },
      { name: "Monash Monash Law Clinic 无偿高校律师中心", desc: "Monash, University of Melbourne 等高等法学院大牛辅导机构，配备有免费的持双牌资深名誉大律师对口辅导，陪同为您一字一字代拟法庭答辩词 PDF。" }
    ],
    steps: [
      "绝对、千真万确千万不要逃漏席！：大部分现在澳洲开庭模式都是通过 Zoom 会议系统或简单的群组电话线上开庭（Phone Hearing），您坐在寝室喝茶即可参与。如果刚好遭遇考试、生病：携带好官方实证，提前在系统里写信申请“延期开庭(Adjournment)”。如果不闻不问不理会开庭，对方将由于未到场阻扰抗辩，单方面高额全胜，导致法庭强制签扣押！",
      "有条不紊、有章循迹搜证并上传 Reta Web Portal：将大门没修漏水的录像视频、入住签字表格（Entry Condition Report）、微信说“WiFi不给用”截图全部标号打包编纂为 PDF，直接拖拉到 VCAT 的共享证据共享空间。",
      "理学清晰在翻译护航下说清真相：出庭直接用中文表达：‘我是留学生，我一直非常认真对待房主，但中介在此恶意讹钱，虚造开单。’ 只要你的理由充分合意、证据没有穿帮，Member 法官对房东漫天叫价的罚金往往会大砍狂砍一分都不留，这正是你出恶气的机会！"
    ],
    lawShield: "《维多利亚省民事和行政公开法规定》：为确保公允性，VCAT 审辩的核心立基在于：任何人不需要背负支付几万刀大律师法费也能为自己维权。除极其罕见例外，中介与房东除非能自证正当理由并获得法官允许，否则【一律严厉禁止雇佣职业诉讼大律师代其出庭】，这完全打破了财阀中介的资本不对等壁垒，把学生直接推向天平的最公平一侧！"
  },
  {
    titleKey: "ea_t8_title",
    situationKey: "ea_t8_situation",
    emoji: "🧼",
    calmAdvice: "【保持冷静】这极其缺乏任何本地合规常识的商业讹计！澳洲租务法条严密警告，房东绝无命令您选择哪个特定名下保洁清洁队的硬权力。同样更别被“不还钥匙多扣日金”的粗俗中介手段唬住，我们可以无形物理出击，两秒钟破局！",
    contacts: [
      { name: "CAV 政府合规稽查行动局", phone: "1300558181", desc: "遇到这种涉嫌强绑消费的，直接告知 CAV 该中介名。官方一纸警告单砸到他们写字楼，必定能令其噤若寒蝉。" },
      { name: "Tenants Victoria 支持线", phone: "0394111444", desc: "提供房东无赖钥匙多扣、虚假讹费时专用的正规警告邮件回复模板。" }
    ],
    steps: [
      "理智分清：干净即可，不是豪车展厅！：法律的词汇是‘Reasonably Clean (合理干净程度)’。只要大致没有积土、垃圾全部装袋丢外、烤箱大致擦过即可，陈年死灰折旧不是租客的包袱！",
      "钥匙物理还退终极无解避坑战术：把大门房门所有的门卡钥匙整齐放个透明封袋。在合同截止那天的办公室时段，【大大架架直接推开中介实体门面】，甩在前台。在交还柜台一瞬间，掏出手机物理排录视频——完整录制：‘钥匙物理归还现场 + 握着钥匙的柜台黑人前台手特写 + 前台门上的实体时钟或你手上正在读秒的国家时间。记录妥善，把钥匙留在前台台面扭头出去，你的法定交割到此 100% 结束！中介哪怕少拿一把他也绝没法律理由多算你在这一秒之内的任何房租。多一分钟都不可能！",
      "给其回一封滴水不漏的反指控电邮：发送：'According to Victoria CAV guidelines, tenants are free to choose any cleaner. The keys have been physically returned, and keep claiming tenancy is in breach of s 181. We have lodged full direct bond claim today with RTBA.' 随后傲娇地走人。"
    ],
    lawShield: "Victoria S181 条租用住宅法案白纸黑字直写：任何中介、房东或租赁提供商，都一律严禁威逼、迫使、诱导或间接强制承租租户前往特定的专门清洁承包公司、或第三方渠道订购服务作为其完成交割履约的强求条件。"
  }
];

export default function EmergencyAidDemo() {
  const { country, language, region } = useLocale();
  const content = getCountryContent(country);
  const countryName = getCountryName(country, language);
  const interpreter = getInterpreterName(language);
  const t = useT();
  // Country+state label in the user's language, reused across guide copy.
  const locationLabel = `${countryName}${region ? ` · ${region}` : ''}`;
  const [isListening, setIsListening] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [meltdownTriggered, setMeltdownTriggered] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [activeCheatsheetIdx, setActiveCheatsheetIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // Custom states for interactive Tenancy Emergency First-Aid Kit
  const [emergencyTab, setEmergencyTab] = useState<'tenancy' | 'physical'>('physical');
  const [selectedTenancyIdx, setSelectedTenancyIdx] = useState(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // States for AI custom emergency generator in the physical safety tab
  const [customScenario, setCustomScenario] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customOutputs, setCustomOutputs] = useState<{
    scenarioTitle: string;
    englishTalk: string;
    chineseTalk: string;
    actions: string[];
    tisTips: string;
    isQuotaFallback?: boolean;
    onDevice?: boolean;
  } | null>(null);
  // Google Maps embed query for the "附近救援点" quick map (null = hidden).
  const [rescueMapQuery, setRescueMapQuery] = useState<string | null>(null);
  // Chrome Built-in AI (Gemini Nano) availability: powers offline, on-device generation.
  const [onDeviceStatus, setOnDeviceStatus] = useState<string>('unavailable');
  useEffect(() => { onDeviceAIStatus().then(setOnDeviceStatus).catch(() => {}); }, []);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsCacheRef = useRef<Map<string, string>>(new Map());

  // Try Chrome Built-in AI (Gemini Nano) fully on-device — no network. Returns true if it
  // produced a tailored plan (used offline-first, and as a fallback when the server is down).
  const tryOnDeviceGuide = async (scenarioText: string): Promise<boolean> => {
    const langName = language === 'zh' ? '中文' : language === 'en' ? 'English' : language;
    const guide = await generateEmergencyGuideOnDevice(scenarioText, {
      countryName,
      emergencyNumber: content.emergency,
      langName,
      interpreterLang: interpreter,
    });
    if (!guide) return false;
    setCustomOutputs({ ...guide, onDevice: true });
    return true;
  };

  const handleGenerateEmergencyGuide = async (scenarioText: string) => {
    if (!scenarioText.trim()) return;
    setIsGeneratingCustom(true);
    setCustomOutputs(null);

    // Offline-first: an emergency kit is most needed with no signal. If the device is offline
    // and Gemini Nano is ready, generate entirely on-device before even trying the network.
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (isOffline && onDeviceStatus === 'available') {
      try {
        if (await tryOnDeviceGuide(scenarioText)) { setIsGeneratingCustom(false); return; }
      } catch (e) { console.warn('On-device emergency generation failed, trying network:', e); }
    }

    try {
      const response = await fetch('/api/generate-emergency-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario: scenarioText, country, language, region }),
      });
      const data = await response.json();
      if (data && !data.error) {
        setCustomOutputs({
          scenarioTitle: data.scenarioTitle,
          englishTalk: data.englishTalk,
          chineseTalk: data.chineseTalk,
          actions: data.actions || [],
          tisTips: data.tisTips,
          isQuotaFallback: !!data.isQuotaFallback,
        });
      } else {
        throw new Error(data.error || "Generation error");
      }
    } catch (err) {
      console.warn("Failed to generate emergency guide, applying fallback:", err);
      // Before the static presets, try Gemini Nano on-device (works even fully offline).
      try {
        if (await tryOnDeviceGuide(scenarioText)) { setIsGeneratingCustom(false); return; }
      } catch (e) { console.warn('On-device fallback failed, using static presets:', e); }
      // Fallback matching client-side
      const s = scenarioText.toLowerCase();
      let fallback = {
        scenarioTitle: t('ea_fb_title'),
        englishTalk: `I am in danger! Please send immediate rescue to [your address]. I need a ${interpreter} interpreter!`,
        chineseTalk: t('ea_fb_meaning'),
        actions: [t('ea_fb_act1'), t('ea_fb_act2'), t('ea_fb_act3')],
        tisTips: t('ea_fb_tips'),
        isQuotaFallback: true
      };
      
      if (s.includes("撬门") || s.includes("闯入") || s.includes("砸门") || s.includes("小偷") || s.includes("强行") || s.includes("入室")) {
        fallback.scenarioTitle = "住宅遭到暴力侵入安全威胁 (Home Intrusion)";
        fallback.englishTalk = "Help! Someone is breaking into my room right now! There is an active intruder! I need police. Address: [your address].";
        fallback.chineseTalk = "抓人！有人正强行砸门撬锁闯入我的房间！现场有现行入侵者！我需要警察。地址：【你的地址】。";
        fallback.actions = [
          "一、在入侵者还在防盗门外砸门时，立刻反锁房门并搬椅子、重物柜物理堵死门框！",
          "二、迅速关闭房灯，寻找结实掩体（床底或衣柜处），蹲身防守屏息静候！",
          "三、牢握自保器具以作合法防卫自救，一键打000大声叫唤Police！"
        ];
      } else if (s.includes("抢") || s.includes("打人") || s.includes("殴打") || s.includes("暴力") || s.includes("尾随") || s.includes("跟踪")) {
        fallback.scenarioTitle = "遭受当街斗殴 / 袭击 / 跟踪尾随 (Assault & Robbery)";
        fallback.englishTalk = "I was just assaulted and followed on the street by a suspect. I need immediate police support at [your address].";
        fallback.chineseTalk = "我刚刚在街头遭到了人身尾随追踪和暴力打人袭击，我需要警察立即到场。定位在：【你的地址】附近。";
        fallback.actions = [
          "一、立刻快步撤退向有公共监控、安保或路人密集的明亮正规商店（如7-11或中餐馆）！",
          "二、若面临财物胁迫，切记生命安全永远第一，顺势丢出钱包吸引罪犯目标，折身反跑！",
          "三、安全后用公用电话或本机速打000，大喊 Chinese Interpreter 要求语音三方中文支持。"
        ];
      } else if (s.includes("火") || s.includes("烟") || s.includes("爆炸") || s.includes("燃烧") || s.includes("起火")) {
        fallback.scenarioTitle = "住宅引发火灾 / 绝火断道 / 浓烟逃生 (Active Fire)";
        fallback.englishTalk = "A fire broke out at my apartment, there is thick smoke trapped! Send a fire brigade. I am at [your address].";
        fallback.chineseTalk = "我的套房里现在引发了大火并产生了浓重毒烟，请火速派遣消防局救援队！我目前在【你的地址】。";
        fallback.actions = [
          "一、如果走道全是黑烟，立刻拨下毛巾床单一股脑全部浸冷水湿捂口鼻，压低身子、猫腰匍匐贴地逃生！",
          "二、手心贴门板测温，若发现楼下门把手已经发烫烫手，切莫开门！",
          "三、快步撤退至通风顺风的露台或外窗，大声求救！"
        ];
      } else if (s.includes("晕") || s.includes("窒息") || s.includes("过敏") || s.includes("病") || s.includes("血") || s.includes("伤") || s.includes("痛")) {
        fallback.scenarioTitle = "急性严重爆发伤病 / 休克晕厥 / 呼吸急停 (Medical Trauma)";
        fallback.englishTalk = "Emergency! Someone has collapsed and has severe breathing difficulty. Please send ambulance to [your address].";
        fallback.chineseTalk = "紧急情况！这里有人突然晕厥跌倒，大口残重呼吸困难！请急速调派救护车到【你的地址】。";
        fallback.actions = [
          "一、检查呼吸。如果病人尚存气但意识全无，立刻使其保持「侧卧复原体位」保持通调气道！",
          "二、排查急性过敏，寻找 EpiPen 自助注射大腿侧！",
          "三、生命休关的极速时刻，先点击按钮拨 000 先行抢救。"
        ];
      }
      setCustomOutputs(fallback);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Gemini TTS first (natural, urgent-but-composed delivery); falls back to the
  // browser's on-device speechSynthesis if the API is unreachable or over quota.
  const playTTS = async (text: string) => {
    if (ttsLoading) return;
    ttsAudioRef.current?.pause();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTtsPlaying(false);
    try {
      let url = ttsCacheRef.current.get(text);
      if (!url) {
        setTtsLoading(true);
        const resp = await fetch('/api/emergency-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!resp.ok) throw new Error(`TTS API ${resp.status}`);
        const blob = await resp.blob();
        url = URL.createObjectURL(blob);
        ttsCacheRef.current.set(text, url);
      }
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onplay = () => setTtsPlaying(true);
      audio.onended = () => setTtsPlaying(false);
      audio.onpause = () => setTtsPlaying(false);
      await audio.play();
    } catch (err) {
      console.warn('Gemini TTS unavailable, falling back to browser speech:', err);
      playBrowserTTS(text);
    } finally {
      setTtsLoading(false);
    }
  };

  const playBrowserTTS = (text: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        const setVoiceAndSpeak = () => {
          let voices = window.speechSynthesis.getVoices();
          
          // Prioritize natural sounding and Google's built-in voices
          const preferredVoice = voices.find(v => v.name === "Google US English") ||
                                 voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
                                 voices.find(v => v.name === "Samantha" || v.name === "Karen") ||
                                 voices.find(v => v.lang === "en-US" || v.lang === "en-AU" || v.lang === "en-GB");

          if (preferredVoice) {
            utterance.voice = preferredVoice;
          } else {
            utterance.lang = 'en-US';
          }

          // Keep rate and pitch close to default (1.0) to avoid robotic or unnatural distortion
          utterance.rate = 0.95; // Just a tiny bit slower for clarity, but natural
          utterance.pitch = 1.0; // Normal human pitch

          utterance.onstart = () => setTtsPlaying(true);
          utterance.onend = () => setTtsPlaying(false);
          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis utterance error:", e);
            setTtsPlaying(false);
          };
          window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
             setVoiceAndSpeak();
             window.speechSynthesis.onvoiceschanged = null;
          };
          // Fallback if event doesn't fire
          setTimeout(() => {
            if (!ttsPlaying) {
               setVoiceAndSpeak();
            }
          }, 500);
        } else {
          setVoiceAndSpeak();
        }
      } else {
        console.warn("Speech synthesis not supported in this browser or environment.");
      }
    } catch (err) {
      console.warn("Speech synthesis failed or was blocked by sandbox permissions:", err);
      setTtsPlaying(false);
    }
  };

  // Toggle: press to start listening, press again to stop.
  const toggleVoiceAssistance = () => {
    if (isGeneratingCustom) return;
    if (isListening) { stopVoiceAssistance(); return; }
    startVoiceAssistance();
  };

  const stopVoiceAssistance = () => {
    try { recognitionRef.current?.stop(); } catch {}
    try { recognitionRef.current?.abort?.(); } catch {}
    recognitionRef.current = null;
    setIsListening(false);
  };

  const startVoiceAssistance = () => {
    setVoiceUnavailable(false);
    setTranscript('');
    setIsListening(true);
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'zh-CN';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          // Live partial transcript so the user SEES the mic is working.
          let finalText = '';
          let interim = '';
          for (let i = 0; i < event.results.length; i++) {
            const r = event.results[i];
            if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript;
          }
          setTranscript(interim || finalText);
          if (finalText) {
            setCustomScenario(finalText);
            setIsListening(false);
            recognitionRef.current = null;
            handleGenerateEmergencyGuide(finalText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error", event.error);
          setIsListening(false);
          recognitionRef.current = null;
          if (event.error === 'no-speech') {
            setVoiceUnavailable(true);   // surface the example/typing path
          } else {
            // Mic unavailable (permission denied / preview sandbox / unsupported).
            setVoiceUnavailable(true);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        setIsListening(false);
        setVoiceUnavailable(true);
      }
    } catch (e) {
       setIsListening(false);
       setVoiceUnavailable(true);
    }
  };

  // Explicit, user-initiated demo. Clearly surfaced as a sample scenario (never
  // presented as if it were the user's real spoken input).
  const runVoiceExample = () => {
     const text = t('ea_voice_example_text');
     setVoiceUnavailable(false);
     setCustomScenario(text);
     handleGenerateEmergencyGuide(text);
  };

  const toggleChecklistItem = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tenancyBase = TENANCY_EMERGENCIES[selectedTenancyIdx];

  // Australia ships high-fidelity static data; other countries get an AI-generated,
  // Search-grounded guide localized to the chosen country / state.
  const [aiTenancy, setAiTenancy] = useState<Partial<TenancyEmergency> | null>(null);
  const [tenancyLoading, setTenancyLoading] = useState(false);

  // The hand-tuned static guide is the source of truth only for Chinese users in AU.
  // Everyone else (other countries, or AU with a non-Chinese display language) gets an
  // AI-generated, Search-grounded guide localized to their country / state / language.
  const useStaticZh = country === 'AU' && language === 'zh';

  useEffect(() => {
    if (emergencyTab !== 'tenancy' || useStaticZh) {
      setAiTenancy(null);
      setTenancyLoading(false);
      return;
    }
    let cancelled = false;
    setTenancyLoading(true);
    setAiTenancy(null);
    fetch('/api/tenancy-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        situation: `${t(tenancyBase.titleKey)}：${t(tenancyBase.situationKey)}`,
        country,
        region,
        language,
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((d) => { if (!cancelled) setAiTenancy(d); })
      .catch(() => { if (!cancelled) setAiTenancy(null); })
      .finally(() => { if (!cancelled) setTenancyLoading(false); });
    return () => { cancelled = true; };
  }, [emergencyTab, country, region, language, selectedTenancyIdx, useStaticZh]);

  const currentTenancy: TenancyEmergency = {
    title: t(tenancyBase.titleKey),
    emoji: tenancyBase.emoji,
    situation: t(tenancyBase.situationKey),
    calmAdvice: useStaticZh
      ? tenancyBase.calmAdvice
      : tenancyLoading
        ? t('ea_tenancy_loading', { country: countryName })
        : (aiTenancy?.calmAdvice || t('ea_tenancy_fail')),
    contacts: useStaticZh ? tenancyBase.contacts : (aiTenancy?.contacts || []),
    steps: useStaticZh
      ? tenancyBase.steps
      : tenancyLoading ? [t('ea_tenancy_loading_steps')] : (aiTenancy?.steps || []),
    lawShield: useStaticZh
      ? tenancyBase.lawShield
      : tenancyLoading ? t('ea_tenancy_loading_law') : (aiTenancy?.lawShield || ''),
  };

  const handleCopy = (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
            console.error("Clipboard write blocked or failed:", err);
            // Fallback: simple state alert/toggle or selection fallback
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
      } else {
        // Fallback for older browsers or sandboxed iframes without clipboards
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Clipboard write operation threw exception:", err);
    }
  };


  const simulateEmergency = (mockText: string, cheatsheetIdx: number) => {
    setIsListening(true);
    setTranscript('');
    let currentLog = "";
    let i = 0;

    const interval = setInterval(() => {
      if (i < mockText.length) {
        currentLog += mockText[i];
        setTranscript(currentLog);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
          setMeltdownTriggered(true);
          // Jump straight to the matching cheat sheet for this simulated scenario.
          setActiveCheatsheetIdx(cheatsheetIdx);
        }, 800);
      }
    }, 100);
  };

  const reset = () => {
    setMeltdownTriggered(false);
    setTranscript('');
    setIsListening(false);
  };

  return (
    <div id="emergency-aid-container" className="relative w-full overflow-hidden bg-transparent min-h-[700px] flex flex-col">
      <AnimatePresence mode="wait">
        {!meltdownTriggered ? (
          <motion.div 
            key="id-normal-aid-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 w-full flex flex-col gap-6 py-6 md:py-8 animate-in fade-in duration-300"
          >
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-[#ff5a3c]/10 text-[#ff5a3c] border border-[#ff5a3c]/20 px-3 py-1 rounded-full text-xs font-black tracking-wider mb-2">
                  <ShieldAlert size={14} />
                  <span>{t('ea_eyebrow')}</span>
                </div>
                <h1 className="text-2.5xl md:text-3.5xl font-black text-[#1d1d1f] tracking-tight">
                  {t('ea_title')}
                </h1>
                <p className="text-xs text-gray-400 mt-1 font-medium">{t('ea_subtitle')}</p>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-3.5 max-w-sm text-[11px] leading-relaxed text-amber-900 shadow-sm shrink-0">
                {t('ea_safety_tip', { emergency: content.emergency, country: countryName })}
              </div>
            </div>

            {/* Emergency Mode Tabs Selector */}
            <div className="flex flex-col sm:flex-row bg-gray-100/90 p-1 rounded-2xl max-w-xl shadow-xs border border-gray-200/40">
              <button
                type="button"
                onClick={() => setEmergencyTab('tenancy')}
                className={`py-3 px-5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  emergencyTab === 'tenancy'
                    ? "bg-[#1d1d1f] text-white shadow-md scale-102"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
              >
                <span>🚪</span>
                <span>{t('ea_tab_tenancy')}</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-md ml-1">{t('ea_tab_tenancy_badge')}</span>
              </button>
              <button
                type="button"
                onClick={() => setEmergencyTab('physical')}
                className={`py-3 px-5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  emergencyTab === 'physical'
                    ? "bg-red-600 text-white shadow-md scale-102"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
              >
                <span>🚑</span>
                <span>{t('ea_tab_physical', { emergency: content.emergency })}</span>
              </button>
            </div>

            {/* TAB CONTENT: TENANCY DISPUTE EMERGENCY EMERGENCIES */}
            {emergencyTab === 'tenancy' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side Menu: List of 8 common emergencies */}
                <div className="lg:col-span-4 space-y-2.5">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t('ea_picker_label')}</span>
                    <span className="text-[10px] text-ink bg-surface-soft px-2 py-0.5 rounded font-bold font-mono">{t('ea_picker_count')}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {TENANCY_EMERGENCIES.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTenancyIdx(idx)}
                        className={`w-full p-3.5 rounded-2xl text-left transition-all border outline-none cursor-pointer flex items-start space-x-3 group relative ${
                          selectedTenancyIdx === idx
                            ? "bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-md scale-[1.01]"
                            : "bg-white hover:bg-gray-50 text-gray-800 border-gray-150"
                        }`}
                      >
                        <div className="text-xl p-1 bg-gray-100 rounded-xl group-hover:scale-110 transition-transform shrink-0 select-none">
                          {item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-black truncate">{t(item.titleKey)}</h4>
                          <p className={`text-[10px] mt-0.5 truncate ${selectedTenancyIdx === idx ? "text-gray-300" : "text-gray-400"}`}>
                            {t(item.situationKey)}
                          </p>
                        </div>
                        {selectedTenancyIdx !== idx && (
                          <div className="text-gray-300 group-hover:text-gray-900 self-center">
                            <ArrowRight size={14} />
                          </div>
                        )}
                        {selectedTenancyIdx === idx && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#ff5a3c] rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-surface-soft/50 border border-hairline rounded-3xl mt-4">
                    <h5 className="text-xs font-bold text-ink flex items-center gap-1.5 mb-1.5">
                      <ShieldCheck size={14} className="text-ink" />
                      <span>{t('ea_legal_mech_title')}</span>
                    </h5>
                    <p className="text-[10px] text-ink/95 leading-relaxed font-medium">
                      {useStaticZh
                        ? t('ea_legal_mech_au')
                        : t('ea_legal_mech_other', { location: locationLabel })}
                    </p>
                  </div>
                </div>

                {/* Right Side Board: Detailed comforting guide, who to contact, details */}
                <div className="lg:col-span-8 bg-white border border-gray-150 shadow-sm rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5a3c]/5 rounded-bl-full pointer-events-none"></div>

                  {/* Header info */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 bg-[#1d1d1f]/5 rounded-2xl flex items-center justify-center text-2xl select-none">
                      {currentTenancy.emoji}
                    </div>
                    <div>
                      <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100 inline-block mb-1">
                        {t('ea_now_facing')}
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                        {currentTenancy.title}
                      </h2>
                    </div>
                  </div>

                  {/* 1. KEEP CALM REASSURANCES */}
                  <div className="bg-red-50/60 border border-red-100/80 rounded-2.5xl p-5 relative overflow-hidden">
                    <div className="absolute right-4 bottom-2 opacity-5 text-red-600">
                      <HeartHandshake size={64} />
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2.5 bg-red-100 text-red-600 rounded-xl mt-0.5 shrink-0 select-none">
                        ❤️
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-red-900 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                          <span>{t('ea_step1_title')}</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-red-950 font-sans font-medium leading-relaxed">
                          {currentTenancy.calmAdvice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. WHO TO CONTACT */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                      {t('ea_step2_title', { country: countryName })}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                      {currentTenancy.contacts.map((contact, cIdx) => (
                        <div 
                          key={cIdx} 
                          className={`md:col-span-12 lg:col-span-12 bg-gray-50 border border-gray-150 rounded-2xl p-4.5 transition-all hover:bg-gray-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4`}
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <span className="text-xs font-black text-gray-800 flex items-start gap-1.5 break-words">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a3c] mt-1.5 shrink-0"></span>
                              <span className="break-words">{contact.name}</span>
                            </span>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-sans font-medium max-w-xl">
                              {contact.desc}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap justify-end max-w-full">
                            {contact.phone && (
                              <button
                                type="button"
                                onClick={() => handleCopy(contact.phone || '')}
                                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white transition-all text-[11px] font-black shadow-sm flex items-center gap-1 group active:scale-95 cursor-pointer"
                              >
                                <Phone size={11} className="group-hover:animate-bounce" />
                                <span>{t('ea_call_copy', { phone: contact.phone || '' })}</span>
                              </button>
                            )}
                            {contact.url && (
                              <a
                                href={contact.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-surface-soft border border-hairline text-ink hover:bg-primary hover:text-white transition-all text-[11px] font-black shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                              >
                                <ExternalLink size={11} />
                                <span>{t('ea_enter_hall')}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. EXACT ACTION CHECKLIST */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-gray-400 tracking-widest uppercase">
                        {t('ea_step3_title')}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">{t('ea_check_hint')}</span>
                    </div>

                    <div className="border border-gray-150 rounded-2.5xl p-4 md:p-6 bg-gray-50/50 space-y-4">
                      {currentTenancy.steps.map((step, sIdx) => {
                        const checkKey = `${selectedTenancyIdx}-${sIdx}`;
                        const isChecked = !!checklist[checkKey];
                        return (
                          <div 
                            key={sIdx}
                            onClick={() => toggleChecklistItem(checkKey)}
                            className={`flex items-start space-x-3.5 p-3 rounded-xl transition-all select-none cursor-pointer border ${
                              isChecked 
                                ? "bg-surface-soft/60 border-hairline text-ink" 
                                : "bg-white hover:bg-gray-100 border-gray-100 text-gray-700"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0 text-ink transition-transform active:scale-90">
                              {isChecked ? (
                                <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center text-white">
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-md bg-white"></div>
                              )}
                            </div>
                            <span className={`text-xs leading-relaxed font-sans font-bold flex-1 ${isChecked ? "line-through text-ink/70" : ""}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. SOLID LEGAL SHIELDS */}
                  <div className="bg-[#ff5a3c]/5 border border-[#ff5a3c]/15 rounded-2.5xl p-5 relative overflow-hidden">
                    <div className="absolute right-4 bottom-2 opacity-5 text-[#ff5a3c]">
                      <ShieldCheck size={64} />
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2.5 bg-[#ff5a3c]/10 text-[#ff5a3c] rounded-xl shrink-0 mt-0.5 select-none">
                        ⚖️
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-950 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                          <span>{t('ea_lawshield_title')}</span>
                        </h4>
                        <p className="text-xs text-amber-900/90 leading-relaxed font-sans font-semibold">
                          {currentTenancy.lawShield}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Share advice panel */}
                  <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-400 font-bold">
                    <span>{t('ea_share_tip')}</span>
                    <span>{t('ea_legal_basis', { location: locationLabel })}</span>
                  </div>

                </div>

              </div>
            ) : (
              /* TAB CONTENT: PHYSICAL 000 EMERGENCY (Existing 000 code preserved perfectly) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* HERO: AI Voice Emergency Guide — the page's primary, largest action */}
                <div className="lg:col-span-12 bg-[#0a0a0a] rounded-3xl p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-[0.06] pointer-events-none">
                    <Mic size={240} className="text-on-dark" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-on-primary bg-primary rounded-full px-3 py-1 mb-4">
                        <Sparkles size={12} /> {t('ea_voice_badge')}
                      </div>
                      <h3 className="font-display text-3xl md:text-5xl font-medium text-on-dark leading-[1.1] mb-4">
                        {t('ea_voice_title')}
                      </h3>
                      <p className="text-sm md:text-lg text-on-dark-soft leading-relaxed max-w-xl mb-3">
                        {t('ea_voice_desc', { emergency: content.emergency })}
                      </p>
                      {isListening && (
                        <div className="mt-2">
                          <div className="text-sm text-red-300 font-bold flex items-center justify-center md:justify-start gap-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            {t('ea_listening')}
                          </div>
                          {transcript && (
                            <p className="mt-2 text-on-dark text-sm bg-white/10 rounded-xl px-3 py-2 text-left">
                              “{transcript}<span className="animate-pulse">|</span>”
                            </p>
                          )}
                        </div>
                      )}
                      {isGeneratingCustom && (
                        <div className="text-sm text-amber-300 font-bold flex items-center justify-center md:justify-start gap-2 mt-2">
                          <div className="w-3.5 h-3.5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin"></div>
                          {t('ea_analyzing')}
                        </div>
                      )}
                      {voiceUnavailable && (
                        <div className="mt-4 bg-on-dark/5 border border-on-dark/15 rounded-2xl p-4 text-left">
                          <p className="text-xs text-on-dark-soft leading-relaxed mb-3">
                            {t('ea_voice_unavailable')}
                          </p>
                          <button
                            type="button"
                            onClick={runVoiceExample}
                            disabled={isGeneratingCustom}
                            className="inline-flex items-center gap-2 text-xs font-bold bg-primary text-on-primary rounded-full px-4 py-2 hover:bg-primary-active transition-colors disabled:opacity-50"
                          >
                            {t('ea_voice_example_btn')}
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={toggleVoiceAssistance}
                      disabled={isGeneratingCustom}
                      aria-label={isListening ? t('ea_mic_stop') : t('ea_mic_talk')}
                      className={`w-40 h-40 md:w-52 md:h-52 shrink-0 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl active:scale-95 cursor-pointer relative ${
                        isListening
                          ? "bg-red-600 text-white"
                          : isGeneratingCustom
                            ? "bg-neutral-700 text-neutral-400 cursor-wait"
                            : "bg-primary hover:bg-primary-active text-on-primary"
                      }`}
                    >
                      {/* idle: gentle invite ping */}
                      {!isListening && !isGeneratingCustom && (
                        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping opacity-75"></div>
                      )}
                      {/* listening: expanding red rings so the press is unmistakable */}
                      {isListening && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-red-600/40 animate-ping"></span>
                          <span className="absolute -inset-3 rounded-full border-2 border-red-400/50 animate-pulse"></span>
                        </>
                      )}
                      {isGeneratingCustom ? (
                        <div className="w-12 h-12 border-4 border-neutral-500/40 border-t-neutral-300 rounded-full animate-spin mb-2"></div>
                      ) : isListening ? (
                        <Square size={48} className="mb-2 fill-current" />
                      ) : (
                        <Mic size={60} className="mb-2" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {isGeneratingCustom ? t('ea_mic_analyzing') : isListening ? t('ea_mic_listening') : t('ea_mic_talk')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Left Side: Solid Direct Call and Info Panel */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* 1. HIGHEST PRIORITY 000 STRATEGY */}
                  <div className="bg-red-600 border border-red-700/80 rounded-3xl p-6 shadow-lg shadow-red-600/20 relative overflow-hidden text-white">
                    <div className="absolute right-0 bottom-0 opacity-10">
                      <ShieldAlert size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="inline-block bg-red-800/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                        {t('ea_strategy_badge')}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black mb-2 flex items-center gap-2">
                        {t('ea_strategy_title')}
                      </h3>
                      <p className="text-sm font-medium leading-relaxed text-red-50 max-w-xl">
                        {t('ea_strategy_desc', { emergency: content.emergency })}
                      </p>
                      <blockquote className="my-4 bg-white text-red-600 text-xl font-black p-4 rounded-2xl shadow-inner border-2 border-red-200">
                        "{interpreter}, Please!"
                      </blockquote>
                      <p className="text-sm leading-relaxed text-red-100 max-w-xl">
                        {t('ea_strategy_desc2', { country: countryName, emergency: content.emergency })}
                      </p>
                    </div>
                  </div>

                  {/* 2. Permanent Location Display */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute right-4 top-4 opacity-5 bg-surface-soft text-[#1d1d1f] p-3 rounded-full">
                      <MapPin size={48} />
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <div className="p-3 bg-red-50 text-red-600 rounded-2xl mt-1">
                        <MapPin size={24} className="animate-bounce" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('ea_loc_label')}</span>
                          <span className="text-[10px] text-ink bg-surface-soft px-1.5 py-0.2 rounded font-bold">{t('ea_loc_gps', { country: countryName })}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                          {content.sampleAddress}
                        </h3>
                        <p className="text-xs text-red-600 font-extrabold mt-2.5 bg-red-50 inline-block px-3 py-1.5 rounded-lg border border-red-100">
                          {t('ea_loc_readout', { emergency: content.emergency })}
                        </p>
                      </div>
                    </div>

                    {/* Google Map Integration for real-time location */}
                    {hasValidKey ? (
                      <div className="w-full h-48 rounded-2xl border border-gray-200 mt-4 overflow-hidden relative shadow-inner bg-gray-100">
                        <APIProvider apiKey={API_KEY} version="weekly">
                          <GoogleMap
                            defaultCenter={SAMPLE_COORDINATES[country] || SAMPLE_COORDINATES.AU}
                            defaultZoom={15}
                            mapId="DEMO_MAP_ID"
                            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                            style={{ width: '100%', height: '100%' }}
                            gestureHandling={'cooperative'}
                            disableDefaultUI={true}
                          >
                            <AdvancedMarker position={SAMPLE_COORDINATES[country] || SAMPLE_COORDINATES.AU} title={content.sampleAddress}>
                              <Pin background="#ea4335" glyphColor="#fff" scale={1.1} />
                            </AdvancedMarker>
                          </GoogleMap>
                        </APIProvider>
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-2xl border border-gray-200 mt-4 overflow-hidden relative shadow-inner bg-gray-100">
                        <iframe
                          title="emergency-live-map"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(content.sampleAddress)}&output=embed`}
                          className="w-full h-full"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. Responsive Huge Call Button Panel */}
                  <div className="bg-gradient-to-br from-[#FE5D4C]/5 to-transparent rounded-3xl p-6 border border-red-100/60 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left flex-1">
                      <span className="text-xs font-black text-[#ff5a3c] uppercase tracking-wider block mb-1">{t('ea_hotline_label', { country: countryName })}</span>
                      <h4 className="text-2xl font-black text-[#1d1d1f]">
                        {t('ea_quickdial')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm border-l-2 border-red-200 pl-2.5">
                        {t('ea_hotline_desc', { country: countryName, emergency: content.emergency, interpreter })}
                      </p>
                    </div>
                    <a
                      href={`tel:${content.emergency}`}
                      id="emergency-dial-btn"
                      className="w-40 h-40 md:w-44 md:h-44 bg-red-600 hover:bg-red-700 text-white rounded-full flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all relative group shrink-0 active:scale-95"
                    >
                      <div className="absolute inset-0 rounded-full border-4 border-red-600/30 animate-pulse scale-105"></div>
                      <Phone size={36} className="mb-2" />
                      <span className="text-4xl font-black tracking-tight">{content.emergency}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-90 block">{t('ea_dial_click')}</span>
                    </a>
                  </div>

                  {/* 2.5 Nearby rescue points on Google Maps: in a real emergency the next question
                      after "call 000" is "where do I physically GO" — nearest police / ER / pharmacy. */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <MapPin size={18} className="text-[#1d1d1f]" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">附近救援点 · Google 地图</h4>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">离你最近的实体求助点</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                      拨打 {content.emergency} 之后，下一个问题往往是 "我人应该往哪走"。我们对接了真实的 <strong>Places API 邻近位置检索</strong> 与 <strong>Routes API 实时路径规划</strong>，为您精准引路。
                    </p>
                    <RescueMap country={country} countryName={countryName} />
                  </div>

                  {/* 3. Copyman Cheat Sheet */}
                  <div id="cheatsheet-section" className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <BookOpen size={18} className="text-[#1d1d1f]" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">{t('ea_cheat_title')}</h4>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{t('ea_cheat_copy_hint')}</span>
                    </div>

                    {/* Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {EMERGENCY_CHEATSHEETS.map((sheet, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveCheatsheetIdx(idx)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeCheatsheetIdx === idx
                              ? "bg-[#1d1d1f] text-white shadow-sm scale-102"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-150"
                          }`}
                        >
                          <span>{sheet.emoji}</span>
                          <span className="truncate">{t(sheet.titleKey)}</span>
                        </button>
                      ))}
                    </div>

                    {/* Sheet Card Content */}
                    <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 relative group">
                      <button
                        type="button"
                        onClick={() => handleCopy(EMERGENCY_CHEATSHEETS[activeCheatsheetIdx].english)}
                        className="absolute right-3 top-3 p-2 rounded-xl bg-white border border-gray-250 text-gray-500 hover:text-gray-900 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center space-x-1"
                        title={t('ea_copy_english')}
                      >
                        {copied ? <Check size={14} className="text-ink" /> : <Copy size={14} />}
                        <span className="text-[10px] font-bold">{copied ? t('ea_copied') : t('ea_copy_sheet')}</span>
                      </button>

                      <span className="text-[10px] font-black text-[#ff5a3c] block mb-2 uppercase tracking-wide">
                        {t('ea_cheat_read', { emoji: EMERGENCY_CHEATSHEETS[activeCheatsheetIdx].emoji })}
                      </span>
                      <blockquote className="text-lg md:text-xl font-black text-gray-900 leading-snug tracking-tight pr-10">
                        "{EMERGENCY_CHEATSHEETS[activeCheatsheetIdx].english}"
                      </blockquote>
                      <hr className="my-3 border-gray-200" />
                      <p className="text-xs text-gray-500 font-medium">
                        {t('ea_meaning_label')}{t(EMERGENCY_CHEATSHEETS[activeCheatsheetIdx].meaningKey)}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Right Side: AI Custom Emergency Assistant & Device Call Concurrency QA */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* 🚨 AI CUSTOM EMERGENCY GENERATOR & DECISION ASSISTANT */}
                  <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm ring-2 ring-red-500/10 space-y-4">
                    <div className="flex items-center space-x-2 text-red-600">
                      <Sparkles size={18} className="animate-pulse" />
                      <h3 className="text-sm font-black uppercase tracking-wider">{t('ea_ai_decision_title')}</h3>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      {t('ea_ai_decision_desc', { country: countryName, emergency: content.emergency })}
                    </p>

                    {/* Pre-set quick tags */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">{t('ea_load_scenarios')}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomScenario(t('ea_preset_intrusion_text'));
                            handleGenerateEmergencyGuide(t('ea_preset_intrusion_text'));
                          }}
                          className="bg-gray-50 hover:bg-red-50 border border-gray-150 p-2 text-left rounded-xl text-[11px] font-extrabold text-gray-700 transition-all hover:text-red-700 active:scale-98 cursor-pointer"
                        >
                          {t('ea_preset_intrusion_label')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomScenario(t('ea_preset_assault_text'));
                            handleGenerateEmergencyGuide(t('ea_preset_assault_text'));
                          }}
                          className="bg-gray-50 hover:bg-red-50 border border-gray-150 p-2 text-left rounded-xl text-[11px] font-extrabold text-gray-700 transition-all hover:text-red-700 active:scale-98 cursor-pointer"
                        >
                          {t('ea_preset_assault_label')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomScenario(t('ea_preset_fire_text'));
                            handleGenerateEmergencyGuide(t('ea_preset_fire_text'));
                          }}
                          className="bg-gray-50 hover:bg-red-50 border border-gray-150 p-2 text-left rounded-xl text-[11px] font-extrabold text-gray-700 transition-all hover:text-red-700 active:scale-98 cursor-pointer"
                        >
                          {t('ea_preset_fire_label')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomScenario(t('ea_preset_medical_text'));
                            handleGenerateEmergencyGuide(t('ea_preset_medical_text'));
                          }}
                          className="bg-gray-50 hover:bg-red-50 border border-gray-150 p-2 text-left rounded-xl text-[11px] font-extrabold text-gray-700 transition-all hover:text-red-700 active:scale-98 cursor-pointer"
                        >
                          {t('ea_preset_medical_label')}
                        </button>
                      </div>
                    </div>

                    {/* Custom Textarea */}
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        value={customScenario}
                        onChange={(e) => setCustomScenario(e.target.value)}
                        placeholder={t('ea_custom_placeholder')}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-2xl p-3 min-h-[85px] outline-none focus:ring-2 focus:ring-red-400 transition-all font-semibold text-gray-800 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerateEmergencyGuide(customScenario)}
                        disabled={isGeneratingCustom || !customScenario.trim()}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-250 text-white font-black rounded-2xl text-[11px] uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {isGeneratingCustom ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{t('ea_generating')}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>{t('ea_generate_btn')}</span>
                          </>
                        )}
                      </button>
                      {(onDeviceStatus === 'available' || onDeviceStatus === 'downloadable') && (
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 pt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {onDeviceStatus === 'available'
                            ? '本机已就绪：断网也能由端侧 Gemini Nano 本地生成'
                            : '本浏览器支持端侧 AI：首次使用会下载离线模型'}
                        </div>
                      )}
                    </div>

                    {/* Outputs */}
                    <AnimatePresence>
                      {customOutputs && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4 pt-3 border-t border-gray-100"
                        >
                          {customOutputs.isQuotaFallback && <FallbackNotice />}

                          {customOutputs.onDevice && (
                            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-2xl flex items-start gap-2.5 shadow-sm">
                              <span className="text-base leading-none shrink-0">📴</span>
                              <p className="text-[10px] text-emerald-900 leading-relaxed font-semibold">
                                <strong className="font-black">端侧离线生成 · On-device (Gemini Nano).</strong>{' '}
                                本方案由 Chrome 内置 AI 在你的设备本地生成，全程无需联网、数据不出手机——断网时也能救命。
                              </p>
                            </div>
                          )}

                          {/* Title */}
                          <div className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 inline-block">
                            <span className="text-xs font-black text-red-700">{t('ea_scenario_eval')}{customOutputs.scenarioTitle}</span>
                          </div>

                          {/* 000 Call Dialogue Card */}
                          <div className="bg-gray-900 text-white rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-600/30 to-transparent rounded-bl-full pointer-events-none"></div>
                            
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                                <Volume2 size={12} />
                                {t('ea_call_script_label')}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => playTTS(customOutputs.englishTalk)}
                                  className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center space-x-1 cursor-pointer ${ttsPlaying ? 'ring-2 ring-red-400' : ''}`}
                                  title={t('ea_read_aloud')}
                                >
                                  <Volume2 size={12} className={ttsPlaying ? 'animate-bounce' : ''} />
                                  <span className="text-[9px] font-bold">{ttsLoading ? t('ea_tts_loading') : ttsPlaying ? t('ea_playing') : t('ea_read_pron')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(customOutputs.englishTalk)}
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-xs flex items-center space-x-1 cursor-pointer"
                                  title={t('ea_copy_english')}
                                >
                                  {copied ? <Check size={12} className="text-ink" /> : <Copy size={12} />}
                                  <span className="text-[9px] font-bold">{copied ? t('ea_copied') : t('ea_copy_script')}</span>
                                </button>
                              </div>
                            </div>

                            <blockquote className="text-sm md:text-base font-black leading-snug text-yellow-100 pr-4">
                              "{customOutputs.englishTalk}"
                            </blockquote>

                            <p className="text-xs text-gray-400 font-semibold leading-relaxed border-t border-white/10 pt-2 flex items-start gap-1">
                              <span>{t('ea_meaning_short')}</span>
                              <span>{customOutputs.chineseTalk}</span>
                            </p>
                          </div>

                          {/* Tactical Actions */}
                          <div className="space-y-2 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
                            <span className="text-[10px] font-black text-[#ff5a3c] uppercase tracking-wide block">{t('ea_actions_label')}</span>
                            <ul className="text-xs text-amber-950 font-bold space-y-2 leading-relaxed">
                              {customOutputs.actions.map((act, index) => (
                                <li key={index} className="flex items-start gap-1.5">
                                  <span className="text-red-500 shrink-0 mt-0.5">•</span>
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Interpreter Support Tips */}
                          <div className="text-xs leading-relaxed font-bold text-ink bg-surface-soft border border-hairline rounded-xl p-3.5">
                            {customOutputs.tisTips}
                          </div>

                          {/* Hardware Call Concurrency Warning Block */}
                          <div className="bg-red-50 border border-red-200 rounded-2xl p-4.5 space-y-2.5">
                            <div className="flex items-center space-x-2 text-red-700 font-black text-[11px] uppercase tracking-wider">
                              <ShieldAlert size={14} className="animate-pulse" />
                              <span>{t('ea_qa_title')}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed font-bold text-gray-700">
                              {t('ea_qa_answer', { emergency: content.emergency })}
                            </p>
                            <div className="pt-2 border-t border-red-150 text-[11px] text-gray-600 font-black space-y-1.5">
                              <div>{t('ea_qa_strategy1', { interpreter, country: countryName })}</div>
                              <div>{t('ea_qa_strategy2', { emergency: content.emergency })}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Voice meltdown intro box */}
                  <div className="bg-[#1d1d1f]/5 border border-[#1d1d1f]/15 rounded-3xl p-6 relative">
                    <div className="flex items-center space-x-2 text-[#1d1d1f] mb-3">
                      <Sparkles size={18} className="text-[#ff5a3c]" />
                      <h3 className="text-sm font-black uppercase tracking-wider">{t('ea_meltdown_title')}</h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-4 font-medium">
                      {t('ea_meltdown_desc')}
                    </p>
                    
                    <div className="bg-white border border-[#1d1d1f]/10 rounded-2xl p-4 space-y-3 shadow-sm">
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                        {t('ea_trigger_sim')}
                      </div>

                      <button 
                        type="button"
                        onClick={() => simulateEmergency(t('ea_sim_a_text'), 1)}
                        disabled={isListening}
                        className="w-full bg-red-50 hover:bg-red-100 border border-red-150 p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-98"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Volume2 size={16} className="text-red-600 shrink-0" />
                          <div>
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{t('ea_sim_a_label')}</p>
                            <p className="text-xs font-black text-red-950">“{t('ea_sim_a_text')}”</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-black">{t('ea_click_trigger')}</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => simulateEmergency(t('ea_sim_b_text'), 0)}
                        disabled={isListening}
                        className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-150 p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-98"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Volume2 size={16} className="text-amber-700 shrink-0" />
                          <div>
                            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{t('ea_sim_b_label')}</p>
                            <p className="text-xs font-black text-amber-950">“{t('ea_sim_b_text')}”</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-black">{t('ea_click_trigger')}</span>
                      </button>
                    </div>

                    {/* Status Listening Panel */}
                    <AnimatePresence>
                      {isListening && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }} 
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="mt-4 bg-gray-900 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3.5"
                        >
                          <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <Mic size={16} className="relative text-red-400 animate-pulse" />
                          </div>
                          <div className="flex-1 font-mono text-sm tracking-tight leading-snug">
                            "{transcript}<span className="animate-pulse">|</span>"
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Responsible AI compliance explanation */}
                  <div className="border border-gray-150 rounded-3xl p-6 bg-white space-y-3 shadow-xs">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-[#10b981]" />
                      <span>{t('ea_responsible_title')}</span>
                    </h4>
                    <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>{t('ea_responsible_1')}</li>
                      <li>{t('ea_responsible_2')}</li>
                    </ul>
                  </div>

                </div>

              </div>
            )}

          </motion.div>
        ) : (
          /* MELTDOWN SYSTEM EMERGENCY STATE */
          <motion.div 
            key="id-meltdown-activated"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-[#DE3C3A] text-white p-4 md:p-8 rounded-3xl flex flex-col justify-between min-h-[660px]"
          >
            {/* Header control */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
               <button 
                 onClick={reset} 
                 className="text-white hover:bg-white/10 text-xs font-extrabold bg-white/15 px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
               >
                 <span>{t('ea_back_normal')}</span>
               </button>
               <div className="flex items-center space-x-2 animate-pulse bg-white/15 px-3 py-1.5 rounded-xl">
                 <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                 <span className="text-xs font-black uppercase tracking-widest">EMERGENCY SOS CARD</span>
               </div>
            </div>

            {/* Core Assistance Info */}
            <div className="flex flex-col items-center justify-center flex-1 my-6 space-y-6">
               
               {/* Heavy contrast big text Current Location */}
               <div className="bg-black/20 border border-white/10 p-5 rounded-2xl w-full max-w-xl shadow-inner text-center">
                 <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1.5">{t('ea_loc_bilingual')}</p>
                 <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white selection:bg-red-800">
                   {content.sampleAddress}
                 </h3>
                 <p className="text-xs text-white/90 mt-2 font-bold bg-white/10 inline-block px-3 py-1 rounded-md">
                   {t('ea_loc_readout2')}
                 </p>
               </div>

               {/* Absolute giant SOS calling button */}
               <a
                 href={`tel:${content.emergency}`}
                 className="w-48 h-48 md:w-56 md:h-56 bg-white rounded-full flex flex-col items-center justify-center text-[#DE3C3A] shadow-2xl hover:scale-105 active:scale-95 transition-all relative group"
               >
                  <div className="absolute inset-0 rounded-full border-8 border-white/20 animate-ping scale-110"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-white/10 scale-125"></div>
                  <Phone size={56} className="mb-2" />
                  <span className="text-6xl font-black tracking-tighter">{content.emergency}</span>
                  <span className="text-xs font-black tracking-widest mt-1.5 opacity-90">{t('ea_dial_now', { emergency: content.emergency })}</span>
               </a>

               {/* Super Heavy Survival Translation Cheat sheet */}
               <div className="bg-black/35 p-6 rounded-2xl w-full max-w-2xl text-center border border-white/5 relative">
                 <span className="absolute left-4 top-4 text-xs font-black text-white/55 uppercase">{t('ea_sos_interpreter_card')}</span>
                 <p className="text-red-200 text-xs font-black mb-1.5 uppercase tracking-widest">{t('ea_read_to_operator')}</p>
                 <p className="text-2.5xl md:text-4xl font-black tracking-tight leading-snug text-white">
                   "{EMERGENCY_CHEATSHEETS[activeCheatsheetIdx].english}"
                 </p>
                 <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/75">
                   <span>{t('ea_meaning_zh2')}{t(EMERGENCY_CHEATSHEETS[activeCheatsheetIdx].meaningKey)}</span>
                   <button 
                     onClick={() => handleCopy(EMERGENCY_CHEATSHEETS[activeCheatsheetIdx].english)}
                     className="bg-white/15 text-white hover:bg-white/25 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px]"
                   >
                     {copied ? t('ea_copied') : t('ea_copy_english_sheet')}
                   </button>
                 </div>
               </div>

            </div>

            {/* Absolute bottom guard */}
            <p className="text-center text-white/50 text-[11px] font-black leading-relaxed max-w-lg mx-auto">
              {t('ea_disclaimer')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
