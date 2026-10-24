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
  author_bio?: string;
  author_role?: string;
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
  related?: Array<{
    id: number;
    title: string;
    slug: string;
    featured_image: string;
    published_at?: string;
    category_name?: string;
  }>;
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
  placement: 
    | 'breaking_news'
    | 'live_desk'
    | 'category_khel'
    | 'category_up'
    | 'video_section'
    | 'header_banner' 
    | 'home_top' 
    | 'in_feed' 
    | 'sidebar' 
    | 'article_inline' 
    | 'category_page' 
    | 'footer_banner' 
    | string;
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
  status?: 'draft' | 'active' | 'inactive' | 'scheduled' | 'expired';
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
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

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_description?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  trending_topics?: string;
  google_site_verification?: string;
  google_analytics_id?: string;
  canonical_url?: string;
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

  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  instagram_url: string;
  whatsapp_number?: string;
  whatsapp_channel_url: string;

  copyright_text?: string;
  footer_about: string;
  [key: string]: string | undefined;
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
