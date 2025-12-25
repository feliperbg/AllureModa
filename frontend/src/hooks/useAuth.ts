import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "USER";
    phone?: string;
    cpf?: string;
    birthDate?: string;
}

// Hook to get current user data
export function useUser() {
    return useQuery({
        queryKey: ["auth", "user"],
        queryFn: async () => {
            const { data } = await api.get<UserProfile>("/auth/me");
            return data;
        },
        retry: false, // Don't retry if 401
    });
}

// Hook for Login
export function useLogin() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (credentials: any) => {
            const { data } = await api.post("/auth/login", credentials);
            return data;
        },
        onSuccess: (data) => {
            // Invalidate user query to fetch fresh data
            queryClient.setQueryData(["auth", "user"], data.user);
            router.push(data.user.role === "ADMIN" ? "/admin" : "/");
        },
    });
}

// Hook for Register
export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post("/auth/register", data);
            return response;
        },
    });
}

// Hook for Logout
export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await api.post("/auth/logout");
        },
        onSuccess: () => {
            queryClient.setQueryData(["auth", "user"], null);
            router.push("/login");
        },
    });
}
