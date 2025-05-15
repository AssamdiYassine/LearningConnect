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
        <div className="w-full px-6 md:px-12 lg:px-20 mx-auto max-w-[1200px]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}