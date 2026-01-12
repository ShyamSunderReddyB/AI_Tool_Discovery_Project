import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { getDemoTools } from "@/lib/demoData";
import { useFilterStore } from "@/store/filterStore";
import { ToolCard } from "@/components/tools/ToolCard";
import { FilterSidebar } from "@/components/tools/FilterSidebar";
import { Pagination } from "@/components/ui/pagination-nav";
import { LoadingState, EmptyState } from "@/components/ui/states";

export default function Index() {
  const { filters, setPage } = useFilterStore();

  const { data, isLoading } = useQuery({
    queryKey: ["tools", filters],
    queryFn: async () => {
      try {
        return await api.getTools(filters);
      } catch {
        // Fallback to demo data if API is not available
        return getDemoTools(filters);
      }
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Discover AI Tools</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find the{" "}
              <span className="gradient-text">Perfect AI Tool</span>
              {" "}for Your Workflow
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of AI tools. Read reviews, compare features, 
              and find the right solution for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar />

          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {data ? (
                  <>
                    Showing <span className="text-foreground font-medium">{data.items.length}</span> of{" "}
                    <span className="text-foreground font-medium">{data.total}</span> tools
                  </>
                ) : (
                  "Loading tools..."
                )}
              </p>
            </div>

            {/* Tools Grid */}
            {isLoading ? (
              <LoadingState message="Loading AI tools..." />
            ) : !data?.items.length ? (
              <EmptyState
                title="No tools match your filters"
                description="Try adjusting your filters or search terms to find what you're looking for."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.items.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>

                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
