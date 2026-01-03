import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dynamic Portfolio Dashboard",
  description:
    "A dynamic portfolio dashboard built with Next.js, TypeScript, Tailwind, and Node.js data fetching."
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
