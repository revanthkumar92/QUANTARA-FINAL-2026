import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Code, GraduationCap, Briefcase } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const groups = [
    {
        id: "quantum_research",
        icon: Code,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
    },
    {
        id: "beginners",
        icon: GraduationCap,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
    },
    {
        id: "career",
        icon: Briefcase,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
    }
];

export function CommunityContent() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t("community.title")}</h2>
                    <p className="text-gray-400">{t("community.desc")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <Card key={group.id} className="bg-black/20 border-white/10 hover:border-cyan-500/50 transition-all duration-300 group">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className={`p-2 ${group.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
                                    <group.icon className={`h-6 w-6 ${group.color}`} />
                                </div>
                            </div>
                            <CardTitle className="text-white mt-4">
                                {t(`community.group.${group.id}.title` as any)}
                            </CardTitle>
                            <CardDescription className="text-gray-400 mt-2">
                                {t(`community.group.${group.id}.desc` as any)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10">
                                <Users className="h-4 w-4 mr-2" />
                                {t("community.join")}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-400" />
                    {t("community.groups.title")}
                </h3>
                <p className="text-gray-300">
                    {t("community.groups.desc")}
                </p>
            </div>
        </div>
    );
}
