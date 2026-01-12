import { Link } from "react-router-dom";
import { ExternalLink, Eye, ThumbsUp } from "lucide-react";
import { Tool } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { formatNumber } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  // Some backends (e.g. Mongo) use `_id` instead of `id`.
  // Use a tolerant lookup so links don't become `/tools/undefined`.
  const toolId = (tool as any).id ?? (tool as any)._id ?? "";
  const pricingColors: Record<string, string> = {
    free: "bg-success/20 text-success",
    paid: "bg-warning/20 text-warning",
    subscription: "bg-accent/20 text-accent",
    free_plus_paid: "bg-primary/20 text-primary",
    no_pricing: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 card-elevated">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="relative pb-3">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={`${tool.name} logo`}
                className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border">
                <span className="text-xl font-bold gradient-text">
                  {tool.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={tool.avgRating} size="sm" />
              <span className="text-sm text-muted-foreground">
                ({tool.reviewCount})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tool.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {tool.category}
          </Badge>
          <Badge className={`text-xs ${pricingColors[tool.pricingModel]}`}>
            {tool.pricingDisplay}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="relative pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {tool.views != null && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(tool.views)}
            </span>
          )}
          {tool.votes != null && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {formatNumber(tool.votes)}
            </span>
          )}
          <span>{tool.releasedAgo}</span>
        </div>

        <Button
          asChild
          size="sm"
          variant="ghost"
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Link to={`/tools/${toolId}`} className="flex items-center gap-1">
            View
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
