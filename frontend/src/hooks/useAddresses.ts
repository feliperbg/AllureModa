import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressLine2?: string;
}

export function useAddresses() {
    return useQuery({
        queryKey: ["addresses"],
        queryFn: async () => {
            const { data } = await api.get<Address[]>("/addresses");
            return data || [];
        },
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post("/addresses", { ...data, type: "SHIPPING" });
            return response;
        },
        onSuccess: (newAddress) => {
            queryClient.setQueryData(["addresses"], (old: Address[] | undefined) => {
                return old ? [newAddress, ...old] : [newAddress];
            });
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
    });
}

export function useCep(cep: string) {
    return useQuery({
        queryKey: ["cep", cep],
        queryFn: async () => {
            const cleanCep = cep.replace(/\D/g, "");
            if (cleanCep.length !== 8) return null;
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();
            if (data.erro) throw new Error("CEP inválido");
            return data;
        },
        enabled: cep.replace(/\D/g, "").length === 8,
        staleTime: 1000 * 60 * 60 * 24, // Cache indefinitely (or 24h)
    });
}
