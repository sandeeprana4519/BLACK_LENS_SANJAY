import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroSection } from './components/HeroSection';
import { CategoryBlock } from './components/CategoryBlock';
import { VideoSection } from './components/VideoSection';
import { ArticleModal } from './components/ArticleModal';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { LegalPages } from './components/LegalPages';
import { AdminPortal } from './components/AdminPortal';
import { Article, Category, Tag, BreakingNewsItem, Advertisement, SiteSettings } from './types';
import { ArrowLeft, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { testConnection } from './firebase';

export function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allPublishedArticles, setAllPublishedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthMode, setAdminAuthMode] = useState<'login' | 'register'>('login');
  const [contactOpen, setContactOpen] = useState(false);
  const [contactInitialType, setContactInitialType] = useState<'advertisement' | 'suggestion' | 'press' | 'complaint' | 'general'>('general');
  const [legalPage, setLegalPage] = useState<string | null>(null);

  const handleOpenContact = (type: 'advertisement' | 'suggestion' | 'press' | 'complaint' | 'general' = 'general') => {
    setContactInitialType(type);
    setContactOpen(true);
  };

  const handleOpenAdmin = () => {
    setAdminAuthMode('login');
    setAdminOpen(true);
  };

  const handleOpenRegister = () => {
    setAdminAuthMode('register');
    setAdminOpen(true);
  };

  // Load initial portal data
  const loadPortalData = async () => {
    try {
      setLoading(true);
      const cacheBust = `?t=${Date.now()}`;

      const [catRes, tagRes, breakRes, adRes, setRes, allNewsRes] = await Promise.all([
        fetch(`/api/categories${cacheBust}`),
        fetch(`/api/tags${cacheBust}`),
        fetch(`/api/breaking-news${cacheBust}`),
        fetch(`/api/advertisements${cacheBust}`),
        fetch(`/api/settings${cacheBust}`),
        fetch(`/api/news?status=published&limit=300&t=${Date.now()}`)
      ]);

      const [catData, tagData, breakData, adData, setData, allNewsData] = await Promise.all([
        catRes.json(),
        tagRes.json(),
        breakRes.json(),
        adRes.json(),
        setRes.json(),
        allNewsRes.json()
      ]);

      if (catData.success) setCategories(catData.data);
      if (tagData.success) setTags(tagData.data);
      if (breakData.success) setBreakingNews(breakData.data);
      if (adData.success) setAdvertisements(adData.data);
      if (setData.success) setSiteSettings(setData.data);
      if (allNewsData.success) {
        setAllPublishedArticles(allNewsData.data);
        if (!selectedCategory && !selectedTag && !searchQuery) {
          setArticles(allNewsData.data);
        }
      }

      // Fetch news articles with current filters
      if (selectedCategory || selectedTag || searchQuery) {
        await fetchNews();
      }
    } catch (err) {
      console.error('Error fetching portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      let url = `/api/news?status=published&limit=300&t=${Date.now()}`;
      if (selectedCategory && selectedCategory !== 'video-news') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      } else if (selectedCategory === 'video-news') {
        url += `&isVideo=true`;
      }
      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
        if (!selectedCategory && !selectedTag && !searchQuery) {
          setAllPublishedArticles(data.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    testConnection();
    loadPortalData();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, selectedTag, searchQuery]);

  // Handle Breaking news click
  const handleBreakingSelect = (title: string, articleId?: number | null) => {
    if (articleId) {
      const found = articles.find(a => a.id === articleId);
      if (found) {
        setActiveArticle(found);
        return;
      }
    }
    // Search by title keywords
    const match = articles.find(a => title.includes(a.title.slice(0, 15)) || a.title.includes(title.slice(0, 15)));
    if (match) {
      setActiveArticle(match);
    } else {
      setSearchQuery(title.slice(0, 20));
      setSelectedCategory(null);
      setSelectedTag(null);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery(null);
  };

  // All configured advertisement placements
  const headerAd = advertisements.find(a => a.placement === 'header_banner');
  const homeTopAd = advertisements.find(a => a.placement === 'home_top');
  const sidebarAd = advertisements.find(a => a.placement === 'sidebar');
  const inFeedAd = advertisements.find(a => a.placement === 'in_feed');
  const articleAd = advertisements.find(a => a.placement === 'article_inline') || inFeedAd;
  const categoryPageAd = advertisements.find(a => a.placement === 'category_page') || inFeedAd;
  const footerAd = advertisements.find(a => a.placement === 'footer_banner');

  // Filtered lists for all categories with category_id and category_slug robustness
  const ghaziabadNews = articles.filter(a => a.category_slug === 'ghaziabad' || a.category_id === 1 || a.location?.includes('गाजियाबाद'));
  const ncrNews = articles.filter(a => a.category_slug === 'delhi-ncr' || a.category_id === 2 || a.location?.includes('दिल्ली') || a.location?.includes('नोएडा') || a.location?.includes('एनसीआर') || a.location?.includes('गुरुग्राम') || a.location?.includes('फरीदाबाद'));
  const politicsNews = articles.filter(a => a.category_slug === 'politics' || a.category_id === 5 || a.category_name?.includes('राजनीति') || a.title?.includes('राजनीति') || a.title?.includes('संसद') || a.title?.includes('चुनाव'));
  const crimeNews = articles.filter(a => a.category_slug === 'crime' || a.category_id === 6 || a.category_name?.includes('अपराध') || a.title?.includes('पुलिस') || a.title?.includes('एसटीएफ') || a.title?.includes('मुठभेड़') || a.title?.includes('गिरोह'));
  const religionNews = articles.filter(a => a.category_slug === 'religion' || a.category_id === 12 || a.category_slug === 'cat-1792242037187' || a.category_id === 1792242037187 || a.category_name?.includes('धर्म') || a.category_name?.includes('संस्कृति') || a.title?.includes('मंदिर') || a.title?.includes('दर्शन') || a.title?.includes('काशी') || a.title?.includes('अयोध्या') || a.title?.includes('वृंदावन'));
  const sportsNews = articles.filter(a => a.category_slug === 'sports' || a.category_id === 10 || a.category_name?.includes('खेल') || a.title?.includes('क्रिकेट') || a.title?.includes('आईपीएल') || a.title?.includes('खिलाड़ी') || a.title?.includes('पहलवान'));
  const upNews = articles.filter(a => a.category_slug === 'uttar-pradesh' || a.category_id === 3 || (a.category_name?.includes('उत्तर प्रदेश') && a.category_slug !== 'delhi-ncr') || a.location?.includes('लखनऊ') || a.location?.includes('कानपुर') || a.location?.includes('झांसी') || a.location?.includes('वाराणसी'));
  const nationalNews = articles.filter(a => a.category_slug === 'india' || a.category_slug === 'national' || a.category_id === 4 || a.category_name?.includes('देश') || a.title?.includes('भारत') || a.title?.includes('नौसेना') || a.title?.includes('जीडीपी'));
  const scienceNews = articles.filter(a => a.category_slug === 'science' || a.category_id === 15 || a.category_slug === 'science-tech' || a.category_slug === 'विज्ञान-और-अंतरिक्ष' || a.category_id === 1792242840323 || a.category_slug === 'space-science' || a.category_name?.includes('विज्ञान') || a.title?.includes('इसरो') || a.title?.includes('अंतरिक्ष') || a.title?.includes('चंद्रयान') || a.title?.includes('गगनयान') || a.title?.includes('टेलीस्कोप'));

  const isFiltering = selectedCategory !== null || selectedTag !== null || searchQuery !== null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans">
      
      {/* 1. PUBLIC WEBSITE HEADER */}
      <Navbar
        categories={categories}
        tags={tags}
        headerAd={headerAd}
        settings={siteSettings}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setSelectedTag(null);
          setSearchQuery(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectTag={(slug) => {
          setSelectedTag(slug);
          setSelectedCategory(null);
          setSearchQuery(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={(q) => {
          setSearchQuery(q);
          setSelectedCategory(null);
          setSelectedTag(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdmin}
        onOpenRegister={handleOpenRegister}
        onOpenContact={handleOpenContact}
        onOpenLegal={(page) => setLegalPage(page)}
      />

      {/* 2. DYNAMIC SCROLLING BREAKING NEWS TICKER */}
      <BreakingTicker
        articles={allPublishedArticles.length > 0 ? allPublishedArticles : articles}
        onOpenArticle={(art) => setActiveArticle(art)}
      />

      {/* 3. MAIN PAGE CONTENT */}
      <main className="flex-1">
        {/* IF FILTERING (CATEGORY, TAG, SEARCH VIEW) */}
        {isFiltering ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Archive Header Banner */}
            <div className="bg-white p-4 sm:p-6 rounded border border-stone-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-semibold mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>मुख्य पृष्ठ पर वापस जाएं</span>
                </button>
                <h1 className="text-xl sm:text-2xl font-black text-stone-950 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-red-700" />
                  {searchQuery ? (
                    <span>खोज परिणाम: "{searchQuery}"</span>
                  ) : selectedCategory ? (
                    <span>
                      {selectedCategory === 'video-news' ? 'वीडियो समाचार' : categories.find(c => c.slug === selectedCategory)?.name_hi || selectedCategory}
                    </span>
                  ) : (
                    <span>टैग: #{tags.find(t => t.slug === selectedTag)?.name || selectedTag}</span>
                  )}
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  कुल {articles.length} समाचार उपलब्ध
                </p>
              </div>

              <button
                onClick={clearFilters}
                className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded font-medium cursor-pointer"
              >
                फ़िल्टर हटाएं (Clear All)
              </button>
            </div>

            {/* Category Page Banner Ad */}
            {categoryPageAd && (
              <div className="bg-stone-200 rounded p-2 text-center overflow-hidden border border-stone-300">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">
                  प्रायोजित विज्ञापन {categoryPageAd.advertiser_name ? `· ${categoryPageAd.advertiser_name}` : ''}
                </span>
                <a
                  href={categoryPageAd.destination_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => fetch(`/api/advertisements/${categoryPageAd.id}/click`, { method: 'POST' }).catch(() => {})}
                  className="block max-h-28 overflow-hidden rounded"
                >
                  <img src={categoryPageAd.image_url} alt={categoryPageAd.title} className="w-full h-28 object-cover" />
                </a>
              </div>
            )}

            {/* Articles Grid */}
            {articles.length === 0 ? (
              <div className="bg-white p-12 rounded border border-stone-200 text-center text-stone-500">
                <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">कोई समाचार नहीं मिला</h3>
                <p className="text-xs text-stone-500 mt-1">कृपया अन्य श्रेणी या खोज शब्द का प्रयास करें।</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer"
                >
                  मुख्य पृष्ठ पर जाएं
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {articles.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className="bg-white rounded border border-stone-200 overflow-hidden group cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] overflow-hidden bg-stone-100 relative">
                        <img
                          src={art.featured_image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {art.location && (
                          <span className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                            {art.location}
                          </span>
                        )}
                      </div>
                      <div className="p-3.5">
                        <span className="text-[11px] font-bold text-red-700 block mb-1">
                          {art.category_name}
                        </span>
                        <h2 className="text-sm font-bold text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h2>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 pt-0 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100 mx-3.5 mb-2">
                      <span className="truncate max-w-[120px]">{art.author_name}</span>
                      <span>{art.view_count || 120} दृश्य</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* HOMEPAGE VIEW (ALL REFERENCE SECTIONS) */
          <div className="space-y-6">
            {/* Top Desktop Banner (970x250) */}
            {homeTopAd && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
                <div className="bg-stone-200 rounded p-2 text-center overflow-hidden border border-stone-300">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">
                    प्रायोजित विज्ञापन {homeTopAd.advertiser_name ? `· ${homeTopAd.advertiser_name}` : ''}
                  </span>
                  <a 
                    href={homeTopAd.destination_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={() => {
                      fetch(`/api/advertisements/${homeTopAd.id}/click`, { method: 'POST' }).catch(() => {});
                    }}
                    className="block max-h-36 sm:max-h-52 overflow-hidden rounded"
                  >
                    <img src={homeTopAd.image_url} alt={homeTopAd.title} className="w-full h-36 sm:h-52 object-cover" />
                  </a>
                </div>
              </div>
            )}

            {/* Section B & C: Featured Lead Stories + Latest Feed */}
            <HeroSection
              articles={articles}
              sidebarAd={sidebarAd}
              settings={siteSettings}
              onOpenArticle={(art) => setActiveArticle(art)}
              onSelectCategory={(slug) => setSelectedCategory(slug)}
            />

            {/* 1. गाजियाबाद विशेष: शहर एवं ट्रांस-हिंडन */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="गाजियाबाद विशेष: शहर एवं ट्रांस-हिंडन"
                categorySlug="ghaziabad"
                articles={ghaziabadNews.length > 0 ? ghaziabadNews : articles.slice(0, 10)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* In-Feed Advertisement Banner */}
            {inFeedAd && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 my-2">
                <div className="bg-stone-200 rounded p-2 text-center overflow-hidden border border-stone-300">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">
                    प्रायोजित विज्ञापन · {inFeedAd.advertiser_name}
                  </span>
                  <a 
                    href={inFeedAd.destination_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={() => {
                      fetch(`/api/advertisements/${inFeedAd.id}/click`, { method: 'POST' }).catch(() => {});
                    }}
                    className="block max-h-28 overflow-hidden rounded"
                  >
                    <img src={inFeedAd.image_url} alt={inFeedAd.title} className="w-full h-28 object-cover" />
                  </a>
                </div>
              </div>
            )}

            {/* 2. उत्तर प्रदेश एवं दिल्ली एनसीआर */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="उत्तर प्रदेश एवं दिल्ली एनसीआर"
                categorySlug="delhi-ncr"
                articles={ncrNews.length > 0 ? ncrNews : articles.slice(1, 11)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* 3. वीडियो समाचार (Video Ground Reports) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <VideoSection
                articles={articles}
                onOpenArticle={(art) => setActiveArticle(art)}
              />
            </div>

            {/* 4. राजनीति एवं राष्ट्रीय घटनाक्रम */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="राजनीति एवं राष्ट्रीय घटनाक्रम"
                categorySlug="politics"
                articles={politicsNews.length > 0 ? politicsNews : articles.slice(2, 12)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* 5. क्राइम डायरी: पुलिस व एसटीएफ कार्यवाही */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="क्राइम डायरी: पुलिस व एसटीएफ कार्यवाही"
                categorySlug="crime"
                articles={crimeNews.length > 0 ? crimeNews : articles.slice(3, 13)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* 6. धर्म, संस्कृति एवं अध्यात्म */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="धर्म, संस्कृति एवं अध्यात्म"
                categorySlug="religion"
                articles={religionNews.length > 0 ? religionNews : articles.slice(4, 14)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* 7. खेल जगत (Sports Arena) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="खेल जगत (Sports Arena)"
                categorySlug="sports"
                articles={sportsNews.length > 0 ? sportsNews : articles.slice(5, 15)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* 8. उत्तर प्रदेश */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="उत्तर प्रदेश"
                categorySlug="uttar-pradesh"
                articles={upNews.length > 0 ? upNews : articles.slice(6, 16)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* 9. देश */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="देश"
                categorySlug="india"
                articles={nationalNews.length > 0 ? nationalNews : articles.slice(7, 17)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* 10. विज्ञान और अंतरिक्ष */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <CategoryBlock
                title="विज्ञान और अंतरिक्ष"
                categorySlug="science"
                articles={scienceNews.length > 0 ? scienceNews : articles.slice(8, 18)}
                onOpenArticle={(art) => setActiveArticle(art)}
                onViewCategory={(slug) => setSelectedCategory(slug)}
              />
            </section>

            {/* Dynamic sections for any other categories with published articles */}
            {categories
              .filter(c => !['ghaziabad', 'delhi-ncr', 'politics', 'crime', 'religion', 'sports', 'uttar-pradesh', 'india', 'national', 'science', 'science-tech', 'विज्ञान-और-अंतरिक्ष', 'space-science'].includes(c.slug))
              .filter(c => articles.some(a => a.category_slug === c.slug || a.category_id === c.id))
              .map(c => {
                const catArticles = articles.filter(a => a.category_slug === c.slug || a.category_id === c.id);
                return (
                  <section key={c.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                    <CategoryBlock
                      title={c.name_hi}
                      categorySlug={c.slug}
                      articles={catArticles}
                      onOpenArticle={(art) => setActiveArticle(art)}
                      onViewCategory={(slug) => setSelectedCategory(slug)}
                    />
                  </section>
                );
              })
            }
          </div>
        )}
      </main>

      {/* Footer Banner Advertisement */}
      {footerAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
          <div className="bg-stone-200 rounded p-2 text-center overflow-hidden border border-stone-300">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">
              प्रायोजित विज्ञापन {footerAd.advertiser_name ? `· ${footerAd.advertiser_name}` : ''}
            </span>
            <a 
              href={footerAd.destination_url} 
              target="_blank" 
              rel="noreferrer" 
              onClick={() => {
                fetch(`/api/advertisements/${footerAd.id}/click`, { method: 'POST' }).catch(() => {});
              }}
              className="block max-h-28 sm:max-h-36 overflow-hidden rounded"
            >
              <img src={footerAd.image_url} alt={footerAd.title} className="w-full h-28 sm:h-36 object-cover" />
            </a>
          </div>
        </div>
      )}

      {/* 4. PUBLIC FOOTER */}
      <Footer
        categories={categories}
        settings={siteSettings}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={(page) => setLegalPage(page)}
        onOpenContact={handleOpenContact}
        onOpenAdmin={handleOpenAdmin}
        onOpenRegister={handleOpenRegister}
      />

      {/* MODAL 1: FULL ARTICLE DETAIL VIEW */}
      {activeArticle && (
        <ArticleModal
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
          onOpenArticle={(art) => setActiveArticle(art)}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug);
            setActiveArticle(null);
          }}
          advertisement={articleAd}
        />
      )}

      {/* MODAL 2: CONTACT US MODAL */}
      {contactOpen && (
        <ContactModal 
          initialType={contactInitialType} 
          onClose={() => setContactOpen(false)} 
        />
      )}

      {/* MODAL 3: LEGAL & EDITORIAL PAGES */}
      {legalPage && (
        <LegalPages page={legalPage} onClose={() => setLegalPage(null)} />
      )}

      {/* MODAL 4: FULL ADMIN / CMS DESK */}
      {adminOpen && (
        <AdminPortal
          onClose={() => setAdminOpen(false)}
          categories={categories}
          tags={tags}
          initialAuthMode={adminAuthMode}
          onRefreshData={() => {
            loadPortalData();
            fetchNews();
          }}
        />
      )}

    </div>
  );
}

export default App;
