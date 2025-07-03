import http from "@/lib/http";

export const uploadImgService = {
  uploadImage: async (formData: FormData) => {
    return await http
      .post<{ url: string }>("/cloudinary/upload", formData)
      .then((res) => res.payload.url);
  },
};
