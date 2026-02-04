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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BlochSphereVisualization,
  BlochSphereCompact,
  BlochSphereMini,
} from "./BlochSphere";
import {
  calculateEntanglement,
  getMeasurementProbabilities,
  bellState,
  ghzState,
  createZeroState,
  QuantumState,
  toBlochCoordinates,
  applySingleQubitGate,
  quantumGates,
} from "@/lib/quantum";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  Settings,
  Cpu,
  Zap,
  Network,
  TrendingUp,
  Brain,
  Download,
  Play,
  Pause,
  RotateCcw,
  GitBranch,
  Activity,
  Atom,
  Eye,
  Layers,
} from "lucide-react";

interface AlgorithmResult {
  name: string;
  iterations: number;
  fidelity: number;
  entanglement: number;
  executionTime: number;
  blochCoords?: { x: number; y: number; z: number };
}

interface NoiseModel {
  decoherence: number;
  gateError: number;
  readoutError: number;
  thermalNoise: number;
}

import { useLanguage } from "@/context/LanguageContext";

export function AdvancedOperations() {
  const { t } = useLanguage();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("grover");
  const [isRunning, setIsRunning] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(10);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [algorithmResults, setAlgorithmResults] = useState<AlgorithmResult[]>(
    [],
  );
  const [entanglementHistory, setEntanglementHistory] = useState<
    { step: number; value: number }[]
  >([]);
  const [currentState, setCurrentState] = useState<QuantumState>(() =>
    createZeroState(3),
  );
  const [noiseModel, setNoiseModel] = useState<NoiseModel>({
    decoherence: 0.1,
    gateError: 0.05,
    readoutError: 0.02,
    thermalNoise: 0.01,
  });
  const [showAdvancedVisualizations, setShowAdvancedVisualizations] =
    useState(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [errorCorrectionStatus, setErrorCorrectionStatus] = useState<
    string | null
  >(null);
  const [compareStatus, setCompareStatus] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [algorithmComparison, setAlgorithmComparison] = useState<any>(null);

  const algorithms = {
    grover: {
      name: t("advanced.algo.grover"),
      description: t("advanced.algo.grover.desc"),
      qubits: 3,
      complexity: "O(√N)",
      applications: "Unstructured search, optimization",
      color: "cyan",
    },
    shor: {
      name: t("advanced.algo.shor"),
      description: t("advanced.algo.shor.desc"),
      qubits: 4,
      complexity: "O((log N)³)",
      applications: "Cryptography, RSA breaking",
      color: "purple",
    },
    vqe: {
      name: t("advanced.algo.vqe"),
      description: t("advanced.algo.vqe.desc"),
      qubits: 4,
      complexity: "Polynomial",
      applications: "Chemistry, materials science",
      color: "green",
    },
    qaoa: {
      name: t("advanced.algo.qaoa"),
      description: t("advanced.algo.qaoa.desc"),
      qubits: 3,
      complexity: "Polynomial",
      applications: "Portfolio optimization, logistics",
      color: "orange",
    },
  };

  // Simulate algorithm execution with realistic quantum behavior
  const runAlgorithm = async () => {
    setIsRunning(true);
    setCurrentIteration(0);
    const results: AlgorithmResult[] = [];
    const entanglementData: { step: number; value: number }[] = [];

    for (let i = 0; i <= maxIterations; i++) {
      // Simulate quantum state evolution based on algorithm
      let state = createZeroState(
        algorithms[selectedAlgorithm as keyof typeof algorithms].qubits,
      );

      // Algorithm-specific state preparation
      if (selectedAlgorithm === "grover") {
        // Simulate Grover's algorithm progression
        const amplitude = Math.sin(
          ((i + 1) * Math.PI) / (2 * Math.sqrt(2 ** state.numQubits)),
        );
        const fidelity = Math.max(0.5, Math.abs(amplitude) - noiseLevel * 0.1);
        state = i % 2 === 0 ? bellState() : ghzState();
      } else if (selectedAlgorithm === "shor") {
        // Simulate Shor's algorithm with period finding
        state = ghzState();
      } else if (selectedAlgorithm === "vqe") {
        // Simulate VQE optimization landscape
        const cost = Math.exp(-i * 0.1) + noiseLevel * Math.random();
        state = createZeroState(4);
        // Apply some gates to simulate VQE ansatz
        state = applySingleQubitGate(state, quantumGates.H.matrix, 0);
        state = applySingleQubitGate(state, quantumGates.H.matrix, 1);
      } else {
        // QAOA simulation
        state = bellState();
      }

      // Add realistic noise and decoherence
      const baseNoise =
        noiseLevel + noiseModel.decoherence + noiseModel.gateError;
      const fidelity = Math.max(
        0.3,
        1 - i * 0.015 - baseNoise * 0.2 + Math.random() * 0.05,
      );
      const entanglement =
        Math.abs(Math.sin(i * 0.4) * 0.7 + 0.3) * (1 - baseNoise * 0.5);

      // Calculate Bloch coordinates for visualization (for first qubit if single-qubit system)
      let blochCoords = { x: 0, y: 0, z: 1 };
      if (state.numQubits === 1) {
        blochCoords = toBlochCoordinates(state);
      } else {
        // For multi-qubit, show effective single-qubit representation
        blochCoords = {
          x: Math.sin(i * 0.2) * Math.cos(i * 0.3),
          y: Math.sin(i * 0.2) * Math.sin(i * 0.3),
          z: Math.cos(i * 0.2),
        };
      }

      setCurrentState(state);

      const result: AlgorithmResult = {
        name: algorithms[selectedAlgorithm as keyof typeof algorithms].name,
        iterations: i,
        fidelity: fidelity,
        entanglement: entanglement,
        executionTime: i * 75 + Math.random() * 150,
        blochCoords,
      };

      results.push(result);
      entanglementData.push({ step: i, value: entanglement });

      setCurrentIteration(i);
      setAlgorithmResults([...results]);
      setEntanglementHistory([...entanglementData]);

      // Simulate execution delay
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsRunning(false);
  };

  const resetSimulation = () => {
    setCurrentIteration(0);
    setAlgorithmResults([]);
    setEntanglementHistory([]);
    setCurrentState(createZeroState(3));
  };

  const currentAlgorithm =
    algorithms[selectedAlgorithm as keyof typeof algorithms];
  const probabilities = getMeasurementProbabilities(currentState);

  // Calculate performance metrics
  const averageFidelity =
    algorithmResults.length > 0
      ? algorithmResults.reduce((sum, r) => sum + r.fidelity, 0) /
      algorithmResults.length
      : 0;

  const maxEntanglement = Math.max(
    ...entanglementHistory.map((e) => e.value),
    0,
  );
  const currentBlochCoords =
    algorithmResults.length > 0
      ? algorithmResults[algorithmResults.length - 1].blochCoords || {
        x: 0,
        y: 0,
        z: 1,
      }
      : { x: 0, y: 0, z: 1 };

  // Generate noise analysis data
  const noiseAnalysisData = [
    {
      name: t("advanced.noise.t1"),
      value: noiseModel.decoherence * 100,
      color: "#ef4444",
    },
    {
      name: t("advanced.noise.gate"),
      value: noiseModel.gateError * 100,
      color: "#f59e0b",
    },
    {
      name: t("advanced.noise.readout"),
      value: noiseModel.readoutError * 100,
      color: "#3b82f6",
    },
    {
      name: t("advanced.noise.thermal"),
      value: noiseModel.thermalNoise * 100,
      color: "#10b981",
    },
  ];

  // Export functionality
  const exportResults = () => {
    const exportData = {
      algorithm: selectedAlgorithm,
      results: algorithmResults,
      entanglementHistory,
      noiseModel,
      timestamp: new Date().toISOString(),
      metadata: {
        maxIterations,
        noiseLevel,
        averageFidelity,
        maxEntanglement,
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quantum_simulation_${selectedAlgorithm}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportStatus("Results exported successfully!");
    setTimeout(() => setExportStatus(null), 3000);
  };

  const generateReport = () => {
    const reportData = {
      title: "Quantum Algorithm Simulation Report",
      algorithm: algorithms[selectedAlgorithm as keyof typeof algorithms],
      executionSummary: {
        totalIterations: algorithmResults.length,
        averageFidelity: (averageFidelity * 100).toFixed(2) + "%",
        maxEntanglement: (maxEntanglement * 100).toFixed(2) + "%",
        noiseImpact:
          (
            (noiseModel.decoherence +
              noiseModel.gateError +
              noiseModel.readoutError +
              noiseModel.thermalNoise) *
            100
          ).toFixed(2) + "%",
      },
      recommendations: [
        averageFidelity < 0.8
          ? "Consider reducing noise levels for better fidelity"
          : "Fidelity levels are within acceptable range",
        maxEntanglement < 0.5
          ? "Algorithm may benefit from enhanced entanglement generation"
          : "Good entanglement characteristics observed",
        noiseLevel > 0.3
          ? "High noise environment detected - consider error mitigation techniques"
          : "Noise levels are manageable",
      ],
    };

    const reportText = `
# ${reportData.title}

## Algorithm: ${reportData.algorithm.name}
${reportData.algorithm.description}

## Execution Summary
- Total Iterations: ${reportData.executionSummary.totalIterations}
- Average Fidelity: ${reportData.executionSummary.averageFidelity}
- Maximum Entanglement: ${reportData.executionSummary.maxEntanglement}
- Noise Impact: ${reportData.executionSummary.noiseImpact}

## Recommendations
${reportData.recommendations.map((rec) => `- ${rec}`).join("\n")}

## Generated: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quantum_report_${selectedAlgorithm}_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setReportStatus("Report generated successfully!");
    setTimeout(() => setReportStatus(null), 3000);
  };

  // Error correction functions
  const applyZNE = () => {
    setErrorCorrectionStatus("Applying Zero Noise Extrapolation...");
    // Simulate ZNE application
    setTimeout(() => {
      if (algorithmResults.length === 0) {
        // Create sample results if none exist
        const sampleResults: AlgorithmResult[] = [
          {
            name: "Sample Simulation",
            iterations: 1,
            fidelity: 0.75,
            entanglement: 0.6,
            executionTime: 100,
            blochCoords: { x: 0.5, y: 0.3, z: 0.4 },
          },
        ];
        const improvedResults = sampleResults.map((result) => ({
          ...result,
          fidelity: Math.min(1, result.fidelity * 1.15), // Improve fidelity by 15%
        }));
        setAlgorithmResults(improvedResults);
        setErrorCorrectionStatus(
          "ZNE applied to sample data - fidelity improved by 15%!",
        );
      } else {
        const improvedResults = algorithmResults.map((result) => ({
          ...result,
          fidelity: Math.min(1, result.fidelity * 1.15), // Improve fidelity by 15%
        }));
        setAlgorithmResults(improvedResults);
        setErrorCorrectionStatus("ZNE applied - fidelity improved by 15%!");
      }
      setTimeout(() => setErrorCorrectionStatus(null), 4000);
    }, 1500);
  };

  const applyCDR = () => {
    setErrorCorrectionStatus("Applying Clifford Data Regression...");
    // Simulate CDR application
    setTimeout(() => {
      if (algorithmResults.length === 0) {
        // Create sample results if none exist
        const sampleResults: AlgorithmResult[] = [
          {
            name: "Sample Simulation",
            iterations: 1,
            fidelity: 0.7,
            entanglement: 0.55,
            executionTime: 120,
            blochCoords: { x: 0.4, y: 0.2, z: 0.6 },
          },
        ];
        const improvedResults = sampleResults.map((result) => ({
          ...result,
          fidelity: Math.min(1, result.fidelity * 1.08), // Improve fidelity by 8%
        }));
        setAlgorithmResults(improvedResults);
        setErrorCorrectionStatus(
          "CDR applied to sample data - noise characteristics improved by 8%!",
        );
      } else {
        const improvedResults = algorithmResults.map((result) => ({
          ...result,
          fidelity: Math.min(1, result.fidelity * 1.08), // Improve fidelity by 8%
        }));
        setAlgorithmResults(improvedResults);
        setErrorCorrectionStatus(
          "CDR applied - noise characteristics improved by 8%!",
        );
      }
      setTimeout(() => setErrorCorrectionStatus(null), 4000);
    }, 2000);
  };

  const applyErrorCorrection = (codeType: string) => {
    setErrorCorrectionStatus(`Applying ${codeType}...`);
    // Simulate error correction code application
    setTimeout(() => {
      const correctionFactor =
        {
          "Surface Code": 1.25,
          "Steane Code": 1.18,
          "Shor Code": 1.12,
        }[codeType] || 1.1;

      if (algorithmResults.length === 0) {
        // Create sample results if none exist
        const sampleResults: AlgorithmResult[] = [
          {
            name: "Sample Simulation",
            iterations: 1,
            fidelity: 0.65,
            entanglement: 0.5,
            executionTime: 140,
            blochCoords: { x: 0.3, y: 0.4, z: 0.5 },
          },
        ];
        const improvedResults = sampleResults.map((result) => ({
          ...result,
          fidelity: Math.min(1, result.fidelity * correctionFactor),
        }));
        setAlgorithmResults(improvedResults);
        setErrorCorrectionStatus(
          `${codeType} applied to sample data - fidelity improved by ${Math.round((correctionFactor - 1) * 100)}%!`,
        );
      } else {
        const improvedResults = algorithmResults.map((result) => ({
          ...result,
          fidelity: Math.min(1, result.fidelity * correctionFactor),
        }));
        setAlgorithmResults(improvedResults);
        setErrorCorrectionStatus(
          `${codeType} applied - fidelity improved by ${Math.round((correctionFactor - 1) * 100)}%!`,
        );
      }
      setTimeout(() => setErrorCorrectionStatus(null), 4000);
    }, 1800);
  };

  // Compare Algorithms functionality
  const compareAlgorithms = () => {
    setCompareStatus("Generating algorithm comparison...");

    // Simulate comparison analysis
    setTimeout(() => {
      const allAlgorithms = Object.entries(algorithms);
      const comparison = allAlgorithms.map(([key, algo]) => ({
        name: algo.name,
        qubits: algo.qubits,
        complexity: algo.complexity,
        applications: algo.applications,
        estimatedFidelity: Math.random() * 0.3 + 0.7, // 70-100%
        estimatedEntanglement: Math.random() * 0.5 + 0.3, // 30-80%
        estimatedNoiseResistance: Math.random() * 0.4 + 0.6, // 60-100%
        classicalSpeedup:
          key === "grover"
            ? "Quadratic"
            : key === "shor"
              ? "Exponential"
              : key === "vqe"
                ? "Problem-dependent"
                : "Polynomial",
        quantumAdvantage:
          key === "shor" ? "Proven" : key === "grover" ? "Proven" : "Potential",
      }));

      setAlgorithmComparison(comparison);

      const comparisonData = {
        timestamp: new Date().toISOString(),
        algorithms: comparison,
        currentSimulation: {
          algorithm: selectedAlgorithm,
          results: algorithmResults,
          avgFidelity: averageFidelity,
          maxEntanglement: maxEntanglement,
        },
        analysis: {
          bestForFidelity: comparison.reduce((a, b) =>
            a.estimatedFidelity > b.estimatedFidelity ? a : b,
          ).name,
          bestForEntanglement: comparison.reduce((a, b) =>
            a.estimatedEntanglement > b.estimatedEntanglement ? a : b,
          ).name,
          mostNoiseResistant: comparison.reduce((a, b) =>
            a.estimatedNoiseResistance > b.estimatedNoiseResistance ? a : b,
          ).name,
        },
      };

      const jsonString = JSON.stringify(comparisonData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `algorithm_comparison_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCompareStatus("Algorithm comparison exported successfully!");
      setTimeout(() => setCompareStatus(null), 4000);
    }, 2000);
  };

  // Share Visualization functionality
  const shareVisualization = () => {
    setShareStatus("Preparing visualization for sharing...");

    setTimeout(() => {
      const shareData = {
        title: `Quantum ${algorithms[selectedAlgorithm as keyof typeof algorithms].name} Visualization`,
        description: `Interactive visualization of ${algorithms[selectedAlgorithm as keyof typeof algorithms].description}`,
        algorithm: selectedAlgorithm,
        parameters: {
          maxIterations,
          noiseLevel,
          noiseModel,
        },
        results: {
          iterations: algorithmResults.length,
          averageFidelity: (averageFidelity * 100).toFixed(2) + "%",
          maxEntanglement: (maxEntanglement * 100).toFixed(2) + "%",
          currentBlochCoords,
        },
        visualizationUrl: `https://quantara.app/share/${selectedAlgorithm}/${Date.now()}`,
        qrCode: `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="white"/>
            <rect x="20" y="20" width="20" height="20" fill="black"/>
            <rect x="60" y="20" width="20" height="20" fill="black"/>
            <rect x="100" y="20" width="20" height="20" fill="black"/>
            <rect x="140" y="20" width="20" height="20" fill="black"/>
            <rect x="180" y="20" width="20" height="20" fill="black"/>
            <text x="100" y="190" text-anchor="middle" font-size="12" fill="black">Quantara Share</text>
          </svg>
        `)}`,
      };

      // Create shareable HTML file
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${shareData.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
        }
        .header { text-align: center; margin-bottom: 30px; }
        .results { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric {
            background: rgba(6, 182, 212, 0.1);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .qr-code { text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${shareData.title}</h1>
            <p>${shareData.description}</p>
        </div>
        <div class="results">
            <div class="metric">
                <h3>Algorithm</h3>
                <p>${algorithms[selectedAlgorithm as keyof typeof algorithms].name}</p>
            </div>
            <div class="metric">
                <h3>Iterations</h3>
                <p>${shareData.results.iterations}</p>
            </div>
            <div class="metric">
                <h3>Average Fidelity</h3>
                <p>${shareData.results.averageFidelity}</p>
            </div>
            <div class="metric">
                <h3>Max Entanglement</h3>
                <p>${shareData.results.maxEntanglement}</p>
            </div>
        </div>
        <div class="qr-code">
            <p>Scan to view interactive visualization:</p>
            <img src="${shareData.qrCode}" alt="QR Code" width="200" height="200"/>
        </div>
    </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quantum_visualization_share_${selectedAlgorithm}_${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also copy shareable link to clipboard
      const shareUrl = shareData.visualizationUrl;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            setShareStatus("Visualization shared! Link copied to clipboard.");
          })
          .catch(() => {
            setShareStatus("Visualization HTML file generated successfully!");
          });
      } else {
        setShareStatus("Visualization HTML file generated successfully!");
      }

      setTimeout(() => setShareStatus(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Selection and Control */}
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-purple-400" />
            {t("advanced.title")}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {t("advanced.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Algorithm Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">{t("advanced.algo.label")}</Label>
                <Select
                  value={selectedAlgorithm}
                  onValueChange={setSelectedAlgorithm}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {Object.entries(algorithms).map(([key, algo]) => (
                      <SelectItem key={key} value={key}>
                        {algo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
                <h4 className="text-white font-semibold">
                  {currentAlgorithm.name}
                </h4>
                <p className="text-gray-300 text-sm">
                  {currentAlgorithm.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-purple-400 text-purple-400"
                  >
                    {currentAlgorithm.qubits} {t("gates.stats.qubits")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-blue-400 text-blue-400"
                  >
                    {currentAlgorithm.complexity}
                  </Badge>
                </div>
                <p className="text-gray-400 text-xs">
                  {t("advanced.algo.applications")}: {currentAlgorithm.applications}
                </p>
              </div>
            </div>

            {/* Simulation Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">
                  {t("advanced.params.iterations")}: {maxIterations}
                </Label>
                <Slider
                  value={[maxIterations]}
                  onValueChange={(value) => setMaxIterations(value[0])}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">
                  {t("advanced.params.noise")}: {noiseLevel.toFixed(2)}
                </Label>
                <Slider
                  value={[noiseLevel]}
                  onValueChange={(value) => setNoiseLevel(value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={runAlgorithm}
                  disabled={isRunning}
                  className="bg-purple-600 hover:bg-purple-700 btn-hover-simple btn-hover-glow"
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      {t("gates.controls.executing")}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {t("advanced.controls.start")}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="border-gray-600 btn-hover-lift"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("advanced.controls.reset")}
                </Button>
              </div>
            </div>

            {/* Real-time Bloch Sphere */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">{t("advanced.state.label")}</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setShowAdvancedVisualizations(!showAdvancedVisualizations)
                  }
                  className="border-gray-600"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showAdvancedVisualizations ? t("advanced.controls.hide") : t("advanced.controls.show")}
                </Button>
              </div>

              <BlochSphereVisualization
                coordinates={currentBlochCoords}
                size={200}
                animated={isRunning}
              />

              <div className="text-center">
                <Badge
                  variant="outline"
                  className="border-cyan-400 text-cyan-400"
                >
                  {t("advanced.progress.iteration")} {currentIteration} / {maxIterations}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{t("advanced.progress.label")}</span>
                <span className="text-purple-400">
                  {currentIteration} / {maxIterations}
                </span>
              </div>
              <Progress
                value={(currentIteration / maxIterations) * 100}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fidelity Evolution */}
        <Card className="bg-black/40 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              {t("advanced.analysis.fidelityTitle")}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {t("advanced.analysis.fidelityDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={algorithmResults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="iterations" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      color: "#f3f4f6",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="fidelity"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-cyan-500/20 p-3 rounded">
                <div className="text-cyan-400 text-sm">{t("advanced.analysis.fidelity")}</div>
                <div className="text-white text-lg font-bold">
                  {(averageFidelity * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-blue-500/20 p-3 rounded">
                <div className="text-blue-400 text-sm">{t("advanced.analysis.currentFidelity")}</div>
                <div className="text-white text-lg font-bold">
                  {algorithmResults.length > 0
                    ? (
                      algorithmResults[algorithmResults.length - 1].fidelity *
                      100
                    ).toFixed(1)
                    : "0.0"}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entanglement Dynamics */}
        <Card className="bg-black/40 border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Network className="h-5 w-5 text-orange-400" />
              {t("advanced.analysis.entanglementTitle")}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {t("advanced.analysis.entanglementDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={entanglementHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="step" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      color: "#f3f4f6",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: "#f97316", strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-orange-500/20 p-3 rounded">
                <div className="text-orange-400 text-sm">{t("advanced.analysis.entanglement")}</div>
                <div className="text-white text-lg font-bold">
                  {(maxEntanglement * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-red-500/20 p-3 rounded">
                <div className="text-red-400 text-sm">{t("advanced.analysis.currentLevel")}</div>
                <div className="text-white text-lg font-bold">
                  {entanglementHistory.length > 0
                    ? (
                      entanglementHistory[entanglementHistory.length - 1]
                        .value * 100
                    ).toFixed(1)
                    : "0.0"}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Visualizations */}
      {showAdvancedVisualizations && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Noise Model Visualization */}
          <Card className="bg-black/40 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-red-400" />
                Noise Analysis
              </CardTitle>
              <CardDescription className="text-gray-300">
                Current noise model impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={noiseAnalysisData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={10} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#9ca3af"
                      fontSize={10}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f3f4f6",
                      }}
                      formatter={(value) => [`${value}%`, "Error Rate"]}
                    />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {noiseAnalysisData.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-white">{item.value.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Comparison */}
          <Card className="bg-black/40 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GitBranch className="h-5 w-5 text-green-400" />
                Algorithm Metrics
              </CardTitle>
              <CardDescription className="text-gray-300">
                Performance comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="text-xs text-gray-400">Qubits Used</div>
                    <div className="text-lg font-bold text-white">
                      {currentAlgorithm.qubits}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="text-xs text-gray-400">Iterations</div>
                    <div className="text-lg font-bold text-white">
                      {algorithmResults.length}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="text-xs text-gray-400">Avg Time</div>
                    <div className="text-lg font-bold text-white">
                      {algorithmResults.length > 0
                        ? (
                          algorithmResults.reduce(
                            (sum, r) => sum + r.executionTime,
                            0,
                          ) / algorithmResults.length
                        ).toFixed(0)
                        : "0"}
                      ms
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="text-xs text-gray-400">Success Rate</div>
                    <div className="text-lg font-bold text-white">
                      {algorithmResults.length > 0
                        ? (
                          (algorithmResults.filter((r) => r.fidelity > 0.8)
                            .length /
                            algorithmResults.length) *
                          100
                        ).toFixed(0)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-3 rounded">
                  <h4 className="text-white font-medium mb-2">
                    Mini Bloch Evolution
                  </h4>
                  <div className="grid grid-cols-5 gap-1">
                    {algorithmResults.slice(-5).map((result, index) => (
                      <div key={index} className="text-center">
                        <BlochSphereMini
                          coordinates={
                            result.blochCoords || { x: 0, y: 0, z: 1 }
                          }
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          #{result.iterations}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time State Monitor */}
          <Card className="bg-black/40 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Layers className="h-5 w-5 text-blue-400" />
                State Monitor
              </CardTitle>
              <CardDescription className="text-gray-300">
                Current quantum state details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <BlochSphereCompact coordinates={currentBlochCoords} />

                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">
                    Bloch Coordinates
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-red-500/20 p-2 rounded text-center">
                      <div className="text-red-400">X</div>
                      <div className="text-white font-mono">
                        {currentBlochCoords.x.toFixed(3)}
                      </div>
                    </div>
                    <div className="bg-green-500/20 p-2 rounded text-center">
                      <div className="text-green-400">Y</div>
                      <div className="text-white font-mono">
                        {currentBlochCoords.y.toFixed(3)}
                      </div>
                    </div>
                    <div className="bg-blue-500/20 p-2 rounded text-center">
                      <div className="text-blue-400">Z</div>
                      <div className="text-white font-mono">
                        {currentBlochCoords.z.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">
                    State Properties
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purity</span>
                      <span className="text-white">
                        {Math.sqrt(
                          currentBlochCoords.x ** 2 +
                          currentBlochCoords.y ** 2 +
                          currentBlochCoords.z ** 2,
                        ).toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Theta (θ)</span>
                      <span className="text-white">
                        {(
                          (Math.acos(currentBlochCoords.z) * 180) /
                          Math.PI
                        ).toFixed(1)}
                        °
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phi (φ)</span>
                      <span className="text-white">
                        {(
                          (Math.atan2(
                            currentBlochCoords.y,
                            currentBlochCoords.x,
                          ) *
                            180) /
                          Math.PI
                        ).toFixed(1)}
                        °
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quantum Error Analysis */}
      <Card className="bg-black/40 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-red-400" />
            Quantum Error Analysis & Mitigation
          </CardTitle>
          <CardDescription className="text-gray-300">
            Advanced error modeling and correction techniques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <div className="overflow-x-auto pb-2 -mx-1 px-1">
              <TabsList className="flex w-full min-w-max md:grid md:grid-cols-4 bg-gray-800/50">
                <TabsTrigger value="errors" className="flex-1 px-4">Error Types</TabsTrigger>
                <TabsTrigger value="mitigation" className="flex-1 px-4">Error Mitigation</TabsTrigger>
                <TabsTrigger value="benchmarks" className="flex-1 px-4">Benchmarks</TabsTrigger>
                <TabsTrigger value="visualization" className="flex-1 px-4">Error Viz</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="errors" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-red-400" />
                    <h4 className="text-white font-semibold">Decoherence</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">T1 (Relaxation)</span>
                      <span className="text-red-400">45 μs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">T2 (Dephasing)</span>
                      <span className="text-red-400">23 μs</span>
                    </div>
                    <Progress
                      value={noiseModel.decoherence * 100}
                      className="h-1"
                    />
                    <Slider
                      value={[noiseModel.decoherence]}
                      onValueChange={(value) =>
                        setNoiseModel((prev) => ({
                          ...prev,
                          decoherence: value[0],
                        }))
                      }
                      max={0.5}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-4 w-4 text-yellow-400" />
                    <h4 className="text-white font-semibold">Gate Errors</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Single Qubit</span>
                      <span className="text-yellow-400">
                        {(noiseModel.gateError * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Two Qubit</span>
                      <span className="text-yellow-400">
                        {(noiseModel.gateError * 200).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={noiseModel.gateError * 100}
                      className="h-1"
                    />
                    <Slider
                      value={[noiseModel.gateError]}
                      onValueChange={(value) =>
                        setNoiseModel((prev) => ({
                          ...prev,
                          gateError: value[0],
                        }))
                      }
                      max={0.2}
                      min={0}
                      step={0.001}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-400" />
                    <h4 className="text-white font-semibold">Readout Errors</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Assignment</span>
                      <span className="text-blue-400">
                        {(noiseModel.readoutError * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Crosstalk</span>
                      <span className="text-blue-400">
                        {(noiseModel.readoutError * 50).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={noiseModel.readoutError * 100}
                      className="h-1"
                    />
                    <Slider
                      value={[noiseModel.readoutError]}
                      onValueChange={(value) =>
                        setNoiseModel((prev) => ({
                          ...prev,
                          readoutError: value[0],
                        }))
                      }
                      max={0.1}
                      min={0}
                      step={0.001}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Atom className="h-4 w-4 text-green-400" />
                    <h4 className="text-white font-semibold">Thermal Noise</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Temperature</span>
                      <span className="text-green-400">15 mK</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Thermal Excitation</span>
                      <span className="text-green-400">
                        {(noiseModel.thermalNoise * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress
                      value={noiseModel.thermalNoise * 100}
                      className="h-1"
                    />
                    <Slider
                      value={[noiseModel.thermalNoise]}
                      onValueChange={(value) =>
                        setNoiseModel((prev) => ({
                          ...prev,
                          thermalNoise: value[0],
                        }))
                      }
                      max={0.05}
                      min={0}
                      step={0.001}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mitigation" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">
                      Zero Noise Extrapolation
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Extrapolate to zero noise by running circuits at different
                      noise levels
                    </p>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 btn-hover-simple btn-hover-glow"
                      onClick={applyZNE}
                      disabled={!!errorCorrectionStatus}
                    >
                      Apply ZNE
                    </Button>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">
                      Clifford Data Regression
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Use Clifford gates to characterize and correct noise
                    </p>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 btn-hover-simple btn-hover-glow"
                      onClick={applyCDR}
                      disabled={!!errorCorrectionStatus}
                    >
                      Apply CDR
                    </Button>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">
                    Error Correction Codes
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/10 btn-hover-lift"
                      onClick={() => applyErrorCorrection("Surface Code")}
                      disabled={!!errorCorrectionStatus}
                    >
                      Surface Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/10 btn-hover-lift"
                      onClick={() => applyErrorCorrection("Steane Code")}
                      disabled={!!errorCorrectionStatus}
                    >
                      Steane Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/10 btn-hover-lift"
                      onClick={() => applyErrorCorrection("Shor Code")}
                      disabled={!!errorCorrectionStatus}
                    >
                      Shor Code
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="benchmarks" className="mt-6">
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Quantum Volume Benchmarks
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        128
                      </div>
                      <div className="text-xs text-gray-400">Current QV</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        95.2%
                      </div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        2.3ms
                      </div>
                      <div className="text-xs text-gray-400">Avg Gate Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {maxIterations}
                      </div>
                      <div className="text-xs text-gray-400">Max Depth</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Error Impact on Bloch Sphere
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2">
                        Ideal State
                      </div>
                      <BlochSphereMini coordinates={{ x: 1, y: 0, z: 0 }} />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2">
                        With Noise
                      </div>
                      <BlochSphereMini
                        coordinates={{
                          x:
                            1 -
                            (noiseModel.decoherence + noiseModel.gateError) * 2,
                          y: noiseModel.thermalNoise * 3,
                          z: noiseModel.readoutError * 2,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Total Error Budget
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Error Rate:</span>
                      <span className="text-red-400">
                        {(
                          (noiseModel.decoherence +
                            noiseModel.gateError +
                            noiseModel.readoutError +
                            noiseModel.thermalNoise) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (noiseModel.decoherence +
                          noiseModel.gateError +
                          noiseModel.readoutError +
                          noiseModel.thermalNoise) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Error Correction Status */}
                {errorCorrectionStatus && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-400 animate-spin" />
                      <span className="text-blue-400 text-sm">
                        {errorCorrectionStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Export and Reports */}
      <Card className="bg-black/40 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white">
            Export & Analysis Reports
          </CardTitle>
          <CardDescription className="text-gray-300">
            Generate detailed analysis reports and export simulation data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 btn-hover-simple btn-hover-glow"
              onClick={exportResults}
              disabled={!!exportStatus}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results (JSON)
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 btn-hover-simple"
              onClick={generateReport}
              disabled={!!reportStatus}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report (MD)
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 btn-hover-lift"
              onClick={compareAlgorithms}
              disabled={!!compareStatus}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Compare Algorithms
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 btn-hover-lift"
              onClick={shareVisualization}
              disabled={!!shareStatus}
            >
              <Eye className="h-4 w-4 mr-2" />
              Share Visualization
            </Button>
          </div>

          {/* Status Messages */}
          {(exportStatus || reportStatus || compareStatus || shareStatus) && (
            <div className="mt-4 space-y-2">
              {exportStatus && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">
                      {exportStatus}
                    </span>
                  </div>
                </div>
              )}
              {reportStatus && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 text-sm">
                      {reportStatus}
                    </span>
                  </div>
                </div>
              )}
              {compareStatus && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400 text-sm">
                      {compareStatus}
                    </span>
                  </div>
                </div>
              )}
              {shareStatus && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-400 text-sm">{shareStatus}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
