"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
      {/* Toaster lives inside this client component so the `toast()` singleton
          and the <Toaster /> share one sonner module instance (rendering it
          from the server-component layout can split them into two stores). */}
      <Toaster position="bottom-right" richColors closeButton />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
