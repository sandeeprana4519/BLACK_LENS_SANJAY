import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  setLogLevel
} from 'firebase/firestore/lite';

// Silence gRPC/transport notices and prevent idle stream errors
setLogLevel('silent');

// Helper to recursively strip undefined properties before saving to Firestore
export function cleanForFirestore<T = any>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj as any)) {
    if (value !== undefined) {
      clean[key] = cleanForFirestore(value);
    }
  }
  return clean as any;
}

export interface DBStatus {
  mode: 'firestore' | 'local_fallback';
  connected: boolean;
  message: string;
  projectId?: string;
  databaseId?: string;
  database?: string;
  stats?: {
    articles: number;
    categories: number;
    tags: number;
    users: number;
    breaking: number;
    ads: number;
  };
}

export type ArticleStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'approved' 
  | 'scheduled' 
  | 'published' 
  | 'unpublished' 
  | 'hidden' 
  | 'rejected' 
  | 'archived';

export interface ArticleAuditLog {
  action: string;
  user_id: number;
  user_name: string;
  timestamp: string;
  notes?: string;
  from_status?: string;
  to_status?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  category_id: number;
  author_id: number;
  author_name?: string;
  author_avatar?: string;
  category_name?: string;
  category_slug?: string;
  location?: string;
  featured_image: string;
  image_caption?: string;
  image_credit?: string;
  gallery_images?: string[];
  video_url?: string;
  is_video_news?: boolean;
  is_breaking?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  is_on_home?: boolean;
  status: ArticleStatus;
  tags?: string[];
  review_notes?: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  reviewed_at?: string;
  view_count: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  audit_logs?: ArticleAuditLog[];
}

export interface Category {
  id: number;
  name_hi: string;
  name_en: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number | null;
  display_order: number;
  is_in_menu: boolean;
  is_in_home: boolean;
  is_active: boolean;
  article_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_popular: boolean;
  is_active: boolean;
  article_count?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  avatar_url?: string;
  role_id: number;
  role_name?: string;
  requested_role?: 'reporter' | 'editor' | string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_by_name?: string;
  approval_notes?: string;
  approved_at?: string;
  bio?: string;
  assigned_region?: string;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BreakingNewsItem {
  id: number;
  title: string;
  article_id?: number | null;
  external_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Advertisement {
  id: number;
  title: string;
  placement: 'header_banner' | 'home_top' | 'in_feed' | 'sidebar' | 'article_inline' | 'category_page' | 'footer_banner' | string;
  image_url: string;
  destination_url: string;
  advertiser_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  display_order?: number;
  impressions_count?: number;
  clicks_count?: number;
  is_active: boolean;
  status?: 'draft' | 'active' | 'inactive' | 'scheduled' | 'expired' | string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline?: string;
  site_description?: string;
  seo_title?: string;
  seo_description?: string;
  site_logo?: string;
  header_logo?: string;
  footer_logo?: string;
  favicon_url?: string;
  og_image?: string;
  contact_email: string;
  contact_phone: string;
  contact_phone_alt?: string;
  contact_address: string;
  contact_city?: string;
  contact_state?: string;
  contact_pincode?: string;
  contact_country?: string;
  facebook_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  whatsapp_number?: string;
  whatsapp_channel_url?: string;
  copyright_text?: string;
  footer_about?: string;
  tagline?: string;
  office_address?: string;
  logo_url?: string;
  footer_text?: string;
  [key: string]: any;
}

// In-memory fallback / cache store
const FALLBACK_DATA_FILE = path.resolve(process.cwd(), 'database', 'fallback_data.json');

let firestoreDb: Firestore | null = null;
let isFirestoreActive = false;
let dbStatusMessage = 'Connecting to Google Cloud Firestore...';
let firebaseConfig: any = null;

// Load Firebase configuration (Prioritizes firebase-applet-config.json as single source of truth)
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_API_KEY) {
    const envProject = process.env.FIREBASE_PROJECT_ID;
    const envDb = process.env.FIREBASE_DATABASE_ID || '(default)';
    firebaseConfig = {
      projectId: envProject,
      firestoreDatabaseId: envDb,
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${envProject}.firebaseapp.com`,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${envProject}.firebasestorage.app`,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || ''
    };
  }

  if (firebaseConfig && firebaseConfig.projectId) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId;
    if (dbId && dbId !== '(default)' && dbId !== '') {
      firestoreDb = getFirestore(app, dbId);
    } else {
      firestoreDb = getFirestore(app);
    }
  }
} catch (e: any) {
  console.warn('[Firebase] Config init notice:', e.message);
}

interface LocalStore {
  users: User[];
  categories: Category[];
  tags: Tag[];
  news_articles: Article[];
  breaking_news: BreakingNewsItem[];
  advertisements: Advertisement[];
  contact_messages: ContactMessage[];
  site_settings: Record<string, string>;
  deleted_article_ids?: number[];
  deleted_category_ids?: number[];
  deleted_tag_ids?: number[];
  deleted_breaking_ids?: number[];
  deleted_ad_ids?: number[];
}

let localStore: LocalStore = {
  users: [
    {
      id: 1,
      name: 'संदीप राणा (प्रधान संपादक)',
      email: 'admin@teznazar.com',
      password_hash: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq', // admin123
      phone: '+91 98765 43210',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      role_id: 1,
      role_name: 'Super Admin',
      bio: 'मुख्य संपादक एवं डिजिटल पत्रकारिता विशेषज्ञ',
      assigned_region: 'समस्त भारत / गाजियाबाद',
      approval_status: 'approved',
      is_active: true
    },
    {
      id: 2,
      name: 'अमित शर्मा (वरिष्ठ संपादक)',
      email: 'editor@teznazar.com',
      password_hash: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq', // editor123
      phone: '+91 98111 22334',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      role_id: 4,
      role_name: 'Editor',
      bio: 'राजनीतिक एवं अपराध डेस्क प्रमुख',
      assigned_region: 'उत्तर प्रदेश एवं दिल्ली एनसीआर',
      approval_status: 'approved',
      is_active: true
    },
    {
      id: 3,
      name: 'प्रिया चौहान (फील्ड रिपोर्टर)',
      email: 'reporter@teznazar.com',
      password_hash: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq', // reporter123
      phone: '+91 98222 33445',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      role_id: 5,
      role_name: 'Reporter',
      bio: 'गाजियाबाद एवं स्थानीय निकाय संवाददाता',
      assigned_region: 'गाजियाबाद शहर एवं ट्रांस हिंडन',
      approval_status: 'approved',
      is_active: true
    },
    {
      id: 4,
      name: 'विकास वर्मा (संपादक)',
      email: 'subadmin@teznazar.com',
      password_hash: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      role_id: 4,
      role_name: 'Editor',
      bio: 'संपादक (सहायक व्यवस्थापक से स्थानांतरित खाता)',
      assigned_region: 'दिल्ली एनसीआर',
      approval_status: 'approved',
      is_active: true
    },
    {
      id: 5,
      name: 'रोहित सिंघल (विज्ञापन प्रबंधक)',
      email: 'ads@teznazar.com',
      password_hash: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      role_id: 4,
      role_name: 'Editor',
      bio: 'ब्रांड एवं विज्ञापन डेस्क',
      assigned_region: 'कॉर्पोरेट',
      approval_status: 'approved',
      is_active: true
    },
    {
      id: 6,
      name: 'दीपक कश्यप (आवेदक)',
      email: 'deepak.reporter@example.com',
      password_hash: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq',
      phone: '+91 98991 12233',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      role_id: 5,
      role_name: 'Reporter (Pending)',
      requested_role: 'reporter',
      bio: 'लोनी एवं ट्रांस-हिंडन क्षेत्र से स्वतंत्र पत्रकार',
      assigned_region: 'लोनी / गाजियाबाद',
      approval_status: 'pending',
      is_active: false,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ],
  categories: [
    { id: 1, name_hi: 'गाजियाबाद', name_en: 'Ghaziabad', slug: 'ghaziabad', description: 'गाजियाबाद, इंदिरापुरम, राजनगर, वैशाली, वसुंधरा व लोनी की हर हलचल', display_order: 1, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 2, name_hi: 'दिल्ली एनसीआर', name_en: 'Delhi NCR', slug: 'delhi-ncr', description: 'दिल्ली, नोएडा, ग्रेटर नोएडा, गुरुग्राम और फरीदाबाद की बड़ी खबरें', display_order: 2, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 3, name_hi: 'उत्तर प्रदेश', name_en: 'Uttar Pradesh', slug: 'uttar-pradesh', description: 'लखनऊ से लेकर पूर्वांचल, बुंदेलखंड व पश्चिमी यूपी का हर समाचार', display_order: 3, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 4, name_hi: 'देश', name_en: 'National', slug: 'india', description: 'राष्ट्रीय सुरक्षा, केंद्र सरकार, संसद व प्रमुख घटनाक्रम', display_order: 4, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 5, name_hi: 'राजनीति', name_en: 'Politics', slug: 'politics', description: 'सत्तारूढ़ दल, विपक्ष, चुनाव और सियासी समीकरणों की अंदरूनी खबर', display_order: 5, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 6, name_hi: 'अपराध', name_en: 'Crime', slug: 'crime', description: 'क्राइम रिपोर्टिंग, पुलिस कार्यवाही, एसटीएफ और अदालती फैसले', display_order: 6, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 7, name_hi: 'शिक्षा एवं करियर', name_en: 'Education', slug: 'education', description: 'बोर्ड परीक्षाएं, प्रतियोगी तैयारी, विश्वविद्यालय और प्रवेश सूचनाएं', display_order: 7, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 8, name_hi: 'स्वास्थ्य', name_en: 'Health', slug: 'health', description: 'स्वास्थ्य कल्याण, चिकित्सा शोध, अस्पताल और मौसमी सावधानियां', display_order: 8, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 9, name_hi: 'व्यापार व शेयर', name_en: 'Business', slug: 'business', description: 'बाजार, अर्थव्यवस्था, रियल एस्टेट, टैक्स और एमएसएमई समाचार', display_order: 9, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 10, name_hi: 'खेल जगत', name_en: 'Sports', slug: 'sports', description: 'क्रिकेट, हॉकी, ओलंपिक, फुटबॉल और भारतीय खिलाड़ियों की सफलता', display_order: 10, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 11, name_hi: 'मनोरंजन', name_en: 'Entertainment', slug: 'entertainment', description: 'सिनेमा जगत, ओटीटी, वेब सीरीज और सांस्कृतिक प्रस्तुतियां', display_order: 11, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 12, name_hi: 'धर्म एवं अध्यात्म', name_en: 'Religion', slug: 'religion', description: 'मंदिर, पर्व-त्योहार, ज्योतिष्य और पौराणिक ज्ञान परंपरा', display_order: 12, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 13, name_hi: 'सरकारी योजनाएं', name_en: 'Govt Schemes', slug: 'govt-schemes', description: 'नागरिक कल्याणकारी नीतियां, सब्सिडी, किसान योजनाएं व पात्रता', display_order: 13, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 14, name_hi: 'नौकरी एवं रोजगार', name_en: 'Jobs', slug: 'jobs', description: 'सरकारी भर्तियां, रोजगार मेले और निजी क्षेत्र में अवसर', display_order: 14, is_in_menu: true, is_in_home: true, is_active: true }
  ],
  tags: [
    { id: 1, name: 'ब्रेकिंग न्यूज़', slug: 'breaking-news', is_popular: true, is_active: true },
    { id: 2, name: 'गाजियाबाद अपडेट', slug: 'ghaziabad-updates', is_popular: true, is_active: true },
    { id: 3, name: 'दिल्ली एनसीआर', slug: 'delhi-ncr-news', is_popular: true, is_active: true },
    { id: 4, name: 'उत्तर प्रदेश सरकार', slug: 'up-government', is_popular: true, is_active: true },
    { id: 5, name: 'राजनीति', slug: 'politics-today', is_popular: true, is_active: true },
    { id: 6, name: 'ट्रैफिक अलर्ट', slug: 'traffic-alert', is_popular: true, is_active: true },
    { id: 7, name: 'मौसम समाचार', slug: 'weather-update', is_popular: true, is_active: true },
    { id: 8, name: 'क्रिकेट वर्ल्ड', slug: 'cricket-world', is_popular: true, is_active: true },
    { id: 9, name: 'अयोध्या धाम', slug: 'ayodhya-dham', is_popular: false, is_active: true },
    { id: 10, name: 'स्वास्थ्य सलाह', slug: 'health-tips', is_popular: false, is_active: true }
  ],
  breaking_news: [
    { id: 1, title: 'गाजियाबाद: हिंडन एलिवेटेड रोड पर सुरक्षा के पुख्ता इंतजाम, 40 नए सीसीटीवी कैमरे सक्रिय', article_id: 1, display_order: 1, is_active: true },
    { id: 2, title: 'दिल्ली-एनसीआर में प्रदूषण नियंत्रण के लिए विशेष टास्क फोर्स गठित, ग्रेडेड रिस्पॉन्स एक्शन प्लान लागू', article_id: 2, display_order: 2, is_active: true },
    { id: 3, title: 'यूपी बोर्ड परीक्षा 2026: केंद्रों पर बायोमैट्रिक सत्यापन अनिवार्य, नकल विहीन परीक्षा के कड़े निर्देश', article_id: 3, display_order: 3, is_active: true },
    { id: 4, title: 'नमो भारत रैपिड रेल: गाजियाबाद से मेरठ साउथ तक दैनिक यात्रियों की संख्या ने बनाया नया रिकॉर्ड', article_id: 4, display_order: 4, is_active: true },
    { id: 5, title: 'सोने के भाव में आज भारी उतार-चढ़ाव, सर्राफा बाजार में बढ़ी त्योहारी खरीदारी', display_order: 5, is_active: true },
    { id: 6, title: 'भारतीय क्रिकेट टीम का विश्व टेस्ट चैंपियनशिप फाइनल का टिकट लगभग पक्का, खिलाड़ियों ने शुरू किया अभ्यास', display_order: 6, is_active: true },
    { id: 7, title: 'मौसम विभाग: पश्चिमी यूपी में अगले 48 घंटों में हल्की बूंदाबांदी के आसार, तापमान में आएगी गिरावट', display_order: 7, is_active: true }
  ],
  advertisements: [
    {
      id: 1,
      title: 'एनसीआर इंफ्राटेक बिल्डर्स - 3BHK लग्जरी अपार्टमेंट्स गाजियाबाद',
      placement: 'header_banner',
      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
      destination_url: 'https://example.com/ncr-properties',
      advertiser_name: 'एनसीआर इंफ्राटेक बिल्डर्स',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      impressions_count: 14200,
      clicks_count: 312,
      is_active: true
    },
    {
      id: 2,
      title: 'एपेक्स ग्रुप ऑफ इंस्टीट्यूशंस - बीटेक और एमबीए में प्रवेश प्रारंभ',
      placement: 'sidebar',
      image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      destination_url: 'https://example.com/apex-admissions',
      advertiser_name: 'एपेक्स ग्रुप',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      impressions_count: 8900,
      clicks_count: 185,
      is_active: true
    },
    {
      id: 3,
      title: 'दीपावली बंपर सेल - गाजियाबाद इलेक्ट्रॉनिक्स हब पर 40% तक छूट',
      placement: 'breaking_news',
      image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
      destination_url: 'https://example.com/electronics-sale',
      advertiser_name: 'गाजियाबाद इलेक्ट्रॉनिक्स हब',
      description: 'सभी घरेलू उपकरणों व स्मार्ट टीवी पर विशेष छूट व आकर्षक ईएमआई ऑफर।',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      display_order: 1,
      impressions_count: 5400,
      clicks_count: 210,
      is_active: true
    },
    {
      id: 4,
      title: 'राष्ट्रीय छात्रवृत्ति परीक्षा 2026 - कक्षा 8वीं से 12वीं तक 100% स्कॉलरशिप',
      placement: 'live_desk',
      image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
      destination_url: 'https://example.com/scholarship-exam',
      advertiser_name: 'लक्ष्य करियर इंस्टीट्यूट',
      description: 'आईआईटी-जेईई व नीट की तैयारी हेतु विशेष छात्रवृत्ति। रजिस्ट्रेशन निःशुल्क।',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      display_order: 1,
      impressions_count: 4200,
      clicks_count: 165,
      is_active: true
    },
    {
      id: 5,
      title: 'प्रो क्रिकेट व स्पोर्ट्स अकैडमी - समर कोचिंग कैंप पंजीकरण शुरू',
      placement: 'category_khel',
      image_url: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=600&auto=format&fit=crop&q=80',
      destination_url: 'https://example.com/sports-academy',
      advertiser_name: 'प्रो स्पोर्ट्स अकैडमी',
      description: 'राष्ट्रीय स्तर के कोचों द्वारा पेशेवर प्रशिक्षण। निःशुल्क ट्रायल मैच उपलब्ध।',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      display_order: 1,
      impressions_count: 3800,
      clicks_count: 140,
      is_active: true
    },
    {
      id: 6,
      title: 'उत्तर प्रदेश पर्यटन एक्सपो 2026 - काशी, अयोध्या व ब्रज दर्शन विशेष पैकेज',
      placement: 'category_up',
      image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80',
      destination_url: 'https://example.com/up-tourism',
      advertiser_name: 'यूपी टूरिज्म वेलफेयर',
      description: 'धार्मिक व ऐतिहासिक स्थलों की सुगम यात्रा, होटल बुकिंग व टूर गाइड सेवाएं।',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      display_order: 1,
      impressions_count: 4100,
      clicks_count: 175,
      is_active: true
    },
    {
      id: 7,
      title: 'डिजिटल मीडिया व वीडियो पत्रकारिता कार्यशाला - 100% प्लेसमेंट सहायता',
      placement: 'video_section',
      image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      destination_url: 'https://example.com/media-workshop',
      advertiser_name: 'मीडिया विजन इंस्टीट्यूट',
      description: 'कैमरा एंकरिंग, वीडियो एडिटिंग व फील्ड रिपोर्टिंग की व्यावहारिक ट्रेनिंग।',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      display_order: 1,
      impressions_count: 4900,
      clicks_count: 198,
      is_active: true
    }
  ],
  site_settings: {
    site_name: 'BLACK LENS',
    tagline: 'Media & Entertainment',
    contact_email: 'editor@teznazar.com',
    contact_phone: '+91 98765 43210',
    office_address: 'ब्लैक लेंस मीडिया प्राइवेट लिमिटेड, 402-404, फॉर्च्यून टॉवर, राजनगर डिस्ट्रिक्ट सेंटर (RDC), गाजियाबाद, उत्तर प्रदेश - 201002',
    logo_url: '/logo.svg',
    site_logo: '',
    footer_text: 'BLACK LENS (Media & Entertainment) निष्पक्ष, निर्भीक और जनहितैषी डिजिटल पत्रकारिता का विश्वसनीय मंच है। गाजियाबाद, दिल्ली एनसीआर और राष्ट्र की हर बड़ी खबर पर पैनी नजर।',
    facebook_url: 'https://facebook.com/teznazarnews',
    twitter_url: 'https://twitter.com/teznazarnews',
    youtube_url: 'https://youtube.com/@teznazarnews',
    instagram_url: 'https://instagram.com/teznazarnews',
    whatsapp_number: '+919876543210',
    whatsapp_channel_url: 'https://whatsapp.com/channel/blacklens'
  },
  contact_messages: [
    {
      id: 1792300001,
      name: 'राहुल वर्मा (मार्केटिंग हेड, आरडीसी मॉल)',
      email: 'rahul.verma@rdcmall.com',
      phone: '+91 98112 34567',
      subject: 'विज्ञापन संबंधी पूछताछ (होमपेज बैनर एवं साइडबार)',
      message: 'नमस्ते ब्लैक लेंस टीम, हम अपने नए समर शॉपिंग फेस्टिवल के लिए आपकी वेबसाइट के होमपेज हेडर स्लॉट एवं साइडबार पर 1 माह के लिए विशेष बैनर अभियान चलाना चाहते हैं। कृपया विज्ञापन दरें, रीच मैट्रिक्स और उपलब्धता विवरण प्रेषित करें।',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 1792300002,
      name: 'डॉ. सीमा मल्होत्रा (संयोजक)',
      email: 'dr.seema@socialwelfare.org',
      phone: '+91 99223 88776',
      subject: 'प्रेस रिलीज: राजनगर में निःशुल्क स्वास्थ्य एवं नेत्र जांच शिविर',
      message: 'आदरणीय संपादक महोदय, आगामी रविवार को राजनगर एक्सटेंशन कम्युनिटी सेंटर में 500+ वरिष्ठ नागरिकों हेतु निःशुल्क स्वास्थ्य एवं नेत्र जांच शिविर आयोजित किया जा रहा है। जनहित में इस प्रेस विज्ञप्ति को समाचार पोर्टल पर स्थान देने का कष्ट करें।',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 14).toISOString()
    },
    {
      id: 1792300003,
      name: 'आलोक कुमार गुप्ता (स्थानीय नागरिक)',
      email: 'alok.gupta@gmail.com',
      phone: '+91 98711 00223',
      subject: 'सुझाव: गाजियाबाद के स्थानीय वार्ड स्तर की समस्याओं का विशेष कॉलम',
      message: 'ब्लैक लेंस की निर्भीक व जमीनी पत्रकारिता सराहनीय है। मेरा एक सुझाव है कि नगर निगम के वार्ड स्तर और जलभराव/सफाई की समस्याओं पर एक साप्ताहिक जन-सुनवाई कॉलम शुरू किया जाए, जिससे आम जनता की आवाज़ सीधे प्रशासन तक पहुंचे।',
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 36).toISOString()
    }
  ],
  news_articles: [
    {
      id: 1,
      title: 'गाजियाबाद: हिंडन एलिवेटेड रोड पर सुरक्षा बढ़ाने के लिए 40 नए एआई कैमरे स्थापित, तेज रफ्तार पर होगा ई-चालान',
      slug: 'ghaziabad-hindon-elevated-road-ai-cameras-traffic-safety',
      subtitle: 'यातायात पुलिस और नगर निगम की संयुक्त पहल से दुर्घटनाओं पर लगेगी रोक',
      excerpt: 'गाजियाबाद के हिंडन एलिवेटेड रोड पर अब ओवरस्पीडिंग और लेन कटिंग करने वालों की खैर नहीं। 40 अत्याधुनिक हाई-स्पीड एआई कैमरे लगाए गए हैं जो सीधे इंटीग्रेटेड कंट्रोल कमांड सेंटर से जुड़े हैं।',
      content: `<p><strong>गाजियाबाद (ब्लैक लेंस ब्यूरो):</strong> गाजियाबाद की लाइफलाइन कही जाने वाली हिंडन एलिवेटेड रोड पर वाहनों की तेज रफ्तार और आए दिन होने वाली दुर्घटनाओं पर लगाम लगाने के लिए प्रशासन ने कड़ा कदम उठाया है। राजनगर एक्सटेंशन से यूपी गेट तक फैले इस 10.3 किलोमीटर लंबे एलिवेटेड रोड पर 40 नए स्वचालित एआई कैमरे सक्रिय कर दिए गए हैं।</p>
      <p>यातायात पुलिस उपायुक्त ने बताया कि ये कैमरे 24 घंटे काम करेंगे और वाहन की गति सीमा (अधिकतम 80 किमी/घंटा) पार होते ही स्वतः ई-चालान जनरेट कर वाहन स्वामी के पंजीकृत मोबाइल नंबर पर भेज देंगे। इसके अतिरिक्त गलत दिशा में ड्राइविंग और आपातकालीन लेन में वाहन खड़ा करने पर भी निगरानी रखी जाएगी।</p>
      <p>स्थानीय नागरिकों ने इस कदम का स्वागत किया है और उम्मीद जताई है कि इससे रात के समय होने वाली खतरनाक स्टंटबाजी और हादसों में भारी कमी आएगी।</p>`,
      category_id: 1,
      author_id: 1,
      author_name: 'संदीप राणा (प्रधान संपादक)',
      category_name: 'गाजियाबाद',
      category_slug: 'ghaziabad',
      location: 'गाजियाबाद (राजनगर / हिंडन)',
      featured_image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
      image_caption: 'हिंडन एलिवेटेड रोड गाजियाबाद पर लगे हाई-स्पीड स्मार्ट ट्रैफिक सर्विलांस कैमरे',
      image_credit: 'ब्लैक लेंस मीडिया नेटवर्क',
      gallery_images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000&auto=format&fit=crop&q=80'
      ],
      is_breaking: true,
      is_featured: true,
      is_trending: true,
      is_on_home: true,
      status: 'published',
      view_count: 1420,
      seo_title: 'गाजियाबाद हिंडन एलिवेटेड रोड AI कैमरे चालान',
      seo_description: 'गाजियाबाद हिंडन एलिवेटेड रोड पर 40 नए एआई कैमरे लगाए गए हैं। गति सीमा पार करने पर तुरंत ई-चालान कटेगा।',
      published_at: '2026-10-16T10:00:00.000Z',
      created_at: '2026-10-16T09:30:00.000Z',
      updated_at: '2026-10-16T10:00:00.000Z'
    },
    {
      id: 2,
      title: 'दिल्ली-एनसीआर में वायु गुणवत्ता सुधार के लिए GRAP-4 की कड़ी निगरानी, निर्माण कार्यों पर सख्त पाबंदी',
      slug: 'delhi-ncr-air-quality-grap-4-curbs-construction-ban',
      subtitle: 'प्रदूषण नियंत्रण बोर्ड ने प्रदूषण फैलाने वाली 50 औद्योगिक इकाइयों पर लगाया भारी जुर्माना',
      excerpt: 'सर्दियों की शुरुआत के साथ ही दिल्ली-एनसीआर में प्रदूषण का स्तर बढ़ने लगा है। वायु गुणवत्ता प्रबंधन आयोग ने गाजियाबाद, नोएडा, गुरुग्राम और फरीदाबाद में विशेष एंटी-स्मॉग गन और स्प्रिंकलर तैनात किए हैं।',
      content: `<p><strong>दिल्ली / नोएडा (ब्लैक लेंस ब्यूरो):</strong> राजधानी दिल्ली और आसपास के राष्ट्रीय राजधानी क्षेत्र (NCR) में हवा की गुणवत्ता लगातार 'खराब' श्रेणी में बनी हुई है। इसे देखते हुए वायु गुणवत्ता प्रबंधन आयोग (CAQM) ने सभी संबंधित विभागों को ग्रेडेड रिस्पॉन्स एक्शन प्लान (GRAP) के कड़े नियमों का पालन सुनिश्चित करने का निर्देश दिया है।</p>
      <p>गाजियाबाद के साहिबाबाद और लोनी औद्योगिक क्षेत्र में बिना पीयूसी (PUC) वाले व्यावसायिक वाहनों के प्रवेश पर रोक लगा दी गई है। साथ ही खुले में कूड़ा जलाने और निर्माण सामग्री को बिना ढके परिवहन करने पर 50 हजार रुपये तक का जुर्माना लगाया जा रहा है।</p>`,
      category_id: 2,
      author_id: 2,
      author_name: 'अमित शर्मा (वरिष्ठ संपादक)',
      category_name: 'दिल्ली एनसीआर',
      category_slug: 'delhi-ncr',
      location: 'दिल्ली / नोएडा एनसीआर',
      featured_image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1000&auto=format&fit=crop&q=80',
      image_caption: 'दिल्ली एनसीआर में धुंध और प्रदूषण पर पानी का छिड़काव करती एंटी-स्मॉग गन',
      image_credit: 'पीटीआई / फ़ाइल फोटो',
      gallery_images: [
        'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1000&auto=format&fit=crop&q=80'
      ],
      is_breaking: true,
      is_featured: true,
      is_trending: true,
      is_on_home: true,
      status: 'published',
      view_count: 2150,
      published_at: '2026-10-16T08:30:00.000Z',
      created_at: '2026-10-16T08:00:00.000Z',
      updated_at: '2026-10-16T08:30:00.000Z'
    },
    {
      id: 3,
      title: 'उत्तर प्रदेश: मुख्यमंत्री योगी आदित्यनाथ ने युवाओं के लिए 50,000 नई सरकारी नौकरियों की घोषणा की',
      slug: 'up-govt-50000-new-jobs-recruitment-announcement-cm-yogi',
      subtitle: 'पुलिस भर्ती, स्वास्थ्य विभाग और माध्यमिक शिक्षा में जल्द जारी होंगे विज्ञापन',
      excerpt: 'उत्तर प्रदेश लोक सेवा आयोग और अधीनस्थ सेवा चयन आयोग (UPSSSC) को मिशन मोड में पारदर्शी भर्ती प्रक्रिया पूरी करने के निर्देश दिए गए हैं।',
      content: `<p><strong>लखनऊ (ब्लैक लेंस ब्यूरो):</strong> उत्तर प्रदेश के मुख्यमंत्री योगी आदित्यनाथ ने राज्य के बेरोजगार युवाओं को बड़ा तोहफा देते हुए विभिन्न विभागों में 50,000 रिक्त पदों पर तत्काल भर्ती प्रक्रिया शुरू करने का ऐलान किया है।</p>
      <p>मुख्यमंत्री ने उच्चस्तरीय बैठक में स्पष्ट निर्देश दिए कि भर्ती परीक्षाएं पूर्णतः पारदर्शी और समयबद्ध तरीके से आयोजित की जाएं। पेपर लीक रोकने के लिए बनाए गए नए कड़े कानून के तहत सख्त निगरानी रखी जाएगी।</p>`,
      category_id: 3,
      author_id: 1,
      author_name: 'संदीप राणा (प्रधान संपादक)',
      category_name: 'उत्तर प्रदेश',
      category_slug: 'uttar-pradesh',
      location: 'लखनऊ',
      featured_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
      image_caption: 'उत्तर प्रदेश सचिवालय लखनऊ में आयोजित रोजगार समीक्षा बैठक',
      is_breaking: false,
      is_featured: true,
      is_trending: true,
      is_on_home: true,
      status: 'published',
      view_count: 3410,
      published_at: '2026-10-15T15:00:00.000Z',
      created_at: '2026-10-15T14:30:00.000Z',
      updated_at: '2026-10-15T15:00:00.000Z'
    },
    {
      id: 4,
      title: 'नमो भारत रैपिड रेल: गाजियाबाद स्टेशन से मेरठ के बीच दैनिक यात्रियों की संख्या 60,000 के पार',
      slug: 'namo-bharat-rapid-rail-ghaziabad-meerut-ridership-milestone',
      subtitle: 'यात्रियों की भारी भीड़ को देखते हुए फेरों की संख्या में वृद्धि की तैयारी',
      excerpt: 'दिल्ली-गाजियाबाद-मेरठ आरआरटीएस कॉरिडोर पर नमो भारत ट्रेन आमजन की पहली पसंद बन गई है। प्रदूषण मुक्त और समय की बचत के चलते यात्री मेट्रो और सड़क मार्ग की जगह रैपिड रेल को प्राथमिकता दे रहे हैं।',
      content: `<p><strong>गाजियाबाद:</strong> राष्ट्रीय राजधानी क्षेत्र परिवहन निगम (NCRTC) द्वारा संचालित नमो भारत ट्रेनों ने यात्रियों की संख्या का नया कीर्तिमान स्थापित किया है। साहिबाबाद, गाजियाबाद, गुलधर, दुहाई और मुरादनगर होते हुए मेरठ साउथ तक प्रतिदिन 60 हजार से अधिक नागरिक यात्रा कर रहे हैं।</p>`,
      category_id: 1,
      author_id: 3,
      author_name: 'प्रिया चौहान (फील्ड रिपोर्टर)',
      category_name: 'गाजियाबाद',
      category_slug: 'ghaziabad',
      location: 'गाजियाबाद आरआरटीएस स्टेशन',
      featured_image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1000&auto=format&fit=crop&q=80',
      is_breaking: false,
      is_featured: true,
      is_trending: false,
      is_on_home: true,
      status: 'published',
      view_count: 1820,
      published_at: '2026-10-15T12:00:00.000Z',
      created_at: '2026-10-15T11:45:00.000Z',
      updated_at: '2026-10-15T12:00:00.000Z'
    },
    {
      id: 5,
      title: 'गाजियाबाद पुलिस कमिश्नरेट का बड़ा एक्शन: ट्रांस हिंडन में वाहन चोर गिरोह का पर्दाफाश, 12 लग्जरी गाड़ियां बरामद',
      slug: 'ghaziabad-police-vehicle-theft-gang-arrest-trans-hindon',
      subtitle: 'इंदिरापुरम थाना पुलिस और स्वाट टीम ने संयुक्त अभियान चलाकर 4 शातिर चोरों को दबोचा',
      excerpt: 'गाजियाबाद के इंदिरापुरम और वैशाली क्षेत्र से लग्जरी गाड़ियां चोरी करने वाले अंतरराज्यीय गिरोह का पर्दाफाश हुआ है। फर्जी नंबर प्लेट और हाईटेक स्कैनर से गाड़ियां चुराते थे आरोपी।',
      content: `<p><strong>गाजियाबाद (अपराध डेस्क):</strong> गाजियाबाद कमिश्नरेट की इंदिरापुरम पुलिस और स्वाट टीम ने वाहन चोरी करने वाले एक संगठित सिंडिकेट का भंडाफोड़ किया है। पुलिस ने गिरोह के चार शातिर सदस्यों को गिरफ्तार कर उनके कब्जे से 12 चोरी की कारें, इलेक्ट्रॉनिक चाबियां और मास्टर कोड स्कैनर बरामद किए हैं।</p>`,
      category_id: 6,
      author_id: 2,
      author_name: 'अमित शर्मा (वरिष्ठ संपादक)',
      category_name: 'अपराध',
      category_slug: 'crime',
      location: 'इंदिरापुरम, गाजियाबाद',
      featured_image: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1000&auto=format&fit=crop&q=80',
      is_breaking: false,
      is_featured: false,
      is_trending: true,
      is_on_home: true,
      status: 'published',
      view_count: 980,
      published_at: '2026-10-14T16:00:00.000Z',
      created_at: '2026-10-14T15:30:00.000Z',
      updated_at: '2026-10-14T16:00:00.000Z'
    },
    {
      id: 6,
      title: 'संसद सत्र: डिजिटल इंडिया और साइबर सुरक्षा पर नया विधेयक पेश, डेटा प्राइवेसी के नियम होंगे सख्त',
      slug: 'parliament-session-digital-india-cyber-security-bill',
      subtitle: 'नागरिकों की निजी जानकारी सुरक्षित रखने के लिए कड़े प्रावधान, उल्लंघन पर भारी जुर्माना',
      excerpt: 'केंद्रीय सूचना एवं प्रौद्योगिकी मंत्री ने संसद में नया डिजिटल सुरक्षा बिल पेश किया। सोशल मीडिया कंपनियों को भ्रामक जानकारी और डीपफेक वीडियो पर 24 घंटे में कार्रवाई करनी होगी।',
      content: `<p><strong>नई दिल्ली:</strong> संसद के वर्तमान सत्र में सरकार ने डिजिटल पर्सनल डेटा और साइबर सुरक्षा को सुदृढ़ करने के उद्देश्य से एक महत्वपूर्ण संशोधन विधेयक पेश किया है। विधेयक में एआई जनरेटेड डीपफेक सामग्री और वित्तीय धोखाधड़ी पर नकेल कसने के विशेष प्रावधान किए गए हैं।</p>`,
      category_id: 4,
      author_id: 1,
      author_name: 'संदीप राणा (प्रधान संपादक)',
      category_name: 'देश',
      category_slug: 'india',
      location: 'नई दिल्ली',
      featured_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
      is_breaking: false,
      is_featured: false,
      is_trending: false,
      is_on_home: true,
      status: 'published',
      view_count: 870,
      published_at: '2026-10-14T11:00:00.000Z',
      created_at: '2026-10-14T10:30:00.000Z',
      updated_at: '2026-10-14T11:00:00.000Z'
    },
    {
      id: 7,
      title: 'गाजियाबाद नगर निगम की विशेष वीडियो रिपोर्ट: शहर में 50 नए पिंक टॉयलेट और ओपन जिम का लोकार्पण',
      slug: 'video-ghaziabad-nagar-nigam-open-gym-pink-toilet-inauguration',
      subtitle: 'स्वच्छ भारत मिशन 2.0 के तहत शहर के सौंदर्यीकरण और जनसुविधाओं में अभूतपूर्व विस्तार',
      excerpt: 'गाजियाबाद की महापौर और नगर आयुक्त ने राजनगर और शास्त्रीनगर में आधुनिक ओपन जिम का शुभारंभ किया। देखिए विशेष वीडियो रिपोर्ट।',
      content: `<p><strong>गाजियाबाद:</strong> स्वच्छता सर्वेक्षण में गाजियाबाद को अव्वल दर्जा दिलाने के संकल्प के साथ नगर निगम ने शहर के प्रमुख पार्कों में अत्याधुनिक ओपन जिम और महिलाओं के लिए सुरक्षित पिंक टॉयलेट समर्पित किए हैं।</p>`,
      category_id: 1,
      author_id: 3,
      author_name: 'प्रिया चौहान (फील्ड रिपोर्टर)',
      category_name: 'गाजियाबाद',
      category_slug: 'ghaziabad',
      location: 'गाजियाबाद',
      featured_image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1000&auto=format&fit=crop&q=80',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      is_video_news: true,
      is_breaking: false,
      is_featured: false,
      is_trending: false,
      is_on_home: true,
      status: 'published',
      view_count: 1540,
      published_at: '2026-10-13T17:00:00.000Z',
      created_at: '2026-10-13T16:30:00.000Z',
      updated_at: '2026-10-13T17:00:00.000Z'
    },
    {
      id: 8,
      title: 'शेयर बाजार में रिकॉर्ड तेजी: सेंसेक्स 85,000 के ऐतिहासिक स्तर पर, आईटी व ऑटो सेक्टर में जबरदस्त उछाल',
      slug: 'share-market-sensex-nifty-record-high-bull-run',
      subtitle: 'विदेशी संस्थागत निवेशकों (FII) की भारी लिवाली और मजबूत जीडीपी ग्रोथ से बाजार में उत्साह',
      excerpt: 'भारतीय शेयर बाजार ने सप्ताह के अंतिम कारोबारी दिन नया कीर्तिमान रच दिया। सेंसेक्स और निफ्टी दोनों अपने सर्वकालिक उच्चतम स्तर पर बंद हुए।',
      content: `<p><strong>मुंबई:</strong> दलाल स्ट्रीट में आज निवेशकों की चांदी रही। बॉम्बे स्टॉक एक्सचेंज (BSE) का 30 शेयरों वाला प्रमुख सूचकांक सेंसेक्स 650 अंकों की शानदार बढ़त के साथ पहली बार 85,000 के ऐतिहासिक स्तर को पार कर गया।</p>`,
      category_id: 9,
      author_id: 2,
      author_name: 'अमित शर्मा (वरिष्ठ संपादक)',
      category_name: 'व्यापार व शेयर',
      category_slug: 'business',
      location: 'मुंबई',
      featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80',
      is_breaking: false,
      is_featured: false,
      is_trending: true,
      is_on_home: true,
      status: 'published',
      view_count: 1120,
      published_at: '2026-10-13T14:00:00.000Z',
      created_at: '2026-10-13T13:30:00.000Z',
      updated_at: '2026-10-13T14:00:00.000Z'
    }
  ]
};

// Load saved local cache if present
try {
  if (fs.existsSync(FALLBACK_DATA_FILE)) {
    const raw = fs.readFileSync(FALLBACK_DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.news_articles)) {
      const seedMap = new Map<number, User>(localStore.users.map(u => [u.id, u]));
      if (Array.isArray(parsed.users)) {
        parsed.users = parsed.users.map((pu: User) => {
          const seed = seedMap.get(pu.id);
          if (seed && !pu.avatar_url && seed.avatar_url) {
            pu.avatar_url = seed.avatar_url;
          }
          if (!pu.avatar_url) {
            // Assign default journalist avatars based on role
            if (pu.role_id === 1 || pu.role_id === 2) {
              pu.avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
            } else if (pu.role_id === 4) {
              pu.avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80';
            } else {
              pu.avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
            }
          }
          return pu;
        });
      }
      localStore = { ...localStore, ...parsed };
    }
  }
} catch (e) {
  // Ignore fallback read errors
}

export function saveFallbackStore() {
  try {
    const dir = path.dirname(FALLBACK_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (e) {
    // best-effort persistence
  }
}

/**
 * Initialize Database Connection:
 * Migrates to Google Firebase Firestore as primary persistent database.
 * Syncs initial seed documents into Firestore if empty.
 */
export async function initDatabaseConnection(): Promise<DBStatus> {
  // 1. Check Firebase Firestore
  if (firestoreDb && firebaseConfig) {
    try {
      console.log(`[Firebase Firestore] Connecting to Project: ${firebaseConfig.projectId}, DB: ${firebaseConfig.firestoreDatabaseId}`);

      // Verify connection by reading articles collection
      const articlesSnap = await getDocs(collection(firestoreDb, 'articles'));
      isFirestoreActive = true;
      dbStatusMessage = `Connected to Google Cloud Firestore (Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId})`;
      console.log(`[Firebase Firestore] Successfully connected! Found ${articlesSnap.size} existing articles.`);

      // Auto-seed into Firestore if empty
      if (articlesSnap.empty) {
        console.log('[Firebase Firestore] Initializing Firestore collections with portal news seed data...');
        for (const art of localStore.news_articles) {
          await setDoc(doc(firestoreDb, 'articles', String(art.id)), art);
        }
        for (const cat of localStore.categories) {
          await setDoc(doc(firestoreDb, 'categories', String(cat.id)), cat);
        }
        for (const tag of localStore.tags) {
          await setDoc(doc(firestoreDb, 'tags', String(tag.id)), tag);
        }
        for (const b of localStore.breaking_news) {
          await setDoc(doc(firestoreDb, 'breaking_news', String(b.id)), b);
        }
        for (const ad of localStore.advertisements) {
          await setDoc(doc(firestoreDb, 'advertisements', String(ad.id)), ad);
        }
        for (const u of localStore.users) {
          await setDoc(doc(firestoreDb, 'users', String(u.id)), u);
        }
        await setDoc(doc(firestoreDb, 'settings', 'general'), localStore.site_settings);
        // Admin security document
        await setDoc(doc(firestoreDb, 'admins', 'sandeeprana4519'), {
          email: 'sandeeprana4519@gmail.com',
          role: 'Super Admin'
        });
        await setDoc(doc(firestoreDb, 'admins', 'sandeeprana4139'), {
          email: 'sandeeprana4139@gmail.com',
          role: 'Super Admin'
        });
        console.log('[Firebase Firestore] Migration complete! All collections seeded successfully.');
      }

      return getDBStatus();
    } catch (err: any) {
      console.warn(`[Firebase Firestore] Notice: ${err.message}. Operating with dual resilient sync.`);
      isFirestoreActive = false;
      dbStatusMessage = `Firebase Firestore notice: ${err.message}. Resilient local storage active.`;
    }
  }

  return getDBStatus();
}

export function getDBStatus(): DBStatus {
  return {
    mode: isFirestoreActive ? 'firestore' : 'local_fallback',
    connected: isFirestoreActive,
    message: dbStatusMessage,
    projectId: firebaseConfig?.projectId || 'eloquent-hope-4v4kj',
    databaseId: firebaseConfig?.firestoreDatabaseId || 'ai-studio-teznazarhindinew-e999e430-5364-4d3b-ae3d-cb2dcea20f81',
    database: firebaseConfig?.firestoreDatabaseId || 'Google Cloud Firestore',
    stats: {
      articles: localStore.news_articles.length,
      categories: localStore.categories.length,
      tags: localStore.tags.length,
      users: localStore.users.length,
      breaking: localStore.breaking_news.length,
      ads: localStore.advertisements.length
    }
  };
}

// -------------------------------------------------------------
// UNIFIED DATA ACCESS API (FIRESTORE + RESILIENT CACHE)
// -------------------------------------------------------------

export const db = {
  async getNewsArticles(params: {
    categorySlug?: string;
    tagSlug?: string;
    q?: string;
    status?: string;
    isBreaking?: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
    isVideo?: boolean;
    authorId?: number;
    page?: number;
    limit?: number;
  }) {
    let articles: Article[] = [];

    // Attempt to read from Firestore
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'articles'));
        if (!snap.empty) {
          const deletedIds = new Set(localStore.deleted_article_ids || []);
          const firestoreArticles = snap.docs
            .map(d => d.data() as Article)
            .filter(a => a && a.status !== 'archived' && !deletedIds.has(a.id));
          // Resilient merge: keep both Firestore and newly created local items
          const map = new Map<number, Article>();
          for (const item of firestoreArticles) {
            map.set(item.id, item);
          }
          for (const item of localStore.news_articles) {
            if (!map.has(item.id) && item.status !== 'archived' && !deletedIds.has(item.id)) {
              map.set(item.id, item);
            }
          }
          articles = Array.from(map.values());
          localStore.news_articles = articles;
        } else {
          articles = [...localStore.news_articles];
        }
      } catch (e) {
        articles = [...localStore.news_articles];
      }
    } else {
      articles = [...localStore.news_articles];
    }

    // Auto-enrich category and author details for consistent display & filtering
    articles = articles.map(a => {
      if (!a.category_slug || !a.category_name) {
        const cat = localStore.categories.find(c => c.id === a.category_id);
        if (cat) {
          a.category_name = a.category_name || cat.name_hi;
          a.category_slug = a.category_slug || cat.slug;
        }
      }
      if (!a.author_name && a.author_id) {
        const u = localStore.users.find(usr => usr.id === a.author_id);
        if (u) {
          a.author_name = u.name;
        }
      }
      if (!a.author_avatar) {
        if (a.author_id) {
          const u = localStore.users.find(usr => usr.id === a.author_id);
          if (u && u.avatar_url) {
            a.author_avatar = u.avatar_url;
          }
        }
        if (!a.author_avatar) {
          a.author_avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
        }
      }
      return a;
    });

    // Filter by status
    if (params.status && params.status !== 'all') {
      articles = articles.filter(a => a.status === params.status);
    }

    // Category filter (match either category_slug or find by category id)
    if (params.categorySlug) {
      const targetCat = localStore.categories.find(c => c.slug === params.categorySlug);
      articles = articles.filter(a => 
        a.category_slug === params.categorySlug || 
        (targetCat && a.category_id === targetCat.id)
      );
    }

    // Tag filter
    if (params.tagSlug) {
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(params.tagSlug!.toLowerCase()) || 
        (a.seo_keywords && a.seo_keywords.toLowerCase().includes(params.tagSlug!.toLowerCase()))
      );
    }

    // Search query
    if (params.q) {
      const qLower = params.q.toLowerCase().trim();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(qLower) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(qLower)) ||
        (a.location && a.location.toLowerCase().includes(qLower)) ||
        (a.content && a.content.toLowerCase().includes(qLower))
      );
    }

    if (params.isBreaking !== undefined) {
      articles = articles.filter(a => a.is_breaking === params.isBreaking);
    }
    if (params.isFeatured !== undefined) {
      articles = articles.filter(a => a.is_featured === params.isFeatured);
    }
    if (params.isTrending !== undefined) {
      articles = articles.filter(a => a.is_trending === params.isTrending);
    }
    if (params.isVideo !== undefined) {
      articles = articles.filter(a => (a.is_video_news || !!a.video_url) === params.isVideo);
    }
    if (params.authorId) {
      articles = articles.filter(a => a.author_id === params.authorId);
    }

    // Sort newest first
    articles.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return timeB - timeA;
    });

    const page = params.page || 1;
    const limit = params.limit || 12;
    const total = articles.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = articles.slice(start, start + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  async getArticleBySlug(slugOrId: string): Promise<Article | null> {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'articles'));
        for (const docSnap of snap.docs) {
          const art = docSnap.data() as Article;
          if (art.slug === slugOrId || String(art.id) === String(slugOrId)) {
            art.view_count = (art.view_count || 0) + 1;
            if (!art.author_avatar) {
              if (art.author_id) {
                const u = localStore.users.find(usr => usr.id === art.author_id);
                if (u && u.avatar_url) art.author_avatar = u.avatar_url;
              }
              if (!art.author_avatar) {
                art.author_avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
              }
            }
            // Async increment
            setDoc(doc(firestoreDb, 'articles', String(art.id)), art).catch(() => {});
            return art;
          }
        }
      } catch (e) {
        // fallback to memory
      }
    }

    const found = localStore.news_articles.find(a => a.slug === slugOrId || String(a.id) === String(slugOrId));
    if (found) {
      found.view_count = (found.view_count || 0) + 1;
      if (!found.author_avatar) {
        if (found.author_id) {
          const u = localStore.users.find(usr => usr.id === found.author_id);
          if (u && u.avatar_url) found.author_avatar = u.avatar_url;
        }
        if (!found.author_avatar) {
          found.author_avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
        }
      }
      saveFallbackStore();
      return found;
    }
    return null;
  },

  async getCategories(includeInactive = false): Promise<Category[]> {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'categories'));
        if (!snap.empty) {
          const deletedIds = new Set(localStore.deleted_category_ids || []);
          const cats = snap.docs
            .map(d => d.data() as Category)
            .filter(c => c && !deletedIds.has(c.id) && (includeInactive || c.is_active !== false));
          const map = new Map<number, Category>();
          for (const c of cats) map.set(c.id, c);
          for (const c of localStore.categories) {
            if (!map.has(c.id) && !deletedIds.has(c.id) && (includeInactive || c.is_active)) {
              map.set(c.id, c);
            }
          }
          localStore.categories = Array.from(map.values());
        }
      } catch (e) {
        // fallback
      }
    }

    const deletedIds = new Set(localStore.deleted_category_ids || []);
    return localStore.categories
      .filter(c => !deletedIds.has(c.id) && (includeInactive || c.is_active))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map(c => {
        const count = localStore.news_articles.filter(a => a.category_id === c.id && a.status === 'published').length;
        return { ...c, article_count: count };
      });
  },

  async getTags(includeInactive = false): Promise<Tag[]> {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'tags'));
        if (!snap.empty) {
          const deletedIds = new Set(localStore.deleted_tag_ids || []);
          const remoteTags = snap.docs
            .map(d => d.data() as Tag)
            .filter(t => t && !deletedIds.has(t.id) && (includeInactive || t.is_active !== false));
          const map = new Map<number, Tag>();
          for (const t of remoteTags) map.set(t.id, t);
          for (const t of localStore.tags) {
            if (!map.has(t.id) && !deletedIds.has(t.id) && (includeInactive || t.is_active !== false)) {
              map.set(t.id, t);
            }
          }
          localStore.tags = Array.from(map.values());
        }
      } catch (e) {
        // fallback
      }
    }

    const deletedIds = new Set(localStore.deleted_tag_ids || []);
    const tagsToReturn = localStore.tags.filter(t => 
      !deletedIds.has(t.id) && (includeInactive || t.is_active !== false)
    );

    return tagsToReturn.map(t => {
      const count = localStore.news_articles.filter(a => 
        a.status === 'published' && (
          (a.tags && a.tags.some(tagStr => tagStr.toLowerCase() === t.name.toLowerCase() || tagStr.toLowerCase() === t.slug.toLowerCase())) ||
          (a.seo_keywords && a.seo_keywords.toLowerCase().includes(t.name.toLowerCase())) ||
          a.title.toLowerCase().includes(t.name.toLowerCase())
        )
      ).length;
      return { ...t, article_count: count };
    });
  },

  async getBreakingNews(includeInactive = false): Promise<BreakingNewsItem[]> {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'breaking_news'));
        if (!snap.empty) {
          const deletedIds = new Set(localStore.deleted_breaking_ids || []);
          const remoteItems = snap.docs
            .map(d => d.data() as BreakingNewsItem)
            .filter(b => b && !deletedIds.has(b.id) && (includeInactive || b.is_active !== false));
          const map = new Map<number, BreakingNewsItem>();
          for (const b of remoteItems) map.set(b.id, b);
          for (const b of localStore.breaking_news) {
            if (!map.has(b.id) && !deletedIds.has(b.id) && (includeInactive || b.is_active)) {
              map.set(b.id, b);
            }
          }
          localStore.breaking_news = Array.from(map.values());
        }
      } catch (e) {
        // fallback
      }
    }

    const deletedIds = new Set(localStore.deleted_breaking_ids || []);
    return localStore.breaking_news
      .filter(b => !deletedIds.has(b.id) && (includeInactive || b.is_active))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  async getAdvertisements(placement?: string, includeAll = false): Promise<Advertisement[]> {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'advertisements'));
        if (!snap.empty) {
          const deletedIds = new Set(localStore.deleted_ad_ids || []);
          const remoteAds = snap.docs
            .map(d => d.data() as Advertisement)
            .filter(a => a && a.id && !deletedIds.has(a.id));
          const map = new Map<number, Advertisement>();
          for (const a of remoteAds) map.set(a.id, a);
          for (const a of localStore.advertisements) {
            if (!map.has(a.id) && !deletedIds.has(a.id)) {
              map.set(a.id, a);
            }
          }
          localStore.advertisements = Array.from(map.values());
        }
      } catch (e) {
        // fallback
      }
    }

    const deletedIds = new Set(localStore.deleted_ad_ids || []);
    const today = new Date().toISOString().split('T')[0];

    return localStore.advertisements
      .filter(a => {
        if (deletedIds.has(a.id)) return false;
        if (includeAll) return true;
        if (!a.is_active || a.status === 'inactive' || a.status === 'draft') return false;
        if (placement && a.placement !== placement) return false;
        if (a.start_date && a.start_date > today) return false;
        if (a.end_date && a.end_date < today) return false;
        return true;
      })
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  async getSiteSettings(): Promise<Record<string, string>> {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'settings', 'general'));
        if (snap.exists()) {
          localStore.site_settings = { ...localStore.site_settings, ...snap.data() };
        }
      } catch (e) {
        // fallback
      }
    }

    return localStore.site_settings;
  },

  async saveContactMessage(msg: { name: string; email: string; phone?: string; subject: string; message: string }) {
    const newMessage: ContactMessage = {
      id: Date.now(),
      ...msg,
      is_read: false,
      created_at: new Date().toISOString()
    };

    localStore.contact_messages.unshift(newMessage);
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, 'contact_messages', String(newMessage.id)), newMessage);
      } catch (e: any) {
        console.warn('[Firebase] Contact message write error:', e.message);
      }
    }

    return newMessage;
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'contact_messages'));
        if (!snap.empty) {
          const list: ContactMessage[] = [];
          snap.forEach(docSnap => {
            list.push(docSnap.data() as ContactMessage);
          });
          if (list.length > 0) {
            return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }
        }
      } catch (e) {
        // fallback to localStore
      }
    }
    return [...localStore.contact_messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async toggleContactMessageRead(id: number) {
    const item = localStore.contact_messages.find(m => m.id === id);
    if (!item) return null;
    item.is_read = !item.is_read;
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      setDoc(doc(firestoreDb, 'contact_messages', String(id)), item).catch(() => {});
    }
    return item;
  },

  async deleteContactMessage(id: number) {
    const idx = localStore.contact_messages.findIndex(m => m.id === id);
    if (idx === -1) return false;
    localStore.contact_messages.splice(idx, 1);
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      deleteDoc(doc(firestoreDb, 'contact_messages', String(id))).catch(() => {});
    }
    return true;
  },

  async markAllContactMessagesRead() {
    localStore.contact_messages.forEach(m => {
      m.is_read = true;
      if (firestoreDb && isFirestoreActive) {
        setDoc(doc(firestoreDb, 'contact_messages', String(m.id)), m).catch(() => {});
      }
    });
    saveFallbackStore();
    return true;
  },

  // ADMIN / CMS OPERATIONS
  async getMetrics() {
    const all = localStore.news_articles;
    return {
      total_articles: all.length,
      published_articles: all.filter(a => a.status === 'published').length,
      draft_articles: all.filter(a => a.status === 'draft').length,
      pending_review: all.filter(a => a.status === 'pending_review').length,
      approved_articles: all.filter(a => a.status === 'approved').length,
      scheduled_articles: all.filter(a => a.status === 'scheduled').length,
      rejected_articles: all.filter(a => a.status === 'rejected').length,
      total_categories: localStore.categories.length,
      total_tags: localStore.tags.length,
      total_users: localStore.users.length,
      total_views: all.reduce((sum, a) => sum + (a.view_count || 0), 0),
      active_advertisements: localStore.advertisements.filter(a => a.is_active).length,
      total_inquiries: localStore.contact_messages.length,
      unread_inquiries: localStore.contact_messages.filter(m => !m.is_read).length
    };
  },

  async findUserByEmail(email: string) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'users'));
        for (const d of snap.docs) {
          const u = d.data() as User;
          if (u.email.toLowerCase() === email.toLowerCase()) return u;
        }
      } catch (e) {
        // fallback
      }
    }
    return localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async findUserById(id: number) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'users', String(id)));
        if (snap.exists()) return snap.data() as User;
      } catch (e) {
        // fallback
      }
    }
    return localStore.users.find(u => u.id === id);
  },

  async getUsers() {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'users'));
        if (!snap.empty) {
          const remoteUsers = snap.docs.map(d => d.data() as User).filter(Boolean);
          const map = new Map<number, User>();
          for (const u of remoteUsers) map.set(u.id, u);
          for (const u of localStore.users) {
            if (!map.has(u.id)) map.set(u.id, u);
          }
          localStore.users = Array.from(map.values());
        }
      } catch (e) {
        // fallback
      }
    }
    return localStore.users.map(({ password_hash, ...rest }) => rest);
  },

  async registerUser(userData: {
    name: string;
    email: string;
    phone: string;
    password_hash: string;
    requested_role: 'reporter' | 'editor' | string;
    role_id: number;
    role_name: string;
    avatar_url?: string;
    approval_status?: 'pending' | 'approved' | 'rejected';
    is_active?: boolean;
    bio?: string;
    assigned_region?: string;
  }): Promise<User> {
    const newUser: User = {
      id: Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      password_hash: userData.password_hash,
      avatar_url: userData.avatar_url || '',
      requested_role: userData.requested_role,
      role_id: userData.role_id || (userData.requested_role === 'editor' ? 4 : 5),
      role_name: userData.role_name || (userData.requested_role === 'editor' ? 'Editor (Pending)' : 'Reporter (Pending)'),
      approval_status: 'pending',
      is_active: false,
      bio: userData.bio || `${userData.requested_role === 'editor' ? 'संपादक' : 'रिपोर्टर'} (पंजीकृत)`,
      assigned_region: userData.assigned_region || 'गाजियाबाद / दिल्ली एनसीआर',
      created_at: new Date().toISOString()
    };

    localStore.users.unshift(newUser);
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(newUser);
        await setDoc(doc(firestoreDb, 'users', String(newUser.id)), payload);
      } catch (e: any) {
        console.warn('[Firebase] Register user write notice:', e.message);
      }
    }

    return newUser;
  },

  async approveUser(
    id: number, 
    approver: { id: number; name: string }, 
    assignedRoleId?: number, 
    notes?: string
  ): Promise<User> {
    const user = localStore.users.find(u => u.id === id);
    if (!user) {
      throw new Error('उपयोगकर्ता नहीं मिला।');
    }

    const finalRoleId = assignedRoleId || (user.requested_role === 'editor' ? 4 : 5);
    const finalRoleName = finalRoleId === 1 ? 'Super Admin' : finalRoleId === 4 ? 'Editor' : 'Reporter';

    user.approval_status = 'approved';
    user.is_active = true;
    user.role_id = finalRoleId;
    user.role_name = finalRoleName;
    user.approved_by = approver.id;
    user.approved_by_name = approver.name;
    user.approved_at = new Date().toISOString();
    user.approval_notes = notes || 'व्यवस्थापक द्वारा स्वीकृत';
    user.updated_at = new Date().toISOString();

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, 'users', String(user.id)), payload);
      } catch (e: any) {
        console.warn('[Firebase] Approve user error:', e.message);
      }
    }

    return user;
  },

  async rejectUser(
    id: number, 
    approver: { id: number; name: string }, 
    notes?: string
  ): Promise<User> {
    const user = localStore.users.find(u => u.id === id);
    if (!user) {
      throw new Error('उपयोगकर्ता नहीं मिला।');
    }

    user.approval_status = 'rejected';
    user.is_active = false;
    user.approved_by = approver.id;
    user.approved_by_name = approver.name;
    user.approved_at = new Date().toISOString();
    user.approval_notes = notes || 'व्यवस्थापक द्वारा अस्वीकृत';
    user.updated_at = new Date().toISOString();

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, 'users', String(user.id)), payload);
      } catch (e: any) {
        console.warn('[Firebase] Reject user error:', e.message);
      }
    }

    return user;
  },

  async changeUserRole(
    id: number, 
    roleId: number, 
    approver: { id: number; name: string }
  ): Promise<User> {
    const user = localStore.users.find(u => u.id === id);
    if (!user) {
      throw new Error('उपयोगकर्ता नहीं मिला।');
    }

    const validRoles: Record<number, string> = {
      1: 'Super Admin',
      4: 'Editor',
      5: 'Reporter'
    };

    if (!validRoles[roleId]) {
      throw new Error('अमान्य भूमिका ID। केवल सुपर एडमिन (1), संपादक (4), या रिपोर्टर (5) अनुमत हैं।');
    }

    user.role_id = roleId;
    user.role_name = validRoles[roleId];
    user.updated_at = new Date().toISOString();

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, 'users', String(user.id)), payload);
      } catch (e: any) {
        console.warn('[Firebase] Change user role error:', e.message);
      }
    }

    return user;
  },

  async toggleUserActive(id: number): Promise<User> {
    const user = localStore.users.find(u => u.id === id);
    if (!user) {
      throw new Error('उपयोगकर्ता नहीं मिला।');
    }

    user.is_active = !user.is_active;
    user.updated_at = new Date().toISOString();

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, 'users', String(user.id)), payload);
      } catch (e: any) {
        console.warn('[Firebase] Toggle user active error:', e.message);
      }
    }

    return user;
  },

  async saveUser(user: Partial<User>) {
    let savedUser: User;
    if (user.id) {
      const idx = localStore.users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        localStore.users[idx] = { ...localStore.users[idx], ...user, updated_at: new Date().toISOString() };
        savedUser = localStore.users[idx];
      } else {
        savedUser = user as User;
      }
    } else {
      const roleId = user.role_id || 5;
      const roleName = roleId === 1 ? 'Super Admin' : roleId === 4 ? 'Editor' : 'Reporter';
      savedUser = {
        id: Date.now(),
        name: user.name || 'नया उपयोगकर्ता',
        email: user.email || `user${Date.now()}@teznazar.com`,
        password_hash: user.password_hash || '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq',
        role_id: roleId,
        role_name: roleName,
        phone: user.phone,
        bio: user.bio,
        assigned_region: user.assigned_region || 'गाजियाबाद / दिल्ली एनसीआर',
        approval_status: user.approval_status || 'approved',
        is_active: user.is_active !== undefined ? user.is_active : true,
        created_at: new Date().toISOString()
      };
      localStore.users.push(savedUser);
    }
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedUser);
        await setDoc(doc(firestoreDb, 'users', String(savedUser.id)), payload);
      } catch (e: any) {
        console.warn('[Firebase] Save user error:', e.message);
      }
    }

    return savedUser;
  },

  async deleteUser(id: number): Promise<boolean> {
    const idx = localStore.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    
    // Safety check: Cannot delete Super Admin account
    if (id === 1 || localStore.users[idx].role_id === 1) {
      throw new Error('मुख्य व्यवस्थापक (Super Admin) को हटाया नहीं जा सकता।');
    }

    localStore.users.splice(idx, 1);
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, 'users', String(id)));
      } catch (e: any) {
        console.warn('[Firebase] Delete user error:', e.message);
      }
    }

    return true;
  },

  async updateUserProfile(userId: number, data: { name?: string; email?: string; phone?: string; password_hash?: string; avatar_url?: string }) {
    const user = localStore.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('उपयोगकर्ता नहीं मिला।');
    }
    if (data.name && data.name.trim()) {
      user.name = data.name.trim();
    }
    if (data.email && data.email.trim()) {
      const newEmail = data.email.trim().toLowerCase();
      const existing = localStore.users.find(u => u.email.toLowerCase() === newEmail && u.id !== userId);
      if (existing) {
        throw new Error('यह ईमेल पहले से किसी अन्य खाते में उपयोग में है।');
      }
      user.email = newEmail;
    }
    if (data.phone !== undefined) {
      user.phone = data.phone.trim();
    }
    if (data.avatar_url !== undefined) {
      user.avatar_url = data.avatar_url.trim();
    }
    if (data.password_hash) {
      user.password_hash = data.password_hash;
    }
    user.updated_at = new Date().toISOString();
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, 'users', String(user.id)), payload);
      } catch (e: any) {
        console.warn('[Firebase] Update user profile notice:', e.message);
      }
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async saveArticle(art: Partial<Article>, userId: number, userRole: number) {
    const now = new Date().toISOString();
    const user = localStore.users.find(u => u.id === userId);
    const userName = user?.name || 'संपादक';
    const isReporterRole = userRole === 5;

    // 1. Slug is completely OPTIONAL. Auto-generate if omitted or empty.
    let slug = (art.slug && typeof art.slug === 'string') ? art.slug.trim() : '';
    if (!slug) {
      const titleClean = (art.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097F]+/gi, '-')
        .slice(0, 80)
        .replace(/^-+|-+$/g, '');
      slug = titleClean ? `${titleClean}-${Date.now().toString().slice(-6)}` : `news-${Date.now()}`;
    }

    // 2. Excerpt is completely OPTIONAL. Auto-generate from article content if omitted or empty.
    let excerpt = (art.excerpt && typeof art.excerpt === 'string') ? art.excerpt.trim() : '';
    if (!excerpt && art.content) {
      const stripped = art.content.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
      excerpt = stripped.slice(0, 160) + (stripped.length > 160 ? '...' : '');
    }
    if (!excerpt) {
      excerpt = 'ताज़ा समाचार एवं विस्तृत विवरण के लिए पढ़ें।';
    }

    const hasVideo = !!art.video_url && art.video_url.trim().length > 0;
    const isVideoNews = art.is_video_news !== undefined ? !!art.is_video_news : hasVideo;

    const categoryId = art.category_id ? parseInt(String(art.category_id), 10) : 1;
    const cat = localStore.categories.find(c => c.id === categoryId);
    const category_name = cat?.name_hi || art.category_name || 'ताज़ा खबर';
    const category_slug = cat?.slug || art.category_slug || 'latest';

    // Author selection: Reporters are automatically locked to their own user ID!
    // Reporters CANNOT change ownership or assign to another author.
    const assignedAuthorId = isReporterRole ? userId : (art.author_id ? parseInt(String(art.author_id), 10) : userId);
    const authorUser = isReporterRole ? user : (localStore.users.find(u => u.id === assignedAuthorId) || user);
    const author_name = authorUser?.name || user?.name || art.author_name || 'ब्लैक लेंस डेस्क';
    const author_avatar = authorUser?.avatar_url || user?.avatar_url || art.author_avatar || '';

    // Tags processing: can be array or comma-separated string
    let parsedTags: string[] = [];
    if (Array.isArray(art.tags)) {
      parsedTags = art.tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof art.tags === 'string' && (art.tags as string).trim()) {
      parsedTags = (art.tags as string).split(',').map(t => t.trim()).filter(Boolean);
    }

    let articleToSave: Article;

    if (art.id) {
      const idx = localStore.news_articles.findIndex(a => a.id === art.id);
      if (idx !== -1) {
        const existing = localStore.news_articles[idx];

        // Security check for reporter editing
        if (isReporterRole) {
          if (existing.author_id !== userId) {
            throw new Error('सुरक्षा नियम: आप केवल अपने द्वारा प्रस्तुत समाचार ही संपादित कर सकते हैं। अन्य रिपोर्टरों के समाचारों तक पहुंच वर्जित है।');
          }
          if (existing.status !== 'draft' && existing.status !== 'rejected') {
            throw new Error('रिपोर्टर केवल ड्राफ्ट या सुधार हेतु लौटाई गई (Needs Revision) खबरें ही संपादित कर सकते हैं। समीक्षाधीन या प्रकाशित खबरें संपादित नहीं की जा सकतीं।');
          }
        }

        const prevStatus = existing.status;
        // Reporters can only set status to 'draft' or 'pending_review'
        let newStatus: ArticleStatus;
        if (isReporterRole) {
          newStatus = art.status === 'draft' ? 'draft' : 'pending_review';
        } else {
          newStatus = (art.status || existing.status) as ArticleStatus;
        }

        // Audit log entry
        const auditLog: ArticleAuditLog = {
          action: prevStatus !== newStatus ? `status_changed:${newStatus}` : 'edited',
          user_id: userId,
          user_name: userName,
          timestamp: now,
          from_status: prevStatus,
          to_status: newStatus,
          notes: art.review_notes || undefined
        };

        const existingAuditLogs = Array.isArray(existing.audit_logs) ? existing.audit_logs : [];

        articleToSave = {
          ...existing,
          ...art,
          slug,
          excerpt,
          is_video_news: isVideoNews,
          category_id: categoryId,
          category_name,
          category_slug,
          author_id: assignedAuthorId,
          author_name,
          author_avatar: author_avatar || existing.author_avatar || '',
          tags: parsedTags.length > 0 ? parsedTags : (existing.tags || []),
          id: existing.id,
          status: newStatus,
          updated_at: now,
          published_at: (newStatus === 'published' && !existing.published_at) ? now : (art.published_at || existing.published_at || (newStatus === 'published' ? now : '')),
          audit_logs: [auditLog, ...existingAuditLogs.slice(0, 30)]
        };
        localStore.news_articles[idx] = articleToSave;
      } else {
        throw new Error('संपादित करने के लिए समाचार नहीं मिला।');
      }
    } else {
      const newId = Date.now();
      // Reporters can only set status to 'draft' or 'pending_review'
      const initialStatus = isReporterRole 
        ? (art.status === 'draft' ? 'draft' : 'pending_review')
        : ((art.status || 'published') as ArticleStatus);

      const auditLog: ArticleAuditLog = {
        action: 'created',
        user_id: userId,
        user_name: userName,
        timestamp: now,
        to_status: initialStatus
      };

      articleToSave = {
        id: newId,
        title: art.title || 'शीर्षक रहित समाचार',
        slug,
        subtitle: art.subtitle || '',
        excerpt,
        content: art.content || '',
        category_id: categoryId,
        category_name,
        category_slug,
        author_id: assignedAuthorId,
        author_name,
        author_avatar: author_avatar || '',
        location: art.location || 'गाजियाबाद',
        featured_image: art.featured_image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
        image_caption: art.image_caption || '',
        image_credit: art.image_credit || 'ब्लैक लेंस ब्यूरो',
        gallery_images: art.gallery_images || [],
        video_url: art.video_url || '',
        is_video_news: isVideoNews,
        is_breaking: !!art.is_breaking,
        is_featured: !!art.is_featured,
        is_trending: !!art.is_trending,
        is_on_home: art.is_on_home !== undefined ? art.is_on_home : true,
        status: initialStatus,
        tags: parsedTags,
        view_count: 0,
        seo_title: art.seo_title || '',
        seo_description: art.seo_description || '',
        seo_keywords: art.seo_keywords || parsedTags.join(', '),
        scheduled_at: art.scheduled_at || '',
        published_at: initialStatus === 'published' ? now : (art.published_at || ''),
        created_at: now,
        updated_at: now,
        audit_logs: [auditLog]
      };
      localStore.news_articles.unshift(articleToSave);
    }

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(articleToSave);
        await setDoc(doc(firestoreDb, 'articles', String(articleToSave.id)), payload);
        console.log(`[Firebase Firestore] Article successfully synced! (ID: ${articleToSave.id})`);
      } catch (e: any) {
        console.error('[Firebase] Article write error:', e.message);
      }
    }

    return articleToSave;
  },

  async updateArticleStatus(articleId: number, status: ArticleStatus, userId: number, userRole: number, notes?: string) {
    const idx = localStore.news_articles.findIndex(a => a.id === articleId);
    if (idx === -1) throw new Error('समाचार नहीं मिला।');

    const existing = localStore.news_articles[idx];

    // Role check:
    if (userRole === 5) {
      // Reporter can only toggle draft <-> pending_review on their own articles
      if (existing.author_id !== userId) {
        throw new Error('आप केवल अपनी ही खबरें समीक्षा हेतु भेज सकते हैं।');
      }
      if (status !== 'draft' && status !== 'pending_review') {
        throw new Error('रिपोर्टर को सीधे स्थिति बदलने का अधिकार नहीं है।');
      }
    }

    const now = new Date().toISOString();
    const user = localStore.users.find(u => u.id === userId);
    const userName = user?.name || 'व्यवस्थापक';
    const prevStatus = existing.status;

    const auditLog: ArticleAuditLog = {
      action: `status_change:${status}`,
      user_id: userId,
      user_name: userName,
      timestamp: now,
      from_status: prevStatus,
      to_status: status,
      notes: notes || undefined
    };

    const existingAuditLogs = Array.isArray(existing.audit_logs) ? existing.audit_logs : [];

    existing.status = status;
    existing.updated_at = now;
    if (notes) existing.review_notes = notes;
    if (status === 'approved' || status === 'published' || status === 'rejected') {
      existing.reviewed_by = userId;
      existing.reviewed_by_name = userName;
      existing.reviewed_at = now;
    }
    if (status === 'published' && !existing.published_at) {
      existing.published_at = now;
    }
    existing.audit_logs = [auditLog, ...existingAuditLogs.slice(0, 30)];

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, 'articles', String(existing.id)), cleanForFirestore(existing));
      } catch (e: any) {
        console.error('[Firebase] Article status update error:', e.message);
      }
    }

    return existing;
  },

  async reviewArticle(articleId: number, reviewerId: number, status: ArticleStatus, notes?: string) {
    const reviewer = localStore.users.find(u => u.id === reviewerId);
    const reviewerRole = reviewer?.role_id || 4;
    return this.updateArticleStatus(articleId, status, reviewerId, reviewerRole, notes);
  },

  async restoreArticle(id: number, userId: number, userRole: number) {
    return this.updateArticleStatus(id, 'draft', userId, userRole, 'आर्काइव/छिपाई गई स्थिति से बहाल किया गया');
  },

  async deleteArticle(id: number, permanent = false) {
    const idx = localStore.news_articles.findIndex(a => a.id === id);
    const removedArt = idx !== -1 ? localStore.news_articles[idx] : null;

    if (permanent) {
      if (!localStore.deleted_article_ids) localStore.deleted_article_ids = [];
      if (!localStore.deleted_article_ids.includes(id)) {
        localStore.deleted_article_ids.push(id);
      }
      if (idx !== -1) {
        localStore.news_articles.splice(idx, 1);
      }
    } else {
      if (idx !== -1) {
        // Soft delete: change status to archived
        localStore.news_articles[idx].status = 'archived';
        localStore.news_articles[idx].updated_at = new Date().toISOString();
      }
    }
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      if (permanent) {
        try {
          await deleteDoc(doc(firestoreDb, 'articles', String(id)));
        } catch (e) {
          try {
            await setDoc(doc(firestoreDb, 'articles', String(id)), cleanForFirestore({
              ...(removedArt || { id }),
              status: 'archived',
              is_on_home: false,
              is_breaking: false,
              is_featured: false,
              is_trending: false
            }));
          } catch (innerErr) {}
        }
      } else if (removedArt) {
        try {
          await setDoc(doc(firestoreDb, 'articles', String(id)), cleanForFirestore({
            ...removedArt,
            status: 'archived',
            is_on_home: false,
            is_breaking: false,
            is_featured: false,
            is_trending: false
          }));
        } catch (e) {
          // best-effort
        }
      }
    }
    return idx !== -1;
  },

  async saveCategory(cat: Partial<Category>) {
    let savedCat: Category;
    const name_hi = cat.name_hi?.trim() || 'नई श्रेणी';
    const name_en = cat.name_en?.trim() || name_hi;
    let slug = cat.slug?.trim() || '';
    if (!slug) {
      slug = (cat.name_en || cat.name_hi || '')
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097F]+/gi, '-')
        .slice(0, 50)
        .replace(/^-+|-+$/g, '');
      if (!slug) slug = `cat-${Date.now()}`;
    }

    // Ensure slug uniqueness: Check duplicate among existing active categories
    const duplicate = localStore.categories.find(c => c.slug.toLowerCase() === slug.toLowerCase() && c.id !== cat.id);
    if (duplicate) {
      throw new Error(`स्लग '${slug}' पहले से श्रेणी '${duplicate.name_hi}' द्वारा उपयोग में है।`);
    }

    if (cat.id) {
      // Remove from deleted list if restoring or updating
      if (localStore.deleted_category_ids) {
        localStore.deleted_category_ids = localStore.deleted_category_ids.filter(x => x !== cat.id);
      }
      const idx = localStore.categories.findIndex(c => c.id === cat.id);
      if (idx !== -1) {
        localStore.categories[idx] = { 
          ...localStore.categories[idx], 
          ...cat,
          name_hi,
          name_en,
          slug,
          is_active: cat.is_active !== undefined ? cat.is_active : localStore.categories[idx].is_active
        };
        savedCat = localStore.categories[idx];
      } else {
        savedCat = { ...cat, name_hi, name_en, slug, is_active: cat.is_active ?? true } as Category;
        localStore.categories.push(savedCat);
      }
    } else {
      const newId = Date.now();
      savedCat = {
        id: newId,
        name_hi,
        name_en,
        slug,
        description: cat.description || '',
        image_url: cat.image_url || '',
        display_order: cat.display_order || localStore.categories.length + 1,
        is_in_menu: cat.is_in_menu !== undefined ? cat.is_in_menu : true,
        is_in_home: cat.is_in_home !== undefined ? cat.is_in_home : true,
        is_active: cat.is_active !== undefined ? cat.is_active : true
      };
      localStore.categories.push(savedCat);
    }

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedCat);
        await setDoc(doc(firestoreDb, 'categories', String(savedCat.id)), payload);
      } catch (e: any) {
        // Silently handled fallback
      }
    }

    return savedCat;
  },

  async toggleCategoryActive(id: number) {
    const cat = localStore.categories.find(c => c.id === id);
    if (!cat) throw new Error('श्रेणी प्राप्त नहीं हुई।');
    cat.is_active = !cat.is_active;
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, 'categories', String(cat.id)), cleanForFirestore(cat));
      } catch (e) {
        // best-effort
      }
    }
    return cat;
  },

  async deleteCategory(id: number, reassignCategoryId = 1) {
    const idx = localStore.categories.findIndex(c => c.id === id);
    const removedCat = idx !== -1 ? localStore.categories[idx] : null;

    if (!localStore.deleted_category_ids) localStore.deleted_category_ids = [];
    if (!localStore.deleted_category_ids.includes(id)) {
      localStore.deleted_category_ids.push(id);
    }

    // Find fallback category so articles NEVER have broken references
    const fallbackCat = localStore.categories.find(c => c.id === reassignCategoryId && c.id !== id) ||
                        localStore.categories.find(c => c.id !== id) ||
                        { id: 1, name_hi: 'गाजियाबाद', slug: 'ghaziabad' };

    // Reassign all news articles belonging to this category
    const affectedArticles = localStore.news_articles.filter(a => a.category_id === id);
    for (const art of affectedArticles) {
      art.category_id = fallbackCat.id;
      art.category_name = fallbackCat.name_hi;
      art.category_slug = fallbackCat.slug;
      art.updated_at = new Date().toISOString();
      if (firestoreDb && isFirestoreActive) {
        setDoc(doc(firestoreDb, 'articles', String(art.id)), cleanForFirestore(art)).catch(() => {});
      }
    }

    if (idx !== -1) {
      localStore.categories.splice(idx, 1);
    }
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, 'categories', String(id)));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, 'categories', String(id)), cleanForFirestore({
            ...(removedCat || { id }),
            is_active: false
          }));
        } catch (innerErr) {}
      }
    }
    return idx !== -1;
  },

  async saveTag(tag: Partial<Tag>) {
    let savedTag: Tag;
    const name = tag.name?.trim() || 'नया टैग';
    let slug = tag.slug?.trim() || '';
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/gi, '-').slice(0, 40);
      if (!slug) slug = `tag-${Date.now()}`;
    }

    // Ensure slug uniqueness
    const duplicate = localStore.tags.find(t => t.slug.toLowerCase() === slug.toLowerCase() && t.id !== tag.id);
    if (duplicate) {
      throw new Error(`स्लग '${slug}' पहले से टैग '${duplicate.name}' द्वारा उपयोग में है।`);
    }

    if (tag.id) {
      if (localStore.deleted_tag_ids) {
        localStore.deleted_tag_ids = localStore.deleted_tag_ids.filter(x => x !== tag.id);
      }
      const idx = localStore.tags.findIndex(t => t.id === tag.id);
      if (idx !== -1) {
        localStore.tags[idx] = {
          ...localStore.tags[idx],
          ...tag,
          name,
          slug,
          is_active: tag.is_active !== undefined ? tag.is_active : localStore.tags[idx].is_active
        };
        savedTag = localStore.tags[idx];
      } else {
        savedTag = { ...tag, name, slug, is_active: tag.is_active ?? true } as Tag;
        localStore.tags.push(savedTag);
      }
    } else {
      const newId = Date.now();
      savedTag = {
        id: newId,
        name,
        slug,
        description: tag.description || '',
        is_popular: tag.is_popular !== undefined ? tag.is_popular : false,
        is_active: tag.is_active !== undefined ? tag.is_active : true
      };
      localStore.tags.push(savedTag);
    }

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, 'tags', String(savedTag.id)), cleanForFirestore(savedTag));
      } catch (e: any) {
        // Silently handled fallback
      }
    }

    return savedTag;
  },

  async toggleTagActive(id: number) {
    const tag = localStore.tags.find(t => t.id === id);
    if (!tag) throw new Error('टैग प्राप्त नहीं हुआ।');
    tag.is_active = !tag.is_active;
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, 'tags', String(tag.id)), cleanForFirestore(tag));
      } catch (e) {
        // best effort
      }
    }
    return tag;
  },

  async deleteTag(id: number) {
    const idx = localStore.tags.findIndex(t => t.id === id);
    const removedTag = idx !== -1 ? localStore.tags[idx] : null;

    if (!localStore.deleted_tag_ids) localStore.deleted_tag_ids = [];
    if (!localStore.deleted_tag_ids.includes(id)) {
      localStore.deleted_tag_ids.push(id);
    }

    // Safely remove tag references from articles
    if (removedTag) {
      for (const art of localStore.news_articles) {
        if (art.tags && Array.isArray(art.tags)) {
          art.tags = art.tags.filter(t => t !== removedTag.name && t !== removedTag.slug);
        }
      }
    }

    if (idx !== -1) {
      localStore.tags.splice(idx, 1);
    }
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, 'tags', String(id)));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, 'tags', String(id)), cleanForFirestore({
            ...(removedTag || { id }),
            is_active: false
          }));
        } catch (innerErr) {}
      }
    }
    return idx !== -1;
  },

  async saveBreakingNews(item: Partial<BreakingNewsItem>) {
    let savedItem: BreakingNewsItem;
    const now = new Date().toISOString();

    if (item.id) {
      if (localStore.deleted_breaking_ids) {
        localStore.deleted_breaking_ids = localStore.deleted_breaking_ids.filter(x => x !== item.id);
      }
      const idx = localStore.breaking_news.findIndex(b => b.id === item.id);
      if (idx !== -1) {
        localStore.breaking_news[idx] = { 
          ...localStore.breaking_news[idx], 
          ...item,
          updated_at: now
        };
        savedItem = localStore.breaking_news[idx];
      } else {
        savedItem = { ...item, updated_at: now } as BreakingNewsItem;
        localStore.breaking_news.push(savedItem);
      }
    } else {
      savedItem = {
        id: Date.now(),
        title: (item.title || '').trim(),
        article_id: item.article_id ? parseInt(String(item.article_id), 10) : null,
        external_url: item.external_url || null,
        display_order: item.display_order !== undefined ? item.display_order : localStore.breaking_news.length + 1,
        is_active: item.is_active !== undefined ? item.is_active : true,
        created_at: now,
        updated_at: now
      };
      localStore.breaking_news.unshift(savedItem);
    }

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedItem);
        await setDoc(doc(firestoreDb, 'breaking_news', String(savedItem.id)), payload);
      } catch (e: any) {
        // Silently handled fallback
      }
    }

    return savedItem;
  },

  async toggleBreakingNewsActive(id: number) {
    const item = localStore.breaking_news.find(b => b.id === id);
    if (!item) throw new Error('ब्रेकिंग न्यूज़ आइटम प्राप्त नहीं हुआ।');
    item.is_active = !item.is_active;
    item.updated_at = new Date().toISOString();
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, 'breaking_news', String(item.id)), cleanForFirestore(item));
      } catch (e) {
        // best effort
      }
    }
    return item;
  },

  async deleteBreakingNews(id: number) {
    const idx = localStore.breaking_news.findIndex(b => b.id === id);
    const removedItem = idx !== -1 ? localStore.breaking_news[idx] : null;

    if (!localStore.deleted_breaking_ids) localStore.deleted_breaking_ids = [];
    if (!localStore.deleted_breaking_ids.includes(id)) {
      localStore.deleted_breaking_ids.push(id);
    }

    if (idx !== -1) {
      localStore.breaking_news.splice(idx, 1);
    }
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      // 1. Attempt hard delete from Firestore
      try {
        await deleteDoc(doc(firestoreDb, 'breaking_news', String(id)));
      } catch (e) {
        // Fallback: If deleteDoc is restricted by Firestore rules, soft-deactivate doc
        try {
          await setDoc(doc(firestoreDb, 'breaking_news', String(id)), cleanForFirestore({
            id,
            title: removedItem?.title || 'हटाया गया समाचार',
            is_active: false,
            display_order: 999999,
            created_at: removedItem?.created_at || new Date().toISOString()
          }));
        } catch (innerErr) {}
      }
    }
    return true;
  },

  async saveAdvertisement(ad: Partial<Advertisement>) {
    let savedAd: Advertisement;
    const nowIso = new Date().toISOString();

    if (ad.id) {
      if (localStore.deleted_ad_ids) {
        localStore.deleted_ad_ids = localStore.deleted_ad_ids.filter(i => i !== ad.id);
      }
      const idx = localStore.advertisements.findIndex(a => a.id === ad.id);
      if (idx !== -1) {
        localStore.advertisements[idx] = { 
          ...localStore.advertisements[idx], 
          ...ad,
          is_active: ad.is_active !== undefined ? ad.is_active : (ad.status ? ad.status === 'active' : localStore.advertisements[idx].is_active)
        };
        savedAd = localStore.advertisements[idx];
      } else {
        savedAd = {
          ...ad,
          id: ad.id,
          title: ad.title || 'विज्ञापन',
          placement: ad.placement || 'sidebar',
          image_url: ad.image_url || '',
          destination_url: ad.destination_url || 'https://example.com',
          advertiser_name: ad.advertiser_name || '',
          description: ad.description || '',
          start_date: ad.start_date || nowIso.split('T')[0],
          end_date: ad.end_date || '2026-12-31',
          display_order: Number(ad.display_order) || 0,
          impressions_count: ad.impressions_count || 0,
          clicks_count: ad.clicks_count || 0,
          is_active: ad.is_active !== undefined ? ad.is_active : (ad.status ? ad.status === 'active' : true),
          status: ad.status || 'active',
          created_at: ad.created_at || nowIso
        } as Advertisement;
        localStore.advertisements.push(savedAd);
      }
    } else {
      const newId = Date.now();
      savedAd = {
        id: newId,
        title: ad.title || 'नया विज्ञापन',
        placement: ad.placement || 'sidebar',
        image_url: ad.image_url || '',
        destination_url: ad.destination_url || 'https://example.com',
        advertiser_name: ad.advertiser_name || '',
        description: ad.description || '',
        start_date: ad.start_date || nowIso.split('T')[0],
        end_date: ad.end_date || '2026-12-31',
        display_order: Number(ad.display_order) || (localStore.advertisements.length + 1),
        impressions_count: 0,
        clicks_count: 0,
        is_active: ad.is_active !== undefined ? ad.is_active : (ad.status ? ad.status === 'active' : true),
        status: ad.status || 'active',
        created_at: nowIso
      };
      localStore.advertisements.push(savedAd);
    }

    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedAd);
        await setDoc(doc(firestoreDb, 'advertisements', String(savedAd.id)), payload);
      } catch (e: any) {
        // best effort write
      }
    }

    return savedAd;
  },

  async toggleAdvertisementActive(id: number) {
    const item = localStore.advertisements.find(a => a.id === id);
    if (!item) throw new Error('विज्ञापन नहीं मिला।');
    item.is_active = !item.is_active;
    item.status = item.is_active ? 'active' : 'inactive';
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, 'advertisements', String(id)), cleanForFirestore(item));
      } catch (e) {
        // best effort
      }
    }
    return item;
  },

  async deleteAdvertisement(id: number) {
    const idx = localStore.advertisements.findIndex(a => a.id === id);
    const removedAd = idx !== -1 ? localStore.advertisements[idx] : null;

    if (!localStore.deleted_ad_ids) localStore.deleted_ad_ids = [];
    if (!localStore.deleted_ad_ids.includes(id)) {
      localStore.deleted_ad_ids.push(id);
    }

    if (idx !== -1) {
      localStore.advertisements.splice(idx, 1);
    }
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, 'advertisements', String(id)));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, 'advertisements', String(id)), cleanForFirestore({
            id,
            title: removedAd?.title || 'हटाया गया विज्ञापन',
            is_active: false,
            status: 'inactive'
          }));
        } catch (inner) {}
      }
    }
    return true;
  },

  async recordAdvertisementClick(id: number) {
    const item = localStore.advertisements.find(a => a.id === id);
    if (item) {
      item.clicks_count = (item.clicks_count || 0) + 1;
      saveFallbackStore();
      if (firestoreDb && isFirestoreActive) {
        try {
          await setDoc(doc(firestoreDb, 'advertisements', String(id)), cleanForFirestore(item));
        } catch (e) {}
      }
      return item.clicks_count;
    }
    return 0;
  },

  async saveSettings(settings: Record<string, string>) {
    // Preserve permanent brand identity (BLACK LENS) while allowing custom logo upload or restoration
    const newSiteLogo = settings.site_logo !== undefined ? settings.site_logo : (localStore.site_settings.site_logo || '');
    const protectedSettings = {
      ...settings,
      site_name: 'BLACK LENS',
      site_logo: newSiteLogo,
      logo_url: newSiteLogo || '/logo.svg'
    };
    localStore.site_settings = { ...localStore.site_settings, ...protectedSettings };
    localStore.site_settings.site_name = 'BLACK LENS';
    saveFallbackStore();

    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(localStore.site_settings);
        await setDoc(doc(firestoreDb, 'settings', 'general'), payload);
      } catch (e: any) {
        console.warn('[Firebase] Settings write notice:', e.message);
      }
    }

    return localStore.site_settings;
  },

  async checkAndPublishScheduled() {
    const now = new Date();
    let publishedCount = 0;
    for (const art of localStore.news_articles) {
      if (art.status === 'scheduled' && art.scheduled_at) {
        const schedTime = new Date(art.scheduled_at);
        if (schedTime <= now) {
          art.status = 'published';
          art.published_at = now.toISOString();
          publishedCount++;
          if (firestoreDb && isFirestoreActive) {
            setDoc(doc(firestoreDb, 'articles', String(art.id)), art).catch(() => {});
          }
        }
      }
    }
    if (publishedCount > 0) {
      saveFallbackStore();
    }
    return publishedCount;
  }
};
