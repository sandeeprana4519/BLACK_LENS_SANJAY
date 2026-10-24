import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Lock, User, LogOut, PlusCircle, CheckCircle, 
  XCircle, Clock, AlertTriangle, FileText, 
  BarChart3, Settings, Tag as TagIcon, FolderTree, 
  Megaphone, Flame, Shield, Eye, EyeOff, Edit3, Trash2, 
  Download, ArrowLeft, RefreshCw, Send, Check, Copy,
  Upload, Video, Image as ImageIcon, Link as LinkIcon, Film, Play, X, Loader2,
  Search, Filter, ChevronLeft, ChevronRight, AlertCircle, ArrowUpRight, RotateCcw,
  CheckSquare, MessageSquare, History, Globe, Users, UserCheck, UserX, ShieldAlert,
  LayoutDashboard, UserCog, KeyRound, Mail, PhoneCall, Layers, Sparkles,
  Hash, TrendingUp, ExternalLink, HelpCircle, CheckCheck, MapPin
} from 'lucide-react';
import { Article, Category, Tag, BreakingNewsItem, Advertisement, User as UserType, ArticleStatus, SiteSettings, ContactMessage } from '../types';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/video';

// Advertisement Placements & Dimensions Reference
export const AD_PLACEMENTS = [
  { 
    id: 'breaking_news', 
    name: '🔴 ब्रेकिंग न्यूज़ विज्ञापन (Breaking News Ticker & Scroll Strip)', 
    locationLabel: 'ये विज्ञापन ब्रेकिंग न्यूज के अंदर दिखेगा',
    dims: '400 × 250 px', 
    aspect: '16:10', 
    desc: 'होमपेज पर ब्रेकिंग न्यूज़ टिकर और स्क्रॉलिंग कार्ड्स के बीच विज्ञापन पोस्ट/कार्ड के रूप में दिखेगा।' 
  },
  { 
    id: 'live_desk', 
    name: '⚡ ताज़ा अपडेट लाइव डेस्क विज्ञापन (Live Updates Desk Feed)', 
    locationLabel: 'ये विज्ञापन ताज़ा अपडेट लाइव डेस्क के अंदर दिखेगा',
    dims: '320 × 200 px या 300 × 250 px', 
    aspect: '16:9 या 1.2:1', 
    desc: 'होमपेज के मुख्य हीरो सेक्शन में "ताज़ा अपडेट्स (Live Desk)" की खबरों के बीच विशेष विज्ञापन फॉर्मेट के रूप में दिखेगा।' 
  },
  { 
    id: 'category_khel', 
    name: '🏆 खेल जगत कैटेगरी विज्ञापन (Sports Section Ad Article)', 
    locationLabel: 'ये विज्ञापन खेल कैटेगरी के अंदर दिखेगा',
    dims: '400 × 250 px', 
    aspect: '16:10', 
    desc: 'होमपेज के खेल जगत ब्लॉक में समाचार कार्ड / विज्ञापन आर्टिकल के रूप में दिखेगा।' 
  },
  { 
    id: 'category_up', 
    name: '🏛️ उत्तर प्रदेश कैटेगरी विज्ञापन (UP News Section Ad Article)', 
    locationLabel: 'ये विज्ञापन उत्तर प्रदेश कैटेगरी के अंदर दिखेगा',
    dims: '400 × 250 px', 
    aspect: '16:10', 
    desc: 'होमपेज के उत्तर प्रदेश ब्लॉक में समाचार कार्ड / विज्ञापन आर्टिकल के रूप में दिखेगा।' 
  },
  { 
    id: 'video_section', 
    name: '🎬 वीडियो समाचार विज्ञापन (Video Section Ad Post)', 
    locationLabel: 'ये विज्ञापन वीडियो समाचार के अंदर दिखेगा',
    dims: '640 × 360 px', 
    aspect: '16:9', 
    desc: 'होमपेज के वीडियो समाचार सेक्शन में वीडियो कार्ड्स के साथ प्रायोजित वीडियो / बैनर विज्ञापन के रूप में दिखेगा।' 
  },
  { 
    id: 'header_banner', 
    name: '📌 मुख्य हेडर बैनर (Header / Top Leaderboard)', 
    locationLabel: 'ये विज्ञापन हेडर पर दिखेगा',
    dims: '728 × 90 px', 
    aspect: '8:1', 
    desc: 'शीर्ष नेविगेशन बार के तुरंत नीचे डेस्कटॉप पर प्रमुखता से प्रदर्शित होता है।' 
  },
  { 
    id: 'home_top', 
    name: '🏠 होमपेज टॉप लार्ज बैनर (Large Desktop Banner)', 
    locationLabel: 'ये विज्ञापन होमपेज के टॉप पर दिखेगा',
    dims: '970 × 250 px', 
    aspect: '4:1', 
    desc: 'होमपेज के मुख्य हीरो लीड स्टोरीज के ठीक ऊपर संपूर्ण चौड़ाई में दिखेगा।' 
  },
  { 
    id: 'sidebar', 
    name: '📋 साइडबार विज्ञापन (Sidebar Widget)', 
    locationLabel: 'ये विज्ञापन साइडबार में दिखेगा',
    dims: '300 × 250 px', 
    aspect: '1.2:1', 
    desc: 'समाचार पेजों व होमपेज के साइडबार विजेट सेक्शन में दिखेगा।' 
  },
  { 
    id: 'in_feed', 
    name: '📰 इन-फीड बैनर (In-Feed / Between Categories)', 
    locationLabel: 'ये विज्ञापन श्रेणियों के बीच में दिखेगा',
    dims: '728 × 90 px / 970 × 250 px', 
    aspect: '8:1', 
    desc: 'होमपेज पर विभिन्न श्रेणियों एवं वीडियो सेक्शन के बीच में दिखेगा।' 
  },
  { 
    id: 'article_inline', 
    name: '📄 आर्टिकल इनलाइन (In-Article Banner)', 
    locationLabel: 'ये विज्ञापन समाचार आर्टिकल के अंदर दिखेगा',
    dims: '728 × 90 px / 300 × 250 px', 
    aspect: 'रेस्पॉन्सिव', 
    desc: 'समाचार के विस्तृत विवरण के ठीक मध्य अथवा नीचे दिखेगा।' 
  },
  { 
    id: 'category_page', 
    name: '📑 कैटेगरी पेज बैनर (Category Page Header)', 
    locationLabel: 'ये विज्ञापन कैटेगरी पेज के शीर्ष पर दिखेगा',
    dims: '728 × 90 px', 
    aspect: '8:1', 
    desc: 'विशिष्ट श्रेणी व टैग आर्काइव पेजों के शीर्ष पर दिखेगा।' 
  },
  { 
    id: 'footer_banner', 
    name: '🔻 फुटर बैनर (Footer Banner)', 
    locationLabel: 'ये विज्ञापन फुटर के ऊपर दिखेगा',
    dims: '728 × 90 px / 970 × 250 px', 
    aspect: '8:1', 
    desc: 'मुख्य फुटर के ठीक ऊपर संपूर्ण चौड़ाई में दिखेगा।' 
  }
];

interface AdminPortalProps {
  onClose: () => void;
  categories: Category[];
  tags: Tag[];
  onRefreshData: () => void;
  initialAuthMode?: 'login' | 'register';
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  categories,
  tags,
  onRefreshData,
  initialAuthMode = 'login'
}) => {
  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tez_nazar_token'));
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('tez_nazar_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Registration form state (Module 7)
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialAuthMode);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRequestedRole, setRegRequestedRole] = useState<'reporter' | 'editor'>('reporter');
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regAvatarLoading, setRegAvatarLoading] = useState(false);

  // Editor Role Detection (Role 4 = Editor)
  const isEditor = !!currentUser && (
    currentUser.role_id === 4 ||
    (currentUser.role_name ? currentUser.role_name.toLowerCase().includes('editor') : false)
  );

  // Reporter Role Detection (Role 5 = Reporter)
  const isReporter = !!currentUser && !isEditor && (
    currentUser.role_id === 5 || 
    currentUser.role_id === 3 ||
    (currentUser.role_name ? currentUser.role_name.toLowerCase().includes('reporter') : false) ||
    (currentUser.role_id !== 1 && currentUser.role_id !== 2)
  );

  // Super Admin / Administrator (Role 1 or 2)
  const isSuperAdmin = !!currentUser && (currentUser.role_id === 1 || currentUser.role_id === 2);

  // Active Tab:
  // For Reporter: ONLY 'dashboard' | 'my_submissions' | 'new_article' | 'settings'
  // For Editor: ONLY 'dashboard' | 'articles' | 'new_article' | 'review_desk' | 'settings'
  // For Admin: 'dashboard' | 'articles' | 'new_article' | 'review_desk' | 'my_submissions' | 'user_approvals' | 'categories' | 'breaking' | 'ads' | 'reports' | 'database' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Reporter Submissions Filter & Search
  const [reporterFilter, setReporterFilter] = useState<'all' | 'published' | 'pending_review' | 'draft' | 'rejected'>('all');
  const [reporterSearchQuery, setReporterSearchQuery] = useState('');

  // Profile Settings State (Full Name, Email Address, Phone, Password, Journalist Bio & Region)
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar_url || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || '');
  const [profileRegion, setProfileRegion] = useState(currentUser?.assigned_region || '');
  const [profileAvatarLoading, setProfileAvatarLoading] = useState(false);
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [showProfilePasswords, setShowProfilePasswords] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [reporterStats, setReporterStats] = useState<{
    total_submitted: number;
    published: number;
    pending_review: number;
    draft: number;
    rejected: number;
    total_views: number;
  } | null>(null);

  // User Approvals state (Module 8)
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserType | null>(null);
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    user: UserType | null;
    action: 'approve' | 'reject' | 'role';
    roleId?: number;
    notes?: string;
  }>({ isOpen: false, user: null, action: 'approve', notes: '' });
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Metrics & Data Lists
  const [metrics, setMetrics] = useState<any>(null);
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>(categories || []);
  const [tagList, setTagList] = useState<Tag[]>(tags || []);
  const [breakingList, setBreakingList] = useState<BreakingNewsItem[]>([]);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [advertisementsList, setAdvertisementsList] = useState<Advertisement[]>([]);

  // Advertisement Modals state
  const [adModal, setAdModal] = useState<{
    isOpen: boolean;
    ad: Partial<Advertisement> | null;
  }>({ isOpen: false, ad: null });
  const [deleteAdModal, setDeleteAdModal] = useState<{
    isOpen: boolean;
    ad: Advertisement | null;
  }>({ isOpen: false, ad: null });
  const [adImageLoading, setAdImageLoading] = useState(false);
  const adImageFileRef = useRef<HTMLInputElement>(null);

  // Website Settings state
  const [settingsData, setSettingsData] = useState<SiteSettings>({
    site_name: 'ब्लैक लेंस (Black Lens)',
    site_tagline: 'सत्यमेव जयते · निर्भीक एवं निष्पक्ष डिजिटल समाचार',
    site_description: 'ब्लैक लेंस - गाजियाबाद, दिल्ली एनसीआर और देश-विदेश की ताज़ा एवं निष्पक्ष खबरें।',
    seo_title: 'ब्लैक लेंस | Black Lens Hindi News Portal',
    seo_description: 'ब्लैक लेंस हिंदी समाचार पोर्टल - राजनीति, अपराध, खेल, धर्म एवं गाजियाबाद विशेष',
    seo_keywords: 'गाजियाबाद समाचार, यूपी न्यूज़, ब्रेकिंग हिंदी न्यूज़, Ghaziabad News, Crime News UP, Delhi NCR News, Black Lens News Portal',
    trending_topics: '#गाजियाबाद_न्यूज़, #यूपी_अपडेट्स, #क्राइम_अलर्ट, #ट्रैफिक_अपडेट, #नमो_भारत, #राजनीति_हलचल',
    google_site_verification: '',
    google_analytics_id: '',
    canonical_url: 'https://blacklens.co.in',
    site_logo: '',
    header_logo: '',
    footer_logo: '',
    favicon_url: '',
    og_image: '',
    contact_email: 'contact@teznazar.com',
    contact_phone: '+91 120 4567890',
    contact_phone_alt: '+91 98765 43210',
    contact_address: 'ब्लैक लेंस मीडिया हाउस, प्रेस एंक्लेव, राजनगर',
    contact_city: 'गाजियाबाद',
    contact_state: 'उत्तर प्रदेश',
    contact_pincode: '201002',
    contact_country: 'भारत',
    facebook_url: 'https://facebook.com/teznazarnews',
    twitter_url: 'https://twitter.com/teznazarnews',
    youtube_url: 'https://youtube.com/@teznazarnews',
    instagram_url: 'https://instagram.com/teznazarnews',
    whatsapp_number: '+91 98765 43210',
    whatsapp_channel_url: 'https://whatsapp.com/channel/teznazar',
    copyright_text: '© 2026 ब्लैक लेंस डिजिटल मीडिया. सर्वाधिकार सुरक्षित।',
    footer_about: 'ब्लैक लेंस उत्तर प्रदेश, दिल्ली एनसीआर और देश का एक निर्भीक, विश्वसनीय एवं निष्पक्ष डिजिटल समाचार पोर्टल है।'
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);

  // Articles Filtering & Pagination state
  const [articlesFilter, setArticlesFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [deleteArticleModal, setDeleteArticleModal] = useState<{
    isOpen: boolean;
    article: Article | null;
    permanent: boolean;
  }>({ isOpen: false, article: null, permanent: false });

  // Editorial Review Modal state
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    article: Article | null;
    notes: string;
  }>({ isOpen: false, article: null, notes: '' });

  // Breaking News Modal state
  const [breakingModal, setBreakingModal] = useState<{
    isOpen: boolean;
    item: Partial<BreakingNewsItem> | null;
  }>({ isOpen: false, item: null });

  // Category Modals state
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    cat: Partial<Category> | null;
  }>({ isOpen: false, cat: null });
  const [deleteCatModal, setDeleteCatModal] = useState<{
    isOpen: boolean;
    cat: Category | null;
    reassignTo: number;
  }>({ isOpen: false, cat: null, reassignTo: 1 });

  // Tag Modals state
  const [tagModal, setTagModal] = useState<{
    isOpen: boolean;
    tag: Partial<Tag> | null;
  }>({ isOpen: false, tag: null });
  const [deleteTagModal, setDeleteTagModal] = useState<{
    isOpen: boolean;
    tag: Tag | null;
  }>({ isOpen: false, tag: null });

  // Breaking News Delete Modal state
  const [deleteBreakingModal, setDeleteBreakingModal] = useState<{
    isOpen: boolean;
    item: BreakingNewsItem | null;
  }>({ isOpen: false, item: null });

  // User Delete Modal state
  const [deleteUserModal, setDeleteUserModal] = useState<{
    isOpen: boolean;
    user: any | null;
  }>({ isOpen: false, user: null });

  // Admin Settings Sub-Tab: 'site' | 'profile' | 'seo'
  const [adminSettingsTab, setAdminSettingsTab] = useState<'site' | 'profile' | 'seo'>('site');
  const [seoDevicePreview, setSeoDevicePreview] = useState<'mobile' | 'desktop'>('mobile');
  const [seoCopiedNotice, setSeoCopiedNotice] = useState<string>('');

  // Contact Inquiries (संदेश व पूछताछ) state
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactFilter, setContactFilter] = useState<'all' | 'unread' | 'ad' | 'suggestion' | 'press' | 'complaint' | 'read'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteMessageModal, setDeleteMessageModal] = useState<{
    isOpen: boolean;
    msg: ContactMessage | null;
  }>({ isOpen: false, msg: null });


  // Global Toast / Message
  const [globalAlert, setGlobalAlert] = useState<{ text: string; type: 'success' | 'error' | 'info' | '' }>({ text: '', type: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const showAlert = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setGlobalAlert({ text, type });
    setTimeout(() => setGlobalAlert({ text: '', type: '' }), 4000);
  };

  // Article Form state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category_id: 1,
    author_id: 1,
    location: 'गाजियाबाद',
    featured_image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
    image_caption: '',
    image_credit: 'ब्लैक लेंस ब्यूरो',
    gallery_images: [] as string[],
    video_url: '',
    is_video_news: false,
    is_breaking: false,
    is_featured: false,
    is_trending: false,
    is_on_home: true,
    status: 'draft' as ArticleStatus,
    tags: [] as string[],
    tagsInput: '',
    scheduled_at: ''
  });
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Media upload state
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'upload'>('url');
  const [multiUrlInput, setMultiUrlInput] = useState('');

  // Handle uploading multiple images from PC/Device (1 to 5 images)
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = (Array.isArray(formData.gallery_images) && formData.gallery_images.length > 0)
      ? [...formData.gallery_images]
      : (formData.featured_image ? [formData.featured_image] : []);

    const remainingSlots = 5 - currentImages.length;
    if (remainingSlots <= 0) {
      showAlert('एक खबर में अधिकतम 5 तस्वीरें ही लगाई जा सकती हैं।', 'error');
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      showAlert(`अधिकतम 5 तस्वीरों की सीमा है। पहली ${remainingSlots} तस्वीरें चुनी गई हैं।`, 'info');
    }

    setImageUploadLoading(true);
    setFormMsg({ text: `${filesToUpload.length} तस्वीरें अपलोड हो रही हैं...`, type: 'info' });

    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  data: reader.result,
                  name: file.name,
                  type: file.type
                })
              });
              const json = await res.json();
              if (json.success && json.url) {
                resolve(json.url);
              } else {
                reject(new Error(json.message || 'अपलोड विफल रहा।'));
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error('फ़ाइल पढ़ने में त्रुटि हुई।'));
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(url);
      }

      const combined = [...currentImages, ...uploadedUrls].slice(0, 5);
      setFormData(prev => ({
        ...prev,
        featured_image: combined[0] || prev.featured_image,
        gallery_images: combined
      }));
      setFormMsg({ text: `✓ ${uploadedUrls.length} नई तस्वीरें सफलतापूर्वक अपलोड हो गईं! (कुल: ${combined.length}/5)`, type: 'success' });
    } catch (err: any) {
      setFormMsg({ text: err.message || 'तस्वीरें अपलोड करने में त्रुटि हुई।', type: 'error' });
    } finally {
      setImageUploadLoading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!multiUrlInput.trim()) return;
    const currentImages = (Array.isArray(formData.gallery_images) && formData.gallery_images.length > 0)
      ? [...formData.gallery_images]
      : (formData.featured_image ? [formData.featured_image] : []);

    if (currentImages.length >= 5) {
      showAlert('एक खबर में अधिकतम 5 तस्वीरें ही लगाई जा सकती हैं।', 'error');
      return;
    }

    const newImages = [...currentImages, multiUrlInput.trim()].slice(0, 5);
    setFormData(prev => ({
      ...prev,
      featured_image: newImages[0],
      gallery_images: newImages
    }));
    setMultiUrlInput('');
    setFormMsg({ text: `✓ नई तस्वीर जोड़ी गई (कुल: ${newImages.length}/5)`, type: 'success' });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const currentImages = (Array.isArray(formData.gallery_images) && formData.gallery_images.length > 0)
      ? [...formData.gallery_images]
      : (formData.featured_image ? [formData.featured_image] : []);

    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({
      ...prev,
      featured_image: updated[0] || '',
      gallery_images: updated
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    const currentImages = (Array.isArray(formData.gallery_images) && formData.gallery_images.length > 0)
      ? [...formData.gallery_images]
      : (formData.featured_image ? [formData.featured_image] : []);

    const target = currentImages[indexToPrimary];
    if (!target) return;
    const remaining = currentImages.filter((_, idx) => idx !== indexToPrimary);
    const updated = [target, ...remaining];
    setFormData(prev => ({
      ...prev,
      featured_image: target,
      gallery_images: updated
    }));
    setFormMsg({ text: '✓ मुख्य (कवर) तस्वीर बदल दी गई है!', type: 'success' });
  };

  // Handle uploading video from PC
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      alert('फ़ाइल का आकार 80MB से कम होना चाहिए। बड़े वीडियो के लिए कृपया यूट्यूब लिंक का उपयोग करें।');
      return;
    }

    setVideoUploadLoading(true);
    setFormMsg({ text: '', type: '' });
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: reader.result,
            name: file.name,
            type: file.type
          })
        });
        const json = await res.json();
        if (json.success && json.url) {
          setFormData(prev => ({ ...prev, video_url: json.url, is_video_news: true }));
          setFormMsg({ text: 'वीडियो सफलतापूर्वक अपलोड हो गया!', type: 'success' });
        } else {
          setFormMsg({ text: json.message || 'वीडियो अपलोड विफल रहा।', type: 'error' });
        }
      } catch (err: any) {
        setFormMsg({ text: err.message || 'वीडियो अपलोड में त्रुटि हुई।', type: 'error' });
      } finally {
        setVideoUploadLoading(false);
        if (videoInputRef.current) videoInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Fetch CMS dashboard data (Role-specific: Reporter receives only their own stats)
  const fetchDashboardData = async () => {
    const activeToken = token || localStorage.getItem('tez_nazar_token');
    if (!activeToken) return;
    try {
      const cacheBust = '?t=' + Date.now();
      const authHeader = { 'Authorization': `Bearer ${activeToken}` };

      // Reporter-specific data fetching (Does NOT call admin-only endpoints)
      if (isReporter) {
        try {
          const [statsRes, newsRes, catRes, tagsRes] = await Promise.all([
            fetch('/api/reporter/stats' + cacheBust, { headers: authHeader }),
            fetch(`/api/admin/news?status=all&limit=200&t=${Date.now()}`, { headers: authHeader }),
            fetch('/api/categories' + cacheBust),
            fetch('/api/tags' + cacheBust)
          ]);

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData && statsData.success && statsData.data) {
              setReporterStats(statsData.data);
            }
          }
          if (newsRes.ok) {
            const newsData = await newsRes.json();
            if (newsData && newsData.success && Array.isArray(newsData.data)) {
              setArticlesList(newsData.data);
            }
          }
          if (catRes.ok) {
            const catData = await catRes.json();
            if (catData && catData.success && Array.isArray(catData.data)) {
              setCategoryList(catData.data);
            }
          }
          if (tagsRes.ok) {
            const tagsData = await tagsRes.json();
            if (tagsData && tagsData.success && Array.isArray(tagsData.data)) {
              setTagList(tagsData.data);
            }
          }
        } catch (e) {
          console.error('[Reporter Portal] Data fetch notice:', e);
        }
        return;
      }

      // Admin / Editor data fetching
      const [metricsRes, newsRes, catRes, breakRes, tagsRes, adsRes, settingsRes, contactRes] = await Promise.all([
        fetch('/api/admin/metrics' + cacheBust, { headers: authHeader }),
        fetch(`/api/admin/news?status=all&limit=200&t=${Date.now()}`, { headers: authHeader }),
        fetch('/api/admin/categories' + cacheBust, { headers: authHeader }),
        fetch('/api/admin/breaking-news' + cacheBust, { headers: authHeader }),
        fetch('/api/admin/tags' + cacheBust, { headers: authHeader }),
        fetch('/api/admin/advertisements' + cacheBust, { headers: authHeader }),
        fetch('/api/settings' + cacheBust),
        fetch('/api/admin/contact-messages' + cacheBust, { headers: authHeader })
      ]);

      const [metricsData, newsData, catData, breakData, tagsData, adsData, settingsResData, contactData] = await Promise.all([
        metricsRes.json(),
        newsRes.json(),
        catRes.json(),
        breakRes.json(),
        tagsRes.json(),
        adsRes.json(),
        settingsRes.json(),
        contactRes.json()
      ]);

      if (metricsData.success) setMetrics(metricsData.data);
      if (newsData.success) setArticlesList(newsData.data);
      if (catData.success) setCategoryList(catData.data);
      if (breakData.success) setBreakingList(breakData.data);
      if (tagsData.success) setTagList(tagsData.data);
      if (adsData.success) setAdvertisementsList(adsData.data);
      if (settingsResData.success && settingsResData.data) {
        setSettingsData(prev => ({ ...prev, ...settingsResData.data }));
      }
      if (contactData.success && Array.isArray(contactData.data)) {
        setContactMessages(contactData.data);
      }

      // Fetch users for author assignment (admin/editor)
      if (currentUser && (currentUser.role_id === 1 || currentUser.role_id === 2 || currentUser.role_id === 4)) {
        try {
          const userRes = await fetch('/api/admin/users' + cacheBust, { headers: authHeader });
          const userData = await userRes.json();
          if (userData.success) setUsersList(userData.data);
        } catch (e) {}
      }
    } catch (e) {
      console.error('[AdminPortal] Error loading dashboard data:', e);
    }
  };

  // Manual refresh with visual feedback, loading spinner and toast
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData();
      if (onRefreshData) {
        onRefreshData();
      }
      showAlert('✓ डैशबोर्ड एवं ताज़ा डेटा सफलतापूर्वक रिफ्रेश किया गया!', 'success');
    } catch (err: any) {
      showAlert('रिफ्रेश विफल: ' + (err.message || 'नेटवर्क समस्या'), 'error');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Sync profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
      setProfileAvatar(currentUser.avatar_url || '');
    }
  }, [currentUser]);

  // Security: Restrict tabs strictly based on role
  useEffect(() => {
    if (isReporter) {
      const allowedReporterTabs = ['dashboard', 'my_submissions', 'new_article', 'settings'];
      if (!allowedReporterTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (isEditor) {
      const allowedEditorTabs = ['dashboard', 'articles', 'new_article', 'review_desk', 'settings', 'inquiries'];
      if (!allowedEditorTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [isReporter, isEditor, activeTab]);

  // Sync profile form states whenever currentUser updates
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
      setProfileAvatar(currentUser.avatar_url || '');
      setProfileBio(currentUser.bio || '');
      setProfileRegion(currentUser.assigned_region || '');
    }
  }, [currentUser]);

  // Profile Update Handler for Reporter, Editor & Admin (Name, Email, Mobile/Phone, Avatar, Bio, Region, Password)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });

    if (!profileName.trim()) {
      setProfileMsg({ text: 'कृपया अपना पूरा नाम दर्ज करें।', type: 'error' });
      return;
    }
    if (!profileEmail.trim()) {
      setProfileMsg({ text: 'कृपया वैध ईमेल पता दर्ज करें।', type: 'error' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileEmail.trim())) {
      setProfileMsg({ text: 'कृपया सही ईमेल प्रारूप (जैसे editor@example.com) दर्ज करें।', type: 'error' });
      return;
    }

    if (profileNewPassword) {
      if (!profileCurrentPassword) {
        setProfileMsg({ text: 'पासवर्ड बदलने हेतु कृपया वर्तमान पासवर्ड दर्ज करें।', type: 'error' });
        return;
      }
      if (profileNewPassword.length < 6) {
        setProfileMsg({ text: 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।', type: 'error' });
        return;
      }
      if (profileNewPassword !== profileConfirmPassword) {
        setProfileMsg({ text: 'नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते हैं।', type: 'error' });
        return;
      }
    }

    setProfileLoading(true);
    try {
      const endpoint = isEditor ? '/api/editor/profile' : isReporter ? '/api/reporter/profile' : '/api/auth/profile';
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
          avatar_url: profileAvatar || '',
          bio: profileBio.trim(),
          assigned_region: profileRegion.trim(),
          current_password: profileCurrentPassword || undefined,
          new_password: profileNewPassword || undefined,
          confirm_password: profileConfirmPassword || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ text: '✓ आपकी प्रोफ़ाइल, फोटो एवं पत्रकारिता परिचय (Bio) सफलतापूर्वक सुरक्षित हो गए!', type: 'success' });
        showAlert('✓ आपकी प्रोफ़ाइल एवं पत्रकारिता परिचय (Bio) सफलतापूर्वक अपडेट हो गई!');
        setProfileCurrentPassword('');
        setProfileNewPassword('');
        setProfileConfirmPassword('');
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('tez_nazar_user', JSON.stringify(data.user));
          setProfileAvatar(data.user.avatar_url || '');
          setProfileBio(data.user.bio || '');
          setProfileRegion(data.user.assigned_region || '');
        }
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('tez_nazar_token', data.token);
        }
        onRefreshData();
      } else {
        setProfileMsg({ text: data.message || 'अपडेट करने में विफलता।', type: 'error' });
      }
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'तकनीकी त्रुटि हुई।', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Auth Handlers
  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const email = customEmail || loginEmail;
    const password = customPass || loginPassword;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('tez_nazar_token', data.token);
        localStorage.setItem('tez_nazar_user', JSON.stringify(data.user));
        setActiveTab('dashboard');
        showAlert(`स्वागत है, ${data.user.name}! CMS में सफलतापूर्वक प्रवेश हुआ।`);
      } else {
        setLoginError(data.message || 'लॉगिन विफल रहा।');
      }
    } catch (err: any) {
      setLoginError('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('tez_nazar_token');
    localStorage.removeItem('tez_nazar_user');
    showAlert('आप सफलतापूर्वक लॉगआउट हो गए हैं।', 'info');
  };

  // Profile & Registration Avatar Upload Handlers (Directly from PC/Mobile Device)
  const handleProfileAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ text: 'फ़ोटो का आकार 5 MB से कम होना चाहिए।', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setProfileAvatarLoading(true);
      try {
        const res = await fetch('/api/auth/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64Data, name: file.name })
        });
        const json = await res.json();
        if (json.success && json.url) {
          setProfileAvatar(json.url);
        } else {
          setProfileAvatar(base64Data);
        }
      } catch {
        setProfileAvatar(base64Data);
      } finally {
        setProfileAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setRegError('फ़ोटो का आकार 5 MB से कम होना चाहिए।');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setRegAvatarLoading(true);
      try {
        const res = await fetch('/api/auth/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64Data, name: file.name })
        });
        const json = await res.json();
        if (json.success && json.url) {
          setRegAvatar(json.url);
        } else {
          setRegAvatar(base64Data);
        }
      } catch {
        setRegAvatar(base64Data);
      } finally {
        setRegAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // MODULE 7: REPORTER & EDITOR REGISTRATION HANDLER
  // -------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMessage('');

    if (!regName.trim()) {
      setRegError('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('कृपया मान्य ईमेल पता दर्ज करें।');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setRegError('कृपया सही ईमेल प्रारूप (जैसे name@example.com) दर्ज करें।');
      return;
    }
    const cleanPhone = regPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setRegError('कृपया कम से कम 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते हैं।');
      return;
    }
    if (!regTermsAccepted) {
      setRegError('कृपया पत्रकारिता आचार संहिता एवं पोर्टल नियमों को स्वीकार करें।');
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          confirm_password: regConfirmPassword,
          requested_role: regRequestedRole,
          terms_accepted: regTermsAccepted,
          avatar_url: regAvatar || ''
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegSuccessMessage(data.message || 'आपका पंजीकरण अनुरोध सफलतापूर्वक दर्ज कर लिया गया है। व्यवस्थापक द्वारा अनुमोदन के पश्चात आपका खाता सक्रिय होगा।');
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegAvatar('');
        setRegTermsAccepted(false);
      } else {
        setRegError(data.message || 'पंजीकरण विफल रहा।');
      }
    } catch (err: any) {
      setRegError(err.message || 'सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setRegLoading(false);
    }
  };

  // -------------------------------------------------------------
  // MODULE 8: USER APPROVAL DASHBOARD HANDLERS
  // -------------------------------------------------------------
  const handleApproveUser = async (userId: number, roleId?: number, notes?: string) => {
    if (!token) return;
    setApprovalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role_id: roleId, notes })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || '✓ उपयोगकर्ता सफलतापूर्वक स्वीकृत किया गया!');
        setApprovalModal({ isOpen: false, user: null, action: 'approve' });
        fetchDashboardData();
      } else {
        showAlert(data.message || 'स्वीकृति विफल।', 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleRejectUser = async (userId: number, notes?: string) => {
    if (!token) return;
    setApprovalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || 'अनुरोध अस्वीकृत कर दिया गया।', 'info');
        setApprovalModal({ isOpen: false, user: null, action: 'reject' });
        fetchDashboardData();
      } else {
        showAlert(data.message || 'अस्वीकृति विफल।', 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleChangeUserRole = async (userId: number, roleId: number) => {
    if (!token) return;
    setApprovalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role_id: roleId })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || '✓ भूमिका सफलतापूर्वक बदल दी गई!');
        setApprovalModal({ isOpen: false, user: null, action: 'role' });
        fetchDashboardData();
      } else {
        showAlert(data.message || 'भूमिका परिवर्तन विफल।', 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleToggleUserActive = async (userId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || 'खाता स्थिति बदल दी गई।');
        fetchDashboardData();
      } else {
        showAlert(data.message || 'विफल रहा।', 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteUser = (user: UserType) => {
    if (!token) return;
    if (user.id === 1 || user.role_id === 1) {
      showAlert('सुरक्षा नियम: मुख्य सुपर एडमिन खाता हटाया नहीं जा सकता।', 'error');
      return;
    }
    setDeleteUserModal({ isOpen: true, user });
  };

  const handleExecuteDeleteUser = async () => {
    if (!token || !deleteUserModal.user) return;
    const user = deleteUserModal.user;
    if (user.id === 1 || user.role_id === 1) {
      showAlert('सुरक्षा नियम: मुख्य सुपर एडमिन खाता हटाया नहीं जा सकता।', 'error');
      setDeleteUserModal({ isOpen: false, user: null });
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ उपयोगकर्ता '${user.name}' सफलतापूर्वक हटा दिया गया।`);
        setDeleteUserModal({ isOpen: false, user: null });
        if (selectedUserDetail?.id === user.id) setSelectedUserDetail(null);
        fetchDashboardData();
      } else {
        showAlert(data.message || 'हटाने में विफलता।', 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // MODULE 1: NEWS MANAGEMENT LOGIC
  // -------------------------------------------------------------

  const startEditArticle = (art: Article) => {
    if (isReporter) {
      if (art.author_id !== currentUser?.id) {
        showAlert('सुरक्षा नियम: आप केवल अपने द्वारा प्रस्तुत समाचार ही संपादित कर सकते हैं। अन्य पत्रकारों के समाचारों तक पहुंच वर्जित है।', 'error');
        return;
      }
      if (art.status !== 'draft' && art.status !== 'rejected') {
        showAlert('सूचना: यह समाचार समीक्षाधीन या प्रकाशित हो चुका है। रिपोर्टर केवल ड्राफ्ट या सुधार हेतु लौटाई गई (Needs Revision) खबरें ही संपादित कर सकते हैं।', 'info');
        setPreviewArticle(art);
        return;
      }
    }

    setEditingArticle(art);
    const tagsArr = Array.isArray(art.tags) ? art.tags : [];
    setFormData({
      title: art.title,
      slug: art.slug,
      subtitle: art.subtitle || '',
      excerpt: art.excerpt || '',
      content: art.content || '',
      category_id: art.category_id || 1,
      author_id: isReporter ? (currentUser?.id || 1) : (art.author_id || currentUser?.id || 1),
      location: art.location || currentUser?.assigned_region || 'गाजियाबाद',
      featured_image: (Array.isArray(art.gallery_images) && art.gallery_images.length > 0) 
        ? art.gallery_images[0] 
        : (art.featured_image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80'),
      image_caption: art.image_caption || '',
      image_credit: art.image_credit || currentUser?.name || 'ब्लैक लेंस ब्यूरो',
      gallery_images: (Array.isArray(art.gallery_images) && art.gallery_images.length > 0)
        ? art.gallery_images.slice(0, 5)
        : (art.featured_image ? [art.featured_image] : ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80']),
      video_url: art.video_url || '',
      is_video_news: !!art.is_video_news,
      is_breaking: !!art.is_breaking,
      is_featured: !!art.is_featured,
      is_trending: !!art.is_trending,
      is_on_home: art.is_on_home !== undefined ? art.is_on_home : true,
      status: art.status,
      tags: tagsArr,
      tagsInput: tagsArr.join(', '),
      scheduled_at: art.scheduled_at || ''
    });
    setActiveTab('new_article');
  };

  const startNewArticle = () => {
    setEditingArticle(null);
    const defaultCover = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80';
    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      excerpt: '',
      content: '',
      category_id: categoryList[0]?.id || 1,
      author_id: currentUser?.id || 1,
      location: currentUser?.assigned_region || 'गाजियाबाद',
      featured_image: defaultCover,
      image_caption: '',
      image_credit: currentUser?.name || 'ब्लैक लेंस ब्यूरो',
      gallery_images: [defaultCover],
      video_url: '',
      is_video_news: false,
      is_breaking: false,
      is_featured: false,
      is_trending: false,
      is_on_home: true,
      status: 'pending_review',
      tags: [],
      tagsInput: '',
      scheduled_at: ''
    });
    setActiveTab('new_article');
  };

  const handleSaveArticle = async (statusOverride?: ArticleStatus) => {
    if (!token) {
      setFormMsg({ text: 'कृपया पहले लॉगिन करें।', type: 'error' });
      return;
    }
    if (!formData.title.trim()) {
      setFormMsg({ text: 'समाचार का शीर्षक अनिवार्य है।', type: 'error' });
      return;
    }
    if (!formData.content.trim()) {
      setFormMsg({ text: 'समाचार का विवरण (Content) अनिवार्य है।', type: 'error' });
      return;
    }

    setFormSubmitting(true);
    setFormMsg({ text: '', type: '' });

    // Reporters can ONLY save as 'draft' or submit as 'pending_review'
    let finalStatus: ArticleStatus;
    if (isReporter) {
      finalStatus = statusOverride === 'draft' ? 'draft' : 'pending_review';
    } else {
      finalStatus = statusOverride || formData.status;
    }

    const parsedTags = formData.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const imagesList = (Array.isArray(formData.gallery_images) && formData.gallery_images.length > 0)
      ? formData.gallery_images
      : (formData.featured_image ? [formData.featured_image] : []);

    const primaryImage = imagesList[0] || formData.featured_image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80';

    // Enforce author_id is automatically associated with current reporter's user ID
    const payload = {
      ...formData,
      featured_image: primaryImage,
      gallery_images: imagesList.slice(0, 5),
      id: editingArticle?.id,
      author_id: isReporter ? currentUser?.id : formData.author_id,
      author_avatar: (isReporter || !formData.author_id || formData.author_id === currentUser?.id)
        ? (currentUser?.avatar_url || '')
        : (usersList.find(u => u.id === formData.author_id)?.avatar_url || currentUser?.avatar_url || ''),
      status: finalStatus,
      tags: parsedTags
    };

    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const isLive = finalStatus === 'published';
        showAlert(
          isLive 
            ? '✓ बधाई! समाचार सफलतापूर्वक वेबसाइट पर तुरंत प्रकाशित हो गया है और लाइव दिख रहा है!' 
            : finalStatus === 'pending_review'
            ? '✓ आपका समाचार सफलतापूर्वक संपादक की समीक्षा हेतु भेज दिया गया है (Submitted for Review)!'
            : (data.message || 'समाचार ड्राफ्ट के रूप में सफलतापूर्वक सुरक्षित किया गया!'),
          'success'
        );
        fetchDashboardData();
        onRefreshData();
        // Reporters navigate to My Submitted News; Admins navigate to All Articles
        if (isReporter) {
          setActiveTab('my_submissions');
        } else {
          setActiveTab('articles');
        }
        setEditingArticle(null);
      } else {
        setFormMsg({ text: data.message || 'त्रुटि हुई। कृपया शीर्षक और विवरण जांचें।', type: 'error' });
      }
    } catch (e: any) {
      setFormMsg({ text: e.message || 'त्रुटि हुई।', type: 'error' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Direct status update (Publish, Unpublish, Hide, Draft)
  const handleUpdateArticleStatus = async (articleId: number, status: ArticleStatus, notes?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/news/${articleId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || `स्थिति बदलकर '${status}' कर दी गई है।`);
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'स्थिति बदलने में विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'सर्वर त्रुटि।', 'error');
    }
  };

  // Restore archived or hidden article
  const handleRestoreArticle = async (articleId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/news/${articleId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert('समाचार ड्राफ्ट स्थिति में बहाल कर दिया गया है।');
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'बहाली विफल रही।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'सर्वर त्रुटि।', 'error');
    }
  };

  // Execute article deletion
  const handleExecuteDeleteArticle = async () => {
    if (!token || !deleteArticleModal.article) return;
    const { id, title } = deleteArticleModal.article;
    const permanent = deleteArticleModal.permanent;

    try {
      const res = await fetch(`/api/admin/news/${id}?permanent=${permanent}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(
          permanent
            ? `✓ समाचार '${title.slice(0, 30)}...' स्थायी रूप से हटा दिया गया।`
            : `✓ समाचार सुरक्षित रूप से आर्काइव में डाल दिया गया (पुनर्प्राप्ति योग्य)।`
        );
        setDeleteArticleModal({ isOpen: false, article: null, permanent: false });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'हटाने में विफलता।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  // -------------------------------------------------------------
  // EDITORIAL WORKFLOW LOGIC
  // -------------------------------------------------------------

  const handleDirectReview = async (articleId: number, status: 'approved' | 'published' | 'rejected', notes?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/news/${articleId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes: notes || '' })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || `समीक्षा पूर्ण: समाचार '${status}' स्थिति में अद्यतन किया गया।`);
        setReviewModal({ isOpen: false, article: null, notes: '' });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'समीक्षा कार्रवाई विफल रही।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'सर्वर त्रुटि।', 'error');
    }
  };

  // -------------------------------------------------------------
  // MODULE 2: BREAKING NEWS TICKER LOGIC
  // -------------------------------------------------------------

  const handleSaveBreakingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !breakingModal.item?.title?.trim()) {
      showAlert('शीर्षक अनिवार्य है।', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/breaking-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(breakingModal.item)
      });
      const data = await res.json();
      if (data.success) {
        showAlert(breakingModal.item.id ? '✓ टिकर आइटम अपडेट किया गया!' : '✓ नया ब्रेकिंग समाचार टिकर में जोड़ा गया!');
        setBreakingModal({ isOpen: false, item: null });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'सहेजने में विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleToggleBreaking = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/breaking-news/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || 'टिकर स्थिति बदली गई।');
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleDeleteBreaking = (item: BreakingNewsItem) => {
    if (!token) return;
    setDeleteBreakingModal({ isOpen: true, item });
  };

  const handleExecuteDeleteBreaking = async () => {
    if (!token || !deleteBreakingModal.item) return;
    const { id, title } = deleteBreakingModal.item;
    try {
      const res = await fetch(`/api/admin/breaking-news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ ब्रेकिंग न्यूज़ "${title}" टिकर से हटा दी गई।`);
        setDeleteBreakingModal({ isOpen: false, item: null });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'हटाने में विफलता।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  // -------------------------------------------------------------
  // MODULE 3: CATEGORY & TAG MANAGEMENT LOGIC
  // -------------------------------------------------------------

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !categoryModal.cat?.name_hi?.trim()) {
      showAlert('श्रेणी का हिंदी नाम अनिवार्य है।', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryModal.cat)
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ श्रेणी '${data.data.name_hi}' सुरक्षित की गई!`);
        setCategoryModal({ isOpen: false, cat: null });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'श्रेणी सहेजने में विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleToggleCategory = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || 'श्रेणी स्थिति बदली गई।');
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!token || !deleteCatModal.cat) return;
    const { id, name_hi } = deleteCatModal.cat;
    const reassignTo = deleteCatModal.reassignTo;

    try {
      const res = await fetch(`/api/admin/categories/${id}?reassignTo=${reassignTo}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ श्रेणी '${name_hi}' हटा दी गई तथा सभी खबरों को सुरक्षित रूप से पुनर्निर्देशित किया गया।`);
        setDeleteCatModal({ isOpen: false, cat: null, reassignTo: 1 });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'श्रेणी हटाने में विफलता।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !tagModal.tag?.name?.trim()) {
      showAlert('टैग का नाम अनिवार्य है।', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tagModal.tag)
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ टैग '#${data.data.name}' सुरक्षित किया गया!`);
        setTagModal({ isOpen: false, tag: null });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'टैग सहेजने में विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleToggleTag = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/tags/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || 'टैग स्थिति बदली गई।');
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    if (!token) return;
    setDeleteTagModal({ isOpen: true, tag });
  };

  const handleExecuteDeleteTag = async () => {
    if (!token || !deleteTagModal.tag) return;
    const { id, name } = deleteTagModal.tag;
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ टैग '#${name}' हटा दिया गया।`);
        setDeleteTagModal({ isOpen: false, tag: null });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'टैग हटाने में विफलता।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  // -------------------------------------------------------------
  // MODULE: CONTACT INQUIRIES & MESSAGES HANDLERS
  // -------------------------------------------------------------
  const handleToggleMessageRead = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}/toggle-read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || 'संदेश स्थिति बदली गई।');
        setContactMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !m.is_read } : m));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, is_read: !prev.is_read } : null);
        }
      } else {
        showAlert(data.message || 'विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleExecuteDeleteMessage = async () => {
    if (!token || !deleteMessageModal.msg) return;
    const { id, name } = deleteMessageModal.msg;
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ संदेश ('${name}') सफलतापूर्वक हटा दिया गया।`);
        setContactMessages(prev => prev.filter(m => m.id !== id));
        setDeleteMessageModal({ isOpen: false, msg: null });
        if (selectedMessage?.id === id) setSelectedMessage(null);
      } else {
        showAlert(data.message || 'हटाने में विफलता।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleMarkAllMessagesRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/contact-messages/mark-all-read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert('✓ सभी इंक्वायरी सफलतापूर्वक पढ़ी हुई चिह्नित कर दी गईं।');
        setContactMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        if (selectedMessage) {
          setSelectedMessage(prev => prev ? { ...prev, is_read: true } : null);
        }
      } else {
        showAlert(data.message || 'विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const getInquiryCategoryInfo = (msg: ContactMessage) => {
    const text = ((msg.subject || '') + ' ' + (msg.message || '')).toLowerCase();
    if (text.includes('विज्ञापन') || text.includes('advertis') || text.includes('banner') || text.includes('स्पॉन्सर्ड')) {
      return { 
        type: 'ad',
        label: 'विज्ञापन (Ad)', 
        color: 'bg-amber-100 text-amber-900 border-amber-300', 
        badgeBg: 'bg-amber-500' 
      };
    }
    if (text.includes('सुझाव') || text.includes('suggest') || text.includes('feedback') || text.includes('विचार')) {
      return { 
        type: 'suggestion',
        label: 'सुझाव (Suggestion)', 
        color: 'bg-purple-100 text-purple-900 border-purple-300', 
        badgeBg: 'bg-purple-500' 
      };
    }
    if (text.includes('प्रेस') || text.includes('press') || text.includes('विज्ञप्ति')) {
      return { 
        type: 'press',
        label: 'प्रेस रिलीज (Press)', 
        color: 'bg-blue-100 text-blue-900 border-blue-300', 
        badgeBg: 'bg-blue-500' 
      };
    }
    if (text.includes('शिकायत') || text.includes('grievance') || text.includes('complaint') || text.includes('सुधार')) {
      return { 
        type: 'complaint',
        label: 'शिकायत (Complaint)', 
        color: 'bg-rose-100 text-rose-900 border-rose-300', 
        badgeBg: 'bg-rose-500' 
      };
    }
    return { 
      type: 'general',
      label: 'सामान्य पूछताछ', 
      color: 'bg-stone-100 text-stone-800 border-stone-300', 
      badgeBg: 'bg-stone-500' 
    };
  };

  // -------------------------------------------------------------
  // MODULE 4: ADVERTISEMENT MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleAdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showAlert('कृपया केवल मान्य चित्र फ़ाइल (JPG, PNG, WebP, GIF) अपलोड करें।', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('फ़ाइल का आकार 5 MB से कम होना चाहिए।', 'error');
      return;
    }

    setAdImageLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: reader.result,
            name: file.name,
            type: file.type
          })
        });
        const json = await res.json();
        if (json.success && json.url) {
          setAdModal(prev => ({
            ...prev,
            ad: { ...prev.ad, image_url: json.url }
          }));
          showAlert('✓ विज्ञापन बैनर सफलतापूर्वक अपलोड हो गया!');
        } else {
          showAlert(json.message || 'तस्वीर अपलोड विफल रही।', 'error');
        }
      } catch (err: any) {
        showAlert(err.message || 'अपलोड में त्रुटि हुई।', 'error');
      } finally {
        setAdImageLoading(false);
        if (adImageFileRef.current) adImageFileRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !adModal.ad) return;

    if (!adModal.ad.title?.trim()) {
      showAlert('विज्ञापन का नाम अनिवार्य है।', 'error');
      return;
    }

    if (!adModal.ad.placement) {
      showAlert('विज्ञापन का स्थान (Placement) अनिवार्य है।', 'error');
      return;
    }

    if (!adModal.ad.image_url?.trim()) {
      showAlert('विज्ञापन की छवि / बैनर अनिवार्य है। कृपया छवि अपलोड करें या URL दर्ज करें।', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...adModal.ad,
          destination_url: adModal.ad.destination_url?.trim() || '#',
          display_order: Number(adModal.ad.display_order) || 1,
          is_active: adModal.ad.status ? adModal.ad.status === 'active' : (adModal.ad.is_active !== false)
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || '✓ विज्ञापन अभियान सफलतापूर्वक सुरक्षित किया गया!');
        setAdModal({ isOpen: false, ad: null });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'विज्ञापन सहेजने में विफलता।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleToggleAd = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/advertisements/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message || 'विज्ञापन की स्थिति बदली गई।');
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'विफल।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  const handleDeleteAdConfirm = async () => {
    if (!token || !deleteAdModal.ad) return;
    try {
      const res = await fetch(`/api/admin/advertisements/${deleteAdModal.ad.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`✓ विज्ञापन "${deleteAdModal.ad.title}" सफलतापूर्वक हटा दिया गया।`);
        setDeleteAdModal({ isOpen: false, ad: null });
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'हटाने में विफलता।', 'error');
      }
    } catch (e: any) {
      showAlert(e.message || 'त्रुटि हुई।', 'error');
    }
  };

  // -------------------------------------------------------------
  // MODULE 6: WEBSITE SETTINGS HANDLERS
  // -------------------------------------------------------------
  const handleSettingsFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'site_logo' | 'header_logo' | 'footer_logo' | 'favicon_url' | 'og_image'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'favicon_url') setFaviconUploading(true);
    else setLogoUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: reader.result,
            name: file.name,
            type: file.type
          })
        });
        const json = await res.json();
        if (json.success && json.url) {
          setSettingsData(prev => ({ 
            ...prev, 
            [field]: json.url,
            // If setting site_logo, also update header/footer logo if empty
            ...(field === 'site_logo' && !prev.header_logo ? { header_logo: json.url } : {}),
            ...(field === 'site_logo' && !prev.footer_logo ? { footer_logo: json.url } : {})
          }));
          showAlert(`✓ ${field === 'favicon_url' ? 'फेविकॉन' : 'लोगो'} सफलतापूर्वक अपलोड हो गया!`);
        } else {
          showAlert(json.message || 'अपलोड विफल रहा।', 'error');
        }
      } catch (err: any) {
        showAlert(err.message || 'अपलोड में त्रुटि हुई।', 'error');
      } finally {
        if (field === 'favicon_url') {
          setFaviconUploading(false);
          if (faviconFileRef.current) faviconFileRef.current.value = '';
        } else {
          setLogoUploading(false);
          if (logoFileRef.current) logoFileRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreDefaultLogo = () => {
    setSettingsData(prev => ({
      ...prev,
      site_logo: '',
      header_logo: '',
      footer_logo: '',
      logo_url: ''
    }));
    showAlert('✓ डिफ़ॉल्ट BLACK LENS लोगो रीस्टोर कर दिया गया है।');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...settingsData,
          site_name: 'BLACK LENS',
          site_logo: settingsData.site_logo || '',
          logo_url: settingsData.site_logo || '/logo.svg'
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('✓ वेबसाइट सेटिंग्स सफलतापूर्वक सुरक्षित की गईं और पोर्टल पर लागू हो गईं!');
        onRefreshData();
      } else {
        showAlert(data.message || 'सेटिंग्स सहेजने में विफलता।', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'त्रुटि हुई।', 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // MODULE 5: REPORTER SUBMISSIONS HANDLER
  // -------------------------------------------------------------
  const handleSubmitArticleForReview = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/news/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'pending_review',
          notes: 'रिपोर्टर द्वारा संपादकीय समीक्षा एवं अनुमोदन हेतु प्रस्तुत'
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('✓ समाचार संपादकीय समीक्षा हेतु सफलतापूर्वक भेज दिया गया!');
        fetchDashboardData();
        onRefreshData();
      } else {
        showAlert(data.message || 'विफल रहा।', 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // Filtered & Paginated Articles List
  const filteredArticles = useMemo(() => {
    let list = [...articlesList];

    // Status filter
    if (articlesFilter !== 'all') {
      list = list.filter(a => a.status === articlesFilter);
    }

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      list = list.filter(a => a.category_slug === selectedCategoryFilter || String(a.category_id) === selectedCategoryFilter);
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.author_name && a.author_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [articlesList, articlesFilter, selectedCategoryFilter, searchQuery]);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(start, start + itemsPerPage);
  }, [filteredArticles, currentPage]);

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Author', 'Status', 'Views', 'Published At'];
    const rows = articlesList.map(a => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.category_name || ''}"`,
      `"${a.author_name || ''}"`,
      a.status,
      a.view_count || 0,
      a.published_at || a.created_at
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `teznazar_news_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">प्रकाशित</span>;
      case 'pending_review':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">समीक्षाधीन</span>;
      case 'approved':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">स्वीकृत</span>;
      case 'draft':
        return <span className="bg-stone-200 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded">ड्राफ्ट</span>;
      case 'unpublished':
        return <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded">अप्रकाशित</span>;
      case 'hidden':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">छिपाया गया</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">सुधार आवश्यक</span>;
      case 'archived':
        return <span className="bg-stone-300 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded">आर्काइव / हटाया गया</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded">{status}</span>;
    }
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN (IF NOT LOGGED IN)
  // -------------------------------------------------------------
  if (!token || !currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950/90 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-stone-800 my-8">
          
          {/* Modal Header */}
          <div className="bg-stone-900 text-white p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center font-bold text-xs text-white font-sans shrink-0">
                BL
              </div>
              <div>
                <h2 className="text-base font-bold font-sans">ब्लैक लेंस CMS पोर्टल</h2>
                <p className="text-[11px] text-stone-400">पत्रकार, संपादक एवं व्यवस्थापक पोर्टल</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-white rounded cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Mode Selector: Login vs Register (Module 7) */}
          <div className="flex border-b border-stone-200 bg-stone-100/70 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>लॉगिन करें (Sign In)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-white text-red-700 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>रिपोर्टर / संपादक पंजीकरण</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
            {/* ---------------- LOGIN FORM ---------------- */}
            {authMode === 'login' && (
              <div className="space-y-4">
                {loginError && (
                  <div className={`p-3 text-xs rounded border flex items-start gap-2 ${
                    loginError.includes('लंबित') || loginError.includes('Pending')
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <div className="flex-1 leading-relaxed">{loginError}</div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      पंजीकृत ईमेल पता (Registered Email) *
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@teznazar.com"
                      className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        पासवर्ड (Password) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="text-[11px] text-red-700 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer select-none transition-colors"
                      >
                        {showLoginPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>पासवर्ड छिपाएं</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>शो पासवर्ड (Show Password)</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="पासवर्ड दर्ज करें"
                        className="w-full text-xs p-2.5 pr-10 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 p-1.5 rounded hover:bg-stone-100 cursor-pointer transition-colors"
                        title={showLoginPassword ? 'पासवर्ड छिपाएं' : 'शो पासवर्ड'}
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4 text-stone-700" /> : <Eye className="w-4 h-4 text-stone-500" />}
                      </button>
                    </div>
                    
                    {/* Explicit Show Password checkbox for instant visibility */}
                    <div className="mt-1.5 flex items-center justify-between px-0.5">
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 hover:text-stone-900 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showLoginPassword}
                          onChange={(e) => setShowLoginPassword(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-stone-300 cursor-pointer"
                        />
                        <span className="font-medium">शो पासवर्ड (Show Password)</span>
                      </label>
                      <span className="text-[10px] text-stone-400">
                        {showLoginPassword ? 'पासवर्ड दृश्यमान है' : 'पासवर्ड छिपा हुआ है'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2.5 rounded transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loginLoading ? 'प्रवेश हो रहा है...' : 'सुरक्षित लॉगिन करें'}</span>
                  </button>
                </form>

                {/* Switch to Registration */}
                <div className="pt-2 text-center border-t border-stone-100">
                  <p className="text-xs text-stone-600">
                    क्या आप पत्रकार या संपादक के रूप में जुड़ना चाहते हैं?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-red-700 hover:text-red-800 font-bold underline cursor-pointer"
                    >
                      नया पंजीकरण करें &rarr;
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ---------------- MODULE 7: REGISTRATION FORM ---------------- */}
            {authMode === 'register' && (
              <div className="space-y-4">
                <div className="bg-red-50/70 border border-red-200/60 p-3 rounded text-xs text-stone-800">
                  <strong className="block text-red-800 font-bold mb-0.5">पत्रकारिता नेटवर्क में आपका स्वागत है</strong>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    ब्लैक लेंस मीडिया नेटवर्क में फील्ड रिपोर्टर या डेस्क संपादक के रूप में जुड़ने हेतु नीचे विवरण भरें।
                    सुरक्षा एवं विश्वसनीयता हेतु सभी नए खाते मुख्य व्यवस्थापक (Super Admin) द्वारा सत्यापन व अनुमोदन के पश्चात ही सक्रिय होंगे।
                  </p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccessMessage ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-300 rounded text-center space-y-3">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-sm font-bold text-emerald-900">पंजीकरण अनुरोध सफलतापूर्वक दर्ज!</h3>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                      {regSuccessMessage}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setRegSuccessMessage('');
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded cursor-pointer transition-colors"
                      >
                        लॉगिन पृष्ठ पर जाएं &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        पूरा नाम (Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="उदा. राहुल शर्मा"
                        className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          ईमेल पता (Email Address) *
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="rahul@example.com"
                          className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          मोबाइल नंबर (Mobile Phone) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          पासवर्ड (Password) *
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="कम से कम 6 अक्षर"
                            className="w-full text-xs p-2.5 pr-9 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                            title={showRegPassword ? 'पासवर्ड छिपाएं' : 'पासवर्ड देखें'}
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          कन्फर्म पासवर्ड (Confirm Password) *
                        </label>
                        <div className="relative">
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="पासवर्ड पुनः दर्ज करें"
                            className="w-full text-xs p-2.5 pr-9 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                            title={showRegConfirmPassword ? 'पासवर्ड छिपाएं' : 'पासवर्ड देखें'}
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Requested Role Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        आवेदन की गई भूमिका (Requested Role) *
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className={`p-2.5 border rounded cursor-pointer flex items-start gap-2 transition-colors ${
                          regRequestedRole === 'reporter'
                            ? 'border-red-600 bg-red-50/50 text-red-950 font-bold'
                            : 'border-stone-300 hover:bg-stone-50 text-stone-700'
                        }`}>
                          <input
                            type="radio"
                            name="regRole"
                            checked={regRequestedRole === 'reporter'}
                            onChange={() => setRegRequestedRole('reporter')}
                            className="mt-0.5 text-red-600"
                          />
                          <div>
                            <span className="block text-xs">फील्ड रिपोर्टर (Reporter)</span>
                            <span className="text-[10px] text-stone-500 font-normal">ग्राउंड कवरेज व समाचार प्रेषण</span>
                          </div>
                        </label>

                        <label className={`p-2.5 border rounded cursor-pointer flex items-start gap-2 transition-colors ${
                          regRequestedRole === 'editor'
                            ? 'border-red-600 bg-red-50/50 text-red-950 font-bold'
                            : 'border-stone-300 hover:bg-stone-50 text-stone-700'
                        }`}>
                          <input
                            type="radio"
                            name="regRole"
                            checked={regRequestedRole === 'editor'}
                            onChange={() => setRegRequestedRole('editor')}
                            className="mt-0.5 text-red-600"
                          />
                          <div>
                            <span className="block text-xs">डेस्क संपादक (Editor)</span>
                            <span className="text-[10px] text-stone-500 font-normal">संपादकीय डेस्क व समीक्षा</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Profile Photo Upload Option (from PC/Mobile) */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        प्रोफ़ाइल फोटो (Profile Photo) — ऐच्छिक
                      </label>
                      <div className="flex items-center gap-3">
                        {regAvatar ? (
                          <div className="relative shrink-0">
                            <img
                              src={regAvatar}
                              alt="अवतार"
                              className="w-12 h-12 rounded-full object-cover border-2 border-red-600 shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => setRegAvatar('')}
                              className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer"
                              title="फोटो हटाएं"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0">
                            फोटो
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded border border-stone-300 cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-red-600" />
                            <span>{regAvatarLoading ? 'अपलोड हो रहा है...' : 'कंप्यूटर / फोन से फोटो चुनें'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={regAvatarLoading}
                              onChange={handleRegAvatarSelect}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-stone-500 mt-1">
                            आप सीधे अपने मोबाइल या कंप्यूटर से फोटो अपलोड कर सकते हैं।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Terms Acceptance Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2 cursor-pointer text-xs text-stone-700 select-none">
                        <input
                          type="checkbox"
                          checked={regTermsAccepted}
                          onChange={(e) => setRegTermsAccepted(e.target.checked)}
                          className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                        />
                        <span className="text-[11px] leading-relaxed">
                          मैं डिजिटल पत्रकारिता की आचार संहिता, निष्पक्षता मानकों और पोर्टल के नियमों का निष्ठापूर्वक पालन करने की सहमति देता/देती हूँ।
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2.5 rounded transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                      <span>{regLoading ? 'पंजीकरण सबमिट हो रहा है...' : 'पंजीकरण अनुरोध सबमिट करें'}</span>
                    </button>

                    <div className="pt-2 text-center border-t border-stone-100">
                      <p className="text-xs text-stone-600">
                        पहले से पंजीकृत हैं?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="text-red-700 hover:text-red-800 font-bold underline cursor-pointer"
                        >
                          लॉगिन पृष्ठ पर लौटें &rarr;
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN ADMIN / CMS PORTAL INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex flex-col font-sans">
      
      {/* Top Global Notification Toast */}
      {globalAlert.text && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-3 rounded-lg shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
          globalAlert.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : globalAlert.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {globalAlert.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> : <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />}
          <div className="flex-1">{globalAlert.text}</div>
          <button onClick={() => setGlobalAlert({ text: '', type: '' })} className="text-stone-400 hover:text-stone-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top CMS Header */}
      <header className="bg-stone-900 text-white h-14 px-4 flex items-center justify-between shrink-0 border-b border-stone-800">
        <div className="flex items-center gap-3">
          {currentUser.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-red-500 shadow-2xs shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-red-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'BL'}
            </div>
          )}
          <div>
            <span className="font-bold text-sm tracking-wide flex items-center gap-2">
              <span>{isReporter ? 'ब्लैक लेंस — रिपोर्टर पोर्टल' : isEditor ? 'ब्लैक लेंस — एडिटर पोर्टल' : 'ब्लैक लेंस CMS'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                isReporter 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                  : isEditor
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-red-950 text-red-400 border-red-800'
              }`}>
                {isReporter ? 'Reporter Portal' : isEditor ? 'Editor Portal' : 'Admin CMS'}
              </span>
            </span>
            <span className="text-[10px] text-stone-400 block -mt-0.5">
              {currentUser.name} ({isReporter ? 'फील्ड रिपोर्टर' : isEditor ? 'संपादक (Editor)' : currentUser.role_name || 'एडमिन'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={startNewArticle}
            className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded font-bold transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ नया समाचार</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded transition-colors cursor-pointer border border-stone-700"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>वेबसाइट देखें</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 text-stone-400 hover:text-red-400 rounded transition-colors cursor-pointer"
            title="लॉगआउट"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Layout */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 px-2 py-2 flex items-center justify-between text-xs shrink-0 overflow-x-auto gap-1">
        {isReporter ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>डैशबोर्ड</span>
            </button>
            <button
              onClick={() => setActiveTab('my_submissions')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'my_submissions' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span>मेरी खबरें ({articlesList.filter(a => Number(a.author_id) === Number(currentUser.id)).length})</span>
            </button>
            <button
              onClick={() => {
                startNewArticle();
                setActiveTab('new_article');
              }}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'new_article' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>+ नया</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'settings' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <UserCog className="w-3.5 h-3.5 shrink-0" />
              <span>सेटिंग्स</span>
            </button>
          </>
        ) : isEditor ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>डैशबोर्ड</span>
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'articles' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>समाचार ({articlesList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('review_desk')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'review_desk' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>समीक्षा ({articlesList.filter(a => a.status === 'pending_review').length})</span>
            </button>
            <button
              onClick={() => {
                startNewArticle();
                setActiveTab('new_article');
              }}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'new_article' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>+ नया</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-medium text-[11px] whitespace-nowrap cursor-pointer ${
                activeTab === 'settings' ? 'bg-red-700 text-white font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <UserCog className="w-3.5 h-3.5 shrink-0" />
              <span>सेटिंग्स</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1 overflow-x-auto w-full py-0.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              डैशबोर्ड
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                activeTab === 'articles' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              समाचार ({articlesList.length})
            </button>
            <button
              onClick={() => {
                startNewArticle();
                setActiveTab('new_article');
              }}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                activeTab === 'new_article' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              + नया
            </button>
            <button
              onClick={() => setActiveTab('review_desk')}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                activeTab === 'review_desk' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              समीक्षा ({articlesList.filter(a => a.status === 'pending_review').length})
            </button>
            <button
              onClick={() => setActiveTab('breaking')}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                activeTab === 'breaking' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              टिकर
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                activeTab === 'categories' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              श्रेणियां
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                activeTab === 'ads' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              विज्ञापन
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer flex items-center gap-1 ${
                activeTab === 'inquiries' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
              }`}
            >
              <span>इंक्वायरी</span>
              {contactMessages.filter(m => !m.is_read).length > 0 && (
                <span className="bg-amber-500 text-stone-950 text-[9px] font-black px-1 py-0.2 rounded-full">
                  {contactMessages.filter(m => !m.is_read).length}
                </span>
              )}
            </button>
            {(currentUser.role_id === 1 || currentUser.role_id === 2) && (
              <button
                onClick={() => setActiveTab('user_approvals')}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                  activeTab === 'user_approvals' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
                }`}
              >
                टीम ({usersList.filter(u => u.approval_status === 'pending').length})
              </button>
            )}
            {(currentUser.role_id === 1 || currentUser.role_id === 2 || isEditor) && (
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer flex items-center gap-1 ${
                  activeTab === 'seo' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
                }`}
              >
                <span>SEO & रैंकिंग</span>
                <span className="bg-emerald-800 text-emerald-200 text-[9px] px-1 rounded font-mono font-bold">Google</span>
              </button>
            )}
            {(currentUser.role_id === 1 || currentUser.role_id === 2) && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium cursor-pointer ${
                  activeTab === 'settings' ? 'bg-red-700 text-white font-bold' : 'text-stone-300'
                }`}
              >
                सेटिंग्स
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main CMS Layout with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-60 bg-stone-900 text-stone-300 border-r border-stone-800 overflow-y-auto hidden md:flex flex-col p-3 space-y-1.5 text-xs shrink-0">
          {isReporter ? (
            /* SIMPLIFIED REPORTER PORTAL SIDEBAR: ONLY 4 SECTIONS */
            <>
              <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-800/80 mb-1">
                <span>रिपोर्टर पोर्टल मेनू</span>
                <span className="text-emerald-400 font-mono text-[9px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">सक्रिय</span>
              </div>

              {/* Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-red-400" />
                <span className="flex-1 text-left truncate leading-tight">डैशबोर्ड</span>
              </button>

              {/* My Submitted News */}
              <button
                type="button"
                onClick={() => setActiveTab('my_submissions')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'my_submissions' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <CheckSquare className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left truncate leading-tight">मेरी प्रस्तुत खबरें</span>
                <span className="ml-auto shrink-0 bg-stone-800 text-stone-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-stone-700">
                  {articlesList.filter(a => Number(a.author_id) === Number(currentUser.id)).length}
                </span>
              </button>

              {/* Add New News */}
              <button
                type="button"
                onClick={() => {
                  startNewArticle();
                  setActiveTab('new_article');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'new_article' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="flex-1 text-left truncate leading-tight">नया समाचार जोड़ें</span>
              </button>

              {/* Settings — Reporter Profile */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'settings' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <UserCog className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="flex-1 text-left truncate leading-tight">सेटिंग्स</span>
              </button>
            </>
          ) : isEditor ? (
            /* DEDICATED EDITOR PORTAL SIDEBAR: EXACTLY 5 SECTIONS (NO CLUTTER) */
            <>
              <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-800/80 mb-1">
                <span>एडिटर पोर्टल मेनू</span>
                <span className="text-amber-400 font-mono text-[9px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">संपादक</span>
              </div>

              {/* 1. Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-red-400" />
                <span className="flex-1 text-left truncate leading-tight">डैशबोर्ड</span>
              </button>

              {/* 2. News Management */}
              <button
                type="button"
                onClick={() => setActiveTab('articles')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'articles' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                <span className="flex-1 text-left truncate leading-tight">समाचार प्रबंधन</span>
                <span className="ml-auto shrink-0 bg-stone-800 text-stone-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-stone-700">
                  {articlesList.length}
                </span>
              </button>

              {/* 3. Editorial Review Desk */}
              <button
                type="button"
                onClick={() => setActiveTab('review_desk')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'review_desk' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="flex-1 text-left truncate leading-tight">संपादकीय समीक्षा डेस्क</span>
                {articlesList.filter(a => a.status === 'pending_review').length > 0 && (
                  <span className="ml-auto shrink-0 bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {articlesList.filter(a => a.status === 'pending_review').length}
                  </span>
                )}
              </button>

              {/* 4. Add New News */}
              <button
                type="button"
                onClick={() => {
                  startNewArticle();
                  setActiveTab('new_article');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'new_article' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left truncate leading-tight">नया समाचार जोड़ें</span>
              </button>

              {/* 5. Inquiries (Ads, Suggestions, Feedback) */}
              <button
                type="button"
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'inquiries' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="flex-1 text-left truncate leading-tight">विज्ञापन व सुझाव इंक्वायरी</span>
                {contactMessages.filter(m => !m.is_read).length > 0 && (
                  <span className="ml-auto shrink-0 bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {contactMessages.filter(m => !m.is_read).length}
                  </span>
                )}
              </button>

              {/* 6. SEO एवं ट्रेंडिंग कीवर्ड्स */}
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'seo' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <Search className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left truncate leading-tight">SEO एवं ट्रेंडिंग कीवर्ड्स</span>
                <span className="ml-auto bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                  Google
                </span>
              </button>

              {/* 7. Settings */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                  activeTab === 'settings' ? 'bg-red-700 text-white font-bold shadow-xs' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <UserCog className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="flex-1 text-left truncate leading-tight">सेटिंग्स (प्रोफ़ाइल)</span>
              </button>
            </>
          ) : (
            /* Super Admin Sidebar (Full Control) */
            <>
              <div className="px-3 py-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                मुख्य मेनू
              </div>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>डैशबोर्ड अवलोकन</span>
              </button>

              <button
                onClick={() => setActiveTab('articles')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'articles' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>समाचार प्रबंधन (News)</span>
                <span className="ml-auto bg-stone-800 text-stone-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                  {articlesList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('review_desk')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'review_desk' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>संपादकीय समीक्षा डेस्क</span>
                {articlesList.filter(a => a.status === 'pending_review').length > 0 && (
                  <span className="ml-auto bg-amber-500 text-stone-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {articlesList.filter(a => a.status === 'pending_review').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('breaking')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'breaking' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>ब्रेकिंग न्यूज़ टिकर</span>
                <span className="ml-auto bg-stone-800 text-stone-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                  {breakingList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'categories' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>श्रेणियां एवं टैग्स</span>
                <span className="ml-auto bg-stone-800 text-stone-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                  {categoryList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ads')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'ads' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <Megaphone className="w-4 h-4 text-yellow-400" />
                <span>विज्ञापन प्रबंधन</span>
                <span className="ml-auto bg-stone-800 text-stone-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                  {advertisementsList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'inquiries' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>संपर्क व इंक्वायरी</span>
                {contactMessages.filter(m => !m.is_read).length > 0 ? (
                  <span className="ml-auto bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {contactMessages.filter(m => !m.is_read).length} नई
                  </span>
                ) : (
                  <span className="ml-auto bg-stone-800 text-stone-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                    {contactMessages.length}
                  </span>
                )}
              </button>

              <div className="pt-4 px-3 py-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                सिस्टम एवं सेटिंग्स
              </div>

              {(currentUser.role_id === 1 || currentUser.role_id === 2) && (
                <button
                  onClick={() => setActiveTab('user_approvals')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                    activeTab === 'user_approvals' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>पंजीकरण अनुरोध व टीम</span>
                  {usersList.filter(u => u.approval_status === 'pending').length > 0 && (
                    <span className="ml-auto bg-amber-500 text-stone-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {usersList.filter(u => u.approval_status === 'pending').length}
                    </span>
                  )}
                </button>
              )}

              {(currentUser.role_id === 1 || currentUser.role_id === 2) && (
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                    activeTab === 'seo' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>SEO एवं गूगल रैंकिंग</span>
                  <span className="ml-auto bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                    Google
                  </span>
                </button>
              )}

              {(currentUser.role_id === 1 || currentUser.role_id === 2) && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium transition-colors cursor-pointer ${
                    activeTab === 'settings' ? 'bg-red-700 text-white font-bold' : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>वेबसाइट सेटिंग्स (Settings)</span>
                </button>
              )}
            </>
          )}

          <div className="mt-auto pt-4 border-t border-stone-800 text-[11px] text-stone-400 px-2 space-y-1">
            <div>क्षेत्र: <strong className="text-white">{currentUser.assigned_region || 'गाजियाबाद'}</strong></div>
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isReporter ? 'रिपोर्टर सत्र सक्रिय' : isEditor ? 'संपादक सत्र सक्रिय' : 'सिस्टम ऑनलाइन'}</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            isReporter ? (
              /* DEDICATED REPORTER DASHBOARD (MODULE 1: REPORTER DASHBOARD) */
              <div className="space-y-6 max-w-6xl">
                {/* Header with Title and Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-stone-900">रिपोर्टर डैशबोर्ड (Reporter Dashboard)</h1>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                        सक्रिय पत्रकार
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      नमस्ते, <strong className="text-stone-900">{currentUser.name}</strong>! आपके द्वारा सबमिट किए गए समाचारों की स्थिति और संक्षिप्त विवरण
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleManualRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-xs px-3 py-2 rounded text-stone-700 font-medium cursor-pointer shadow-2xs transition-colors disabled:opacity-60"
                      title="डैशबोर्ड एवं समाचार ताज़ा करें"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                      <span>{isRefreshing ? 'रिफ्रेश हो रहा है...' : 'रिफ्रेश'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        startNewArticle();
                        setActiveTab('new_article');
                      }}
                      className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ नया समाचार जोड़ें (Add News)</span>
                    </button>
                  </div>
                </div>

                {/* KPI Summary Cards - DISPLAYING ONLY DATA BELONGING TO CURRENT REPORTER */}
                {(() => {
                  const myArticles = isReporter 
                    ? articlesList 
                    : articlesList.filter(a => Number(a.author_id) === Number(currentUser.id));
                  const totalCount = reporterStats?.total_submitted ?? myArticles.length;
                  const publishedCount = reporterStats?.published ?? myArticles.filter(a => a.status === 'published').length;
                  const pendingCount = reporterStats?.pending_review ?? myArticles.filter(a => a.status === 'pending_review').length;
                  const draftCount = reporterStats?.draft ?? myArticles.filter(a => a.status === 'draft').length;
                  const rejectedCount = reporterStats?.rejected ?? myArticles.filter(a => a.status === 'rejected').length;
                  const totalViews = reporterStats?.total_views ?? myArticles.reduce((acc, a) => acc + (a.view_count || 0), 0);

                  return (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {/* Total News Submitted */}
                        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
                          <div className="flex items-center justify-between text-stone-500 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">कुल प्रस्तुत समाचार</span>
                            <FileText className="w-4 h-4 text-stone-400" />
                          </div>
                          <span className="text-2xl font-bold text-stone-900">{totalCount}</span>
                          <span className="text-[10px] text-stone-500 block mt-1">आपके द्वारा सबमिट कुल लेख</span>
                        </div>

                        {/* Live Published */}
                        <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-2xs bg-gradient-to-br from-white to-emerald-50/30">
                          <div className="flex items-center justify-between text-emerald-700 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">लाइव प्रकाशित</span>
                            <Globe className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-2xl font-bold text-emerald-700">{publishedCount}</span>
                          <span className="text-[10px] text-emerald-600 block mt-1">पाठकों के लिए लाइव</span>
                        </div>

                        {/* Pending Review */}
                        <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-2xs bg-gradient-to-br from-white to-amber-50/30">
                          <div className="flex items-center justify-between text-amber-700 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">समीक्षाधीन</span>
                            <Clock className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
                          <span className="text-[10px] text-amber-600 block mt-1">डेस्क समीक्षा हेतु प्रतीक्षारत</span>
                        </div>

                        {/* Drafts */}
                        <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-2xs bg-gradient-to-br from-white to-blue-50/30">
                          <div className="flex items-center justify-between text-blue-700 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">ड्राफ्ट (Draft)</span>
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-2xl font-bold text-blue-700">{draftCount}</span>
                          <span className="text-[10px] text-blue-600 block mt-1">अपूर्ण या अप्रकाशित लेख</span>
                        </div>

                        {/* Revision Needed / Rejected */}
                        <div className="bg-white p-4 rounded-lg border border-rose-100 shadow-2xs bg-gradient-to-br from-white to-rose-50/30 col-span-2 sm:col-span-1">
                          <div className="flex items-center justify-between text-rose-700 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">सुधार आवश्यक</span>
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                          </div>
                          <span className="text-2xl font-bold text-rose-700">{rejectedCount}</span>
                          <span className="text-[10px] text-rose-600 block mt-1">संपादक द्वारा लौटाई गई खबरें</span>
                        </div>
                      </div>

                      {/* Quick Action Prompt Banner */}
                      <div className="bg-gradient-to-r from-red-900 to-stone-900 text-white rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-amber-400" />
                            <span>ग्राउंड से ताज़ा घटनाक्रम रिपोर्ट करें</span>
                          </h3>
                          <p className="text-xs text-stone-300">
                            गाजियाबाद एवं एनसीआर की ताज़ा हलचल, क्राइम, विकास कार्य अथवा जनसमस्याओं पर तुरंत अपनी रिपोर्ट प्रेषित करें।
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            startNewArticle();
                            setActiveTab('new_article');
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold px-4 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow"
                        >
                          + नया समाचार लिखें &rarr;
                        </button>
                      </div>

                      {/* Summary Table of Reporter's Submitted News */}
                      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
                          <div>
                            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                              आपके द्वारा प्रस्तुत समाचार — संक्षिप्त अवलोकन
                            </h3>
                            <p className="text-[11px] text-stone-500">केवल आपके खाते द्वारा सबमिट की गई खबरें ({myArticles.length})</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('my_submissions')}
                            className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer"
                          >
                            <span>मेरी सभी प्रस्तुत खबरें देखें</span>
                            <span>&rarr;</span>
                          </button>
                        </div>

                        {myArticles.length === 0 ? (
                          <div className="p-10 text-center text-stone-500 text-xs space-y-3">
                            <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                            <div>
                              <p className="font-bold text-stone-800 text-sm">आपने अभी तक कोई समाचार प्रस्तुत नहीं किया है</p>
                              <p className="text-stone-500 text-xs mt-0.5">पहली खबर लिखने के लिए नीचे दिए गए बटन पर क्लिक करें।</p>
                            </div>
                            <button
                              onClick={() => {
                                startNewArticle();
                                setActiveTab('new_article');
                              }}
                              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-bold text-xs cursor-pointer shadow-xs"
                            >
                              + पहला समाचार जोड़ें
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                                <tr>
                                  <th className="p-3">शीर्षक</th>
                                  <th className="p-3">श्रेणी</th>
                                  <th className="p-3">सबमिशन तिथि</th>
                                  <th className="p-3">अंतिम अपडेट</th>
                                  <th className="p-3">प्रकाशन स्थिति</th>
                                  <th className="p-3">पाठक दृश्य</th>
                                  <th className="p-3 text-right">कार्य</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {myArticles.slice(0, 6).map((art) => (
                                  <tr key={art.id} className="hover:bg-stone-50/60 transition-colors">
                                    <td className="p-3 max-w-xs font-semibold text-stone-900 truncate">
                                      <span title={art.title}>{art.title}</span>
                                      {art.review_notes && (
                                        <span className="block text-[10px] text-amber-700 font-normal truncate mt-0.5">
                                          संपादक टिप्पणी: {art.review_notes}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-stone-600">
                                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-medium">
                                        {art.category_name || 'सामान्य'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-stone-500 whitespace-nowrap">
                                      {new Date(art.created_at).toLocaleDateString('hi-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </td>
                                    <td className="p-3 text-stone-500 whitespace-nowrap">
                                      {art.updated_at ? new Date(art.updated_at).toLocaleDateString('hi-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      }) : '—'}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                      {renderStatusBadge(art.status)}
                                    </td>
                                    <td className="p-3 font-mono text-stone-600">
                                      {art.view_count || 0}
                                    </td>
                                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                      <button
                                        onClick={() => setPreviewArticle(art)}
                                        className="p-1 text-stone-500 hover:text-stone-800 rounded bg-stone-100 hover:bg-stone-200 cursor-pointer inline-flex items-center"
                                        title="देखें"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      {(art.status === 'draft' || art.status === 'rejected') && (
                                        <button
                                          onClick={() => startEditArticle(art)}
                                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded border border-blue-200 cursor-pointer"
                                        >
                                          संपादित
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : isEditor ? (
              /* DEDICATED EDITOR DASHBOARD (EDITOR DESK) */
              <div className="space-y-6 max-w-6xl">
                {/* Header with Title and Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-stone-900">ब्लैक लेंस — संपादक डैशबोर्ड (Editor Dashboard)</h1>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                        संपादक डेस्क
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      नमस्ते, <strong className="text-stone-900">{currentUser.name}</strong>! संपादकीय समीक्षा, रिपोर्टर समन्वय एवं समाचार प्रकाशन डेस्क
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleManualRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-xs px-3 py-2 rounded text-stone-700 font-medium cursor-pointer shadow-2xs transition-colors disabled:opacity-60"
                      title="डैशबोर्ड एवं समाचार ताज़ा करें"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                      <span>{isRefreshing ? 'रिफ्रेश हो रहा है...' : 'रिफ्रेश'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        startNewArticle();
                        setActiveTab('new_article');
                      }}
                      className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ नया समाचार जोड़ें (Add News)</span>
                    </button>
                  </div>
                </div>

                {/* Editor KPI Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {/* Total News */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
                    <div className="flex items-center justify-between text-stone-500 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">कुल समाचार</span>
                      <FileText className="w-4 h-4 text-stone-400" />
                    </div>
                    <span className="text-2xl font-bold text-stone-900">{articlesList.length}</span>
                    <span className="text-[10px] text-stone-500 block mt-1">पोर्टल के कुल समाचार</span>
                  </div>

                  {/* Live Published */}
                  <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-2xs bg-gradient-to-br from-white to-emerald-50/30">
                    <div className="flex items-center justify-between text-emerald-700 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">लाइव प्रकाशित</span>
                      <Globe className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {articlesList.filter(a => a.status === 'published').length}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-1">पोर्टल पर लाइव लेख</span>
                  </div>

                  {/* Pending Editorial Review */}
                  <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-2xs bg-gradient-to-br from-white to-amber-50/40">
                    <div className="flex items-center justify-between text-amber-800 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">समीक्षाधीन</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-2xl font-bold text-amber-700">
                      {articlesList.filter(a => a.status === 'pending_review').length}
                    </span>
                    <span className="text-[10px] text-amber-700 block mt-1">रिपोर्टरों की लंबित खबरें</span>
                  </div>

                  {/* Drafts */}
                  <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-2xs bg-gradient-to-br from-white to-blue-50/30">
                    <div className="flex items-center justify-between text-blue-700 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">ड्राफ्ट्स (Drafts)</span>
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-blue-700">
                      {articlesList.filter(a => a.status === 'draft').length}
                    </span>
                    <span className="text-[10px] text-blue-600 block mt-1">अप्रकाशित व कार्यशील लेख</span>
                  </div>

                  {/* Revision Needed / Rejected */}
                  <div className="bg-white p-4 rounded-lg border border-rose-100 shadow-2xs bg-gradient-to-br from-white to-rose-50/30 col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between text-rose-700 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">सुधार हेतु लौटाई गई</span>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-2xl font-bold text-rose-700">
                      {articlesList.filter(a => a.status === 'rejected').length}
                    </span>
                    <span className="text-[10px] text-rose-600 block mt-1">संशोधन हेतु भेजी गई खबरें</span>
                  </div>
                </div>

                {/* Pending Review Alert Banner */}
                {articlesList.filter(a => a.status === 'pending_review').length > 0 && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-950">
                          {articlesList.filter(a => a.status === 'pending_review').length} समाचार रिपोर्टरों द्वारा समीक्षा हेतु प्रतीक्षारत हैं!
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          संवाददाताओं द्वारा भेजी गई ग्राउंड रिपोर्टों का संपादन, तथ्य-जांच करें और तुरंत स्वीकृत या लाइव प्रकाशित करें।
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('review_desk')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                    >
                      समीक्षा डेस्क खोलें &rarr;
                    </button>
                  </div>
                )}

                {/* Editor Quick Action Cards (Strictly 3 modules: News Manager, Review Desk, Add News) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* News Manager */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <FileText className="w-4 h-4 text-red-700" />
                      <span>समाचार प्रबंधक (News Manager)</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      सभी प्रकाशित, ड्राफ्ट व अभिलेखागार समाचार देखें, खोजें, फिल्टर करें अथवा संपादित करें।
                    </p>
                    <button
                      onClick={() => setActiveTab('articles')}
                      className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>समाचार सूची खोलें</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                  {/* Review Desk */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>संपादकीय समीक्षा डेस्क (Review Desk)</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      फील्ड रिपोर्टरों की ताज़ा खबरों की समीक्षा करें, सुधार निर्देश दें अथवा सीधे लाइव करें।
                    </p>
                    <button
                      onClick={() => setActiveTab('review_desk')}
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>समीक्षा डेस्क पर जाएं</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                  {/* Add News */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <span>नया समाचार जोड़ें (Add News)</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      संपादकीय विशेष विश्लेषण, इन्वेस्टिगेटिव स्टोरी अथवा ताज़ा खबर तुरंत तैयार कर प्रकाशित करें।
                    </p>
                    <button
                      onClick={() => {
                        startNewArticle();
                        setActiveTab('new_article');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>नया समाचार लिखें</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Editor Desk Recent News Table */}
                <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs">
                  <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        हालिया समाचार सूची (Recent News Overview)
                      </h3>
                      <p className="text-[11px] text-stone-500">संपादकीय डेस्क पर उपलब्ध ताज़ा समाचार</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('articles')}
                      className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>समाचार प्रबंधक में सभी देखें</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                        <tr>
                          <th className="p-3">शीर्षक</th>
                          <th className="p-3">श्रेणी</th>
                          <th className="p-3">संवाददाता / लेखक</th>
                          <th className="p-3">स्थिति</th>
                          <th className="p-3">दृश्य</th>
                          <th className="p-3 text-right">कार्य</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {articlesList.slice(0, 8).map((art) => (
                          <tr key={art.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-3 font-semibold text-stone-900 max-w-xs truncate">{art.title}</td>
                            <td className="p-3 text-stone-600 whitespace-nowrap">{art.category_name}</td>
                            <td className="p-3 text-stone-600 whitespace-nowrap">{art.author_name}</td>
                            <td className="p-3 whitespace-nowrap">{renderStatusBadge(art.status)}</td>
                            <td className="p-3 text-stone-600 font-mono text-[11px] whitespace-nowrap">{art.view_count || 0}</td>
                            <td className="p-3 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => setPreviewArticle(art)}
                                className="text-stone-500 hover:text-stone-800 cursor-pointer p-1"
                                title="विवरण देखें"
                              >
                                <Eye className="w-3.5 h-3.5 inline" />
                              </button>
                              <button
                                onClick={() => startEditArticle(art)}
                                className="text-red-700 hover:text-red-900 font-semibold cursor-pointer text-xs bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200"
                              >
                                संपादित
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* ORIGINAL ADMIN DASHBOARD */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-stone-900">संपादकीय एवं पोर्टल डैशबोर्ड</h1>
                    <p className="text-xs text-stone-500">ताज़ा समाचार, समीक्षा डेस्क और पाठक गतिविधि की संपूर्ण स्थिति</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-xs px-3 py-1.5 rounded text-stone-700 font-medium cursor-pointer shadow-2xs transition-colors disabled:opacity-60"
                    title="डैशबोर्ड ताज़ा करें"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                    <span>{isRefreshing ? 'रिफ्रेश हो रहा है...' : 'रिफ्रेश'}</span>
                  </button>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-stone-500 block">कुल समाचार</span>
                    <span className="text-2xl font-bold text-stone-900 mt-1 block">{articlesList.length}</span>
                  </div>
                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-emerald-600 block">लाइव प्रकाशित</span>
                    <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                      {articlesList.filter(a => a.status === 'published').length}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-amber-600 block">समीक्षाधीन</span>
                    <span className="text-2xl font-bold text-amber-700 mt-1 block">
                      {articlesList.filter(a => a.status === 'pending_review').length}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-blue-600 block">स्वीकृत खबरें</span>
                    <span className="text-2xl font-bold text-blue-700 mt-1 block">
                      {articlesList.filter(a => a.status === 'approved').length}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-stone-500 block">सक्रिय श्रेणियां</span>
                    <span className="text-2xl font-bold text-stone-900 mt-1 block">
                      {categoryList.filter(c => c.is_active).length}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-red-600 block">टिकर हेडलाइंस</span>
                    <span className="text-2xl font-bold text-red-700 mt-1 block">
                      {breakingList.filter(b => b.is_active).length}
                    </span>
                  </div>
                  <div 
                    onClick={() => setActiveTab('inquiries')}
                    className="bg-white p-4 rounded border border-stone-200 shadow-2xs cursor-pointer hover:border-cyan-400 hover:shadow-xs transition-all col-span-2 sm:col-span-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-cyan-700 block">संपर्क व इंक्वायरी</span>
                      <Mail className="w-3.5 h-3.5 text-cyan-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-stone-900">{contactMessages.length}</span>
                      {contactMessages.filter(m => !m.is_read).length > 0 ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                          {contactMessages.filter(m => !m.is_read).length} नई
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">सभी पढ़ी</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Inquiries Quick Alert Banner */}
                {contactMessages.filter(m => !m.is_read).length > 0 && (
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-cyan-950 flex items-center gap-2">
                          <span>{contactMessages.filter(m => !m.is_read).length} नई विज्ञापन व सुझाव इंक्वायरी प्राप्त हुई हैं!</span>
                          <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                            NEW
                          </span>
                        </h4>
                        <p className="text-[11px] text-cyan-800 mt-0.5">
                          वेबसाइट के 'संपर्क करें' से प्राप्त विज्ञापन अनुरोध, प्रेस रिलीज एवं पाठकों के सुझाव देखें।
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className="bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold px-4 py-2 rounded cursor-pointer whitespace-nowrap shadow-2xs transition-colors self-start sm:self-auto"
                    >
                      इंक्वायरी देखें &rarr;
                    </button>
                  </div>
                )}

                {/* Pending Review Quick Alert Banner */}
                {articlesList.filter(a => a.status === 'pending_review').length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-amber-700" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-900">
                          {articlesList.filter(a => a.status === 'pending_review').length} समाचार समीक्षा हेतु प्रतीक्षारत हैं!
                        </h4>
                        <p className="text-[11px] text-amber-700">रिपोर्टरों द्वारा भेजी गई खबरों को सत्यापित कर तुरंत प्रकाशित करें।</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('review_desk')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded cursor-pointer"
                    >
                      समीक्षा डेस्क खोलें &rarr;
                    </button>
                  </div>
                )}

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                      <FileText className="w-4 h-4 text-red-700" />
                      <span>समाचार प्रबंधन</span>
                    </div>
                    <p className="text-[11px] text-stone-500">सभी खबरों को खोजें, स्थिति बदलें, प्रकाशित करें अथवा हटाएं।</p>
                    <button
                      onClick={() => setActiveTab('articles')}
                      className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      समाचार सूची देखें &rarr;
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span>ब्रेकिंग न्यूज़ टिकर</span>
                    </div>
                    <p className="text-[11px] text-stone-500">लाइव पट्टी में ताज़ा हेडलाइंस जोड़ें, क्रम बदलें अथवा छिपाएं।</p>
                    <button
                      onClick={() => setActiveTab('breaking')}
                      className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      टिकर प्रबंधित करें &rarr;
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                      <FolderTree className="w-4 h-4 text-emerald-700" />
                      <span>श्रेणियां एवं टैग्स</span>
                    </div>
                    <p className="text-[11px] text-stone-500">गाजियाबाद, अपराध, खेल, व्यापार आदि श्रेणियां एवं ट्रेंडिंग टैग्स नियंत्रित करें।</p>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      श्रेणियां खोलें &rarr;
                    </button>
                  </div>
                </div>

                {/* Recent Articles Table */}
                <div className="bg-white rounded border border-stone-200 overflow-hidden shadow-2xs">
                  <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-900">हालिया दर्ज समाचार (Recent News)</h3>
                    <button
                      onClick={() => setActiveTab('articles')}
                      className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                    >
                      सभी देखें &rarr;
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                        <tr>
                          <th className="p-3">शीर्षक</th>
                          <th className="p-3">श्रेणी</th>
                          <th className="p-3">संवाददाता</th>
                          <th className="p-3">स्थिति</th>
                          <th className="p-3">दृश्य</th>
                          <th className="p-3 text-right">कार्य</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {articlesList.slice(0, 6).map((art) => (
                          <tr key={art.id} className="hover:bg-stone-50/50">
                            <td className="p-3 font-semibold text-stone-900 max-w-xs truncate">{art.title}</td>
                            <td className="p-3 text-stone-600">{art.category_name}</td>
                            <td className="p-3 text-stone-600">{art.author_name}</td>
                            <td className="p-3">{renderStatusBadge(art.status)}</td>
                            <td className="p-3 text-stone-600">{art.view_count || 0}</td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => setPreviewArticle(art)}
                                className="text-stone-500 hover:text-stone-800 cursor-pointer"
                                title="विवरण देखें"
                              >
                                <Eye className="w-3.5 h-3.5 inline" />
                              </button>
                              <button
                                onClick={() => startEditArticle(art)}
                                className="text-red-700 hover:text-red-900 font-semibold cursor-pointer"
                              >
                                संपादित
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB 2: ALL ARTICLES LIST (MODULE 1: NEWS MANAGEMENT) */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              
              {/* Header with Title and Add Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-stone-900">समस्त समाचार प्रबंधन</h1>
                  <p className="text-xs text-stone-500">
                    समाचार बनाएं, संपादित करें, पूर्वावलोकन करें, स्थिति बदलें अथवा सुरक्षित रूप से हटाएं
                  </p>
                </div>
                <button
                  onClick={startNewArticle}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ नया समाचार जोड़ें</span>
                </button>
              </div>

              {/* Search & Category Filter Toolbar */}
              <div className="bg-white p-3 rounded border border-stone-200 shadow-2xs flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="शीर्षक, स्थान, या रिपोर्टर से खोजें..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-stone-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-stone-400" />
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => {
                      setSelectedCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="p-1.5 border border-stone-300 rounded text-xs focus:border-red-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="all">समस्त श्रेणियां (All)</option>
                    {categoryList.map(c => (
                      <option key={c.id} value={c.slug}>{c.name_hi} ({c.name_en})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-stone-200/80 p-1 rounded text-xs">
                {[
                  { id: 'all', label: 'सभी' },
                  { id: 'published', label: 'प्रकाशित' },
                  { id: 'pending_review', label: 'समीक्षाधीन' },
                  { id: 'approved', label: 'स्वीकृत' },
                  { id: 'draft', label: 'ड्राफ्ट' },
                  { id: 'unpublished', label: 'अप्रकाशित' },
                  { id: 'hidden', label: 'छिपाया गया' },
                  { id: 'rejected', label: 'सुधार आवश्यक' },
                  { id: 'archived', label: 'आर्काइव / हटाया गया' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setArticlesFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer text-xs ${
                      articlesFilter === tab.id
                        ? 'bg-white text-stone-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1 text-[10px] opacity-70">
                      ({tab.id === 'all' 
                        ? articlesList.length 
                        : articlesList.filter(a => a.status === tab.id).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Articles Data Table */}
              <div className="bg-white rounded border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="p-3">तस्वीर</th>
                        <th className="p-3">शीर्षक व विवरण</th>
                        <th className="p-3">श्रेणी</th>
                        <th className="p-3">रिपोर्टर</th>
                        <th className="p-3">स्थिति</th>
                        <th className="p-3">दृश्य</th>
                        <th className="p-3 text-right">कार्य एवं स्थिति (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {paginatedArticles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-stone-500">
                            कोई समाचार उपलब्ध नहीं है।
                          </td>
                        </tr>
                      ) : (
                        paginatedArticles.map((art) => (
                          <tr key={art.id} className="hover:bg-stone-50/50">
                            {/* Image Thumbnail */}
                            <td className="p-3 w-16 align-top">
                              <img 
                                src={art.featured_image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=120'} 
                                alt="" 
                                className="w-12 h-10 object-cover rounded bg-stone-100 border border-stone-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=120';
                                }}
                              />
                            </td>

                            {/* Title, Subtitle, Location */}
                            <td className="p-3 max-w-sm align-top">
                              <div className="space-y-0.5">
                                <span className="font-bold text-stone-900 block line-clamp-2">{art.title}</span>
                                {art.subtitle && (
                                  <span className="text-[11px] text-stone-600 block line-clamp-1">{art.subtitle}</span>
                                )}
                                <div className="text-[10px] text-stone-400 flex items-center gap-2">
                                  <span>{art.location || 'गाजियाबाद'}</span>
                                  <span>·</span>
                                  <span className="font-mono">/{art.slug}</span>
                                  {art.is_breaking && <span className="text-red-600 font-bold">● टिकर</span>}
                                  {art.is_featured && <span className="text-amber-600 font-bold">★ लीड</span>}
                                </div>
                                {art.status === 'rejected' && art.review_notes && (
                                  <div className="mt-1 p-1.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-800">
                                    <strong>संपादकीय टिप्पणी:</strong> {art.review_notes}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-3 text-stone-600 align-top">
                              <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                {art.category_name || 'सामान्य'}
                              </span>
                            </td>

                            {/* Reporter */}
                            <td className="p-3 text-stone-600 align-top font-medium">
                              {art.author_name || 'डेस्क'}
                            </td>

                            {/* Status */}
                            <td className="p-3 align-top">
                              {renderStatusBadge(art.status)}
                            </td>

                            {/* Views */}
                            <td className="p-3 text-stone-600 align-top font-mono">
                              {art.view_count || 0}
                            </td>

                            {/* Action Buttons */}
                            <td className="p-3 text-right align-top">
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {/* Preview */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewArticle(art)}
                                  className="p-1 text-stone-600 hover:text-stone-900 rounded bg-stone-100 hover:bg-stone-200 cursor-pointer"
                                  title="पूर्ण विवरण देखें (Preview Details)"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => startEditArticle(art)}
                                  className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                                  title="संपादित करें (Edit)"
                                >
                                  संपादित
                                </button>

                                {/* Quick Status Toggles (Admin/Editor Only) */}
                                {currentUser.role_id !== 5 && (
                                  <>
                                    {art.status === 'published' ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateArticleStatus(art.id, 'unpublished')}
                                          className="px-1.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 cursor-pointer"
                                          title="वेबसाइट से अप्रकाशित करें"
                                        >
                                          अप्रकाशित
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateArticleStatus(art.id, 'hidden')}
                                          className="px-1.5 py-1 text-[11px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 cursor-pointer"
                                          title="वेबसाइट से छिपाएं"
                                        >
                                          छिपाएं
                                        </button>
                                      </>
                                    ) : art.status === 'archived' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleRestoreArticle(art.id)}
                                        className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer flex items-center gap-1"
                                        title="ड्राफ्ट में पुनर्स्थापित करें"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>बहाल</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateArticleStatus(art.id, 'published')}
                                        className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                                        title="वेबसाइट पर तुरंत लाइव प्रकाशित करें"
                                      >
                                        प्रकाशित
                                      </button>
                                    )}

                                    {/* Delete Modal Trigger */}
                                    <button
                                      type="button"
                                      onClick={() => setDeleteArticleModal({ isOpen: true, article: art, permanent: false })}
                                      className="p-1 text-red-600 hover:text-red-800 rounded bg-red-50 hover:bg-red-100 cursor-pointer border border-red-200"
                                      title="हटाएं (Delete / Archive)"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Toolbar */}
                <div className="p-3 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                  <div>
                    कुल <strong>{filteredArticles.length}</strong> में से{' '}
                    <strong>{filteredArticles.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> से{' '}
                    <strong>{Math.min(currentPage * itemsPerPage, filteredArticles.length)}</strong> समाचार दिखाए जा रहे हैं
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="p-1.5 border border-stone-300 rounded bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-semibold text-stone-800">
                      पृष्ठ {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="p-1.5 border border-stone-300 rounded bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEW / EDIT ARTICLE FORM */}
          {activeTab === 'new_article' && (
            <div className="bg-white rounded border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5 max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">
                    {editingArticle ? 'समाचार संशोधित करें (Edit News)' : 'नया समाचार प्रकाशित करें (Add News)'}
                  </h2>
                  <p className="text-xs text-stone-500">सभी आवश्यक विवरण भरें और प्रकाशन स्थिति चुनें</p>
                </div>
                <button
                  onClick={() => setActiveTab('articles')}
                  className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>

              {formMsg.text && (
                <div className={`p-3 text-xs rounded border ${
                  formMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {formMsg.text}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">समाचार मुख्य शीर्षक (Headline) *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="आकर्षक और तथ्यात्मक हिंदी शीर्षक दर्ज करें..."
                  className="w-full text-sm font-semibold p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>उप-शीर्षक (Subtitle / Secondary Headline)</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">वैकल्पिक</span>
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="घटनाक्रम की प्रमुख पंक्ति या पृष्ठभूमि..."
                  className="w-full text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Slug, Location, Category, Reporter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">श्रेणी (Category) *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value, 10) })}
                    className="w-full text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-white font-medium"
                  >
                    {categoryList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_hi} ({c.name_en})</option>
                    ))}
                  </select>
                </div>

                {/* Reporter / Author Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">संवाददाता / लेखक (Author)</label>
                  {isReporter ? (
                    <div>
                      <input
                        type="text"
                        disabled
                        value={`${currentUser.name} (आप)`}
                        className="w-full text-xs p-2 border border-stone-200 bg-stone-100 rounded text-stone-700 font-semibold cursor-not-allowed"
                      />
                      <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                        ✓ आपकी रिपोर्टर आईडी स्वतः संबद्ध है (स्वामित्व परिवर्तन वर्जित)
                      </span>
                    </div>
                  ) : (
                    <select
                      value={formData.author_id}
                      onChange={(e) => setFormData({ ...formData, author_id: parseInt(e.target.value, 10) })}
                      className="w-full text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-white font-medium"
                    >
                      {usersList.length > 0 ? (
                        usersList.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role_name || 'स्टाफ'})</option>
                        ))
                      ) : (
                        <option value={currentUser.id}>{currentUser.name}</option>
                      )}
                    </select>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">स्थान (Location)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="उदा. गाजियाबाद, इंदिरापुरम"
                    className="w-full text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">URL स्लग</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="स्वतः निर्मित होगा..."
                    className="w-full text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>टैग्स (Tags - अल्पविराम द्वारा अलग करें)</span>
                  <span className="text-stone-400 text-[10px]">उदा. गाजियाबाद, पुलिस, विकास, एनसीआर</span>
                </label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  placeholder="गाजियाबाद, पुलिस, क्राइम, इंदिरापुरम"
                  className="w-full text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Multiple Images Gallery for Article (1 से 5 तस्वीरें - हॉरिजॉन्टल स्क्रॉलिंग सपोर्ट) */}
              <div className="border border-stone-200 rounded-lg p-3.5 bg-stone-50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-red-600" />
                      <span>खबर की तस्वीरें (मल्टीपल इमेज सपोर्ट - अधिकतम 5 तस्वीरें)</span>
                    </label>
                    <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {((formData.gallery_images && formData.gallery_images.length > 0) ? formData.gallery_images.length : (formData.featured_image ? 1 : 0))} / 5
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] bg-white p-0.5 rounded border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                        imageInputMode === 'upload' ? 'bg-red-700 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      💻 PC / फोन से चुनें (मल्टीपल)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                        imageInputMode === 'url' ? 'bg-red-700 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      🔗 वेब इमेज URL से जोड़ें
                    </button>
                  </div>
                </div>

                {/* Upload or URL input area */}
                {imageInputMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleMultipleImagesUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <div 
                      onClick={() => {
                        const count = (formData.gallery_images && formData.gallery_images.length > 0)
                          ? formData.gallery_images.length 
                          : (formData.featured_image ? 1 : 0);
                        if (count >= 5) {
                          alert('अधिकतम 5 तस्वीरें पूरी हो चुकी हैं। नई तस्वीर जोड़ने के लिए पहले किसी तस्वीर को हटाएं।');
                          return;
                        }
                        imageInputRef.current?.click();
                      }}
                      className="border-2 border-dashed border-stone-300 hover:border-red-500 bg-white rounded-lg p-3.5 text-center cursor-pointer transition-colors"
                    >
                      {imageUploadLoading ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-red-700 py-2 font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>तस्वीरें अपलोड हो रही हैं... कृपया प्रतीक्षा करें</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-stone-500 py-1">
                          <Upload className="w-6 h-6 text-red-600" />
                          <span className="text-xs font-bold text-stone-800">
                            कंप्यूटर अथवा मोबाइल से 1 से 5 तस्वीरें चुनें (एक साथ कई तस्वीरें चुन सकते हैं)
                          </span>
                          <span className="text-[10px] text-stone-400">
                            JPG, PNG, WEBP प्रारूप समर्थित · एक बार में या अलग-अलग जोड़ें (अधिकतम 5 तस्वीरें)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={multiUrlInput}
                      onChange={(e) => setMultiUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="https://images.unsplash.com/... (वेब इमेज का लिंक डालें)"
                      className="flex-1 text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-stone-900 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded transition-colors cursor-pointer shrink-0"
                    >
                      + तस्वीर जोड़ें
                    </button>
                  </div>
                )}

                {/* Multiple Images Preview Strip & Controls */}
                {(() => {
                  const currentImages = (Array.isArray(formData.gallery_images) && formData.gallery_images.length > 0)
                    ? formData.gallery_images
                    : (formData.featured_image ? [formData.featured_image] : []);

                  if (currentImages.length === 0) return null;

                  return (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-stone-600">
                        <span className="font-bold text-stone-800 flex items-center gap-1">
                          <span>जोड़ी गई तस्वीरें:</span>
                          <span className="text-red-700 font-mono font-bold">({currentImages.length}/5)</span>
                        </span>
                        <span className="text-[10px] text-stone-500">
                          (पहली तस्वीर मुख्य कवर होगी · खबर में ये साइड-स्क्रॉलिंग में दिखेंगी)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                        {currentImages.map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            className={`relative rounded-md border-2 overflow-hidden bg-white shadow-2xs group flex flex-col justify-between ${
                              idx === 0 ? 'border-red-600 ring-2 ring-red-100' : 'border-stone-200'
                            }`}
                          >
                            <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100 relative">
                              <img 
                                src={imgUrl} 
                                alt={`Article img ${idx + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                                idx === 0 
                                  ? 'bg-red-700 text-white font-sans' 
                                  : 'bg-stone-900/80 text-white font-mono'
                              }`}>
                                {idx === 0 ? '⭐ मुख्य कवर' : `फोटो ${idx + 1}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1 right-1 bg-red-700 text-white p-1 rounded-full opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-xs"
                                title="हटाएं"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="p-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[10px]">
                              {idx === 0 ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                  ✓ मुख्य तस्वीर
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-stone-700 hover:text-red-700 font-semibold cursor-pointer underline flex items-center gap-0.5"
                                >
                                  मुख्य बनाएं
                                </button>
                              )}
                              <span className="text-stone-400 font-mono text-[9px]">#{idx + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Info Notice about Scrolling Effect */}
                      <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-900 flex items-center gap-1.5">
                        <span className="font-bold">📱 मोबाइल व वेब डिस्प्ले:</span>
                        <span>
                          {currentImages.length > 1
                            ? `आपने ${currentImages.length} तस्वीरें लगाई हैं। खबर खोलते ही ये तस्वीरें साइड-स्क्रॉलिंग (हाथ से स्वाइप) में दिखेंगी!`
                            : 'आप चाहें तो 4 और तस्वीरें जोड़ सकते हैं (कुल अधिकतम 5), जो खबर में साइड-स्क्रॉल होंगी।'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Caption and Credit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">फोटो विवरण (Caption)</label>
                    <input
                      type="text"
                      value={formData.image_caption}
                      onChange={(e) => setFormData({ ...formData, image_caption: e.target.value })}
                      placeholder="तस्वीर का संक्षिप्त विवरण..."
                      className="w-full text-xs p-1.5 border border-stone-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">फोटो साभार (Credit)</label>
                    <input
                      type="text"
                      value={formData.image_credit}
                      onChange={(e) => setFormData({ ...formData, image_credit: e.target.value })}
                      placeholder="ब्लैक लेंस ब्यूरो / साभार"
                      className="w-full text-xs p-1.5 border border-stone-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt / Summary */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>संक्षिप्त विवरण (Excerpt / Short Summary)</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">वैकल्पिक</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="खबर का 2-3 पंक्तियों में मुख्य सार..."
                  className="w-full text-xs p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Full Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">पूर्ण समाचार विवरण (Full Body - HTML) *</label>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content: formData.content + '<h3>उप-शीर्षक</h3>\n' })}
                      className="px-2 py-0.5 bg-stone-100 rounded hover:bg-stone-200 cursor-pointer"
                    >
                      + Subheading
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content: formData.content + '<blockquote>"विशेष वक्तव्य..."</blockquote>\n' })}
                      className="px-2 py-0.5 bg-stone-100 rounded hover:bg-stone-200 cursor-pointer"
                    >
                      + Quote
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<p>गाजियाबाद के प्रमुख घटनाक्रम...</p>"
                  className="w-full text-xs p-2.5 font-mono border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Video URL */}
              <div className="border border-stone-200 rounded-lg p-3 bg-stone-50 space-y-2">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-red-600" />
                  <span>वीडियो रिपोर्ट / बुलेटिन लिंक (YouTube or Video URL)</span>
                </label>
                <input
                  type="text"
                  value={formData.video_url}
                  onChange={(e) => {
                    const url = e.target.value;
                    setFormData({ ...formData, video_url: url, is_video_news: !!url.trim() });
                  }}
                  placeholder="https://www.youtube.com/watch?v=... या MP4 URL"
                  className="w-full text-xs p-2 border border-stone-300 rounded bg-white font-mono"
                />
              </div>

              {/* Toggles: Breaking, Featured, Trending */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded border border-stone-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.is_breaking}
                    onChange={(e) => setFormData({ ...formData, is_breaking: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>ब्रेकिंग टिकर में दिखाएं</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>लीड स्टोरी बनाएं</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>ट्रेंडिंग में रखें</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.is_on_home}
                    onChange={(e) => setFormData({ ...formData, is_on_home: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>होमपेज पर प्रदर्शित करें</span>
                </label>
              </div>

              {/* Publication Status Selector (Admin/Editor Only) */}
              {!isReporter && (
                <div className="bg-stone-50 p-3 rounded border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-800 block">प्रकाशन स्थिति (Target Status):</label>
                    <p className="text-[11px] text-stone-500">लेख सुरक्षित करते समय वांछित स्थिति चुनें</p>
                  </div>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                    className="p-2 border border-stone-300 rounded bg-white text-xs font-bold"
                  >
                    <option value="published">प्रकाशित (Published - तुरंत लाइव)</option>
                    <option value="draft">ड्राफ्ट (Draft)</option>
                    <option value="pending_review">समीक्षाधीन (Pending Review)</option>
                    <option value="approved">स्वीकृत (Approved)</option>
                    <option value="unpublished">अप्रकाशित (Unpublished)</option>
                    <option value="hidden">छिपाया गया (Hidden)</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => handleSaveArticle('draft')}
                  disabled={formSubmitting}
                  className="px-4 py-2 border border-stone-300 rounded text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  ड्राफ्ट के रूप में सहेजें (Save Draft)
                </button>

                <div className="flex items-center gap-2">
                  {isReporter ? (
                    <button
                      type="button"
                      onClick={() => handleSaveArticle('pending_review')}
                      disabled={formSubmitting}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>संपादक की समीक्षा हेतु भेजें (Submit for Review)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveArticle('published')}
                      disabled={formSubmitting}
                      className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{editingArticle ? 'अपडेट एवं तुरंत प्रकाशित करें' : 'तुरंत प्रकाशित करें (Publish Live)'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EDITORIAL REVIEW DESK */}
          {activeTab === 'review_desk' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-stone-900">संपादकीय समीक्षा डेस्क (Editorial Review)</h1>
                <p className="text-xs text-stone-500">
                  रिपोर्टरों द्वारा भेजी गई खबरों का सत्यापन करें, संपादकीय नोट्स जोड़ें और एक क्लिक में स्वीकृत, लाइव प्रकाशित अथवा सुधार हेतु लौटाएं
                </p>
              </div>

              <div className="space-y-4">
                {articlesList.filter(a => a.status === 'pending_review').length === 0 ? (
                  <div className="bg-white p-8 rounded border border-stone-200 text-center text-stone-500 text-xs">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <p className="font-bold text-stone-800 text-sm">सभी खबरों की समीक्षा पूर्ण हो चुकी है!</p>
                    <p className="mt-1">वर्तमान में कोई भी समाचार समीक्षा हेतु लंबित नहीं है।</p>
                  </div>
                ) : (
                  articlesList.filter(a => a.status === 'pending_review').map((pendingArt) => (
                    <div key={pendingArt.id} className="bg-white rounded border border-stone-200 p-4 shadow-2xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                            समीक्षाधीन (Pending Review)
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            संवाददाता: <strong className="text-stone-800">{pendingArt.author_name}</strong>
                          </span>
                          <span>·</span>
                          <span className="text-xs text-stone-500">{pendingArt.location || 'गाजियाबाद'}</span>
                          <span>·</span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(pendingArt.created_at).toLocaleDateString('hi-IN')}
                          </span>
                        </div>
                        <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                          श्रेणी: <strong>{pendingArt.category_name}</strong>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-stone-900">{pendingArt.title}</h3>
                      {pendingArt.subtitle && (
                        <p className="text-xs text-stone-600 italic -mt-1">{pendingArt.subtitle}</p>
                      )}
                      
                      <div className="bg-stone-50 p-3 rounded text-xs text-stone-700 leading-relaxed border border-stone-200/60 line-clamp-3">
                        {pendingArt.excerpt || pendingArt.content.replace(/<[^>]+>/g, '').slice(0, 300) + '...'}
                      </div>

                      {/* Review Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => setReviewModal({ isOpen: true, article: pendingArt, notes: '' })}
                          className="text-xs font-bold text-red-700 hover:text-red-900 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>पूरा आलेख पढ़ें एवं समीक्षा करें &rarr;</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDirectReview(pendingArt.id, 'approved', 'संपादक द्वारा स्वीकृत')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-semibold cursor-pointer shadow-xs"
                          >
                            स्वीकृत करें (Approve)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDirectReview(pendingArt.id, 'published', 'समीक्षा उपरांत लाइव प्रकाशित किया गया')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 rounded font-bold cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            <span>स्वीकृत कर लाइव करें</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const notes = prompt('सुधार हेतु टिप्पणी दर्ज करें (Review Notes):', 'कृपया तथ्य और फोटो पुनः सत्यापित करें।');
                              if (notes) {
                                handleDirectReview(pendingArt.id, 'rejected', notes);
                              }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs px-3 py-1.5 rounded font-semibold cursor-pointer"
                          >
                            सुधार हेतु लौटाएं (Reject with Notes)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BREAKING NEWS TICKER (MODULE 2) */}
          {activeTab === 'breaking' && (currentUser.role_id === 1 || currentUser.role_id === 2) && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-stone-900">ब्रेकिंग न्यूज़ टिकर प्रबंधन</h1>
                  <p className="text-xs text-stone-500">
                    वेबसाइट के शीर्ष पर चलने वाली लाल टिकर पट्टी में ताज़ा हेडलाइंस जोड़ें, क्रम बदलें, छिपाएं अथवा हटाएं
                  </p>
                </div>
                <button
                  onClick={() => setBreakingModal({
                    isOpen: true,
                    item: { title: '', display_order: breakingList.length + 1, is_active: true }
                  })}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ नई ब्रेकिंग हेडलाइन</span>
                </button>
              </div>

              {/* Quick Add Form Bar */}
              <div className="bg-white p-4 rounded border border-stone-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>त्वरित हेडलाइन जोड़ें (Quick Add to Live Ticker)</span>
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const inputEl = (e.currentTarget.elements.namedItem('quickTitle') as HTMLInputElement);
                    if (inputEl && inputEl.value.trim()) {
                      handleSaveBreakingItem({
                        preventDefault: () => {},
                      } as any);
                    }
                  }}
                  className="flex flex-wrap sm:flex-nowrap gap-2"
                >
                  <input
                    type="text"
                    required
                    id="quickBreakingInput"
                    placeholder="उदा. गाजियाबाद: हिंडन एलिवेटेड रोड पर सुरक्षा के कड़े इंतजाम, पुलिस का फ्लैग मार्च..."
                    className="flex-1 text-xs p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const input = document.getElementById('quickBreakingInput') as HTMLInputElement;
                      if (!input || !input.value.trim()) return;
                      const title = input.value.trim();
                      try {
                        const res = await fetch('/api/admin/breaking-news', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            title,
                            display_order: breakingList.length + 1,
                            is_active: true
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          input.value = '';
                          showAlert('✓ ब्रेकिंग न्यूज़ टिकर में जुड़ गई और लाइव हो गई!');
                          fetchDashboardData();
                          onRefreshData();
                        } else {
                          showAlert(data.message || 'विफल।', 'error');
                        }
                      } catch (err: any) {
                        showAlert(err.message, 'error');
                      }
                    }}
                    className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded cursor-pointer shrink-0 shadow-xs"
                  >
                    + टिकर में जोड़ें
                  </button>
                </form>
              </div>

              {/* Ticker Items List */}
              <div className="bg-white rounded border border-stone-200 overflow-hidden shadow-2xs">
                <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    कुल टिकर हेडलाइंस ({breakingList.length}) · सक्रिय: {breakingList.filter(b => b.is_active).length}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    क्रम संख्या के अनुसार वेबसाइट पर प्रदर्शित होती हैं
                  </span>
                </div>

                <div className="divide-y divide-stone-100">
                  {breakingList.length === 0 ? (
                    <div className="p-8 text-center text-stone-500 text-xs">
                      कोई ब्रेकिंग न्यूज़ उपलब्ध नहीं है। ऊपर दिए गए फॉर्म से नई हेडलाइन जोड़ें।
                    </div>
                  ) : (
                    breakingList.map((item, idx) => (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-stone-50/60 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded bg-red-100 text-red-800 font-bold flex items-center justify-center font-mono shrink-0 text-[11px]">
                            #{item.display_order || idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-stone-900 block truncate">{item.title}</span>
                            {item.external_url && (
                              <span className="text-[10px] text-blue-600 truncate block font-mono">
                                🔗 {item.external_url}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Active / Inactive Badge & Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleBreaking(item.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                              item.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                            }`}
                            title="स्थिति बदलें (सक्रिय / छिपाएं)"
                          >
                            {item.is_active ? '● सक्रिय (Active)' : '○ छिपाया गया (Hidden)'}
                          </button>

                          {/* Edit Item */}
                          <button
                            type="button"
                            onClick={() => setBreakingModal({ isOpen: true, item })}
                            className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBreaking(item)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                            title="टिकर से हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CATEGORIES & TAGS (MODULE 3) */}
          {activeTab === 'categories' && (currentUser.role_id === 1 || currentUser.role_id === 2) && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-stone-900">श्रेणियां एवं टैग्स प्रबंधन (Categories & Tags)</h1>
                <p className="text-xs text-stone-500">
                  समाचार श्रेणियों व ट्रेंडिंग टैग्स का सृजन, संपादन, स्थिति परिवर्तन एवं सुरक्षित विलोपन
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ---------------- CATEGORIES COLUMN ---------------- */}
                <div className="bg-white rounded border border-stone-200 shadow-2xs overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <FolderTree className="w-4 h-4 text-red-700" />
                        <span>समाचार श्रेणियां ({categoryList.length})</span>
                      </h2>
                      <p className="text-[11px] text-stone-500">गाजियाबाद, अपराध, खेल, मनोरंजन आदि</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({
                        isOpen: true,
                        cat: {
                          name_hi: '',
                          name_en: '',
                          slug: '',
                          description: '',
                          display_order: categoryList.length + 1,
                          is_in_menu: true,
                          is_in_home: true,
                          is_active: true
                        }
                      })}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer shadow-xs"
                    >
                      + नई श्रेणी
                    </button>
                  </div>

                  <div className="p-3 divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
                    {categoryList.map((c) => (
                      <div key={c.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{c.name_hi}</span>
                            <span className="text-stone-500 text-[11px]">({c.name_en})</span>
                            <span className="bg-stone-100 text-stone-600 font-mono text-[10px] px-1.5 py-0.2 rounded">
                              {c.article_count || 0} खबरें
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono block">
                            /{c.slug} · क्रम: #{c.display_order} {c.is_in_menu ? '· मेनू' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(c.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                              c.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}
                            title="सक्रिय / निष्क्रिय करें"
                          >
                            {c.is_active ? 'सक्रिय' : 'निष्क्रिय'}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setCategoryModal({ isOpen: true, cat: c })}
                            className="p-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete with safe reassignment */}
                          <button
                            type="button"
                            onClick={() => setDeleteCatModal({
                              isOpen: true,
                              cat: c,
                              reassignTo: categoryList.find(x => x.id !== c.id)?.id || 1
                            })}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                            title="सुरक्षित हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---------------- TAGS COLUMN ---------------- */}
                <div className="bg-white rounded border border-stone-200 shadow-2xs overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <TagIcon className="w-4 h-4 text-red-700" />
                        <span>ट्रेंडिंग टैग्स ({tagList.length})</span>
                      </h2>
                      <p className="text-[11px] text-stone-500">खोज एवं संबंधित समाचारों के लिए टैग्स</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTagModal({
                        isOpen: true,
                        tag: { name: '', slug: '', description: '', is_popular: true, is_active: true }
                      })}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer shadow-xs"
                    >
                      + नया टैग
                    </button>
                  </div>

                  <div className="p-3 divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
                    {tagList.map((t) => (
                      <div key={t.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">#{t.name}</span>
                            {t.is_popular && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                ★ ट्रेंडिंग
                              </span>
                            )}
                            <span className="bg-stone-100 text-stone-600 font-mono text-[10px] px-1.5 py-0.2 rounded">
                              {t.article_count || 0} खबरें
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono block">/{t.slug}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleTag(t.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                              t.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}
                            title="सक्रिय / निष्क्रिय करें"
                          >
                            {t.is_active ? 'सक्रिय' : 'निष्क्रिय'}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setTagModal({ isOpen: true, tag: t })}
                            className="p-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(t)}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: ADVERTISEMENTS (MODULE 4) */}
          {activeTab === 'ads' && (currentUser.role_id === 1 || currentUser.role_id === 2) && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-red-700" />
                    <span>डिजिटल विज्ञापन प्रबंधन (Advertisement Management)</span>
                  </h1>
                  <p className="text-xs text-stone-500">
                    वेबसाइट के हेडर, होमपेज, साइडबार, इन-फीड, आर्टिकल इनलाइन व फुटर स्लॉट्स में विज्ञापन अभियान नियंत्रित करें
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAdModal({
                    isOpen: true,
                    ad: {
                      title: '',
                      advertiser_name: '',
                      placement: 'header_banner',
                      image_url: '',
                      destination_url: 'https://',
                      description: '',
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: '2026-12-31',
                      display_order: advertisementsList.length + 1,
                      status: 'active',
                      is_active: true
                    }
                  })}
                  className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ नया विज्ञापन जोड़ें (Add Advertisement)</span>
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">कुल विज्ञापन अभियान</span>
                  <strong className="text-lg font-bold text-stone-900">{advertisementsList.length}</strong>
                </div>
                <div className="bg-white p-3.5 rounded border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">सक्रिय विज्ञापन</span>
                  <strong className="text-lg font-bold text-emerald-700">
                    {advertisementsList.filter(a => a.is_active && (!a.status || a.status === 'active')).length}
                  </strong>
                </div>
                <div className="bg-white p-3.5 rounded border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">कुल इंप्रेशन्स (Impressions)</span>
                  <strong className="text-lg font-bold text-blue-700 font-mono">
                    {advertisementsList.reduce((acc, a) => acc + (a.impressions_count || 0), 0).toLocaleString('hi-IN')}
                  </strong>
                </div>
                <div className="bg-white p-3.5 rounded border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">कुल क्लिक्स (Clicks)</span>
                  <strong className="text-lg font-bold text-red-700 font-mono">
                    {advertisementsList.reduce((acc, a) => acc + (a.clicks_count || 0), 0).toLocaleString('hi-IN')}
                  </strong>
                </div>
              </div>

              {/* Advertisements List */}
              <div className="bg-white rounded border border-stone-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-stone-900">
                    विज्ञापन सूची ({advertisementsList.length})
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    वेबसाइट पर केवल 'सक्रिय' और मान्य तिथि वाले विज्ञापन प्रदर्शित होते हैं
                  </span>
                </div>

                <div className="divide-y divide-stone-100">
                  {advertisementsList.length === 0 ? (
                    <div className="p-10 text-center text-stone-500 text-xs space-y-2">
                      <Megaphone className="w-10 h-10 text-stone-300 mx-auto" />
                      <p className="font-bold text-stone-700">कोई विज्ञापन उपलब्ध नहीं है</p>
                      <p className="text-[11px]">ऊपर दिए गए "+ नया विज्ञापन जोड़ें" बटन से नया अभियान बनाएं।</p>
                    </div>
                  ) : (
                    advertisementsList.map((ad) => {
                      const placementInfo = AD_PLACEMENTS.find(p => p.id === ad.placement) || {
                        id: ad.placement,
                        name: ad.placement,
                        dims: 'कस्टम आकार'
                      };

                      return (
                        <div key={ad.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors text-xs">
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div className="w-24 h-16 rounded border border-stone-200 overflow-hidden bg-stone-100 shrink-0 relative group">
                              {ad.image_url ? (
                                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">कोई छवि नहीं</div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-stone-900 text-sm">{ad.title}</h3>
                                {ad.advertiser_name && (
                                  <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium border border-stone-200">
                                    {ad.advertiser_name}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  ad.is_active && (!ad.status || ad.status === 'active')
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-stone-100 text-stone-600 border-stone-300'
                                }`}>
                                  {ad.is_active ? '● सक्रिय' : '○ निष्क्रिय'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                                <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                  {placementInfo.name} — ({placementInfo.dims}) {(placementInfo as any).locationLabel ? `· ${(placementInfo as any).locationLabel}` : ''}
                                </span>
                                <span>·</span>
                                <a 
                                  href={ad.destination_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-0.5 font-mono truncate max-w-[200px]"
                                >
                                  <span>{ad.destination_url}</span>
                                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                                </a>
                              </div>

                              {ad.start_date && ad.end_date && (
                                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-0.5">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  <span>शेड्यूल: {ad.start_date} से {ad.end_date}</span>
                                  <span className="text-stone-300">|</span>
                                  <span>क्रम: #{ad.display_order || 1}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Middle: Impressions & Clicks Stats */}
                          <div className="flex items-center gap-4 bg-stone-50 px-3 py-1.5 rounded border border-stone-200 text-center shrink-0">
                            <div>
                              <span className="text-[10px] text-stone-500 block uppercase">इंप्रेशन</span>
                              <strong className="text-xs font-mono text-stone-900">{ad.impressions_count || 0}</strong>
                            </div>
                            <span className="text-stone-300">/</span>
                            <div>
                              <span className="text-[10px] text-stone-500 block uppercase">क्लिक</span>
                              <strong className="text-xs font-mono text-red-700">{ad.clicks_count || 0}</strong>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleAd(ad.id)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                                ad.is_active
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                              }`}
                              title="स्थिति बदलें"
                            >
                              {ad.is_active ? 'सक्रिय' : 'छिपाएं'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setAdModal({ isOpen: true, ad })}
                              className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                              title="संपादित करें"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteAdModal({ isOpen: true, ad })}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                              title="विज्ञापन हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Placement Dimensions Guidance Card */}
              <div className="bg-stone-50 rounded border border-stone-200 p-4 space-y-3">
                <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-red-700" />
                  <span>विज्ञापन स्थान एवं मानक चित्र आकार संदर्भ (Recommended Image Dimensions)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {AD_PLACEMENTS.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded border border-stone-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-stone-900 font-semibold">{p.name.split(' (')[0]}</strong>
                        <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          {p.dims}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY SUBMITTED NEWS (MODULE 2: MY SUBMITTED NEWS) */}
          {activeTab === 'my_submissions' && (
            <div className="space-y-6 max-w-6xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    <span>मेरी प्रस्तुत खबरें (My Submitted News)</span>
                  </h1>
                  <p className="text-xs text-stone-600 mt-0.5">
                    केवल आपके द्वारा सबमिट किए गए समाचारों की सूची, समीक्षा स्थिति, अंतिम अपडेट और संपादन
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-xs px-3 py-2 rounded text-stone-700 font-medium cursor-pointer shadow-2xs transition-colors disabled:opacity-60"
                    title="समाचार सूची ताज़ा करें"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                    <span>{isRefreshing ? 'रिफ्रेश हो रहा है...' : 'रिफ्रेश'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      startNewArticle();
                      setActiveTab('new_article');
                    }}
                    className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ नया समाचार जोड़ें (Add News)</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              {(() => {
                const myAllArticles = isReporter 
                  ? articlesList 
                  : articlesList.filter(a => Number(a.author_id) === Number(currentUser.id));
                const filteredBySearchAndStatus = myAllArticles.filter(art => {
                  const matchStatus = reporterFilter === 'all' || art.status === reporterFilter;
                  const q = reporterSearchQuery.toLowerCase().trim();
                  const matchQuery = !q || 
                    (art.title && art.title.toLowerCase().includes(q)) ||
                    (art.category_name && art.category_name.toLowerCase().includes(q)) ||
                    (art.location && art.location.toLowerCase().includes(q));
                  return matchStatus && matchQuery;
                });

                return (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {/* Status Filter Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 bg-stone-200/80 p-1 rounded-lg text-xs">
                        {[
                          { id: 'all', label: 'सभी' },
                          { id: 'published', label: 'लाइव प्रकाशित' },
                          { id: 'pending_review', label: 'समीक्षाधीन' },
                          { id: 'draft', label: 'ड्राफ्ट' },
                          { id: 'rejected', label: 'सुधार आवश्यक' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setReporterFilter(tab.id as any)}
                            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer text-xs ${
                              reporterFilter === tab.id
                                ? 'bg-white text-stone-900 shadow-xs font-bold'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className="ml-1 text-[10px] font-mono opacity-70">
                              ({tab.id === 'all' 
                                ? myAllArticles.length 
                                : myAllArticles.filter(a => a.status === tab.id).length})
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Search in My Articles */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={reporterSearchQuery}
                          onChange={(e) => setReporterSearchQuery(e.target.value)}
                          placeholder="अपनी खबरों में खोजें..."
                          className="w-full text-xs pl-8 pr-7 py-2 border border-stone-300 rounded-lg bg-white focus:border-red-600 focus:outline-none"
                        />
                        {reporterSearchQuery && (
                          <button
                            onClick={() => setReporterSearchQuery('')}
                            className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reporter News Cards & List */}
                    <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
                      <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-900">
                          प्रदर्शित समाचार: {filteredBySearchAndStatus.length} (कुल: {myAllArticles.length})
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          गोपनीयता: केवल आपके द्वारा सबमिट किए गए समाचार प्रदर्शित हैं
                        </span>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {filteredBySearchAndStatus.length === 0 ? (
                          <div className="p-12 text-center text-stone-500 text-xs space-y-3">
                            <FileText className="w-12 h-12 text-stone-300 mx-auto" />
                            <div className="space-y-1">
                              <p className="font-bold text-stone-800 text-sm">
                                {reporterSearchQuery || reporterFilter !== 'all' 
                                  ? 'इस फ़िल्टर में कोई समाचार नहीं मिला' 
                                  : 'आपने अभी तक कोई समाचार प्रस्तुत नहीं किया है'}
                              </p>
                              <p className="text-stone-500 text-xs">
                                {reporterSearchQuery || reporterFilter !== 'all'
                                  ? 'कृपया फ़िल्टर रीसेट करें या कोई अन्य कीवर्ड खोजें।'
                                  : 'ग्राउंड से पहली खबर रिपोर्ट करने के लिए नीचे क्लिक करें।'}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (reporterSearchQuery || reporterFilter !== 'all') {
                                  setReporterSearchQuery('');
                                  setReporterFilter('all');
                                } else {
                                  startNewArticle();
                                  setActiveTab('new_article');
                                }
                              }}
                              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md font-bold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                            >
                              {reporterSearchQuery || reporterFilter !== 'all' ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>फ़िल्टर रीसेट करें</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>+ नया समाचार लिखें</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          filteredBySearchAndStatus.map((art) => (
                            <div key={art.id} className="p-4 sm:p-5 space-y-3 hover:bg-stone-50/60 transition-colors">
                              {/* Top Bar: Status, Category, Dates */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {renderStatusBadge(art.status)}
                                  <span className="font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-100">
                                    {art.category_name || 'सामान्य'}
                                  </span>
                                  {art.location && (
                                    <span className="text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-medium">
                                      📍 {art.location}
                                    </span>
                                  )}
                                  <span className="text-stone-400">·</span>
                                  <span className="text-stone-500 text-[11px]">
                                    सबमिशन तिथि: <strong>{new Date(art.created_at).toLocaleDateString('hi-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}</strong>
                                  </span>
                                  {art.updated_at && (
                                    <>
                                      <span className="text-stone-300">|</span>
                                      <span className="text-stone-500 text-[11px]">
                                        अंतिम अपडेट: <strong>{new Date(art.updated_at).toLocaleDateString('hi-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric'
                                        })}</strong>
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* Actions: View, Edit (Workflow restricted), Submit for review */}
                                <div className="flex items-center gap-2 text-xs shrink-0">
                                  {/* View / Preview Modal */}
                                  <button
                                    type="button"
                                    onClick={() => setPreviewArticle(art)}
                                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-semibold cursor-pointer inline-flex items-center gap-1 border border-stone-200"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>पूर्वावलोकन</span>
                                  </button>

                                  {/* Edit: Allowed only when permitted by workflow (draft or rejected/needs revision) */}
                                  {(art.status === 'draft' || art.status === 'rejected') ? (
                                    <button
                                      type="button"
                                      onClick={() => startEditArticle(art)}
                                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-bold cursor-pointer border border-blue-200 inline-flex items-center gap-1"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>संपादित करें</span>
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-stone-500 italic bg-stone-50 px-2 py-1 rounded border border-stone-200" title="यह लेख समीक्षाधीन या प्रकाशित है">
                                      🔒 संपादन लॉक
                                    </span>
                                  )}

                                  {/* 1-Click Submit for Review for Draft/Rejected */}
                                  {(art.status === 'draft' || art.status === 'rejected') && (
                                    <button
                                      type="button"
                                      onClick={() => handleSubmitArticleForReview(art.id)}
                                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold cursor-pointer shadow-xs inline-flex items-center gap-1"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>समीक्षा हेतु भेजें</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Article Title & Subtitle */}
                              <div>
                                <h3 className="font-bold text-stone-900 text-base leading-snug hover:text-red-700 transition-colors">
                                  {art.title}
                                </h3>
                                {art.subtitle && (
                                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                                    {art.subtitle}
                                  </p>
                                )}
                              </div>

                              {/* Reader Stats & Excerpt */}
                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                                <span className="flex items-center gap-1 font-mono">
                                  <Eye className="w-3 h-3 text-stone-400" />
                                  <span>{art.view_count || 0} पाठक दृश्य (Views)</span>
                                </span>
                                {art.tags && art.tags.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <TagIcon className="w-3 h-3 text-stone-400" />
                                    <span>{Array.isArray(art.tags) ? art.tags.join(', ') : art.tags}</span>
                                  </span>
                                )}
                              </div>

                              {/* Review Notes from Editorial Desk if Rejected / Needs Revision */}
                              {art.review_notes && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
                                  <strong className="flex items-center gap-1.5 font-bold text-amber-900">
                                    <MessageSquare className="w-4 h-4 text-amber-700" />
                                    <span>संपादक की टिप्पणी / सुधार निर्देश:</span>
                                  </strong>
                                  <p className="leading-relaxed text-amber-800">{art.review_notes}</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: SETTINGS — REPORTER PROFILE (MODULE 4: REPORTER PROFILE SETTINGS) */}
          {activeTab === 'settings' && isReporter && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-red-700" />
                  <span>सेटिंग्स — रिपोर्टर प्रोफ़ाइल (Reporter Profile Settings)</span>
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  अपनी व्यक्तिगत प्रोफ़ाइल जानकारी और लॉगिन पासवर्ड को सुरक्षित रूप से अपडेट करें
                </p>
              </div>

              {/* Profile Message Alert */}
              {profileMsg.text && (
                <div className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2.5 shadow-2xs ${
                  profileMsg.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {profileMsg.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Profile Settings Form: Exactly 3 Editable Fields */}
              <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-lg border border-stone-200 shadow-2xs space-y-5">
                
                {/* 0. Profile Photo / Avatar */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    प्रोफ़ाइल फोटो (Reporter Profile Photo / Avatar)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                      {profileAvatar ? (
                        <img 
                          src={profileAvatar} 
                          alt="प्रोफ़ाइल फोटो" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          {profileName ? profileName.slice(0, 2).toUpperCase() : 'BL'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded border border-stone-300 cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-red-600" />
                          <span>{profileAvatarLoading ? 'अपलोड हो रहा है...' : 'कंप्यूटर / फोन से फोटो चुनें'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={profileAvatarLoading}
                            onChange={handleProfileAvatarSelect}
                            className="hidden"
                          />
                        </label>
                        {profileAvatar && (
                          <button
                            type="button"
                            onClick={() => setProfileAvatar('')}
                            className="px-2.5 py-1.5 text-xs text-red-700 hover:text-red-900 hover:bg-red-50 rounded border border-red-200 transition-colors cursor-pointer"
                          >
                            फोटो हटाएं
                          </button>
                        )}
                        <a
                          href="#reporter-about-journalist"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-red-600" />
                          <span>पत्रकारिता परिचय (Bio) लिखें / संपादित करें</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        यह फोटो आपके द्वारा प्रस्तुत किए गए समाचारों में आपके नाम के साथ बायलाइन में दिखेगी।
                      </p>
                    </div>
                  </div>
                </div>

                {/* पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist / Bio) */}
                <div id="reporter-about-journalist" className="p-4 sm:p-5 bg-gradient-to-br from-stone-50 to-red-50/30 border-2 border-red-200/80 rounded-xl space-y-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        BL
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-900">
                          पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist)
                        </label>
                        <p className="text-[11px] text-stone-500">
                          अपने बारे में परिचय व कार्यक्षेत्र लिखें। जब आप खबर डालेंगे तो आपके नाम के नीचे यही परिचय दिखेगा।
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {profileBio && (
                        <button
                          type="button"
                          onClick={() => setProfileBio('')}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="परिचय हटाएं / खाली करें"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>परिचय हटाएं</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setProfileBio('ब्लैक लेंस डिजिटल मीडिया हाउस के साथ गाजियाबाद, उत्तर प्रदेश व राष्ट्रीय खबरों का निष्पक्ष, स्वतंत्र एवं सटीक संकलन व प्रसारण।')}
                        className="px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 rounded border border-stone-300 transition-colors cursor-pointer flex items-center gap-1"
                        title="डिफ़ॉल्ट परिचय भरें"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>डिफ़ॉल्ट परिचय भरें</span>
                      </button>
                    </div>
                  </div>

                  {/* Bio Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <span>पत्रकारिता परिचय (Journalist Bio / About)</span>
                        <span className="text-[10px] text-stone-400 font-normal">(लिखें, संपादित करें या हटाएं)</span>
                      </label>
                      <span className={`text-[10px] font-mono ${profileBio.length > 400 ? 'text-amber-600 font-bold' : 'text-stone-400'}`}>
                        {profileBio.length} / 500 अक्षर
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value.slice(0, 500))}
                      placeholder="उदा. 'गाजियाबाद एवं दिल्ली एनसीआर के अपराध, राजनीति और विकास कार्यों पर 8 वर्षों से निष्पक्ष ग्राउंड रिपोर्टिंग। जनसरोकार और सटीक पत्रकारिता के लिए समर्पित।'"
                      className="w-full text-xs p-3 border border-stone-300 rounded-lg bg-white focus:border-red-600 focus:outline-none leading-relaxed font-sans shadow-2xs"
                    />
                  </div>

                  {/* Assigned Region / Beat */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      कार्यक्षेत्र / रिपोर्टिंग बीट (Assigned Reporting Region / Beat)
                    </label>
                    <input
                      type="text"
                      value={profileRegion}
                      onChange={(e) => setProfileRegion(e.target.value)}
                      placeholder="उदा. गाजियाबाद / दिल्ली एनसीआर / पश्चिमी उत्तर प्रदेश"
                      className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none font-medium"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      यह कार्यक्षेत्र आपके प्रोफ़ाइल कार्ड और समाचार में स्थान के रूप में प्रदर्शित होगा।
                    </p>
                  </div>

                  {/* Live Reader Preview Box */}
                  <div className="p-3 bg-white rounded-lg border border-red-200/60 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>लाइव पूर्वावलोकन (आपकी खबर के नीचे पाठकों को ऐसे दिखेगा):</span>
                      </span>
                      <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                        Live Byline Preview
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-md border border-stone-200">
                      <div className="relative shrink-0">
                        {profileAvatar ? (
                          <img
                            src={profileAvatar}
                            alt="लेखक"
                            className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            {profileName ? profileName.slice(0, 2).toUpperCase() : 'BL'}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border-2 border-white shadow-2xs">
                          <UserCheck className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-stone-900">{profileName || 'आपका नाम'}</span>
                          <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200 font-semibold">
                            {currentUser?.role_name || 'संवाददाता'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 italic line-clamp-2 mt-0.5 font-sans">
                          {profileBio || 'ब्लैक लेंस डिजिटल मीडिया हाउस के साथ निष्पक्ष एवं सटीक पत्रकारिता।'}
                        </p>
                        <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-red-600 shrink-0" />
                          <span>{profileRegion || 'गाजियाबाद / दिल्ली एनसीआर'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    1. पूरा नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="उदा. प्रिया चौहान"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-medium"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    यह नाम आपके द्वारा सबमिट किए गए समाचारों में बायलाइन (Byline) के रूप में प्रदर्शित होगा।
                  </p>
                </div>

                {/* 2. Email Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    2. ईमेल पता (Email Address) *
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="reporter@teznazar.com"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    लॉगिन करने और संपादकीय सूचनाओं के लिए इस ईमेल का उपयोग होगा।
                  </p>
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    3. मोबाइल नंबर (Mobile Number)
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="उदा. +91 98222 33445"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    फील्ड समन्वय एवं सूचनाओं हेतु आधिकारिक मोबाइल नंबर।
                  </p>
                </div>

                {/* 4. Password Change Section */}
                <div className="pt-4 border-t border-stone-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-800">
                      4. पासवर्ड परिवर्तन (Change Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowProfilePasswords(!showProfilePasswords)}
                      className="text-[11px] text-red-700 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer select-none"
                    >
                      {showProfilePasswords ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>पासवर्ड छिपाएं</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>शो पासवर्ड (Show Password)</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    यदि आप अपना पासवर्ड बदलना चाहते हैं तो कृपया वर्तमान पासवर्ड और नया पासवर्ड दर्ज करें:
                  </p>

                  <div className="space-y-3 bg-stone-50 p-4 rounded-lg border border-stone-200">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        वर्तमान पासवर्ड (Current Password)
                      </label>
                      <input
                        type={showProfilePasswords ? 'text' : 'password'}
                        value={profileCurrentPassword}
                        onChange={(e) => setProfileCurrentPassword(e.target.value)}
                        placeholder="सुरक्षा हेतु अपना वर्तमान पासवर्ड दर्ज करें"
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          नया पासवर्ड (New Password)
                        </label>
                        <input
                          type={showProfilePasswords ? 'text' : 'password'}
                          value={profileNewPassword}
                          onChange={(e) => setProfileNewPassword(e.target.value)}
                          placeholder="कम से कम 6 अक्षर"
                          className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none"
                        />
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          नया पासवर्ड कन्फर्म करें (Confirm Password)
                        </label>
                        <input
                          type={showProfilePasswords ? 'text' : 'password'}
                          value={profileConfirmPassword}
                          onChange={(e) => setProfileConfirmPassword(e.target.value)}
                          placeholder="नया पासवर्ड पुनः दर्ज करें"
                          className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
                  <div className="text-[11px] text-stone-500">
                    सुरक्षा मानक: पासवर्ड को Bcrypt द्वारा सुरक्षित रूप से हैश व एन्क्रिप्ट किया जाता है।
                  </div>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-md transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>अपडेट हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>प्रोफ़ाइल सुरक्षित करें (Save Profile)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Read-Only Account Details Card */}
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1.5">
                <div className="font-bold text-stone-800 text-xs mb-1">खाता सूचना (Account Information)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>भूमिका: <strong className="text-stone-900">रिपोर्टर (पत्रकार)</strong></div>
                  <div>क्षेत्र: <strong className="text-stone-900">{currentUser.assigned_region || 'गाजियाबाद'}</strong></div>
                  <div>स्थिति: <span className="text-emerald-700 font-bold">● स्वीकृत एवं सक्रिय</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EDITOR PROFILE SETTINGS (EXCLUSIVELY FOR EDITOR: NAME, EMAIL, MOBILE, PASSWORD) */}
          {activeTab === 'settings' && isEditor && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-amber-600" />
                    <span>संपादक प्रोफ़ाइल सेटिंग्स (Editor Profile Settings)</span>
                  </h1>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                    संपादक डेस्क
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  अपनी व्यक्तिगत संपादक प्रोफ़ाइल जानकारी (नाम, ईमेल आईडी, मोबाइल नंबर) और पासवर्ड को अपडेट करें
                </p>
              </div>

              {/* Profile Message Alert */}
              {profileMsg.text && (
                <div className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2.5 shadow-2xs ${
                  profileMsg.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {profileMsg.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Profile Settings Form: Name, Email, Mobile Number, Password */}
              <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-lg border border-stone-200 shadow-2xs space-y-5">
                
                {/* 0. Profile Photo / Avatar */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    प्रोफ़ाइल फोटो (Editor Profile Photo / Avatar)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                      {profileAvatar ? (
                        <img 
                          src={profileAvatar} 
                          alt="प्रोफ़ाइल फोटो" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          {profileName ? profileName.slice(0, 2).toUpperCase() : 'BL'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded border border-stone-300 cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-red-600" />
                          <span>{profileAvatarLoading ? 'अपलोड हो रहा है...' : 'कंप्यूटर / फोन से फोटो चुनें'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={profileAvatarLoading}
                            onChange={handleProfileAvatarSelect}
                            className="hidden"
                          />
                        </label>
                        {profileAvatar && (
                          <button
                            type="button"
                            onClick={() => setProfileAvatar('')}
                            className="px-2.5 py-1.5 text-xs text-red-700 hover:text-red-900 hover:bg-red-50 rounded border border-red-200 transition-colors cursor-pointer"
                          >
                            फोटो हटाएं
                          </button>
                        )}
                        <a
                          href="#editor-about-journalist"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded border border-amber-200 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>पत्रकारिता परिचय (Bio) लिखें / संपादित करें</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        यह फोटो आपके द्वारा संपादित व प्रकाशित खबरों में आपके नाम के साथ दिखेगी।
                      </p>
                    </div>
                  </div>
                </div>

                {/* पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist / Bio) */}
                <div id="editor-about-journalist" className="p-4 sm:p-5 bg-gradient-to-br from-stone-50 to-amber-50/30 border-2 border-amber-200/80 rounded-xl space-y-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ED
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-900">
                          पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist / Editor)
                        </label>
                        <p className="text-[11px] text-stone-500">
                          संपादक परिचय व कार्यक्षेत्र लिखें। जब आप खबर डालेंगे तो आपके नाम के नीचे यही परिचय दिखेगा।
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {profileBio && (
                        <button
                          type="button"
                          onClick={() => setProfileBio('')}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="परिचय हटाएं / खाली करें"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>परिचय हटाएं</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setProfileBio('वरिष्ठ संपादक, ब्लैक लेंस डिजिटल मीडिया। राष्ट्रीय, प्रादेशिक एवं स्थानीय समाचारों का निष्पक्ष एवं उत्तरदायी संपादन व विश्लेषण।')}
                        className="px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 rounded border border-stone-300 transition-colors cursor-pointer flex items-center gap-1"
                        title="डिफ़ॉल्ट परिचय भरें"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>डिफ़ॉल्ट परिचय भरें</span>
                      </button>
                    </div>
                  </div>

                  {/* Bio Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <span>पत्रकारिता परिचय (Journalist Bio / About)</span>
                        <span className="text-[10px] text-stone-400 font-normal">(लिखें, संपादित करें या हटाएं)</span>
                      </label>
                      <span className={`text-[10px] font-mono ${profileBio.length > 400 ? 'text-amber-600 font-bold' : 'text-stone-400'}`}>
                        {profileBio.length} / 500 अक्षर
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value.slice(0, 500))}
                      placeholder="उदा. 'वरिष्ठ संपादक, ब्लैक लेंस डिजिटल मीडिया। राष्ट्रीय, प्रादेशिक एवं स्थानीय समाचारों का निष्पक्ष एवं उत्तरदायी संपादन व विश्लेषण।'"
                      className="w-full text-xs p-3 border border-stone-300 rounded-lg bg-white focus:border-amber-600 focus:outline-none leading-relaxed font-sans shadow-2xs"
                    />
                  </div>

                  {/* Assigned Region / Beat */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      कार्यक्षेत्र / डेस्क (Assigned Reporting Region / Desk)
                    </label>
                    <input
                      type="text"
                      value={profileRegion}
                      onChange={(e) => setProfileRegion(e.target.value)}
                      placeholder="उदा. मुख्य संपादकीय डेस्क / गाजियाबाद ब्यूरो"
                      className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-amber-600 focus:outline-none font-medium"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      यह कार्यक्षेत्र आपके प्रोफ़ाइल कार्ड और समाचार में प्रदर्शित होगा।
                    </p>
                  </div>

                  {/* Live Reader Preview Box */}
                  <div className="p-3 bg-white rounded-lg border border-amber-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>लाइव पूर्वावलोकन (आपकी खबर के नीचे पाठकों को ऐसे दिखेगा):</span>
                      </span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                        Live Byline Preview
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-md border border-stone-200">
                      <div className="relative shrink-0">
                        {profileAvatar ? (
                          <img
                            src={profileAvatar}
                            alt="लेखक"
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-600 shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            {profileName ? profileName.slice(0, 2).toUpperCase() : 'ED'}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border-2 border-white shadow-2xs">
                          <UserCheck className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-stone-900">{profileName || 'आपका नाम'}</span>
                          <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-300 font-semibold">
                            {currentUser?.role_name || 'संपादक'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 italic line-clamp-2 mt-0.5 font-sans">
                          {profileBio || 'ब्लैक लेंस डिजिटल मीडिया हाउस के साथ निष्पक्ष एवं सटीक पत्रकारिता।'}
                        </p>
                        <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span>{profileRegion || 'मुख्य संपादकीय डेस्क'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    1. पूरा नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="उदा. अमित शर्मा (वरिष्ठ संपादक)"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-medium"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    यह नाम आपके द्वारा संपादित व प्रकाशित समाचारों में संपादक बायलाइन के रूप में प्रदर्शित होगा।
                  </p>
                </div>

                {/* 2. Email Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    2. ईमेल आईडी (Email Address) *
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="editor@teznazar.com"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    संपादकीय लॉगिन और आधिकारिक संचार के लिए इस ईमेल का उपयोग होगा।
                  </p>
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    3. मोबाइल नंबर (Mobile Number)
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="उदा. +91 98111 22334"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    न्यूज़रूम समन्वय एवं संपादकीय अलर्ट हेतु आधिकारिक मोबाइल नंबर।
                  </p>
                </div>

                {/* 4. Password Change Section */}
                <div className="pt-4 border-t border-stone-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-800">
                      4. पासवर्ड परिवर्तन (Change Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowProfilePasswords(!showProfilePasswords)}
                      className="text-[11px] text-red-700 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer select-none"
                    >
                      {showProfilePasswords ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>पासवर्ड छिपाएं</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>शो पासवर्ड (Show Password)</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    यदि आप अपना पासवर्ड बदलना चाहते हैं तो कृपया वर्तमान पासवर्ड और नया पासवर्ड दर्ज करें:
                  </p>

                  <div className="space-y-3 bg-stone-50 p-4 rounded-lg border border-stone-200">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        वर्तमान पासवर्ड (Current Password)
                      </label>
                      <input
                        type={showProfilePasswords ? 'text' : 'password'}
                        value={profileCurrentPassword}
                        onChange={(e) => setProfileCurrentPassword(e.target.value)}
                        placeholder="सुरक्षा हेतु अपना वर्तमान पासवर्ड दर्ज करें"
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          नया पासवर्ड (New Password)
                        </label>
                        <input
                          type={showProfilePasswords ? 'text' : 'password'}
                          value={profileNewPassword}
                          onChange={(e) => setProfileNewPassword(e.target.value)}
                          placeholder="कम से कम 6 अक्षर"
                          className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none"
                        />
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          नया पासवर्ड कन्फर्म करें (Confirm Password)
                        </label>
                        <input
                          type={showProfilePasswords ? 'text' : 'password'}
                          value={profileConfirmPassword}
                          onChange={(e) => setProfileConfirmPassword(e.target.value)}
                          placeholder="नया पासवर्ड पुनः दर्ज करें"
                          className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
                  <div className="text-[11px] text-stone-500">
                    सुरक्षा मानक: पासवर्ड Bcrypt द्वारा सुरक्षित रूप से एन्क्रिप्ट किया जाता है।
                  </div>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-md transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>अपडेट हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>प्रोफ़ाइल सुरक्षित करें (Save Profile)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Read-Only Account Details Card */}
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1.5">
                <div className="font-bold text-stone-800 text-xs mb-1">खाता सूचना (Account Information)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>भूमिका: <strong className="text-stone-900">संपादक (Editor Desk Chief)</strong></div>
                  <div>क्षेत्र: <strong className="text-stone-900">{currentUser.assigned_region || 'समस्त उत्तर प्रदेश एवं एनसीआर'}</strong></div>
                  <div>स्थिति: <span className="text-emerald-700 font-bold">● स्वीकृत एवं सक्रिय संपादक</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADMIN CONTROL PANEL & SETTINGS */}
          {activeTab === 'settings' && (currentUser.role_id === 1 || currentUser.role_id === 2) && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-red-700" />
                  <span>प्रशासनिक सेटिंग्स (Admin Control Panel)</span>
                </h1>
                <p className="text-xs text-stone-500">
                  वेबसाइट ब्रांडिंग, सोशल मीडिया व व्हाट्सऐप लिंक्स, एवं व्यवस्थापक प्रोफ़ाइल व पासवर्ड कॉन्फ़िगरेशन
                </p>
              </div>

              {/* Sub-Tab Navigation Switcher */}
              <div className="flex border-b border-stone-200 gap-2">
                <button
                  type="button"
                  onClick={() => setAdminSettingsTab('site')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                    adminSettingsTab === 'site'
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>🌐 वेबसाइट सेटिंग्स व ब्रांडिंग (Site Settings)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminSettingsTab('profile')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                    adminSettingsTab === 'profile'
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>👤 व्यवस्थापक प्रोफ़ाइल व पासवर्ड (Admin Profile & Password)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seo')}
                  className="pb-3 px-4 text-xs font-bold border-b-2 border-transparent text-emerald-700 hover:text-emerald-900 flex items-center gap-2 cursor-pointer transition-colors ml-auto sm:ml-0"
                >
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>🚀 SEO एवं गूगल रैंकिंग हब (SEO Hub)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">Google #1</span>
                </button>
              </div>

              {adminSettingsTab === 'profile' ? (
                /* ADMIN PROFILE & SECURITY SETTINGS */
                <div className="space-y-6 max-w-2xl">
                  {/* Profile Message Alert */}
                  {profileMsg.text && (
                    <div className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2.5 shadow-2xs ${
                      profileMsg.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      {profileMsg.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-lg border border-stone-200 shadow-2xs space-y-5">
                    
                    {/* 0. Profile Photo / Avatar */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                      <label className="block text-xs font-bold text-stone-800 mb-2">
                        व्यवस्थापक प्रोफ़ाइल फोटो (Admin Profile Photo / Avatar)
                      </label>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                          {profileAvatar ? (
                            <img 
                              src={profileAvatar} 
                              alt="व्यवस्थापक फोटो" 
                              className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                              {profileName ? profileName.slice(0, 2).toUpperCase() : 'BL'}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded border border-stone-300 cursor-pointer transition-colors shadow-2xs">
                              <Upload className="w-3.5 h-3.5 text-red-600" />
                              <span>{profileAvatarLoading ? 'अपलोड हो रहा है...' : 'कंप्यूटर / फोन से फोटो चुनें'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={profileAvatarLoading}
                                onChange={handleProfileAvatarSelect}
                                className="hidden"
                              />
                            </label>
                            {profileAvatar && (
                              <button
                                type="button"
                                onClick={() => setProfileAvatar('')}
                                className="px-2.5 py-1.5 text-xs text-red-700 hover:text-red-900 hover:bg-red-50 rounded border border-red-200 transition-colors cursor-pointer"
                              >
                                फोटो हटाएं
                              </button>
                            )}
                            <a
                              href="#admin-about-journalist"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-red-600" />
                              <span>पत्रकारिता परिचय (Bio) लिखें / संपादित करें</span>
                            </a>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            यह फोटो आपके द्वारा प्रकाशित की गई खबरों में लेखक/संपादक बायलाइन में दिखेगी।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist / Bio) */}
                    <div id="admin-about-journalist" className="p-4 sm:p-5 bg-gradient-to-br from-stone-50 to-red-50/30 border-2 border-red-200/80 rounded-xl space-y-4 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            BL
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-stone-900">
                              पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist / Chief Editor)
                            </label>
                            <p className="text-[11px] text-stone-500">
                              प्रधान संपादक / व्यवस्थापक परिचय व कार्यक्षेत्र लिखें। जब आप खबर डालेंगे तो आपके नाम के नीचे यही परिचय दिखेगा।
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {profileBio && (
                            <button
                              type="button"
                              onClick={() => setProfileBio('')}
                              className="px-2.5 py-1 text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="परिचय हटाएं / खाली करें"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>परिचय हटाएं</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setProfileBio('प्रधान संपादक एवं संस्थापक, ब्लैक लेंस मीडिया नेटवर्क। गाजियाबाद, उत्तर प्रदेश और राष्ट्रीय सरोकारों पर निष्पक्ष, निडर एवं स्वतंत्र पत्रकारिता का 15+ वर्षों का अनुभव।')}
                            className="px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 rounded border border-stone-300 transition-colors cursor-pointer flex items-center gap-1"
                            title="डिफ़ॉल्ट परिचय भरें"
                          >
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>डिफ़ॉल्ट परिचय भरें</span>
                          </button>
                        </div>
                      </div>

                      {/* Bio Textarea */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                            <span>पत्रकारिता परिचय (Journalist Bio / About)</span>
                            <span className="text-[10px] text-stone-400 font-normal">(लिखें, संपादित करें या हटाएं)</span>
                          </label>
                          <span className={`text-[10px] font-mono ${profileBio.length > 400 ? 'text-amber-600 font-bold' : 'text-stone-400'}`}>
                            {profileBio.length} / 500 अक्षर
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value.slice(0, 500))}
                          placeholder="उदा. 'प्रधान संपादक एवं संस्थापक, ब्लैक लेंस मीडिया नेटवर्क। गाजियाबाद, उत्तर प्रदेश और राष्ट्रीय सरोकारों पर निष्पक्ष, निडर एवं स्वतंत्र पत्रकारिता।'"
                          className="w-full text-xs p-3 border border-stone-300 rounded-lg bg-white focus:border-red-600 focus:outline-none leading-relaxed font-sans shadow-2xs"
                        />
                      </div>

                      {/* Assigned Region / Beat */}
                      <div>
                        <label className="block text-xs font-bold text-stone-800 mb-1">
                          कार्यक्षेत्र / डेस्क (Assigned Reporting Region / Desk)
                        </label>
                        <input
                          type="text"
                          value={profileRegion}
                          onChange={(e) => setProfileRegion(e.target.value)}
                          placeholder="उदा. राष्ट्रीय मुख्यालय एवं गाजियाबाद ब्यूरो"
                          className="w-full text-xs p-2.5 border border-stone-300 rounded-md bg-white focus:border-red-600 focus:outline-none font-medium"
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          यह कार्यक्षेत्र आपके प्रोफ़ाइल कार्ड और समाचार में प्रदर्शित होगा।
                        </p>
                      </div>

                      {/* Live Reader Preview Box */}
                      <div className="p-3 bg-white rounded-lg border border-red-200/60 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>लाइव पूर्वावलोकन (आपकी खबर के नीचे पाठकों को ऐसे दिखेगा):</span>
                          </span>
                          <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                            Live Byline Preview
                          </span>
                        </div>
                        <div className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-md border border-stone-200">
                          <div className="relative shrink-0">
                            {profileAvatar ? (
                              <img
                                src={profileAvatar}
                                alt="लेखक"
                                className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                                {profileName ? profileName.slice(0, 2).toUpperCase() : 'BL'}
                              </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border-2 border-white shadow-2xs">
                              <UserCheck className="w-2.5 h-2.5" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-stone-900">{profileName || 'आपका नाम'}</span>
                              <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200 font-semibold">
                                {currentUser?.role_name || 'प्रधान संपादक'}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 italic line-clamp-2 mt-0.5 font-sans">
                              {profileBio || 'ब्लैक लेंस डिजिटल मीडिया हाउस के साथ निष्पक्ष एवं सटीक पत्रकारिता।'}
                            </p>
                            <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-red-600 shrink-0" />
                              <span>{profileRegion || 'राष्ट्रीय मुख्यालय एवं गाजियाबाद ब्यूरो'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 1. Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        1. पूरा नाम (Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="उदा. व्यवस्थापक / संदीप राणा"
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-medium"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        यह नाम आपके प्रशासनिक कार्यों एवं पोर्टल रिकॉर्ड्स में प्रदर्शित होगा।
                      </p>
                    </div>

                    {/* 2. Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        2. आधिकारिक ईमेल आईडी (Email Address) *
                      </label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="admin@blacklens.in"
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-mono text-[11px]"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        सुपर एडमिन लॉगिन एवं आधिकारिक संचार हेतु इस ईमेल आईडी का उपयोग होगा।
                      </p>
                    </div>

                    {/* 3. Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        3. मोबाइल नंबर (Mobile Number)
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none font-mono text-[11px]"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        सुरक्षा अलर्ट एवं आधिकारिक संपर्क के लिए मोबाइल नंबर दर्ज करें।
                      </p>
                    </div>

                    {/* 4. Password Change Section */}
                    <div className="pt-4 border-t border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-stone-700" />
                          <h3 className="text-xs font-bold text-stone-800">
                            पासवर्ड परिवर्तन (Password Update - ऐच्छिक / Optional)
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowProfilePasswords(!showProfilePasswords)}
                          className="text-[11px] text-red-700 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer select-none"
                        >
                          {showProfilePasswords ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>पासवर्ड छिपाएं</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>शो पासवर्ड (Show Password)</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        यदि आप अपना लॉगिन पासवर्ड बदलना चाहते हैं, तो कृपया वर्तमान पासवर्ड और नया पासवर्ड दर्ज करें।
                      </p>

                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            वर्तमान पासवर्ड (Current Password)
                          </label>
                          <input
                            type={showProfilePasswords ? 'text' : 'password'}
                            value={profileCurrentPassword}
                            onChange={(e) => setProfileCurrentPassword(e.target.value)}
                            placeholder="मौजूदा पासवर्ड"
                            className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              नया पासवर्ड (New Password)
                            </label>
                            <input
                              type={showProfilePasswords ? 'text' : 'password'}
                              value={profileNewPassword}
                              onChange={(e) => setProfileNewPassword(e.target.value)}
                              placeholder="कम से कम 6 अक्षर"
                              className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              नया पासवर्ड पुनः दर्ज करें (Confirm Password)
                            </label>
                            <input
                              type={showProfilePasswords ? 'text' : 'password'}
                              value={profileConfirmPassword}
                              onChange={(e) => setProfileConfirmPassword(e.target.value)}
                              placeholder="नया पासवर्ड दोबारा लिखें"
                              className="w-full text-xs p-2.5 border border-stone-300 rounded-md focus:border-red-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3 border-t border-stone-200 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 rounded-md text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
                      >
                        {profileLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>सुरक्षित हो रहा है...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>व्यवस्थापक प्रोफ़ाइल सेटिंग्स सुरक्षित करें (Save Profile)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Read-Only Account Details Card */}
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1.5">
                    <div className="font-bold text-stone-800 text-xs mb-1">खाता सूचना (Account Role & Permissions)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>भूमिका: <strong className="text-red-700 font-bold">{currentUser.role_id === 1 ? 'मुख्य सुपर एडमिन (Super Admin)' : 'व्यवस्थापक (Admin)'}</strong></div>
                      <div>सिस्टम नियंत्रण: <strong className="text-stone-900">पूर्ण प्रशासनिक अधिकार</strong></div>
                      <div>स्थिति: <span className="text-emerald-700 font-bold">● सक्रिय एवं प्रमाणित</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* WEBSITE SETTINGS FORM */
                <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* SECTION A: WEBSITE IDENTITY & SEO */}
                <div className="bg-white p-5 rounded border border-stone-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <Globe className="w-4 h-4 text-red-700" />
                    <span>A. वेबसाइट पहचान एवं SEO डिफॉल्ट्स (Website Identity)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-stone-700">
                          वेबसाइट का नाम (Portal Name)
                        </label>
                        <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-stone-500" />
                          <span>स्थायी नाम (लॉक्ड)</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value="BLACK LENS"
                          className="w-full p-2.5 bg-stone-100 border border-stone-300 rounded font-bold text-stone-800 cursor-not-allowed select-none pr-8"
                        />
                        <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3.5" />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        वेबसाइट का नाम 'BLACK LENS' स्थायी रूप से सुरक्षित है और एडमिन द्वारा बदला नहीं जा सकता।
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        वेबसाइट टैगलाइन (Tagline / Slogan)
                      </label>
                      <input
                        type="text"
                        value={settingsData.site_tagline || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, site_tagline: e.target.value }))}
                        placeholder="उदा. सत्यमेव जयते · निर्भीक एवं निष्पक्ष डिजिटल समाचार"
                        className="w-full p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        SEO डिफ़ॉल्ट शीर्षक (Meta Title)
                      </label>
                      <input
                        type="text"
                        value={settingsData.seo_title || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="ब्लैक लेंस | Black Lens Hindi News Portal"
                        className="w-full p-2 border border-stone-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        SEO डिफ़ॉल्ट विवरण (Meta Description)
                      </label>
                      <input
                        type="text"
                        value={settingsData.seo_description || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="गाजियाबाद, दिल्ली एनसीआर और देश-विदेश की ताज़ा एवं निष्पक्ष खबरें"
                        className="w-full p-2 border border-stone-300 rounded"
                      />
                    </div>
                  </div>

                  {/* Logo & Favicon Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
                    {/* Site Logo - Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-stone-800">
                          वेबसाइट मुख्य लोगो (Portal Logo)
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          settingsData.site_logo 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {settingsData.site_logo ? '● कस्टम लोगो सक्रिय' : '● आधिकारिक BLACK LENS लोगो'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-stone-50 rounded border border-stone-200">
                        <div className="w-16 h-16 rounded border border-stone-300 bg-stone-950 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                          {settingsData.site_logo ? (
                            <img 
                              src={settingsData.site_logo} 
                              alt="BLACK LENS Logo" 
                              className="w-full h-full object-contain" 
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="relative w-11 h-11 rounded-full bg-stone-950 flex items-center justify-center p-1 border border-stone-800">
                              <div className="w-full h-full rounded-full border border-red-600/80 flex items-center justify-center bg-radial from-stone-900 to-black">
                                <div className="w-4 h-4 rounded-full border border-cyan-400/80 bg-gradient-to-tr from-cyan-500/30 via-red-500/20 to-amber-400/30 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                </div>
                              </div>
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full border border-white" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div>
                            <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              <span>BLACK LENS पोर्टल लोगो</span>
                              <span className="text-[10px] text-stone-500 font-normal">
                                {settingsData.site_logo ? '(कस्टम इमेज)' : '(डिफ़ॉल्ट एम्बलेम)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                              हेडर एवं पादलेख (Footer) पर प्रदर्शित होने वाला आधिकारिक समाचार पोर्टल लोगो
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <input
                              type="file"
                              ref={logoFileRef}
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={(e) => handleSettingsFileUpload(e, 'site_logo')}
                              className="hidden"
                            />
                            <button
                              type="button"
                              disabled={logoUploading}
                              onClick={() => logoFileRef.current?.click()}
                              className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded font-semibold text-xs cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{logoUploading ? 'अपलोड हो रहा है...' : 'नया लोगो अपलोड करें'}</span>
                            </button>

                            {settingsData.site_logo ? (
                              <button
                                type="button"
                                onClick={handleRestoreDefaultLogo}
                                className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded font-semibold text-xs border border-amber-300 cursor-pointer transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                <span>डिफ़ॉल्ट लोगो रीस्टोर करें</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>डिफ़ॉल्ट लोगो सक्रिय है</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Favicon */}
                    <div className="space-y-2">
                      <label className="block font-semibold text-stone-800">
                        फेविकॉन (Favicon Icon - 32x32 या 64x64)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded border border-stone-300 bg-stone-50 flex items-center justify-center overflow-hidden shrink-0">
                          {settingsData.favicon_url ? (
                            <img src={settingsData.favicon_url} alt="Favicon" className="w-8 h-8 object-contain" />
                          ) : (
                            <span className="text-[10px] text-stone-400">आइकॉन</span>
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <input
                            type="file"
                            ref={faviconFileRef}
                            accept="image/png,image/x-icon,image/svg+xml"
                            onChange={(e) => handleSettingsFileUpload(e, 'favicon_url')}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={faviconUploading}
                            onClick={() => faviconFileRef.current?.click()}
                            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded font-semibold text-xs border border-stone-300 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{faviconUploading ? 'अपलोड हो रहा है...' : 'फेविकॉन चुनें'}</span>
                          </button>
                          <input
                            type="url"
                            value={settingsData.favicon_url || ''}
                            onChange={(e) => setSettingsData(prev => ({ ...prev, favicon_url: e.target.value }))}
                            placeholder="अथवा फेविकॉन URL पेस्ट करें..."
                            className="w-full p-1.5 border border-stone-200 rounded text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION B: CONTACT INFORMATION */}
                <div className="bg-white p-5 rounded border border-stone-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <User className="w-4 h-4 text-red-700" />
                    <span>B. आधिकारिक संपर्क जानकारी (Contact Information)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        आधिकारिक ईमेल (Email Address) *
                      </label>
                      <input
                        type="email"
                        required
                        value={settingsData.contact_email || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, contact_email: e.target.value }))}
                        placeholder="contact@teznazar.com"
                        className="w-full p-2 border border-stone-300 rounded font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        मुख्य संपर्क मोबाइल नंबर (Phone)
                      </label>
                      <input
                        type="tel"
                        value={settingsData.contact_phone || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, contact_phone: e.target.value }))}
                        placeholder="+91 120 4567890"
                        className="w-full p-2 border border-stone-300 rounded font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        वैकल्पिक संपर्क नंबर (Alternate Phone)
                      </label>
                      <input
                        type="tel"
                        value={settingsData.contact_phone_alt || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, contact_phone_alt: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full p-2 border border-stone-300 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      कार्यालय का संपूर्ण पता (Complete Office Address)
                    </label>
                    <input
                      type="text"
                      value={settingsData.contact_address || ''}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, contact_address: e.target.value }))}
                      placeholder="ब्लैक लेंस मीडिया हाउस, प्रेस एंक्लेव, राजनगर"
                      className="w-full p-2 border border-stone-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">शहर (City)</label>
                      <input
                        type="text"
                        value={settingsData.contact_city || 'गाजियाबाद'}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, contact_city: e.target.value }))}
                        className="w-full p-2 border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">राज्य (State)</label>
                      <input
                        type="text"
                        value={settingsData.contact_state || 'उत्तर प्रदेश'}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, contact_state: e.target.value }))}
                        className="w-full p-2 border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">पिन कोड (Pincode)</label>
                      <input
                        type="text"
                        value={settingsData.contact_pincode || '201002'}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, contact_pincode: e.target.value }))}
                        className="w-full p-2 border border-stone-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">देश (Country)</label>
                      <input
                        type="text"
                        value={settingsData.contact_country || 'भारत'}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, contact_country: e.target.value }))}
                        className="w-full p-2 border border-stone-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION C: SOCIAL MEDIA & COMMUNITY LINKS */}
                <div className="bg-white p-5 rounded border border-stone-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <LinkIcon className="w-4 h-4 text-red-700" />
                    <span>C. सोशल मीडिया एवं कम्युनिटी लिंक्स (Social Media Links)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">यूट्यूब URL (YouTube)</label>
                      <input
                        type="url"
                        value={settingsData.youtube_url || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, youtube_url: e.target.value }))}
                        placeholder="https://youtube.com/@teznazarnews"
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">फेसबुक URL (Facebook)</label>
                      <input
                        type="url"
                        value={settingsData.facebook_url || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, facebook_url: e.target.value }))}
                        placeholder="https://facebook.com/teznazarnews"
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">X / ट्विटर URL (Twitter)</label>
                      <input
                        type="url"
                        value={settingsData.twitter_url || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, twitter_url: e.target.value }))}
                        placeholder="https://x.com/teznazarnews"
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">इंस्टाग्राम URL (Instagram)</label>
                      <input
                        type="url"
                        value={settingsData.instagram_url || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, instagram_url: e.target.value }))}
                        placeholder="https://instagram.com/teznazarnews"
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">व्हाट्सएप संपर्क लिंक (WhatsApp)</label>
                      <input
                        type="text"
                        value={settingsData.whatsapp_number || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">व्हाट्सएप चैनल इनवाइट लिंक (WhatsApp Channel)</label>
                      <input
                        type="url"
                        value={settingsData.whatsapp_channel_url || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, whatsapp_channel_url: e.target.value }))}
                        placeholder="https://whatsapp.com/channel/..."
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION D: BRANDING & FOOTER CONTENT */}
                <div className="bg-white p-5 rounded border border-stone-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <FileText className="w-4 h-4 text-red-700" />
                    <span>D. ब्रांडिंग एवं फुटर सामग्री (Branding & Footer Content)</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">कॉपीराइट संदेश (Copyright Text)</label>
                      <input
                        type="text"
                        value={settingsData.copyright_text || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, copyright_text: e.target.value }))}
                        placeholder="© 2026 ब्लैक लेंस डिजिटल मीडिया. सर्वाधिकार सुरक्षित।"
                        className="w-full p-2 border border-stone-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">फुटर 'हमारे बारे में' विवरण (Footer About)</label>
                      <textarea
                        rows={3}
                        value={settingsData.footer_about || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, footer_about: e.target.value }))}
                        className="w-full p-2.5 border border-stone-300 rounded leading-relaxed focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-6 py-2.5 rounded transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{settingsSaving ? 'सुरक्षित हो रहा है...' : 'सेटिंग्स सुरक्षित करें (Save & Apply Settings)'}</span>
                  </button>
                </div>
              </form>
            )}
            </div>
          )}

          {/* TAB: SEO & TRENDING KEYWORDS / GOOGLE SEARCH RANKING (USER REQUEST) */}
          {activeTab === 'seo' && (currentUser.role_id === 1 || currentUser.role_id === 2 || isEditor) && (
            <div className="space-y-6 max-w-5xl">
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <span>Google SEO एवं ट्रेंडिंग कीवर्ड्स हब</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          Google Search #1 Rank
                        </span>
                      </h1>
                      <p className="text-xs text-stone-500 mt-0.5">
                        वेबसाइट को Google सर्च के पहले पेज पर रैंक कराने हेतु ट्रेंडिंग हैशटैग्स, कीवर्ड्स, Search Console वेरिफिकेशन और XML साइटमैप प्रबंधित करें।
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded cursor-pointer transition-colors"
                    title="ताज़ा डेटा रिफ्रेश करें"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                    <span className="hidden sm:inline">रिफ्रेश</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2 rounded transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {settingsSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>सुरक्षित हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>SEO सेटिंग्स सुरक्षित करें</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Googlebot स्थिति</span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      इंडेक्सिंग सक्रिय
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Google News Sitemap</span>
                    <a href="/sitemap-news.xml" target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-0.5 truncate">
                      <span>/sitemap-news.xml</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">वेबसाइट XML Sitemap</span>
                    <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-0.5 truncate">
                      <span>/sitemap.xml</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Schema.org JSON-LD</span>
                    <span className="text-xs font-bold text-purple-700">NewsArticle मान्य</span>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveSettings} className="space-y-6">

                {/* ------------------------------------------------------------- */}
                {/* SECTION 1: TRENDING TOPICS & HASHTAGS MANAGER */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 text-orange-700 rounded">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-stone-900">
                          1. ट्रेंडिंग टॉपिक्स एवं हैशटैग्स (Trending News Topics & Hashtags)
                        </h2>
                        <p className="text-[11px] text-stone-500">
                          Google Discover और ताज़ा ट्रेंड्स में वेबसाइट को तेज़ी से ऊपर लाने हेतु सक्रिय हैशटैग्स दर्ज करें
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full self-start sm:self-auto">
                      वायरल ट्रैफ़िक बूस्टर
                    </span>
                  </div>

                  {/* Active Hashtags Chips Display */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-800">
                      वर्तमान में सक्रिय ट्रेंडिंग हैशटैग्स (Active Hashtags):
                    </label>

                    <div className="flex flex-wrap items-center gap-1.5 p-3 bg-stone-50 rounded-md border border-stone-200 min-h-[46px]">
                      {(() => {
                        const tags = (settingsData.trending_topics || '')
                          .split(/[\s,]+/)
                          .map(t => t.trim())
                          .filter(t => t.length > 0);

                        if (tags.length === 0) {
                          return (
                            <span className="text-stone-400 text-xs italic">
                              कोई ट्रेंडिंग हैशटैग अभी दर्ज नहीं है। नीचे दिए गए सुझाए गए हैशटैग पर क्लिक करके तुरंत जोड़ें।
                            </span>
                          );
                        }

                        return tags.map((tag, idx) => {
                          const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-900 border border-orange-200 text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs"
                            >
                              <Hash className="w-3 h-3 text-orange-600" />
                              <span>{formattedTag}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = tags.filter((_, i) => i !== idx).join(', ');
                                  setSettingsData(prev => ({ ...prev, trending_topics: updated }));
                                }}
                                className="w-3.5 h-3.5 rounded-full hover:bg-orange-200 text-orange-700 flex items-center justify-center cursor-pointer"
                                title="यह हैशटैग हटाएं"
                              >
                                ×
                              </button>
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Textarea for manual editing */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      हैशटैग्स / ट्रेंडिंग टॉपिक्स इनपुट (कॉमा या स्पेस से अलग करें):
                    </label>
                    <textarea
                      rows={2}
                      value={settingsData.trending_topics || ''}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, trending_topics: e.target.value }))}
                      placeholder="#गाजियाबाद_न्यूज़, #यूपी_अपडेट्स, #अपराध_समाचार, #ट्रैफिक_अलर्ट, #क्रिकेट_लाइव, #राजनीति_समाचार"
                      className="w-full p-2.5 border border-stone-300 rounded text-xs leading-relaxed focus:border-red-600 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Quick-Add Popular Hashtag Chips */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>एक क्लिक में लोकप्रिय ट्रेंडिंग हैशटैग जोड़ें (Quick Add Chips):</span>
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '#गाजियाबाद_न्यूज़',
                        '#यूपी_अपडेट्स',
                        '#दिल्ली_एनसीआर',
                        '#अपराध_समाचार',
                        '#ट्रैफिक_अलर्ट',
                        '#नमो_भारत',
                        '#राजनीति_हलचल',
                        '#मौसम_अपडेट',
                        '#क्रिकेट_लाइव',
                        '#रोजगार_समाचार',
                        '#उत्तर_प्रदेश_समाचार',
                        '#ब्रेकिंग_न्यूज़'
                      ].map((ht) => {
                        const isAdded = (settingsData.trending_topics || '').includes(ht);
                        return (
                          <button
                            key={ht}
                            type="button"
                            onClick={() => {
                              const current = (settingsData.trending_topics || '').trim();
                              if (isAdded) {
                                // Remove
                                const updated = current
                                  .split(/[\s,]+/)
                                  .filter(t => t !== ht && t !== ht.replace('#', ''))
                                  .join(', ');
                                setSettingsData(prev => ({ ...prev, trending_topics: updated }));
                              } else {
                                // Add
                                const updated = current ? `${current}, ${ht}` : ht;
                                setSettingsData(prev => ({ ...prev, trending_topics: updated }));
                              }
                            }}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                              isAdded
                                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs font-bold'
                                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            <span>{isAdded ? '✓' : '+'}</span>
                            <span>{ht}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 2: GOOGLE SEARCH RANKING TARGET KEYWORDS */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 text-blue-700 rounded">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-stone-900">
                          2. Google सर्च प्राथमिक कीवर्ड्स (Primary Search Ranking Keywords)
                        </h2>
                        <p className="text-[11px] text-stone-500">
                          जब कोई पाठक गूगल पर सर्च करे, तो आपकी वेबसाइट पहले पेज पर दिखे—इसके लिए मुख्य सर्च वाक्यांश (Search Queries) जोड़ें
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full self-start sm:self-auto">
                      Page #1 Ranking Target
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      सर्च कीवर्ड्स (कॉमा से अलग करें - Comma Separated Keywords):
                    </label>
                    <textarea
                      rows={2}
                      value={settingsData.seo_keywords || ''}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                      placeholder="गाजियाबाद ताज़ा समाचार, यूपी न्यूज़, ब्रेकिंग हिंदी समाचार, Ghaziabad News Today, Crime News UP, Delhi NCR Hindi News, Black Lens News Portal"
                      className="w-full p-2.5 border border-stone-300 rounded text-xs leading-relaxed focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Quick-Add Popular Search Keywords */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>सुझाए गए उच्च सर्च वॉल्यूम कीवर्ड्स (High Volume Search Phrases):</span>
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'गाजियाबाद ताज़ा समाचार',
                        'यूपी न्यूज़',
                        'ब्रेकिंग हिंदी समाचार',
                        'Ghaziabad News Today',
                        'Crime News UP',
                        'Delhi NCR Hindi News',
                        'Black Lens News Portal',
                        'लाइव न्यूज़ अपडेट्स',
                        'दैनिक हिंदी समाचार',
                        'सच्ची और निष्पक्ष खबरें'
                      ].map((kw) => {
                        const isAdded = (settingsData.seo_keywords || '').includes(kw);
                        return (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => {
                              const current = (settingsData.seo_keywords || '').trim();
                              if (isAdded) {
                                const updated = current
                                  .split(',')
                                  .map(s => s.trim())
                                  .filter(s => s !== kw)
                                  .join(', ');
                                setSettingsData(prev => ({ ...prev, seo_keywords: updated }));
                              } else {
                                const updated = current ? `${current}, ${kw}` : kw;
                                setSettingsData(prev => ({ ...prev, seo_keywords: updated }));
                              }
                            }}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                              isAdded
                                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs font-bold'
                                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            <span>{isAdded ? '✓' : '+'}</span>
                            <span>{kw}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 3: GOOGLE SEARCH CONSOLE & TRACKING VERIFICATION */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-stone-900">
                          3. Google Search Console वेरिफिकेशन एवं ट्रैकिंग टूल्स
                        </h2>
                        <p className="text-[11px] text-stone-500">
                          वेबसाइट ओनरशिप प्रमाणित करें और Google Search Console में 1-क्लिक में प्रमाणित होकर त्वरित इंडेक्सिंग पाएं
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <span>Google Search Console खोलें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Google Site Verification Code */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-stone-800">
                          Google Search Console Verification Tag / Code:
                        </label>
                        {settingsData.google_site_verification ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>वेरिफिकेशन कोड सक्रिय है</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">वैकल्पिक / जब उपलब्ध हो</span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={settingsData.google_site_verification || ''}
                        onChange={(e) => {
                          let val = e.target.value.trim();
                          // If full meta tag pasted: extract content attribute
                          const match = val.match(/content=["']([^"']+)["']/i);
                          if (match && match[1]) {
                            val = match[1];
                          }
                          setSettingsData(prev => ({ ...prev, google_site_verification: val }));
                        }}
                        placeholder="उदा. google-site-verification कोड या HTML Tag सामग्री"
                        className="w-full p-2.5 border border-stone-300 rounded font-mono text-[11px] focus:border-red-600 focus:outline-none"
                      />

                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        💡 <strong>सरल तरीका:</strong> Search Console में 'HTML Tag' विकल्प चुनें, कोड कॉपी करें और यहाँ पेस्ट करें। यह स्वचालित रूप से होमपेज के <code>&lt;head&gt;</code> में जुड़ जाएगा।
                      </p>
                    </div>

                    {/* Canonical Base URL */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-800">
                        कैनोनिकल बेस URL (Canonical Domain):
                      </label>
                      <input
                        type="url"
                        value={settingsData.canonical_url || 'https://blacklens.co.in'}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, canonical_url: e.target.value }))}
                        placeholder="https://blacklens.co.in"
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                      <p className="text-[10px] text-stone-500">
                        डुप्लीकेट URL की समस्या से बचाने के लिए मुख्य डोमेन
                      </p>
                    </div>

                    {/* Google Analytics 4 (GA4) ID */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-800">
                        Google Analytics 4 (GA4) ID:
                      </label>
                      <input
                        type="text"
                        value={settingsData.google_analytics_id || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, google_analytics_id: e.target.value.trim() }))}
                        placeholder="उदा. G-XXXXXXXXXX"
                        className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                      />
                      <p className="text-[10px] text-stone-500">
                        सर्च से आने वाले पाठकों और पेज व्यूज को ट्रैक करने के लिए
                      </p>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 4: LIVE GOOGLE SEARCH SERP SNIPPET PREVIEW */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 text-purple-700 rounded">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-stone-900">
                          4. लाइव Google सर्च रिजल्ट पूर्वावलोकन (Live SERP Preview)
                        </h2>
                        <p className="text-[11px] text-stone-500">
                          देखें कि Google सर्च में पाठकों को आपकी वेबसाइट का शीर्षक व विवरण कैसा दिखाई देगा
                        </p>
                      </div>
                    </div>

                    {/* Device Toggle */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-md self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSeoDevicePreview('mobile')}
                        className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                          seoDevicePreview === 'mobile' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        📱 मोबाइल (Mobile)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSeoDevicePreview('desktop')}
                        className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                          seoDevicePreview === 'desktop' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        💻 डेस्कटॉप (Desktop)
                      </button>
                    </div>
                  </div>

                  {/* Realistic Google Search Card */}
                  <div className={`p-4 bg-white rounded-lg border border-stone-300 shadow-xs transition-all ${
                    seoDevicePreview === 'mobile' ? 'max-w-md mx-auto bg-stone-50/50' : 'w-full'
                  }`}>
                    {/* Google Search URL Bar */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        BL
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-900 truncate">ब्लैक लेंस (Black Lens)</div>
                        <div className="text-[11px] text-stone-500 font-mono truncate">
                          {settingsData.canonical_url || 'https://blacklens.co.in'} › ताज़ा-समाचार
                        </div>
                      </div>
                    </div>

                    {/* Clickable Blue Google Search Title */}
                    <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-tight mb-1">
                      {settingsData.seo_title || 'ब्लैक लेंस | Black Lens Hindi News Portal - ताज़ा एवं निष्पक्ष खबरें'}
                    </h3>

                    {/* Snippet Description */}
                    <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                      {settingsData.seo_description || 'ब्लैक लेंस (Black Lens) - एक संपूर्ण एवं अत्याधुनिक हिंदी डिजिटल न्यूज़ पोर्टल - गाजियाबाद, दिल्ली एनसीआर और देश-विदेश की ताज़ा एवं निष्पक्ष खबरें।'}
                    </p>

                    {/* Rich Result Features */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-600">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                        ⭐ 4.9 रेटिंग
                      </span>
                      <span>·</span>
                      <span className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded font-mono">
                        24x7 ताज़ा अपडेट
                      </span>
                      <span>·</span>
                      <span className="text-stone-500">
                        गाजियाबाद / उत्तर प्रदेश
                      </span>
                    </div>
                  </div>

                  {/* Title & Description Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-stone-800">
                          Google सर्च टाइटल (Meta Title):
                        </label>
                        <span className={`text-[10px] font-mono font-bold ${
                          (settingsData.seo_title?.length || 0) > 65 ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {settingsData.seo_title?.length || 0} / 60 अक्षर
                        </span>
                      </div>
                      <input
                        type="text"
                        value={settingsData.seo_title || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="ब्लैक लेंस | Black Lens Hindi News Portal - ताज़ा एवं निष्पक्ष खबरें"
                        className="w-full p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-stone-800">
                          Google सर्च विवरण (Meta Description):
                        </label>
                        <span className={`text-[10px] font-mono font-bold ${
                          (settingsData.seo_description?.length || 0) > 165 ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {settingsData.seo_description?.length || 0} / 160 अक्षर
                        </span>
                      </div>
                      <input
                        type="text"
                        value={settingsData.seo_description || ''}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="गाजियाबाद, दिल्ली एनसीआर और देश-विदेश की ताज़ा एवं निष्पक्ष खबरें पढ़ें"
                        className="w-full p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 5: GOOGLE INDEXING & XML SITEMAPS HUB */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs space-y-4">
                  <div className="border-b border-stone-200 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-emerald-700" />
                      <span>5. Google इंडेक्सिंग व XML साइटमैप टूल्स (Direct Submission Hub)</span>
                    </h2>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      इन साइटमैप URLs को Google Search Console में सबमिट करें ताकि नई खबरें 5 से 15 मिनट के अंदर Google पर लाइव इंडेक्स हो सकें
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Google News Sitemap Card */}
                    <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-orange-600" />
                          <span>Google News XML Sitemap</span>
                        </span>
                        <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                          ताज़ा 48 घंटे
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Google News बॉट्स के लिए पिछले 48 घंटों में प्रकाशित सभी ताज़ा खबरों का विशेष साइटमैप
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href="/sitemap-news.xml"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-mono font-bold text-[11px] hover:underline"
                        >
                          <span>/sitemap-news.xml</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/sitemap-news.xml`;
                            navigator.clipboard.writeText(url);
                            setSeoCopiedNotice('news_sitemap');
                            setTimeout(() => setSeoCopiedNotice(''), 2500);
                          }}
                          className="ml-auto text-[10px] px-2 py-0.5 bg-white border border-stone-300 rounded hover:bg-stone-100 cursor-pointer text-stone-700 flex items-center gap-1 font-semibold"
                        >
                          {seoCopiedNotice === 'news_sitemap' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">कॉपी हुआ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-500" />
                              <span>URL कॉपी करें</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* General XML Sitemap Card */}
                    <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>संपूर्ण वेबसाइट XML Sitemap</span>
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          सभी पेज व श्रेणियां
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        होमपेज, सभी समाचार श्रेणियां, टैग्स और पुरानी खबरों की स्थायी इंडेक्सिंग का साइटमैप
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href="/sitemap.xml"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-mono font-bold text-[11px] hover:underline"
                        >
                          <span>/sitemap.xml</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/sitemap.xml`;
                            navigator.clipboard.writeText(url);
                            setSeoCopiedNotice('general_sitemap');
                            setTimeout(() => setSeoCopiedNotice(''), 2500);
                          }}
                          className="ml-auto text-[10px] px-2 py-0.5 bg-white border border-stone-300 rounded hover:bg-stone-100 cursor-pointer text-stone-700 flex items-center gap-1 font-semibold"
                        >
                          {seoCopiedNotice === 'general_sitemap' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">कॉपी हुआ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-500" />
                              <span>URL कॉपी करें</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Useful External Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
                    <span className="text-stone-500 font-medium">त्वरित टूल्स:</span>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium flex items-center gap-1"
                    >
                      <span>Google Search Console</span>
                      <ExternalLink className="w-3 h-3 text-stone-500" />
                    </a>
                    <a
                      href="https://publishercenter.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium flex items-center gap-1"
                    >
                      <span>Google Publisher Center</span>
                      <ExternalLink className="w-3 h-3 text-stone-500" />
                    </a>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-mono font-medium flex items-center gap-1"
                    >
                      <span>/robots.txt</span>
                      <ExternalLink className="w-3 h-3 text-stone-500" />
                    </a>
                    <a
                      href="/rss.xml"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-mono font-medium flex items-center gap-1"
                    >
                      <span>/rss.xml</span>
                      <ExternalLink className="w-3 h-3 text-stone-500" />
                    </a>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 6: GOOGLE #1 RANKING CHECKLIST */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-emerald-50/60 p-5 rounded-lg border border-emerald-200 text-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-bold text-emerald-950 text-sm">
                      Google के पहले पेज पर आने के लिए महत्वपूर्ण निर्देश (Ranking Checklist)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-emerald-900 leading-relaxed text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">1.</span>
                      <span><strong>दैनिक ताज़ा खबरें:</strong> Google ताज़ा और स्थानीय (Local/Hyperlocal) खबरों को सबसे पहले इंडेक्स करता है।</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">2.</span>
                      <span><strong>ट्रेंडिंग हैशटैग अपडेट:</strong> राज्य व शहर में जो खबर ट्रेंड कर रही हो, उसका हैशटैग यहाँ तुरंत जोड़ें।</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">3.</span>
                      <span><strong>Search Console में साइटमैप:</strong> <code>/sitemap-news.xml</code> को Search Console में सबमिट रखें।</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">4.</span>
                      <span><strong>स्पष्ट शीर्षक एवं तस्वीर:</strong> हर खबर में कम से कम 1 आकर्षक कवर तस्वीर और 60-70 शब्दों का सारांश अवश्य जोड़ें।</span>
                    </div>
                  </div>
                </div>

                {/* Final Bottom Save Button */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-stone-500">
                    * परिवर्तन सहेजने पर Googlebot के लिए मेटा टैग और कीवर्ड्स तुरंत सक्रिय हो जाएंगे।
                  </div>

                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-7 py-3 rounded-md transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {settingsSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>सहेजा जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>SEO एवं रैंकिंग सेटिंग्स सुरक्षित करें (Save All Changes)</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB: USER REGISTRATION APPROVALS (MODULE 8) */}
          {activeTab === 'user_approvals' && (currentUser.role_id === 1 || currentUser.role_id === 2) && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-700" />
                    <span>पंजीकरण अनुरोध एवं उपयोगकर्ता प्रबंधन (User Approvals)</span>
                  </h1>
                  <p className="text-xs text-stone-500">
                    पत्रकार व संपादकीय आवेदकों का सत्यापन करें, भूमिकाएं असाइन करें, खाते स्वीकृत, अस्वीकृत अथवा निलंबित करें
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs cursor-pointer transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                  <span>{isRefreshing ? 'रिफ्रेश हो रहा है...' : 'रिफ्रेश सूची'}</span>
                </button>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">कुल पंजीकृत उपयोगकर्ता</span>
                  <div className="text-xl font-bold text-stone-900 mt-1">{usersList.length}</div>
                </div>

                <div className={`p-3.5 rounded border shadow-2xs ${
                  usersList.filter(u => u.approval_status === 'pending').length > 0
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : 'bg-white border-stone-200 text-stone-900'
                }`}>
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>लंबित अनुमोदन (Pending)</span>
                  </span>
                  <div className="text-xl font-bold text-amber-700 mt-1">
                    {usersList.filter(u => u.approval_status === 'pending').length}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    <span>सक्रिय सदस्य (Approved)</span>
                  </span>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    {usersList.filter(u => u.approval_status === 'approved' && u.is_active).length}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-red-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <UserX className="w-3 h-3 text-red-600" />
                    <span>अस्वीकृत / निलंबित</span>
                  </span>
                  <div className="text-xl font-bold text-stone-700 mt-1">
                    {usersList.filter(u => u.approval_status === 'rejected' || !u.is_active).length}
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-3 rounded border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-stone-500 font-semibold mr-1">फ़िल्टर:</span>
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setUserFilter(tab)}
                      className={`px-3 py-1 rounded font-semibold cursor-pointer transition-colors ${
                        userFilter === tab
                          ? 'bg-red-700 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {tab === 'all' && `सभी (${usersList.length})`}
                      {tab === 'pending' && `लंबित अनुरोध (${usersList.filter(u => u.approval_status === 'pending').length})`}
                      {tab === 'approved' && `स्वीकृत सदस्य (${usersList.filter(u => u.approval_status === 'approved').length})`}
                      {tab === 'rejected' && `अस्वीकृत (${usersList.filter(u => u.approval_status === 'rejected').length})`}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="नाम, ईमेल या मोबाइल से खोजें..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-stone-50/50"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2 top-2 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Users List Table */}
              <div className="bg-white rounded border border-stone-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">आवेदक / सदस्य</th>
                        <th className="p-3">संपर्क (Email & Phone)</th>
                        <th className="p-3">अनुरोधित व वर्तमान भूमिका</th>
                        <th className="p-3">पंजीकरण तिथि</th>
                        <th className="p-3 text-center">अनुमोदन स्थिति</th>
                        <th className="p-3 text-right">कार्रवाई (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {usersList
                        .filter(u => {
                          if (userFilter === 'pending') return u.approval_status === 'pending';
                          if (userFilter === 'approved') return u.approval_status === 'approved';
                          if (userFilter === 'rejected') return u.approval_status === 'rejected';
                          return true;
                        })
                        .filter(u => {
                          if (!userSearchQuery.trim()) return true;
                          const q = userSearchQuery.toLowerCase().trim();
                          return (
                            u.name.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q) ||
                            (u.phone && u.phone.includes(q)) ||
                            (u.assigned_region && u.assigned_region.toLowerCase().includes(q)) ||
                            (u.role_name && u.role_name.toLowerCase().includes(q))
                          );
                        })
                        .map(u => (
                          <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                            {/* Name & Bio */}
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-stone-300 shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    {u.name ? u.name.slice(0, 1) : 'U'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-stone-900">{u.name}</div>
                                  <div className="text-[11px] text-stone-500 truncate max-w-xs">{u.bio || 'पत्रकारिता डेस्क'}</div>
                                  {u.assigned_region && (
                                    <span className="inline-block mt-0.5 text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
                                      {u.assigned_region}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Contact Info */}
                            <td className="p-3">
                              <div className="text-stone-900 font-medium">{u.email}</div>
                              <div className="text-[11px] text-stone-500 font-mono">{u.phone || '—'}</div>
                            </td>

                            {/* Role Info */}
                            <td className="p-3">
                              <div className="font-semibold text-stone-800">
                                {u.role_id === 1 ? 'Super Admin' : u.role_id === 4 ? 'Editor (संपादक)' : 'Reporter (रिपोर्टर)'}
                              </div>
                              {u.requested_role && (
                                <div className="text-[10px] text-stone-500">
                                  अनुरोधित: <strong className="text-stone-700 uppercase">{u.requested_role}</strong>
                                </div>
                              )}
                            </td>

                            {/* Date */}
                            <td className="p-3 text-[11px] text-stone-500">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'पूर्व पंजीकृत'}
                            </td>

                            {/* Approval Status */}
                            <td className="p-3 text-center">
                              {u.approval_status === 'pending' ? (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>लंबित अनुमोदन</span>
                                </span>
                              ) : u.approval_status === 'rejected' ? (
                                <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <UserX className="w-3 h-3 text-red-600" />
                                  <span>अस्वीकृत</span>
                                </span>
                              ) : !u.is_active ? (
                                <span className="bg-stone-200 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span>निलंबित</span>
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>स्वीकृत व सक्रिय</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* View Details */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserDetail(u)}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                                  title="संपूर्ण विवरण देखें"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* If Pending: Approve / Reject */}
                                {u.approval_status === 'pending' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setApprovalModal({
                                        isOpen: true,
                                        user: u,
                                        action: 'approve',
                                        roleId: u.requested_role === 'editor' ? 4 : 5,
                                        notes: 'प्रमाणपत्र व आवेदन सत्यापन उपरांत अनुमोदित'
                                      })}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] cursor-pointer flex items-center gap-1 shadow-xs"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                      <span>स्वीकृत करें</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setApprovalModal({
                                        isOpen: true,
                                        user: u,
                                        action: 'reject',
                                        notes: 'आवश्यक विवरण अथवा साख अपूर्ण होने के कारण अस्वीकृत'
                                      })}
                                      className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold rounded text-[11px] cursor-pointer"
                                    >
                                      <span>अस्वीकृत</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {/* Change Role Button (Super Admin only) */}
                                    <button
                                      type="button"
                                      onClick={() => setApprovalModal({
                                        isOpen: true,
                                        user: u,
                                        action: 'role',
                                        roleId: u.role_id,
                                        notes: ''
                                      })}
                                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium rounded text-[11px] cursor-pointer"
                                      title="भूमिका बदलें (Change Role)"
                                    >
                                      भूमिका बदलें
                                    </button>

                                    {/* Suspend / Activate Toggle */}
                                    {u.id !== currentUser.id && u.role_id !== 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleUserActive(u.id)}
                                        className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer border ${
                                          u.is_active
                                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                        }`}
                                      >
                                        {u.is_active ? 'निलंबित करें' : 'सक्रिय करें'}
                                      </button>
                                    )}

                                    {/* Delete Button (Super Admin only, not self) */}
                                    {u.id !== currentUser.id && u.role_id !== 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteUser(u)}
                                        className="p-1.5 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                                        title="खाता हटाएं"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTACT INQUIRIES & FEEDBACKS (MODULE: CONTACT, ADS & SUGGESTIONS) */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-red-700" />
                    <span>संपर्क व पूछताछ इंक्वायरी (Contact, Ads &amp; Suggestions)</span>
                    {contactMessages.filter(m => !m.is_read).length > 0 && (
                      <span className="bg-amber-500 text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full">
                        {contactMessages.filter(m => !m.is_read).length} नई
                      </span>
                    )}
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    वेबसाइट के 'संपर्क करें' फॉर्म द्वारा प्राप्त विज्ञापन पूछताछ, प्रेस रिलीज, शिकायतें और पाठकों के बहुमूल्य सुझाव
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-xs px-3 py-2 rounded text-stone-700 font-medium cursor-pointer shadow-2xs transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                    <span>{isRefreshing ? 'रिफ्रेश हो रहा है...' : 'रिफ्रेश'}</span>
                  </button>

                  {contactMessages.some(m => !m.is_read) && (
                    <button
                      type="button"
                      onClick={handleMarkAllMessagesRead}
                      className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 py-2 rounded font-medium cursor-pointer shadow-2xs transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>सभी पढ़ी हुई चिह्नित करें</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Stats Grid */}
              {(() => {
                const total = contactMessages.length;
                const unread = contactMessages.filter(m => !m.is_read).length;
                const ads = contactMessages.filter(m => getInquiryCategoryInfo(m).type === 'ad').length;
                const suggestions = contactMessages.filter(m => getInquiryCategoryInfo(m).type === 'suggestion').length;
                const press = contactMessages.filter(m => getInquiryCategoryInfo(m).type === 'press').length;
                const complaints = contactMessages.filter(m => getInquiryCategoryInfo(m).type === 'complaint').length;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div 
                      onClick={() => setContactFilter('all')}
                      className={`p-3.5 rounded border shadow-2xs cursor-pointer transition-all ${
                        contactFilter === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 hover:border-stone-400 text-stone-900'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${contactFilter === 'all' ? 'text-stone-300' : 'text-stone-500'}`}>
                        कुल इंक्वायरी
                      </span>
                      <div className="text-xl font-bold mt-1">{total}</div>
                    </div>

                    <div 
                      onClick={() => setContactFilter('unread')}
                      className={`p-3.5 rounded border shadow-2xs cursor-pointer transition-all ${
                        contactFilter === 'unread' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-200 hover:border-amber-400 text-stone-900'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${contactFilter === 'unread' ? 'text-amber-100' : 'text-amber-700'}`}>
                        नई / अपठित
                      </span>
                      <div className={`text-xl font-bold mt-1 ${contactFilter === 'unread' ? 'text-white' : 'text-amber-700'}`}>
                        {unread}
                      </div>
                    </div>

                    <div 
                      onClick={() => setContactFilter('ad')}
                      className={`p-3.5 rounded border shadow-2xs cursor-pointer transition-all ${
                        contactFilter === 'ad' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white border-stone-200 hover:border-amber-400 text-stone-900'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${contactFilter === 'ad' ? 'text-amber-200' : 'text-amber-800'}`}>
                        विज्ञापन पूछताछ
                      </span>
                      <div className={`text-xl font-bold mt-1 ${contactFilter === 'ad' ? 'text-white' : 'text-amber-800'}`}>
                        {ads}
                      </div>
                    </div>

                    <div 
                      onClick={() => setContactFilter('suggestion')}
                      className={`p-3.5 rounded border shadow-2xs cursor-pointer transition-all ${
                        contactFilter === 'suggestion' ? 'bg-purple-800 text-white border-purple-800' : 'bg-white border-stone-200 hover:border-purple-400 text-stone-900'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${contactFilter === 'suggestion' ? 'text-purple-200' : 'text-purple-700'}`}>
                        पाठक सुझाव
                      </span>
                      <div className={`text-xl font-bold mt-1 ${contactFilter === 'suggestion' ? 'text-white' : 'text-purple-700'}`}>
                        {suggestions}
                      </div>
                    </div>

                    <div 
                      onClick={() => setContactFilter('press')}
                      className={`p-3.5 rounded border shadow-2xs cursor-pointer transition-all ${
                        contactFilter === 'press' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white border-stone-200 hover:border-blue-400 text-stone-900'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${contactFilter === 'press' ? 'text-blue-200' : 'text-blue-700'}`}>
                        प्रेस रिलीज
                      </span>
                      <div className={`text-xl font-bold mt-1 ${contactFilter === 'press' ? 'text-white' : 'text-blue-700'}`}>
                        {press}
                      </div>
                    </div>

                    <div 
                      onClick={() => setContactFilter('complaint')}
                      className={`p-3.5 rounded border shadow-2xs cursor-pointer transition-all ${
                        contactFilter === 'complaint' ? 'bg-rose-800 text-white border-rose-800' : 'bg-white border-stone-200 hover:border-rose-400 text-stone-900'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${contactFilter === 'complaint' ? 'text-rose-200' : 'text-rose-700'}`}>
                        शिकायतें
                      </span>
                      <div className={`text-xl font-bold mt-1 ${contactFilter === 'complaint' ? 'text-white' : 'text-rose-700'}`}>
                        {complaints}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setContactFilter('all')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                      contactFilter === 'all' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    सभी ({contactMessages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactFilter('unread')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      contactFilter === 'unread' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>अपठित</span>
                    <span className="font-mono text-[11px]">({contactMessages.filter(m => !m.is_read).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactFilter('ad')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      contactFilter === 'ad' ? 'bg-amber-800 text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <Megaphone className="w-3 h-3 text-amber-600" />
                    <span>विज्ञापन</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactFilter('suggestion')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      contactFilter === 'suggestion' ? 'bg-purple-800 text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>सुझाव</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactFilter('press')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      contactFilter === 'press' ? 'bg-blue-800 text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>प्रेस रिलीज</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactFilter('complaint')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      contactFilter === 'complaint' ? 'bg-rose-800 text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>शिकायत</span>
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    placeholder="नाम, ईमेल, फोन या संदेश में खोजें..."
                    className="w-full text-xs pl-9 pr-8 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                  />
                  {contactSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setContactSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inquiry List Table */}
              {(() => {
                const filtered = contactMessages.filter(msg => {
                  if (contactFilter === 'unread' && msg.is_read) return false;
                  if (contactFilter === 'read' && !msg.is_read) return false;
                  const cat = getInquiryCategoryInfo(msg);
                  if (contactFilter === 'ad' && cat.type !== 'ad') return false;
                  if (contactFilter === 'suggestion' && cat.type !== 'suggestion') return false;
                  if (contactFilter === 'press' && cat.type !== 'press') return false;
                  if (contactFilter === 'complaint' && cat.type !== 'complaint') return false;

                  if (contactSearchQuery.trim()) {
                    const q = contactSearchQuery.toLowerCase();
                    const match = 
                      (msg.name || '').toLowerCase().includes(q) ||
                      (msg.email || '').toLowerCase().includes(q) ||
                      (msg.phone || '').toLowerCase().includes(q) ||
                      (msg.subject || '').toLowerCase().includes(q) ||
                      (msg.message || '').toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-lg border border-stone-200 p-12 text-center shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-stone-800 text-sm">कोई इंक्वायरी नहीं मिली</h3>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        {contactSearchQuery
                          ? `'${contactSearchQuery}' से संबंधित कोई संदेश नहीं मिला। कृपया दूसरा शब्द खोजें।`
                          : 'इस फ़िल्टर के अंतर्गत वर्तमान में कोई पूछताछ या संदेश उपलब्ध नहीं है।'}
                      </p>
                      {(contactFilter !== 'all' || contactSearchQuery) && (
                        <button
                          type="button"
                          onClick={() => { setContactFilter('all'); setContactSearchQuery(''); }}
                          className="text-xs text-red-700 hover:underline font-semibold cursor-pointer"
                        >
                          फ़िल्टर हटाएं एवं सभी देखें
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 text-stone-700 font-semibold border-b border-stone-200">
                          <tr>
                            <th className="p-3.5">स्थिति</th>
                            <th className="p-3.5">प्रेषक का विवरण</th>
                            <th className="p-3.5">श्रेणी व विषय</th>
                            <th className="p-3.5">संदेश का सारांश</th>
                            <th className="p-3.5 whitespace-nowrap">प्राप्त समय</th>
                            <th className="p-3.5 text-right whitespace-nowrap">त्वरित कार्य</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filtered.map((msg) => {
                            const cat = getInquiryCategoryInfo(msg);
                            return (
                              <tr 
                                key={msg.id} 
                                className={`transition-colors cursor-pointer ${
                                  !msg.is_read ? 'bg-amber-50/50 hover:bg-amber-50 font-medium' : 'hover:bg-stone-50/70'
                                }`}
                                onClick={() => setSelectedMessage(msg)}
                              >
                                <td className="p-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMessageRead(msg.id)}
                                    className="flex items-center gap-1.5 cursor-pointer"
                                    title={msg.is_read ? 'अपठित चिह्नित करें' : 'पढ़ा हुआ चिह्नित करें'}
                                  >
                                    {!msg.is_read ? (
                                      <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                                        ● नई
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded font-medium border border-stone-200">
                                        ✓ पढ़ी गई
                                      </span>
                                    )}
                                  </button>
                                </td>

                                <td className="p-3.5">
                                  <div className="font-bold text-stone-900">{msg.name}</div>
                                  <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                                    <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                                    <span className="truncate max-w-[170px]">{msg.email}</span>
                                  </div>
                                  {msg.phone && (
                                    <div className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                                      <PhoneCall className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>{msg.phone}</span>
                                    </div>
                                  )}
                                </td>

                                <td className="p-3.5 max-w-[220px]">
                                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mb-1 ${cat.color}`}>
                                    {cat.label}
                                  </span>
                                  <div className="font-semibold text-stone-800 truncate" title={msg.subject}>
                                    {msg.subject}
                                  </div>
                                </td>

                                <td className="p-3.5 max-w-[280px]">
                                  <p className="text-stone-600 line-clamp-2 leading-relaxed text-xs">
                                    {msg.message}
                                  </p>
                                </td>

                                <td className="p-3.5 whitespace-nowrap text-stone-500 text-[11px]">
                                  <div>
                                    {new Date(msg.created_at).toLocaleDateString('hi-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                                    {new Date(msg.created_at).toLocaleTimeString('hi-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </td>

                                <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMessage(msg)}
                                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                                      title="पूरा विवरण देखें"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    {msg.phone && (
                                      <a
                                        href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते ${msg.name}, BLACK LENS पर आपकी इंक्वायरी के संबंध में:`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 cursor-pointer"
                                        title="WhatsApp पर संदेश भेजें"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    <a
                                      href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 cursor-pointer"
                                      title="ईमेल उत्तर दें"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => setDeleteMessageModal({ isOpen: true, msg })}
                                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                      title="इंक्वायरी हटाएं"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: FULL ARTICLE DETAILS & AUDIT LOG PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold truncate max-w-lg">समाचार संपूर्ण विवरण व पूर्वावलोकन</h3>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="p-1 text-stone-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-stone-900">
              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(previewArticle.status)}
                  <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded border border-red-200">
                    {previewArticle.category_name}
                  </span>
                  <span className="text-xs text-stone-500">
                    {previewArticle.location || 'गाजियाबाद'}
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    {previewArticle.author_avatar ? (
                      <img src={previewArticle.author_avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-red-500" />
                    ) : null}
                    <span>संवाददाता: <strong className="text-stone-800">{previewArticle.author_name}</strong></span>
                  </span>
                  <span>·</span>
                  <span>दृश्य: <strong>{previewArticle.view_count || 0}</strong></span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-xl font-bold text-stone-900 leading-tight">{previewArticle.title}</h1>
                {previewArticle.subtitle && (
                  <p className="text-sm text-stone-600 mt-1 italic">{previewArticle.subtitle}</p>
                )}
              </div>

              {/* Featured Image */}
              {previewArticle.featured_image && (
                <div className="rounded overflow-hidden border border-stone-200 bg-stone-100">
                  <img
                    src={previewArticle.featured_image}
                    alt={previewArticle.title}
                    className="w-full max-h-72 object-cover"
                  />
                  {(previewArticle.image_caption || previewArticle.image_credit) && (
                    <div className="p-2 bg-stone-50 text-[11px] text-stone-500 flex items-center justify-between">
                      <span>{previewArticle.image_caption}</span>
                      <span className="font-semibold">{previewArticle.image_credit}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Excerpt */}
              {previewArticle.excerpt && (
                <div className="p-3 bg-stone-50 border-l-4 border-red-700 text-xs font-medium text-stone-700 italic">
                  {previewArticle.excerpt}
                </div>
              )}

              {/* Formatted Content */}
              <div 
                className="text-xs text-stone-800 leading-relaxed space-y-3 prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewArticle.content }}
              />

              {/* Video if any */}
              {previewArticle.video_url && (
                <div className="border border-stone-200 rounded p-3 bg-stone-50 space-y-2">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-red-600" />
                    <span>संलग्न वीडियो रिपोर्ट</span>
                  </span>
                  <div className="aspect-[16/9] w-full max-h-60 rounded overflow-hidden bg-black flex items-center justify-center">
                    {isYouTubeUrl(previewArticle.video_url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(previewArticle.video_url) || ''}
                        title="YouTube Video"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video src={previewArticle.video_url} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {previewArticle.tags && previewArticle.tags.length > 0 && (
                <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs font-semibold text-stone-600 mr-1">टैग्स:</span>
                  {previewArticle.tags.map(t => (
                    <span key={t} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] border border-stone-200">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Editorial Notes if any */}
              {previewArticle.review_notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                  <strong className="block flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>संपादकीय टिप्पणी / सुधार निर्देश:</span>
                  </strong>
                  <p>{previewArticle.review_notes}</p>
                </div>
              )}

              {/* Audit Log Trail */}
              <div className="pt-3 border-t border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-stone-500" />
                  <span>ऑडिट ट्रेल व गतिविधि इतिहास (Audit Logs)</span>
                </h4>
                {previewArticle.audit_logs && previewArticle.audit_logs.length > 0 ? (
                  <div className="bg-stone-50 rounded border border-stone-200 divide-y divide-stone-100 text-[11px]">
                    {previewArticle.audit_logs.map((log, lIdx) => (
                      <div key={lIdx} className="p-2.5 flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-stone-900">{log.user_name}</strong>: {log.action}
                          {log.from_status && log.to_status && (
                            <span className="text-stone-500 ml-1">
                              ({log.from_status} &rarr; <strong>{log.to_status}</strong>)
                            </span>
                          )}
                          {log.notes && <p className="text-stone-600 mt-0.5 italic">"{log.notes}"</p>}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleString('hi-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">इस समाचार के लिए कोई पूर्व गतिविधि दर्ज नहीं है।</p>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                बंद करें
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const art = previewArticle;
                    setPreviewArticle(null);
                    startEditArticle(art);
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-bold cursor-pointer"
                >
                  संपादित करें
                </button>
                {currentUser.role_id !== 5 && previewArticle.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = previewArticle.id;
                      setPreviewArticle(null);
                      handleUpdateArticleStatus(id, 'published');
                    }}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>तुरंत लाइव करें</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ARTICLE DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteArticleModal.isOpen && deleteArticleModal.article && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-red-700 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">समाचार विलोपन की पुष्टि</h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-800 font-semibold leading-relaxed">
                क्या आप समाचार <strong>"{deleteArticleModal.article.title}"</strong> को हटाना चाहते हैं?
              </p>

              <div className="space-y-2 bg-stone-50 p-3 rounded border border-stone-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    checked={!deleteArticleModal.permanent}
                    onChange={() => setDeleteArticleModal(prev => ({ ...prev, permanent: false }))}
                    className="mt-0.5 text-red-600"
                  />
                  <div>
                    <strong className="text-stone-900 block">सुरक्षित आर्काइव (Soft Delete - अनुशंसित)</strong>
                    <span className="text-[11px] text-stone-500">
                      समाचार सार्वजनिक वेबसाइट से हट जाएगा किंतु एडमिन आर्काइव में सुरक्षित रहेगा और कभी भी बहाल किया जा सकता है।
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-stone-200">
                  <input
                    type="radio"
                    name="deleteType"
                    checked={deleteArticleModal.permanent}
                    onChange={() => setDeleteArticleModal(prev => ({ ...prev, permanent: true }))}
                    className="mt-0.5 text-red-600"
                  />
                  <div>
                    <strong className="text-red-700 block">स्थायी रूप से हटाएं (Permanent Delete)</strong>
                    <span className="text-[11px] text-stone-500">
                      डेटाबेस से यह समाचार हमेशा के लिए मिटा दिया जाएगा। इसे पुनर्प्राप्त नहीं किया जा सकेगा।
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteArticleModal({ isOpen: false, article: null, permanent: false })}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-700 font-medium hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDeleteArticle}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  {deleteArticleModal.permanent ? 'हाँ, स्थायी रूप से हटाएं' : 'हाँ, आर्काइव में डालें'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: EDITORIAL REVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {reviewModal.isOpen && reviewModal.article && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold">संपादकीय सत्यापन एवं समीक्षा</h3>
              </div>
              <button
                onClick={() => setReviewModal({ isOpen: false, article: null, notes: '' })}
                className="p-1 text-stone-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase">शीर्षक</span>
                <h2 className="text-base font-bold text-stone-900 mt-0.5">{reviewModal.article.title}</h2>
              </div>

              <div className="flex items-center gap-3 text-stone-600 bg-stone-50 p-2.5 rounded border border-stone-200">
                <span className="flex items-center gap-1.5">
                  {reviewModal.article.author_avatar ? (
                    <img src={reviewModal.article.author_avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-red-500" />
                  ) : null}
                  <span>संवाददाता: <strong className="text-stone-900">{reviewModal.article.author_name}</strong></span>
                </span>
                <span>·</span>
                <span>श्रेणी: <strong>{reviewModal.article.category_name}</strong></span>
                <span>·</span>
                <span>स्थान: <strong>{reviewModal.article.location || 'गाजियाबाद'}</strong></span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase">विवरण सार</span>
                <p className="mt-1 p-2.5 bg-stone-50 rounded border border-stone-200 leading-relaxed text-stone-700">
                  {reviewModal.article.excerpt || reviewModal.article.content.replace(/<[^>]+>/g, '').slice(0, 300)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  संपादकीय समीक्षा टिप्पणी / सुधार निर्देश (Editorial Review Notes):
                </label>
                <textarea
                  rows={3}
                  value={reviewModal.notes}
                  onChange={(e) => setReviewModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="यदि सुधार आवश्यक हो, तो यहां निर्देश लिखें ताकि रिपोर्टर अपनी खबर में संशोधन कर सके..."
                  className="w-full p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const art = reviewModal.article;
                  setReviewModal({ isOpen: false, article: null, notes: '' });
                  if (art) startEditArticle(art);
                }}
                className="text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
              >
                संपादित करें (Edit in Form) &rarr;
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectReview(reviewModal.article!.id, 'approved', reviewModal.notes || 'संपादक द्वारा स्वीकृत')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded font-bold cursor-pointer shadow-xs"
                >
                  स्वीकृत करें (Approve)
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectReview(reviewModal.article!.id, 'published', reviewModal.notes || 'स्वीकृत कर सीधे लाइव किया गया')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded font-bold cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>स्वीकृत कर लाइव करें</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!reviewModal.notes.trim()) {
                      alert('कृपया सुधार हेतु कारण/टिप्पणी दर्ज करें।');
                      return;
                    }
                    handleDirectReview(reviewModal.article!.id, 'rejected', reviewModal.notes);
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs px-3.5 py-2 rounded font-semibold cursor-pointer"
                >
                  सुधार हेतु वापस भेजें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: BREAKING NEWS ADD/EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {breakingModal.isOpen && breakingModal.item && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{breakingModal.item.id ? 'ब्रेकिंग हेडलाइन संशोधित करें' : 'नई ब्रेकिंग हेडलाइन'}</span>
              </h3>
              <button
                onClick={() => setBreakingModal({ isOpen: false, item: null })}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBreakingItem} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">हेडलाइन समाचार *</label>
                <textarea
                  rows={3}
                  required
                  value={breakingModal.item.title || ''}
                  onChange={(e) => setBreakingModal(prev => ({
                    ...prev,
                    item: { ...prev.item, title: e.target.value }
                  }))}
                  placeholder="उदा. गाजियाबाद: एलिवेटेड रोड पर सुरक्षा के पुख्ता इंतजाम..."
                  className="w-full p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">प्रदर्शित क्रम (Order)</label>
                  <input
                    type="number"
                    min={1}
                    value={breakingModal.item.display_order ?? 1}
                    onChange={(e) => setBreakingModal(prev => ({
                      ...prev,
                      item: { ...prev.item, display_order: parseInt(e.target.value, 10) || 1 }
                    }))}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">स्थिति</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breakingModal.item.is_active !== false}
                      onChange={(e) => setBreakingModal(prev => ({
                        ...prev,
                        item: { ...prev.item, is_active: e.target.checked }
                      }))}
                      className="rounded text-red-600"
                    />
                    <span className="font-semibold text-stone-800">लाइव टिकर में सक्रिय रखें</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>बाहरी लिंक / वेब URL (वैकल्पिक)</span>
                  <span className="text-emerald-700 text-[10px]">वैकल्पिक</span>
                </label>
                <input
                  type="url"
                  value={breakingModal.item.external_url || ''}
                  onChange={(e) => setBreakingModal(prev => ({
                    ...prev,
                    item: { ...prev.item, external_url: e.target.value }
                  }))}
                  placeholder="https://teznazar.com/news/..."
                  className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setBreakingModal({ isOpen: false, item: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer shadow-xs"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: CATEGORY ADD/EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {categoryModal.isOpen && categoryModal.cat && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-red-500" />
                <span>{categoryModal.cat.id ? 'श्रेणी संशोधित करें (Edit Category)' : 'नई श्रेणी जोड़ें (Add Category)'}</span>
              </h3>
              <button
                onClick={() => setCategoryModal({ isOpen: false, cat: null })}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">हिंदी नाम (Category Name - Hindi) *</label>
                <input
                  type="text"
                  required
                  value={categoryModal.cat.name_hi || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryModal(prev => ({
                      ...prev,
                      cat: {
                        ...prev.cat,
                        name_hi: val,
                        slug: prev.cat?.slug || val.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/gi, '-').slice(0, 40)
                      }
                    }));
                  }}
                  placeholder="उदा. ऑटोमोबाइल या विज्ञान"
                  className="w-full p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>अंग्रेजी नाम (English Name)</span>
                  <span className="text-emerald-700 text-[10px]">वैकल्पिक</span>
                </label>
                <input
                  type="text"
                  value={categoryModal.cat.name_en || ''}
                  onChange={(e) => setCategoryModal(prev => ({
                    ...prev,
                    cat: { ...prev.cat, name_en: e.target.value }
                  }))}
                  placeholder="उदा. Automobile"
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>URL स्लग (SEO Slug)</span>
                  <span className="text-stone-400 text-[10px]">उदा. automobile</span>
                </label>
                <input
                  type="text"
                  value={categoryModal.cat.slug || ''}
                  onChange={(e) => setCategoryModal(prev => ({
                    ...prev,
                    cat: { ...prev.cat, slug: e.target.value }
                  }))}
                  placeholder="automobile"
                  className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">प्रदर्शित क्रम (Order)</label>
                  <input
                    type="number"
                    min={1}
                    value={categoryModal.cat.display_order ?? 1}
                    onChange={(e) => setCategoryModal(prev => ({
                      ...prev,
                      cat: { ...prev.cat, display_order: parseInt(e.target.value, 10) || 1 }
                    }))}
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">सक्रिय स्थिति</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryModal.cat.is_active !== false}
                      onChange={(e) => setCategoryModal(prev => ({
                        ...prev,
                        cat: { ...prev.cat, is_active: e.target.checked }
                      }))}
                      className="rounded text-red-600"
                    />
                    <span className="font-semibold text-stone-800">सक्रिय रखें</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryModal.cat.is_in_menu !== false}
                    onChange={(e) => setCategoryModal(prev => ({
                      ...prev,
                      cat: { ...prev.cat, is_in_menu: e.target.checked }
                    }))}
                    className="rounded text-red-600"
                  />
                  <span>हेडर मेनू में दिखाएं</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryModal.cat.is_in_home !== false}
                    onChange={(e) => setCategoryModal(prev => ({
                      ...prev,
                      cat: { ...prev.cat, is_in_home: e.target.checked }
                    }))}
                    className="rounded text-red-600"
                  />
                  <span>होमपेज ब्लॉक में दिखाएं</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, cat: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer shadow-xs"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: CATEGORY DELETE WITH SAFE REASSIGNMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteCatModal.isOpen && deleteCatModal.cat && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-red-700 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">श्रेणी विलोपन एवं समाचार स्थानांतरण</h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-800 leading-relaxed">
                क्या आप वाकई श्रेणी <strong>"{deleteCatModal.cat.name_hi}"</strong> को हटाना चाहते हैं?
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 space-y-2">
                <strong className="block text-[11px]">सुरक्षा जांच: समाचार संदर्भ टूटने से बचाएं</strong>
                <p className="text-[11px] text-amber-800">
                  इस श्रेणी में दर्ज सभी समाचारों को किसी अन्य मान्य श्रेणी में पुनर्निर्देशित करना आवश्यक है, ताकि पोर्टल पर कोई भी लिंक टूटे नहीं।
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    खबरों को इस श्रेणी में पुनर्निर्देशित करें (Fallback Category):
                  </label>
                  <select
                    value={deleteCatModal.reassignTo}
                    onChange={(e) => setDeleteCatModal(prev => ({
                      ...prev,
                      reassignTo: parseInt(e.target.value, 10) || 1
                    }))}
                    className="w-full p-2 border border-stone-300 rounded bg-white text-xs font-semibold"
                  >
                    {categoryList
                      .filter(c => c.id !== deleteCatModal.cat?.id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name_hi} ({c.name_en})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteCatModal({ isOpen: false, cat: null, reassignTo: 1 })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategoryConfirm}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  हाँ, श्रेणी हटाएं और समाचार स्थानांतरित करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 7: TAG ADD/EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {tagModal.isOpen && tagModal.tag && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-red-500" />
                <span>{tagModal.tag.id ? 'टैग संशोधित करें (Edit Tag)' : 'नया टैग जोड़ें (Add Tag)'}</span>
              </h3>
              <button
                onClick={() => setTagModal({ isOpen: false, tag: null })}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTag} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">टैग का नाम (Tag Name) *</label>
                <input
                  type="text"
                  required
                  value={tagModal.tag.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTagModal(prev => ({
                      ...prev,
                      tag: {
                        ...prev.tag,
                        name: val,
                        slug: prev.tag?.slug || val.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/gi, '-').slice(0, 40)
                      }
                    }));
                  }}
                  placeholder="उदा. साइबर सुरक्षा या गाजियाबाद"
                  className="w-full p-2 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">URL स्लग (SEO Slug)</label>
                <input
                  type="text"
                  value={tagModal.tag.slug || ''}
                  onChange={(e) => setTagModal(prev => ({
                    ...prev,
                    tag: { ...prev.tag, slug: e.target.value }
                  }))}
                  placeholder="cyber-security"
                  className="w-full p-2 border border-stone-300 rounded font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={tagModal.tag.is_popular !== false}
                    onChange={(e) => setTagModal(prev => ({
                      ...prev,
                      tag: { ...prev.tag, is_popular: e.target.checked }
                    }))}
                    className="rounded text-red-600"
                  />
                  <span>ट्रेंडिंग टैग बनाएं</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={tagModal.tag.is_active !== false}
                    onChange={(e) => setTagModal(prev => ({
                      ...prev,
                      tag: { ...prev.tag, is_active: e.target.checked }
                    }))}
                    className="rounded text-red-600"
                  />
                  <span>सक्रिय रखें</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setTagModal({ isOpen: false, tag: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer shadow-xs"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 8: ADVERTISEMENT ADD / EDIT MODAL (MODULE 4) */}
      {/* ------------------------------------------------------------- */}
      {adModal.isOpen && adModal.ad && (() => {
        const selectedPlacement = AD_PLACEMENTS.find(p => p.id === (adModal.ad?.placement || 'header_banner')) || AD_PLACEMENTS[0];

        return (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
              {/* Modal Header */}
              <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-yellow-400" />
                  <span>{adModal.ad.id ? 'विज्ञापन अभियान संशोधित करें' : 'नया विज्ञापन अभियान जोड़ें'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setAdModal({ isOpen: false, ad: null })}
                  className="text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveAd} className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* 1. Ad Name & Advertiser */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      विज्ञापन का नाम (Advertisement Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={adModal.ad.title || ''}
                      onChange={(e) => setAdModal(prev => ({
                        ...prev,
                        ad: { ...prev.ad, title: e.target.value }
                      }))}
                      placeholder="उदा. दीपावली स्पेशल डिस्काउंट सेल"
                      className="w-full p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                      <span>विज्ञापनदाता / कंपनी का नाम</span>
                      <span className="text-emerald-700 text-[10px]">वैकल्पिक</span>
                    </label>
                    <input
                      type="text"
                      value={adModal.ad.advertiser_name || ''}
                      onChange={(e) => setAdModal(prev => ({
                        ...prev,
                        ad: { ...prev.ad, advertiser_name: e.target.value }
                      }))}
                      placeholder="उदा. एपेक्स ग्रुप"
                      className="w-full p-2.5 border border-stone-300 rounded"
                    />
                  </div>
                </div>

                {/* 2. Placement Selection & Dimension Guidance */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    विज्ञापन का स्थान (Advertisement Placement) *
                  </label>
                  <select
                    value={adModal.ad.placement || 'breaking_news'}
                    onChange={(e) => setAdModal(prev => ({
                      ...prev,
                      ad: { ...prev.ad, placement: e.target.value }
                    }))}
                    className="w-full p-2.5 border border-stone-300 rounded bg-white text-xs font-bold text-stone-900"
                  >
                    {AD_PLACEMENTS.map(p => (
                      <option key={p.id} value={p.id}>
                        {(p as any).locationLabel || p.name} — [साइज़: {p.dims}]
                      </option>
                    ))}
                  </select>

                  {/* Reactive Dimension Guidance Box */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                        <ImageIcon className="w-4 h-4 text-amber-700" />
                        <span>स्थान:</span>
                        <span className="bg-amber-200/90 text-amber-950 font-bold px-2 py-0.5 rounded text-xs">
                          {(selectedPlacement as any).locationLabel || selectedPlacement.name}
                        </span>
                      </span>
                      <span className="text-stone-300">|</span>
                      <span className="font-bold text-xs text-amber-900">अनुशंसित छवि साइज़:</span>
                      <span className="bg-red-700 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">
                        {selectedPlacement.dims}
                      </span>
                      <span className="text-[11px] text-amber-800 font-semibold">
                        (अनुपात: {selectedPlacement.aspect})
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">{selectedPlacement.desc}</p>
                  </div>
                </div>

                {/* 3. Image Upload & URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-700">
                      विज्ञापन छवि / बैनर (Image Upload & Preview) *
                    </label>
                    <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      आवश्यक साइज़: {selectedPlacement.dims}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Live Preview Box */}
                    <div className="w-44 h-28 rounded border-2 border-stone-300 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {adModal.ad.image_url ? (
                        <div className="w-full h-full relative">
                          <img
                            src={adModal.ad.image_url}
                            alt="Ad Preview"
                            className="w-full h-full object-contain p-1 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setAdModal(prev => ({
                              ...prev,
                              ad: { ...prev.ad, image_url: '' }
                            }))}
                            className="absolute top-1 right-1 bg-red-700 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                            title="छवि हटाएं"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-stone-400 text-[10px] p-2">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span>पूर्वावलोकन यहां दिखेगा</span>
                          <span className="block text-[9px] text-amber-700 font-bold mt-1">{selectedPlacement.dims}</span>
                        </div>
                      )}
                    </div>

                    {/* File Picker & URL Options */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2.5">
                        {/* Dynamic Size Indicator right above button */}
                        <div className="flex items-center gap-2 flex-wrap bg-amber-50 border border-amber-200 p-2 rounded text-xs text-amber-950 font-medium">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                            <span>इस विज्ञापन के लिए छवि आकार (Dimensions):</span>
                          </span>
                          <span className="bg-red-700 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">
                            {selectedPlacement.dims}
                          </span>
                          <span className="text-[11px] text-amber-800">
                            (अनुपात: {selectedPlacement.aspect})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="file"
                            ref={adImageFileRef}
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleAdFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={adImageLoading}
                            onClick={() => adImageFileRef.current?.click()}
                            className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{adImageLoading ? 'अपलोड हो रहा है...' : 'कंप्यूटर / मोबाइल से छवि चुनें (Upload from PC)'}</span>
                          </button>
                          <span className="text-[10px] text-stone-500 font-medium">JPG, PNG, WebP (अधिकतम 5 MB)</span>
                        </div>

                        {adModal.ad.image_url && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded font-semibold">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>✓ विज्ञापन छवि सफलतापूर्वक अपलोड हो चुकी है (URL डालना अनिवार्य नहीं है)।</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-500 block">
                          अथवा यदि आप ऑनलाइन छवि URL दर्ज करना चाहें (वैकल्पिक):
                        </span>
                        <input
                          type="text"
                          value={adModal.ad.image_url || ''}
                          onChange={(e) => setAdModal(prev => ({
                            ...prev,
                            ad: { ...prev.ad, image_url: e.target.value }
                          }))}
                          placeholder="उदा. https://example.com/banner.jpg (ऊपर से फ़ाइल अपलोड करने पर इसे खाली छोड़ें)"
                          className="w-full p-2 border border-stone-300 rounded font-mono text-[11px] focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Destination / Target URL */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                    <span>गंतव्य लिंक / वेबसाइट URL (Destination Click URL)</span>
                    <span className="text-emerald-700 text-[10px] font-bold">वैकल्पिक (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={adModal.ad.destination_url || ''}
                    onChange={(e) => setAdModal(prev => ({
                      ...prev,
                      ad: { ...prev.ad, destination_url: e.target.value }
                    }))}
                    placeholder="https://example.com/special-offer (यदि कोई लिंक नहीं है तो खाली छोड़ सकते हैं)"
                    className="w-full p-2.5 border border-stone-300 rounded font-mono text-[11px] focus:border-red-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    (वैकल्पिक) जब पाठक विज्ञापन पर क्लिक करेगा, तो यह वेब पेज नई विंडो में खुलेगा। यदि कोई लिंक नहीं है तो खाली छोड़ दें।
                  </span>
                </div>

                {/* 5. Description */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                    <span>विवरण / अभियान नोट्स</span>
                    <span className="text-emerald-700 text-[10px]">वैकल्पिक</span>
                  </label>
                  <input
                    type="text"
                    value={adModal.ad.description || ''}
                    onChange={(e) => setAdModal(prev => ({
                      ...prev,
                      ad: { ...prev.ad, description: e.target.value }
                    }))}
                    placeholder="अभियान की अवधि या विशेष निर्देश"
                    className="w-full p-2 border border-stone-300 rounded"
                  />
                </div>

                {/* 6. Dates, Order & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">प्रारंभ तिथि (Start)</label>
                    <input
                      type="date"
                      value={adModal.ad.start_date || ''}
                      onChange={(e) => setAdModal(prev => ({
                        ...prev,
                        ad: { ...prev.ad, start_date: e.target.value }
                      }))}
                      className="w-full p-2 border border-stone-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">समाप्ति तिथि (End)</label>
                    <input
                      type="date"
                      value={adModal.ad.end_date || ''}
                      onChange={(e) => setAdModal(prev => ({
                        ...prev,
                        ad: { ...prev.ad, end_date: e.target.value }
                      }))}
                      className="w-full p-2 border border-stone-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">प्रदर्शित क्रम (Order)</label>
                    <input
                      type="number"
                      min={1}
                      value={adModal.ad.display_order ?? 1}
                      onChange={(e) => setAdModal(prev => ({
                        ...prev,
                        ad: { ...prev.ad, display_order: parseInt(e.target.value, 10) || 1 }
                      }))}
                      className="w-full p-2 border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">स्थिति (Status)</label>
                    <select
                      value={adModal.ad.status || (adModal.ad.is_active ? 'active' : 'inactive')}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setAdModal(prev => ({
                          ...prev,
                          ad: {
                            ...prev.ad,
                            status: val,
                            is_active: val === 'active'
                          }
                        }));
                      }}
                      className="w-full p-2 border border-stone-300 rounded bg-white text-xs font-bold"
                    >
                      <option value="active">सक्रिय (Active)</option>
                      <option value="inactive">निष्क्रिय (Inactive)</option>
                      <option value="draft">ड्राफ्ट (Draft)</option>
                      <option value="scheduled">शेड्यूल (Scheduled)</option>
                      <option value="expired">समाप्त (Expired)</option>
                    </select>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setAdModal({ isOpen: false, ad: null })}
                    className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer shadow-md"
                  >
                    विज्ञापन सुरक्षित करें (Save Advertisement)
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 9: ADVERTISEMENT DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteAdModal.isOpen && deleteAdModal.ad && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-red-700 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">विज्ञापन विलोपन की पुष्टि</h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-800 leading-relaxed font-semibold">
                क्या आप वाकई विज्ञापन <strong>"{deleteAdModal.ad.title}"</strong> को हटाना चाहते हैं?
              </p>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-stone-600 space-y-1 text-[11px]">
                <div>स्थान: <strong>{deleteAdModal.ad.placement}</strong></div>
                {deleteAdModal.ad.advertiser_name && (
                  <div>विज्ञापनदाता: <strong>{deleteAdModal.ad.advertiser_name}</strong></div>
                )}
                <div className="text-stone-500 pt-1">
                  यह विज्ञापन सार्वजनिक पोर्टल के सभी स्लॉट्स से तुरंत हटा दिया जाएगा।
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteAdModal({ isOpen: false, ad: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAdConfirm}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  हाँ, विज्ञापन हटाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 10: USER DETAILS PREVIEW MODAL (MODULE 8) */}
      {/* ------------------------------------------------------------- */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-sm">उपयोगकर्ता / आवेदक संपूर्ण विवरण</h3>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1 text-stone-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-base font-bold text-stone-900">{selectedUserDetail.name}</h2>
                  <p className="text-stone-500 font-mono text-[11px]">{selectedUserDetail.email}</p>
                </div>
                <div>
                  {selectedUserDetail.approval_status === 'pending' ? (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      लंबित अनुमोदन
                    </span>
                  ) : selectedUserDetail.approval_status === 'rejected' ? (
                    <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      अस्वीकृत
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      स्वीकृत व सक्रिय
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded border border-stone-200/80">
                <div>
                  <span className="text-[10px] text-stone-500 block">संपर्क मोबाइल:</span>
                  <strong className="text-stone-800 font-mono">{selectedUserDetail.phone || 'उपलब्ध नहीं'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">कार्यक्षेत्र / जिला:</span>
                  <strong className="text-stone-800">{selectedUserDetail.assigned_region || 'गाजियाबाद / एनसीआर'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">आवेदन की गई भूमिका:</span>
                  <strong className="text-red-700 uppercase">{selectedUserDetail.requested_role || 'रिपोर्टर'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">वर्तमान सिस्टम भूमिका:</span>
                  <strong className="text-stone-900">{selectedUserDetail.role_name || (selectedUserDetail.role_id === 1 ? 'Super Admin' : selectedUserDetail.role_id === 4 ? 'Editor' : 'Reporter')}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-stone-500 block">पंजीकरण तिथि:</span>
                  <strong className="text-stone-700">
                    {selectedUserDetail.created_at ? new Date(selectedUserDetail.created_at).toLocaleString('hi-IN') : 'पूर्व पंजीकृत'}
                  </strong>
                </div>
              </div>

              {selectedUserDetail.bio && (
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">संक्षिप्त परिचय व अनुभव:</span>
                  <p className="bg-stone-50 p-2.5 rounded border border-stone-200 text-stone-700 leading-relaxed italic">
                    "{selectedUserDetail.bio}"
                  </p>
                </div>
              )}

              {/* Approval History / Notes */}
              {(selectedUserDetail.approved_by_name || selectedUserDetail.approval_notes) && (
                <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-[11px] text-amber-950 space-y-1">
                  <strong className="block font-bold flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-amber-700" />
                    <span>अनुमोदन इतिहास व टिप्पणियां (Approval Log):</span>
                  </strong>
                  {selectedUserDetail.approved_by_name && (
                    <div>समीक्षक: <strong>{selectedUserDetail.approved_by_name}</strong></div>
                  )}
                  {selectedUserDetail.approved_at && (
                    <div>दिनांक: <strong>{new Date(selectedUserDetail.approved_at).toLocaleString('hi-IN')}</strong></div>
                  )}
                  {selectedUserDetail.approval_notes && (
                    <div>टिप्पणी: <span className="italic">"{selectedUserDetail.approval_notes}"</span></div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedUserDetail(null)}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 11: USER APPROVAL / REJECTION / ROLE MODAL (MODULE 8) */}
      {/* ------------------------------------------------------------- */}
      {approvalModal.isOpen && approvalModal.user && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className={`p-4 text-white flex items-center justify-between ${
              approvalModal.action === 'approve'
                ? 'bg-emerald-700'
                : approvalModal.action === 'reject'
                ? 'bg-red-700'
                : 'bg-stone-900'
            }`}>
              <div className="flex items-center gap-2">
                {approvalModal.action === 'approve' ? (
                  <UserCheck className="w-5 h-5" />
                ) : approvalModal.action === 'reject' ? (
                  <UserX className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                <h3 className="font-bold text-sm">
                  {approvalModal.action === 'approve'
                    ? 'पंजीकरण अनुरोध अनुमोदन (Approve User)'
                    : approvalModal.action === 'reject'
                    ? 'पंजीकरण अनुरोध अस्वीकृति (Reject Request)'
                    : 'उपयोगकर्ता भूमिका परिवर्तन (Change Role)'}
                </h3>
              </div>
              <button
                onClick={() => setApprovalModal({ isOpen: false, user: null, action: 'approve' })}
                className="p-1 text-white/80 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <div className="font-bold text-stone-900 text-sm">{approvalModal.user.name}</div>
                <div className="text-stone-500 font-mono text-[11px]">{approvalModal.user.email}</div>
                {approvalModal.user.requested_role && (
                  <div className="text-[11px] text-stone-600 mt-1">
                    आवेदित भूमिका: <strong className="text-red-700 uppercase">{approvalModal.user.requested_role}</strong>
                  </div>
                )}
              </div>

              {/* If Action is Approve or Role: Pick Role */}
              {(approvalModal.action === 'approve' || approvalModal.action === 'role') && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    अधिकृत भूमिका असाइन करें (Assign Authorized Role) *
                  </label>
                  <div className="space-y-1.5">
                    <label className={`p-2.5 border rounded cursor-pointer flex items-center justify-between transition-colors ${
                      approvalModal.roleId === 5
                        ? 'border-red-600 bg-red-50/50 text-red-950 font-bold'
                        : 'border-stone-300 hover:bg-stone-50 text-stone-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="assignedRole"
                          checked={approvalModal.roleId === 5}
                          onChange={() => setApprovalModal(prev => ({ ...prev, roleId: 5 }))}
                          className="text-red-600"
                        />
                        <span>फील्ड रिपोर्टर (Reporter)</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-normal">खबर लेखन व सबमिशन</span>
                    </label>

                    <label className={`p-2.5 border rounded cursor-pointer flex items-center justify-between transition-colors ${
                      approvalModal.roleId === 4
                        ? 'border-red-600 bg-red-50/50 text-red-950 font-bold'
                        : 'border-stone-300 hover:bg-stone-50 text-stone-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="assignedRole"
                          checked={approvalModal.roleId === 4}
                          onChange={() => setApprovalModal(prev => ({ ...prev, roleId: 4 }))}
                          className="text-red-600"
                        />
                        <span>संपादक (Editor)</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-normal">समीक्षा, संपादन व प्रकाशन</span>
                    </label>

                    <label className={`p-2.5 border rounded cursor-pointer flex items-center justify-between transition-colors ${
                      approvalModal.roleId === 1
                        ? 'border-red-600 bg-red-50/50 text-red-950 font-bold'
                        : 'border-stone-300 hover:bg-stone-50 text-stone-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="assignedRole"
                          checked={approvalModal.roleId === 1}
                          onChange={() => setApprovalModal(prev => ({ ...prev, roleId: 1 }))}
                          className="text-red-600"
                        />
                        <span>सुपर एडमिन (Super Admin)</span>
                      </div>
                      <span className="text-[10px] text-red-600 font-bold">पूर्ण प्रशासनिक अधिकार</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {approvalModal.action === 'reject' ? 'अस्वीकृति का कारण / संपादकीय टिप्पणी *' : 'अनुमोदन टिप्पणी (Editorial Notes / Audit)'}
                </label>
                <textarea
                  rows={3}
                  value={approvalModal.notes || ''}
                  onChange={(e) => setApprovalModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={
                    approvalModal.action === 'reject'
                      ? 'अस्वीकृति का स्पष्ट कारण दर्ज करें...'
                      : 'सत्यापन विवरण अथवा अतिरिक्त निर्देश दर्ज करें...'
                  }
                  className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setApprovalModal({ isOpen: false, user: null, action: 'approve' })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>

                {approvalModal.action === 'approve' && (
                  <button
                    type="button"
                    disabled={approvalLoading}
                    onClick={() => handleApproveUser(approvalModal.user!.id, approvalModal.roleId, approvalModal.notes)}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {approvalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    <span>अनुमोदित व सक्रिय करें</span>
                  </button>
                )}

                {approvalModal.action === 'reject' && (
                  <button
                    type="button"
                    disabled={approvalLoading}
                    onClick={() => handleRejectUser(approvalModal.user!.id, approvalModal.notes)}
                    className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {approvalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                    <span>अस्वीकृत करें</span>
                  </button>
                )}

                {approvalModal.action === 'role' && (
                  <button
                    type="button"
                    disabled={approvalLoading}
                    onClick={() => handleChangeUserRole(approvalModal.user!.id, approvalModal.roleId || 5)}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {approvalLoading ? 'बदलाव हो रहा है...' : 'भूमिका सहेजें'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 12: BREAKING NEWS DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteBreakingModal.isOpen && deleteBreakingModal.item && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm">ब्रेकिंग न्यूज़ टिकर विलोपन की पुष्टि</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteBreakingModal({ isOpen: false, item: null })}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-800 leading-relaxed font-semibold">
                क्या आप वाकई इस ब्रेकिंग न्यूज़ को टिकर से हटाना चाहते हैं?
              </p>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-stone-800 text-[11px] font-medium leading-relaxed">
                "{deleteBreakingModal.item.title}"
              </div>

              <p className="text-[11px] text-stone-500">
                यह टिकर समाचार मुख्य पृष्ठ के लाइव टिकर बार से तुरंत हटा दिया जाएगा।
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteBreakingModal({ isOpen: false, item: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDeleteBreaking}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  हाँ, टिकर से हटाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 13: TAG DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteTagModal.isOpen && deleteTagModal.tag && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm">टैग विलोपन की पुष्टि</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTagModal({ isOpen: false, tag: null })}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-800 leading-relaxed font-semibold">
                क्या आप वाकई टैग <strong>"#{deleteTagModal.tag.name}"</strong> को हटाना चाहते हैं?
              </p>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-stone-600 text-[11px]">
                टैग नाम: <strong>#{deleteTagModal.tag.name}</strong> ({deleteTagModal.tag.slug})
              </div>

              <p className="text-[11px] text-stone-500">
                यह टैग सिस्टम से हटा दिया जाएगा और सभी संबद्ध खबरों से इसका संदर्भ अलग हो जाएगा।
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteTagModal({ isOpen: false, tag: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDeleteTag}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  हाँ, टैग हटाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 14: USER ACCOUNT DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteUserModal.isOpen && deleteUserModal.user && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm">उपयोगकर्ता खाता विलोपन की पुष्टि</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteUserModal({ isOpen: false, user: null })}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-800 leading-relaxed font-semibold">
                क्या आप वाकई <strong>'{deleteUserModal.user.name}'</strong> ({deleteUserModal.user.email}) का खाता हटाना चाहते हैं?
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-[11px] space-y-1">
                <strong>चेतावनी:</strong> यह कार्रवाई पूर्ववत नहीं की जा सकती। इस खाते से संबंधित सभी लॉगिन अधिकार तुरंत निरस्त हो जाएंगे।
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteUserModal({ isOpen: false, user: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDeleteUser}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  हाँ, खाता हटाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 15: CONTACT INQUIRY FULL DETAILS MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">इंक्वायरी संपूर्ण विवरण (Inquiry Details)</h3>
                  <p className="text-[11px] text-stone-400">वेबसाइट 'संपर्क करें' फॉर्म द्वारा प्राप्त</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Header Badges & Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 rounded border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">प्रेषक का नाम</span>
                  <strong className="text-stone-900 text-sm">{selectedMessage.name}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    selectedMessage.is_read ? 'bg-stone-200 text-stone-700' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {selectedMessage.is_read ? 'पढ़ा हुआ (Reviewed)' : '● नई इंक्वायरी (Unread)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleMessageRead(selectedMessage.id)}
                    className="text-[11px] px-2 py-1 bg-white border border-stone-300 hover:bg-stone-100 rounded text-stone-700 font-medium cursor-pointer"
                  >
                    {selectedMessage.is_read ? 'अपठित मार्क करें' : 'पढ़ा हुआ मार्क करें'}
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded border border-stone-100 space-y-1">
                  <span className="text-[10px] text-stone-500 font-semibold block">ईमेल पता</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline font-mono text-xs font-semibold break-all flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedMessage.email}</span>
                  </a>
                </div>
                <div className="p-3 bg-stone-50 rounded border border-stone-100 space-y-1">
                  <span className="text-[10px] text-stone-500 font-semibold block">फोन / व्हाट्सएप नंबर</span>
                  {selectedMessage.phone ? (
                    <div className="flex items-center gap-2">
                      <a href={`tel:${selectedMessage.phone}`} className="text-emerald-700 hover:underline font-mono text-xs font-semibold flex items-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                        <span>{selectedMessage.phone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded font-bold"
                      >
                        WhatsApp
                      </a>
                    </div>
                  ) : (
                    <span className="text-stone-400 italic">उपलब्ध नहीं</span>
                  )}
                </div>
              </div>

              {/* Subject & Category */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold block">विषय / संदर्भ</span>
                <div className="p-2.5 bg-stone-100 rounded text-stone-900 font-bold text-xs border border-stone-200">
                  {selectedMessage.subject}
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold block">संदेश / इंक्वायरी का संपूर्ण विवरण</span>
                <div className="p-4 bg-stone-50 rounded border border-stone-200 text-stone-800 leading-relaxed text-xs whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
                <span>प्राप्त समय: {new Date(selectedMessage.created_at).toLocaleString('hi-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                <span className="font-mono text-[10px]">ID: #{selectedMessage.id}</span>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedMessage;
                    setSelectedMessage(null);
                    setDeleteMessageModal({ isOpen: true, msg: toDelete });
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>इंक्वायरी हटाएं</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedMessage.phone && (
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते ${selectedMessage.name}, BLACK LENS पर आपकी इंक्वायरी के संबंध में:`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>WhatsApp उत्तर</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>ईमेल उत्तर</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-1.5 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    बंद करें
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 16: CONTACT INQUIRY DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteMessageModal.isOpen && deleteMessageModal.msg && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm">इंक्वायरी विलोपन की पुष्टि</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteMessageModal({ isOpen: false, msg: null })}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-800 leading-relaxed font-semibold">
                क्या आप वाकई <strong>'{deleteMessageModal.msg.name}'</strong> द्वारा भेजी गई इस इंक्वायरी ({deleteMessageModal.msg.subject}) को हटाना चाहते हैं?
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-[11px] space-y-1">
                <strong>चेतावनी:</strong> यह कार्रवाई पूर्ववत नहीं की जा सकती। यह संदेश एडमिन पोर्टल एवं डेटाबेस से हमेशा के लिए हटा दिया जाएगा।
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteMessageModal({ isOpen: false, msg: null })}
                  className="px-4 py-2 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDeleteMessage}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  हाँ, इंक्वायरी हटाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
