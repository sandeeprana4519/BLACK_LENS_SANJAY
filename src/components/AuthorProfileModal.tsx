import React, { useEffect, useState } from 'react';
import { 
  X, MapPin, Calendar, FileText, ChevronRight, 
  Eye, ShieldCheck, Newspaper, UserCheck, Loader2
} from 'lucide-react';
import { Article } from '../types';

export interface AuthorPublicProfile {
  id: number;
  name: string;
  avatar_url: string;
  role_name: string;
  bio: string;
  assigned_region: string;
  joined_at: string;
  total_articles: number;
  recent_articles: {
    id: number;
    title: string;
    slug: string;
    featured_image?: string;
    category_name?: string;
    published_at?: string;
    view_count?: number;
  }[];
}

interface AuthorProfileModalProps {
  authorId?: number;
  authorName?: string;
  authorAvatar?: string;
  authorLocation?: string;
  onClose: () => void;
  onSelectArticle?: (article: any) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  authorId,
  authorName,
  authorAvatar,
  authorLocation,
  onClose,
  onSelectArticle
}) => {
  const [profile, setProfile] = useState<AuthorPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const identifier = authorId ? String(authorId) : encodeURIComponent(authorName || '');
        const res = await fetch(`/api/authors/${identifier}`);
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.profile) {
            setProfile(data.profile);
          } else {
            // Graceful fallback profile using passed props
            setProfile({
              id: authorId || 1,
              name: authorName || 'ब्लैक लेंस संवाददाता',
              avatar_url: authorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
              role_name: 'संवाददाता / डेस्क पत्रकार',
              bio: 'ब्लैक लेंस डिजिटल मीडिया हाउस - निष्पक्ष, निर्भीक एवं विश्वसनीय स्थानीय व राष्ट्रीय पत्रकारिता।',
              assigned_region: authorLocation || 'गाजियाबाद / दिल्ली एनसीआर',
              joined_at: 'सत्यापित पत्रकार',
              total_articles: 1,
              recent_articles: []
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setProfile({
            id: authorId || 1,
            name: authorName || 'ब्लैक लेंस संवाददाता',
            avatar_url: authorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
            role_name: 'संवाददाता / डेस्क पत्रकार',
            bio: 'ब्लैक लेंस डिजिटल मीडिया हाउस - निष्पक्ष, निर्भीक एवं विश्वसनीय स्थानीय व राष्ट्रीय पत्रकारिता।',
            assigned_region: authorLocation || 'गाजियाबाद / दिल्ली एनसीआर',
            joined_at: 'सत्यापित पत्रकार',
            total_articles: 1,
            recent_articles: []
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [authorId, authorName, authorAvatar, authorLocation]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeAvatar = profile?.avatar_url || authorAvatar;
  const activeName = profile?.name || authorName || 'ब्लैक लेंस संवाददाता';

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-stone-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">संवाददाता एवं संपादक प्रोफ़ाइल</h2>
              <p className="text-[10px] text-red-100 font-sans">ब्लैक लेंस डिजिटल मीडिया वेरिफाइड जर्नलिस्ट डेस्क</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <p className="text-xs font-semibold">संवाददाता विवरण लोड हो रहा है...</p>
            </div>
          ) : (
            <>
              {/* Profile Top Banner & Identity Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-5 border-b border-stone-200 text-center sm:text-left">
                {/* Large Profile Picture */}
                <div className="relative shrink-0">
                  {activeAvatar ? (
                    <img 
                      src={activeAvatar} 
                      alt={activeName} 
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-red-600 shadow-md ring-4 ring-red-50"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white ring-4 ring-red-100">
                      {activeName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span 
                    className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs" 
                    title="सत्यापित पत्रकारिता खाता"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Name, Designation & Badges */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      {activeName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                        <Newspaper className="w-3 h-3 text-red-700" />
                        {profile?.role_name || 'फील्ड रिपोर्टर'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        सत्यापित पत्रकार (Verified)
                      </span>
                    </div>
                  </div>

                  {/* Metadata Chips (Location, Joined, Total Stories) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-stone-600">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-md border border-stone-200">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="truncate">
                        <strong>कार्यक्षेत्र:</strong> {profile?.assigned_region || authorLocation || 'गाजियाबाद / एनसीआर'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-md border border-stone-200">
                      <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="truncate">
                        <strong>सदस्यता:</strong> {profile?.joined_at || 'सक्रिय रिपोर्टर'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Intro Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-3.5 bg-red-600 rounded-xs" />
                  <span>पत्रकारिता परिचय एवं कार्यक्षेत्र (About Journalist):</span>
                </h4>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                  {profile?.bio || 'ब्लैक लेंस डिजिटल मीडिया हाउस के साथ गाजियाबाद, उत्तर प्रदेश और राष्ट्रीय खबरों का निष्पक्ष एवं सटीक संकलन व प्रसारण।'}
                </div>
              </div>

              {/* Recent Stories Published by this Author */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>संवाददाता द्वारा हालिया खबरें (Published Stories):</span>
                  </h4>
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {profile?.total_articles || profile?.recent_articles?.length || 0} प्रकाशित समाचार
                  </span>
                </div>

                {profile?.recent_articles && profile.recent_articles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.recent_articles.map((story) => (
                      <div
                        key={story.id}
                        onClick={() => {
                          if (onSelectArticle) {
                            onSelectArticle(story);
                            onClose();
                          }
                        }}
                        className="group flex gap-3 p-2.5 bg-stone-50 hover:bg-red-50/50 rounded-lg border border-stone-200 hover:border-red-300 transition-all cursor-pointer shadow-2xs"
                      >
                        {story.featured_image ? (
                          <img 
                            src={story.featured_image} 
                            alt={story.title} 
                            className="w-16 h-14 rounded object-cover shrink-0 border border-stone-200 group-hover:scale-102 transition-transform" 
                          />
                        ) : (
                          <div className="w-16 h-14 rounded bg-stone-200 flex items-center justify-center text-[10px] text-stone-500 shrink-0 font-bold">
                            BL
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <h5 className="text-xs font-bold text-stone-900 group-hover:text-red-700 line-clamp-2 leading-snug transition-colors">
                            {story.title}
                          </h5>
                          <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                            <span className="text-red-700 font-semibold">{story.category_name || 'समाचार'}</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5" />
                              {story.view_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-center text-xs text-stone-500">
                    संवाददाता द्वारा वर्तमान में यह समाचार प्रस्तुत किया गया है।
                  </div>
                )}
              </div>

              {/* Ethics / Trust Note */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-stone-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>सत्यनिष्ठा प्रमाण:</strong> ब्लैक लेंस डिजिटल मीडिया आचार संहिता 2026 के अंतर्गत प्रमाणित। यह संवाददाता स्वतंत्र एवं निष्पक्ष पत्रकारिता मानकों का अनुपालन करते हुए ग्राउंड रिपोर्टिंग प्रस्तुत करता/करती है।
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer with Close Button */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            © ब्लैक लेंस डिजिटल मीडिया नेटवर्क
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            समाचार पढ़ना जारी रखें &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
