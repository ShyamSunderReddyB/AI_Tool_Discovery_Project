import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  ThumbsUp,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { api } from "@/lib/api";
import { getDemoTool, getDemoToolReviews } from "@/lib/demoData";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { Pagination } from "@/components/ui/pagination-nav";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { formatNumber, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPage, setReviewPage] = useState(1);

  const {
    data: tool,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tool", id],
    queryFn: async () => {
      try {
        const toolData = await api.getTool(id!);
        return toolData;
      } catch (error) {
        console.error("Error fetching tool:", error);
        // Only fallback to demo data if it's a network error and we have demo data
        const demoData = getDemoTool(id!);
        if (demoData) {
          console.warn("Using demo data as fallback");
          return demoData;
        }
        throw error; // Re-throw if no demo data available
      }
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["toolReviews", id, reviewPage],
    queryFn: async () => {
      try {
        return await api.getToolReviews(id!, reviewPage);
      } catch {
        return getDemoToolReviews(id!, reviewPage);
      }
    },
    enabled: !!id,
  });

  const createReviewMutation = useMutation({
    mutationFn: () =>
      api.createReview({
        toolId: id!,
        rating: reviewRating,
        comment: reviewComment,
      }),
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Your review is pending moderation.",
      });
      setReviewRating(0);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["toolReviews", id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    createReviewMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <LoadingState message="Loading tool details..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <ErrorState
          title="Error loading tool"
          description={
            error instanceof Error
              ? error.message
              : "Failed to fetch tool details from the database. Please check if the backend is running."
          }
        />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container py-8">
        <ErrorState
          title="Tool not found"
          description="The tool you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  const pricingColors: Record<string, string> = {
    free: "bg-success/20 text-success",
    paid: "bg-warning/20 text-warning",
    subscription: "bg-accent/20 text-accent",
    free_plus_paid: "bg-primary/20 text-primary",
    no_pricing: "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="container relative py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              {tool.logoUrl ? (
                <img
                  src={tool.logoUrl}
                  alt={`${tool.name} logo`}
                  className="h-20 w-20 md:h-24 md:w-24 rounded-2xl object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-2 ring-border">
                  <span className="text-4xl font-bold gradient-text">
                    {tool.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{tool.name}</h1>
                <Badge className={pricingColors[tool.pricingModel]}>
                  {tool.pricingDisplay}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={tool.avgRating} size="lg" />
                  <span className="text-lg font-medium">
                    {tool.avgRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({tool.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-4">
                {tool.shortDescription}
              </p>

              {tool.officialUrl && (
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Visit Official Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Reviews ({tool.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewsData?.items.length ? (
                  <>
                    {reviewsData.items.map((review) => {
                      // Some backends may return a nested user object instead of `userName`,
                      // or omit the name entirely. Be defensive to avoid runtime errors.
                      const reviewUserName =
                        (review as any).userName ??
                        ((review as any).user?.name
                          ? (review as any).user.name
                          : undefined) ??
                        "Anonymous";

                      return (
                        <div
                          key={review.id}
                          className="p-4 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {String(reviewUserName)
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">
                                {reviewUserName}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <StarRating
                            rating={review.rating}
                            size="sm"
                            className="mb-2"
                          />
                          <p className="text-muted-foreground">
                            {review.comment}
                          </p>
                        </div>
                      );
                    })}
                    <Pagination
                      currentPage={reviewsData.page}
                      totalPages={
                        reviewsData.totalPages ||
                        Math.ceil(reviewsData.total / reviewsData.pageSize)
                      }
                      onPageChange={setReviewPage}
                    />
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No reviews yet. Be the first to share your experience!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Write Review */}
            <Card>
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Rating
                      </label>
                      <StarRating
                        rating={reviewRating}
                        size="lg"
                        interactive
                        onChange={setReviewRating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Review
                      </label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this tool..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={createReviewMutation.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {createReviewMutation.isPending
                        ? "Submitting..."
                        : "Submit Review"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Please sign in to write a review.
                    </p>
                    <Button asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tool Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{tool.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pricing</span>
                  <span className="font-medium">{tool.pricingDisplay}</span>
                </div>
                {tool.views != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Views
                    </span>
                    <span className="font-medium">
                      {formatNumber(tool.views)}
                    </span>
                  </div>
                )}
                {tool.votes != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      Votes
                    </span>
                    <span className="font-medium">
                      {formatNumber(tool.votes)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Released
                  </span>
                  <span className="font-medium">{tool.releasedAgo}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
