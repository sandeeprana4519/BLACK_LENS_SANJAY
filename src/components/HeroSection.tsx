import React from 'react';
import { Clock, MapPin, Eye, ArrowUpRight, Flame } from 'lucide-react';
import { Article, Advertisement, SiteSettings } from '../types';

interface HeroSectionProps {
  articles: Article[];
  sidebarAd?: Advertisement;
  liveDeskAd?: Advertisement;
  settings?: SiteSettings | Record<string, any>;
  onOpenArticle: (article: Article) => void;
  onSelectCategory: (slug: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  articles,
  sidebarAd,
  liveDeskAd,
  settings,
  onOpenArticle,
  onSelectCategory
}) => {
  if (!articles || articles.length === 0) return null;

  const leadStory = articles[0];
  const secondaryStories = articles.slice(1, 4);
  const latestFeed = articles.slice(4, 9);

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'अभी-अभी';
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'अभी-अभी';
    if (diffHours === 1) return '1 घंटा पहले';
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    const days = Math.floor(diffHours / 24);
    return `${days} दिन पहले`;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / CENTER: LEAD STORY + SECONDARY STORIES (8 COLUMNS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Hero Card */}
          {leadStory && (
            <article 
              onClick={() => onOpenArticle(leadStory)}
              className="group bg-white rounded border border-stone-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                <img
                  src={leadStory.featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80'}
                  alt={leadStory.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Overlay details */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 text-stone-300">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (leadStory.category_slug) onSelectCategory(leadStory.category_slug);
                      }}
                      className="bg-red-700 text-white px-2 py-0.5 rounded text-[11px] font-bold hover:bg-red-800 transition-colors"
                    >
                      {leadStory.category_name || 'विशेष खबर'}
                    </span>
                    {leadStory.location && (
                      <span className="flex items-center gap-0.5 text-stone-300">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {leadStory.location}
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-stone-300">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(leadStory.published_at || leadStory.created_at)}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white headline-font leading-tight group-hover:text-red-300 transition-colors">
                    {leadStory.title}
                  </h1>

                  <p className="hidden sm:block text-stone-300 text-sm mt-2 line-clamp-2 leading-relaxed">
                    {leadStory.excerpt}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-white/10">
                    <span>ब्यूरो: <strong className="text-stone-200">{leadStory.author_name}</strong></span>
                    <span className="flex items-center gap-1 text-red-400 font-semibold group-hover:translate-x-1 transition-transform">
                      पूरी खबर पढ़ें <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* 3 Secondary Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {secondaryStories.map((story) => (
              <article
                key={story.id}
                onClick={() => onOpenArticle(story)}
                className="group bg-white rounded border border-stone-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden bg-stone-100 relative">
                  <img
                    src={story.featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'}
                    alt={story.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {story.category_name}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1.5">
                      {story.location && (
                        <span>{story.location}</span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{formatRelativeTime(story.published_at || story.created_at)}</span>
                    </div>

                    <h2 className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">
                      {story.title}
                    </h2>
                  </div>

                  <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate max-w-[120px]">{story.author_name}</span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {story.view_count || 320}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: LATEST UPDATES & DESK FEED (4 COLUMNS) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Latest Feed Header */}
          <div className="bg-white rounded border border-stone-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b-2 border-red-700 mb-3">
              <h2 className="text-base font-extrabold text-stone-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                ताज़ा अपडेट्स (Live Desk)
              </h2>
              <span className="text-xs font-semibold text-red-700">पल-पल की खबर</span>
            </div>

            {/* List of articles with Live Desk Ad format */}
            <div className="divide-y divide-stone-100">
              {latestFeed.slice(0, 2).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => onOpenArticle(item)}
                  className="py-3 group cursor-pointer first:pt-1"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-black text-stone-300 font-mono w-4 shrink-0 group-hover:text-red-700 transition-colors">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                        <span className="text-red-700 font-bold">{item.category_name}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(item.published_at || item.created_at)}</span>
                      </div>

                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {item.featured_image && (
                      <div className="w-16 h-14 rounded overflow-hidden shrink-0 bg-stone-100">
                        <img 
                          src={item.featured_image} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Dedicated Live Desk Advertisement Format */}
              {liveDeskAd && (
                <div
                  onClick={() => {
                    if (liveDeskAd.destination_url && liveDeskAd.destination_url !== '#') {
                      fetch(`/api/advertisements/${liveDeskAd.id}/click`, { method: 'POST' }).catch(() => {});
                      window.open(liveDeskAd.destination_url, '_blank');
                    }
                  }}
                  className="my-2.5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-md cursor-pointer hover:border-amber-500 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold mb-1.5">
                    <span className="flex items-center gap-1 bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded uppercase tracking-wider font-sans">
                      <span>⭐ प्रायोजित विज्ञापन</span>
                    </span>
                    <span className="text-stone-600 truncate max-w-[140px]">{liveDeskAd.advertiser_name || 'लाइव डेस्क स्पॉन्सर'}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    {liveDeskAd.image_url && (
                      <div className="w-20 h-16 rounded overflow-hidden shrink-0 bg-stone-100 border border-amber-200">
                        <img
                          src={liveDeskAd.image_url}
                          alt={liveDeskAd.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                        {liveDeskAd.title}
                      </h4>
                      {liveDeskAd.description && (
                        <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                          {liveDeskAd.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 group-hover:text-amber-900 mt-1">
                        <span>क्लिक कर देखें</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {latestFeed.slice(2).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => onOpenArticle(item)}
                  className="py-3 group cursor-pointer last:pb-1"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-black text-stone-300 font-mono w-4 shrink-0 group-hover:text-red-700 transition-colors">
                      {index + 3}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                        <span className="text-red-700 font-bold">{item.category_name}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(item.published_at || item.created_at)}</span>
                      </div>

                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {item.featured_image && (
                      <div className="w-16 h-14 rounded overflow-hidden shrink-0 bg-stone-100">
                        <img 
                          src={item.featured_image} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Advertisement Slot (300x250) */}
          {sidebarAd && sidebarAd.image_url && (
            <div className="bg-stone-200 rounded p-2 text-center overflow-hidden border border-stone-300">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">
                प्रायोजित विज्ञापन {sidebarAd.advertiser_name ? `· ${sidebarAd.advertiser_name}` : ''}
              </span>
              <a
                href={sidebarAd.destination_url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  fetch(`/api/advertisements/${sidebarAd.id}/click`, { method: 'POST' }).catch(() => {});
                }}
                className="block max-h-64 overflow-hidden rounded group"
              >
                <img
                  src={sidebarAd.image_url}
                  alt={sidebarAd.title}
                  className="w-full h-auto max-h-64 object-cover group-hover:opacity-95 transition-opacity"
                />
              </a>
            </div>
          )}

          {/* Quick Newsletter / WhatsApp Channel Join Callout */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-white p-4 rounded border border-stone-800">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-red-500" />
              <span>ब्लैक लेंस व्हाट्सऐप चैनल</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              गाजियाबाद व एनसीआर की हर ताज़ा खबर सीधे अपने फोन पर पाएं
            </h3>
            <p className="text-xs text-stone-400 mb-3">
              दैनिक बुलेटिन, ट्रैफिक अलर्ट और ब्रेकिंग समाचार सबसे पहले।
            </p>
            <a
              href={settings?.whatsapp_channel_url || 'https://whatsapp.com'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded transition-colors text-center"
            >
              व्हाट्सऐप चैनल से जुड़ें (Join Channel)
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
