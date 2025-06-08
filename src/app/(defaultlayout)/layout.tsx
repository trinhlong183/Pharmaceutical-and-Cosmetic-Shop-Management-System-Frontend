import { ReactNode } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
