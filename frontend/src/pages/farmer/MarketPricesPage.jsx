import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/AppLayout';
import { 
  fetchMarketPrices, 
  fetchMarketCommodities, 
  fetchMarketLocations 
} from '../../api/market';
import { 
  Sprout, 
  Search, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Filter, 
  ChevronRight,
  Info,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Image as ImageIcon,
  Camera,
  ExternalLink
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────────── *
 * MarketPricesPage — AgriChain
 *
 * Displays latest available official mandi/market prices for agricultural
 * commodities sourced from the Government of India Open Government Data (OGD)
 * platform / Directorate of Marketing and Inspection (DMI) / AGMARKNET.
 *
 * Crop photographs are dynamically fetched from the Pexels API (server-side).
 * No images are stored in the repository or database.
 * ──────────────────────────────────────────────────────────────────────────── */

export default function MarketPricesPage() {
  // ── Filter states ──
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [selectedState, setSelectedState]         = useState('Tamil Nadu');
  const [selectedDistrict, setSelectedDistrict]   = useState('Coimbatore');
  const [selectedMarket, setSelectedMarket]       = useState('');

  // ── Data states ──
  const [marketData, setMarketData]             = useState(null);
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [locationHierarchy, setLocationHierarchy] = useState({
    states: [],
    districts_by_state: {},
    markets_by_district: {}
  });

  // ── UI states ──
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Quick-select crop pills
  const popularCommodities = [
    'Tomato', 'Onion', 'Potato', 'Banana', 'Brinjal',
    'Cotton', 'Paddy', 'Carrot', 'Coconut', 'Green Chilli',
    'Mango', 'Watermelon', 'Cauliflower', 'Cabbage', 'Wheat'
  ];

  // ── Initial metadata load ──
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [commoditiesRes, locationsRes] = await Promise.all([
          fetchMarketCommodities(),
          fetchMarketLocations()
        ]);
        if (commoditiesRes?.commodities) setAvailableCommodities(commoditiesRes.commodities);
        if (locationsRes) setLocationHierarchy(locationsRes);
      } catch (err) {
        console.error('Failed to load market metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // ── Fetch prices ──
  const loadPrices = async () => {
    setLoading(true);
    setError(null);
    setImageErrors({});
    try {
      const params = {};
      if (selectedCommodity) params.commodity = selectedCommodity;
      if (selectedState)     params.state     = selectedState;
      if (selectedDistrict)  params.district  = selectedDistrict;
      if (selectedMarket)    params.market    = selectedMarket;

      const data = await fetchMarketPrices(params);
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market prices:', err);
      setError(
        'Unable to fetch the latest market prices right now. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on filter change
  useEffect(() => {
    loadPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommodity, selectedState, selectedDistrict, selectedMarket]);

  // ── Derived dropdowns ──
  const availableDistricts = useMemo(() => {
    if (!selectedState || !locationHierarchy.districts_by_state) return [];
    return locationHierarchy.districts_by_state[selectedState] || [];
  }, [selectedState, locationHierarchy]);

  const availableMarkets = useMemo(() => {
    if (!selectedDistrict || !locationHierarchy.markets_by_district) return [];
    return locationHierarchy.markets_by_district[selectedDistrict] || [];
  }, [selectedDistrict, locationHierarchy]);

  // ── Filter handlers ──
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedMarket('');
  };
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedMarket('');
  };
  const handleResetFilters = () => {
    setSelectedCommodity('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedMarket('');
  };
  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // ── Aggregate stats ──
  const stats = useMemo(() => {
    if (!marketData?.markets?.length) return { total: 0, avgModal: 0, minP: 0, maxP: 0, avgPerKg: 0 };
    const markets = marketData.markets;
    const modals = markets.map(m => m.modal_price);
    const mins   = markets.map(m => m.min_price);
    const maxs   = markets.map(m => m.max_price);
    const avgModal = Math.round(modals.reduce((a, b) => a + b, 0) / markets.length);
    return {
      total:    markets.length,
      avgModal,
      minP:     Math.min(...mins),
      maxP:     Math.max(...maxs),
      avgPerKg: (avgModal / 100).toFixed(2)
    };
  }, [marketData]);

  // ── Top-level image attribution from response ──
  const topImage = marketData?.image || null;

  // ── Helper: pick best image URL for a card ──
  const getCardImage = (market, idx) =>
    !imageErrors[idx] && (market.image_url || topImage?.image_url)
      ? (market.image_url || topImage.image_url)
      : null;

  // ── Helper: attribution data for a card ──
  const getAttribution = (market) => ({
    photographer:     market.photographer     || topImage?.photographer,
    photographer_url: market.photographer_url || topImage?.photographer_url,
    photo_url:        market.photo_url        || topImage?.photo_url,
    provider:         market.image_provider   || topImage?.provider,
  });

  // ── Image provider badge colors ──
  const providerBadgeClass = (provider) => {
    if (provider === 'Pexels')    return 'bg-green-100 text-green-800 border-green-200';
    if (provider === 'Wikipedia') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <AppLayout
      title="🌾 Latest Market Prices (Mandi)"
      subtitle="Official agricultural mandi prices from the Government of India (OGD / AGMARKNET) with real crop photographs."
      breadcrumb="Farmer / Market Prices"
    >
      <div className="space-y-6">

        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-[#075B2A] to-[#0B7A36] text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
            <TrendingUp className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Official AGMARKNET &amp; OGD Datasets</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Latest Mandi Pricing Intelligence
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Transparent, daily-verified agricultural market prices across major Indian wholesale mandis.
              Compare modal, minimum, and maximum rates to negotiate fair wholesale produce sales.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Data Date: <strong>{marketData?.date || '—'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Unit: <strong>₹ / Quintal (100 kg) &amp; ₹ / kg</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Real Crop Photos via Pexels</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Card ── */}
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBF2ED] pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#123524]">
              <Filter className="w-4 h-4 text-[#075B2A]" />
              <span>Filter Mandi Market Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#66756B] hover:text-[#123524] bg-[#F5F8F3] hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={loadPrices}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#075B2A] hover:bg-[#0B7A36] disabled:opacity-50 rounded-xl shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Quick Commodity Pills */}
          <div>
            <label className="block text-xs font-semibold text-[#66756B] mb-2">
              Popular Commodities:
            </label>
            <div className="flex flex-wrap gap-2">
              {popularCommodities.map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCommodity(crop)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-150 ${
                    selectedCommodity.toLowerCase() === crop.toLowerCase()
                      ? 'bg-[#075B2A] text-white border-[#075B2A] shadow-xs scale-105'
                      : 'bg-[#F7FAF5] text-[#123524] border-[#DDE8DF] hover:bg-[#EAF5EC] hover:border-[#075B2A]/40'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Commodity */}
            <div>
              <label className="block text-xs font-bold text-[#123524] uppercase tracking-wider mb-1.5">
                Commodity
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  placeholder="e.g. Tomato, Onion, Banana..."
                  list="commodity-suggestions"
                  className="w-full px-3.5 py-2.5 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-xs sm:text-sm font-medium text-[#123524] focus:outline-none focus:ring-2 focus:ring-[#075B2A]/30 focus:border-[#075B2A] transition-all"
                />
                <datalist id="commodity-suggestions">
                  {availableCommodities.map((c) => <option key={c} value={c} />)}
                </datalist>
                <Sprout className="w-4 h-4 text-[#075B2A] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-[#123524] uppercase tracking-wider mb-1.5">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-xs sm:text-sm font-medium text-[#123524] focus:outline-none focus:ring-2 focus:ring-[#075B2A]/30 focus:border-[#075B2A] transition-all"
              >
                <option value="">All States</option>
                {locationHierarchy.states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-[#123524] uppercase tracking-wider mb-1.5">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedState}
                className="w-full px-3.5 py-2.5 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-xs sm:text-sm font-medium text-[#123524] focus:outline-none focus:ring-2 focus:ring-[#075B2A]/30 focus:border-[#075B2A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">All Districts</option>
                {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Market */}
            <div>
              <label className="block text-xs font-bold text-[#123524] uppercase tracking-wider mb-1.5">
                Specific Mandi
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                disabled={!selectedDistrict}
                className="w-full px-3.5 py-2.5 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-xs sm:text-sm font-medium text-[#123524] focus:outline-none focus:ring-2 focus:ring-[#075B2A]/30 focus:border-[#075B2A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">All Mandis in District</option>
                {availableMarkets.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Aggregate Summary Strip ── */}
        {marketData?.markets?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-[#66756B] uppercase tracking-wider block">Reporting Mandis</span>
              <div className="text-xl sm:text-2xl font-black text-[#123524] mt-1 flex items-baseline gap-1">
                <span>{stats.total}</span>
                <span className="text-xs font-medium text-[#66756B]">Centers</span>
              </div>
            </div>

            <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-[#66756B] uppercase tracking-wider block">Avg Modal Price</span>
              <div className="text-xl sm:text-2xl font-black text-[#075B2A] mt-1 flex items-baseline gap-1">
                <span>₹{stats.avgModal.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-medium text-[#66756B]">/ qtl</span>
              </div>
            </div>

            <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-[#66756B] uppercase tracking-wider block">Approx Consumer Rate</span>
              <div className="text-xl sm:text-2xl font-black text-[#0B7A36] mt-1 flex items-baseline gap-1">
                <span>≈ ₹{stats.avgPerKg}</span>
                <span className="text-[10px] font-medium text-[#66756B]">/ kg</span>
              </div>
            </div>

            <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-[#66756B] uppercase tracking-wider block">Price Range</span>
              <div className="text-lg sm:text-xl font-bold text-[#123524] mt-1 truncate">
                ₹{stats.minP.toLocaleString('en-IN')} – ₹{stats.maxP.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold">Unable to Load Market Prices</div>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
            <button
              onClick={loadPrices}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Main Content ── */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-[#DDE8DF] rounded-3xl overflow-hidden shadow-soft animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <div className="h-10 bg-slate-100 rounded-lg" />
                    <div className="h-10 bg-emerald-50 rounded-lg" />
                    <div className="h-10 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>

        ) : !marketData?.markets?.length ? (
          /* Empty State */
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center shadow-card space-y-4 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-[#EAF5EC] text-[#075B2A] rounded-2xl flex items-center justify-center mx-auto border border-[#DDE8DF]">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#123524]">No Market Prices Found</h3>
              <p className="text-xs sm:text-sm text-[#66756B] mt-1">
                No matching mandi records were found for the selected commodity or location.
                Try broadening your search or selecting another state/district.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#075B2A] hover:bg-[#0B7A36] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters to View All</span>
            </button>
          </div>

        ) : (
          /* ── Market Cards Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketData.markets.map((market, idx) => {
              const cardImageUrl  = getCardImage(market, idx);
              const hasImage      = Boolean(cardImageUrl);
              const attribution   = getAttribution(market);

              return (
                <div
                  key={`${market.market}-${market.commodity}-${idx}`}
                  className="bg-white border border-[#DDE8DF] hover:border-[#075B2A] rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-200 flex flex-col group"
                >
                  {/* ── Crop Photograph ── */}
                  <div className="relative h-48 w-full bg-[#EAF5EC] overflow-hidden shrink-0">
                    {hasImage ? (
                      <img
                        src={cardImageUrl}
                        alt={`Fresh ${market.commodity} — real crop photograph`}
                        onError={() => handleImageError(idx)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#075B2A] bg-gradient-to-br from-[#EAF5EC] to-[#DDE8DF] p-4 text-center">
                        <Sprout className="w-12 h-12 text-[#075B2A]/70 mb-1" />
                        <span className="text-xs font-semibold text-[#123524]">{market.commodity}</span>
                        <span className="text-[10px] text-[#66756B]">Crop image unavailable</span>
                      </div>
                    )}

                    {/* Active badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-[#123524] shadow-xs border border-white/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Mandi Active</span>
                    </div>

                    {/* Variety badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#123524]/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white shadow-xs">
                      {market.variety || 'Standard'}
                    </div>

                    {/* Pexels image attribution overlay */}
                    {hasImage && attribution.photographer && attribution.provider === 'Pexels' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                        <div className="flex items-center justify-between">
                          <a
                            href={attribution.photographer_url || 'https://www.pexels.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[9px] text-white/80 hover:text-white transition-colors"
                          >
                            <Camera className="w-3 h-3 shrink-0" />
                            <span>Photo by {attribution.photographer}</span>
                          </a>
                          <a
                            href={attribution.photo_url || 'https://www.pexels.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-white/70 hover:text-white font-semibold transition-colors"
                          >
                            Pexels
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Wikipedia attribution overlay */}
                    {hasImage && attribution.provider === 'Wikipedia' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                        <a
                          href={attribution.photo_url || 'https://commons.wikimedia.org'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-white/75 hover:text-white transition-colors"
                        >
                          📸 Wikipedia / Wikimedia Commons
                        </a>
                      </div>
                    )}
                  </div>

                  {/* ── Card Body ── */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Commodity + Market */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-extrabold text-[#123524] group-hover:text-[#075B2A] transition-colors">
                            {market.commodity}
                          </h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] shrink-0">
                            {market.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#66756B] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#075B2A] shrink-0" />
                          <span className="truncate">📍 {market.market}, {market.district}</span>
                        </div>
                      </div>

                      {/* Three-Tier Price Grid (Min / Modal / Max) */}
                      <div className="bg-[#F7FAF5] border border-[#DDE8DF] rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
                        <div className="p-1.5 bg-white rounded-xl border border-[#EBF2ED]">
                          <span className="text-[10px] font-medium text-[#66756B] block">Minimum</span>
                          <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                            ₹{market.min_price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Modal — primary highlight */}
                        <div className="p-1.5 bg-[#EAF5EC] rounded-xl border border-emerald-300 ring-1 ring-emerald-400/20">
                          <span className="text-[10px] font-bold text-[#075B2A] block">Modal</span>
                          <div className="text-xs sm:text-sm font-black text-[#075B2A] mt-0.5">
                            ₹{market.modal_price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="p-1.5 bg-white rounded-xl border border-[#EBF2ED]">
                          <span className="text-[10px] font-medium text-[#66756B] block">Maximum</span>
                          <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                            ₹{market.max_price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Per-kg calculation */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold">
                          <IndianRupee className="w-3.5 h-3.5 text-[#075B2A]" />
                          <span>Modal Price:</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-600">
                            ₹{market.modal_price.toLocaleString('en-IN')} / quintal
                          </div>
                          <div className="text-sm font-extrabold text-[#075B2A]">
                            ≈ ₹{market.price_per_kg.toFixed(2)} / kg
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Card Footer: Date + Source + Attribution ── */}
                    <div className="pt-3 border-t border-[#DDE8DF] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-[#66756B]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#075B2A]" />
                          <span>Data Date: <strong>{market.arrival_date}</strong></span>
                        </div>
                        <span className="font-medium text-[#075B2A]">
                          {marketData.source === 'Government of India / Directorate of Marketing and Inspection (OGD)'
                            ? 'Govt. of India OGD'
                            : marketData.source}
                        </span>
                      </div>

                      {/* Image attribution footer line */}
                      {attribution.photographer && (
                        <div className="flex items-center gap-1 text-[10px] text-[#66756B]">
                          <Camera className="w-3 h-3 shrink-0" />
                          <span>Photo by&nbsp;
                            {attribution.photographer_url ? (
                              <a
                                href={attribution.photographer_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#075B2A] font-semibold hover:underline"
                              >
                                {attribution.photographer}
                              </a>
                            ) : (
                              <strong>{attribution.photographer}</strong>
                            )}
                            &nbsp;on&nbsp;
                            {attribution.photo_url ? (
                              <a
                                href={attribution.photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#075B2A] font-semibold hover:underline"
                              >
                                {attribution.provider}
                              </a>
                            ) : (
                              <strong>{attribution.provider}</strong>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Image source when no photographer (Wikipedia/CDN) */}
                      {!attribution.photographer && attribution.provider && attribution.provider !== 'CDN' && (
                        <div className="flex items-center gap-1 text-[10px] text-[#66756B]">
                          <Camera className="w-3 h-3 shrink-0" />
                          <span>Image: {attribution.provider}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Data Transparency Note ── */}
        <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#66756B]">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-[#075B2A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#123524] block mb-0.5">
                Official Agricultural Mandi Data — Transparency Note
              </span>
              <p className="leading-relaxed">
                Prices reflect the latest available mandi price reports from the Directorate of
                Marketing and Inspection (DMI) / AGMARKNET, updated daily. Rates are benchmark
                wholesale prices per quintal (100 kg). Actual transacted prices may vary based on
                harvest quality, moisture content, and local market conditions.
                Crop photographs are dynamically fetched from Pexels and are not stored locally.
              </p>
            </div>
          </div>
          <div className="shrink-0 font-medium text-[11px] text-[#075B2A] bg-[#EAF5EC] px-3 py-1.5 rounded-xl border border-[#DDE8DF]">
            1 Quintal = 100 Kilograms
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
