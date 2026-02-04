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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BlochSphereVisualization, BlochSphereMini } from "./BlochSphere";
import {
  createZeroState,
  applySingleQubitGate,
  quantumGates,
  toBlochCoordinates,
  getMeasurementProbabilities,
  bellState,
  QuantumState,
} from "@/lib/quantum";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
  Eye,
  Shuffle,
  RotateCcw,
} from "lucide-react";

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
  const [activeLesson, setActiveLesson] = useState("basics");
  const [progress, setProgress] = useState<LessonProgress>({
    basics: { completed: true, timeSpent: 25, score: 95 },
    superposition: { completed: true, timeSpent: 18, score: 88 },
    entanglement: { completed: false, timeSpent: 12 },
    gates: { completed: false, timeSpent: 0 },
    algorithms: { completed: false, timeSpent: 0 },
  });

  // Interactive demonstration state
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

  // Interactive demonstration functions
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
    setProgress((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        completed: true,
        score: 90 + Math.floor(Math.random() * 10),
      },
    }));
  };

  const calculateOverallProgress = () => {
    const completed = Object.values(progress).filter((p) => p.completed).length;
    return (completed / lessons.length) * 100;
  };

  const submitQuiz = () => {
    setShowQuizResults(true);
    markLessonComplete(activeLesson);
  };

  const getHint = () => {
    const hints = {
      basics:
        "Think about the fundamental difference between classical and quantum bits. What property allows qubits to be in multiple states?",
      superposition:
        "Consider the Hadamard gate - it transforms a definite state into an equal probability of both outcomes.",
      entanglement:
        "Remember that entangled particles share a quantum state - measuring one instantly affects the other.",
      gates:
        "Each quantum gate represents a unitary transformation that preserves the total probability.",
      algorithms:
        "Quantum algorithms leverage superposition and interference to achieve computational advantages.",
    };

    setCurrentHint(
      hints[activeLesson as keyof typeof hints] ||
      "Keep exploring the quantum concepts and try the interactive demonstrations!",
    );
    setShowHint(true);

    setTimeout(() => {
      setShowHint(false);
      setCurrentHint(null);
    }, 8000);
  };

  // Get current demo state info
  const demoBlochCoords = toBlochCoordinates(demoState.quantumState);
  const demoProbabilities = getMeasurementProbabilities(demoState.quantumState);
  const demoProbData = demoProbabilities.map((prob, index) => ({
    name: `|${index}⟩`,
    value: prob,
    percentage: (prob * 100).toFixed(1),
  }));

  // Colors for pie chart
  const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6">
      {/* Learning Progress */}
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
                  {Object.values(progress).filter((p) => p.completed).length} /{" "}
                  {lessons.length}
                </div>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <div className="text-blue-400 text-sm">{t("education.stats.time")}</div>
                <div className="text-white text-xl font-bold">
                  {Object.values(progress).reduce(
                    (acc, p) => acc + p.timeSpent,
                    0,
                  )}{" "}
                  min
                </div>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <div className="text-purple-400 text-sm">{t("education.stats.score")}</div>
                <div className="text-white text-xl font-bold">
                  {Math.round(
                    Object.values(progress)
                      .filter((p) => p.score)
                      .reduce((acc, p) => acc + (p.score || 0), 0) /
                    Object.values(progress).filter((p) => p.score).length,
                  ) || 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Lesson List */}
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
                    {progress[lesson.id]?.completed && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${lesson.difficulty === "Beginner"
                        ? "border-green-500 text-green-400"
                        : lesson.difficulty === "Intermediate"
                          ? "border-yellow-500 text-yellow-400"
                          : "border-red-500 text-red-400"
                        }`}
                    >
                      {lesson.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </div>

                    {activeLesson === lesson.id && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                        <AspectRatio ratio={16 / 9}>
                          <iframe
                            src={`https://www.youtube.com/embed/${videoIds[lesson.id]}?rel=0&modestbranding=1`}
                            title={`${lesson.title} video lesson`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </AspectRatio>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lesson Content */}
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
                <div className="overflow-x-auto pb-2 -mx-1 px-1">
                  <TabsList className="flex w-full min-w-max md:grid md:grid-cols-4 bg-gray-800/50">
                    <TabsTrigger value="content" className="flex-1 px-4">{t("education.tab.theory")}</TabsTrigger>
                    <TabsTrigger value="interactive" className="flex-1 px-4">{t("education.tab.interactive")}</TabsTrigger>
                    <TabsTrigger value="visualization" className="flex-1 px-4">{t("education.tab.visualization")}</TabsTrigger>
                    <TabsTrigger value="quiz" className="flex-1 px-4">{t("education.tab.quiz")}</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="content" className="mt-6">
                  <div className="space-y-6">
                    {activeLesson === "basics" && (
                      <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            What is a Qubit?
                          </h3>
                          <p className="text-gray-300 mb-4">
                            A qubit (quantum bit) is the basic unit of quantum
                            information. Unlike classical bits that can only be
                            0 or 1, qubits can exist in a superposition of both
                            states simultaneously.
                          </p>
                          <div className="bg-gray-800/50 p-3 rounded font-mono text-sm text-cyan-400">
                            |ψ⟩ = α|0⟩ + β|1⟩
                          </div>
                          <p className="text-gray-400 text-sm mt-2">
                            Where α and β are complex amplitudes, and |α|² +
                            |β|² = 1
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              Classical Bit
                            </h3>
                            <div className="space-y-2 text-gray-300">
                              <p>✓ Definite state: 0 OR 1</p>
                              <p>✓ Predictable behavior</p>
                              <p>✗ Limited computational power</p>
                            </div>
                          </div>

                          <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              Quantum Bit
                            </h3>
                            <div className="space-y-2 text-gray-300">
                              <p>✓ Superposition: 0 AND 1</p>
                              <p>✓ Exponential possibilities</p>
                              <p>✓ Quantum parallelism</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeLesson === "superposition" && (
                      <div className="space-y-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Understanding Superposition
                          </h3>
                          <p className="text-gray-300 mb-4">
                            Superposition allows qubits to be in multiple states
                            at once. This is what gives quantum computers their
                            computational advantage.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-3 rounded">
                              <div className="text-sm text-gray-400">
                                Classical Processing
                              </div>
                              <div className="text-white">
                                Sequential: Check each possibility one by one
                              </div>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded">
                              <div className="text-sm text-gray-400">
                                Quantum Processing
                              </div>
                              <div className="text-white">
                                Parallel: Check all possibilities simultaneously
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            The Hadamard Gate
                          </h3>
                          <p className="text-gray-300 mb-4">
                            The Hadamard gate creates superposition by
                            transforming |0⟩ into (|0⟩ + |1⟩)/√2
                          </p>
                          <div className="bg-gray-800/50 p-3 rounded font-mono text-sm text-cyan-400">
                            H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩
                          </div>
                        </div>
                      </div>
                    )}

                    {activeLesson === "entanglement" && (
                      <div className="space-y-4">
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Quantum Entanglement
                          </h3>
                          <p className="text-gray-300 mb-4">
                            Entanglement creates quantum correlations between
                            qubits, where measuring one instantly affects the
                            other, regardless of distance.
                          </p>
                          <div className="bg-gray-800/50 p-3 rounded font-mono text-sm text-cyan-400">
                            |Φ+⟩ = (|00⟩ + |11⟩)/√2
                          </div>
                          <p className="text-gray-400 text-sm mt-2">
                            This is a Bell state - if we measure the first qubit
                            as 0, the second will always be 0
                          </p>
                        </div>

                        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Einstein's "Spooky Action"
                          </h3>
                          <p className="text-gray-300">
                            Einstein called entanglement "spooky action at a
                            distance" because it seemed to violate locality.
                            However, quantum mechanics has been experimentally
                            verified countless times.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeLesson === "gates" && (
                      <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Quantum Gates Overview
                          </h3>
                          <p className="text-gray-300 mb-3">
                            Quantum gates are unitary operations that rotate
                            qubit states on the Bloch sphere and form the
                            building blocks of quantum circuits.
                          </p>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            <li>
                              <span className="text-white font-medium">
                                Pauli-X (X):
                              </span>{" "}
                              Bit-flip (|0⟩ ↔ |1⟩).
                            </li>
                            <li>
                              <span className="text-white font-medium">
                                Pauli-Z (Z):
                              </span>{" "}
                              Phase-flip (adds a -1 phase to |1⟩).
                            </li>
                            <li>
                              <span className="text-white font-medium">
                                Hadamard (H):
                              </span>{" "}
                              Creates superposition |0⟩ → (|0⟩+|1⟩)/√2.
                            </li>
                            <li>
                              <span className="text-white font-medium">
                                Phase (S, T):
                              </span>{" "}
                              Add controlled phase rotations.
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeLesson === "algorithms" && (
                      <div className="space-y-4">
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Quantum Algorithms Overview
                          </h3>
                          <p className="text-gray-300 mb-3">
                            Algorithms exploit superposition, interference, and
                            entanglement to achieve speedups over classical
                            methods.
                          </p>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            <li>
                              <span className="text-white font-medium">
                                Deutsch–Jozsa:
                              </span>{" "}
                              Distinguish constant vs balanced functions in one
                              query.
                            </li>
                            <li>
                              <span className="text-white font-medium">
                                Grover's Search:
                              </span>{" "}
                              Quadratic speedup for unstructured search.
                            </li>
                            <li>
                              <span className="text-white font-medium">
                                Quantum Fourier Transform:
                              </span>{" "}
                              Key subroutine in many algorithms.
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">
                        Video Lesson
                      </h3>
                      <AspectRatio ratio={16 / 9}>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoIds[activeLesson]}?rel=0&modestbranding=1`}
                          title={`${lessons.find((l) => l.id === activeLesson)?.title} video lesson`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </AspectRatio>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => markLessonComplete(activeLesson)}
                        className="bg-green-600 hover:bg-green-700 cursor-glow btn-quantum-press ripple-effect magnetic-hover"
                        disabled={progress[activeLesson]?.completed}
                      >
                        {progress[activeLesson]?.completed ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t("education.btn.completed")}
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            {t("education.btn.complete")}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-600 cursor-glow btn-quantum-press btn-shine border-quantum-glow"
                        onClick={getHint}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {t("education.btn.hint")}
                      </Button>
                    </div>

                    {/* Hint Display */}
                    {showHint && currentHint && (
                      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg animate-in slide-in-from-top">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-yellow-400 font-semibold mb-1">
                              Hint
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {currentHint}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="interactive" className="mt-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Interactive Quantum State Manipulation
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Interactive Controls */}
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="text-white font-medium">
                              Apply Quantum Gates:
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.entries(quantumGates)
                                .slice(0, 6)
                                .map(([key, gate]) => (
                                  <Button
                                    key={key}
                                    size="sm"
                                    onClick={() =>
                                      applyDemoGate(
                                        key as keyof typeof quantumGates,
                                      )
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                                    disabled={demoState.isAnimating}
                                  >
                                    {gate.name}
                                  </Button>
                                ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-white font-medium">
                              Applied Gates:
                            </h4>
                            <div className="bg-gray-800/50 p-3 rounded min-h-[80px]">
                              {demoState.gateHistory.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {demoState.gateHistory.map((gate, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="border-cyan-400 text-cyan-400"
                                    >
                                      {gate}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-sm">
                                  No gates applied yet
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={resetDemo}
                            variant="outline"
                            className="w-full border-gray-600"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset to |0⟩
                          </Button>
                        </div>

                        {/* Real-time Visualization */}
                        <div className="space-y-4">
                          <BlochSphereVisualization
                            coordinates={demoBlochCoords}
                            size={250}
                            animated={demoState.isAnimating}
                          />
                          <div className="text-center">
                            <Badge
                              variant="outline"
                              className="border-cyan-400 text-cyan-400"
                            >
                              Current State Vector
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="exercises"
                        className="border-gray-600"
                      >
                        <AccordionTrigger className="text-white hover:text-gray-300">
                          Practice Exercises
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <div className="space-y-3">
                            <div className="p-3 bg-gray-800/50 rounded">
                              <p className="font-medium">
                                Exercise 1: Create a superposition state
                              </p>
                              <p className="text-sm text-gray-400">
                                Apply a Hadamard gate to |0⟩ and observe the
                                Bloch sphere
                              </p>
                            </div>
                            <div className="p-3 bg-gray-800/50 rounded">
                              <p className="font-medium">
                                Exercise 2: Explore phase gates
                              </p>
                              <p className="text-sm text-gray-400">
                                Apply H, then S, then H again. What happens?
                              </p>
                            </div>
                            <div className="p-3 bg-gray-800/50 rounded">
                              <p className="font-medium">
                                Exercise 3: Return to |0⟩
                              </p>
                              <p className="text-sm text-gray-400">
                                From |+⟩ state, find a sequence to return to |0⟩
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="visualization" className="mt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Bloch Sphere */}
                      <Card className="bg-gray-800/30 border-cyan-500/30">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">
                            Bloch Sphere Representation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <BlochSphereVisualization
                            coordinates={demoBlochCoords}
                            size={200}
                          />
                          <div className="mt-3 text-xs text-gray-400 space-y-1">
                            <div>X: {demoBlochCoords.x.toFixed(3)}</div>
                            <div>Y: {demoBlochCoords.y.toFixed(3)}</div>
                            <div>Z: {demoBlochCoords.z.toFixed(3)}</div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Probability Distribution */}
                      <Card className="bg-gray-800/30 border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">
                            Measurement Probabilities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={demoProbData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={60}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percentage }) =>
                                    `${name}: ${percentage}%`
                                  }
                                >
                                  {demoProbData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* State Information */}
                    <Card className="bg-gray-800/30 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">
                          Quantum State Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-white font-medium mb-2">
                              State Vector
                            </h4>
                            <div className="bg-gray-900/50 p-3 rounded font-mono text-sm">
                              {demoState.quantumState.amplitudes.map(
                                (amp, index) => (
                                  <div key={index} className="text-cyan-400">
                                    |{index}⟩: {amp.real.toFixed(3)} +{" "}
                                    {amp.imaginary.toFixed(3)}i
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-white font-medium mb-2">
                              Measurement Outcomes
                            </h4>
                            <div className="space-y-2">
                              {demoProbData.map((prob, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-300">
                                    {prob.name}
                                  </span>
                                  <span className="text-white">
                                    {prob.percentage}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="mt-6">
                  <div className="space-y-6">
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Knowledge Check
                      </h3>

                      <div className="space-y-6">
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <p className="text-white mb-3">
                            What is the result of applying a Hadamard gate to
                            |0⟩?
                          </p>
                          <div className="space-y-2">
                            {[
                              { id: "a", text: "|1⟩" },
                              { id: "b", text: "(|0⟩ + |1⟩)/√2" },
                              { id: "c", text: "(|0⟩ - |1⟩)/√2" },
                              { id: "d", text: "|0⟩" },
                            ].map((option) => (
                              <label
                                key={option.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name="q1"
                                  value={option.id}
                                  onChange={(e) =>
                                    setQuizAnswers((prev) => ({
                                      ...prev,
                                      q1: e.target.value,
                                    }))
                                  }
                                  className="text-orange-500"
                                />
                                <span className="text-gray-300">
                                  {option.id.toUpperCase()}) {option.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <p className="text-white mb-3">
                            In which space do qubits exist that allows
                            superposition?
                          </p>
                          <div className="space-y-2">
                            {[
                              { id: "a", text: "Classical space" },
                              { id: "b", text: "Hilbert space" },
                              { id: "c", text: "Euclidean space" },
                              { id: "d", text: "Binary space" },
                            ].map((option) => (
                              <label
                                key={option.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name="q2"
                                  value={option.id}
                                  onChange={(e) =>
                                    setQuizAnswers((prev) => ({
                                      ...prev,
                                      q2: e.target.value,
                                    }))
                                  }
                                  className="text-orange-500"
                                />
                                <span className="text-gray-300">
                                  {option.id.toUpperCase()}) {option.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {showQuizResults && (
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <h4 className="text-green-400 font-semibold mb-2">
                              Quiz Results
                            </h4>
                            <p className="text-white">
                              Great job! You got 2/2 correct.
                            </p>
                            <p className="text-gray-300 text-sm mt-2">
                              Correct answers: B) (|0⟩ + |1⟩)/√2, B) Hilbert
                              space
                            </p>
                          </div>
                        )}

                        <div className="text-center">
                          <Button
                            onClick={submitQuiz}
                            className="bg-orange-600 hover:bg-orange-700 cursor-glow btn-quantum-press ripple-effect btn-shine"
                            disabled={showQuizResults}
                          >
                            {showQuizResults ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Quiz Completed
                              </>
                            ) : (
                              "Submit Quiz"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Reference & Mini Visualizations */}
      <Card className="bg-black/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white">
            Quick Reference & Mini Lab
          </CardTitle>
          <CardDescription className="text-gray-300">
            Essential formulas with interactive mini-visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Qubit State</h4>
              <div className="font-mono text-cyan-400 text-sm mb-2">
                |ψ⟩ = α|0⟩ + β|1⟩
              </div>
              <div className="text-gray-400 text-xs mb-2">|α|² + |β|² = 1</div>
              <BlochSphereMini coordinates={{ x: 0, y: 0, z: 1 }} />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Hadamard</h4>
              <div className="font-mono text-cyan-400 text-sm mb-2">
                H = (1/√2)[1 1]
              </div>
              <div className="font-mono text-cyan-400 text-sm mb-2 ml-12">
                [1 -1]
              </div>
              <BlochSphereMini coordinates={{ x: 1, y: 0, z: 0 }} />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Bell State</h4>
              <div className="font-mono text-cyan-400 text-sm mb-2">
                |Φ+⟩ = (|00⟩ + |11⟩)/√2
              </div>
              <div className="text-gray-400 text-xs mb-2">
                Maximum entanglement
              </div>
              <BlochSphereMini coordinates={{ x: 0, y: 0, z: 0 }} />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Pauli-X</h4>
              <div className="font-mono text-cyan-400 text-sm mb-2">
                X = [0 1]
              </div>
              <div className="font-mono text-cyan-400 text-sm mb-2 ml-8">
                [1 0]
              </div>
              <BlochSphereMini coordinates={{ x: 0, y: 0, z: -1 }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
