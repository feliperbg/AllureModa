import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
            queryClient.setQueryData(["auth", "user"], data.user);
            toast.success(`Bem-vinda, ${data.user.firstName}!`);
            router.push(data.user.role === "ADMIN" ? "/admin" : "/");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Email ou senha incorretos";
            toast.error(message);
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
        onSuccess: () => {
            toast.success("Conta criada com sucesso! Faça login para continuar.");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao criar conta";
            toast.error(message);
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
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.info("Você saiu da sua conta");
            router.push("/login");
        },
        onError: () => {
            // Even if logout fails, clear local state
            queryClient.setQueryData(["auth", "user"], null);
            router.push("/login");
        },
    });
}
