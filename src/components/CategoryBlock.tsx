import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, Clock, MapPin, Eye, Play, Pause, 
  ChevronLeft, ChevronRight, Sparkles, Building2, 
  Compass, Radio, Landmark, ShieldAlert, Sun, Trophy, 
  Globe, Rocket, Flame, Layers
} from 'lucide-react';
import { Article } from '../types';
import { CategoryPopupModal } from './CategoryPopupModal';

interface CategoryBlockProps {
  title: string;
  categorySlug: string;
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onViewCategory?: (slug: string) => void;
  onPlayVideo?: (article: Article) => void;
  themeColor?: string;
  badgeText?: string;
  variant?: 'grid4' | 'featured_split' | 'compact_list' | 'scroller';
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({
  title,
  categorySlug,
  articles,
  onOpenArticle,
  onViewCategory,
  onPlayVideo,
  themeColor,
  badgeText
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const manualTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    };
  }, []);

  if (!articles || articles.length === 0) return null;

  // Maximum 10 news articles displayed on home screen ticker
  // 11th and later articles drop off the home screen and appear only in "सभी देखें" popup
  const homeArticles = articles.slice(0, 10);
  const totalCount = articles.length;
  const hasMoreThan10 = totalCount > 10;

  // Build a seamless infinite loop list (minimum 8 items in base set to guarantee smooth ticker loop)
  let baseArticles = [...homeArticles];
  while (baseArticles.length < 8 && baseArticles.length > 0) {
    baseArticles = [...baseArticles, ...homeArticles];
  }
  const loopArticles = [...baseArticles, ...baseArticles];

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'ताज़ा';
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'अभी-अभी';
    if (diffHours === 1) return '1 घंटा पहले';
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    return `${Math.floor(diffHours / 24)} दिन पहले`;
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      // Pause ticker for 3 seconds on manual arrow click so user can inspect the target card
      setIsHovered(true);
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
      manualTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
    }
  };

  // Category Icon & Theme selection
  const getCategoryDetails = () => {
    switch (categorySlug) {
      case 'ghaziabad':
        return {
          icon: <Building2 className="w-4 h-4 text-red-700" />,
          accentBg: 'bg-red-700',
          accentText: 'text-red-700',
          borderCol: 'border-red-700',
          badge: badgeText || 'शहर विशेष'
        };
      case 'delhi-ncr':
        return {
          icon: <Compass className="w-4 h-4 text-blue-700" />,
          accentBg: 'bg-blue-700',
          accentText: 'text-blue-700',
          borderCol: 'border-blue-700',
          badge: badgeText || 'एनसीआर कवरेज'
        };
      case 'video-news':
        return {
          icon: <Radio className="w-4 h-4 text-red-600 animate-pulse" />,
          accentBg: 'bg-red-600',
          accentText: 'text-red-600',
          borderCol: 'border-red-600',
          badge: badgeText || 'वीडियो बुलेटिन'
        };
      case 'politics':
        return {
          icon: <Landmark className="w-4 h-4 text-slate-800" />,
          accentBg: 'bg-slate-800',
          accentText: 'text-slate-800',
          borderCol: 'border-slate-800',
          badge: badgeText || 'सियासी हलचल'
        };
      case 'crime':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-amber-600" />,
          accentBg: 'bg-amber-600',
          accentText: 'text-amber-600',
          borderCol: 'border-amber-600',
          badge: badgeText || 'पुलिस व एसटीएफ'
        };
      case 'religion':
        return {
          icon: <Sun className="w-4 h-4 text-amber-500" />,
          accentBg: 'bg-amber-500',
          accentText: 'text-amber-600',
          borderCol: 'border-amber-500',
          badge: badgeText || 'संस्कृति व पर्व'
        };
      case 'sports':
        return {
          icon: <Trophy className="w-4 h-4 text-emerald-600" />,
          accentBg: 'bg-emerald-600',
          accentText: 'text-emerald-600',
          borderCol: 'border-emerald-600',
          badge: badgeText || 'खेल समाचार'
        };
      case 'uttar-pradesh':
        return {
          icon: <MapPin className="w-4 h-4 text-purple-700" />,
          accentBg: 'bg-purple-700',
          accentText: 'text-purple-700',
          borderCol: 'border-purple-700',
          badge: badgeText || 'प्रदेश हलचल'
        };
      case 'india':
      case 'national':
        return {
          icon: <Globe className="w-4 h-4 text-orange-600" />,
          accentBg: 'bg-orange-600',
          accentText: 'text-orange-600',
          borderCol: 'border-orange-600',
          badge: badgeText || 'राष्ट्रीय सुरक्षा'
        };
      case 'science':
      case 'science-tech':
      case 'विज्ञान-और-अंतरिक्ष':
      case 'space-science':
        return {
          icon: <Rocket className="w-4 h-4 text-cyan-600" />,
          accentBg: 'bg-cyan-600',
          accentText: 'text-cyan-600',
          borderCol: 'border-cyan-600',
          badge: badgeText || 'इसरो व नासा'
        };
      default:
        return {
          icon: <Layers className="w-4 h-4 text-red-700" />,
          accentBg: 'bg-red-700',
          accentText: 'text-red-700',
          borderCol: 'border-stone-900',
          badge: badgeText || 'ताज़ा खबर'
        };
    }
  };

  const details = getCategoryDetails();

  return (
    <>
      <div className="bg-white rounded-lg border border-stone-200/90 p-3.5 sm:p-4 shadow-2xs transition-all select-none">
        {/* Category Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b-2 border-stone-900 gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-5 ${details.accentBg} inline-block rounded-xs`} />
            <div className="flex items-center gap-1.5">
              {details.icon}
              <h2 className="text-base sm:text-lg font-black text-stone-950 tracking-tight">
                {title}
              </h2>
            </div>

            {/* Live Scrolling Indicator */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ताज़ा {homeArticles.length} खबरें</span>
            </span>

            {hasMoreThan10 && (
              <span className="hidden md:inline-block text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                +{totalCount - 10} और समाचार
              </span>
            )}
          </div>

          {/* Action & Scrolling Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 sm:p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded transition-colors cursor-pointer"
              title={isPaused ? 'स्क्रॉलिंग शुरू करें' : 'स्क्रॉलिंग रोकें'}
              aria-label={isPaused ? 'Resume scroll' : 'Pause scroll'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Left Scroll Button */}
            <button
              type="button"
              onClick={() => handleManualScroll('left')}
              className="p-1 sm:p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors cursor-pointer"
              title="पीछे स्क्रॉल करें"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Right Scroll Button */}
            <button
              type="button"
              onClick={() => handleManualScroll('right')}
              className="p-1 sm:p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors cursor-pointer"
              title="आगे स्क्रॉल करें"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* "सभी देखें" Button -> Opens Popup Modal like "हमारे बारे में" */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold bg-stone-900 hover:bg-red-700 text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer ml-1 shadow-2xs"
            >
              <span>सभी देखें</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Compact Horizontal Scrolling Rail (जैसे कि ब्रेकिंग न्यूज़ डली हुई है और स्क्रॉलिंग चलती रहनी चाहिए) */}
        <div 
          ref={scrollContainerRef}
          className="relative overflow-x-auto overflow-y-hidden py-1 px-0.5 no-scrollbar cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div className={`animate-ticker flex items-stretch gap-3 ${(isPaused || isHovered) ? 'ticker-paused' : ''}`}>
            {loopArticles.map((art, idx) => {
              const isVideo = !!(art.is_video_news || art.video_url);
              return (
                <div
                  key={`${art.id || 'article'}-${idx}`}
                  onClick={() => {
                    if (isVideo && onPlayVideo && art.video_url) {
                      onPlayVideo(art);
                    } else {
                      onOpenArticle(art);
                    }
                  }}
                  className="w-56 sm:w-64 shrink-0 bg-stone-50 hover:bg-white rounded-md border border-stone-200/90 hover:border-red-600 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden group/card"
                >
                  <div>
                    {/* Compact Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                      <img
                        src={art.featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Location Badge */}
                      {art.location && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                          <span className="truncate max-w-[100px]">{art.location}</span>
                        </span>
                      )}

                      {/* Video Indicator */}
                      {isVideo && (
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center shadow-md group-hover/card:scale-110 group-hover/card:bg-red-600 transition-all">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Card Content */}
                    <div className="p-2.5">
                      <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                        <span className="font-bold text-red-700 uppercase tracking-tight truncate max-w-[110px]">
                          {art.category_name || title}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {formatRelativeTime(art.published_at || art.created_at)}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover/card:text-red-700 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="px-2.5 py-1.5 bg-stone-100/70 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                    <span className="truncate max-w-[100px] text-stone-600 font-medium">
                      {art.author_name || 'विशेष संवाददाता'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-stone-400" />
                      {art.view_count || 120}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POPUP MODAL (Opens like "हमारे बारे में") */}
      <CategoryPopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        categorySlug={categorySlug}
        articles={articles}
        onOpenArticle={(art) => {
          setIsModalOpen(false);
          onOpenArticle(art);
        }}
        onPlayVideo={(art) => {
          if (onPlayVideo) {
            onPlayVideo(art);
          } else {
            onOpenArticle(art);
          }
        }}
        accentColor={details.accentBg}
        categoryIcon={details.icon}
      />
    </>
  );
};
