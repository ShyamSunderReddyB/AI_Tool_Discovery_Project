import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { ReviewStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { Pagination } from "@/components/ui/pagination-nav";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [moderatingReview, setModeratingReview] = useState<{
    id: string;
    action: "approved" | "rejected";
  } | null>(null);
  const [moderationNote, setModerationNote] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminReviews", page, statusFilter],
    queryFn: () =>
      api.getAdminReviews(statusFilter === "all" ? undefined : statusFilter, page),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: "approved" | "rejected"; note?: string }) =>
      api.moderateReview(id, status, note),
    onSuccess: () => {
      toast({ title: "Success", description: "Review moderated successfully." });
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      closeModerateDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const closeModerateDialog = () => {
    setModeratingReview(null);
    setModerationNote("");
  };

  const handleModerate = () => {
    if (moderatingReview) {
      moderateMutation.mutate({
        id: moderatingReview.id,
        status: moderatingReview.action,
        note: moderationNote || undefined,
      });
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const styles: Record<ReviewStatus, string> = {
      pending: "bg-warning/20 text-warning",
      approved: "bg-success/20 text-success",
      rejected: "bg-destructive/20 text-destructive",
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Moderate Reviews</h1>
          <p className="text-muted-foreground">Approve or reject user reviews.</p>
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as ReviewStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingState message="Loading reviews..." />
      ) : isError ? (
        <ErrorState title="Failed to load reviews" onRetry={() => refetch()} />
      ) : !data?.items.length ? (
        <div className="text-center py-16">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No reviews found</h3>
          <p className="text-muted-foreground">
            {statusFilter === "all"
              ? "There are no reviews to moderate yet."
              : `No ${statusFilter} reviews found.`}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Tool</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-xs">Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.toolName || review.toolId}
                    </TableCell>
                    <TableCell>{review.userName}</TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} size="sm" />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.comment}
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell className="text-right">
                      {review.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-success hover:text-success hover:bg-success/10"
                            onClick={() =>
                              setModeratingReview({ id: review.id, action: "approved" })
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setModeratingReview({ id: review.id, action: "rejected" })
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages || Math.ceil(data.total / data.pageSize)}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Moderation Dialog */}
      <Dialog open={!!moderatingReview} onOpenChange={() => closeModerateDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderatingReview?.action === "approved" ? "Approve" : "Reject"} Review
            </DialogTitle>
            <DialogDescription>
              {moderatingReview?.action === "approved"
                ? "This review will be visible to all users."
                : "This review will be hidden from the public."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Moderation Note (optional)</label>
              <Textarea
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder="Add a note about this decision..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModerateDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              disabled={moderateMutation.isPending}
              className={
                moderatingReview?.action === "approved"
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {moderateMutation.isPending
                ? "Processing..."
                : moderatingReview?.action === "approved"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
