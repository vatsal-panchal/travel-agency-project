import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { packageApi } from '../api/packageApi';
import { PackageCard } from '../components/packages/PackageCard';
import { FilterBar } from '../components/packages/FilterBar';
import { Reveal } from '../components/ui/Reveal';

const BUDGET_LIMITS = {
  under50: { maxPrice: 49999 },
  from50to100: { minPrice: 50000, maxPrice: 100000 },
  over100: { minPrice: 100001 },
};
const NO_BUDGET_LIMITS = {};

export const PackagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const budget = searchParams.get('budget') || '';
  const page = Number(searchParams.get('page')) || 1;
  const selectedBudget = BUDGET_LIMITS[budget] || NO_BUDGET_LIMITS;

  const [searchInput, setSearchInput] = useState(search);
  const [packages, setPackages] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce typing so every keystroke does not hit the API.
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) params.set('search', searchInput);
      else params.delete('search');
      params.set('page', '1');
      setSearchParams(params);
    }, 380);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    let alive = true;
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await packageApi.getAll({
          category,
          search,
          sort,
          page,
          limit: 9,
          ...selectedBudget,
        });
        if (!alive) return;
        setPackages(res.data?.packages || []);
        setPagination({
          total: res.data?.total || 0,
          totalPages: res.data?.totalPages || 1,
          page: res.data?.page || page,
        });
      } catch {
        if (alive) setError('We could not load the collection. Please try again.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchPackages();
    return () => {
      alive = false;
    };
  }, [category, search, sort, page, selectedBudget]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-ink/10 bg-cream-100">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
          <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            <path
              d="M-50 260C150 240 180 72 370 95s228 190 400 126 222-177 480-145"
              fill="none"
              stroke="#176b70"
              strokeOpacity=".12"
              strokeWidth="2"
              strokeDasharray="5 9"
            />
            <path
              d="M-40 285C180 268 215 122 360 132s223 159 400 108 229-134 490-116"
              fill="none"
              stroke="#de6d50"
              strokeOpacity=".11"
              strokeWidth="1.5"
            />
            <circle cx="370" cy="95" r="5" fill="#176b70" fillOpacity=".35" />
            <circle cx="770" cy="221" r="5" fill="#de6d50" fillOpacity=".4" />
            <circle cx="1130" cy="76" r="5" fill="#176b70" fillOpacity=".35" />
          </svg>
        </div>
        <div className="container-x relative py-12 sm:py-16">
          <Reveal>
            <span className="eyebrow">The collection · 2026</span>
            <div className="mt-4 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="display-hero text-[2.8rem] text-ink sm:text-[3.8rem]">
                  Find your next{' '}
                  <em className="font-light italic text-clay-600">great escape.</em>
                </h1>
                <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-600">
                  Small groups, trusted local guides and room to wander. Find the journey that
                  feels like yours.
                </p>
              </div>
              <div className="flex items-center gap-4 lg:mb-1">
                <div className="rounded-2xl border border-ink/10 bg-cream-50/90 px-5 py-3 shadow-soft">
                  <p className="font-display text-2xl leading-none text-ink">
                    {loading ? '…' : pagination.total}
                  </p>
                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                    Available journeys
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-cream-50/90 px-5 py-3 shadow-soft">
                  <p className="font-display text-2xl leading-none text-ink">5 styles</p>
                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                    Ways to travel
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="container-x py-10 sm:py-12">
        <FilterBar
          category={category}
          onCategoryChange={(value) => updateFilter('category', value)}
          budget={budget}
          onBudgetChange={(value) => updateFilter('budget', value)}
          search={searchInput}
          onSearchChange={setSearchInput}
          sort={sort}
          onSortChange={(value) => updateFilter('sort', value === 'newest' ? '' : value)}
          onReset={handleReset}
        />

        {/* Result meta */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] font-bold text-ink-500">
            {loading ? (
              'Gathering journeys…'
            ) : (
              <>
                Showing <span className="text-ink">{packages.length}</span> of{' '}
                <span className="text-ink">{pagination.total}</span> journeys
                {search && (
                  <>
                    {' '}
                    for “<span className="text-clay-600">{search}</span>”
                  </>
                )}
              </>
            )}
          </p>
          {category && (
            <span className="chip capitalize">
              {category.replace('-', ' ')}
              <button
                type="button"
                onClick={() => updateFilter('category', '')}
                className="ml-0.5 text-ink-400 hover:text-ink"
                aria-label="Remove category filter"
              >
                ×
              </button>
            </span>
          )}
          {budget && (
            <span className="chip">
              {budget === 'under50' ? 'Under ₹50,000' : budget === 'from50to100' ? '₹50,000–₹1,00,000' : 'Over ₹1,00,000'}
              <button
                type="button"
                onClick={() => updateFilter('budget', '')}
                className="ml-0.5 text-ink-400 hover:text-ink"
                aria-label="Remove budget filter"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <p className="text-sm font-bold text-rose-700">{error}</p>
            <button onClick={handleReset} className="btn-ink btn-sm mt-4">
              Reset filters
            </button>
          </div>
        ) : loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-ink/10 bg-cream-50">
                <div className="skeleton aspect-[4/3] rounded-none" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-5 w-4/5" />
                  <div className="skeleton h-3 w-1/4" />
                  <div className="skeleton mt-6 h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 bg-cream-50 px-6 py-20 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-200 text-ink-400">
              <SearchX className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-3xl text-ink">Nothing matches just yet.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
              Try a different place, remove a filter, or ask our travel team to plan a journey
              that fits what you have in mind.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={handleReset} className="btn-ink btn-sm">
                Clear all filters
              </button>
              <Link to="/#enquiry" className="btn-outline btn-sm">
                Ask for a custom trip
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, index) => (
                <Reveal key={pkg._id || pkg.id} delay={(index % 3) * 70}>
                  <PackageCard pkg={pkg} />
                </Reveal>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 border-t border-ink/10 pt-8">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink transition hover:bg-cream-200 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 ||
                      n === pagination.totalPages ||
                      Math.abs(n - page) <= 1
                  )
                  .map((n, idx, arr) => (
                    <React.Fragment key={n}>
                      {idx > 0 && n - arr[idx - 1] > 1 && (
                        <span className="px-1 text-ink-300">…</span>
                      )}
                      <button
                        onClick={() => goToPage(n)}
                        className={`h-10 min-w-[40px] rounded-full px-3 text-[12px] font-extrabold transition ${
                          n === page
                            ? 'bg-ink text-cream-50'
                            : 'border border-ink/15 text-ink-600 hover:bg-cream-200'
                        }`}
                      >
                        {n}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink transition hover:bg-cream-200 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
