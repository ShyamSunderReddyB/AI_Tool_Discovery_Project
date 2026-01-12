import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { PricingModel } from "@/types";
import { useFilterStore } from "@/store/filterStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CATEGORIES = [
  "All",
  "Images",
  "Text",
  "Audio",
  "Video",
  "Code",
  "Productivity",
  "Marketing",
  "Research",
  "Other",
];

const PRICING_OPTIONS: { value: PricingModel; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "subscription", label: "Subscription" },
  { value: "free_plus_paid", label: "Freemium" },
  { value: "no_pricing", label: "No pricing" },
];

export function FilterSidebar() {
  const { filters, setCategory, setPricingModels, setMinRating, setSearch, clearFilters } =
    useFilterStore();
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchValue);
  };

  const handlePricingChange = (value: PricingModel, checked: boolean) => {
    const current = filters.pricingModel || [];
    if (checked) {
      setPricingModels([...current, value]);
    } else {
      setPricingModels(current.filter((p) => p !== value));
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Search</Label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search tools..."
            className="pl-9"
          />
        </form>
      </div>

      {/* Category */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <Select
          value={filters.category || "All"}
          onValueChange={(value) => setCategory(value === "All" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pricing */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Pricing</Label>
        <div className="space-y-2">
          {PRICING_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.pricingModel?.includes(option.value) || false}
                onCheckedChange={(checked) =>
                  handlePricingChange(option.value, checked as boolean)
                }
              />
              <Label
                htmlFor={option.value}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Minimum Rating: {filters.minRating?.toFixed(1) || "Any"}
        </Label>
        <Slider
          value={[filters.minRating || 0]}
          onValueChange={([value]) => setMinRating(value === 0 ? undefined : value)}
          max={5}
          min={0}
          step={0.5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Any</span>
          <span>5.0</span>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => {
          clearFilters();
          setSearchValue("");
        }}
        className="w-full"
      >
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger */}
      <div className="lg:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filter Tools</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 p-4 rounded-lg bg-card border border-border">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <FilterContent />
        </div>
      </aside>
    </>
  );
}
