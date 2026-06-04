import RenterFlow from "@/components/RenterFlow";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Renter Application - RentShield",
  description: "Check your eligibility for a deposit-free move.",
};

export default function RenterPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 font-sans">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="font-bold text-xl tracking-tight text-slate-900">RentShield</span>
          </Link>
        </div>
      </nav>
      <RenterFlow />
    </main>
  );
}
