import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Phone, MapPin, Send, CheckCircle2, 
  Megaphone, Lightbulb, FileText, AlertCircle, 
  MessageSquare, MessageCircle, Clock, ShieldCheck
} from 'lucide-react';

export type ContactInquiryType = 'advertisement' | 'suggestion' | 'press' | 'complaint' | 'general';

interface ContactModalProps {
  onClose: () => void;
  initialType?: ContactInquiryType;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose, initialType = 'general' }) => {
  const [inquiryType, setInquiryType] = useState<ContactInquiryType>(initialType);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: initialType === 'advertisement' 
      ? 'विज्ञापन संबंधी पूछताछ (Advertisement Inquiry)' 
      : 'सामान्य पूछताछ (General Inquiry)',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update initial subject when inquiry type changes
  const handleTypeChange = (type: ContactInquiryType) => {
    setInquiryType(type);
    let defaultSubject = '';
    if (type === 'advertisement') defaultSubject = 'विज्ञापन संबंधी पूछताछ (Advertisement Inquiry)';
    else if (type === 'suggestion') defaultSubject = 'वेबसाइट एवं सामग्री सुधार हेतु सुझाव (Suggestion & Feedback)';
    else if (type === 'press') defaultSubject = 'प्रेस रिलीज / समाचार विज्ञप्ति (Press Release)';
    else if (type === 'complaint') defaultSubject = 'शिकायत / सुधार अनुरोध (Grievance / Correction)';
    else defaultSubject = 'सामान्य पूछताछ (General Inquiry)';

    setFormData(prev => ({
      ...prev,
      subject: defaultSubject
    }));
  };

  // Keyboard Escape listener & Body scroll lock for seamless mobile/tablet experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent body scrolling behind modal on mobile & tablet
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    } catch (err: any) {
      setErrorMsg('सर्वर से संपर्क नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-2xl bg-white text-stone-900 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] sm:max-h-[88vh] border border-stone-800/20 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header - NEVER pushed off screen on mobile or tablet */}
        <div className="shrink-0 bg-stone-950 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-stone-800 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
              BL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {inquiryType === 'advertisement' ? 'विज्ञापन हेतु संपर्क करें' : 'BLACK LENS से संपर्क करें'}
                </h2>
                <span className="hidden sm:inline-block text-[10px] bg-red-600/90 text-white font-semibold px-1.5 py-0.5 rounded">
                  {inquiryType === 'advertisement' ? 'ADVERTISE' : 'CONTACT'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">
                {inquiryType === 'advertisement' 
                  ? 'डिजिटल विज्ञापन, बैनर स्लॉट व ब्रांड प्रमोशन' 
                  : 'संपादकीय, विज्ञापन, प्रेस रिलीज या पाठक सुझाव'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            aria-label="बंद करें"
            title="बंद करें (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 overscroll-contain">
          {submitted ? (
            <div className="text-center py-8 sm:py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-stone-900">धन्यवाद! आपका संदेश दर्ज हो गया है।</h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  आपकी इंक्वायरी सीधे <strong className="text-stone-900">BLACK LENS</strong> के एडमिन डेस्क तक पहुंच गई है। हमारी संपादकीय अथवा विज्ञापन टीम आपसे अतिशीघ्र संपर्क करेगी।
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 max-w-md mx-auto text-xs text-stone-600 text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">संदर्भ / विषय:</span>
                  <span className="font-semibold text-stone-800">{formData.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">प्रेषक:</span>
                  <span className="font-semibold text-stone-800">{formData.name}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <span>विंडो बंद करें</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Inquiry Type Tabs - Mobile Friendly Wrap */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  पूछताछ का विषय चुनें:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('advertisement')}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                      inquiryType === 'advertisement'
                        ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5 shrink-0" />
                    <span>विज्ञापन (Ads)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('general')}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                      inquiryType === 'general'
                        ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>सामान्य संपर्क</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('suggestion')}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                      inquiryType === 'suggestion'
                        ? 'bg-purple-600 text-white border-purple-700 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>सुझाव</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('press')}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                      inquiryType === 'press'
                        ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>प्रेस रिलीज</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('complaint')}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all col-span-2 sm:col-span-1 ${
                      inquiryType === 'complaint'
                        ? 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>शिकायत</span>
                  </button>
                </div>
              </div>

              {/* Quick Direct Contacts for Mobile/Tablet users */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-stone-600 flex-wrap">
                  <a 
                    href="tel:+911204567890" 
                    className="flex items-center gap-1 text-stone-700 hover:text-emerald-700 font-medium py-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+91 120 4567890</span>
                  </a>
                  <span className="text-stone-300 hidden sm:inline">|</span>
                  <a 
                    href="mailto:contact@blacklens.com" 
                    className="flex items-center gap-1 text-stone-700 hover:text-cyan-700 font-medium py-1"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-600" />
                    <span>contact@blacklens.com</span>
                  </a>
                  <span className="text-stone-300 hidden sm:inline">|</span>
                  <a 
                    href="https://wa.me/919876543210" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium py-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>व्हाट्सएप</span>
                  </a>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>राजनगर, गाजियाबाद (उप्र)</span>
                </div>
              </div>

              {/* Contact / Ad Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      आपका नाम *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="पूरा नाम दर्ज करें"
                      className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      ईमेल पता *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      फोन / व्हाट्सएप नंबर
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      विषय / संदर्भ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {inquiryType === 'advertisement'
                      ? 'विज्ञापन का विवरण एवं आवश्यकता * (बैनर स्लॉट, अवधि, व्यवसाय का नाम)'
                      : inquiryType === 'suggestion'
                      ? 'आपका सुझाव एवं विचार *'
                      : inquiryType === 'press'
                      ? 'प्रेस विज्ञप्ति का संपूर्ण पाठ *'
                      : inquiryType === 'complaint'
                      ? 'शिकायत / सुधार का संपूर्ण विवरण *'
                      : 'संदेश अथवा पूछताछ का विवरण *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={
                      inquiryType === 'advertisement'
                        ? 'होमपेज बैनर स्लॉट, साइडबार, स्पॉन्सर्ड आर्टिकल या वीडियो विज्ञापन हेतु अपनी आवश्यकता, बजट व संपर्क विवरण लिखें...'
                        : inquiryType === 'suggestion'
                        ? 'ब्लैक लेंस पोर्टल, कवरेज एवं प्रस्तुतीकरण को बेहतर बनाने हेतु अपने मूल्यवान सुझाव यहाँ साझा करें...'
                        : 'अपना संदेश विस्तारपूर्वक यहाँ लिखें...'
                    }
                    className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none bg-white leading-relaxed"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'संदेश भेजा जा रहा है...' : 'संदेश भेजें (Submit to Admin)'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
