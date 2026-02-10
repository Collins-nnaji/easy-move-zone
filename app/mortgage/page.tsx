"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Section } from "@/components/ui/Section"
import { Calculator, PieChart, Landmark, Percent } from "lucide-react"

export default function MortgagePage() {
    const [price, setPrice] = useState(45000000);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [interestRate, setInterestRate] = useState(16);
    const [years, setYears] = useState(15);

    const downPaymentAmount = price * (downPaymentPercent / 100);
    const loanAmount = price - downPaymentAmount;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = years * 12;

    // Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    const monthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-zinc-50 dark:bg-zinc-950">
            <div className="container px-4">

                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Mortgage Calculator</h1>
                    <p className="text-muted-foreground text-lg">
                        Plan your path to homeownership. Estimate your monthly payments and see what you can afford.
                    </p>
                </div>

                {/* Calculator UI */}
                <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">

                    {/* Inputs */}
                    <div className="lg:col-span-4 space-y-8 bg-card p-6 rounded-2xl border border-border shadow-sm h-fit">
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-bold mb-1 block">Property Value</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="w-full p-3 rounded-lg border border-input bg-background font-mono text-lg"
                                />
                                <div className="text-xs text-muted-foreground mt-1 text-right">{formatCurrency(price)}</div>
                            </label>

                            <label className="block">
                                <span className="text-sm font-bold mb-1 block">Down Payment ({downPaymentPercent}%)</span>
                                <input
                                    type="range"
                                    min="10" max="80" step="5"
                                    value={downPaymentPercent}
                                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                                    className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-xs text-muted-foreground mt-1 text-right">{formatCurrency(downPaymentAmount)}</div>
                            </label>

                            <label className="block">
                                <span className="text-sm font-bold mb-1 block">Interest Rate ({interestRate}%)</span>
                                <input
                                    type="range"
                                    min="1" max="30" step="0.5"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-bold mb-1 block">Loan Term ({years} Years)</span>
                                <input
                                    type="range"
                                    min="5" max="30" step="1"
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Estimated Monthly Payment</div>
                                <div className="text-5xl font-black text-primary tracking-tight">{formatCurrency(monthlyPayment)}</div>
                            </div>
                            <Button size="lg" className="px-8 h-12 text-lg">Get Pre-Qualified</Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-card p-6 rounded-xl border border-border text-center">
                                <div className="flex justify-center mb-2"><Landmark className="w-6 h-6 text-muted-foreground" /></div>
                                <div className="text-2xl font-bold mb-1">{formatCurrency(loanAmount)}</div>
                                <div className="text-xs text-muted-foreground">Total Loan Amount</div>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border text-center">
                                <div className="flex justify-center mb-2"><Percent className="w-6 h-6 text-muted-foreground" /></div>
                                <div className="text-2xl font-bold mb-1">{formatCurrency(monthlyPayment * 12 * years - loanAmount)}</div>
                                <div className="text-xs text-muted-foreground">Total Interest Payable</div>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border text-center">
                                <div className="flex justify-center mb-2"><Calculator className="w-6 h-6 text-muted-foreground" /></div>
                                <div className="text-2xl font-bold mb-1">{formatCurrency(monthlyPayment * 12 * years + downPaymentAmount)}</div>
                                <div className="text-xs text-muted-foreground">Total Cost of Property</div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                            <h3 className="font-bold mb-4">Partner Banks</h3>
                            <div className="flex flex-wrap gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                {/* Mock Bank Logos */}
                                <div className="text-xl font-black tracking-tighter">GTBank</div>
                                <div className="text-xl font-black tracking-tighter">Access</div>
                                <div className="text-xl font-black tracking-tighter">Zenith</div>
                                <div className="text-xl font-black tracking-tighter">FirstBank</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
