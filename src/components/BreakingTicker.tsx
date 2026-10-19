import React, { useState, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Clock, MapPin, Flame } from 'lucide-react';
import { Article, BreakingNewsItem } from '../types';

interface BreakingTickerProps {
  articles: Article[];
  tickerItems?: BreakingNewsItem[];
  onOpenArticle: (article: Article) => void;
  onSelectTicker?: (title: string, articleId?: number | null) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  articles,
  tickerItems = [],
  onOpenArticle,
  onSelectTicker
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Active breaking news ticker items
  const activeTickers = [...tickerItems]
    .filter(t => t.is_active !== false)
    .sort((a, b) => a.display_order - b.display_order);

  // Filter only published articles and sort newest first by published_at or created_at
  const sortedArticles = [...articles]
    .filter(a => a.status === 'published')
    .sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return timeB - timeA;
    });

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'अभी-अभी';
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'अभी-अभी';
    if (diffHours === 1) return '1 घंटा पहले';
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    const days = Math.floor(diffHours / 24);
    return `${days} दिन पहले`;
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // If no articles exist in database, display a clean empty state without fabricated news
  if (sortedArticles.length === 0 && activeTickers.length === 0) {
    return (
      <div className="w-full bg-stone-900 border-b border-stone-800 text-stone-400 py-3 px-4 text-center text-xs">
        वर्तमान में कोई ब्रेकिंग समाचार उपलब्ध नहीं है।
      </div>
    );
  }

  // To create a continuous, seamless horizontal scroll loop, duplicate list for animation
  const loopList = [...sortedArticles, ...sortedArticles];

  return (
    <div 
      className="w-full bg-stone-950 border-y border-stone-800 text-white relative overflow-hidden select-none"
      aria-label="Breaking News Ticker"
    >
      {/* 0. Live Breaking Ticker Ribbon (From Breaking News Items) */}
      {activeTickers.length > 0 && (
        <div className="bg-red-800 text-white text-xs px-4 py-1.5 flex items-center overflow-hidden border-b border-red-900 shadow-inner">
          <div className="flex items-center gap-1.5 shrink-0 pr-3 font-black text-amber-300 uppercase tracking-wide border-r border-red-700 mr-3">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="font-sans">LIVE TICKER:</span>
          </div>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <div className={`animate-ticker-slow flex items-center gap-8 text-[11px] font-semibold ${isPaused ? 'ticker-paused' : ''}`}>
              {[...activeTickers, ...activeTickers].map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => onSelectTicker && onSelectTicker(item.title, item.article_id)}
                  className="hover:underline hover:text-amber-200 cursor-pointer flex items-center gap-2 text-stone-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 inline-block" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Bar with Badge & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between border-b border-stone-900">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
          <span className="bg-red-700 text-white text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider font-sans">
            BREAKING NEWS
          </span>
          <span className="text-xs text-stone-300 font-semibold hidden sm:inline">
            ताज़ा एवं महत्वपूर्ण सुर्खियां ({sortedArticles.length} समाचार)
          </span>
        </div>

        {/* Play/Pause & Scroll controls */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] font-medium"
            title={isPaused ? 'चलाएं (Resume)' : 'रोकें (Pause)'}
            aria-label={isPaused ? 'स्क्रॉल चलाएं' : 'स्क्रॉल रोकें'}
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>चलाएं</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>रोकें</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleManualScroll('left')}
            className="p-1 hover:bg-stone-800 text-stone-300 hover:text-white rounded transition-colors cursor-pointer"
            aria-label="पिछला समाचार"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManualScroll('right')}
            className="p-1 hover:bg-stone-800 text-stone-300 hover:text-white rounded transition-colors cursor-pointer"
            aria-label="अगला समाचार"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Continuously Scrolling Carousel Track */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden py-3 px-4 scrollbar-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className={`animate-ticker-slow flex items-stretch gap-3 ${isPaused ? 'ticker-paused' : ''}`}>
          {loopList.map((article, index) => (
            <article
              key={`${article.id}-${index}`}
              onClick={() => onOpenArticle(article)}
              className="w-56 sm:w-64 shrink-0 bg-stone-900/90 border border-stone-800 hover:border-red-600 rounded-md overflow-hidden cursor-pointer group transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              {/* Actual News Image */}
              <div className="aspect-[16/10] w-full overflow-hidden bg-black relative">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {article.category_name && (
                  <span className="absolute bottom-1.5 left-1.5 bg-red-700/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {article.category_name}
                  </span>
                )}
              </div>

              {/* News Headline directly below image */}
              <div className="p-2.5 flex-1 flex flex-col justify-between bg-stone-900">
                <h3 className="headline-font text-xs sm:text-sm font-bold text-stone-100 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 pt-1.5 border-t border-stone-800">
                  <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                    <MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                    <span>{article.location || 'गाजियाबाद'}</span>
                  </span>
                  <span className="flex items-center gap-0.5 shrink-0 text-stone-400">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatRelativeTime(article.published_at || article.created_at)}</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
