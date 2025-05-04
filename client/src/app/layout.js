import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import StatusIndicator from "@/components/StatusIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "To Do App",
  description: "Görevlerinizi kolayca yönetebileceğiniz basit bir To Do uygulaması",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          {children}
          <StatusIndicator />
        </StoreProvider>
      </body>
    </html>
  );
}
