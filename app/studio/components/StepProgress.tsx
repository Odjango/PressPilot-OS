"use client";

import { Check } from "lucide-react";

interface Step {
    id: number;
    label: string;
}

interface StepProgressProps {
    steps: Step[];
    currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
    return (
        <div className="relative mb-12">
            <div className="absolute top-5 h-0.5 w-full bg-neutral-100" aria-hidden="true" />
            <div
                className="absolute top-5 h-0.5 bg-black transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                aria-hidden="true"
            />

            <div className="relative flex justify-between">
                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted
                                        ? "bg-black border-black text-white"
                                        : isActive
                                            ? "bg-white border-black text-black ring-4 ring-black/5"
                                            : "bg-white border-neutral-200 text-neutral-400"
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-bold">{step.id}</span>
                                )}
                            </div>
                            <span
                                className={`mt-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isActive ? "text-black" : "text-neutral-400"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
