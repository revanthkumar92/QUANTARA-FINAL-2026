import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Globe, Languages, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

const LANGUAGES = [
    { code: "en", name: "English", native: "English", color: "from-gray-500 to-slate-600" },
    { code: "hi", name: "Hindi", native: "हिन्दी", color: "from-orange-400 to-red-500" },
    { code: "te", name: "Telugu", native: "తెలుగు", color: "from-blue-400 to-cyan-500" },
    { code: "ta", name: "Tamil", native: "தமிழ்", color: "from-yellow-400 to-orange-500" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", color: "from-red-400 to-pink-500" },
];

export function LanguageSelector() {
    const { language: selectedLang, setLanguage: setSelectedLang } = useLanguage();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-white hover:bg-white/10 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Languages className="h-4 w-4 mr-2 text-cyan-400" />
                    <span>Language</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] border-l border-white/10 bg-black/95 backdrop-blur-xl text-white">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="h-6 w-6 text-cyan-400 animate-pulse" />
                        Select Language
                    </SheetTitle>
                    <p className="text-sm text-gray-400">
                        Choose your preferred language for the interface
                    </p>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                    <div className="grid gap-3">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Available Languages</h3>

                        {LANGUAGES.map((lang) => (
                            <div
                                key={lang.code}
                                className={`p-4 rounded-xl border border-white/10 cursor-pointer transition-all duration-300 hover:border-white/30 hover:bg-white/5 group relative overflow-hidden ${selectedLang === lang.code ? "bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : ""
                                    }`}
                                onClick={() => setSelectedLang(lang.code)}
                            >
                                {/* Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${lang.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${lang.color} flex items-center justify-center text-sm font-bold shadow-lg text-white`}>
                                            {lang.code.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-cyan-200 transition-colors">
                                                {lang.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {lang.native}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedLang === lang.code && (
                                        <div className="h-6 w-6 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
