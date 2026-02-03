import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantumVisualizer } from "@/components/quantum/QuantumVisualizer";
import { InteractiveGates } from "@/components/quantum/InteractiveGates";
import { EducationalContent } from "@/components/quantum/EducationalContent";
import { AdvancedOperations } from "@/components/quantum/AdvancedOperations";
import { LibraryContent } from "@/components/quantum/LibraryContent";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import {
  Atom,
  Zap,
  BookOpen,
  Settings,
  Github,
  ExternalLink,
  LogOut,
  Library,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { logAction } from "@/lib/firebase";

export default function Index() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userName, setUserName] = useState("");

  const handleTabChange = (value: string) => {
    logAction(`tab_switched_${value}`);
  };


  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("quantaraUser");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("quantaraUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Atom className="h-8 w-8 text-cyan-400" />
                <div className="absolute inset-0 animate-pulse">
                  <Atom className="h-8 w-8 text-cyan-300 opacity-50" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t("app.title")}</h1>
                <p className="text-sm text-cyan-400">
                  {t("app.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              {userName && (
                <span className="text-white text-sm">
                  {t("header.welcome")}<span className="font-semibold text-cyan-400">{userName}</span>
                </span>
              )}
              <Badge
                variant="outline"
                className="border-cyan-400 text-cyan-400"
              >
                APSCHE-2025
              </Badge>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <a
                  href="https://github.com/revanthkumar92/QUANTARA-FINAL-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  {t("header.viewCode")}
                </a>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("header.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t("hero.title")}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>

        <Tabs defaultValue="visualizer" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5 bg-black/30 border border-white/10">
            <TabsTrigger
              value="visualizer"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.visualizer")}</span>
              <span className="sm:hidden">Visualize</span>
            </TabsTrigger>
            <TabsTrigger
              value="gates"
              className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              <Atom className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.gates")}</span>
              <span className="sm:hidden">Gates</span>
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.education")}</span>
              <span className="sm:hidden">Learn</span>
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.library")}</span>
              <span className="sm:hidden">Lib</span>
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.advanced")}</span>
              <span className="sm:hidden">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="visualizer" className="space-y-6">
              <QuantumVisualizer />
            </TabsContent>

            <TabsContent value="gates" className="space-y-6">
              <InteractiveGates />
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <EducationalContent />
            </TabsContent>

            <TabsContent value="library" className="space-y-6">
              <LibraryContent />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <AdvancedOperations />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Atom className="h-5 w-5 text-cyan-400" />
              <span>{t("footer.rights")}</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <a
                  href="https://quantum-computing.ibm.com/composer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("footer.ibm")}
                </a>
              </Button>
              <Badge
                variant="outline"
                className="border-cyan-400 text-cyan-400"
              >
                Built for APSCHE-2025
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
