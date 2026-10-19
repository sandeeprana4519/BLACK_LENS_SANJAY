import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, Calendar, MapPin, 
  ChevronRight, Lock, ExternalLink,
  Flame, Radio, Eye, UserCheck, Megaphone, Mail
} from 'lucide-react';
import { Category, Tag, Advertisement, SiteSettings } from '../types';

interface NavbarProps {
  categories: Category[];
  tags: Tag[];
  headerAd?: Advertisement;
  settings?: SiteSettings;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onSelectTag: (tagSlug: string) => void;
  onOpenSearch: (query: string) => void;
  onOpenAdmin: () => void;
  onOpenRegister?: () => void;
  onOpenContact: (type?: 'advertisement' | 'suggestion' | 'press' | 'complaint' | 'general') => void;
  onOpenLegal: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  tags,
  headerAd,
  settings,
  selectedCategory,
  onSelectCategory,
  onSelectTag,
  onOpenSearch,
  onOpenAdmin,
  onOpenRegister,
  onOpenContact,
  onOpenLegal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [settings?.header_logo, settings?.site_logo]);
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    // Hindi date formatter
    const now = new Date();
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    setCurrentDateStr(`${dayName}, ${dateNum} ${monthName} ${year}`);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenSearch(searchQuery.trim());
      setSearchOpen(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      {/* 1. TOP INFORMATION BAR */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1 sm:py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          {/* Top Row on Mobile / Left on Desktop: Date & Location */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 text-stone-200 font-medium text-[11px] sm:text-xs whitespace-nowrap">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0" />
              <span>{currentDateStr || 'शुक्रवार, 16 अक्टूबर 2026'}</span>
            </span>
            <span className="hidden sm:inline-block text-stone-600">|</span>
            <span className="hidden sm:flex items-center gap-1 text-stone-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>गाजियाबाद / दिल्ली एनसीआर संस्करण</span>
            </span>
          </div>

          {/* Bottom Row on Mobile / Right on Desktop: Quick Links & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs w-full sm:w-auto">
            {/* Informational Links Group (हमारे बारे में, संपर्क करें, संपादकीय नीति) */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-stone-300 text-[10px] sm:text-xs">
              <button 
                onClick={() => onOpenLegal('about')} 
                className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                हमारे बारे में
              </button>
              <span className="text-stone-600">·</span>
              <button 
                onClick={() => onOpenContact('general')} 
                className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                संपर्क करें
              </button>
              <span className="hidden md:inline-block text-stone-600">·</span>
              <button 
                onClick={() => onOpenLegal('editorial')} 
                className="hidden md:inline-block hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                संपादकीय नीति
              </button>
            </div>

            <span className="hidden sm:inline-block text-stone-700">|</span>

            {/* Portal Actions Group (Smaller, refined button sizes on Mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {onOpenRegister && (
                <button
                  onClick={onOpenRegister}
                  className="flex items-center gap-1 sm:gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                  title="पत्रकार या संपादक के रूप में हमारे साथ जुड़ें (नया पंजीकरण)"
                >
                  <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-950 shrink-0" />
                  <span className="hidden sm:inline">रिपोर्टर / संपादक बनें</span>
                  <span className="sm:hidden">रिपोर्टर बनें</span>
                </button>
              )}

              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 sm:gap-1.5 bg-red-700 hover:bg-red-800 active:scale-95 text-white px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                title="पत्रकार, संपादक एवं व्यवस्थापक लॉगिन"
              >
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                <span>CMS लॉगिन</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRANDING HEADER & AD SLOT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo with Black Lens style Camera Aperture & Bold Typography */}
        <div 
          onClick={() => onSelectCategory(null)}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {(settings?.header_logo || settings?.site_logo) && !logoError ? (
            <img 
              src={settings?.header_logo || settings?.site_logo} 
              alt={settings?.site_name || 'ब्लैक लेंस'} 
              className="h-10 sm:h-12 max-w-[200px] object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-stone-950 flex items-center justify-center p-1 border-2 border-stone-800 shadow-md group-hover:border-red-600 transition-all shrink-0">
              <div className="w-full h-full rounded-full border border-red-600/80 flex items-center justify-center bg-radial from-stone-900 to-black">
                <div className="w-5 h-5 rounded-full border border-cyan-400/80 bg-gradient-to-tr from-cyan-500/30 via-red-500/20 to-amber-400/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
            </div>
          )}

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-950 uppercase font-sans">
                {settings?.site_name ? (
                  <span>{settings.site_name}</span>
                ) : (
                  <>BLACK <span className="text-red-700">LENS</span></>
                )}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-red-700 font-bold tracking-wide">
              {settings?.site_tagline || 'सटीक खबर, पैनी नज़र · डिजिटल न्यूज़ पोर्टल'}
            </p>
          </div>
        </div>

        {/* Header Advertisement Slot (728x90) */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-[620px] h-[75px] bg-stone-100 rounded border border-stone-200 overflow-hidden relative group">
          {headerAd && headerAd.image_url ? (
            <a 
              href={headerAd.destination_url} 
              target="_blank" 
              rel="noreferrer"
              onClick={() => {
                fetch(`/api/advertisements/${headerAd.id}/click`, { method: 'POST' }).catch(() => {});
              }}
              className="w-full h-full block"
            >
              <img 
                src={headerAd.image_url} 
                alt={headerAd.title} 
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-stone-900/80 text-[10px] text-stone-300 px-1 rounded">
                विज्ञापन · {headerAd.advertiser_name}
              </span>
            </a>
          ) : (
            <div className="flex items-center justify-between w-full px-5 py-2">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">प्रायोजित संदेश</span>
                <p className="text-sm font-bold text-stone-800">गाजियाबाद व दिल्ली एनसीआर में व्यापार बढ़ाने के लिए विज्ञापन दें</p>
              </div>
              <button 
                onClick={() => onOpenContact('advertisement')}
                className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors font-medium cursor-pointer shrink-0"
              >
                विज्ञापन हेतु संपर्क
              </button>
            </div>
          )}
        </div>

        {/* Search & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-stone-700 hover:text-red-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="खोजें"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-800 hover:bg-stone-100 rounded transition-colors cursor-pointer"
            aria-label="मेनू खोलें"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* SEARCH FORM EXPANDABLE */}
      {searchOpen && (
        <div className="bg-stone-100 border-t border-b border-stone-300 px-4 py-2.5 transition-all">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="खबर, घटना, नेता, शहर या विषय खोजें..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-stone-900"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer"
            >
              खोजें
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-stone-500 hover:text-stone-800 px-2 text-sm cursor-pointer"
            >
              बंद करें
            </button>
          </form>
        </div>
      )}

      {/* 3. MAIN NAVIGATION BAR */}
      <nav className="bg-stone-950 text-white border-y border-stone-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center overflow-x-auto scrollbar-none py-0.5">
            {/* Home link */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`px-3.5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedCategory === null 
                  ? 'bg-red-700 text-white' 
                  : 'text-stone-200 hover:text-white hover:bg-stone-900'
              }`}
            >
              होम
            </button>

            {/* Dynamic Categories from DB */}
            {categories.slice(0, 12).map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer border-r border-stone-800/80 ${
                    isActive 
                      ? 'bg-red-700 text-white font-bold' 
                      : 'text-stone-200 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  {cat.name_hi}
                </button>
              );
            })}

            {/* Video category */}
            <button
              onClick={() => onSelectCategory('video-news')}
              className={`px-3 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:bg-stone-900 whitespace-nowrap cursor-pointer ${
                selectedCategory === 'video-news' ? 'bg-cyan-900 text-white' : ''
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              वीडियो
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex backdrop-blur-xs">
          <div className="w-[82%] max-w-[320px] bg-stone-950 text-white h-full overflow-y-auto flex flex-col p-4 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-black text-xs">
                  BL
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-wide text-white uppercase font-sans">
                    BLACK <span className="text-red-500">LENS</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                    Media &amp; Entertainment
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edition Info */}
            <div className="bg-stone-900 p-2.5 rounded text-xs text-stone-300 mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>गाजियाबाद / दिल्ली एनसीआर संस्करण</span>
            </div>

            {/* Navigation links */}
            <div className="flex flex-col space-y-1 mb-4">
              <button
                onClick={() => { onSelectCategory(null); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded text-sm font-medium ${selectedCategory === null ? 'bg-red-700 text-white' : 'text-stone-300 hover:bg-stone-900'}`}
              >
                होम पेज
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { onSelectCategory(cat.slug); setMobileMenuOpen(false); }}
                  className={`text-left px-3 py-2 rounded text-sm font-medium flex items-center justify-between ${
                    selectedCategory === cat.slug ? 'bg-red-700 text-white' : 'text-stone-300 hover:bg-stone-900'
                  }`}
                >
                  <span>{cat.name_hi}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              ))}
            </div>

            {/* Quick Actions & CMS Login in drawer */}
            <div className="mt-auto pt-4 border-t border-stone-800 space-y-2">
              {onOpenRegister && (
                <button
                  onClick={() => { onOpenRegister(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 py-2 rounded text-sm font-bold transition-colors shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>रिपोर्टर / संपादक पंजीकरण</span>
                </button>
              )}

              <button
                onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white py-2 rounded text-sm font-semibold transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>पत्रकार / संपादक लॉगिन (CMS)</span>
              </button>

              {/* Dedicated Mobile Contact & Advertise Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => { onOpenContact('advertisement'); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 py-2.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>विज्ञापन हेतु संपर्क</span>
                </button>
                <button
                  onClick={() => { onOpenContact('general'); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 py-2.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>हमसे संपर्क करें</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-center text-stone-400 pt-2 border-t border-stone-800/60">
                <button onClick={() => { onOpenLegal('about'); setMobileMenuOpen(false); }} className="hover:text-white py-1">हमारे बारे में</button>
                <button onClick={() => { onOpenLegal('editorial'); setMobileMenuOpen(false); }} className="hover:text-white py-1">संपादकीय नीति</button>
                <button onClick={() => { onOpenLegal('privacy'); setMobileMenuOpen(false); }} className="hover:text-white py-1">गोपनीयता नीति</button>
                <button onClick={() => { onOpenLegal('terms'); setMobileMenuOpen(false); }} className="hover:text-white py-1">नियम व शर्तें</button>
              </div>
            </div>
          </div>

          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
