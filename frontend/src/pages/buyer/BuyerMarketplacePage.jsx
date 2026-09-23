import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchAvailableCrops } from '../../api/crops';
import { Search, Filter, Sprout, MapPin, Calendar, ArrowRight, RefreshCw, X, ChevronLeft, ChevronRight, SlidersHorizontal, User } from 'lucide-react';

export default function BuyerMarketplacePage() {
  const [crops, setCrops] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [quality, setQuality] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['ALL', 'GRAINS', 'VEGETABLES', 'FRUITS', 'PULSES', 'SPICES', 'OTHER'];
  const qualities = ['ALL', 'GRADE_A', 'GRADE_B', 'PREMIUM', 'STANDARD'];

  const loadMarketplace = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pageSize, sort_by: sortBy };
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'ALL') params.category = category;
      if (location.trim()) params.location = location.trim();
      if (quality && quality !== 'ALL') params.quality = quality;
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);

      const data = await fetchAvailableCrops(params);
      setCrops(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load marketplace crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, [page, category, quality, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadMarketplace();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setQuality('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-3xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wider">
              Verified Harvest Marketplace
            </span>
            <h1 className="text-3xl font-extrabold text-slate-100 mt-2">Browse Fresh Produce</h1>
            <p className="text-xs text-slate-400">Direct, transparent sourcing from verified local farmers</p>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search crops by name, variety, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = (cat === 'ALL' && !category) || category === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat === 'ALL' ? '' : cat);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter & Sort Bar */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filter Options</span>
            </button>

            <div className="text-xs text-slate-400 hidden sm:block">
              Showing <strong className="text-slate-200">{total}</strong> crops available
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilters && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-8 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" /> Advanced Marketplace Filters
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-400 hover:underline"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Quality Grade</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                >
                  {qualities.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location Filter</label>
                <input
                  type="text"
                  placeholder="e.g. Punjab, Nashik"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setPage(1);
                  loadMarketplace();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Crop Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-xs">Fetching marketplace listings...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs max-w-md mx-auto my-12 text-center">
            <p className="mb-3">{error}</p>
            <button onClick={loadMarketplace} className="px-3 py-1 bg-rose-900 rounded text-rose-200">
              Retry
            </button>
          </div>
        ) : crops.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
            <Sprout className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">No Matching Produce Found</h3>
            <p className="text-xs text-slate-400 mb-6">Try adjusting your category pills, price range, or search terms.</p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xl group hover:scale-[1.01]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wider">
                        {crop.category}
                      </span>
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                        {crop.quality}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                      {crop.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {crop.description || 'Verified farm harvest ready for purchase.'}
                    </p>

                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-4 space-y-1.5 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-400 text-2xs">Price:</span>
                        <span className="text-base font-extrabold text-emerald-400">
                          ₹{crop.expected_price} <span className="text-3xs font-normal text-slate-400">/ {crop.unit}</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-2xs text-slate-400">
                        <span>Quantity:</span>
                        <strong className="text-slate-200">{crop.quantity} {crop.unit}</strong>
                      </div>
                    </div>

                    <div className="space-y-1 text-3xs text-slate-400 pt-2 border-t border-slate-800/60 mb-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Farmer: <strong className="text-slate-300">{crop.farmer?.full_name || 'Verified Farmer'}</strong></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {crop.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> {crop.harvest_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/crops/${crop.id}`}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>View Crop Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 px-3">
                  Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
