import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Tool, ToolCreate, ToolUpdate, PricingModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
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
  { value: "no_pricing", label: "No Pricing" },
];

export default function AdminTools() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);

  const [formData, setFormData] = useState<ToolCreate>({
    name: "",
    shortDescription: "",
    category: "Other",
    pricingDisplay: "",
    pricingModel: "free",
    sourceUrl: "",
    officialUrl: "",
    logoUrl: "",
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminTools", page],
    queryFn: () => api.getAdminTools(page),
  });

  const createMutation = useMutation({
    mutationFn: (data: ToolCreate) => api.createTool(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Tool created successfully." });
      queryClient.invalidateQueries({ queryKey: ["adminTools"] });
      closeForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToolUpdate }) =>
      api.updateTool(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Tool updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["adminTools"] });
      closeForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTool(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Tool deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["adminTools"] });
      setDeletingTool(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openCreateForm = () => {
    setEditingTool(null);
    setFormData({
      name: "",
      shortDescription: "",
      category: "Other",
      pricingDisplay: "",
      pricingModel: "free",
      sourceUrl: "",
      officialUrl: "",
      logoUrl: "",
      releasedAgo: "",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      shortDescription: tool.shortDescription,
      category: tool.category,
      pricingDisplay: tool.pricingDisplay,
      pricingModel: tool.pricingModel,
      releasedAgo: tool.releasedAgo,
      sourceUrl: tool.sourceUrl,
      officialUrl: tool.officialUrl || "",
      logoUrl: tool.logoUrl || "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTool(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTool) {
      updateMutation.mutate({ id: editingTool.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTools = data?.items.filter(
    (tool) =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Tools</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove AI tools from the platform.
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Tool
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState message="Loading tools..." />
      ) : isError ? (
        <ErrorState title="Failed to load tools" onRetry={() => refetch()} />
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools?.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tool.category}</Badge>
                    </TableCell>
                    <TableCell>{tool.pricingDisplay}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <StarRating rating={tool.avgRating} size="sm" />
                        <span className="text-sm">
                          {tool.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{tool.reviewCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditForm(tool)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingTool(tool)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={data?.page || 1}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? "Edit Tool" : "Add New Tool"}
            </DialogTitle>
            <DialogDescription>
              {editingTool
                ? "Update the tool information below."
                : "Fill in the details to add a new AI tool."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <Label>Pricing Model *</Label>
                <Select
                  value={formData.pricingModel}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      pricingModel: value as PricingModel,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingDisplay">Pricing Display *</Label>
              <Input
                id="pricingDisplay"
                value={formData.pricingDisplay}
                onChange={(e) =>
                  setFormData({ ...formData, pricingDisplay: e.target.value })
                }
                placeholder="e.g., Free, $9.99/mo, Freemium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL *</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) =>
                  setFormData({ ...formData, sourceUrl: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releasedAgo">Released (friendly)</Label>
              <Input
                id="releasedAgo"
                value={formData.releasedAgo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, releasedAgo: e.target.value })
                }
                placeholder="e.g., '2 months ago'"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officialUrl">Official URL</Label>
              <Input
                id="officialUrl"
                type="url"
                value={formData.officialUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, officialUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={formData.logoUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingTool
                  ? "Update Tool"
                  : "Add Tool"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingTool}
        onOpenChange={() => setDeletingTool(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTool?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingTool && deleteMutation.mutate(deletingTool.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
