import React, { useState, useEffect } from 'react';
import { 
  Compass, User, Users, Map, Utensils, ShoppingBag, ArrowRight, Zap, 
  Image as ImageIcon, DollarSign, MessageSquare, Plus, Check, Star, 
  Shield, Lock, MapPin, Search, ChevronRight, X, AlertCircle, ShoppingCart, Trash2, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== '';
import { useLocale } from '../lib/locale';
import { useT, type StringKey } from '../lib/i18n';
import FallbackNotice from './FallbackNotice';
import EcoTools from './EcoTools';
import MeetupPlanner from './MeetupPlanner';
import DaigouBoard from './DaigouBoard';
import CommunityRadar from './CommunityRadar';

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

type TFn = (key: StringKey, vars?: Record<string, string | number>) => string;

const buildDefaultGuides = (t: TFn): Guide[] => [
  {
    id: 'g-1',
    name: t('eh_g1_name'),
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    university: t('eh_uni_unimelb'),
    major: t('eh_g1_major'),
    year: t('eh_year_pg23'),
    rating: 4.9,
    suburb: 'Carlton',
    bio: t('eh_g1_bio'),
    projects: [
      { name: t('eh_g1_p1_name'), price: 39, desc: t('eh_g1_p1_desc') },
      { name: t('eh_g1_p2_name'), price: 59, desc: t('eh_g1_p2_desc') }
    ]
  },
  {
    id: 'g-2',
    name: t('eh_g2_name'),
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    university: t('eh_uni_monash'),
    major: 'Master of Commerce',
    year: t('eh_year_pg1'),
    rating: 4.8,
    suburb: 'Clayton',
    bio: t('eh_g2_bio'),
    projects: [
      { name: t('eh_g2_p1_name'), price: 19, desc: t('eh_g2_p1_desc') },
      { name: t('eh_g2_p2_name'), price: 29, desc: t('eh_g2_p2_desc') }
    ]
  },
  {
    id: 'g-3',
    name: t('eh_g3_name'),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    university: t('eh_uni_rmit'),
    major: t('eh_g3_major'),
    year: t('eh_year_ug34'),
    rating: 4.7,
    suburb: 'Melbourne CBD',
    bio: t('eh_g3_bio'),
    projects: [
      { name: t('eh_g3_p1_name'), price: 45, desc: t('eh_g3_p1_desc') },
      { name: t('eh_g3_p2_name'), price: 29, desc: t('eh_g3_p2_desc') }
    ]
  },
  {
    id: 'g-4',
    name: t('eh_g4_name'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    university: t('eh_uni_deakin'),
    major: t('eh_g4_major'),
    year: t('eh_year_grad'),
    rating: 4.9,
    suburb: 'Burwood',
    bio: t('eh_g4_bio'),
    projects: [
      { name: t('eh_g4_p1_name'), price: 25, desc: t('eh_g4_p1_desc') },
      { name: t('eh_g4_p2_name'), price: 49, desc: t('eh_g4_p2_desc') }
    ]
  },
  {
    id: 'g-5',
    name: t('eh_g5_name'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    university: t('eh_uni_unimelb'),
    major: t('eh_g5_major'),
    year: t('eh_year_pg1'),
    rating: 5.0,
    suburb: 'Parkville',
    bio: t('eh_g5_bio'),
    projects: [
      { name: t('eh_g5_p1_name'), price: 35, desc: t('eh_g5_p1_desc') },
      { name: t('eh_g5_p2_name'), price: 79, desc: t('eh_g5_p2_desc') }
    ]
  }
];

const buildDefaultMeals = (t: TFn): MealPost[] => [
  {
    id: 'm-1',
    dishName: t('eh_m1_dish'),
    chefName: t('eh_m1_chef'),
    chefAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    cuisine: t('eh_m1_cuisine'),
    price: 18.5,
    type: 'cooking',
    description: t('eh_m1_desc'),
    suburb: t('eh_m1_suburb'),
    preciseAddress: 'Room 502, 168 Lygon St, Carlton VIC 3053',
    isUnlocked: false,
    maxSeats: 8,
    joinedCount: 3,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-2',
    dishName: t('eh_m2_dish'),
    chefName: t('eh_m2_chef'),
    chefAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    cuisine: t('eh_m2_cuisine'),
    price: 15,
    type: 'sharing',
    description: t('eh_m2_desc'),
    suburb: t('eh_m2_suburb'),
    preciseAddress: 'Apartment 12A, 250 Elizabeth St, Melbourne VIC 3000',
    isUnlocked: false,
    maxSeats: 6,
    joinedCount: 5,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-3',
    dishName: t('eh_m3_dish'),
    chefName: t('eh_m3_chef'),
    chefAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    cuisine: t('eh_m3_cuisine'),
    price: 16.5,
    type: 'cooking',
    description: t('eh_m3_desc'),
    suburb: t('eh_m3_suburb'),
    preciseAddress: 'Unit 3, 25 Carrington Rd, Box Hill VIC 3128',
    isUnlocked: false,
    maxSeats: 10,
    joinedCount: 4,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-4',
    dishName: t('eh_m4_dish'),
    chefName: t('eh_m4_chef'),
    chefAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    cuisine: t('eh_m4_cuisine'),
    price: 22,
    type: 'sharing',
    description: t('eh_m4_desc'),
    suburb: t('eh_m4_suburb'),
    preciseAddress: '12 Kingsway, Glen Waverley VIC 3150',
    isUnlocked: false,
    maxSeats: 8,
    joinedCount: 6,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400'
  }
];

const buildDefaultItems = (t: TFn): MarketplaceItem[] => [
  {
    id: 'i-1',
    title: t('eh_i1_title'),
    price: 35,
    condition: '99新',
    description: t('eh_i1_desc'),
    suburb: 'Carlton',
    category: '生活用品',
    sellerName: t('eh_i1_seller'),
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-2',
    title: t('eh_i2_title'),
    price: 15,
    condition: '全新',
    description: t('eh_i2_desc'),
    suburb: 'Melbourne CBD',
    category: '教材资料',
    sellerName: t('eh_i2_seller'),
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-3',
    title: t('eh_i3_title'),
    price: 180,
    condition: '90新',
    description: t('eh_i3_desc'),
    suburb: 'Clayton',
    category: '生活用品',
    sellerName: t('eh_i3_seller'),
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-4',
    title: t('eh_i4_title'),
    price: 20,
    condition: '全新',
    description: t('eh_i4_desc'),
    suburb: 'Footscray',
    category: '生活用品',
    sellerName: t('eh_i4_seller'),
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-5',
    title: t('eh_i5_title'),
    price: 320,
    condition: '90新',
    description: t('eh_i5_desc'),
    suburb: 'Melbourne CBD',
    category: '数码',
    sellerName: t('eh_i5_seller'),
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-6',
    title: t('eh_i6_title'),
    price: 95,
    condition: '85新',
    description: t('eh_i6_desc'),
    suburb: 'Brunswick',
    category: '其他',
    sellerName: t('eh_i6_seller'),
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    secureStatus: 'available',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400'
  }
];

export default function EcosystemHub() {
  const { country, language, region } = useLocale();
  const t = useT();

  // Display labels for the Chinese enum literals that stay in the data model / API contract.
  const verdictLabel = (v: string) => v === '划算' ? t('eh_verdict_deal') : v === '偏贵' ? t('eh_verdict_pricey') : t('eh_verdict_fair');
  const conditionLabel = (c: string) => c === '全新' ? t('eh_cond_short_new') : c === '90新' ? t('eh_cond_short_90') : c === '85新' ? t('eh_cond_short_85') : t('eh_cond_short_99');

  const [activeTab, setActiveTab] = useState<'guides' | 'private_chef' | 'marketplace' | 'daigou' | 'community' | 'tools'>('guides');

  // Multi-tab role toggling
  const [guideRole, setGuideRole] = useState<'student' | 'guide'>('student');
  const [chefRole, setChefRole] = useState<'buy' | 'sell'>('buy');
  const [marketRole, setMarketRole] = useState<'buy' | 'sell'>('buy');

  // Dynamic state loaded from local storage or pre-seeded defaults
  const [guides, setGuides] = useState<Guide[]>(() => {
    const saved = localStorage.getItem('serene_eco_guides_v2');
    return saved ? JSON.parse(saved) : buildDefaultGuides(t);
  });

  const [meals, setMeals] = useState<MealPost[]>(() => {
    const saved = localStorage.getItem('serene_eco_meals_v2');
    return saved ? JSON.parse(saved) : buildDefaultMeals(t);
  });

  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>(() => {
    const saved = localStorage.getItem('serene_eco_items_v2');
    return saved ? JSON.parse(saved) : buildDefaultItems(t);
  });

  // Save states to localstorage on change
  useEffect(() => {
    localStorage.setItem('serene_eco_guides_v2', JSON.stringify(guides));
  }, [guides]);

  useEffect(() => {
    localStorage.setItem('serene_eco_meals_v2', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('serene_eco_items_v2', JSON.stringify(marketItems));
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
      triggerNotification(t('eh_n_cart_dup'));
      return;
    }
    setCart(prev => [...prev, item]);
    triggerNotification(t('eh_n_cart_added', { title: item.title }));
  };

  const removeFromCart = (originId: string, type: 'guide_project' | 'meal' | 'marketplace_item') => {
    setCart(prev => prev.filter(c => !(c.originId === originId && c.type === type)));
    triggerNotification(t('eh_n_cart_removed'));
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
        openChatWithUser(guideItem.subtitle, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', t('eh_chat_guide_checkout', { title: guideItem.title }));
      }, 1500);
    }

    triggerNotification(t('eh_n_checkout_locked'));
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
  const [createGuideUniv, setCreateGuideUniv] = useState(() => t('eh_uni_unimelb'));
  const [createGuideMajor, setCreateGuideMajor] = useState('');
  const [createGuideYear, setCreateGuideYear] = useState(() => t('eh_year_ug34'));
  const [createGuideSuburb, setCreateGuideSuburb] = useState('');
  const [createGuideBio, setCreateGuideBio] = useState('');
  const [createGuideProject1, setCreateGuideProject1] = useState(() => t('eh_guide_seed_proj'));
  const [createGuidePrice1, setCreateGuidePrice1] = useState('25');
  const [createGuideDesc1, setCreateGuideDesc1] = useState(() => t('eh_guide_seed_desc'));

  // Private Chef posting state
  const [postDishName, setPostDishName] = useState('');
  const [postDishPrice, setPostDishPrice] = useState('');
  const [postDishType, setPostDishType] = useState<'cooking' | 'sharing'>('cooking');
  const [postCuisine, setPostCuisine] = useState(() => t('eh_pm_cuisine_default'));
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
    isQuotaFallback?: boolean;
  }>>({});

  // 瞬时处境匹配 (Companion Instant Matching)
  const [situationQuery, setSituationQuery] = useState('');
  const [companionMatchLoading, setCompanionMatchLoading] = useState(false);
  const [matchedGuideIds, setMatchedGuideIds] = useState<string[]>([]);
  const [matchReason, setMatchReason] = useState<string | null>(null);
  const [matchChecklist, setMatchChecklist] = useState<string[]>([]);
  const [matchIsFallback, setMatchIsFallback] = useState(false);
  // Which model actually answered ('gemma' on the live Gemini/Gemma split, null on fallback).
  // Surfaced as a small badge so we can verify on stage that Gemma really ran — and show the split.
  const [matchModel, setMatchModel] = useState<string | null>(null);

  // 临期食材/小票菜谱 (Kitchen Budget Recipe)
  const [recipePreview, setRecipePreview] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<{
    ingredients: string[];
    recipes: { name: string; steps: string[]; cost: string }[];
    savingComparison: string;
    isQuotaFallback?: boolean;
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
      triggerNotification(t('eh_n_price_done', { title, verdict: verdictLabel(data.verdict) }));
    } catch (err) {
      console.error(err);
      triggerNotification(t('eh_n_price_fail'));
      setPriceCheckResults(prev => ({
        ...prev,
        [itemId]: {
          verdict: '合理',
          newPrice: t('eh_pc_fb_newprice'),
          fairUsedPrice: '$15 - $25 AUD',
          reasoning: t('eh_pc_fb_reasoning'),
          painConversion: t('eh_pc_fb_pain'),
          loading: false
        }
      }));
    }
  };

  // 2. 瞬时处境 matching
  const handleCompanionMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationQuery.trim()) {
      triggerNotification(t('eh_n_match_need'));
      return;
    }
    setCompanionMatchLoading(true);
    setMatchedGuideIds([]);
    setMatchReason(null);
    setMatchChecklist([]);
    setMatchIsFallback(false);
    setMatchModel(null);

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
      setMatchIsFallback(!!data.isQuotaFallback);
      setMatchModel(data.isQuotaFallback ? null : (data._model ?? null));

      // Select the first matched guide automatically to focus details and guide student better!
      if (data.matchedGuideIds && data.matchedGuideIds.length > 0) {
        const found = guides.find(g => g.id === data.matchedGuideIds[0]);
        if (found) {
          setSelectedGuide(found);
          setSelectedItem(null);
          setSelectedMeal(null);
        }
      }
      
      triggerNotification(t('eh_n_match_done'));
    } catch (err) {
      console.error(err);
      triggerNotification(t('eh_n_match_fail'));
      setMatchedGuideIds(['g-1']);
      setMatchReason(t('eh_match_fb_reason'));
      setMatchChecklist([
        t('eh_match_fb_1'),
        t('eh_match_fb_2'),
        t('eh_match_fb_3')
      ]);
      setMatchIsFallback(true);
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
      triggerNotification(t('eh_n_recipe_done'));
    } catch (err) {
      console.error(err);
      triggerNotification(t('eh_n_recipe_fail'));
      setRecipeResult({
        ingredients: [t('eh_rc_fb_ing1'), t('eh_rc_fb_ing2'), t('eh_rc_fb_ing3'), t('eh_rc_fb_ing4')],
        recipes: [
          {
            name: t('eh_rc_fb_r1_name'),
            steps: [t('eh_rc_fb_r1_s1'), t('eh_rc_fb_r1_s2'), t('eh_rc_fb_r1_s3')],
            cost: t('eh_rc_fb_r1_cost')
          },
          {
            name: t('eh_rc_fb_r2_name'),
            steps: [t('eh_rc_fb_r2_s1'), t('eh_rc_fb_r2_s2'), t('eh_rc_fb_r2_s3')],
            cost: t('eh_rc_fb_r2_cost')
          }
        ],
        savingComparison: t('eh_rc_fb_saving'),
        isQuotaFallback: true
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
      triggerNotification(t('eh_n_preset_fail'));
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
      { sender: 'other', text: initialMessage || t('eh_chat_greeting', { name }), time: t('eh_time_now') }
    ]);
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !activeChatUser) return;
    const sentMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: sentMsg, time: t('eh_time_now') }]);
    setChatInput('');

    // Simulated instant reply
    setTimeout(() => {
      let responseText = t('eh_chat_reply_default');
      if (sentMsg.includes('饭') || sentMsg.includes('拼')) {
        responseText = t('eh_chat_reply_meal');
      } else if (sentMsg.includes('面交') || sentMsg.includes('多少')) {
        responseText = t('eh_chat_reply_item');
      }
      setChatMessages(prev => [...prev, { sender: 'other', text: responseText, time: t('eh_time_now') }]);
    }, 1000);
  };

  // Form submit handlers
  const handleRegisterGuideProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createGuideName || !createGuideMajor || !createGuideSuburb) {
      triggerNotification(t('eh_n_guide_incomplete'));
      return;
    }
    const newGuide: Guide = {
      id: `g-custom-${Date.now()}`,
      name: t('eh_guide_me_suffix', { name: createGuideName }),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
      university: createGuideUniv,
      major: createGuideMajor,
      year: createGuideYear,
      rating: 5.0,
      suburb: createGuideSuburb,
      bio: createGuideBio || t('eh_guide_default_bio'),
      projects: [
        {
          name: createGuideProject1 || t('eh_guide_default_proj'),
          price: parseFloat(createGuidePrice1) || 20,
          desc: createGuideDesc1 || t('eh_guide_default_desc')
        }
      ],
      isCustom: true
    };
    setGuides(prev => [newGuide, ...prev]);
    triggerNotification(t('eh_n_guide_created'));
    setGuideRole('student'); // focus back
  };

  const handlePublishMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDishName || !postDishPrice || !postSuburb || !postPreciseAddress) {
      triggerNotification(t('eh_n_meal_incomplete'));
      return;
    }
    const newMeal: MealPost = {
      id: `m-custom-${Date.now()}`,
      dishName: postDishName,
      chefName: t('eh_meal_my_chef'),
      chefAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      cuisine: postCuisine,
      price: parseFloat(postDishPrice),
      type: postDishType,
      description: postDescription || t('eh_meal_default_desc'),
      suburb: t('eh_meal_suburb_suffix', { suburb: postSuburb }),
      preciseAddress: postPreciseAddress,
      isUnlocked: true, // Auto unlocked for creator
      maxSeats: 8,
      joinedCount: 1,
      isCustom: true,
      image: postDishImage
    };
    setMeals(prev => [newMeal, ...prev]);
    triggerNotification(t('eh_n_meal_published', { name: postDishName }));
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
      triggerNotification(t('eh_n_item_incomplete'));
      return;
    }
    const newItem: MarketplaceItem = {
      id: `i-custom-${Date.now()}`,
      title: itemTitle,
      price: parseFloat(itemPrice),
      condition: itemCondition,
      description: itemDesc || t('eh_item_default_desc'),
      suburb: itemSuburb,
      category: itemCategory,
      sellerName: t('eh_item_my_seller'),
      sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
      secureStatus: 'available',
      isCustom: true,
      image: postItemImage
    };
    setMarketItems(prev => [newItem, ...prev]);
    triggerNotification(t('eh_n_item_published'));
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
    triggerNotification(t('eh_n_meal_paid'));
    setCheckoutMealId(null);
    // Find the unlocked meal and auto update selected view
    const updated = meals.find(m => m.id === id);
    if (updated) {
      setSelectedMeal({ ...updated, isUnlocked: true });
    }
  };

  const handleMarketItemBuyAndLock = (id: string) => {
    setMarketItems(prev => prev.map(i => i.id === id ? { ...i, secureStatus: 'locked_escrow' } : i));
    triggerNotification(t('eh_n_item_locked'));
    setCheckoutItemId(null);
    const updated = marketItems.find(i => i.id === id);
    if (updated) {
      setSelectedItem({ ...updated, secureStatus: 'locked_escrow' });
    }
  };

  const handleMarketItemReleaseFunds = (id: string) => {
    setMarketItems(prev => prev.map(i => i.id === id ? { ...i, secureStatus: 'completed' } : i));
    triggerNotification(t('eh_n_item_released'));
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
              <span>{t('eh_hero_badge')}</span>
            </div>
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide">
              {t('eh_hero_roadmap')}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1d1d1f] tracking-tight">
            {t('eh_hero_title')}
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            {t('eh_hero_desc_1')}<strong>{t('eh_hero_desc_strong1')}</strong>{t('eh_hero_desc_2')}<strong className="text-amber-700">{t('eh_hero_desc_strong2')}</strong>{t('eh_hero_desc_3')}<strong className="text-ink">{t('eh_hero_desc_strong3')}</strong>{t('eh_hero_desc_4')}
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
          <span>{t('eh_tab_companion')}</span>
          <span className="ml-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">{t('eh_concept_badge')}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('private_chef'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'private_chef' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <Utensils size={18} />
          <span>{t('eh_tab_kitchen')}</span>
          <span className="ml-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">{t('eh_concept_badge')}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('marketplace'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'marketplace' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <ShoppingBag size={18} />
          <span>{t('eh_tab_market')}</span>
          <span className="ml-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">{t('eh_concept_badge')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('daigou'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'daigou' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <span>📦</span>
          <span>{t('eh_tab_daigou')}</span>
          <span className="ml-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">{t('eh_concept_badge')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('community'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'community' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <span>📡</span>
          <span>社区雷达</span>
          <span className="ml-0.5 text-[9px] font-bold text-ink bg-surface-soft px-1.5 py-0.5 rounded-full">{t('eh_live_badge')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('tools'); setSelectedGuide(null); setSelectedMeal(null); setSelectedItem(null); }}
          className={`px-5 py-3 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'tools' ? 'border-b-4 border-[#1d1d1f] text-[#1d1d1f] bg-white bg-opacity-50' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <span>🧰</span>
          <span>{t('eh_tab_tools')}</span>
          <span className="ml-0.5 text-[9px] font-bold text-ink bg-surface-soft px-1.5 py-0.5 rounded-full">{t('eh_live_badge')}</span>
        </button>
      </div>

      {activeTab !== 'tools' && activeTab !== 'community' && (
        <div className="mb-6 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-base leading-none mt-0.5">🧪</span>
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            <strong>{t('eh_concept_banner_strong1')}</strong>{t('eh_concept_banner_1')}<strong>{t('eh_concept_banner_strong2')}</strong>{t('eh_concept_banner_2')}
          </p>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <EcoTools />
        </div>
      )}

      {activeTab === 'daigou' && <DaigouBoard />}

      {activeTab === 'community' && <CommunityRadar />}

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
                    {t('eh_role_find_guide')}
                  </button>
                  <button
                    onClick={() => setGuideRole('guide')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${guideRole === 'guide' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {t('eh_role_be_guide')}
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
                      placeholder={t('eh_guide_search_ph')}
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
                          <span>{t('eh_match_title')}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">{t('eh_match_pill')}</span>
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          {t('eh_match_desc')}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCompanionMatch} className="space-y-3">
                      <textarea
                        rows={2}
                        value={situationQuery}
                        onChange={e => setSituationQuery(e.target.value)}
                        placeholder={t('eh_match_textarea_ph')}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]/55 focus:border-[#1d1d1f]/60 placeholder-gray-400 leading-relaxed shadow-xs"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                          <Shield size={11} className="text-ink" />
                          <span>{t('eh_match_note')}</span>
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
                          <span>{companionMatchLoading ? t('eh_match_loading') : t('eh_match_btn')}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {filteredGuides.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-3xl text-gray-400">
                      {t('eh_guide_empty')}
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
                                        {t('eh_guide_ai_pick')}
                                      </span>
                                    )}
                                    {g.isCustom && <span className="bg-surface-soft text-ink text-[9px] font-black px-1 py-0.2 rounded shrink-0">{t('eh_badge_me')}</span>}
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
                                      title={t('eh_add_cart_title')}
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
                              {g.suburb} {t('eh_guide_active')}
                            </span>
                            <div className="inline-flex items-center text-xs font-bold text-[#1d1d1f] group">
                              <span>{t('eh_guide_view_plan')}</span>
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
                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('eh_cg_title')}</h3>
                    <p className="text-xs text-on-warning-light text-gray-500 leading-relaxed mb-4">
                      {t('eh_cg_desc')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_cg_name_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_cg_name_ph')}
                        required
                        value={createGuideName}
                        onChange={e => setCreateGuideName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_cg_univ_label')}</label>
                      <select
                        value={createGuideUniv}
                        onChange={e => setCreateGuideUniv(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option>{t('eh_uni_unimelb')}</option>
                        <option>{t('eh_uni_monash')}</option>
                        <option>{t('eh_uni_rmit')}</option>
                        <option>{t('eh_uni_deakin')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_cg_major_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_cg_major_ph')}
                        required
                        value={createGuideMajor}
                        onChange={e => setCreateGuideMajor(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_cg_year_label')}</label>
                      <select
                        value={createGuideYear}
                        onChange={e => setCreateGuideYear(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option>{t('eh_year_ug12')}</option>
                        <option>{t('eh_year_ug34')}</option>
                        <option>{t('eh_year_pg1')}</option>
                        <option>{t('eh_year_pg23')}</option>
                        <option>{t('eh_year_grad')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_cg_suburb_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_cg_suburb_ph')}
                        required
                        value={createGuideSuburb}
                        onChange={e => setCreateGuideSuburb(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_cg_bio_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_cg_bio_ph')}
                        value={createGuideBio}
                        onChange={e => setCreateGuideBio(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-150 pt-4">
                    <span className="text-xs font-extrabold text-gray-700 block mb-3">{t('eh_cg_project_section')}</span>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase">{t('eh_cg_proj_name_label')}</label>
                          <input
                            type="text"
                            placeholder={t('eh_cg_proj_name_ph')}
                            value={createGuideProject1}
                            onChange={e => setCreateGuideProject1(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold mt-1" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase">{t('eh_cg_proj_price_label')}</label>
                          <input
                            type="number"
                            placeholder={t('eh_cg_proj_price_ph')}
                            value={createGuidePrice1}
                            onChange={e => setCreateGuidePrice1(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold mt-1" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase">{t('eh_cg_proj_desc_label')}</label>
                        <input
                          type="text"
                          placeholder={t('eh_cg_proj_desc_ph')}
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
                    {t('eh_cg_submit')}
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
                    {t('eh_chef_role_buy')}
                  </button>
                  <button
                    onClick={() => setChefRole('sell')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chefRole === 'sell' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {t('eh_chef_role_sell')}
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
                      placeholder={t('eh_chef_search_ph')}
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
                          <span>{t('eh_recipe_title')}</span>
                          <span className="text-[10px] bg-surface-soft text-ink font-extrabold px-1.5 py-0.2 rounded animate-pulse">{t('eh_recipe_pill')}</span>
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                          {t('eh_recipe_desc')}
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
                          <span className="text-[11px] font-bold text-gray-800 block">{t('eh_recipe_upload')}</span>
                          <span className="text-[9px] text-gray-400 mt-1 block">{t('eh_recipe_upload_sub')}</span>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex items-center gap-2 font-sans">
                          <span className="text-[9px] text-gray-400 font-black shrink-0">{t('eh_recipe_presets')}</span>
                          <button
                            type="button"
                            onClick={() => handleRecipeImgPreset('fridge')}
                            className="px-2.5 py-1 text-[10px] font-black bg-surface-soft hover:bg-surface-soft active:scale-95 text-ink border border-hairline rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            {t('eh_recipe_preset_fridge')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRecipeImgPreset('receipt')}
                            className="px-2.5 py-1 text-[10px] font-black bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 border border-amber-200 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            {t('eh_recipe_preset_receipt')}
                          </button>
                        </div>
                      </div>

                      {/* Loading block or Preview Report */}
                      <div className="bg-white/90 border border-gray-150 rounded-2xl p-3.5 flex flex-col justify-center min-h-[140px] relative font-sans">
                        {recipeLoading ? (
                          <div className="space-y-3 text-center my-auto animate-pulse">
                            <div className="inline-block w-8 h-8 border-4 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <div className="space-y-1">
                              <span className="text-xs font-black text-gray-900 block">{t('eh_recipe_loading1')}</span>
                              <span className="text-[9px] text-gray-450 block">{t('eh_recipe_loading2')}</span>
                            </div>
                          </div>
                        ) : recipeResult ? (
                          <div className="space-y-3 h-full overflow-y-auto max-h-[160px] text-xs leading-relaxed text-gray-700 pr-1 select-none font-semibold">
                            {recipeResult.isQuotaFallback && <FallbackNotice />}
                            <div>
                              <span className="text-[9px] text-gray-400 font-extrabold uppercase block">{t('eh_recipe_ingredients_label')}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {recipeResult.ingredients.map((ing, iIdx) => (
                                  <span key={iIdx} className="bg-surface-soft text-ink border border-hairline text-[10px] font-black px-1.5 py-0.5 rounded-lg leading-none">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-dashed border-gray-150 pt-2 space-y-2">
                              <span className="text-[9px] text-gray-400 font-extrabold uppercase block">{t('eh_recipe_recipes_label')}</span>
                              {recipeResult.recipes.map((rep, rIdx) => (
                                <div key={rIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 space-y-1">
                                  <div className="flex justify-between items-center text-[11px] font-black">
                                    <span className="text-gray-950 font-black">{rIdx + 1}. {rep.name}</span>
                                    <span className="text-ink bg-surface-soft font-mono px-1 py-0.2 rounded shrink-0">{t('eh_recipe_cost', { cost: rep.cost })}</span>
                                  </div>
                                  <ul className="list-decimal pl-3.5 text-[10px] font-bold text-gray-600 space-y-0.5">
                                    {rep.steps.map((st, sIdx) => <li key={sIdx}>{st}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-dashed border-gray-150 pt-2 bg-[#ff5a3c]/10 p-2.5 rounded-xl border border-[#ff5a3c]/20">
                              <span className="text-[9.5px] text-[#ff5a3c] font-black uppercase flex items-center gap-0.5 leading-none">
                                {t('eh_recipe_bill_label')}
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
                              <span className="text-white text-[10px] font-black">{t('eh_recipe_preview_overlay')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-xs my-auto">
                            <Utensils className="mx-auto mb-1.5 opacity-30 animate-pulse text-neutral-400" size={24} />
                            <span>{t('eh_recipe_empty')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* REAL INTERACTIVE GOOGLE MAP OR ENJOYABLE INSTRUCTIONS IF API KEY MISSING */}
                  <div className="bg-gradient-to-br from-[#ff5a3c]/10 via-[#f5f5f7] to-surface-soft/10 border border-gray-200 rounded-3xl p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-3 text-xs leading-none">
                      <span className="font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Map size={16} className="text-[#ff5a3c]" />
                        <span>{t('eh_map_title')}</span>
                      </span>
                      <span className="text-[10px] text-ink font-extrabold bg-surface-soft px-1.5 py-0.5 rounded animate-pulse">{t('eh_map_active')}</span>
                    </div>

                    {hasValidKey ? (
                      <div className="w-full h-64 rounded-2xl border border-gray-200 relative overflow-hidden shadow-inner bg-gray-100">
                        <APIProvider apiKey={API_KEY} version="weekly">
                          <GoogleMap
                            defaultCenter={{ lat: -37.8074, lng: 144.9634 }}
                            defaultZoom={14}
                            mapId="DEMO_MAP_ID"
                            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                            style={{ width: '100%', height: '100%' }}
                            gestureHandling={'cooperative'}
                          >
                            {/* Your Location Pin */}
                            <AdvancedMarker position={{ lat: -37.8074, lng: 144.9634 }} title={t('eh_map_you')}>
                              <Pin background="#1d1d1f" glyphColor="#fff" scale={1.1} />
                            </AdvancedMarker>

                            {/* Pin A: Dapanji */}
                            <AdvancedMarker 
                              position={{ lat: -37.8007, lng: 144.9669 }} 
                              title={t('eh_map_pin1')}
                              onClick={() => { const meal = meals.find(m => m.id === 'm-1'); if(meal) setSelectedMeal(meal); }}
                            >
                              <Pin background="#ff5a3c" glyphColor="#fff" glyphText="1" />
                            </AdvancedMarker>

                            {/* Pin B: Shuizhuyu */}
                            <AdvancedMarker 
                              position={{ lat: -37.8118, lng: 144.9627 }} 
                              title={t('eh_map_pin2')}
                              onClick={() => { const meal = meals.find(m => m.id === 'm-2'); if(meal) setSelectedMeal(meal); }}
                            >
                              <Pin background="#ff5a3c" glyphColor="#fff" glyphText="2" />
                            </AdvancedMarker>
                          </GoogleMap>
                        </APIProvider>
                      </div>
                    ) : (
                      <div className="w-full p-6 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-inner flex flex-col justify-center">
                        <h3 className="text-sm font-black text-amber-900 mb-1 flex items-center gap-1.5">
                          <AlertCircle size={16} className="text-amber-700" />
                          <span>Google Maps API Key Required / 需要 Google Maps 密钥</span>
                        </h3>
                        <p className="text-xs text-amber-800 leading-relaxed mb-3 font-semibold">
                          To see the active student meal map, please configure your Google Maps API key. / 要查看活跃留学生拼餐地图，请配置您的 Google Maps API 密钥。
                        </p>
                        <div className="space-y-1.5 text-[11px] text-amber-900 font-bold leading-normal">
                          <p><strong>Step 1 / 步骤 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-700">Get an API Key / 获取 API 密钥</a></p>
                          <p><strong>Step 2 / 步骤 2:</strong> Paste your key in the popup, or set <code>GOOGLE_MAPS_PLATFORM_KEY</code> in <strong>Settings (⚙️) → Secrets</strong> / 在弹窗或右上角<strong>设置 (⚙️) → 密钥 Secrets</strong> 中添加名为 <code>GOOGLE_MAPS_PLATFORM_KEY</code> 的密钥。</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* List of meals */}
                  {filteredMeals.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-3xl text-gray-400">
                      {t('eh_meal_empty')}
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
                                {m.type === 'cooking' ? t('eh_meal_type_cooking') : t('eh_meal_type_sharing')}
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
                                  <span className="text-gray-400 block leading-none mt-0.5">{t('eh_meal_cuisine_label')}{m.cuisine}</span>
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
                                title={t('eh_add_cart_title')}
                              >
                                <ShoppingCart size={11} />
                                <span>{t('eh_add_cart')}</span>
                              </button>
                              <div className="text-[10px] font-extrabold text-neutral-500 hover:text-[#1d1d1f] flex items-center">
                                <span>{t('eh_detail')}</span>
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
                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('eh_pm_title')}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      <strong>{t('eh_pm_desc_strong')}</strong>{t('eh_pm_desc_1')}<span className="text-red-650 font-bold bg-red-50 px-1 py-0.2 rounded">{t('eh_pm_desc_span')}</span>{t('eh_pm_desc_2')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_name_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_pm_name_ph')}
                        required
                        value={postDishName}
                        onChange={e => setPostDishName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_price_label')}</label>
                      <input
                        type="number"
                        placeholder={t('eh_pm_price_ph')}
                        required
                        value={postDishPrice}
                        onChange={e => setPostDishPrice(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_mode_label')}</label>
                      <select
                        value={postDishType}
                        onChange={e => setPostDishType(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option value="cooking">{t('eh_pm_mode_cooking')}</option>
                        <option value="sharing">{t('eh_pm_mode_sharing')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_cuisine_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_pm_cuisine_ph')}
                        required
                        value={postCuisine}
                        onChange={e => setPostCuisine(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_suburb_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_pm_suburb_ph')}
                        required
                        value={postSuburb}
                        onChange={e => setPostSuburb(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_addr_label')}</label>
                    <input
                      type="text"
                      placeholder={t('eh_pm_addr_ph')}
                      required
                      value={postPreciseAddress}
                      onChange={e => setPostPreciseAddress(e.target.value)}
                      className="w-full bg-orange-50/50 border border-orange-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-550 focus:border-transparent placeholder-gray-400" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_story_label')}</label>
                    <textarea
                      rows={3}
                      placeholder={t('eh_pm_story_ph')}
                      value={postDescription}
                      onChange={e => setPostDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1d1d1f] resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pm_image_label')}</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { name: t('eh_dish_dapanji'), url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400' },
                        { name: t('eh_dish_fish'), url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400' },
                        { name: t('eh_dish_dumpling'), url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400' },
                        { name: t('eh_dish_stirfry'), url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=400' },
                        { name: t('eh_dish_dessert'), url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400' },
                        { name: t('eh_dish_malatang'), url: 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?auto=format&fit=crop&q=80&w=400' }
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
                    {t('eh_pm_submit')}
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
                    {t('eh_mk_role_buy')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketRole('sell')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${marketRole === 'sell' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {t('eh_mk_role_sell')}
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
                        placeholder={t('eh_mk_search_ph')}
                        value={marketQuery}
                        onChange={e => setMarketQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-3xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/50 transition-shadow shadow-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'all', label: t('eh_mk_cat_all') },
                        { id: '生活用品', label: t('eh_mk_cat_living') },
                        { id: '数码', label: t('eh_mk_cat_digital') },
                        { id: '教材资料', label: t('eh_mk_cat_books') },
                        { id: '其他', label: t('eh_mk_cat_other') }
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
                      <strong>{t('eh_mk_trust_strong')}</strong>
                      {t('eh_mk_trust_body')}
                    </div>
                  </div>

                  {/* Listed Items Grid */}
                  {filteredItems.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-3xl text-gray-400">
                      {t('eh_mk_empty')}
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
                                  <span className="text-gray-400 block leading-none mt-0.5">{t('eh_mk_seller_star')}</span>
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
                                    ? t('eh_mk_ai_verdict', { verdict: verdictLabel(priceCheckResults[item.id].verdict) })
                                    : t('eh_mk_ai_check')}
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
                                  <span>{t('eh_add_cart')}</span>
                                </button>
                              ) : item.secureStatus === 'locked_escrow' ? (
                                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-xl text-[9px] font-black animate-pulse">
                                  {t('eh_mk_locked_badge')}
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-400 px-2 py-1 rounded-xl text-[9px] font-black">
                                  {t('eh_mk_delivered_badge')}
                                </span>
                              )}
                              <div className="text-[10px] font-extrabold text-neutral-500 hover:text-[#1d1d1f] flex items-center">
                                <span>{t('eh_detail')}</span>
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
                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('eh_pi_title')}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {t('eh_pi_desc')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pi_name_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_pi_name_ph')}
                        required
                        value={itemTitle}
                        onChange={e => setItemTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5 font-mono">{t('eh_pi_price_label')}</label>
                      <input
                        type="number"
                        placeholder={t('eh_pi_price_ph')}
                        required
                        value={itemPrice}
                        onChange={e => setItemPrice(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pi_condition_label')}</label>
                      <select
                        value={itemCondition}
                        onChange={e => setItemCondition(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option value="全新">{t('eh_cond_new')}</option>
                        <option value="99新">{t('eh_cond_99')}</option>
                        <option value="90新">{t('eh_cond_90')}</option>
                        <option value="85新">{t('eh_cond_85')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pi_category_label')}</label>
                      <select
                        value={itemCategory}
                        onChange={e => setItemCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                      >
                        <option value="生活用品">{t('eh_cat_living')}</option>
                        <option value="数码">{t('eh_cat_digital')}</option>
                        <option value="教材资料">{t('eh_pi_cat_books_long')}</option>
                        <option value="其他">{t('eh_pi_cat_other_long')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pi_suburb_label')}</label>
                      <input
                        type="text"
                        placeholder={t('eh_pi_suburb_ph')}
                        required
                        value={itemSuburb}
                        onChange={e => setItemSuburb(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">{t('eh_pi_desc_label')}</label>
                    <textarea
                      rows={3}
                      placeholder={t('eh_pi_desc_ph')}
                      value={itemDesc}
                      onChange={e => setItemDesc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1d1d1f] resize-none" 
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white rounded-xl py-3.5 text-xs font-black tracking-wide transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    {t('eh_pi_submit')}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Right Details inspector sidebar & Dynamic simulation panels */}
        <div className={`lg:col-span-4 space-y-6 ${activeTab === 'tools' || activeTab === 'daigou' ? 'hidden' : ''}`}>

          {/* 1. Dynamic Detail Inspector */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs relative">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Compass size={14} className="text-[#1d1d1f]" />
              <span>{t('eh_inspector_title')}</span>
            </h3>

            {/* IF NO DEETS ARE SELECTED */}
            {!selectedGuide && !selectedMeal && !selectedItem && (
              <div className="text-center py-12 text-gray-400 text-xs">
                <Compass className="mx-auto mb-2.5 text-gray-300 animate-pulse" size={28} />
                <span>{t('eh_inspector_empty')}</span>
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
                      <span>{t('eh_gv_card_title')}</span>
                      {matchModel === 'gemma' && !matchIsFallback && (
                        <span
                          title="Generated on-device split: Gemma handled this pure-text generation (Gemini handles vision + grounding)."
                          className="ml-auto shrink-0 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wide text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Gemma
                        </span>
                      )}
                    </div>
                    {matchIsFallback && <FallbackNotice />}
                    {matchReason && (
                      <p className="text-[10px] text-amber-950 leading-relaxed bg-white/75 p-2 rounded-xl border border-amber-200/80 font-bold font-medium">
                        <strong>{t('eh_gv_match_basis')}</strong>{matchReason}
                      </p>
                    )}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-amber-800 tracking-wide block">{t('eh_gv_checklist_label')}</span>
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
                      {t('eh_gv_card_note')}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">{t('eh_gv_bio_label')}</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                    “ {selectedGuide.bio} ”
                  </p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">{t('eh_gv_projects_label')}</span>
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
                    onClick={() => openChatWithUser(selectedGuide.name, selectedGuide.avatar, t('eh_gv_chat_greeting', { name: selectedGuide.name }))}
                    className="w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white font-black text-xs rounded-xl py-3 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>{t('eh_gv_chat_btn')}</span>
                  </button>
                  <button
                    onClick={() => { triggerNotification(t('eh_n_guide_booked', { name: selectedGuide.name })); }}
                    className="w-full bg-white hover:bg-gray-50 border border-[#1d1d1f] text-[#1d1d1f] font-bold text-xs rounded-xl py-3 transition-colors"
                  >
                    {t('eh_gv_book_btn')}
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
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{t('eh_mv_chef')}{selectedMeal.chefName} ({selectedMeal.cuisine})</span>
                  </div>
                  <span className="text-lg font-black font-mono text-ink shrink-0">${selectedMeal.price}</span>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-3 text-xs leading-relaxed text-gray-600 font-semibold">
                  “ {selectedMeal.description} ”
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">{t('eh_mv_addr_label')}</span>
                  {selectedMeal.isUnlocked ? (
                    <div className="bg-surface-soft text-ink border border-hairline p-3.5 rounded-2xl text-xs font-bold space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-ink animate-bounce" />
                        <span>{t('eh_mv_unlocked')}</span>
                      </div>
                      <p className="font-mono text-xs">{selectedMeal.preciseAddress}</p>
                    </div>
                  ) : (
                    <div className="bg-neutral-100 border border-gray-200 p-3.5 rounded-2xl text-xs text-gray-500 font-black flex flex-col items-center justify-center text-center space-y-1.5">
                      <Lock size={16} className="text-primary" />
                      <span>{t('eh_mv_locked_title')}</span>
                      <p className="text-[10px] font-medium text-gray-400">{t('eh_mv_locked_sub')}</p>
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
                      <span>{t('eh_mv_unlock_btn', { price: selectedMeal.price })}</span>
                    </button>
                  ) : (
                    <div className="bg-surface-soft text-ink p-2.5 rounded-2xl text-xs font-black text-center">
                      {t('eh_mv_unlocked_msg')}
                    </div>
                  )}
                  <button
                    onClick={() => openChatWithUser(selectedMeal.chefName, selectedMeal.chefAvatar, t('eh_mv_chat_greeting', { chef: selectedMeal.chefName }))}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} />
                    <span>{t('eh_mv_chat_btn')}</span>
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
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{t('eh_iv_seller')}{selectedItem.sellerName} ({t('eh_iv_condition')}{conditionLabel(selectedItem.condition)})</span>
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
                        <span>{t('eh_iv_ai_title')}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        priceCheckResults[selectedItem.id].verdict === '划算'
                          ? 'bg-surface-soft text-ink'
                          : priceCheckResults[selectedItem.id].verdict === '偏贵'
                          ? 'bg-red-200 text-red-850'
                          : 'bg-amber-200 text-amber-850'
                      }`}>
                        {verdictLabel(priceCheckResults[selectedItem.id].verdict)}
                      </span>
                    </div>

                    {priceCheckResults[selectedItem.id].isQuotaFallback && <FallbackNotice className="mb-2" />}

                    <div className="text-[10px] bg-white/95 border border-gray-150 p-3.5 rounded-2xl space-y-2.5 leading-relaxed text-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold uppercase block">{t('eh_iv_new_ref')}</span>
                          <span className="font-extrabold text-gray-900 text-xs font-mono">{priceCheckResults[selectedItem.id].newPrice}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold uppercase block">{t('eh_iv_used_ref')}</span>
                          <span className="font-extrabold text-ink text-xs font-mono">{priceCheckResults[selectedItem.id].fairUsedPrice}</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-150 pt-2">
                        <span className="text-[9px] text-gray-400 font-extrabold block">{t('eh_iv_reasoning_label')}</span>
                        <p className="mt-0.5 text-[10px] font-bold text-gray-800 leading-relaxed">{priceCheckResults[selectedItem.id].reasoning}</p>
                      </div>

                      <div className="border-t border-dashed border-gray-150 pt-2 bg-gradient-to-r from-amber-50 to-transparent p-1.5 rounded-lg">
                        <span className="text-[9px] text-amber-800 font-black flex items-center gap-0.5 uppercase">
                          {t('eh_iv_pain_label')}
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
                  <span className="text-[10px] font-black text-ink uppercase tracking-widest block">{t('eh_iv_escrow_status')}</span>
                  {selectedItem.secureStatus === 'available' && (
                    <div className="text-gray-600 flex items-start gap-1.5">
                      <Shield size={16} className="text-ink shrink-0 mt-0.5" />
                      <span><strong>{t('eh_iv_avail_strong')}</strong>{t('eh_iv_avail_body')}</span>
                    </div>
                  )}
                  {selectedItem.secureStatus === 'locked_escrow' && (
                    <div className="space-y-2">
                      <div className="text-amber-800 bg-amber-100/50 p-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5">
                        <Lock size={14} className="animate-bounce" />
                        <span>{t('eh_iv_locked', { price: selectedItem.price })}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {t('eh_iv_locked_body')}
                      </p>
                      <button
                        onClick={() => handleMarketItemReleaseFunds(selectedItem.id)}
                        className="w-full bg-primary hover:bg-primary text-white font-black text-xs py-2 rounded-xl transition-all"
                      >
                        {t('eh_iv_release_btn')}
                      </button>
                    </div>
                  )}
                  {selectedItem.secureStatus === 'completed' && (
                    <div className="text-gray-500 flex items-center gap-1 text-xs font-bold text-center justify-center p-2 bg-gray-150 rounded-xl">
                      <Check size={14} className="text-ink" />
                      <span>{t('eh_iv_completed')}</span>
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
                      <span>{t('eh_iv_lock_btn', { price: selectedItem.price })}</span>
                    </button>
                  )}
                  <button
                    onClick={() => openChatWithUser(selectedItem.sellerName, selectedItem.sellerAvatar, t('eh_iv_chat_greeting', { seller: selectedItem.sellerName }))}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} />
                    <span>{t('eh_iv_chat_btn')}</span>
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
                      <span className="text-[9px] text-gray-400 block font-bold leading-none uppercase tracking-wide">{t('eh_chat_console_label')}</span>
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
                    placeholder={t('eh_chat_input_ph')}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                    className="flex-1 bg-transparent px-2 text-xs font-semibold focus:outline-none placeholder-gray-400"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="bg-[#ff5a3c] hover:bg-yellow-500 text-neutral-950 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer"
                  >
                    {t('eh_chat_send')}
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
                <h3 className="text-lg font-black text-gray-900">{t('eh_com_title')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('eh_com_sub')}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{t('eh_com_dish')}</span>
                  <span className="font-extrabold text-gray-800">
                    {meals.find(m => m.id === checkoutMealId)?.dishName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{t('eh_com_area')}</span>
                  <span className="font-bold text-gray-700">
                    {meals.find(m => m.id === checkoutMealId)?.suburb}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-sm font-black">
                  <span>{t('eh_com_deposit')}</span>
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
                  {t('eh_cancel')}
                </button>
                <button
                  onClick={() => handleMealPay(checkoutMealId)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl py-3 text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock size={12} />
                  <span>{t('eh_com_pay')}</span>
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
                <h3 className="text-lg font-black text-gray-900">{t('eh_coi_title')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('eh_coi_sub')}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{t('eh_coi_item')}</span>
                  <span className="font-extrabold text-gray-800 truncate max-w-[200px]">
                    {marketItems.find(i => i.id === checkoutItemId)?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{t('eh_coi_condition')}</span>
                  <span className="font-bold text-ink">
                    {(() => { const it = marketItems.find(i => i.id === checkoutItemId); return it ? conditionLabel(it.condition) : ''; })()}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-sm font-black">
                  <span>{t('eh_coi_deposit')}</span>
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
                  {t('eh_cancel')}
                </button>
                <button
                  onClick={() => handleMarketItemBuyAndLock(checkoutItemId)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl py-3 text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock size={12} />
                  <span>{t('eh_coi_lock')}</span>
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
                      <span>{t('eh_cart_title')}</span>
                      <span className="text-[10px] bg-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {t('eh_cart_count', { n: cart.length })}
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
                  <span>{t('eh_cart_info')}</span>
                </div>

                {/* Cart list body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                        <ShoppingCart size={32} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-800">{t('eh_cart_empty_title')}</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                          {t('eh_cart_empty_sub')}
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
                              {c.type === 'guide_project' ? t('eh_cart_type_guide') : c.type === 'meal' ? t('eh_cart_type_meal') : t('eh_cart_type_item')}
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
                            title={t('eh_cart_remove_title')}
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
                        <span>{t('eh_cart_subtotal')}</span>
                        <span className="font-mono">${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)} AUD</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>{t('eh_cart_insurance')}</span>
                        <span className="text-ink font-bold">{t('eh_cart_free')}</span>
                      </div>
                      <hr className="border-gray-100" />
                      <div className="flex justify-between text-sm font-black text-gray-950">
                        <span>{t('eh_cart_total')}</span>
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
                            <span>{t('eh_cart_locking')}</span>
                          </span>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>{t('eh_cart_checkout_btn')}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-gray-600 py-1 transition cursor-pointer"
                      >
                        {t('eh_cart_clear')}
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
