import { Loader2, PackageSearch } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
        <Loader2 className="relative h-12 w-12 text-primary animate-spin" />
      </div>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your filters or search terms.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-muted/30" />
        <PackageSearch className="relative h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-muted-foreground text-center max-w-sm">{description}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again later.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-destructive/20" />
        <div className="relative h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-muted-foreground text-center max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
