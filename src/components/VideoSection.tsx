import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, X, Radio, Clock, Eye, 
  ChevronLeft, ChevronRight, ArrowRight, Video, Sparkles, MapPin 
} from 'lucide-react';
import { Article, Advertisement } from '../types';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/video';
import { CategoryPopupModal } from './CategoryPopupModal';

interface VideoSectionProps {
  articles: Article[];
  videoAd?: Advertisement;
  onOpenArticle: (article: Article) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ articles, videoAd, onOpenArticle }) => {
  const [activeVideo, setActiveVideo] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter video articles
  const videoNews = articles ? articles.filter(a => a.is_video_news || a.video_url || a.category_slug === 'video-news') : [];
  const allVideoArticles = videoNews.length > 0 ? videoNews : (articles ? articles.filter(a => a.featured_image).slice(0, 12) : []);

  const manualTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    };
  }, []);

  if (allVideoArticles.length === 0) return null;

  // Enforce maximum 10 items on home screen scrolling strip
  const homeVideoArticles = allVideoArticles.slice(0, 10);
  const totalCount = allVideoArticles.length;

  // Build a seamless infinite loop list (minimum 8 items in base set to guarantee smooth ticker loop)
  let baseVideoList = [...homeVideoArticles];
  while (baseVideoList.length < 8 && baseVideoList.length > 0) {
    baseVideoList = [...baseVideoList, ...homeVideoArticles];
  }
  const loopVideoArticles = [...baseVideoList, ...baseVideoList];

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
      // Pause ticker for 3 seconds on manual arrow click so user can inspect the video card
      setIsHovered(true);
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
      manualTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
    }
  };

  const renderVideoAdCard = (key: string) => {
    if (!videoAd) return null;
    return (
      <div
        key={key}
        onClick={() => {
          if (videoAd.destination_url && videoAd.destination_url !== '#') {
            fetch(`/api/advertisements/${videoAd.id}/click`, { method: 'POST' }).catch(() => {});
            window.open(videoAd.destination_url, '_blank');
          }
        }}
        className="w-56 sm:w-64 shrink-0 bg-stone-900 hover:bg-stone-850 rounded-md border-2 border-amber-500 hover:border-amber-400 transition-all shadow-md cursor-pointer flex flex-col justify-between overflow-hidden group/videocard relative"
      >
        <div>
          <div className="relative aspect-[16/10] overflow-hidden bg-black">
            {videoAd.image_url ? (
              <img
                src={videoAd.image_url}
                alt={videoAd.title}
                className="w-full h-full object-cover group-hover/videocard:scale-105 transition-transform duration-300 opacity-90"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-300 font-bold text-xs p-3 text-center bg-stone-950">
                {videoAd.title}
              </div>
            )}

            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg group-hover/videocard:scale-110 transition-all font-black text-xs">
                AD
              </div>
            </div>

            <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              <span>प्रायोजित वीडियो</span>
            </span>
          </div>

          <div className="p-2.5">
            <div className="flex items-center justify-between text-[10px] text-amber-400 mb-1">
              <span className="font-bold uppercase tracking-wider truncate max-w-[120px]">
                {videoAd.advertiser_name || 'स्पॉन्सर'}
              </span>
              <span className="text-[9px] bg-stone-800 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                SPONSORED
              </span>
            </div>

            <h3 className="text-xs sm:text-[13px] font-bold text-stone-100 group-hover/videocard:text-amber-300 transition-colors line-clamp-2 leading-snug">
              {videoAd.title}
            </h3>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-[10px] text-amber-300 font-bold">
          <span className="truncate max-w-[120px] text-stone-400">
            {videoAd.advertiser_name ? `विज्ञापनदाता: ${videoAd.advertiser_name}` : 'विज्ञापन'}
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span>क्लिक करें</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="bg-stone-950 text-white p-3.5 sm:p-5 my-4 sm:my-6 rounded-lg shadow-md border border-stone-800 select-none">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-stone-800 mb-3.5 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  वीडियो समाचार (Video Ground Reports)
                </h2>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-stone-300 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>ताज़ा {homeVideoArticles.length} वीडियो</span>
              </span>

              {totalCount > 10 && (
                <span className="hidden md:inline-block text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.5 rounded">
                  +{totalCount - 10} और वीडियो
                </span>
              )}
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 sm:p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded transition-colors cursor-pointer"
                title={isPaused ? 'स्क्रॉलिंग शुरू करें' : 'स्क्रॉलिंग रोकें'}
                aria-label={isPaused ? 'Resume video scroll' : 'Pause video scroll'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleManualScroll('left')}
                className="p-1 sm:p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded transition-colors cursor-pointer"
                title="पीछे स्क्रॉल करें"
                aria-label="Scroll videos left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleManualScroll('right')}
                className="p-1 sm:p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded transition-colors cursor-pointer"
                title="आगे स्क्रॉल करें"
                aria-label="Scroll videos right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 text-xs font-bold bg-red-700 hover:bg-red-600 text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer ml-1 shadow-2xs"
              >
                <span>सभी देखें</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Compact Video Scrolling Strip (ऑटो-मूविंग ब्रेकिंग टिकर की तरह) */}
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
              {videoAd && renderVideoAdCard('vid-ad-start')}
              {loopVideoArticles.map((video, idx) => (
                <React.Fragment key={`${video.id || 'video'}-${idx}`}>
                  <div
                    onClick={() => {
                      if (video.video_url) {
                        setActiveVideo(video);
                      } else {
                        onOpenArticle(video);
                      }
                    }}
                    className="w-56 sm:w-64 shrink-0 bg-stone-900 hover:bg-stone-850 rounded-md border border-stone-800 hover:border-red-600 transition-all shadow-md cursor-pointer flex flex-col justify-between overflow-hidden group/videocard"
                  >
                    <div>
                      {/* Compact Video Thumbnail */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-black">
                        <img
                          src={video.featured_image || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80'}
                          alt={video.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover/videocard:scale-105 transition-transform duration-300 opacity-90"
                          loading="lazy"
                        />

                        {/* Play Icon */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center shadow-lg group-hover/videocard:scale-115 group-hover/videocard:bg-red-600 transition-all">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Video Bulletin Tag */}
                        <span className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-[9px] text-stone-200 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                          <Video className="w-2.5 h-2.5 text-red-400" />
                          <span>{video.location || 'वीडियो'}</span>
                        </span>

                      </div>

                      {/* Content */}
                      <div className="p-2.5">
                        <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                          <span className="font-bold text-red-400 uppercase tracking-tight truncate max-w-[110px]">
                            {video.category_name || 'ग्राउंड रिपोर्ट'}
                          </span>
                          <span className="text-[10px] text-stone-500 shrink-0">
                            {formatRelativeTime(video.published_at || video.created_at)}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-[13px] font-bold text-stone-100 group-hover/videocard:text-red-400 transition-colors line-clamp-2 leading-snug">
                          {video.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Bottom Meta */}
                    <div className="px-2.5 py-1.5 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                      <span className="truncate max-w-[100px] text-stone-400 font-medium">
                        {video.author_name || 'विशेष संवाददाता'}
                      </span>
                      <span className="flex items-center gap-1 text-stone-400">
                        <Eye className="w-3 h-3 text-red-500" />
                        {video.view_count || 1200}
                      </span>
                    </div>
                  </div>
                  {videoAd && (idx === 3 || idx === 7) && renderVideoAdCard(`vid-ad-mid-${idx}`)}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
            <div className="bg-stone-900 rounded-lg max-w-4xl w-full overflow-hidden border border-stone-800 shadow-2xl relative">
              <div className="p-3 bg-stone-950 flex items-center justify-between border-b border-stone-800">
                <div className="flex items-center gap-2 pr-3">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-white truncate">
                    {activeVideo.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1 text-stone-400 hover:text-white rounded cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-[16/9] w-full bg-black flex items-center justify-center overflow-hidden">
                {activeVideo.video_url && isYouTubeUrl(activeVideo.video_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(activeVideo.video_url, true) || ''}
                    title={activeVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeVideo.video_url ? (
                  <video
                    src={activeVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    आपका ब्राउज़र वीडियो टैग का समर्थन नहीं करता है।
                  </video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-stone-300">
                    <Play className="w-16 h-16 text-red-600 mb-3" />
                    <p className="font-bold text-lg">{activeVideo.title}</p>
                    <p className="text-xs text-stone-400 mt-1">वीडियो उपलब्ध नहीं है।</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-stone-900">
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeVideo.excerpt}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
                  <span>संवाददाता: {activeVideo.author_name}</span>
                  <button
                    onClick={() => {
                      const v = activeVideo;
                      setActiveVideo(null);
                      onOpenArticle(v);
                    }}
                    className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                  >
                    पूरा लेख एवं तस्वीरें देखें &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CategoryPopupModal for Videos */}
        <CategoryPopupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="वीडियो समाचार (Video Ground Reports)"
          categorySlug="video-news"
          articles={allVideoArticles}
          onOpenArticle={(art) => {
            setIsModalOpen(false);
            if (art.video_url) {
              setActiveVideo(art);
            } else {
              onOpenArticle(art);
            }
          }}
          onPlayVideo={(art) => {
            setIsModalOpen(false);
            setActiveVideo(art);
          }}
          accentColor="bg-red-600"
          categoryIcon={<Radio className="w-5 h-5 text-red-600 animate-pulse" />}
        />
      </section>
    </>
  );
};
