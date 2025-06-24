"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, Send, Edit3, Trash2, X, MessageSquare } from "lucide-react";

function ReviewDialog({
  open,
  review,
  onOpenChange,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  review?: any;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { rating: number; content: string }) => void;
  onDelete: () => void;
}) {
  const [rating, setRating] = useState<number>(review?.rating || 5);
  const [content, setContent] = useState<string>(review?.content || "");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRating(review?.rating || 5);
    setContent(review?.content || "");
  }, [review, open]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, content: content.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            {review ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Share your experience with this product
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Rating
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="focus:outline-none hover:scale-110 transition-transform duration-150"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors duration-150 ${
                        hoveredStar !== null
                          ? hoveredStar >= star
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                          : rating >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                {getRatingText(hoveredStar || rating)}
              </div>
            </div>
          </div>

          {/* Review Content Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-gray-500" />
              Your Review
            </label>
            <div className="relative">
              <textarea
                className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                placeholder="Tell others about your experience with this product..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {content.length}/500
              </div>
            </div>
          </div>

        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-lg flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {review && (
              <Button
                variant="destructive"
                onClick={onDelete}
                type="button"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
              size="sm"
              className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
          <Button
            onClick={handleSubmit}
            type="button"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {review ? "Updating..." : "Submitting..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {review ? "Update " : "Submit Review"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewDialog;
