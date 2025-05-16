import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="w-full px-4 sm:px-5 md:px-6 lg:px-8 mx-auto max-w-[1400px]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}