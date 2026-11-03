import "@/styles/global.css";
import { Poppins } from "next/font/google";
import { Metadata } from "next";
import Theme from "@/core/providers/ThemeProvider";
import AppProvider from "@/core/providers/AppProvider";
import { ToastProvider } from "@/core/providers/ToastProvider";
import { LoaderProvider } from "@/core/providers/LoaderProvider";
import { DeviceProvider } from "@/core/providers/DeviceProvider";
import SessionErrorListener from "@/gcm-bisp/components/system/SessionErrorListener";
import InactivityGuard from "@/gcm-bisp/components/system/InactivityGuard";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'GCM PROCESS BISP',
  icons: {
    icon: '/Logo/Logo_GCM_Process.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased theme-default`}>
        <Theme>
          <AppProvider>
            <ToastProvider>
              <LoaderProvider>
                <DeviceProvider>
                  {children}
                  <SessionErrorListener />
                  <InactivityGuard />
                </DeviceProvider>
              </LoaderProvider>
            </ToastProvider>

          </AppProvider>
        </Theme>
      </body>
    </html>
  );
}
