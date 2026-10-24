import React, { useState, useRef } from 'react';
import { 
  X, Calendar, Clock, MapPin, Eye, Share2, 
  Copy, Check, MessageCircle, Twitter, Facebook,
  ChevronRight, ChevronLeft, ArrowLeft, Image as ImageIcon, Volume2,
  Layers, UserCheck
} from 'lucide-react';
import { Article, Advertisement } from '../types';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/video';
import { AuthorProfileModal } from './AuthorProfileModal';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onOpenArticle: (article: Article) => void;
  onSelectCategory: (slug: string) => void;
  advertisement?: Advertisement;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onOpenArticle,
  onSelectCategory,
  advertisement
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showAuthorProfile, setShowAuthorProfile] = useState(false);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  // Extract up to 5 images for the article (featured image + gallery images)
  const rawGallery = Array.isArray(article.gallery_images) ? article.gallery_images.filter(Boolean) : [];
  const allImages: string[] = [];
  if (article.featured_image) {
    allImages.push(article.featured_image);
  }
  for (const img of rawGallery) {
    if (!allImages.includes(img)) {
      allImages.push(img);
    }
  }
  const displayImages = allImages.length > 0 
    ? allImages.slice(0, 5) 
    : (article.featured_image ? [article.featured_image] : []);

  const scrollToImage = (index: number) => {
    if (galleryScrollRef.current) {
      const container = galleryScrollRef.current;
      const targetScroll = index * container.clientWidth;
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setCurrentImageIdx(index);
    }
  };

  const handleNextImage = () => {
    if (displayImages.length <= 1) return;
    const nextIdx = (currentImageIdx + 1) % displayImages.length;
    scrollToImage(nextIdx);
  };

  const handlePrevImage = () => {
    if (displayImages.length <= 1) return;
    const prevIdx = (currentImageIdx - 1 + displayImages.length) % displayImages.length;
    scrollToImage(prevIdx);
  };

  const handleGalleryScroll = () => {
    if (galleryScrollRef.current) {
      const container = galleryScrollRef.current;
      const width = container.clientWidth || 1;
      const newIdx = Math.round(container.scrollLeft / width);
      if (newIdx !== currentImageIdx && newIdx >= 0 && newIdx < displayImages.length) {
        setCurrentImageIdx(newIdx);
      }
    }
  };

  const articleUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${article.slug}` : `https://blacklens.co.in/news/${article.slug}`;

  // Dynamic client-side SEO synchronization for open article
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const previousTitle = document.title;
    const descMeta = document.querySelector('meta[name="description"]');
    const previousDesc = descMeta?.getAttribute('content') || '';
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonicalLink?.getAttribute('href') || '';

    const cleanExcerpt = (article.seo_description || article.excerpt || article.content || '').replace(/<[^>]*>?/gm, '').slice(0, 160).trim();
    const newTitle = `${article.seo_title || article.title} | ब्लैक लेंस`;

    document.title = newTitle;
    if (descMeta) {
      descMeta.setAttribute('content', cleanExcerpt);
    }
    if (canonicalLink) {
      canonicalLink.setAttribute('href', articleUrl);
    }

    // Inject JSON-LD Schema for NewsArticle
    let scriptTag = document.getElementById('news-article-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'news-article-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "headline": article.title,
      "description": cleanExcerpt,
      "image": [article.featured_image || `${window.location.origin}/logo.svg`],
      "datePublished": article.published_at || article.created_at || new Date().toISOString(),
      "dateModified": article.updated_at || article.published_at || article.created_at || new Date().toISOString(),
      "articleSection": article.category_name || "समाचार",
      "inLanguage": "hi-IN",
      "author": [{
        "@type": "Person",
        "name": article.author_name || "ब्लैक लेंस ब्यूरो"
      }],
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": "ब्लैक लेंस (Black Lens)",
        "url": window.location.origin,
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.svg`
        }
      }
    };
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = previousTitle;
      if (descMeta) descMeta.setAttribute('content', previousDesc);
      if (canonicalLink) canonicalLink.setAttribute('href', previousCanonical);
      const injected = document.getElementById('news-article-jsonld');
      if (injected) injected.remove();
    };
  }, [article, articleUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = async () => {
    // 1. If native share is supported (mobile devices), share directly with image if possible
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (article.featured_image) {
          try {
            const resp = await fetch(article.featured_image);
            if (resp.ok) {
              const blob = await resp.blob();
              const file = new File([blob], `${article.slug || 'news'}.jpg`, { type: blob.type || 'image/jpeg' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: article.title,
                  text: `*${article.title}*\n\n${article.excerpt || ''}\n\nपूरी खबर व तस्वीरें देखें:\n${articleUrl}`,
                  files: [file]
                });
                return;
              }
            }
          } catch (e) {
            // fallback to URL share
          }
        }
        await navigator.share({
          title: article.title,
          text: `*${article.title}*\n\n${article.excerpt || ''}\n\nपूरी खबर व तस्वीरें देखें:\n${articleUrl}`
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 2. WhatsApp Direct Link fallback (loads OpenGraph rich card with image generated by server)
    const text = encodeURIComponent(
      `*${article.title}*\n\n${article.excerpt ? article.excerpt + '\n\n' : ''}पूरी खबर व तस्वीरें देखें:\n${articleUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(article.title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  // Format Hindi Date
  const formatPublishedDate = (isoString?: string) => {
    if (!isoString) return 'आज';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white text-stone-900 w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden my-auto relative flex flex-col max-h-[96vh]">
        
        {/* Sticky Top Bar with Close & Share Buttons */}
        <div className="sticky top-0 z-20 bg-stone-950 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800 shadow-sm">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>वापस जाएं (Back)</span>
          </button>

          {/* Social quick share bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer"
              title="व्हाट्सऐप पर शेयर करें"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleTwitterShare}
              className="p-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors cursor-pointer"
              title="X / Twitter पर शेयर करें"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleFacebookShare}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
              title="Facebook पर शेयर करें"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-xs px-2 py-1.5 rounded transition-colors cursor-pointer"
              title="लिंक कॉपी करें"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'कॉपी हो गया' : 'कॉपी लिंक'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-white ml-2 rounded cursor-pointer"
              aria-label="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Content */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-stone-500 flex-wrap">
            <span onClick={onClose} className="hover:text-red-700 cursor-pointer">होम</span>
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => {
                if (article.category_slug) onSelectCategory(article.category_slug);
                onClose();
              }}
              className="text-red-700 font-semibold hover:underline cursor-pointer"
            >
              {article.category_name || 'विशेष खबर'}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-400 truncate max-w-[200px] sm:max-w-md">{article.title}</span>
          </nav>

          {/* Category kicker */}
          <div className="flex items-center gap-2">
            <span className="bg-red-700 text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase">
              {article.category_name}
            </span>
            {article.is_breaking && (
              <span className="bg-stone-900 text-red-400 border border-red-500/50 text-xs font-bold px-2 py-0.5 rounded">
                ⚡ ब्रेकिंग स्टोरी
              </span>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-950 headline-font leading-tight">
            {article.title}
          </h1>

          {/* Optional Subtitle / Summary */}
          {article.subtitle && (
            <p className="text-base sm:text-lg text-stone-700 font-medium leading-relaxed border-l-4 border-red-600 pl-3">
              {article.subtitle}
            </p>
          )}

          {/* Author Byline & Timestamps */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-stone-200 text-xs sm:text-sm text-stone-600 bg-stone-50 px-3.5 rounded">
            {/* Clickable Author Byline (Opens Journalist Profile Modal) */}
            <button
              type="button"
              onClick={() => setShowAuthorProfile(true)}
              className="flex items-center gap-3 text-left group cursor-pointer p-1 -m-1 rounded-lg hover:bg-white hover:shadow-xs border border-transparent hover:border-stone-200 transition-all focus:outline-none"
              title="संवाददाता / संपादक की प्रोफ़ाइल एवं विवरण देखने के लिए क्लिक करें"
            >
              <div className="relative shrink-0">
                {article.author_avatar ? (
                  <img
                    src={article.author_avatar}
                    alt={article.author_name || 'लेखक'}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
                    }}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-sm shadow-xs font-sans shrink-0 group-hover:scale-105 transition-transform">
                    {article.author_name ? article.author_name.slice(0, 2).toUpperCase() : 'BL'}
                  </div>
                )}
                <span 
                  className="absolute -bottom-1 -right-1 bg-red-600 group-hover:bg-red-700 text-white p-0.5 rounded-full border-2 border-white shadow-xs transition-colors"
                  title="प्रोफ़ाइल देखें"
                >
                  <UserCheck className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-stone-900 group-hover:text-red-700 transition-colors flex items-center gap-1.5">
                  <span className="truncate">{article.author_name || 'BLACK LENS विशेष डेस्क'}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 bg-red-50 text-red-700 rounded border border-red-200 group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
                    प्रोफ़ाइल देखें ↗
                  </span>
                </span>
                {/* पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist) right under their name */}
                <p className="text-[11px] text-stone-600 line-clamp-1 italic max-w-md mt-0.5 font-sans">
                  {article.author_bio || 'ब्लैक लेंस डिजिटल मीडिया हाउस के साथ निष्पक्ष एवं सटीक पत्रकारिता।'}
                </p>
                <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                  <span>{article.location || 'गाजियाबाद / नई दिल्ली'}</span>
                  {article.author_role && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-stone-600">{article.author_role}</span>
                    </>
                  )}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-3 text-stone-500 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {formatPublishedDate(article.published_at || article.created_at)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                {article.view_count || 1850} बार पढ़ा गया
              </span>
            </div>
          </div>

          {/* Featured Images: Horizontal Scrollable / Swipeable Gallery (1 से 5 तस्वीरें - साइड स्क्रॉलिंग) */}
          {displayImages.length <= 1 ? (
            <div className="space-y-2">
              <div 
                onClick={() => displayImages[0] && setSelectedGalleryImg(displayImages[0])}
                className="aspect-[16/9] w-full rounded-md overflow-hidden bg-stone-100 shadow-xs cursor-pointer group"
              >
                <img
                  src={displayImages[0] || article.featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80'}
                  alt={article.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              {(article.image_caption || article.image_credit) && (
                <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 px-1 italic">
                  <span>{article.image_caption || 'तस्वीर: प्रतीकात्मक'}</span>
                  {article.image_credit && (
                    <span className="font-semibold text-stone-600">फोटो साभार: {article.image_credit}</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Horizontal Scroll / Swipe Container (जैसे कि हाथ से करने पर साइड होती चली जाए) */}
              <div className="relative group rounded-lg overflow-hidden bg-stone-950 shadow-md">
                <div
                  ref={galleryScrollRef}
                  onScroll={handleGalleryScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar select-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {displayImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGalleryImg(imgUrl)}
                      className="w-full shrink-0 snap-center aspect-[16/9] relative cursor-pointer overflow-hidden bg-stone-900 flex items-center justify-center"
                    >
                      <img
                        src={imgUrl}
                        alt={`${article.title} - तस्वीर ${idx + 1}`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover select-none"
                        draggable={false}
                      />
                      {/* Current image watermark */}
                      <span className="absolute bottom-3 right-3 bg-stone-950/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded border border-stone-700 shadow-md pointer-events-none">
                        तस्वीर {idx + 1} / {displayImages.length}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Left Arrow Button */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-950/80 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer z-10 opacity-90 hover:opacity-100"
                  aria-label="पिछली तस्वीर देखें"
                  title="पिछली तस्वीर"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Arrow Button */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-950/80 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer z-10 opacity-90 hover:opacity-100"
                  aria-label="अगली तस्वीर देखें"
                  title="अगली तस्वीर"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Top Overlay Badge: Multiple Images & Swipe Hint */}
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-stone-700 select-none pointer-events-none">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{displayImages.length} तस्वीरें · साइड में स्वाइप करें</span>
                </div>

                {/* Bottom Dots Indicator */}
                <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
                  {displayImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentImageIdx === idx 
                          ? 'w-6 bg-red-600 shadow-sm' 
                          : 'w-1.5 bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Thumbnail Strip for Fast Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {displayImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToImage(idx)}
                    className={`relative w-16 sm:w-20 aspect-[16/10] rounded overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      currentImageIdx === idx 
                        ? 'border-red-600 scale-105 shadow-sm ring-1 ring-red-400' 
                        : 'border-stone-300 opacity-60 hover:opacity-100'
                    }`}
                    title={`तस्वीर ${idx + 1}`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] px-1 font-bold">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Caption and Credit */}
              {(article.image_caption || article.image_credit) && (
                <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 px-1 italic">
                  <span>{article.image_caption || 'तस्वीर: प्रतीकात्मक'}</span>
                  {article.image_credit && (
                    <span className="font-semibold text-stone-600">फोटो साभार: {article.image_credit}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Article Excerpt / Highlight Box */}
          <div className="bg-amber-50/70 border-l-4 border-amber-600 p-4 rounded-r text-stone-800 text-sm sm:text-base font-semibold leading-relaxed">
            {article.excerpt}
          </div>

          {/* Full Rich Article Content */}
          <div 
            className="prose prose-stone max-w-none text-stone-800 leading-relaxed text-base sm:text-lg space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Video Player if article has video */}
          {article.video_url && (
            <div className="my-6 p-4 bg-stone-950 rounded-lg text-white">
              <h3 className="text-sm font-bold text-red-400 mb-2">संबंधित वीडियो रिपोर्ट</h3>
              <div className="aspect-[16/9] rounded overflow-hidden bg-black flex items-center justify-center">
                {isYouTubeUrl(article.video_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(article.video_url) || ''}
                    title={article.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={article.video_url}
                    controls
                    className="w-full h-full object-contain"
                  >
                    आपका ब्राउज़र वीडियो टैग का समर्थन नहीं करता है।
                  </video>
                )}
              </div>
            </div>
          )}

          {/* Lightbox Modal for Gallery */}
          {selectedGalleryImg && (
            <div 
              onClick={() => setSelectedGalleryImg(null)}
              className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <img src={selectedGalleryImg} alt="" className="max-w-full max-h-[85vh] object-contain rounded" />
                <button
                  onClick={() => setSelectedGalleryImg(null)}
                  className="absolute top-2 right-2 bg-stone-900 text-white p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Author Byline / About Reporter Signature Card (Clickable) */}
          <div 
            onClick={() => setShowAuthorProfile(true)}
            className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-red-50/40 rounded-xl border border-stone-200 hover:border-red-300 transition-all cursor-pointer my-6 group shadow-2xs"
            title="संवाददाता की पूरी प्रोफ़ाइल व विवरण देखने के लिए क्लिक करें"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {article.author_avatar ? (
                  <img
                    src={article.author_avatar}
                    alt={article.author_name || 'संवाददाता'}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
                    }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-600 shadow-xs group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {article.author_name ? article.author_name.slice(0, 2).toUpperCase() : 'BL'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border-2 border-white shadow-2xs">
                  <UserCheck className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                    {article.author_role || 'संपादक / संवाददाता'}
                  </span>
                  <span className="text-[10px] text-stone-400">·</span>
                  <span className="text-[11px] text-stone-500 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-red-600" />
                    <span>{article.location || 'गाजियाबाद / दिल्ली एनसीआर'}</span>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 group-hover:text-red-700 transition-colors truncate">
                  {article.author_name || 'ब्लैक लेंस विशेष डेस्क'}
                </h4>
                {/* पत्रकारिता परिचय (About Journalist / Bio) */}
                <p className="text-[11px] text-stone-600 italic line-clamp-2 mt-0.5 font-sans">
                  "{article.author_bio || 'ब्लैक लेंस डिजिटल मीडिया हाउस के साथ निष्पक्ष एवं स्वतंत्र पत्रकारिता।'}"
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-red-700 bg-white group-hover:bg-red-700 group-hover:text-white px-3 py-1.5 rounded-lg border border-red-200 transition-all shadow-2xs">
              <span>प्रोफ़ाइल व खबरें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Social Share Box */}
          <div className="bg-stone-50 border border-stone-200 rounded p-4 my-6">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              यह खबर अपने परिचितों के साथ साझा करें:
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>व्हाट्सऐप पर भेजें</span>
              </button>
              <button
                onClick={handleTwitterShare}
                className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-2 rounded transition-colors cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
                <span>X / Twitter</span>
              </button>
              <button
                onClick={handleFacebookShare}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded transition-colors cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold px-3 py-2 rounded transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'लिंक कॉपी हो गया!' : 'लिंक कॉपी करें'}</span>
              </button>
            </div>
          </div>

          {/* In-Article Advertisement Slot */}
          {advertisement && (
            <div className="p-3 bg-stone-100 rounded border border-stone-200 my-6">
              <span className="text-[10px] text-stone-500 uppercase block mb-1">
                प्रायोजित संदेश {advertisement.advertiser_name ? `· ${advertisement.advertiser_name}` : ''}
              </span>
              <a 
                href={advertisement.destination_url} 
                target="_blank" 
                rel="noreferrer" 
                onClick={() => {
                  fetch(`/api/advertisements/${advertisement.id}/click`, { method: 'POST' }).catch(() => {});
                }}
                className="block overflow-hidden rounded"
              >
                <img src={advertisement.image_url} alt={advertisement.title} className="w-full h-32 object-cover" />
              </a>
            </div>
          )}

          {/* Related News Section */}
          {article.related && article.related.length > 0 && (
            <div className="border-t border-stone-200 pt-6">
              <h3 className="text-base sm:text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-red-700 rounded-xs" />
                <span>संबंधित खबरें (Related Stories)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {article.related.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onOpenArticle(rel as any);
                    }}
                    className="group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-[16/10] rounded overflow-hidden bg-stone-100 mb-2">
                      <img src={rel.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                      {rel.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Author / Reporter Profile Modal Popup */}
      {showAuthorProfile && (
        <AuthorProfileModal
          authorId={article.author_id}
          authorName={article.author_name}
          authorAvatar={article.author_avatar}
          authorLocation={article.location}
          onClose={() => setShowAuthorProfile(false)}
          onSelectArticle={(selectedStory) => {
            onOpenArticle(selectedStory);
            setShowAuthorProfile(false);
          }}
        />
      )}
    </div>
  );
};
