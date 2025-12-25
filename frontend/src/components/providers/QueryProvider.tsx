"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Global caching options
                        staleTime: 60 * 1000, // Data is fresh for 1 minute
                        retry: 1, // Retry failed requests once
                        refetchOnWindowFocus: false, // Optional: prevent refetch on window focus
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
