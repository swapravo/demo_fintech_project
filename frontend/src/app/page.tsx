import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, ShieldCheck, Home as HomeIcon, Banknote, Clock, FileCheck, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="font-bold text-xl tracking-tight text-slate-900">RentShield</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/landlord" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              For Landlords
            </Link>
            <Link href="/renter">
              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="text-center max-w-3xl mx-auto z-10 relative">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Move into your next home without paying a huge security deposit upfront.
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Replace large rental deposits with a simple monthly plan while keeping landlords protected.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/renter" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all">
                I'm Looking to Rent
              </Button>
            </Link>
            <Link href="/landlord" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl transition-all">
                I Own Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Visual - Infographic */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full opacity-5 blur-3xl"></div>
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-8 items-center relative z-10">
            {/* Traditional */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-slate-500 mb-4 uppercase tracking-wider text-sm">Traditional Renting</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Rent</p>
                  <p className="text-2xl font-bold text-slate-900">₹40,000</p>
                </div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div>
                  <p className="text-sm text-slate-500">Deposit</p>
                  <p className="text-3xl font-bold text-red-500">₹2,40,000</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center rotate-90 md:rotate-0 text-slate-300">
              <ArrowRight className="w-8 h-8" />
            </div>

            {/* RentShield */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-2xl"></div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4 uppercase tracking-wider text-sm relative z-10">RentShield</h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-sm text-slate-400">Rent</p>
                  <p className="text-2xl font-bold text-white">₹40,000</p>
                </div>
                <div className="h-px bg-slate-800 w-full"></div>
                <div>
                  <p className="text-sm text-slate-400">Monthly Plan</p>
                  <p className="text-3xl font-bold text-emerald-400">₹2,500</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium relative z-10">
                <CheckCircle2 className="w-4 h-4" />
                Landlord Protected
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Why are renters forced to lock away lakhs in security deposits?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Banknote className="text-slate-400" />
                  Traditional Renting
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-slate-700">Large upfront deposit required</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-slate-700">Severely reduced financial liquidity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-slate-700">Expensive and stressful move-in costs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-md ring-1 ring-blue-500/10">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-blue-600" />
                  RentShield
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Significantly lower upfront cost</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Faster move-in experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Comprehensive landlord protection included</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-slate-600">Three simple steps to your new home.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Apply</h3>
              <p className="text-slate-600">Answer a few simple questions to check your eligibility.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. Get Approved</h3>
              <p className="text-slate-600">Complete our quick verification process online.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. Move In</h3>
              <p className="text-slate-600">Pay less upfront, keep your cash, and get your keys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord Protection */}
      <section className="bg-slate-900 text-white py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Landlords stay protected.</h2>
            <p className="text-lg text-slate-400">Everything you need to rent with confidence.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Tenant screening",
              "Verification",
              "Move-in inspections",
              "Move-out inspections",
              "Damage protection",
              "Fraud prevention",
              "Fast claims handling",
              "Zero vacancy cost"
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-center hover:bg-slate-800 transition-colors">
                <Shield className="w-8 h-8 mx-auto text-emerald-400 mb-4" />
                <h4 className="font-medium text-slate-200">{feature}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for? */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Who is RentShield for?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="h-2 bg-blue-500 w-full"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Renters</h3>
                </div>
                <ul className="space-y-4">
                  {["Young professionals", "Relocating employees", "Students", "Families"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 text-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="h-2 bg-emerald-500 w-full"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Landlords</h3>
                </div>
                <ul className="space-y-4">
                  {["Individual owners", "Property investors", "Property managers", "Co-living operators"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 text-lg">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof / CTA */}
      <section className="py-24 max-w-4xl mx-auto px-4 text-center">
        <div className="bg-blue-600 rounded-3xl p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700 rounded-full opacity-50 blur-3xl"></div>
          <div className="relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500 text-white text-sm font-medium tracking-wide uppercase mb-6">
              Launching Soon
            </span>
            <h2 className="text-4xl font-bold mb-8">Join the Early Access Program</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/renter" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-white text-blue-600 hover:bg-slate-50 rounded-xl">
                  I'm a Renter
                </Button>
              </Link>
              <Link href="/landlord" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-blue-400 text-white hover:bg-blue-500/50 rounded-xl">
                  I'm a Landlord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-slate-400" />
            <span className="font-bold text-lg text-slate-900">RentShield</span>
          </div>
          <p>© {new Date().getFullYear()} RentShield. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
