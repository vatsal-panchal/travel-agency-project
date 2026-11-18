import React from 'react';
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  Building2,
  Compass,
  Flame,
  Landmark,
  MountainSnow,
  Palmtree,
  Search,
  X,
} from 'lucide-react';

const categories = [
  { id: '', label: 'All journeys', icon: Compass },
  { id: 'beach', label: 'Beach & islands', icon: Palmtree },
  { id: 'mountain', label: 'Mountains', icon: MountainSnow },
  { id: 'adventure', label: 'Adventure', icon: Flame },
  { id: 'city', label: 'City & culture', icon: Building2 },
  { id: 'religious', label: 'Spiritual', icon: Landmark },
];

export const FilterBar = ({
  category,
  onCategoryChange,
  budget,
  onBudgetChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(category || budget || search || sort !== 'newest');

  return (
    <div className="rounded-3xl border border-ink/10 bg-cream-50 p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative w-full xl:max-w-md xl:flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search a place, journey or country…"
              aria-label="Search journeys"
              className="w-full rounded-2xl border border-ink/10 bg-cream-100 py-3 pl-11 pr-10 text-sm font-medium text-ink placeholder:text-ink-400 transition focus:border-forest focus:bg-white focus:outline-none focus:ring-4 focus:ring-forest/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition hover:bg-ink/10 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center">
            <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-ink/10 bg-cream-100 px-3.5 py-2.5">
              <ArrowDownWideNarrow className="h-3.5 w-3.5 shrink-0 text-ink-400" />
              <select
                value={budget}
                onChange={(e) => onBudgetChange(e.target.value)}
                aria-label="Filter by budget"
                className="w-full cursor-pointer bg-transparent text-[12px] font-bold text-ink-700 focus:outline-none"
              >
                <option value="">Any budget</option>
                <option value="under50">Under ₹50,000</option>
                <option value="from50to100">₹50,000–₹1,00,000</option>
                <option value="over100">Over ₹1,00,000</option>
              </select>
            </label>

            <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-ink/10 bg-cream-100 px-3.5 py-2.5">
              <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-ink-400" />
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Sort journeys"
                className="w-full cursor-pointer bg-transparent text-[12px] font-bold text-ink-700 focus:outline-none"
              >
                <option value="newest">Newest departures</option>
                <option value="price_asc">Price · low to high</option>
                <option value="price_desc">Price · high to low</option>
                <option value="rating_desc">Highest rated</option>
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="self-end rounded-xl px-3 py-2 text-[11px] font-extrabold text-clay-700 transition hover:bg-clay-50 xl:self-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto border-t border-ink/[0.07] pt-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = category === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[11.5px] font-extrabold transition-all duration-300 ${
                active
                  ? 'bg-ink text-cream-50 shadow-soft'
                  : 'border border-ink/10 bg-transparent text-ink-500 hover:border-ink/25 hover:text-ink'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-clay-300' : 'text-ink-400'}`} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
