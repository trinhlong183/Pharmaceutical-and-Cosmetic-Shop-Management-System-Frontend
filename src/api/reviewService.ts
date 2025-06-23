import http from "@/lib/http";

type createReviewBodyType = {
  productId: string;
  rating: number;
  content: string;
  userId: string;
};

export const reviewService = {
  createReview: (body: createReviewBodyType) => {
    return http.post("/reviews", body);
  },
  getAllReviews: (params: { productId: string; userId: string }) => {
    return http
      .get<{ data: any }>("/reviews", { params })
      .then((response) => response.payload.data);
  },
  getReviewById: (reviewId: string) => {
    return http.get(`/reviews/${reviewId}`);
  },
  updateReview: (reviewId: string, body: createReviewBodyType) => {
    return http.patch(`/reviews/${reviewId}`, body);
  },
  deleteReview: (reviewId: string) => {
    return http.delete(`/reviews/${reviewId}`);
  },
};
