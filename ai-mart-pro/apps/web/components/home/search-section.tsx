'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, MicOff, Sparkles, X, Filter, ArrowRight, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, Product, money } from '@/lib/api';
import { ProductCard } from '@/components/aimart-ui';
import { useApp } from '@/lib/app-context';

export interface SearchUnderstood {
  terms: string[];
  max_price: number | null;
  min_price: number | null;
  intent: string[];
  language: string;
  corrections: { original: string; corrected: string }[];
}

export interface SearchResponse {
  query: string;
  understood: SearchUnderstood;
  results: (Product & { score?: number; matchReason?: string })[];
  relaxed: boolean;
  total: number;
  model_version: string;
}

const EXAMPLE_CHIPS = [
  'headphones under 25k',
  'bohat sasta ghari',
  'mechanical keyboard between 5k and 20k',
  'jootay 6000 se kam',
  'best noise cancelling earbuds',
  'smrtwach under 15k'
];

export function SearchSection({ className = '' }: { className?: string }) {
  const { wishlist, toggleWishlist, addToCart, setToast } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Execute Natural Language Search
  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.trim();
    if (!q) {
      setSearchData(null);
      return;
    }

    setLoading(true);
    try {
      const data = await api<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`);
      setSearchData(data);
    } catch (err) {
      console.error('Search failed:', err);
      setToast('Search service temporarily unavailable. Using local catalog.');
    } finally {
      setLoading(false);
    }
  };

  // Voice Recognition Handler
  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setToast('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setToast('🎤 Listening... Speak your query in English or Urdu.');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results?.[0]?.[0]?.transcript;
        if (spoken) {
          setQuery(spoken);
          performSearch(spoken);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setToast('Voice input error. Please try typing your search.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    performSearch(chip);
  };

  const handleClear = () => {
    setQuery('');
    setSearchData(null);
  };

  const understood = searchData?.understood;

  return (
    <section
      id="search"
      className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 scroll-mt-24 ${className}`}
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B7A6C]/10 text-[#0B7A6C] text-xs font-bold uppercase tracking-wider mb-2.5">
          <Sparkles size={12} className="animate-pulse" />
          <span>Semantic Natural Language Engine</span>
        </div>
        <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
          Find Exactly What You Mean
        </h2>
        <p className="font-dmsans text-xs sm:text-sm text-[#737373] mt-1.5">
          Search with real-world phrases, budgets ("under 9k"), intents ("sasta"), Roman Urdu ("jootay", "ghari"), or typos.
        </p>
      </div>

      {/* Main Search Input Bar */}
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performSearch(query);
          }}
          className="relative flex items-center bg-white border border-[#E5E7EB] focus-within:border-[#0B7A6C] focus-within:ring-4 focus-within:ring-[#0B7A6C]/15 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-2 transition-all"
        >
          <div className="pl-3.5 pr-2 text-[#737373]">
            <Search size={20} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'bohat sasta ghari' or 'ANC headphones under 25k'..."
            className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-[#171717] placeholder-[#9ca3af] h-10 px-1"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-[#9ca3af] hover:text-[#171717] transition-colors"
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            title={isListening ? 'Stop listening' : 'Search by voice'}
            aria-label="Voice search"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all mr-1.5 cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-[#F8FAFC] text-[#525252] hover:text-[#0B7A6C] hover:bg-[#E6F4F1]'
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0B7A6C] to-[#09665A] text-white font-manrope font-bold text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Search AI</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Example Query Chips */}
        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap justify-center text-[11px] text-[#737373]">
          <span className="font-semibold text-[#171717] mr-1">Try asking:</span>
          {EXAMPLE_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] hover:border-[#0B7A6C] hover:bg-[#E6F4F1] hover:text-[#0B7A6C] text-[#525252] transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Animated "✨ AI Understood" Chip Row */}
        <AnimatePresence>
          {searchData && understood && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 rounded-2xl bg-[#E6F4F1]/90 border border-[#A7F3D0] shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles size={15} className="text-[#0B7A6C] animate-pulse" />
                <span className="font-manrope font-extrabold text-xs text-[#c2410c] uppercase tracking-wider">
                  AI Understood
                </span>
                <span className="text-[10px] text-[#9a3412] font-mono bg-[#A7F3D0]/50 px-2 py-0.5 rounded-full ml-auto">
                  {searchData.model_version}
                </span>
              </div>

              {/* Dynamic Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Extracted Terms */}
                {understood.terms?.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#A7F3D0] text-[#171717] font-semibold">
                    <Tag size={12} className="text-[#0B7A6C]" />
                    <span>Keywords: {understood.terms.join(', ')}</span>
                  </span>
                )}

                {/* Budget Bounds */}
                {understood.max_price !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#A7F3D0] text-[#b45309] font-bold">
                    <span>Max Budget: Rs. {understood.max_price.toLocaleString()}</span>
                  </span>
                )}

                {understood.min_price !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#A7F3D0] text-[#b45309] font-bold">
                    <span>Min Budget: Rs. {understood.min_price.toLocaleString()}</span>
                  </span>
                )}

                {/* Intent detected */}
                {understood.intent?.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#A7F3D0] text-[#16A34A] font-semibold">
                    <span>Intent: {understood.intent.join(', ')}</span>
                  </span>
                )}

                {/* Language */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#A7F3D0] text-[#525252]">
                  <span>Lang: {understood.language === 'roman_urdu' ? 'Roman Urdu' : 'English'}</span>
                </span>

                {/* Did You Mean / Typo Corrections */}
                {understood.corrections?.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-medium">
                    <AlertCircle size={12} />
                    <span>
                      Did you mean:{' '}
                      <strong>{understood.corrections.map((c) => c.corrected).join(', ')}</strong>
                    </span>
                  </span>
                )}

                {/* Result Count Chip */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B7A6C] text-white font-bold ml-auto">
                  <CheckCircle2 size={12} />
                  <span>{searchData.total} items matched</span>
                  {searchData.relaxed && <span className="text-[10px] opacity-80">(Relaxed)</span>}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results Grid */}
      {searchData && (
        <div className="mt-8">
          {searchData.results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchData.results.map((product) => (
                <div key={product.id} className="relative">
                  {product.matchReason && (
                    <div className="mb-1 text-[10px] font-bold text-[#0B7A6C] bg-[#E6F4F1] px-2 py-0.5 rounded-md inline-block">
                      ✦ {product.matchReason}
                    </div>
                  )}
                  <ProductCard
                    product={product}
                    badge={product.featured ? 'Featured' : undefined}
                    isWished={wishlist.includes(product.id)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    onAddToCart={() => addToCart(product, 1)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-[#737373]">
              <p className="text-sm font-medium">
                No exact products found matching "{searchData.query}".
              </p>
              <p className="text-xs text-[#9ca3af] mt-1">
                Try searching with broader terms, e.g. "headphones" or "shoes".
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default SearchSection;
