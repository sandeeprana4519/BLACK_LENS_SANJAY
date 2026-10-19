import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Eye, Share2, 
  Copy, Check, MessageCircle, Twitter, Facebook,
  ChevronRight, ArrowLeft, Image as ImageIcon, Volume2
} from 'lucide-react';
import { Article, Advertisement } from '../types';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/video';

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

  const articleUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${article.slug}` : `https://blacklens.com/news/${article.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`*${article.title}*\n\nBLACK LENS पर पूरी खबर पढ़ें:\n${articleUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${article.title} - BLACK LENS (Media & Entertainment)`);
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
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-sm shadow-xs font-sans">
                BL
              </div>
              <div>
                <span className="block font-bold text-stone-900">{article.author_name || 'BLACK LENS विशेष डेस्क'}</span>
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                  {article.location || 'गाजियाबाद / नई दिल्ली'}
                </span>
              </div>
            </div>

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

          {/* Featured Image with Caption & Credit */}
          <div className="space-y-2">
            <div className="aspect-[16/9] w-full rounded-md overflow-hidden bg-stone-100 shadow-xs">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
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

          {/* Image Gallery (Up to 10 images) */}
          {article.gallery_images && article.gallery_images.length > 0 && (
            <div className="my-6 border-t border-stone-200 pt-5">
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-red-700" />
                <span>फोटो गैलरी ({article.gallery_images.length} तस्वीरें)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {article.gallery_images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedGalleryImg(imgUrl)}
                    className="aspect-square rounded overflow-hidden cursor-pointer group bg-stone-100"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Gallery ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
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
    </div>
  );
};
