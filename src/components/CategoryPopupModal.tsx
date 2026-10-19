import React, { useState, useMemo } from 'react';
import { X, Search, Clock, MapPin, Eye, Play, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { Article } from '../types';

interface CategoryPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categorySlug: string;
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onPlayVideo?: (article: Article) => void;
  accentColor?: string;
  categoryIcon?: React.ReactNode;
}

export const CategoryPopupModal: React.FC<CategoryPopupModalProps> = ({
  isOpen,
  onClose,
  title,
  categorySlug,
  articles,
  onOpenArticle,
  onPlayVideo,
  accentColor = 'bg-red-700',
  categoryIcon
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter articles based on modal search input
  const filteredArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase().trim();
    return articles.filter(a => 
      a.title?.toLowerCase().includes(q) ||
      a.excerpt?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.author_name?.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  if (!isOpen) return null;

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'ताज़ा';
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'अभी-अभी';
    if (diffHours === 1) return '1 घंटा पहले';
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    return `${Math.floor(diffHours / 24)} दिन पहले`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center items-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white text-stone-900 w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden relative border border-stone-800/30 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. TOP BRAND HEADER (Matching "हमारे बारे में" LegalPages.tsx modal exactly) */}
        <div className="bg-stone-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-4 ${accentColor} rounded-xs inline-block`} />
            <span className="text-sm font-bold text-stone-200 tracking-wide">
              BLACK LENS (Media &amp; Entertainment)
            </span>
            <span className="hidden sm:inline text-xs text-stone-400">
              · {title}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-stone-400 hover:text-white rounded cursor-pointer transition-colors"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. CATEGORY TITLE BAR & SEARCH FILTER */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              {categoryIcon}
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                {title}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
              <span className="font-semibold text-stone-700">कुल {articles.length} समाचार</span>
              <span>·</span>
              <span>सभी ताज़ा एवं पूर्व प्रकाशित समाचार</span>
              {articles.length > 10 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                  होम स्क्रीन पर केवल ताज़ा 10
                </span>
              )}
            </p>
          </div>

          {/* Instant in-modal search input */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="इस श्रेणी में समाचार खोजें..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-stone-300 rounded-md text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs p-0.5"
                title="हटाएं"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. SCROLLABLE ARTICLES LIST / GRID */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-100/50">
          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center text-stone-500">
              <p className="text-sm font-semibold text-stone-700">
                {searchQuery ? `"${searchQuery}" से संबंधित कोई समाचार नहीं मिला।` : 'इस श्रेणी में वर्तमान में कोई समाचार उपलब्ध नहीं है।'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-red-700 font-bold hover:underline cursor-pointer"
                >
                  सभी समाचार देखें
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((art, index) => {
                const isVideo = !!(art.is_video_news || art.video_url);
                return (
                  <article
                    key={art.id || index}
                    onClick={() => {
                      if (isVideo && onPlayVideo && art.video_url) {
                        onPlayVideo(art);
                      } else {
                        onOpenArticle(art);
                      }
                    }}
                    className="group bg-white rounded-md border border-stone-200 overflow-hidden hover:border-red-600 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Compact thumbnail */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                        <img
                          src={art.featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Location Tag */}
                        {art.location && (
                          <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                            {art.location}
                          </span>
                        )}

                        {/* Video Play Badge if Video */}
                        {isVideo && (
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                          <span className="font-bold text-red-700">{art.category_name || title}</span>
                          <span>{formatRelativeTime(art.published_at || art.created_at)}</span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>

                        {art.excerpt && (
                          <p className="text-[11px] text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Meta */}
                    <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                      <span className="truncate max-w-[120px]">{art.author_name || 'विशेष संवाददाता'}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-stone-400" />
                        {art.view_count || 350}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. MODAL FOOTER */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <span>BLACK LENS डिजिटल न्यूज़ नेटवर्क · निष्पक्ष पत्रकारिता</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded text-xs cursor-pointer transition-colors"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
