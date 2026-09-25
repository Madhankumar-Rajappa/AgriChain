import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AppLayout from '../../components/AppLayout';
import { fetchAvailableCrops } from '../../api/crops';
import { Search, Filter, Sprout, MapPin, Calendar, ArrowRight, RefreshCw, X, ChevronLeft, ChevronRight, SlidersHorizontal, User } from 'lucide-react';

export default function BuyerMarketplacePage() {
  const { user } = useAuth();

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

  const Content = (
    <div className="space-y-6">
      {/* Title & Search Bar */}
      <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] uppercase tracking-wider inline-block mb-2">
            Verified Harvest Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123524] tracking-tight">
            Browse Fresh Produce
          </h1>
          <p className="text-xs text-[#66756B] mt-1">Direct, transparent sourcing from verified local agricultural producers</p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#66756B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by crop name, variety, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-xs text-[#123524] placeholder-[#66756B]/60 focus:outline-none focus:border-[#075B2A] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66756B] hover:text-[#123524]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-semibold text-xs rounded-xl shadow-soft transition-all shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = (cat === 'ALL' && !category) || category === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat === 'ALL' ? '' : cat);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-[#075B2A] text-white border-[#075B2A] shadow-soft'
                  : 'bg-white text-[#66756B] border-[#DDE8DF] hover:border-[#075B2A] hover:text-[#123524]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter Options & Sort Bar */}
      <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F7FAF5] hover:bg-[#EAF5EC] text-[#123524] text-xs font-semibold border border-[#DDE8DF] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#075B2A]" />
            <span>{showFilters ? 'Hide Filters' : 'Filter Options'}</span>
          </button>

          <div className="text-xs text-[#66756B] hidden sm:block">
            Showing <strong className="text-[#123524] font-bold">{total}</strong> crops available
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#66756B]">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-[#F7FAF5] border border-[#DDE8DF] text-xs text-[#123524] font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#075B2A]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBF2ED] pb-3">
            <h3 className="text-xs font-bold text-[#123524] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#075B2A]" /> Advanced Marketplace Filters
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[#66756B] font-semibold mb-1">Quality Grade</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl px-3 py-2 text-[#123524] focus:outline-none focus:border-[#075B2A]"
              >
                {qualities.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#66756B] font-semibold mb-1">Location Filter</label>
              <input
                type="text"
                placeholder="e.g. Punjab, Nashik"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl px-3 py-2 text-[#123524] focus:outline-none focus:border-[#075B2A]"
              />
            </div>

            <div>
              <label className="block text-[#66756B] font-semibold mb-1">Min Price (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl px-3 py-2 text-[#123524] focus:outline-none focus:border-[#075B2A]"
              />
            </div>

            <div>
              <label className="block text-[#66756B] font-semibold mb-1">Max Price (₹)</label>
              <input
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl px-3 py-2 text-[#123524] focus:outline-none focus:border-[#075B2A]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setPage(1);
                loadMarketplace();
              }}
              className="px-5 py-2 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-semibold rounded-xl shadow-soft cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Crop Cards Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[#66756B]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#075B2A] mb-3" />
          <p className="text-xs">Fetching marketplace listings...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl text-xs max-w-md mx-auto my-12 text-center">
          <p className="mb-3">{error}</p>
          <button onClick={loadMarketplace} className="px-4 py-1.5 bg-rose-700 text-white rounded-xl font-semibold">
            Retry
          </button>
        </div>
      ) : crops.length === 0 ? (
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center max-w-md mx-auto my-8 shadow-card">
          <div className="w-16 h-16 rounded-full bg-[#EAF5EC] flex items-center justify-center mx-auto mb-4 text-[#075B2A]">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#123524] mb-1">No Matching Produce Found</h3>
          <p className="text-xs text-[#66756B] mb-6">Try adjusting your category pills, price range, or search terms.</p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-[#F7FAF5] hover:bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] text-xs font-semibold rounded-xl"
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
                className="bg-white border border-[#DDE8DF] hover:border-[#075B2A] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-soft hover:shadow-card group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] uppercase tracking-wider">
                      {crop.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F7FAF5] text-[#66756B] border border-[#DDE8DF]">
                      {crop.quality}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#123524] group-hover:text-[#075B2A] transition-colors truncate mb-1">
                    {crop.name}
                  </h3>

                  <p className="text-xs text-[#66756B] line-clamp-2 mb-4 leading-relaxed">
                    {crop.description || 'Verified agricultural harvest ready for purchase.'}
                  </p>

                  <div className="bg-[#F7FAF5] p-3.5 rounded-xl border border-[#DDE8DF] mb-4 space-y-1.5 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[#66756B] text-[11px]">Price:</span>
                      <span className="text-base font-extrabold text-[#075B2A]">
                        ₹{crop.expected_price} <span className="text-[11px] font-normal text-[#66756B]">/ {crop.unit}</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#66756B]">
                      <span>Available Stock:</span>
                      <strong className="text-[#123524]">{crop.quantity} {crop.unit}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-[#66756B] pt-2 border-t border-[#EBF2ED] mb-4">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#075B2A]" />
                      <span>Farmer: <strong className="text-[#123524]">{crop.farmer?.full_name || 'Verified Farmer'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#075B2A]" />
                      <span>{crop.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#66756B]" />
                      <span>Harvest: {crop.harvest_date}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EBF2ED]">
                  <Link
                    to={`/crops/${crop.id}`}
                    className="w-full py-2.5 px-4 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl shadow-soft flex items-center justify-center gap-1.5 transition-all group-hover:scale-[1.01]"
                  >
                    <span>View Details & Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-white border border-[#DDE8DF] text-[#123524] hover:bg-[#F5F8F3] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-[#123524] px-4">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-white border border-[#DDE8DF] text-[#123524] hover:bg-[#F5F8F3] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (user) {
    return (
      <AppLayout
        title="Crop Marketplace"
        subtitle="Explore fresh agricultural produce available for direct wholesale procurement."
        breadcrumb="Marketplace / Crops"
      >
        {Content}
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAF5] text-[#123524] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {Content}
      </main>
      <Footer />
    </div>
  );
}
