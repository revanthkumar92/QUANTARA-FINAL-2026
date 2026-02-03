import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlochSphereVisualization, BlochSphereCompact } from "./BlochSphere";
import {
  createZeroState,
  applySingleQubitGate,
  quantumGates,
  toBlochCoordinates,
  getMeasurementProbabilities,
  bellState,
  ghzState,
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
} from "recharts";
import { Play, RotateCcw, Download, Atom, Zap, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function QuantumVisualizer() {
  const { t } = useLanguage();
  const [currentState, setCurrentState] = useState<QuantumState>(() =>
    createZeroState(1),
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("zero");
  const [executionHistory, setExecutionHistory] = useState<QuantumState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  const blochCoords =
    currentState.numQubits === 1
      ? toBlochCoordinates(currentState)
      : { x: 0, y: 0, z: 1 };

  const probabilities = getMeasurementProbabilities(currentState);

  // Prepare probability data for chart
  const probabilityData = probabilities.map((prob, index) => ({
    state: `|${index.toString(2).padStart(currentState.numQubits, "0")}⟩`,
    probability: (prob * 100).toFixed(1),
    value: prob,
  }));

  const applyGate = (gateName: keyof typeof quantumGates) => {
    if (currentState.numQubits === 1) {
      const gate = quantumGates[gateName];
      const newState = applySingleQubitGate(currentState, gate.matrix, 0);
      setCurrentState({
        ...newState,
        name: `${gateName}|${currentState.name?.split("|")[1] || "0⟩"}`,
      });

      // Add to execution history
      setExecutionHistory((prev) => [...prev, newState]);
      setCurrentStep((prev) => prev + 1);

      // Animate
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const loadPreset = (preset: string) => {
    setSelectedPreset(preset);
    setExecutionHistory([]);
    setCurrentStep(0);

    switch (preset) {
      case "zero":
        setCurrentState(createZeroState(1));
        break;
      case "one":
        const oneState = createZeroState(1);
        const newOneState = applySingleQubitGate(
          oneState,
          quantumGates.X.matrix,
          0,
        );
        setCurrentState(newOneState);
        break;
      case "plus":
        const plusState = createZeroState(1);
        const newPlusState = applySingleQubitGate(
          plusState,
          quantumGates.H.matrix,
          0,
        );
        setCurrentState(newPlusState);
        break;
      case "bell":
        setCurrentState(bellState());
        break;
      case "ghz":
        setCurrentState(ghzState());
        break;
    }
  };

  const resetState = () => {
    setCurrentState(createZeroState(1));
    setSelectedPreset("zero");
    setExecutionHistory([]);
    setCurrentStep(0);
  };

  const stepBack = () => {
    if (executionHistory.length > 0 && currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setCurrentState(executionHistory[prevStep] || createZeroState(1));
    }
  };

  const stepForward = () => {
    if (currentStep < executionHistory.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCurrentState(executionHistory[nextStep]);
    }
  };

  const playHistory = () => {
    if (executionHistory.length === 0) return;

    setIsPlaying(true);
    let step = 0;

    const playInterval = setInterval(() => {
      if (step < executionHistory.length) {
        setCurrentStep(step);
        setCurrentState(executionHistory[step]);
        step++;
      } else {
        clearInterval(playInterval);
        setIsPlaying(false);
      }
    }, playbackSpeed);
  };

  const stopPlaying = () => {
    setIsPlaying(false);
  };

  const exportHistory = () => {
    const historyData = {
      executionHistory: executionHistory.map((state, index) => ({
        step: index,
        state: state,
        blochCoords: state.numQubits === 1 ? toBlochCoordinates(state) : null,
        probabilities: getMeasurementProbabilities(state),
      })),
      metadata: {
        totalSteps: executionHistory.length,
        currentStep,
        timestamp: new Date().toISOString(),
      },
    };

    const jsonString = JSON.stringify(historyData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quantum_execution_history_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Main Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Bloch Sphere Visualization */}
        <Card className="bg-black/40 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Atom className="h-5 w-5 text-cyan-400" />
              {t("visualizer.bloch.title")}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {t("visualizer.bloch.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <BlochSphereVisualization
                coordinates={blochCoords}
                size={400}
                animated={isAnimating}
              />

              {/* State Information */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Current State:</span>
                  <Badge
                    variant="outline"
                    className="border-cyan-400 text-cyan-400"
                  >
                    {currentState.name || `${currentState.numQubits} qubit(s)`}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-red-500/20 p-2 rounded">
                    <div className="text-red-400">
                      X: {blochCoords.x.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-green-500/20 p-2 rounded">
                    <div className="text-green-400">
                      Y: {blochCoords.y.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-blue-500/20 p-2 rounded">
                    <div className="text-blue-400">
                      Z: {blochCoords.z.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Probability Distribution */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              {t("visualizer.prob.title")}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {t("visualizer.prob.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={probabilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="state" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f3f4f6",
                      }}
                      formatter={(value) => [`${value}%`, "Probability"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#gradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Probability Details */}
              <div className="space-y-2">
                {probabilityData.slice(0, 4).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-400">{item.state}</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={parseFloat(item.probability)}
                        className="w-20 h-2"
                      />
                      <span className="text-xs text-gray-300 w-12">
                        {item.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quantum Gates */}
        <Card className="bg-black/40 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t("visualizer.gates.title")}</CardTitle>
            <CardDescription className="text-gray-300">
              {t("visualizer.gates.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(quantumGates).map(([key, gate]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyGate(key as keyof typeof quantumGates)}
                    disabled={currentState.numQubits !== 1 || isAnimating}
                    className={`border-gray-600 hover:bg-gray-700 text-white ${isAnimating ? "animate-pulse" : ""
                      }`}
                  >
                    {gate.name}
                  </Button>
                ))}
              </div>

              <Separator className="bg-gray-600" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Gate Info</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>
                    <strong>H:</strong> Creates superposition
                  </p>
                  <p>
                    <strong>X:</strong> Bit flip (NOT gate)
                  </p>
                  <p>
                    <strong>Y:</strong> Bit + phase flip
                  </p>
                  <p>
                    <strong>Z:</strong> Phase flip
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preset States */}
        <Card className="bg-black/40 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t("visualizer.presets.title")}</CardTitle>
            <CardDescription className="text-gray-300">
              {t("visualizer.presets.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedPreset} onValueChange={loadPreset}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a preset state" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="zero">|0⟩ Zero State</SelectItem>
                  <SelectItem value="one">|1⟩ One State</SelectItem>
                  <SelectItem value="plus">|+⟩ Plus State</SelectItem>
                  <SelectItem value="bell">Bell State (2-qubit)</SelectItem>
                  <SelectItem value="ghz">GHZ State (3-qubit)</SelectItem>
                </SelectContent>
              </Select>

              {/* State Preview */}
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">
                  State Preview
                </h4>
                <BlochSphereCompact coordinates={blochCoords} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution History */}
        <Card className="bg-black/40 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t("visualizer.history.title")}</CardTitle>
            <CardDescription className="text-gray-300">
              {t("visualizer.history.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Step:</span>
                <span className="text-yellow-400 font-mono">
                  {currentStep} / {executionHistory.length}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stepBack}
                  disabled={currentStep === 0 || isPlaying}
                  className="border-gray-600 hover:bg-gray-700"
                >
                  ← Back
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stepForward}
                  disabled={
                    currentStep >= executionHistory.length - 1 || isPlaying
                  }
                  className="border-gray-600 hover:bg-gray-700"
                >
                  Forward →
                </Button>
              </div>

              {/* Playback Controls */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={isPlaying ? stopPlaying : playHistory}
                  disabled={executionHistory.length === 0}
                  className="border-gray-600 hover:bg-gray-700 cursor-glow btn-quantum-press magnetic-hover border-quantum-glow"
                >
                  <Play
                    className={`h-4 w-4 mr-2 ${isPlaying ? "animate-pulse" : ""}`}
                  />
                  {isPlaying ? "Stop" : "Play"}
                </Button>
              </div>

              {/* History Timeline */}
              {executionHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">Timeline</div>
                  <div className="flex gap-1 overflow-x-auto">
                    {executionHistory.slice(0, 10).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isPlaying) {
                            setCurrentStep(index);
                            setCurrentState(executionHistory[index]);
                          }
                        }}
                        disabled={isPlaying}
                        className={`w-6 h-6 rounded text-xs transition-colors timeline-btn ${currentStep === index
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    {executionHistory.length > 10 && (
                      <span className="text-xs text-gray-400 self-center">
                        ...
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Separator className="bg-gray-600" />

              <div className="flex gap-2">
                <Button
                  onClick={resetState}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700 cursor-glow btn-quantum-press ripple-effect"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700 cursor-glow btn-quantum-press btn-shine"
                  onClick={exportHistory}
                  disabled={executionHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mathematical Details */}
      <Card className="bg-black/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white">
            {t("visualizer.math.title")}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {t("visualizer.math.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="amplitudes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="amplitudes">State Amplitudes</TabsTrigger>
              <TabsTrigger value="matrix">Density Matrix</TabsTrigger>
              <TabsTrigger value="bloch">Bloch Vector</TabsTrigger>
            </TabsList>

            <TabsContent value="amplitudes" className="mt-6">
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Complex Amplitudes
                  </h4>
                  <div className="space-y-2 font-mono text-sm">
                    {currentState.amplitudes.map((amp, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-cyan-400">
                          |
                          {index
                            .toString(2)
                            .padStart(currentState.numQubits, "0")}
                          ⟩:
                        </span>
                        <span className="text-white">
                          {amp.real.toFixed(3)} + {amp.imaginary.toFixed(3)}i
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="matrix" className="mt-6">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3">
                  Density Matrix ρ
                </h4>
                <p className="text-gray-400 text-sm">
                  For pure states: ρ = |ψ⟩⟨ψ|
                </p>
              </div>
            </TabsContent>

            <TabsContent value="bloch" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Bloch Vector
                  </h4>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-400">x:</span>
                      <span className="text-white">
                        {blochCoords.x.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">y:</span>
                      <span className="text-white">
                        {blochCoords.y.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">z:</span>
                      <span className="text-white">
                        {blochCoords.z.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Sphere Parameters
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Radius:</span>
                      <span className="text-white">
                        {Math.sqrt(
                          blochCoords.x ** 2 +
                          blochCoords.y ** 2 +
                          blochCoords.z ** 2,
                        ).toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">θ (polar):</span>
                      <span className="text-white">
                        {((Math.acos(blochCoords.z) * 180) / Math.PI).toFixed(
                          1,
                        )}
                        °
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">φ (azimuthal):</span>
                      <span className="text-white">
                        {(
                          (Math.atan2(blochCoords.y, blochCoords.x) * 180) /
                          Math.PI
                        ).toFixed(1)}
                        °
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
