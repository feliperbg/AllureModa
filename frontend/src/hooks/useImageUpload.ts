import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface UploadResponse {
    url: string;
    message: string;
}

export function useImageUpload() {
    return useMutation({
        mutationFn: async (file: File): Promise<UploadResponse> => {
            const formData = new FormData();
            formData.append("file", file);

            const { data } = await api.post<UploadResponse>("/images/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return data;
        },
    });
}
