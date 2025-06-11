import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../context/AuthContext'; // NEW LINE

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AttendEase - Smart Library Management", // UPDATED
  description: "Modern library seat booking and attendance management system", // UPDATED
};

export default function RootLayout({ children }) { 
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider> {/* NEW WRAPPER */}
          {children}
        </AuthProvider> {/* NEW WRAPPER */}
      </body>
    </html>
  );
}
