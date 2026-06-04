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
    question: "Which city are you looking to rent in?",
    options: ["Mumbai", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Delhi NCR", "Kolkata", "Other"]
  },
  {
    id: "rent",
    question: "What is your expected monthly rent?",
    options: ["Under ₹15,000", "₹15,000–₹30,000", "₹30,000–₹60,000", "₹60,000–₹1 lakh", "₹1 lakh+"]
  },
  {
    id: "deposit_months",
    question: "How many months of deposit has the landlord requested?",
    options: ["1–2 months", "3–5 months", "6–8 months", "9–12 months", "More than 12 months"]
  },
  {
    id: "difficulty",
    question: "How difficult is it for you to arrange this deposit?",
    options: ["Very difficult", "Somewhat difficult", "Manageable", "Not difficult"]
  },
  {
    id: "consider_replacement",
    question: "If you could replace the deposit with a small monthly payment, would you consider it?",
    options: ["Definitely", "Maybe", "Probably not", "No"]
  },
  {
    id: "concern",
    question: "What would be your biggest concern?",
    options: ["Hidden fees", "Claims process", "Landlord acceptance", "Monthly cost", "Data/privacy", "Other"]
  },
  {
    id: "employment",
    question: "What is your employment status?",
    options: ["Salaried", "Freelancer", "Business owner", "Student", "Other"]
  },
  {
    id: "income",
    question: "What is your monthly income range?",
    options: ["Under ₹30,000", "₹30,000–₹50,000", "₹50,000–₹1 lakh", "₹1–2 lakh", "₹2 lakh+"]
  }
];

export default function RenterFlow() {
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
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-medium mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            For Renters
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Move in with lower upfront costs.
          </h1>
          <p className="text-xl text-slate-600">
            Check your eligibility for a deposit-free move in less than 2 minutes.
          </p>
          <Button size="lg" onClick={() => setCurrentStep(0)} className="text-lg h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all">
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
          <div className="bg-emerald-500 p-8 text-center text-white">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You may qualify!</h2>
            <p className="text-emerald-50">For a RentShield deposit replacement plan.</p>
          </div>
          <CardContent className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Lower move-in cost</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Faster approvals</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Landlord protection included</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" className="h-12" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" className="h-12" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="h-12" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white mt-4 text-lg rounded-xl shadow-sm">
                Join Early Access
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
              className="w-full text-left p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-lg font-medium text-slate-700 bg-white shadow-sm flex items-center justify-between group"
            >
              {option}
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
