import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Atom, Zap, BookOpen, Users } from "lucide-react";

const steps = [
    {
        titleKey: "onboarding.welcome.title",
        descKey: "onboarding.welcome.desc",
        icon: Atom,
        color: "text-cyan-400",
    },
    {
        titleKey: "onboarding.visualizer.title",
        descKey: "onboarding.visualizer.desc",
        icon: Zap,
        color: "text-blue-400",
    },
    {
        titleKey: "onboarding.gates.title",
        descKey: "onboarding.gates.desc",
        icon: Atom,
        color: "text-purple-400",
    },
    {
        titleKey: "onboarding.education.title",
        descKey: "onboarding.education.desc",
        icon: BookOpen,
        color: "text-green-400",
    },
    {
        titleKey: "onboarding.community.title",
        descKey: "onboarding.community.desc",
        icon: Users,
        color: "text-pink-400",
    },
];

export function OnboardingTour() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const userData = localStorage.getItem("quantaraUser");
        if (!userData) return;

        const user = JSON.parse(userData);
        const userKey = `quantara_onboarding_completed_${user.name}`;

        const completed = localStorage.getItem(userKey);
        if (!completed) {
            const timer = setTimeout(() => {
                setOpen(true);
            }, 1000); // 1s delay for content to settle
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const handleSkip = () => {
        completeTour();
    };

    const completeTour = () => {
        const userData = localStorage.getItem("quantaraUser");
        if (userData) {
            const user = JSON.parse(userData);
            localStorage.setItem(`quantara_onboarding_completed_${user.name}`, "true");
        }
        setOpen(false);
    };

    const step = steps[currentStep];
    const StepIcon = step.icon;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-full bg-white/5 ${step.color}`}>
                            <StepIcon className="h-10 w-10" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl text-center font-bold">
                        {t(step.titleKey as any)}
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 text-center text-base pt-2">
                        {t(step.descKey as any)}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center gap-1 mt-4">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-8 rounded-full transition-colors ${i === currentStep ? "bg-cyan-500" : "bg-white/10"
                                }`}
                        />
                    ))}
                </div>
                <DialogFooter className="mt-6 flex-row justify-between gap-4 sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleSkip}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        {t("onboarding.btn.skip")}
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
                    >
                        {currentStep === steps.length - 1
                            ? t("onboarding.btn.finish")
                            : t("onboarding.btn.next")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
