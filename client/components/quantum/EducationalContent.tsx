import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BlochSphereVisualization, BlochSphereMini } from "./BlochSphere";
import {
  createZeroState,
  applySingleQubitGate,
  quantumGates,
  toBlochCoordinates,
  getMeasurementProbabilities,
  QuantumState,
} from "@/lib/quantum";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  Atom,
  Brain,
  Play,
  CheckCircle,
  Clock,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { useUserProgress } from "@/context/UserProgressContext";

interface LessonProgress {
  [key: string]: {
    completed: boolean;
    timeSpent: number;
    score?: number;
  };
}

interface InteractiveState {
  quantumState: QuantumState;
  gateHistory: string[];
  isAnimating: boolean;
}

export function EducationalContent() {
  const { t } = useLanguage();
  const { progress: userProgress, markComplete, updateTimeSpent, setLastActive } = useUserProgress();
  const [activeLesson, setActiveLessonState] = useState(userProgress.lastLessonId || "basics");

  const setActiveLesson = (lessonId: string) => {
    setActiveLessonState(lessonId);
    setLastActive(lessonId);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimeSpent(activeLesson, 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [activeLesson, updateTimeSpent]);

  const progressMap: LessonProgress = {};
  ["basics", "superposition", "entanglement", "gates", "algorithms"].forEach(id => {
    const stats = userProgress.lessons[id];
    progressMap[id] = stats ? {
      completed: stats.completed,
      timeSpent: stats.timeSpent,
      score: stats.score
    } : {
      completed: false,
      timeSpent: 0
    };
  });

  const [demoState, setDemoState] = useState<InteractiveState>({
    quantumState: createZeroState(1),
    gateHistory: [],
    isAnimating: false,
  });

  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const videoIds: Record<string, string> = {
    basics: "p9pPjASnnxw",
    superposition: "IHDMJqJHCQg",
    entanglement: "rqmIVeheTVU",
    gates: "cbPW2hTrMG4",
    algorithms: "vK77GutCzf0",
  };

  const lessons = [
    {
      id: "basics",
      title: t("education.lesson.basics.title"),
      duration: "15 min",
      difficulty: "Beginner",
      description: t("education.lesson.basics.desc"),
      icon: <Atom className="h-5 w-5" />,
    },
    {
      id: "superposition",
      title: t("education.lesson.superposition.title"),
      duration: "20 min",
      difficulty: "Beginner",
      description: t("education.lesson.superposition.desc"),
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: "entanglement",
      title: t("education.lesson.entanglement.title"),
      duration: "25 min",
      difficulty: "Intermediate",
      description: t("education.lesson.entanglement.desc"),
      icon: <Target className="h-5 w-5" />,
    },
    {
      id: "gates",
      title: t("education.lesson.gates.title"),
      duration: "30 min",
      difficulty: "Intermediate",
      description: t("education.lesson.gates.desc"),
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: "algorithms",
      title: t("education.lesson.algorithms.title"),
      duration: "45 min",
      difficulty: "Advanced",
      description: t("education.lesson.algorithms.desc"),
      icon: <Trophy className="h-5 w-5" />,
    },
  ];

  const applyDemoGate = (gateName: keyof typeof quantumGates) => {
    setDemoState((prev) => {
      const newState = applySingleQubitGate(
        prev.quantumState,
        quantumGates[gateName].matrix,
        0,
      );
      return {
        quantumState: newState,
        gateHistory: [...prev.gateHistory, gateName],
        isAnimating: true,
      };
    });

    setTimeout(() => {
      setDemoState((prev) => ({ ...prev, isAnimating: false }));
    }, 500);
  };

  const resetDemo = () => {
    setDemoState({
      quantumState: createZeroState(1),
      gateHistory: [],
      isAnimating: false,
    });
  };

  const markLessonComplete = (lessonId: string) => {
    markComplete(lessonId, 90 + Math.floor(Math.random() * 10));
  };

  const calculateOverallProgress = () => {
    const completed = Object.values(progressMap).filter((p) => p.completed).length;
    return (completed / lessons.length) * 100;
  };

  const submitQuiz = () => {
    setShowQuizResults(true);
    markLessonComplete(activeLesson);
  };

  const getHint = () => {
    const hints = {
      basics: "Think about the fundamental difference between classical and quantum bits.",
      superposition: "Consider the Hadamard gate - it creates an equal probability of both outcomes.",
      entanglement: "Remember that entangled particles share a quantum state.",
      gates: "Each quantum gate represents a unitary transformation.",
      algorithms: "Quantum algorithms leverage superposition and interference.",
    };

    setCurrentHint(hints[activeLesson as keyof typeof hints] || "Keep exploring!");
    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
      setCurrentHint(null);
    }, 8000);
  };

  const demoBlochCoords = toBlochCoordinates(demoState.quantumState);
  const demoProbabilities = getMeasurementProbabilities(demoState.quantumState);
  const demoProbData = demoProbabilities.map((prob, index) => ({
    name: `|${index}⟩`,
    value: prob,
    percentage: (prob * 100).toFixed(1),
  }));

  const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5 text-green-400" />
            {t("education.journey.title")}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {t("education.journey.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">{t("education.stats.overall")}</span>
              <span className="text-green-400 font-semibold">
                {Math.round(calculateOverallProgress())}%
              </span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <div className="text-green-400 text-sm">{t("education.stats.lessons")}</div>
                <div className="text-white text-xl font-bold">
                  {Object.values(progressMap).filter((p) => p.completed).length} / {lessons.length}
                </div>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <div className="text-blue-400 text-sm">{t("education.stats.time")}</div>
                <div className="text-white text-xl font-bold">
                  {Object.values(progressMap).reduce((acc, p) => acc + p.timeSpent, 0)} min
                </div>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <div className="text-purple-400 text-sm">{t("education.stats.score")}</div>
                <div className="text-white text-xl font-bold">
                  {Math.round(
                    Object.values(progressMap)
                      .filter((p) => p.score)
                      .reduce((acc, p) => acc + (p.score || 0), 0) /
                    (Object.values(progressMap).filter((p) => p.score).length || 1)
                  )}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="bg-black/40 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t("education.path.title")}</CardTitle>
            <CardDescription className="text-gray-300">
              {t("education.path.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${activeLesson === lesson.id
                    ? "bg-blue-600/20 border border-blue-500/50"
                    : "bg-gray-800/50 hover:bg-gray-700/50"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {lesson.icon}
                      <span className="text-white font-medium text-sm">
                        {lesson.title}
                      </span>
                    </div>
                    {progressMap[lesson.id]?.completed && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${lesson.difficulty === "Beginner" ? "border-green-500 text-green-400" : "border-yellow-500 text-yellow-400"}`}>
                      {lesson.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </div>
                  </div>
                  {activeLesson === lesson.id && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                      <AspectRatio ratio={16 / 9}>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoIds[lesson.id]}?rel=0&modestbranding=1`}
                          title={`${lesson.title} video lesson`}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                        />
                      </AspectRatio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 lg:col-span-3">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">
                {lessons.find((l) => l.id === activeLesson)?.title}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {lessons.find((l) => l.id === activeLesson)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid grid-cols-4 bg-gray-800/50">
                  <TabsTrigger value="content">{t("education.tab.theory")}</TabsTrigger>
                  <TabsTrigger value="interactive">{t("education.tab.interactive")}</TabsTrigger>
                  <TabsTrigger value="visualization">{t("education.tab.visualization")}</TabsTrigger>
                  <TabsTrigger value="quiz">{t("education.tab.quiz")}</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-6 space-y-6">
                  {activeLesson === "basics" && (
                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">What is a Qubit?</h3>
                      <p className="text-gray-300">Basic unit of quantum information.</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => markLessonComplete(activeLesson)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={progressMap[activeLesson]?.completed}
                    >
                      {progressMap[activeLesson]?.completed ? (
                        <><CheckCircle className="h-4 w-4 mr-2" />{t("education.btn.completed")}</>
                      ) : (
                        <><Play className="h-4 w-4 mr-2" />{t("education.btn.complete")}</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={getHint}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {t("education.btn.hint")}
                    </Button>
                  </div>
                  {showHint && currentHint && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400">{currentHint}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="interactive" className="mt-6">
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(quantumGates).slice(0, 6).map(([key, gate]) => (
                          <Button
                            key={key}
                            onClick={() => applyDemoGate(key as keyof typeof quantumGates)}
                            className="text-xs"
                          >
                            {gate.name}
                          </Button>
                        ))}
                      </div>
                      <Button onClick={resetDemo} variant="outline" className="w-full mt-4">
                        <RotateCcw className="h-4 w-4 mr-2" /> Reset
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <BlochSphereVisualization coordinates={demoBlochCoords} size={250} animated={demoState.isAnimating} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="visualization" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-800/30 border-cyan-500/30">
                      <CardHeader><CardTitle className="text-sm">Bloch Sphere</CardTitle></CardHeader>
                      <CardContent><BlochSphereVisualization coordinates={demoBlochCoords} size={200} /></CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 border-purple-500/30">
                      <CardHeader><CardTitle className="text-sm">Probabilities</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={demoProbData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value">
                                {demoProbData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="mt-6">
                  <div className="bg-orange-500/10 p-4 rounded-lg space-y-4">
                    <p className="text-white">What does H gate do?</p>
                    <Button onClick={submitQuiz}>{showQuizResults ? "Completed" : "Submit"}</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-black/40 border-cyan-500/30 mt-6">
        <CardHeader><CardTitle>Quick Reference</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-bold">Qubit</h4>
              <BlochSphereMini coordinates={{ x: 0, y: 0, z: 1 }} />
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-bold">Hadamard</h4>
              <BlochSphereMini coordinates={{ x: 1, y: 0, z: 0 }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
