import type { Metadata } from "next";
import { headers } from "next/headers";
import { Libre_Caslon_Display, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const libreCaslon = Libre_Caslon_Display({
  variable: "--font-editorial",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0];
  const host = forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0];
  const protocol = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", baseUrl).toString();
  const description =
    "A calm personal space for habits, thoughtful planning, reflection, and meaningful progress.";

  return {
    metadataBase: baseUrl,
    title: {
      default: "HabitFlow — A quieter way to keep moving",
      template: "%s · HabitFlow",
    },
    description,
    openGraph: {
      type: "website",
      siteName: "HabitFlow",
      title: "HabitFlow — Make space for the life you want to repeat",
      description,
      url: baseUrl,
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: "HabitFlow — Make space for the life you want to repeat",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "HabitFlow — Make space for the life you want to repeat",
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${libreCaslon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
