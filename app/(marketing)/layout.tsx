import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { ForceLightMode } from "@/components/marketing/force-light-mode";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthModalProvider>
      <ForceLightMode />
      <Navbar />
      {children}
      <Footer />
      <AuthModal />
    </AuthModalProvider>
  );
}
