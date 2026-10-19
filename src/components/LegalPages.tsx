import React, { useEffect } from 'react';
import { X, Shield, BookOpen, FileText, Award } from 'lucide-react';

interface LegalPagesProps {
  page: string;
  onClose: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const renderContent = () => {
    switch (page) {
      case 'about':
        return (
          <>
            <h2 className="text-xl font-black text-stone-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-red-700" />
              <span>हमारे बारे में (About BLACK LENS)</span>
            </h2>
            <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
              <p>
                <strong>BLACK LENS (Media &amp; Entertainment)</strong> उत्तर प्रदेश, दिल्ली एनसीआर और भारत का एक अग्रणी, निष्पक्ष एवं आधुनिक डिजिटल न्यूज़ व मीडिया नेटवर्क है। हमारा मुख्यालय राजनगर, गाजियाबाद में स्थित है।
              </p>
              <p>
                हमारा विज़न और मिशन आम नागरिक तक प्रामाणिक, सटीक और बिना किसी लाग-लपेट के ज़मीनी खबरें पहुंचाना है। डिजिटल पत्रकारिता के नए दौर में जहां अफवाहें और सनसनीखेज खबरें तेजी से फैलती हैं, वहां ‘BLACK LENS’ का संकल्प है कि हर खबर की तथ्यात्मक जांच के बाद ही उसे प्रकाशित किया जाए।
              </p>
              <h3 className="font-bold text-stone-900 text-base pt-2">हमारी कवरेज के प्रमुख आयाम:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>गाजियाबाद एवं ट्रांस-हिंडन की स्थानीय नगर निकाय, ट्रैफिक और बुनियादी समस्याओं की गहन कवरेज।</li>
                <li>दिल्ली, नोएडा, गुरुग्राम और पूरे एनसीआर के आर्थिक एवं प्रशासनिक फैसले।</li>
                <li>उत्तर प्रदेश सरकार की कल्याणकारी नीतियां, अपराध नियंत्रण और विकास योजनाएं।</li>
                <li>राष्ट्रीय राजनीति, संसद, खेल, विज्ञान, शिक्षा और धर्म-अध्यात्म।</li>
              </ul>
            </div>
          </>
        );

      case 'editorial':
        return (
          <>
            <h2 className="text-xl font-black text-stone-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-red-700" />
              <span>संपादकीय नीति एवं पत्रकारिता आचार संहिता</span>
            </h2>
            <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
              <p>
                BLACK LENS भारत की संवैधानिक स्वतंत्रता और प्रेस काउंसिल ऑफ इंडिया के उच्चतम नैतिक मानकों का पालन करता है:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>तथ्य एवं सटीकता:</strong> किसी भी समाचार को प्रकाशित करने से पूर्व कम से कम दो स्वतंत्र आधिकारिक अथवा विश्वसनीय स्रोतों से सत्यापित किया जाता है।</li>
                <li><strong>निष्पक्षता:</strong> किसी भी राजनीतिक दल, जाति, धर्म अथवा व्यावसायिक समूह के दबाव में आए बिना वस्तुनिष्ठ रिपोर्टिंग।</li>
                <li><strong>भूल सुधार नीति:</strong> यदि किसी भी खबर में कोई तथ्यात्मक त्रुटि उजागर होती है, तो उसे त्वरित रूप से संशोधित किया जाता है और सुधारात्मक नोट संलग्न किया जाता है।</li>
                <li><strong>गोपनीयता एवं संवेदनशीलता:</strong> अपराध, बाल सुरक्षा और पीड़ित व्यक्तियों की पहचान को लेकर सर्वोच्च कानूनी सावधानियों का पालन किया जाता है।</li>
              </ol>
            </div>
          </>
        );

      case 'privacy':
        return (
          <>
            <h2 className="text-xl font-black text-stone-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-700" />
              <span>गोपनीयता नीति (Privacy Policy)</span>
            </h2>
            <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
              <p>
                BLACK LENS पर पाठकों की डिजिटल गोपनीयता हमारी सर्वोच्च प्राथमिकता है। यह नीति बताती है कि जब आप हमारी वेबसाइट का उपयोग करते हैं तो कौन-सी जानकारियां एकत्रित की जाती हैं।
              </p>
              <h3 className="font-bold text-stone-900">1. डेटा संग्रहण</h3>
              <p>
                हम किसी भी अवांछित व्यक्तिगत डेटा को संग्रहित नहीं करते हैं। संपर्क फ़ॉर्म या न्यूज़लेटर सदस्यता के दौरान आपके द्वारा प्रदान किया गया नाम या ईमेल केवल संवाद हेतु सुरक्षित रखा जाता है।
              </p>
              <h3 className="font-bold text-stone-900">2. कुकीज़ एवं एनालिटिक्स</h3>
              <p>
                साइट के प्रदर्शन को बेहतर बनाने और पाठकों की रुचि के अनुसार सामग्री प्रदर्शित करने के लिए मानक ब्राउज़र कुकीज़ का उपयोग किया जाता है।
              </p>
            </div>
          </>
        );

      default:
        return (
          <>
            <h2 className="text-xl font-black text-stone-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-700" />
              <span>नियम एवं शर्तें (Terms & Conditions)</span>
            </h2>
            <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
              <p>
                BLACK LENS पोर्टल की सामग्री (टेक्स्ट, तस्वीरें, वीडियो एवं ग्राफिक्स) कॉपीराइट कानूनों के तहत संरक्षित है। पूर्व लिखित अनुमति के बिना सामग्री का व्यावसायिक पुनः प्रकाशन वर्जित है।
              </p>
            </div>
          </>
        );
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
        <div className="shrink-0 bg-stone-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-stone-800 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center text-white font-black text-[11px] shrink-0">
              BL
            </div>
            <span className="text-sm font-bold text-white tracking-wide">BLACK LENS (Media &amp; Entertainment)</span>
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
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
