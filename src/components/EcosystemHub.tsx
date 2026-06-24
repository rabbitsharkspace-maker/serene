import React, { useState, useEffect } from 'react';
import { 
  Compass, User, Users, Map, Utensils, ShoppingBag, ArrowRight, Zap, 
  Image as ImageIcon, DollarSign, MessageSquare, Plus, Check, Star, 
  Shield, Lock, MapPin, Search, ChevronRight, X, AlertCircle, ShoppingCart, Trash2, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../lib/locale';
import EcoTools from './EcoTools';
import MeetupPlanner from './MeetupPlanner';

// Interfaces
interface Guide {
  id: string;
  name: string;
  avatar: string;
  university: string;
  major: string;
  year: string;
  rating: number;
  suburb: string;
  bio: string;
  projects: { name: string; price: number; desc: string }[];
  isCustom?: boolean;
}

interface MealPost {
  id: string;
  dishName: string;
  chefName: string;
  chefAvatar: string;
  cuisine: string;
  price: number;
  type: 'cooking' | 'sharing'; // 做饭列菜单 | 拼饭
  description: string;
  suburb: string;
  preciseAddress: string;
  isUnlocked: boolean;
  maxSeats?: number;
  joinedCount?: number;
  isCustom?: boolean;
  image?: string;
}

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  condition: '全新' | '99新' | '90新' | '85新';
  description: string;
  suburb: string;
  category: '数码' | '生活用品' | '教材资料' | '其他';
  sellerName: string;
  sellerAvatar: string;
  secureStatus: 'available' | 'locked_escrow' | 'completed';
  isCustom?: boolean;
  image?: string;
}

interface CartItem {
  id: string;
  type: 'guide_project' | 'meal' | 'marketplace_item';
  originId: string;
  title: string;
  price: number;
  image: string;
  subtitle: string;
  suburb?: string;
  details?: any;
}

interface ChatMessage {
  sender: 'user' | 'other';
  text: string;
  time: string;
}

const DEFAULT_GUIDES: Guide[] = [
  {
    id: 'g-1',
    name: '林学长 (Alex)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    university: '墨尔本大学 (UniMelb)',
    major: 'IT 信息技术硕士',
    year: '研二',
    rating: 4.9,
    suburb: 'Carlton',
    bio: '已在墨尔本生活三年，轻车熟路，主带新手办理本地三大件，辅导各种租房及留学生避坑指南！',
    projects: [
      { name: '新手完美着陆三件套陪办', price: 39, desc: '线下带领办理全套银行开户 (ANZ/CBA)、超值电话卡激活、Myki交通实体卡申领并演示乘车指南' },
      { name: 'Clayton/Carlton 租房实地陪看+视频验房', price: 59, desc: '代替肉身未入境的萌新，提供高清晰度验房细节实拍并依据防坑盾标准分析合同条例' }
    ]
  },
  {
    id: 'g-2',
    name: '陈学姐 (Emma)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    university: '莫纳什大学 (Monash)',
    major: 'Master of Commerce',
    year: '研一',
    rating: 4.8,
    suburb: 'Clayton',
    bio: '极高亲和力，专注Monash校区及Clayton周边生活指南，省钱大王超级买手，带你探索性价比最高的生活攻略。',
    projects: [
      { name: 'Monash新生注册指导+同城网购避坑课', price: 19, desc: '教你选最靠谱的华人二手、转租社群以及避坑指南' },
      { name: '同城超性价比超市 Costco & Chadstone 带逛特护', price: 29, desc: '老司机拼车，分享全澳洲性价比最高的特价肉食及生活用品囤货清单' }
    ]
  }
];

const DEFAULT_MEALS: MealPost[] = [
  {
    id: 'm-1',
    dishName: '滋补药膳大盘鸡+手拉皮带面 (份)',
    chefName: '王小厨 (自煮五年)',
    chefAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    cuisine: '西北家常菜',
    price: 18.5,
    type: 'cooking',
    description: '精选放养鸡，加入秘制药膳滋补配料熬制，土豆沙糯，宽面劲道。限时列餐，欢迎预定单点或拼菜。',
    suburb: 'Carlton (距您1.1km)',
    preciseAddress: 'Room 502, 168 Lygon St, Carlton VIC 3053',
    isUnlocked: false,
    maxSeats: 8,
    joinedCount: 3,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-2',
    dishName: '超人气川香麻辣水煮鱼拼桌 (桌)',
    chefName: '川妹子辣厨房',
    chefAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    cuisine: '四川菜/香辣',
    price: 15,
    type: 'sharing',
    description: '今夜举行川渝大聚会拼饭，正宗四川朝天椒和花椒空运，嫩鱼片入口即化。一人只需分摊15刀。',
    suburb: 'Melbourne CBD (距您0.5km)',
    preciseAddress: 'Apartment 12A, 250 Elizabeth St, Melbourne VIC 3000',
    isUnlocked: false,
    maxSeats: 6,
    joinedCount: 5,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400'
  }
];

const DEFAULT_ITEMS: MarketplaceItem[] = [
  {
    id: 'i-1',
    title: '99新 Kmart 二手多功能微波炉',
    price: 35,
    condition: '99新',
    description: '购于今年二月份，由于毕业急售。基本全新无污渍，墨大Carlton附近支持 Serene 官方保驾担保面交。',
    suburb: 'Carlton',
    category: '生活用品',
    sellerName: '李学长',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-2',
    title: '墨大高分 IT 考前总结与核心辅导书 (含原版教材电子PDF)',
    price: 15,
    condition: '全新',
    description: '超全的计算学科期末背诵知识点总结，学霸秘笈，面交当场核对无误后 Serene 释放担保资金。保证不踩空。',
    suburb: 'Melbourne CBD',
    category: '教材资料',
    sellerName: 'Linda (优秀毕业生)',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
  }
];

export default function EcosystemHub() {
  const { country, language, region } = useLocale();
  const [activeTab, setActiveTab] = useState<'guides' | 'private_chef' | 'marketplace' | 'tools'>('guides');

  // Multi-tab role toggling
  const [guideRole, setGuideRole] = useState<'student' | 'guide'>('student');
  const [chefRole, setChefRole] = useState<'buy' | 'sell'>('buy');
  const [marketRole, setMarketRole] = useState<'buy' | 'sell'>('buy');

  // Dynamic state loaded from local storage or pre-seeded defaults
  const [guides, setGuides] = useState<Guide[]>(() => {
    const saved = localStorage.getItem('serene_eco_guides');
    return saved ? JSON.parse(saved) : DEFAULT_GUIDES;
  });

  const [meals, setMeals] = useState<MealPost[]>(() => {
    const saved = localStorage.getItem('serene_eco_meals');
    return saved ? JSON.parse(saved) : DEFAULT_MEALS;
  });

  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>(() => {
    const saved = localStorage.getItem('serene_eco_items');
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
  });

  // Save states to localstorage on change
  useEffect(() => {
    localStorage.setItem('serene_eco_guides', JSON.stringify(guides));
  }, [guides]);

  useEffect(() => {
    localStorage.setItem('serene_eco_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('serene_eco_items', JSON.stringify(marketItems));
  }, [marketItems]);

  // Shopping Cart States
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('serene_cart_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartCheckingOut, setIsCartCheckingOut] = useState(false);

  useEffect(() => {
    localStorage.setItem('serene_cart_items', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    if (cart.some(c => c.originId === item.originId && c.type === item.type)) {
      triggerNotification('🛒 该款项目早已安全保存在购物车！');
      return;
    }
    setCart(prev => [...prev, item]);
    triggerNotification(`🛒 成功将 [${item.title}] 添入购物车！`);
  };

  const removeFromCart = (originId: string, type: 'guide_project' | 'meal' | 'marketplace_item') => {
    setCart(prev => prev.filter(c => !(c.originId === originId && c.type === type)));
    triggerNotification('🛒 已从购物车中撤出该项目。');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Bulk Checkout simulating Escrow payment
  const handleCartCheckout = () => {
    if (cart.length === 0) return;

    // Apply outcomes to state arrays
    setMeals(prevMeals => prevMeals.map(m => {
      const parentInCart = cart.find(c => c.type === 'meal' && c.originId === m.id);
      if (parentInCart) {
        return { ...m, isUnlocked: true, joinedCount: (m.joinedCount || 0) + 1 };
      }
      return m;
    }));

    setMarketItems(prevItems => prevItems.map(i => {
      const parentInCart = cart.find(c => c.type === 'marketplace_item' && c.originId === i.id);
      if (parentInCart) {
        return { ...i, secureStatus: 'locked_escrow' };
      }
      return i;
    }));

    // Trigger notification and chat for any guide projects in cart
    const guideItem = cart.find(c => c.type === 'guide_project');
    if (guideItem) {
      setTimeout(() => {
        openChatWithUser(guideItem.subtitle, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', `嗨！我看到你在 Serene 安全托管结算了我的带逛项目 [${guideItem.title}]，太靠谱了！咱们线上约定一个出发时间呗？`);
      }, 1500);
    }

    triggerNotification('🔐 尊贵的用户，购物车内的多类目商品/服务已安全锁定在 Serene 托管金库中！');
    setCart([]);
    setIsCartCheckingOut(false);
    setIsCartOpen(false);

    // If selected view is currently displaying an affected item, let's keep it updated
    setSelectedMeal(null);
    setSelectedItem(null);
  };

  // Preset image choice states for the forms
  const [postDishImage, setPostDishImage] = useState('https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400');
  const [postItemImage, setPostItemImage] = useState('https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=400');

  // Guides search and filter state
  const [guideQuery, setGuideQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Private chef specific states
  const [chefQuery, setChefQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealPost | null>(null);
  const [checkoutMealId, setCheckoutMealId] = useState<string | null>(null);

  // Marketplace states
  const [marketQuery, setMarketQuery] = useState('');
  const [marketCategory, setMarketCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [checkoutItemId, setCheckoutItemId] = useState<string | null>(null);

  // Master Chat Overlay
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [chatAvatar, setChatAvatar] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Guide profile creation state
  const [createGuideName, setCreateGuideName] = useState('');
  const [createGuideUniv, setCreateGuideUniv] = useState('墨尔本大学 (UniMelb)');
  const [createGuideMajor, setCreateGuideMajor] = useState('');
  const [createGuideYear, setCreateGuideYear] = useState('大三');
  const [createGuideSuburb, setCreateGuideSuburb] = useState('');
  const [createGuideBio, setCreateGuideBio] = useState('');
  const [createGuideProject1, setCreateGuideProject1] = useState('新手一站式陪同带路');
  const [createGuidePrice1, setCreateGuidePrice1] = useState('25');
  const [createGuideDesc1, setCreateGuideDesc1] = useState('线下带你去学校熟悉设施、到市区激活手机卡与银行账户。');

  // Private Chef posting state
  const [postDishName, setPostDishName] = useState('');
  const [postDishPrice, setPostDishPrice] = useState('');
  const [postDishType, setPostDishType] = useState<'cooking' | 'sharing'>('cooking');
  const [postCuisine, setPostCuisine] = useState('特色地方菜');
  const [postSuburb, setPostSuburb] = useState('');
  const [postPreciseAddress, setPostPreciseAddress] = useState('');
  const [postDescription, setPostDescription] = useState('');

  // Marketplace posting state
  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCondition, setItemCondition] = useState<'全新' | '99新' | '90新' | '85新'>('99新');
  const [itemCategory, setItemCategory] = useState<'数码' | '生活用品' | '教材资料' | '其他'>('生活用品');
  const [itemSuburb, setItemSuburb] = useState('');
  const [itemDesc, setItemDesc] = useState('');

  // --- Ecosystem AI States ---

  // 二手估价 (Marketplace Price Checks)
  const [priceCheckResults, setPriceCheckResults] = useState<Record<string, {
    verdict: '划算' | '合理' | '偏贵';
    newPrice: string;
    fairUsedPrice: string;
    reasoning: string;
    painConversion: string;
    loading?: boolean;
  }>>({});

  // 瞬时处境匹配 (Companion Instant Matching)
  const [situationQuery, setSituationQuery] = useState('');
  const [companionMatchLoading, setCompanionMatchLoading] = useState(false);
  const [matchedGuideIds, setMatchedGuideIds] = useState<string[]>([]);
  const [matchReason, setMatchReason] = useState<string | null>(null);
  const [matchChecklist, setMatchChecklist] = useState<string[]>([]);

  // 临期食材/小票菜谱 (Kitchen Budget Recipe)
  const [recipePreview, setRecipePreview] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<{
    ingredients: string[];
    recipes: { name: string; steps: string[]; cost: string }[];
    savingComparison: string;
  } | null>(null);

  // --- Ecosystem AI Handlers ---

  // 1. 二手一键 AI 验价
  const handlePriceCheck = async (itemId: string, title: string, description: string, price: number) => {
    setPriceCheckResults(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), loading: true } as any
    }));

    try {
      const res = await fetch('/api/check-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price, country, language, region })
      });
      if (!res.ok) throw new Error('Failed to fetch valuation');
      const data = await res.json();
      setPriceCheckResults(prev => ({
        ...prev,
        [itemId]: { ...data, loading: false }
      }));
      triggerNotification(`💡 [${title}] AI 一键全网估价评级为「${data.verdict}」！`);
    } catch (err) {
      console.error(err);
      triggerNotification('❌ AI 验价限流，已为您自动切换至全澳离线估价防御！');
      setPriceCheckResults(prev => ({
        ...prev,
        [itemId]: {
          verdict: '合理',
          newPrice: '$45 AUD in Kmart / Target 类似款',
          fairUsedPrice: '$15 - $25 AUD',
          reasoning: '【AI 避坑盾温馨提示】由于系统配额受限，为您调出澳洲常规物价估判：澳洲Kmart、IKEA或Target的全新基础用品不仅高频保修且极为便宜。除非该二手保存非常完好，否则不宜虚高购买。推荐在面交中启用 Serene 的双向押金中介支付！',
          painConversion: '折合澳洲最低时薪工作 1-1.5 小时。比起叫外包天价外卖配送，自取二手仍然保本，但必须谨防付前诈骗。',
          loading: false
        }
      }));
    }
  };

  // 2. 瞬时处境 matching
  const handleCompanionMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationQuery.trim()) {
      triggerNotification('✍️ 请先输入你当前遇到的迷茫、棘手处境或困难！');
      return;
    }
    setCompanionMatchLoading(true);
    setMatchedGuideIds([]);
    setMatchReason(null);
    setMatchChecklist([]);

    try {
      const res = await fetch('/api/match-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: situationQuery,
          companions: guides.map(g => ({
            id: g.id,
            name: g.name,
            university: g.university,
            major: g.major,
            suburb: g.suburb,
            bio: g.bio,
            projects: g.projects
          })),
          country,
          language,
          region
        })
      });

      if (!res.ok) throw new Error('Failed to match companion');
      const data = await res.json();
      setMatchedGuideIds(data.matchedGuideIds || []);
      setMatchReason(data.reason || '');
      setMatchChecklist(data.checklist || []);
      
      // Select the first matched guide automatically to focus details and guide student better!
      if (data.matchedGuideIds && data.matchedGuideIds.length > 0) {
        const found = guides.find(g => g.id === data.matchedGuideIds[0]);
        if (found) {
          setSelectedGuide(found);
          setSelectedItem(null);
          setSelectedMeal(null);
        }
      }
      
      triggerNotification('✨ AI 瞬时经验学长姐挑选成功！详细防坑避雷卡已发到右侧！');
    } catch (err) {
      console.error(err);
      triggerNotification('❌ 配额繁忙，已自动为您唤醒全澳求生避坑盾卡！');
      setMatchedGuideIds(['g-1']);
      setMatchReason('【向导匹配预载成功】由于系统网络配置繁忙，安全向导 Alex (林学长) 正在代表守护。他拥有三年以上的墨尔本本地生活经验，精通三大件开办、租房避坑和日常反诈流程。');
      setMatchChecklist([
        "不实地看房、不签字拿钥匙并向RTBA确认房保押金前，坚决不要给私人转任何订金！",
        "澳洲主流银行开户或超值手机卡、交通卡都是全自动在正规官方网站免费办理的，千万别交由第三方高价代开，防身份泄露！",
        "凡是收到带有‘DHL快递包裹扣押’、‘大使馆通知涉嫌国内大案’、‘澳洲ATO税收稽查通知’的中文恐吓，100%是海外专门针对新生的电信诈骗！直接挂断电话！"
      ]);
      const found = guides.find(g => g.id === 'g-1');
      if (found) {
        setSelectedGuide(found);
        setSelectedItem(null);
        setSelectedMeal(null);
      }
    } finally {
      setCompanionMatchLoading(false);
    }
  };

  // 3. 冰箱食材/超市买菜收据小票省钱食谱 AI 魔法
  const handleRecipeSubmit = async (file: File) => {
    setRecipeLoading(true);
    setRecipeResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('country', country);
      formData.append('language', language);

      const res = await fetch('/api/budget-recipe', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Failed to make budget recipe');
      const data = await res.json();
      setRecipeResult(data);
      triggerNotification('🥦 AI 冰箱魔术菜谱和算账账单已解锁！大吉大省！');
    } catch (err) {
      console.error(err);
      triggerNotification('❌ 图像解析超时，已帮您调出经典自制营养省钱菜谱。');
      setRecipeResult({
        ingredients: ["土豆 (Potatoes)", "鸡蛋 (Eggs)", "西红柿 (Tomatoes)", "吐司/挂面"],
        recipes: [
          {
            name: "超省钱留学生双料土豆丝蛋炒饭 (Student Deluxe Potato Stir-fry Rice)",
            steps: [
              "将土豆刨成细丝沥干，鸡蛋打散备用。",
              "热锅下油，倒入蛋液炒散捞出；保持明火下土豆丝大热猛炒2分钟。",
              "倒入一盘剩米饭和刚捞出的熟蛋花，大火快速颠锅，撒入少许生抽和盐，翻炒至金黄，撒上葱花即可美味出炉。"
            ],
            cost: "$3.50 AUD"
          },
          {
            name: "一锅端西红柿鸡蛋焖面 (One-Pot Tomato Egg Stew Noodles)",
            steps: [
              "西红柿切丁，葱蒜爆香下锅炒成豆沙沙状出汤汁。",
              "加入温水大火煮开，打入两个散蛋花或荷包蛋。",
              "铺入超市购入的 $1 AUD 基础线面，关小火焖熟8慢火，让面条彻底吸饱浓醇西红柿蛋汁。"
            ],
            cost: "$4.00 AUD"
          }
        ],
        savingComparison: "【大厨守望启示】如果在墨尔本叫一份相似的外卖，外卖单体加高额配送服务费轻易突破 $28 AUD！自己在家花 10 分钟整一份，成本只需 $3.5 AUD。一餐瞬间省下 $24.5 AUD！这折合打最低时薪工整整 1 小时。少点外卖，健康又省力！"
      });
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleRecipeImgPreset = async (presetType: 'fridge' | 'receipt') => {
    setRecipeLoading(true);
    setRecipeResult(null);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'; // preset veggies
      if (presetType === 'receipt') {
        imageUrl = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300'; // preset supermarket checkout
      }
      setRecipePreview(imageUrl);

      const responseImg = await fetch(imageUrl);
      const blob = await responseImg.blob();
      const mockFile = new File([blob], `${presetType === 'fridge' ? 'fridge_ingredients' : 'grocery_receipt'}.jpg`, { type: 'image/jpeg' });

      await handleRecipeSubmit(mockFile);
    } catch (err) {
      console.error(err);
      triggerNotification('❌ 预置图像拉取失败');
      setRecipeLoading(false);
    }
  };

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Chat handlers
  const openChatWithUser = (name: string, avatar: string, initialMessage?: string) => {
    setActiveChatUser(name);
    setChatAvatar(avatar);
    setChatMessages([
      { sender: 'other', text: initialMessage || `你好呀！我是 ${name}，有什么我可以帮到您的？`, time: '刚刚' }
    ]);
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !activeChatUser) return;
    const sentMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: sentMsg, time: '刚刚' }]);
    setChatInput('');

    // Simulated instant reply
    setTimeout(() => {
      let responseText = '好的，关于您的需求我已经收到了，我们随时可以约定一个合适的时间，通过 Serene 担保交易，靠谱有保障！';
      if (sentMsg.includes('饭') || sentMsg.includes('拼')) {
        responseText = '没问题！我的家常小菜很抢手哦，直接在拼饭板块一键下单，Serene 托管好资金后就可以解锁精准门牌位置。';
      } else if (sentMsg.includes('面交') || sentMsg.includes('多少')) {
        responseText = '产品状态非常好，非常欢迎当面交涉！咱们等面交检查无误之后，你在 Serene 平台确认收货放款即可，很安全。';
      }
      setChatMessages(prev => [...prev, { sender: 'other', text: responseText, time: '刚刚' }]);
    }, 1000);
  };

  // Form submit handlers
  const handleRegisterGuideProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createGuideName || !createGuideMajor || !createGuideSuburb) {
      triggerNotification('❌ 请填写完整的向导基础信息！');
      return;
    }
    const newGuide: Guide = {
      id: `g-custom-${Date.now()}`,
      name: `${createGuideName} (我)`,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
      university: createGuideUniv,
      major: createGuideMajor,
      year: createGuideYear,
      rating: 5.0,
      suburb: createGuideSuburb,
      bio: createGuideBio || '本地生活经验丰富！',
      projects: [
        { 
          name: createGuideProject1 || '新手注册落地协助', 
          price: parseFloat(createGuidePrice1) || 20, 
          desc: createGuideDesc1 || '线下全程辅助带逛'
        }
      ],
      isCustom: true
    };
    setGuides(prev => [newGuide, ...prev]);
    triggerNotification('🎉 恭喜！您的留学向导 Profile 已经大功告成，可在“我要找向导”列表中浏览。');
    setGuideRole('student'); // focus back
  };

  const handlePublishMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDishName || !postDishPrice || !postSuburb || !postPreciseAddress) {
      triggerNotification('❌ 请完整编写菜单、收费、及精确公寓门牌地址。');
      return;
    }
    const newMeal: MealPost = {
      id: `m-custom-${Date.now()}`,
      dishName: postDishName,
      chefName: '我大显身手 (My Kitchen)',
      chefAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      cuisine: postCuisine,
      price: parseFloat(postDishPrice),
      type: postDishType,
      description: postDescription || '留校手工制。味道赞，卫生干净，用料扎实。',
      suburb: `${postSuburb} (距自测 0.1km)`,
      preciseAddress: postPreciseAddress,
      isUnlocked: true, // Auto unlocked for creator
      maxSeats: 8,
      joinedCount: 1,
      isCustom: true,
      image: postDishImage
    };
    setMeals(prev => [newMeal, ...prev]);
    triggerNotification(`🍲 您筹备的拼饭菜单 [${postDishName}] 成功上架！精确地址将在其他买家支付拼饭费后向其安全显示。`);
    // reset form
    setPostDishName('');
    setPostDishPrice('');
    setPostSuburb('');
    setPostPreciseAddress('');
    setPostDescription('');
    setChefRole('buy');
  };

  const handlePublishItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemPrice || !itemSuburb) {
      triggerNotification('❌ 请填写宝贝标题、期待价格与所在地区！');
      return;
    }
    const newItem: MarketplaceItem = {
      id: `i-custom-${Date.now()}`,
      title: itemTitle,
      price: parseFloat(itemPrice),
      condition: itemCondition,
      description: itemDesc || '毕业转租转手，无暗病，可以随时联系我面面相觑。',
      suburb: itemSuburb,
      category: itemCategory,
      sellerName: '我的安全小店',
      sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
      secureStatus: 'available',
      isCustom: true,
      image: postItemImage
    };
    setMarketItems(prev => [newItem, ...prev]);
    triggerNotification(`🛍️ [概念演示] 您的闲置宝贝发布成功！未来版本将接入资金托管保障机制（当前不涉及真实资金）。`);
    // reset
    setItemTitle('');
    setItemPrice('');
    setItemSuburb('');
    setItemDesc('');
    setMarketRole('buy');
  };

  // Payment simulations
  const handleMealPay = (id: string) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, isUnlocked: true, joinedCount: (m.joinedCount || 0) + 1 } : m));
    triggerNotification('💳 [概念演示] 已模拟拼饭预约金支付，精确门牌地址已解锁（演示流程，不涉及真实资金）。');
    setCheckoutMealId(null);
    // Find the unlocked meal and auto update selected view
    const updated = meals.find(m => m.id === id);
    if (updated) {
      setSelectedMeal({ ...updated, isUnlocked: true });
    }
  };

  const handleMarketItemBuyAndLock = (id: string) => {
    setMarketItems(prev => prev.map(i => i.id === id ? { ...i, secureStatus: 'locked_escrow' } : i));
    triggerNotification('🔒 [概念演示] 已模拟货款托管锁定，请线下约定面交，确认无误再放款（演示流程，不涉及真实资金）。');
    setCheckoutItemId(null);
    const updated = marketItems.find(i => i.id === id);
    if (updated) {
      setSelectedItem({ ...updated, secureStatus: 'locked_escrow' });
    }
  };

  const handleMarketItemReleaseFunds = (id: string) => {
    setMarketItems(prev => prev.map(i => i.id === id ? { ...i, secureStatus: 'completed' } : i));
    triggerNotification('💼 担保交易圆满完成！Serene 托管金库资金已划转至 seller。感谢您为防爆做出的贡献！');
    const updated = marketItems.find(i => i.id === id);
    if (updated) {
      setSelectedItem({ ...updated, secureStatus: 'completed' });
    }
  };

  const filteredGuides = guides.filter(g => 
    g.name.toLowerCase().includes(guideQuery.toLowerCase()) ||
    g.university.toLowerCase().includes(guideQuery.toLowerCase()) ||
    g.suburb.toLowerCase().includes(guideQuery.toLowerCase()) ||
    g.bio.toLowerCase().includes(guideQuery.toLowerCase())
  );

  const filteredMeals = meals.filter(m => 
    m.dishName.toLowerCase().includes(chefQuery.toLowerCase()) ||
    m.cuisine.toLowerCase().includes(chefQuery.toLowerCase()) ||
    m.suburb.toLowerCase().includes(chefQuery.toLowerCase())
  );

  const filteredItems = marketItems.filter(i => {
    const matchesQuery = i.title.toLowerCase().includes(marketQuery.toLowerCase()) || i.description.toLowerCase().includes(marketQuery.toLowerCase());
    const matchesCategory = marketCategory === 'all' || i.category === marketCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div id="eco-hub-container" className="w-full text-gray-900 pb-16 font-sans relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white rounded-2xl px-6 py-4 shadow-xl border border-neutral-800 text-sm font-bold flex items-center gap-2.5 max-w-sm text-center"
          >
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Welcome banner */}
      <div className="mb-8 bg-gradient-to-r from-[#1d1d1f]/5 to-[#ff5a3c]/5 border border-[#1d1d1f]/10 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 text-ink/5 rotate-12">
          <Compass size={240} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <div className="inline-flex items-center space-x-1.5 bg-surface-soft text-ink px-3 py-1 rounded-full text-xs font-black tracking-wider">
              <Shield size={14} />
              <span>SERENE TRUST ECOSYSTEM · 海外新移民安全生态集市</span>
            </div>
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide">
              🧪 概念演示 · Roadmap
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1d1d1f] tracking-tight">
            本地向导 · 留学生拼饭 · 闲置安全流转
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            告别传统二手群、租房群泛滥的换汇诈骗、皮包中介与虚假低价的<strong>生态愿景演示</strong>：展示「线下带玩向导 + 拼饭门牌锁定 + 货款托管」的可信赖街区设想。<strong className="text-amber-700">「向导 / 拼饭 / 二手」三个标签为概念预览，向导与商品均为示例数据、不涉及真实资金流转</strong>；而 <strong className="text-ink">「实用工具」标签内的拍照翻译与实时汇率为真实可用的 Gemini 能力</strong>。
          </p>
        </div>
      </div>

      {/* Segment switcher */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-2 scrollbar-none">
        <button 
          onClick={() => { setActiveTab('guides'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'guides' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <Users size={18} />
          <span>向导同行 (Companion)</span>
          <span className="ml-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">概念</span>
        </button>
        <button 
          onClick={() => { setActiveTab('private_chef'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'private_chef' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <Utensils size={18} />
          <span>留学私厨与拼饭 (Kitchen)</span>
          <span className="ml-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">概念</span>
        </button>
        <button 
          onClick={() => { setActiveTab('marketplace'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'marketplace' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <ShoppingBag size={18} />
          <span>二手闲置防坑街 (Market)</span>
          <span className="ml-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">概念</span>
        </button>
        <button
          onClick={() => { setActiveTab('tools'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'tools' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <span>🧰</span>
          <span>实用工具 (Tools)</span>
          <span className="ml-0.5 text-[9px] font-bold text-ink bg-surface-soft px-1.5 py-0.5 rounded-full">Live 真实</span>
        </button>
      </div>

      {activeTab !== 'tools' && (
        <div className="mb-6 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-base leading-none mt-0.5">🧪</span>
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            <strong>概念预览 (Concept Preview)</strong> — 本标签展示 Serene 的「可信赖街区」愿景蓝图，向导、拼饭与商品均为示例数据，<strong>不涉及任何真实资金流转或真实交易</strong>。想体验真实可用的 Gemini 能力，请切换到「实用工具 (Tools)」标签。
          </p>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <EcoTools />
        </div>
      )}

      {/* Main Panel views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive section */}
        <div className="lg:col-span-8 space-y-6">

          {/* TAB 1: GUIDES */}
          {activeTab === 'guides' && (
            <div className="space-y-6">
              {/* Role perspective header */}
              <div className="flex justify-between items-center bg-white border border-gray-150 p-4 rounded-2xl shadow-xs">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Perspective Tab Selector</span>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setGuideRole('student')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${guideRole === 'student' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    我要找本地向导
                  </button>
                  <button 
                    onClick={() => setGuideRole('guide')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${guideRole === 'guide' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    我是本届向导 (创建Profile)
                  </button>
                </div>
              </div>

              {guideRole === 'student' ? (
                /* Browsing Guides */
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="搜索向导姓名、学校（如UniMelb）、所在区或个人特长..."
                      value={guideQuery}
                      onChange={e => setGuideQuery(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-3xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/50 transition-shadow shadow-xs"
                    />
                  </div>

                  {/* AI Situation Matching Workspace */}
                  <div className="bg-gradient-to-br from-[#1d1d1f]/5 via-white to-amber-50/10 border border-gray-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/20 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-[#1d1d1f] text-white rounded-xl shadow-xs">
                        <Zap size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5 animate-pulse">
                          <span>✨ AI 瞬时避坑向导智能匹配</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">新生防坑仪</span>
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          遇到留学落地困难、租房验证、第一学期挂科、被不良华人私下二手微信群威胁？用一句话写出你的处境，AI 帮你配对最具对症经验的带教志愿者学长姐，并当堂定制行动排雷卡。
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCompanionMatch} className="space-y-3">
                      <textarea
                        rows={2}
                        value={situationQuery}
                        onChange={e => setSituationQuery(e.target.value)}
                        placeholder="例如：刚入座Clayton看房极其担心碰见黑二手房东、或收到Show Cause信手足无措面临听证会..."
                        className="w-full bg-white border border-gray-200 rounded-2xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]/55 focus:border-[#1d1d1f]/60 placeholder-gray-400 leading-relaxed shadow-xs"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                          <Shield size={11} className="text-ink" />
                          <span>学长向导非中介，均为真实留学生防雷经验志愿传递者</span>
                        </span>
                        <button
                          type="submit"
                          disabled={companionMatchLoading}
                          className="px-4 py-2 bg-[#1d1d1f] hover:bg-neutral-800 text-white rounded-xl text-xs font-black tracking-wide transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {companionMatchLoading ? (
                            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <Zap size={11} fill="currentColor" />
                          )}
                          <span>{companionMatchLoading ? '正在分析处境...' : 'AI 瞬时匹配学长姐'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {filteredGuides.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-3xl text-gray-400">
                      没有找到匹配的本地带逛学长姐，尝试缩短关键词。
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredGuides.map(g => (
                        <div 
                          key={g.id} 
                          onClick={() => setSelectedGuide(g)}
                          className={`bg-white border rounded-3xl p-5 hover:border-[#1d1d1f]/30 hover:scale-101 shadow-xs transition-all cursor-pointer flex flex-col justify-between ${selectedGuide?.id === g.id ? 'ring-2 ring-[#1d1d1f] border-transparent' : 'border-gray-150'} ${matchedGuideIds.includes(g.id) ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(234,178,82,0.22)] border-transparent' : ''}`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <img src={g.avatar} alt="avatar" className="w-12 h-12 rounded-2xl object-cover border" />
                                <div>
                                  <h4 className="font-black text-gray-950 flex flex-wrap items-center gap-1">
                                    <span>{g.name}</span>
                                    {matchedGuideIds.includes(g.id) && (
                                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded-full leading-none shrink-0">
                                        ✨ AI 精选经验源
                                      </span>
                                    )}
                                    {g.isCustom && <span className="bg-surface-soft text-ink text-[9px] font-black px-1 py-0.2 rounded shrink-0">我</span>}
                                  </h4>
                                  <p className="text-[10px] text-gray-400 font-bold tracking-tight">{g.university} · {g.major}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-black">
                                <Star size={11} fill="currentColor" />
                                <span>{g.rating}</span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed bg-gray-50/75 p-2 rounded-xl">
                              “ {g.bio} ”
                            </p>

                            <div className="mt-4 space-y-2">
                              {g.projects.map((p, pIdx) => (
                                <div key={pIdx} className="bg-surface-soft/30 border border-hairline/50 rounded-xl p-2.5 flex justify-between items-center text-xs">
                                  <div className="truncate pr-2">
                                    <span className="font-bold text-gray-800 block text-xs truncate">{p.name}</span>
                                    <span className="text-[10px] text-gray-500 truncate block">{p.desc}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 shrink-0">
                                    <span className="font-black text-ink text-right font-mono">${p.price}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart({
                                          id: `cart-guide-${g.id}-${pIdx}`,
                                          type: 'guide_project',
                                          originId: `${g.id}-${pIdx}`,
                                          title: p.name,
                                          price: p.price,
                                          subtitle: g.name,
                                          image: g.avatar,
                                          suburb: g.suburb
                                        });
                                      }}
                                      className="bg-[#1d1d1f] text-white hover:bg-neutral-800 p-1.5 rounded-lg transition-all cursor-pointer"
                                      title="加入购物车"
                                    >
                                      <ShoppingCart size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                              <MapPin size={11} />
                              {g.suburb} (活跃地)
                            </span>
                            <div className="inline-flex items-center text-xs font-bold text-[#1d1d1f] group">
                              <span>查看详细规划</span>
                              <ChevronRight size={14} className="ml-0.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Create Guide Profile Form */
                <form onSubmit={handleRegisterGuideProfile} className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 space-y-5 shadow-xs">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-1">建立您的留学生有偿帮带向导卡</h3>
                    <p className="text-xs text-on-warning-light text-gray-500 leading-relaxed mb-4">
                      发挥自己熟悉墨尔本生活设施、三大账户办理经验、或熟练驾车优势，顺路帮助刚下飞机的异乡学子，轻松赚取合理报酬！
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">您的称呼</label>
                      <input 
                        type="text" 
                        placeholder="例如：林学长 (Alex)" 
                        required
                        value={createGuideName}
                        onChange={e => setCreateGuideName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">主校区学校</label>
                      <select 
                        value={createGuideUniv}
                        onChange={e => setCreateGuideUniv(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option>墨尔本大学 (UniMelb)</option>
                        <option>莫纳什大学 (Monash)</option>
                        <option>皇家墨尔本理工大学 (RMIT)</option>
                        <option>迪肯大学 (Deakin)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">攻读学科/专业</label>
                      <input 
                        type="text" 
                        placeholder="例如：IT 信息系统硕士" 
                        required
                        value={createGuideMajor}
                        onChange={e => setCreateGuideMajor(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">当前年级</label>
                      <select 
                        value={createGuideYear}
                        onChange={e => setCreateGuideYear(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option>大一/大二</option>
                        <option>大三/大四</option>
                        <option>研一</option>
                        <option>研二/研三</option>
                        <option>已毕业/兼职</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">您常活动的澳洲区域 (Suburb)</label>
                      <input 
                        type="text" 
                        placeholder="例如：Carlton / Melbourne CBD" 
                        required
                        value={createGuideSuburb}
                        onChange={e => setCreateGuideSuburb(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">向导一句话介绍简介</label>
                      <input 
                        type="text" 
                        placeholder="例如：老夫墨尔本老手，可以完美接机和带新！" 
                        value={createGuideBio}
                        onChange={e => setCreateGuideBio(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-150 pt-4">
                    <span className="text-xs font-extrabold text-gray-700 block mb-3">策划一个您的有偿“带逛协助项目”并定价:</span>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase">项目名称</label>
                          <input 
                            type="text" 
                            placeholder="例如：新手着陆三件套陪同办理 (开卡陪看)" 
                            value={createGuideProject1}
                            onChange={e => setCreateGuideProject1(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold mt-1" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase">费用价格 (AUD)</label>
                          <input 
                            type="number" 
                            placeholder="例如：35" 
                            value={createGuidePrice1}
                            onChange={e => setCreateGuidePrice1(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold mt-1" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase">详细具体陪同内容说明</label>
                        <input 
                          type="text" 
                          placeholder="例如：线下带领办理ANZ银行卡，选购超值Vodafone卡并指明火车乘车细则" 
                          value={createGuideDesc1}
                          onChange={e => setCreateGuideDesc1(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold mt-1" 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white rounded-xl py-3.5 text-xs font-black tracking-wide transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    🚀 发布上架并创建向导卡
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PRIVATE CHEF */}
          {activeTab === 'private_chef' && (
            <div className="space-y-6">
              {/* 拼饭 Kahoot 局 — the centerpiece group-meal planner */}
              <MeetupPlanner />

              {/* Perspective Role switcher */}
              <div className="flex justify-between items-center bg-white border border-gray-150 p-4 rounded-2xl shadow-xs">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Kitchen Tab Segment</span>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setChefRole('buy')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chefRole === 'buy' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    我要搭伙拼饭/吃私厨
                  </button>
                  <button 
                    onClick={() => setChefRole('sell')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chefRole === 'sell' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    我要做饭展示菜单
                  </button>
                </div>
              </div>

              {chefRole === 'buy' ? (
                /* Browsing Diners and Foods */
                <div className="space-y-6">
                  {/* Search Bar and map selector indicator */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="搜索特色菜、菜系（川菜、西北菜等）或所在地区周边..."
                      value={chefQuery}
                      onChange={e => setChefQuery(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-3xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/50 transition-shadow shadow-xs"
                    />
                  </div>

                  {/* AI Budget Meal Assistant Block */}
                  <div className="bg-gradient-to-br from-[#1d1d1f]/5 via-white to-[#ff5a3c]/5 border border-gray-200/85 rounded-3xl p-5 shadow-xs relative overflow-hidden space-y-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-surface-soft/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#1d1d1f] text-white rounded-xl shadow-xs">
                        <Utensils size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5 leading-none">
                          <span>🥦 AI 冰箱临期食材 & 超市小票省钱自救菜谱</span>
                          <span className="text-[10px] bg-surface-soft text-ink font-extrabold px-1.5 py-0.2 rounded animate-pulse">外卖终结者</span>
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                          叫一顿 $30+ AUD 的送餐外卖是不是掏空了每周的生活开销？上传冰箱杂乱随拍，或 Woolworths / Coles 实拍买菜小票小图。Serene 将比照全澳平价库，瞬时为你定制最低成本极简营养快手食谱，并展开防坑账单痛感换算！
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image Upload Area */}
                      <div className="space-y-3">
                        <div className="border border-dashed border-gray-250 rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-white transition-all hover:border-[#1d1d1f]/30 flex flex-col justify-center items-center h-32 relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleRecipeSubmit(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Upload className="mx-auto text-[#1d1d1f] mb-2" size={24} />
                          <span className="text-[11px] font-bold text-gray-800 block">点击或拖拽上传冰箱一角 / 买菜小票</span>
                          <span className="text-[9px] text-gray-400 mt-1 block">支持图像上传进行真实的 AI 大屏扫描</span>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex items-center gap-2 font-sans">
                          <span className="text-[9px] text-gray-400 font-black shrink-0">体验预载样例：</span>
                          <button
                            type="button"
                            onClick={() => handleRecipeImgPreset('fridge')}
                            className="px-2.5 py-1 text-[10px] font-black bg-surface-soft hover:bg-surface-soft active:scale-95 text-ink border border-hairline rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            🥦 预置临期食材
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRecipeImgPreset('receipt')}
                            className="px-2.5 py-1 text-[10px] font-black bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 border border-amber-200 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            🧾 预置超市购物小票
                          </button>
                        </div>
                      </div>

                      {/* Loading block or Preview Report */}
                      <div className="bg-white/90 border border-gray-150 rounded-2xl p-3.5 flex flex-col justify-center min-h-[140px] relative font-sans">
                        {recipeLoading ? (
                          <div className="space-y-3 text-center my-auto animate-pulse">
                            <div className="inline-block w-8 h-8 border-4 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <div className="space-y-1">
                              <span className="text-xs font-black text-gray-900 block">Serene AI 正在扫描冰箱及比照全澳物价...</span>
                              <span className="text-[9px] text-gray-450 block">Woolworths & Coles 最新低价策略比对计算中</span>
                            </div>
                          </div>
                        ) : recipeResult ? (
                          <div className="space-y-3 h-full overflow-y-auto max-h-[160px] text-xs leading-relaxed text-gray-700 pr-1 select-none font-semibold">
                            <div>
                              <span className="text-[9px] text-gray-400 font-extrabold uppercase block">🥗 智能雷达扫描识别食材 (Ingredients):</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {recipeResult.ingredients.map((ing, iIdx) => (
                                  <span key={iIdx} className="bg-surface-soft text-ink border border-hairline text-[10px] font-black px-1.5 py-0.5 rounded-lg leading-none">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-dashed border-gray-150 pt-2 space-y-2">
                              <span className="text-[9px] text-gray-400 font-extrabold uppercase block">🍳 AI 定制省钱自救菜谱 (Recipes):</span>
                              {recipeResult.recipes.map((rep, rIdx) => (
                                <div key={rIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 space-y-1">
                                  <div className="flex justify-between items-center text-[11px] font-black">
                                    <span className="text-gray-950 font-black">{rIdx + 1}. {rep.name}</span>
                                    <span className="text-ink bg-surface-soft font-mono px-1 py-0.2 rounded shrink-0">预估成本 {rep.cost}</span>
                                  </div>
                                  <ul className="list-decimal pl-3.5 text-[10px] font-bold text-gray-600 space-y-0.5">
                                    {rep.steps.map((st, sIdx) => <li key={sIdx}>{st}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-dashed border-gray-150 pt-2 bg-[#ff5a3c]/10 p-2.5 rounded-xl border border-[#ff5a3c]/20">
                              <span className="text-[9.5px] text-[#ff5a3c] font-black uppercase flex items-center gap-0.5 leading-none">
                                🛡️ 留学生自救平价防坑账单 (Woolies / Coles 比照):
                              </span>
                              <p className="text-[10px] text-[#1d1d1f] font-bold leading-relaxed mt-1.5">
                                {recipeResult.savingComparison}
                              </p>
                            </div>
                          </div>
                        ) : recipePreview ? (
                          <div className="relative w-full h-full min-h-[120px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                            <img src={recipePreview} alt="upload preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-[10px] font-black">已预载样例：点击下方按钮分析</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-xs my-auto">
                            <Utensils className="mx-auto mb-1.5 opacity-30 animate-pulse text-neutral-400" size={24} />
                            <span>上传图片或点击预载样例，即可触发 AI 生鲜/小票算术。</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HIGH QUALITY STYLISH CSS INTERACTIVE LOCAL MAP SIMULATOR */}
                  <div className="bg-gradient-to-br from-[#ff5a3c]/10 via-[#f5f5f7] to-surface-soft/10 border border-gray-200 rounded-3xl p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-3 text-xs leading-none">
                      <span className="font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Map size={16} className="text-[#ff5a3c]" />
                        <span>墨尔本 Lygon & CBD 实时在线拼餐拼桌地图卫星定位</span>
                      </span>
                      <span className="text-[10px] text-ink font-extrabold bg-surface-soft px-1.5 py-0.5 rounded animate-pulse">● 2 位大显身手正在开伙</span>
                    </div>

                    <div className="w-full h-44 bg-[#F2EDE4] rounded-2xl border border-gray-200 relative overflow-hidden shadow-inner flex items-center justify-center">
                      {/* Grid overlay for map vibe */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-15 pointer-events-none">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="border border-[#1d1d1f] border-dashed"></div>
                        ))}
                      </div>

                      {/* Map lines illustration */}
                      <div className="absolute w-[1px] h-full bg-gray-300 left-1/3 rotate-12"></div>
                      <div className="absolute w-full h-[1px] bg-gray-300 top-1/2 -rotate-12"></div>
                      <span className="absolute left-4 top-4 text-[9px] font-bold text-gray-400 font-mono">Swanston Street</span>
                      <span className="absolute right-6 bottom-4 text-[9px] font-bold text-gray-400 font-mono">Lygon Street</span>

                      {/* Your Location Pin */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                        <div className="bg-[#1d1d1f] text-white px-2 py-0.5 rounded-md text-[10px] font-black shadow-md border border-white">
                          您的位置
                        </div>
                        <div className="w-3 h-3 bg-[#1d1d1f] rounded-full border-2 border-white animate-pulse mt-0.5"></div>
                      </div>

                      {/* Pin A: Dapanji */}
                      <div 
                        onClick={() => { const meal = meals.find(m => m.id === 'm-1'); if(meal) setSelectedMeal(meal); }}
                        className="absolute left-1/4 top-1/4 hover:scale-110 cursor-pointer flex flex-col items-center transition-transform z-10"
                      >
                        <div className="bg-amber-100 border border-amber-300 text-amber-900 font-black px-1.5 py-0.5 rounded-lg text-[9px] shadow-sm flex items-center gap-1">
                          <span>🍗 大盘鸡 $18.5</span>
                        </div>
                        <div className="w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white mt-0.5 flex items-center justify-center text-white text-[7px] font-black">1</div>
                      </div>

                      {/* Pin B: Shuizhuyu */}
                      <div 
                        onClick={() => { const meal = meals.find(m => m.id === 'm-2'); if(meal) setSelectedMeal(meal); }}
                        className="absolute right-1/4 top-1/3 hover:scale-110 cursor-pointer flex flex-col items-center transition-transform z-10"
                      >
                        <div className="bg-red-50 border border-red-200 text-red-900 font-black px-1.5 py-0.5 rounded-lg text-[9px] shadow-sm flex items-center gap-1">
                          <span>🐟 水煮鱼 $15</span>
                        </div>
                        <div className="w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white mt-0.5 flex items-center justify-center text-white text-[7px] font-black">2</div>
                      </div>

                    </div>
                  </div>

                  {/* List of meals */}
                  {filteredMeals.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-3xl text-gray-400">
                      没有匹配的大厨拼桌，赶快去自己发布一个，带大家搭伙开饭！
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMeals.map(m => (
                        <div 
                          key={m.id}
                          onClick={() => setSelectedMeal(m)}
                          className={`bg-white border rounded-3xl overflow-hidden hover:shadow-md hover:border-[#1d1d1f]/30 hover:scale-101 shadow-xs transition-all cursor-pointer flex flex-col justify-between ${selectedMeal?.id === m.id ? 'ring-2 ring-[#1d1d1f] border-transparent' : 'border-gray-150'}`}
                        >
                          <div>
                            {/* Dish Product Image */}
                            <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                              <img 
                                src={m.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
                                alt={m.dishName} 
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-black/60 text-white backdrop-blur-xs">
                                {m.type === 'cooking' ? '🔥 留校私厨列餐' : '👥 拼饭桌聚'}
                              </span>
                              <span className="absolute top-3 right-3 text-xs font-black font-mono text-on-dark bg-[#1d1d1f]/85 px-2 py-0.5 rounded-lg shrink-0">
                                ${m.price}
                              </span>
                            </div>

                            <div className="p-4">
                              <h4 className="text-sm font-black text-gray-950 mt-1 line-clamp-1">{m.dishName}</h4>
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed h-8 overflow-hidden">
                                {m.description}
                              </p>

                              <div className="mt-3 flex items-center space-x-2">
                                <img src={m.chefAvatar} alt="avatar" className="w-6 h-6 rounded-full border" />
                                <div className="text-[9px]">
                                  <span className="font-bold text-gray-800 block leading-tight">{m.chefName}</span>
                                  <span className="text-gray-400 block leading-none mt-0.5">菜系：{m.cuisine}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mx-4 mb-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                              <MapPin size={11} />
                              {m.suburb}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart({
                                    id: `cart-meal-${m.id}`,
                                    type: 'meal',
                                    originId: m.id,
                                    title: m.dishName,
                                    price: m.price,
                                    subtitle: m.chefName,
                                    image: m.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
                                    suburb: m.suburb
                                  });
                                }}
                                className="bg-[#1d1d1f]/10 hover:bg-[#1d1d1f] group hover:text-white text-[#1d1d1f] px-2 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black"
                                title="加入防坑购物车"
                              >
                                <ShoppingCart size={11} />
                                <span>+购物车</span>
                              </button>
                              <div className="text-[10px] font-extrabold text-neutral-500 hover:text-[#1d1d1f] flex items-center">
                                <span>详情 ➜</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Post meal form */
                <form onSubmit={handlePublishMeal} className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 space-y-5 shadow-xs">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-1">筹备您的小厨房菜谱与公开拼大桌</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      <strong>隐私保护防区：</strong> 您的具体公寓房号在买家通过 Serene 的安全资金中介支付成功之前，<span className="text-red-650 font-bold bg-red-50 px-1 py-0.2 rounded">对任何人都是模糊不可见的</span>。确保纯净无骗。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">菜肴/拼桌主题名称</label>
                      <input 
                        type="text" 
                        placeholder="例如：地道红烧肉+秘制茶叶蛋" 
                        required
                        value={postDishName}
                        onChange={e => setPostDishName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">搭伙拼餐费用 ($AUD / 人)</label>
                      <input 
                        type="number" 
                        placeholder="例如：15" 
                        required
                        value={postDishPrice}
                        onChange={e => setPostDishPrice(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">拼盘模式</label>
                      <select 
                        value={postDishType}
                        onChange={e => setPostDishType(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option value="cooking">做饭列菜单出售</option>
                        <option value="sharing">大桌聚餐分摊 (拼饭)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">所属菜系类别</label>
                      <input 
                        type="text" 
                        placeholder="例如：西北面食 / 甜品 / 湘菜" 
                        required
                        value={postCuisine}
                        onChange={e => setPostCuisine(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">大致区域 (仅展示)</label>
                      <input 
                        type="text" 
                        placeholder="例如：Carlton / CBD" 
                        required
                        value={postSuburb}
                        onChange={e => setPostSuburb(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">🔑 精精准公寓门牌物理地址 (锁住隐私 · 核心安全)</label>
                    <input 
                      type="text" 
                      placeholder="例如：Room 502, 168 Lygon St, Carlton VIC 3053 (确保真实，付款前平台对外隐藏！)" 
                      required
                      value={postPreciseAddress}
                      onChange={e => setPostPreciseAddress(e.target.value)}
                      className="w-full bg-orange-50/50 border border-orange-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-550 focus:border-transparent placeholder-gray-400" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">菜肴故事与拼饭温馨留言</label>
                    <textarea 
                      rows={3}
                      placeholder="例如：精心选用放养大腿鸡，慢炖三个小时。希望结交志同道合的同学搭伙一同聚食！"
                      value={postDescription}
                      onChange={e => setPostDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1d1d1f] resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">挑选菜品展示图 Preschool</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { name: '大盘鸡', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400' },
                        { name: '水煮鱼', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400' },
                        { name: '饺子/面食', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400' },
                        { name: '中式热炒', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=400' },
                        { name: '甜品咖啡', url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400' },
                        { name: '麻辣烫/干锅', url: 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?auto=format&fit=crop&q=80&w=400' }
                      ].map(p => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setPostDishImage(p.url)}
                          className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${postDishImage === p.url ? 'border-[#1d1d1f] scale-102 ring-1 ring-[#1d1d1f]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          title={p.name}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white rounded-xl py-3.5 text-xs font-black tracking-wide transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    🍲 上架小厨菜单并锁住隐私地址
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: MARKETPLACE */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              {/* Perspective Segment Swapper */}
              <div className="flex justify-between items-center bg-white border border-gray-150 p-4 rounded-2xl shadow-xs">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Marketplace Tab Selector</span>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setMarketRole('buy')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${marketRole === 'buy' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    我要找靠谱闲置
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMarketRole('sell')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${marketRole === 'sell' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    我要转卖闲置数码
                  </button>
                </div>
              </div>

              {marketRole === 'buy' ? (
                /* Browsing marketplace */
                <div className="space-y-6">
                  
                  {/* Search and Category filters segment */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text"
                        placeholder="搜索Kmart微波炉、课本资料或闲置书桌等..."
                        value={marketQuery}
                        onChange={e => setMarketQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-3xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/50 transition-shadow shadow-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'all', label: '全部宝贝 🛍️' },
                        { id: '生活用品', label: '生活用品 🏠' },
                        { id: '数码', label: '数码电子 💻' },
                        { id: '教材资料', label: '教材资料 📚' },
                        { id: '其他', label: '其他 🎨' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setMarketCategory(cat.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${marketCategory === cat.id ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trust warning block */}
                  <div className="bg-surface-soft border border-hairline p-4 rounded-2xl text-xs leading-relaxed text-[#1d1d1f] flex items-start gap-2.5">
                    <Shield size={18} className="shrink-0 mt-0.5 text-ink" />
                    <div>
                      <strong>Serene 独属二手双向货款托管交易机制：</strong>
                      买家付款后，钱款将由平台金库安全托管。双方当面验货并确认交付或拿到包裹，买家由平台释放放款，彻底避免了微信群“先钱后货或假回单”的无解死局！
                    </div>
                  </div>

                  {/* Listed Items Grid */}
                  {filteredItems.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-3xl text-gray-400">
                      该类目下没有找到匹配的宝贝，赶紧点击大类切换吧！
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredItems.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`bg-white border rounded-3xl overflow-hidden hover:shadow-md hover:border-[#1d1d1f]/30 hover:scale-101 shadow-xs transition-all cursor-pointer flex flex-col justify-between ${selectedItem?.id === item.id ? 'ring-2 ring-[#1d1d1f] border-transparent' : 'border-gray-150'}`}
                        >
                          <div>
                            {/* Product Image */}
                            <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'} 
                                alt={item.title} 
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase bg-[#1d1d1f] text-white">
                                {item.condition}
                              </span>
                              <span className="absolute top-3 right-3 text-xs font-black font-mono text-on-dark bg-[#1d1d1f]/85 px-2 py-0.5 rounded-lg shrink-0">
                                ${item.price}
                              </span>
                            </div>

                            <div className="p-4">
                              <h4 className="text-sm font-black text-gray-950 mt-1 line-clamp-1">{item.title}</h4>
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed h-8 overflow-hidden">
                                {item.description}
                              </p>

                              <div className="mt-3 flex items-center space-x-2">
                                <img src={item.sellerAvatar} alt="avatar" className="w-6 h-6 rounded-full" />
                                <div className="text-[9px]">
                                  <span className="font-bold text-gray-800 block leading-tight">{item.sellerName}</span>
                                  <span className="text-gray-400 block leading-none mt-0.5">等级：星级卖家</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mx-4 mb-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                              <MapPin size={11} />
                              {item.suburb}
                            </span>
                            <div className="flex items-center space-x-1.5 font-sans">
                              {/* AI Price Check Button */}
                              <button
                                type="button"
                                disabled={priceCheckResults[item.id]?.loading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(item);
                                  handlePriceCheck(item.id, item.title, item.description, item.price);
                                }}
                                className={`px-2 py-1 rounded-xl text-[10px] font-black cursor-pointer flex items-center gap-0.5 transition-all ${
                                  priceCheckResults[item.id]
                                    ? priceCheckResults[item.id].verdict === '划算'
                                      ? 'bg-surface-soft text-ink border border-hairline'
                                      : priceCheckResults[item.id].verdict === '偏贵'
                                      ? 'bg-red-100 text-red-800 border border-red-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                    : 'bg-amber-50 hover:bg-amber-100/80 active:scale-95 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {priceCheckResults[item.id]?.loading ? (
                                  <span className="w-3 h-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                  '💡'
                                )}
                                <span>
                                  {priceCheckResults[item.id]
                                    ? `AI:${priceCheckResults[item.id].verdict}`
                                    : 'AI验价'}
                                </span>
                              </button>

                              {item.secureStatus === 'available' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart({
                                      id: `cart-item-${item.id}`,
                                      type: 'marketplace_item',
                                      originId: item.id,
                                      title: item.title,
                                      price: item.price,
                                      subtitle: item.sellerName,
                                      image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
                                      suburb: item.suburb
                                    });
                                  }}
                                  className="bg-[#1d1d1f]/10 hover:bg-[#1d1d1f] group hover:text-white text-[#1d1d1f] px-2 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black"
                                >
                                  <ShoppingCart size={11} />
                                  <span>+购物车</span>
                                </button>
                              ) : item.secureStatus === 'locked_escrow' ? (
                                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-xl text-[9px] font-black animate-pulse">
                                  🔐 资金已锁仓
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-400 px-2 py-1 rounded-xl text-[9px] font-black">
                                  已安全交付
                                </span>
                              )}
                              <div className="text-[10px] font-extrabold text-neutral-500 hover:text-[#1d1d1f] flex items-center">
                                <span>详情 ➜</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ) : (
                /* Post market item */
                <form onSubmit={handlePublishItem} className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 space-y-5 shadow-xs">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-1">发布闲置宝贝</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      杜绝一切骚扰。通过 Serene 的货款中介担保机制进行毕业大抛售，支持面退和拒付，给墨尔本校友最纯净的交易环境。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">宝贝标题名称</label>
                      <input 
                        type="text" 
                        placeholder="例如：99新毕业甩卖超轻吹风机" 
                        required
                        value={itemTitle}
                        onChange={e => setItemTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5 font-mono">期待置办转手价 ($AUD)</label>
                      <input 
                        type="number" 
                        placeholder="例如：25" 
                        required
                        value={itemPrice}
                        onChange={e => setItemPrice(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">折旧程度</label>
                      <select 
                        value={itemCondition}
                        onChange={e => setItemCondition(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option value="全新">全套未拆封 (全新)</option>
                        <option value="99新">近乎无暇 (99新)</option>
                        <option value="90新">轻微使用痕迹 (90新)</option>
                        <option value="85新">正常陈列折损 (85新)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">所属类别 (分类过滤)</label>
                      <select 
                        value={itemCategory}
                        onChange={e => setItemCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option value="生活用品">生活用品</option>
                        <option value="数码">数码电子</option>
                        <option value="教材资料">教材资料/书籍</option>
                        <option value="其他">其他闲置</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">您所在的区 (面交距离参考)</label>
                      <input 
                        type="text" 
                        placeholder="例如：Melbourne CBD" 
                        required
                        value={itemSuburb}
                        onChange={e => setItemSuburb(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">详细宝贝描述 (购买出处、面交地点支持等)</label>
                    <textarea 
                      rows={3}
                      placeholder="请详细描述尺寸、原售价、成色等细节。例如：墨大附近支持面交验货，手艺全方位打包良好..."
                      value={itemDesc}
                      onChange={e => setItemDesc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1d1d1f] resize-none" 
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white rounded-xl py-3.5 text-xs font-black tracking-wide transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    🛍️ 安全发布，锁定货款担保流转
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Right Details inspector sidebar & Dynamic simulation panels */}
        <div className={`lg:col-span-4 space-y-6 ${activeTab === 'tools' ? 'hidden' : ''}`}>

          {/* 1. Dynamic Detail Inspector */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs relative">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Compass size={14} className="text-[#1d1d1f]" />
              <span>动态细节审查与担保板 (Detail Inspector)</span>
            </h3>

            {/* IF NO DEETS ARE SELECTED */}
            {!selectedGuide && !selectedMeal && !selectedItem && (
              <div className="text-center py-12 text-gray-400 text-xs">
                <Compass className="mx-auto mb-2.5 text-gray-300 animate-pulse" size={28} />
                <span>在左侧选中任意“向导学长”、“拼饭聚会”、或“闲置宝贝”即可在此发起沟通与安全担保。</span>
              </div>
            )}

            {/* INDIVIDUAL GUIDE VIEW */}
            {selectedGuide && !selectedMeal && !selectedItem && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <img src={selectedGuide.avatar} alt="avatar" className="w-14 h-14 rounded-2xl object-cover" />
                  <div>
                    <h4 className="font-extrabold text-gray-950 text-base">{selectedGuide.name}</h4>
                    <span className="text-[10px] text-gray-450 block font-bold text-gray-400">{selectedGuide.university}</span>
                    <span className="text-[10px] bg-surface-soft text-ink px-1.5 py-0.2 rounded font-black">{selectedGuide.major}</span>
                  </div>
                </div>

                {/* AI SPECIFIC PREVENTATIVE SCAM PROTECTION CARD */}
                {matchChecklist && matchChecklist.length > 0 && matchedGuideIds.includes(selectedGuide.id) && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-300 rounded-2xl p-4 space-y-2.5 shadow-xs animate-in slide-in-from-top-3 duration-300">
                    <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                      <Shield size={14} className="text-amber-700 animate-pulse fill-amber-200" />
                      <span>🛡️ AI 特派安全避坑与反诈生存卡</span>
                    </div>
                    {matchReason && (
                      <p className="text-[10px] text-amber-950 leading-relaxed bg-white/75 p-2 rounded-xl border border-amber-200/80 font-bold font-medium">
                        <strong>推荐匹配依据：</strong>{matchReason}
                      </p>
                    )}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-amber-800 tracking-wide block">⚠️ 处境生存行动 Checklist：</span>
                      <ul className="space-y-1.5">
                        {matchChecklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[10px] text-gray-700 font-bold leading-relaxed">
                            <span className="text-[#1d1d1f] shrink-0 select-none mt-0.5">✔</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-[8px] text-amber-700/85 font-bold leading-relaxed border-t border-amber-200/60 pt-1.5 mt-1">
                      💡 提示：本学长姐向导由真实志愿者在校经验构建，是您的第一手“避坑经验库”，非任何商业中介。请参考避坑清单行动！
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">自我介绍</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                    “ {selectedGuide.bio} ”
                  </p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">可接有偿带逛项目：</span>
                  {selectedGuide.projects.map((proj, pIdx) => (
                    <div key={pIdx} className="bg-neutral-50 border rounded-2xl p-3.5 space-y-1">
                      <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-gray-900">{proj.name}</span>
                        <span className="text-ink bg-surface-soft/70 px-1.5 py-0.2 rounded">${proj.price} AUD</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{proj.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex flex-col gap-2">
                  <button 
                    onClick={() => openChatWithUser(selectedGuide.name, selectedGuide.avatar, `你好！我是本地向导 ${selectedGuide.name}，很高兴在 Serene 平台为你提供落地协助，有什么可以帮到你？`)}
                    className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white font-black text-xs rounded-xl py-3 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>立即对话沟通 (在线聊天)</span>
                  </button>
                  <button 
                    onClick={() => { triggerNotification(`📅 已向向导 ${selectedGuide.name} 发送带逛需求简报！对方确认接单后，在 Serene 进行安全托管付款即可。`); }}
                    className="w-full bg-white hover:bg-gray-50 border border-[#1d1d1f] text-[#1d1d1f] font-bold text-xs rounded-xl py-3 transition-colors"
                  >
                    确定预约带逛
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC MEAL DETAILS */}
            {selectedMeal && !selectedGuide && !selectedItem && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-extrabold text-gray-950 text-base">{selectedMeal.dishName}</h4>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">大厨：{selectedMeal.chefName} ({selectedMeal.cuisine})</span>
                  </div>
                  <span className="text-lg font-black font-mono text-ink shrink-0">${selectedMeal.price}</span>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-3 text-xs leading-relaxed text-gray-600 font-semibold">
                  “ {selectedMeal.description} ”
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">🔒 拼饭精准公寓地址物理门牌：</span>
                  {selectedMeal.isUnlocked ? (
                    <div className="bg-surface-soft text-ink border border-hairline p-3.5 rounded-2xl text-xs font-bold space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-ink animate-bounce" />
                        <span>已安全解锁地址 ➜</span>
                      </div>
                      <p className="font-mono text-xs">{selectedMeal.preciseAddress}</p>
                    </div>
                  ) : (
                    <div className="bg-neutral-100 border border-gray-200 p-3.5 rounded-2xl text-xs text-gray-500 font-black flex flex-col items-center justify-center text-center space-y-1.5">
                      <Lock size={16} className="text-primary" />
                      <span>地址已被加密隐藏保护</span>
                      <p className="text-[10px] font-medium text-gray-400">为了防止线下直接蹲守恐吓或骚扰，支付预定金额解锁高精门房！</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {!selectedMeal.isUnlocked ? (
                    <button 
                      onClick={() => setCheckoutMealId(selectedMeal.id)}
                      className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white font-black text-xs rounded-xl py-3 shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart size={14} />
                      <span>立即搭伙拼饭解锁定位 (${selectedMeal.price})</span>
                    </button>
                  ) : (
                    <div className="bg-surface-soft text-ink p-2.5 rounded-2xl text-xs font-black text-center">
                      ✓ 已解锁！由于您成功订餐，上方公寓精确信息已显形。
                    </div>
                  )}
                  <button 
                    onClick={() => openChatWithUser(selectedMeal.chefName, selectedMeal.chefAvatar, `你好！我是大厨 ${selectedMeal.chefName}，今天的菜品配料新鲜干净，你要来拼饭吗？`)}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} />
                    <span>找大厨私聊</span>
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC MARKET ITEM REVIEW */}
            {selectedItem && !selectedGuide && !selectedMeal && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-extrabold text-gray-950 text-base">{selectedItem.title}</h4>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">卖家：{selectedItem.sellerName} (成色：{selectedItem.condition})</span>
                  </div>
                  <span className="text-lg font-black font-mono text-ink text-right shrink-0">${selectedItem.price}</span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl text-xs leading-relaxed text-gray-600 font-semibold">
                  “ {selectedItem.description} ”
                </div>

                {/* AI PRICE CHECK VALUATION REPORT */}
                {priceCheckResults[selectedItem.id] && (
                  <div className={`border rounded-3xl p-4 space-y-3 shadow-sm animate-in slide-in-from-top-3 duration-300 ${
                    priceCheckResults[selectedItem.id].verdict === '划算'
                      ? 'bg-surface-soft/70 border-hairline text-ink'
                      : priceCheckResults[selectedItem.id].verdict === '偏贵'
                      ? 'bg-red-50/70 border-red-300 text-red-955'
                      : 'bg-amber-50/70 border-amber-300 text-amber-955'
                  }`}>
                    <div className="flex items-center justify-between font-black text-xs">
                      <div className="flex items-center gap-1.5">
                        <Zap size={14} className="animate-pulse text-amber-700" />
                        <span>🛡️ Serene AI 全澳智能比价验价</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        priceCheckResults[selectedItem.id].verdict === '划算'
                          ? 'bg-surface-soft text-ink'
                          : priceCheckResults[selectedItem.id].verdict === '偏贵'
                          ? 'bg-red-200 text-red-850'
                          : 'bg-amber-200 text-amber-850'
                      }`}>
                        {priceCheckResults[selectedItem.id].verdict}
                      </span>
                    </div>

                    <div className="text-[10px] bg-white/95 border border-gray-150 p-3.5 rounded-2xl space-y-2.5 leading-relaxed text-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold uppercase block">🇦🇺 澳洲官方全新参考价</span>
                          <span className="font-extrabold text-gray-900 text-xs font-mono">{priceCheckResults[selectedItem.id].newPrice}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold uppercase block">🇦🇺 澳洲二手合理评估价</span>
                          <span className="font-extrabold text-ink text-xs font-mono">{priceCheckResults[selectedItem.id].fairUsedPrice}</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-150 pt-2">
                        <span className="text-[9px] text-gray-400 font-extrabold block">AI 全网数据差分推理：</span>
                        <p className="mt-0.5 text-[10px] font-bold text-gray-800 leading-relaxed">{priceCheckResults[selectedItem.id].reasoning}</p>
                      </div>

                      <div className="border-t border-dashed border-gray-150 pt-2 bg-gradient-to-r from-amber-50 to-transparent p-1.5 rounded-lg">
                        <span className="text-[9px] text-amber-800 font-black flex items-center gap-0.5 uppercase">
                          ⌛ 澳洲法定低保时薪痛感换算：
                        </span>
                        <p className="mt-0.5 text-[10px] font-black text-amber-900 leading-snug">
                          {priceCheckResults[selectedItem.id].painConversion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Secure mechanism status display */}
                <div className="bg-surface-soft/50 border border-hairline p-4 rounded-2xl text-xs space-y-2">
                  <span className="text-[10px] font-black text-ink uppercase tracking-widest block">平台货款托管保险状态：</span>
                  {selectedItem.secureStatus === 'available' && (
                    <div className="text-gray-600 flex items-start gap-1.5">
                      <Shield size={16} className="text-ink shrink-0 mt-0.5" />
                      <span><strong>平台保驾护航：</strong> 随时可以点击锁定货款。面交并检查没有任何猫腻之后再行释放放款。</span>
                    </div>
                  )}
                  {selectedItem.secureStatus === 'locked_escrow' && (
                    <div className="space-y-2">
                      <div className="text-amber-800 bg-amber-100/50 p-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5">
                        <Lock size={14} className="animate-bounce" />
                        <span>担保货款 ${selectedItem.price} 锁定在 Serene 托管金库</span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        您已支付托管，请线下放心对接。面交或在包裹核准完毕后，若一切完美无瑕，点击下方放货结算。
                      </p>
                      <button 
                        onClick={() => handleMarketItemReleaseFunds(selectedItem.id)}
                        className="w-full bg-primary hover:bg-primary text-white font-black text-xs py-2 rounded-xl transition-all"
                      >
                        ✓ 确认面交无误 · 释放放款
                      </button>
                    </div>
                  )}
                  {selectedItem.secureStatus === 'completed' && (
                    <div className="text-gray-500 flex items-center gap-1 text-xs font-bold text-center justify-center p-2 bg-gray-150 rounded-xl">
                      <Check size={14} className="text-ink" />
                      <span>交易已安全划定并完成划拨结算。</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {selectedItem.secureStatus === 'available' && (
                    <button 
                      onClick={() => setCheckoutItemId(selectedItem.id)}
                      className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white font-black text-xs rounded-xl py-3 shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lock size={14} />
                      <span>一键锁定货款担保 (${selectedItem.price})</span>
                    </button>
                  )}
                  <button 
                    onClick={() => openChatWithUser(selectedItem.sellerName, selectedItem.sellerAvatar, `你好！我是卖家 ${selectedItem.sellerName}，吹风机/微波炉等现在都保养得极好，你需要在哪个地方见面？我们随时可以交易。`)}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} />
                    <span>与卖家在线聊聊面交/运费</span>
                  </button>
                </div>
              </div>
            )}

            {/* Clear selection drawer */}
            {(selectedGuide || selectedMeal || selectedItem) && (
              <button 
                onClick={() => { setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* 2. Interactive Instant Chat Console Simulator */}
          <AnimatePresence>
            {activeChatUser && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-neutral-900 text-white rounded-3xl p-5 shadow-xl border border-neutral-800 relative space-y-4"
              >
                {/* Chat header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-3.5">
                    <img src={chatAvatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-white/20" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1">
                        <span>{activeChatUser}</span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                      </h4>
                      <span className="text-[9px] text-gray-400 block font-bold leading-none uppercase tracking-wide">Serene 在线微聊天</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActiveChatUser(null); }}
                    className="text-gray-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Messages body */}
                <div className="h-44 overflow-y-auto space-y-3 pr-1 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${msg.sender === 'user' ? 'bg-[#ff5a3c] text-neutral-950 font-bold rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none font-medium'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-gray-500 mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Input form */}
                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5">
                  <input 
                    type="text" 
                    placeholder="说点什么（回车/发送）..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                    className="flex-1 bg-transparent px-2 text-xs font-semibold focus:outline-none placeholder-gray-400"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="bg-[#ff5a3c] hover:bg-yellow-500 text-neutral-950 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer"
                  >
                    发送
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* APPLE PAY / ESCROW checkout simulation modular overlays */}
      <AnimatePresence>
        {checkoutMealId !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border shadow-2xl relative space-y-5"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-[#ff5a3c]/10 text-[#ff5a3c] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Utensils size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900">Serene 拼餐安全支付中介</h3>
                <p className="text-xs text-gray-500 mt-1">资金将锁定在 Serene 安全保险金库内，在约期用食体验结束后结算</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">大厨拼盘</span>
                  <span className="font-extrabold text-gray-800">
                    {meals.find(m => m.id === checkoutMealId)?.dishName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">地区范围</span>
                  <span className="font-bold text-gray-700">
                    {meals.find(m => m.id === checkoutMealId)?.suburb}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-sm font-black">
                  <span>实付定金</span>
                  <span className="text-ink font-mono">
                    ${meals.find(m => m.id === checkoutMealId)?.price} AUD
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCheckoutMealId(null)}
                  className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl py-3 text-xs font-bold transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleMealPay(checkoutMealId)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl py-3 text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock size={12} />
                  <span>安全支付</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutItemId !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border shadow-2xl relative space-y-5"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-surface-soft text-ink rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900">Serene 二手货款托管保险</h3>
                <p className="text-xs text-gray-500 mt-1">货款安全停留在 Serene 官方托管保险大仓内，面交验货完全没有猫腻后再行放款</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">订购闲置宝贝</span>
                  <span className="font-extrabold text-gray-800 truncate max-w-[200px]">
                    {marketItems.find(i => i.id === checkoutItemId)?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">折旧状态</span>
                  <span className="font-bold text-ink">
                    {marketItems.find(i => i.id === checkoutItemId)?.condition}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-sm font-black">
                  <span>担保金</span>
                  <span className="text-ink font-mono">
                    ${marketItems.find(i => i.id === checkoutItemId)?.price} AUD
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCheckoutItemId(null)}
                  className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl py-3 text-xs font-bold transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleMarketItemBuyAndLock(checkoutItemId)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl py-3 text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock size={12} />
                  <span>货款锁仓</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Floating Shopping Cart Sidebar Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-[#1d1d1f] hover:bg-neutral-800 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative border-2 border-white cursor-pointer"
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-[#1d1d1f]">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Shopping Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sliding Panel */}
            <div className="absolute inset-y-0 right-0 max-w-md w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full bg-[#FAF8F5] shadow-2xl flex flex-col h-full border-l border-gray-200"
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 bg-[#1d1d1f] text-white flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart size={18} className="text-on-dark" />
                    <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                      <span>Serene 安全防坑购物车</span>
                      <span className="text-[10px] bg-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {cart.length}件
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Info message */}
                <div className="bg-surface-soft px-6 py-3 border-b text-ink text-[11px] leading-relaxed flex items-center gap-2">
                  <Shield size={13} className="shrink-0 text-ink" />
                  <span>您添加的任何项目均享有 Serene 双向资金托管托管政策保护。</span>
                </div>

                {/* Cart list body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                        <ShoppingCart size={32} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-800">购物车还空空如也呢</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                          点选顶部的“本地专业向导”、“留学生大厨私厨”或“闲置流转”，轻按加购物车加锁交易。
                        </p>
                      </div>
                    </div>
                  ) : (
                    cart.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs flex justify-between gap-3 relative overflow-hidden transition-all hover:border-gray-300"
                      >
                        <div className="flex gap-3">
                          {/* Item Thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                            <img
                              src={c.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=120'}
                              alt={c.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-[9px] font-black uppercase text-[#1d1d1f] bg-[#1d1d1f]/10 px-1.5 py-0.5 rounded self-start leading-none mb-1">
                              {c.type === 'guide_project' ? '向导陪同' : c.type === 'meal' ? '大厨拼盘' : '二手闲置'}
                            </span>
                            <h4 className="text-xs font-black text-gray-900 truncate leading-tight pr-4">
                              {c.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate leading-none">
                              {c.subtitle} {c.suburb ? `· ${c.suburb}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between shrink-0">
                          <span className="font-mono text-xs font-black text-[#1d1d1f]">
                            ${c.price} AUD
                          </span>
                          <button
                            onClick={() => removeFromCart(c.originId, c.type)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                            title="从购物车中移除"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Billing Summary & Pay Button */}
                {cart.length > 0 && (
                  <div className="bg-white border-t border-gray-150 p-6 space-y-4 shadow-inner">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>商品总额</span>
                        <span className="font-mono">${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)} AUD</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Serene 专属交易保险金</span>
                        <span className="text-ink font-bold">免手续费 $0.00</span>
                      </div>
                      <hr className="border-gray-100" />
                      <div className="flex justify-between text-sm font-black text-gray-950">
                        <span>托管结算总计</span>
                        <span className="text-ink font-mono text-base">
                          ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)} AUD
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setIsCartCheckingOut(true);
                          setTimeout(() => {
                            handleCartCheckout();
                          }, 1600);
                        }}
                        disabled={isCartCheckingOut}
                        className="w-full bg-[#1d1d1f] hover:bg-neutral-850 disabled:bg-neutral-300 text-white rounded-xl py-3.5 text-xs font-black tracking-wide shadow-md hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isCartCheckingOut ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
                            <span>安全保险锁仓中...</span>
                          </span>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>一键申请 Serene 双向资金托管 🛡️</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-gray-600 py-1 transition cursor-pointer"
                      >
                        清空购物车
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
