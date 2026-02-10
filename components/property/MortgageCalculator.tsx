"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Calculator } from "lucide-react"

interface MortgageCalculatorProps {
    price: number;
    type: 'rent' | 'buy' | 'shortlet';
}

export function MortgageCalculator({ price, type }: MortgageCalculatorProps) {
    const [downPayment, setDownPayment] = useState(20); // percent
    const [interestRate, setInterestRate] = useState(15); // percent
    const [years, setYears] = useState(20);
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    useEffect(() => {
        calculate();
    }, [downPayment, interestRate, years, price]);

    const calculate = () => {
        if (type === 'rent') {
            // Simple rent divider for now, maybe add agency fees later
            setMonthlyPayment(price / 12);
            return;
        }

        const principal = price * (1 - downPayment / 100);
        const monthlyInterest = interestRate / 100 / 12;
        const numberOfPayments = years * 12;

        const payment = (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) / (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);
        setMonthlyPayment(payment);
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);
    }

    if (type === 'shortlet') return null;

    return (
        <div className="bg-card border border-border rounded-xl p-6 mt-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                {type === 'buy' ? 'Mortgage Estimator' : 'Rent Breakdown'}
            </h3>

            {type === 'buy' ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Down Payment (%)</label>
                            <input
                                type="number"
                                value={downPayment}
                                onChange={(e) => setDownPayment(Number(e.target.value))}
                                className="w-full p-2 rounded-md border border-input bg-background"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Interest Rate (%)</label>
                            <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full p-2 rounded-md border border-input bg-background"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Loan Duration (Years)</label>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <div className="text-right text-xs text-muted-foreground">{years} Years</div>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground mb-4">
                    Estimated monthly breakdown based on annual rent. Excluding service charge and agency fees.
                </p>
            )}

            <div className="mt-6 pt-6 border-t border-border">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-muted-foreground">Est. Monthly Payment</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(monthlyPayment)}</span>
                </div>
            </div>
        </div>
    )
}
