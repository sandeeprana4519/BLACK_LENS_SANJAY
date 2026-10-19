import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Youtube, Facebook, 
  Twitter, Instagram, MessageCircle, ShieldCheck, 
  FileText, Award, ArrowUp
} from 'lucide-react';
import { Category, SiteSettings } from '../types';

interface FooterProps {
  categories: Category[];
  settings?: SiteSettings;
  onSelectCategory: (slug: string) => void;
  onOpenLegal: (page: string) => void;
  onOpenContact: (type?: 'advertisement' | 'suggestion' | 'press' | 'complaint' | 'general') => void;
  onOpenAdmin: () => void;
  onOpenRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  settings,
  onSelectCategory,
  onOpenLegal,
  onOpenContact,
  onOpenAdmin,
  onOpenRegister
}) => {
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [settings?.footer_logo, settings?.site_logo]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-12 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-800">
          
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {(settings?.footer_logo || settings?.site_logo) && !logoError ? (
                <img 
                  src={settings?.footer_logo || settings?.site_logo} 
                  alt={settings?.site_name || 'ब्लैक लेंस'} 
                  className="h-10 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-stone-900 border border-red-600 flex items-center justify-center p-1 shrink-0">
                  <div className="w-4 h-4 rounded-full border border-cyan-400 bg-red-600 animate-pulse" />
                </div>
              )}
              <div>
                <span className="text-2xl font-black text-white uppercase font-sans">
                  {settings?.site_name ? (
                    settings.site_name
                  ) : (
                    <>BLACK <span className="text-red-600">LENS</span></>
                  )}
                </span>
                <span className="text-xs text-red-500 font-bold block tracking-wider">
                  {settings?.site_tagline || 'सटीक खबर, पैनी नज़र · डिजिटल न्यूज़ पोर्टल'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              {settings?.footer_about || 
                'ब्लैक लेंस उत्तर प्रदेश, दिल्ली एनसीआर और देश का एक निर्भीक, विश्वसनीय एवं निष्पक्ष डिजिटल समाचार पोर्टल है। हमारा उद्देश्य जनसरोकारों को शासन तक पहुंचाना और सटीक, तथ्यात्मक सूचना जन-जन तक प्रसारित करना है।'
              }
            </p>

            <div className="pt-2 space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{settings?.contact_address || 'ब्लैक लेंस मीडिया हाउस, प्रेस एंक्लेव, राजनगर, गाजियाबाद, उत्तर प्रदेश - 201002'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a 
                  href={`mailto:${settings?.contact_email || 'contact@blacklens.com'}`} 
                  className="hover:text-cyan-300 transition-colors"
                >
                  {settings?.contact_email || 'contact@blacklens.com'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={`tel:${settings?.contact_phone || '+911204567890'}`} 
                  className="hover:text-emerald-300 transition-colors"
                >
                  {settings?.contact_phone || '+91 120 4567890'}
                </a>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => onOpenContact('general')}
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer transition-colors py-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>ऑनलाइन संपर्क फॉर्म खोलें &rarr;</span>
                </button>
              </div>
            </div>

            {/* Social media channels */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href={settings?.youtube_url || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-red-500 hover:bg-red-700 hover:text-white transition-colors"
                aria-label="यूट्यूब"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={settings?.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="फेसबुक"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings?.twitter_url || 'https://twitter.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-sky-400 hover:bg-sky-500 hover:text-white transition-colors"
                aria-label="ट्विटर"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings?.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-pink-500 hover:bg-pink-600 hover:text-white transition-colors"
                aria-label="इंस्टाग्राम"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings?.whatsapp_channel_url || 'https://whatsapp.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                aria-label="व्हाट्सऐप चैनल"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Categories Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-stone-800">
              प्रमुख श्रेणियां
            </h3>
            <ul className="space-y-1.5 text-xs text-stone-400">
              {categories.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCategory(c.slug)}
                    className="hover:text-red-400 transition-colors cursor-pointer text-left"
                  >
                    {c.name_hi}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: More Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-stone-800">
              अन्य विषय
            </h3>
            <ul className="space-y-1.5 text-xs text-stone-400">
              {categories.slice(7, 14).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCategory(c.slug)}
                    className="hover:text-red-400 transition-colors cursor-pointer text-left"
                  >
                    {c.name_hi}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Policies & CMS */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-stone-800">
              संपादकीय एवं नीतियां
            </h3>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <button 
                  onClick={() => onOpenContact('general')} 
                  className="hover:text-red-400 text-stone-300 font-medium transition-colors cursor-pointer text-left"
                >
                  संपर्क करें (Contact Us)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                  हमारे बारे में (About Us)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('editorial')} className="hover:text-white transition-colors cursor-pointer text-left">
                  संपादकीय नीति (Editorial Policy)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors cursor-pointer text-left">
                  गोपनीयता नीति (Privacy Policy)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors cursor-pointer text-left">
                  नियम और शर्तें (Terms & Conditions)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('disclaimer')} className="hover:text-white transition-colors cursor-pointer text-left">
                  डिस्क्लेमर (Disclaimer)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenContact('advertisement')} 
                  className="hover:text-amber-400 text-stone-300 font-medium transition-colors cursor-pointer text-left"
                >
                  विज्ञापन हेतु संपर्क करें (Advertise)
                </button>
              </li>
              {onOpenRegister && (
                <li className="pt-1.5">
                  <button 
                    onClick={onOpenRegister}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>रिपोर्टर / संपादक बनें (Join Us)</span>
                    <span>&rarr;</span>
                  </button>
                </li>
              )}
              <li className="pt-1">
                <button 
                  onClick={onOpenAdmin}
                  className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>प्रशासन / CMS पोर्टल</span>
                  <span>&rarr;</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & developer credit bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3 border-t border-stone-800/80 mt-6">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 text-center sm:text-left">
            <span className="font-medium text-stone-300 tracking-wide">
              {settings?.copyright_text || '© 2026 ब्लैक लेंस डिजिटल मीडिया (Black Lens). सर्वाधिकार सुरक्षित।'}
            </span>
            <span className="text-stone-600 hidden sm:inline" aria-hidden="true">|</span>
            <span className="text-stone-400 text-xs font-medium">
              Designed by <span className="text-stone-300 font-semibold hover:text-white transition-colors">Happiiz Business Solutions</span>
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>ऊपर जाएं</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
