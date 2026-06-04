"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const questions = [
  {
    id: "city",
    question: "Which city is your property located in?",
    options: ["Mumbai", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Delhi NCR", "Kolkata", "Other"]
  },
  {
    id: "rent",
    question: "What is the monthly rent?",
    options: ["Under ₹20,000", "₹20,000–₹50,000", "₹50,000–₹1 lakh", "₹1 lakh+"]
  },
  {
    id: "deposit_months",
    question: "How many months of deposit do you currently require?",
    options: ["1–2 months", "3–5 months", "6–8 months", "9–12 months", "More than 12 months"]
  },
  {
    id: "concern",
    question: "What is your biggest concern with tenants?",
    options: ["Property damage", "Missed rent", "Legal disputes", "Illegal occupancy", "Maintenance issues", "Other"]
  },
  {
    id: "reduce_deposit",
    question: "If damages and unpaid rent were covered, would you reduce your deposit requirement?",
    options: ["Definitely", "Maybe", "Probably not", "No"]
  },
  {
    id: "minimum_deposit",
    question: "What minimum deposit would you require?",
    options: ["No deposit", "1 month", "2 months", "3 months", "No change"]
  },
  {
    id: "trust_score",
    question: "Would you trust a tenant risk score?",
    options: ["Yes", "Maybe", "No"]
  },
  {
    id: "find_tenants",
    question: "How do you currently find tenants?",
    options: ["Broker", "NoBroker", "MagicBricks", "Housing", "Friends/Family", "Social Media", "Other"]
  }
];

export default function LandlordFlow() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleOptionSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [questions[currentStep].id]: option }));
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 300);
  };

  if (currentStep === -1) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-medium mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            For Landlords
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Reduce vacancy. Stay protected.
          </h1>
          <p className="text-xl text-slate-600">
            Find out if your property qualifies for RentShield protection.
          </p>
          <Button size="lg" onClick={() => setCurrentStep(0)} className="text-lg h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all">
            Start Questionnaire <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <div className="mt-8">
            <Link href="/" className="text-slate-500 hover:text-slate-900 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep >= totalSteps) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200 shadow-xl overflow-hidden rounded-2xl">
          <div className="bg-slate-900 p-8 text-center text-white">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h2 className="text-2xl font-bold mb-2">You may qualify!</h2>
            <p className="text-slate-400">Your property may qualify for RentShield protection.</p>
          </div>
          <CardContent className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Tenant screening</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Damage protection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Reduced vacancy</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Faster leasing</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Jane Doe" className="h-12" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" className="h-12" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane@example.com" className="h-12" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white mt-4 text-lg rounded-xl shadow-sm">
                Join Pilot Program
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentStep];

  return (
    <div className="max-w-2xl w-full mx-auto p-4 pt-12 md:pt-24 min-h-[80vh]">
      <div className="mb-12">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-4">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-100" />
      </div>

      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-8">
          {question.question}
        </h2>
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="w-full text-left p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-lg font-medium text-slate-700 bg-white shadow-sm flex items-center justify-between group"
            >
              {option}
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-emerald-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="flex items-center text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous Question
        </button>
      )}
    </div>
  );
}
