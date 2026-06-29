import { ArrowUpDown, Filter } from 'lucide-react';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
export type FilterOption = 'all' | 'in-stock';

interface ProductFilterSortProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  totalResults: number;
}

export default function ProductFilterSort({
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  totalResults
}: ProductFilterSortProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6 mb-8 bg-zinc-950/40 border border-zinc-850 rounded-2xl backdrop-blur-md">
      {/* Total Count Badge */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#00ccff] animate-pulse" />
        <span className="text-xs font-heading font-bold tracking-widest text-zinc-400 uppercase">
          {totalResults} UNITS AVAILABLE
        </span>
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
        {/* Filter Option */}
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#00ccff]" />
          <span className="text-zinc-400 font-heading uppercase text-[10px] tracking-wider font-bold">STOCK:</span>
          <select
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value as FilterOption)}
            className="bg-transparent text-white font-heading text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" className="bg-zinc-900 text-white">ALL HARDWARE</option>
            <option value="in-stock" className="bg-zinc-900 text-white">IN STOCK ONLY</option>
          </select>
        </div>

        {/* Sort Option */}
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#00ccff]" />
          <span className="text-zinc-400 font-heading uppercase text-[10px] tracking-wider font-bold">SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-white font-heading text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="featured" className="bg-zinc-900 text-white">FEATURED</option>
            <option value="price-asc" className="bg-zinc-900 text-white">PRICE: LOW TO HIGH</option>
            <option value="price-desc" className="bg-zinc-900 text-white">PRICE: HIGH TO LOW</option>
            <option value="name-asc" className="bg-zinc-900 text-white">NAME: A - Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
