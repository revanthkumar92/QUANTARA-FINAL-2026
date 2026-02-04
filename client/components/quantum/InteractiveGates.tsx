import { useState, useRef, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlochSphereVisualization, BlochSphereMini } from "./BlochSphere";
import {
  createZeroState,
  applySingleQubitGate,
  quantumGates,
  QuantumState,
  getMeasurementProbabilities,
  toBlochCoordinates,
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
import {
  Zap,
  Trash2,
  Play,
  Square,
  Circle,
  RotateCcw,
  Download,
  Copy,
  Layers,
  Eye,
  Atom,
} from "lucide-react";

interface CircuitGate {
  id: string;
  type: keyof typeof quantumGates;
  qubit: number;
  position: number;
  parameters?: { [key: string]: number };
}

interface CircuitState {
  gates: CircuitGate[];
  numQubits: number;
  currentStep: number;
}

const gateColors = {
  H: "bg-blue-500",
  X: "bg-red-500",
  Y: "bg-green-500",
  Z: "bg-purple-500",
  S: "bg-yellow-500",
  T: "bg-pink-500",
  I: "bg-gray-500",
  RX: "bg-orange-500",
  RY: "bg-teal-500",
  RZ: "bg-indigo-500",
  SX: "bg-rose-500",
  SY: "bg-emerald-500",
};

const gateDescriptions = {
  H: "Hadamard Gate - Creates superposition",
  X: "Pauli-X Gate - Bit flip operation",
  Y: "Pauli-Y Gate - Bit + phase flip",
  Z: "Pauli-Z Gate - Phase flip operation",
  S: "S Gate - π/2 phase rotation",
  T: "T Gate - π/4 phase rotation",
  I: "Identity Gate - No operation",
  RX: "X Rotation Gate - π/2 rotation around X-axis",
  RY: "Y Rotation Gate - π/2 rotation around Y-axis",
  RZ: "Z Rotation Gate - π/2 rotation around Z-axis",
  SX: "√X Gate - Square root of X gate",
  SY: "√Y Gate - Square root of Y gate",
};

export function InteractiveGates() {
  const [circuit, setCircuit] = useState<CircuitState>({
    gates: [],
    numQubits: 2,
    currentStep: 0,
  });

  const [currentState, setCurrentState] = useState<QuantumState>(() =>
    createZeroState(2),
  );
  const [draggedGate, setDraggedGate] = useState<
    keyof typeof quantumGates | null
  >(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<QuantumState[]>([]);
  const [showCircuitVisualization, setShowCircuitVisualization] =
    useState(true);
  const [isRealTimeUpdating, setIsRealTimeUpdating] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [exportStatus, setExportStatus] = useState<string>("");
  const [showQASMPreview, setShowQASMPreview] = useState(false);
  const [showCircuitDataModal, setShowCircuitDataModal] = useState(false);

  const circuitRef = useRef<HTMLDivElement>(null);

  // Real-time circuit simulation (immediate update, no animations)
  const simulateCircuitRealTime = () => {
    let state = createZeroState(circuit.numQubits);

    // Group gates by position for parallel execution
    const gatesByPosition = circuit.gates.reduce(
      (acc, gate) => {
        if (!acc[gate.position]) acc[gate.position] = [];
        acc[gate.position].push(gate);
        return acc;
      },
      {} as { [key: number]: CircuitGate[] },
    );

    const positions = Object.keys(gatesByPosition)
      .map(Number)
      .sort((a, b) => a - b);

    // Apply all gates immediately without delays or animations
    for (const position of positions) {
      const gates = gatesByPosition[position];

      for (const gate of gates) {
        if (gate.qubit < state.numQubits) {
          state = applySingleQubitGate(
            state,
            quantumGates[gate.type].matrix,
            gate.qubit,
          );
        }
      }
    }

    setCurrentState(state);
  };

  // Update quantum state whenever circuit changes
  useEffect(() => {
    simulateCircuitRealTime();
  }, [circuit.gates, circuit.numQubits]);

  // Add gate to circuit
  const addGate = (
    gateType: keyof typeof quantumGates,
    qubit: number,
    position: number,
  ) => {
    const newGate: CircuitGate = {
      id: `${gateType}-${Date.now()}`,
      type: gateType,
      qubit,
      position,
      parameters: {},
    };

    setCircuit((prev) => ({
      ...prev,
      gates: [...prev.gates, newGate].sort((a, b) => a.position - b.position),
    }));
  };

  // Remove gate from circuit
  const removeGate = (gateId: string) => {
    setCircuit((prev) => ({
      ...prev,
      gates: prev.gates.filter((gate) => gate.id !== gateId),
    }));
  };

  // Execute circuit step by step
  const executeCircuit = async () => {
    setIsExecuting(true);
    let state = createZeroState(circuit.numQubits);
    const results: QuantumState[] = [state];

    // Group gates by position for parallel execution
    const gatesByPosition = circuit.gates.reduce(
      (acc, gate) => {
        if (!acc[gate.position]) acc[gate.position] = [];
        acc[gate.position].push(gate);
        return acc;
      },
      {} as { [key: number]: CircuitGate[] },
    );

    const positions = Object.keys(gatesByPosition)
      .map(Number)
      .sort((a, b) => a - b);

    for (const position of positions) {
      const gates = gatesByPosition[position];

      // Apply gates at this position
      for (const gate of gates) {
        if (gate.qubit < state.numQubits) {
          state = applySingleQubitGate(
            state,
            quantumGates[gate.type].matrix,
            gate.qubit,
          );
        }
      }

      results.push({ ...state });

      // Update state immediately
      setCurrentState(state);
      setCircuit((prev) => ({ ...prev, currentStep: position + 1 }));
    }

    setExecutionResults(results);
    setIsExecuting(false);
  };

  // Reset circuit
  const resetCircuit = () => {
    setCircuit({ gates: [], numQubits: circuit.numQubits, currentStep: 0 });
    setExecutionResults([]);
    // Note: useEffect will automatically update currentState when circuit.gates changes
  };

  // Handle drag and drop
  const handleDragStart = (gateType: keyof typeof quantumGates) => {
    setDraggedGate(gateType);
  };

  const handleDrop = (qubit: number, position: number) => {
    if (draggedGate) {
      addGate(draggedGate, qubit, position);
      setDraggedGate(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Update number of qubits
  const updateNumQubits = (newNum: number) => {
    setCircuit((prev) => ({ ...prev, numQubits: newNum, gates: [] }));
    setExecutionResults([]);
    // Note: useEffect will automatically update currentState when circuit changes
  };

  // Load preset circuits
  const loadPresetCircuit = (preset: string) => {
    resetCircuit();

    switch (preset) {
      case "bell":
        // H on qubit 0, then CNOT
        setCircuit((prev) => ({
          ...prev,
          gates: [
            { id: "h-0", type: "H", qubit: 0, position: 0 },
            // Note: CNOT would need special handling for two-qubit gates
          ],
        }));
        break;
      case "teleportation":
        // Quantum teleportation protocol
        setCircuit((prev) => ({
          ...prev,
          numQubits: 3,
          gates: [{ id: "h-1", type: "H", qubit: 1, position: 0 }],
        }));
        break;
      case "grover":
        // Grover's algorithm setup
        setCircuit((prev) => ({
          ...prev,
          gates: [
            { id: "h-0", type: "H", qubit: 0, position: 0 },
            { id: "h-1", type: "H", qubit: 1, position: 0 },
          ],
        }));
        break;
    }
  };

  const probabilities = getMeasurementProbabilities(currentState);
  const probabilityData = probabilities.map((prob, index) => ({
    state: `|${index.toString(2).padStart(currentState.numQubits, "0")}⟩`,
    probability: (prob * 100).toFixed(1),
    value: prob,
  }));

  // Get Bloch coordinates - for single qubit use exact coords, for multi-qubit show reduced state of first qubit
  const getBlochCoordinates = () => {
    if (currentState.numQubits === 1) {
      return toBlochCoordinates(currentState);
    } else {
      // For multi-qubit systems, calculate reduced density matrix for first qubit
      // This gives an approximate Bloch sphere representation
      const numStates = currentState.amplitudes.length;
      let prob0 = 0;
      let prob1 = 0;
      let coherence_real = 0;
      let coherence_imag = 0;

      // Calculate reduced density matrix elements for first qubit
      for (let i = 0; i < numStates; i++) {
        const firstQubitState = i & 1; // Extract first qubit state (0 or 1)
        const amp = currentState.amplitudes[i];
        const prob = amp.real * amp.real + amp.imaginary * amp.imaginary;

        if (firstQubitState === 0) {
          prob0 += prob;
        } else {
          prob1 += prob;
        }

        // Calculate off-diagonal elements for coherence
        const partnerIndex = i ^ 1; // Flip first qubit
        if (partnerIndex < numStates) {
          const partnerAmp = currentState.amplitudes[partnerIndex];
          coherence_real +=
            amp.real * partnerAmp.real + amp.imaginary * partnerAmp.imaginary;
          coherence_imag +=
            amp.imaginary * partnerAmp.real - amp.real * partnerAmp.imaginary;
        }
      }

      // Convert to Bloch coordinates
      const x = 2 * coherence_real;
      const y = 2 * coherence_imag;
      const z = prob0 - prob1;

      return { x, y, z };
    }
  };

  const blochCoords = getBlochCoordinates();

  // Generate QASM preview
  // Get circuit data for manual copying
  const getCircuitDataForCopy = () => {
    return {
      numQubits: circuit.numQubits,
      gates: circuit.gates.map((gate) => ({
        type: gate.type,
        qubit: gate.qubit,
        position: gate.position,
      })),
      description: `Quantum circuit with ${circuit.gates.length} gates on ${circuit.numQubits} qubits`,
      timestamp: new Date().toISOString(),
    };
  };

  const generateQASMPreview = () => {
    let qasm = `OPENQASM 2.0;
include "qelib1.inc";

qreg q[${circuit.numQubits}];
creg c[${circuit.numQubits}];

`;

    // Group gates by position and apply in order
    const gatesByPosition = circuit.gates.reduce(
      (acc, gate) => {
        if (!acc[gate.position]) acc[gate.position] = [];
        acc[gate.position].push(gate);
        return acc;
      },
      {} as { [key: number]: CircuitGate[] },
    );

    const positions = Object.keys(gatesByPosition)
      .map(Number)
      .sort((a, b) => a - b);

    for (const position of positions) {
      const gates = gatesByPosition[position];
      for (const gate of gates) {
        // Map gate types to QASM equivalents
        let qasmGate = String(gate.type).toLowerCase();
        if (gate.type === "RX") qasmGate = "rx(pi/2)";
        if (gate.type === "RY") qasmGate = "ry(pi/2)";
        if (gate.type === "RZ") qasmGate = "rz(pi/2)";
        if (gate.type === "SX") qasmGate = "sx";
        if (gate.type === "SY") qasmGate = "sy";
        qasm += `${qasmGate} q[${gate.qubit}];\n`;
      }
    }

    qasm += `
measure q -> c;`;

    return qasm;
  };

  // Generate Qiskit Code
  const generateQiskitCode = () => {
    let code = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit import execute, Aer
from qiskit.visualization import plot_histogram, plot_bloch_multivector
from qiskit.quantum_info import Statevector
import matplotlib.pyplot as plt
import numpy as np

# Create quantum and classical registers
qreg = QuantumRegister(${circuit.numQubits}, 'q')
creg = ClassicalRegister(${circuit.numQubits}, 'c')

# Create quantum circuit
circuit = QuantumCircuit(qreg, creg)

# Initial state: |${"0".repeat(circuit.numQubits)}⟩
print(f"Initial state: |${"0".repeat(circuit.numQubits)}⟩")

`;

    if (circuit.gates.length === 0) {
      code += `# No gates applied - circuit remains in initial state

`;
    } else {
      code += `# Apply quantum gates:\n`;

      // Group gates by position and apply in order
      const gatesByPosition = circuit.gates.reduce(
        (acc, gate) => {
          if (!acc[gate.position]) acc[gate.position] = [];
          acc[gate.position].push(gate);
          return acc;
        },
        {} as { [key: number]: CircuitGate[] },
      );

      const positions = Object.keys(gatesByPosition)
        .map(Number)
        .sort((a, b) => a - b);

      for (const position of positions) {
        const gates = gatesByPosition[position];
        for (const gate of gates) {
          let gateCall = "";
          switch (gate.type) {
            case "H":
              gateCall = `circuit.h(${gate.qubit})`;
              break;
            case "X":
              gateCall = `circuit.x(${gate.qubit})`;
              break;
            case "Y":
              gateCall = `circuit.y(${gate.qubit})`;
              break;
            case "Z":
              gateCall = `circuit.z(${gate.qubit})`;
              break;
            case "S":
              gateCall = `circuit.s(${gate.qubit})`;
              break;
            case "T":
              gateCall = `circuit.t(${gate.qubit})`;
              break;
            case "I":
              gateCall = `circuit.i(${gate.qubit})`;
              break;
            case "RX":
              gateCall = `circuit.rx(np.pi/2, ${gate.qubit})`;
              break;
            case "RY":
              gateCall = `circuit.ry(np.pi/2, ${gate.qubit})`;
              break;
            case "RZ":
              gateCall = `circuit.rz(np.pi/2, ${gate.qubit})`;
              break;
            case "SX":
              gateCall = `circuit.sx(${gate.qubit})`;
              break;
            case "SY":
              gateCall = `circuit.sy(${gate.qubit})`;
              break;
            default:
              gateCall = `circuit.${String(gate.type).toLowerCase()}(${gate.qubit})`;
          }
          code += `${gateCall}  # ${gateDescriptions[gate.type]}\n`;
        }
      }
      code += `\n`;
    }

    code += `# Add measurements
circuit.measure_all()

# Print circuit
print("\nQuantum Circuit:")
print(circuit)

# Get statevector (before measurement)
statevector_circuit = circuit.copy()
statevector_circuit.remove_final_measurements()
statevector = Statevector.from_instruction(statevector_circuit)

print("\nStatevector:")
print(statevector)

# Calculate measurement probabilities
counts_dict = statevector.probabilities_dict()
print("\nMeasurement Probabilities:")
for state, prob in counts_dict.items():
    print(f"|{state}⟩: {prob:.3f} ({prob*100:.1f}%)")

# Execute circuit on simulator
backend = Aer.get_backend('qasm_simulator')
job = execute(circuit, backend, shots=1024)
result = job.result()
counts = result.get_counts(circuit)

print("\nSimulation Results (1024 shots):")
for state, count in sorted(counts.items()):
    print(f"|{state}⟩: {count} shots ({count/1024*100:.1f}%)")

# Visualizations
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Plot histogram
plot_histogram(counts, ax=ax1)
ax1.set_title('Measurement Results')

# Plot Bloch sphere (for single qubit) or statevector
if ${circuit.numQubits} == 1:
    plot_bloch_multivector(statevector, ax=ax2)
    ax2.set_title('Bloch Sphere')
else:
    # For multi-qubit systems, show statevector plot
    from qiskit.visualization import plot_state_qsphere
    plot_state_qsphere(statevector, ax=ax2)
    ax2.set_title('State Vector')

plt.tight_layout()
plt.show()

# Save circuit as QASM
qasm_str = circuit.qasm()
print("\nOpenQASM 2.0:")
print(qasm_str)`;

    return code;
  };

  // Generate Qiskit Circuit Diagram Text
  const generateQiskitCircuitDiagram = () => {
    if (circuit.gates.length === 0) {
      let diagram = `Qiskit Circuit Diagram:\n\n`;
      for (let i = 0; i < circuit.numQubits; i++) {
        diagram += `q_${i}: |0⟩─────────────────M──── c_${i}\n`;
      }
      diagram += `\nEmpty circuit - no gates applied`;
      return diagram;
    }

    // Calculate circuit depth for proper spacing
    const maxPosition =
      circuit.gates.length > 0
        ? Math.max(...circuit.gates.map((g) => g.position))
        : 0;
    const circuitDepth = maxPosition + 1;

    let diagram = `Qiskit Circuit Diagram:\n\n`;

    // Generate each qubit line
    for (let qubit = 0; qubit < circuit.numQubits; qubit++) {
      let line = `q_${qubit}: |0⟩─`;

      // Add gates at each position
      for (let position = 0; position <= maxPosition; position++) {
        const gatesAtPosition = circuit.gates.filter(
          (g) => g.qubit === qubit && g.position === position,
        );

        if (gatesAtPosition.length > 0) {
          const gate = gatesAtPosition[0]; // Take first gate if multiple
          const gateSymbol = getQiskitGateSymbol(gate.type);
          line += `─${gateSymbol}─`;
        } else {
          line += "─────"; // Empty space
        }
      }

      line += `─M──── c_${qubit}`;
      diagram += line + "\n";
    }

    // Add time steps
    diagram += "\n";
    let timeSteps = "        ";
    for (let position = 0; position <= maxPosition; position++) {
      timeSteps += ` t${position}  `;
    }
    diagram += timeSteps + "\n\n";

    // Add gate descriptions
    const usedGates = Array.from(new Set(circuit.gates.map((g) => g.type)));
    if (usedGates.length > 0) {
      diagram += "Gate Legend:\n";
      usedGates.forEach((gateType) => {
        const symbol = getQiskitGateSymbol(gateType);
        diagram += `${symbol}: ${quantumGates[gateType].name} - ${gateDescriptions[gateType]}\n`;
      });
    }

    // Add circuit statistics
    diagram += `\nCircuit Statistics:\n`;
    diagram += `- Qubits: ${circuit.numQubits}\n`;
    diagram += `- Depth: ${circuitDepth}\n`;
    diagram += `- Gates: ${circuit.gates.length}\n`;
    diagram += `- Gate types: ${usedGates.join(", ")}\n`;

    return diagram;
  };

  // Helper function to get Qiskit-style gate symbols
  const getQiskitGateSymbol = (gateType: string): string => {
    const symbols: { [key: string]: string } = {
      H: "─H─",
      X: "─X─",
      Y: "─Y─",
      Z: "─Z─",
      S: "─S─",
      T: "���T─",
      I: "─I─",
      RX: "RX(",
      RY: "RY(",
      RZ: "RZ(",
      SX: "SX─",
      SY: "SY─",
    };
    return symbols[gateType] || `─${gateType}─`;
  };

  // Copy circuit to clipboard with fallback
  const copyCircuitToClipboard = async () => {
    const circuitData = getCircuitDataForCopy();
    const textToCopy = JSON.stringify(circuitData, null, 2);

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        setCopyStatus("✓ Circuit copied to clipboard!");
        setTimeout(() => setCopyStatus(""), 3000);
        return;
      }
    } catch (err) {
      console.warn("Clipboard API failed, trying fallback method:", err);
    }

    // Fallback method using textarea
    try {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setCopyStatus("✓ Circuit copied to clipboard!");
        setTimeout(() => setCopyStatus(""), 3000);
      } else {
        throw new Error("execCommand failed");
      }
    } catch (fallbackErr) {
      // Last resort: show modal with text to copy manually
      setCopyStatus("📋 Click to view circuit data for manual copying");
      setShowCircuitDataModal(true);
      setTimeout(() => setCopyStatus(""), 5000);
      console.error("All copy methods failed:", fallbackErr);
    }
  };

  // Export circuit as QASM
  const exportToQASM = () => {
    try {
      // Generate QASM 2.0 code
      let qasm = `OPENQASM 2.0;
include "qelib1.inc";

qreg q[${circuit.numQubits}];
creg c[${circuit.numQubits}];

`;

      // Group gates by position and apply in order
      const gatesByPosition = circuit.gates.reduce(
        (acc, gate) => {
          if (!acc[gate.position]) acc[gate.position] = [];
          acc[gate.position].push(gate);
          return acc;
        },
        {} as { [key: number]: CircuitGate[] },
      );

      const positions = Object.keys(gatesByPosition)
        .map(Number)
        .sort((a, b) => a - b);

      for (const position of positions) {
        const gates = gatesByPosition[position];
        for (const gate of gates) {
          // Convert gate type to QASM format
          const qasmGate = String(gate.type).toLowerCase();
          qasm += `${qasmGate} q[${gate.qubit}];\n`;
        }
      }

      qasm += `
measure q -> c;`;

      // Download as file
      const blob = new Blob([qasm], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quantum_circuit_${Date.now()}.qasm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus("✓ QASM file downloaded!");
      setTimeout(() => setExportStatus(""), 3000);
    } catch (err) {
      setExportStatus("✗ Failed to export QASM");
      setTimeout(() => setExportStatus(""), 3000);
      console.error("Failed to export QASM:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Circuit Builder */}
      <Card className="bg-black/40 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Layers className="h-5 w-5 text-blue-400" />
            Quantum Circuit Builder
          </CardTitle>
          <CardDescription className="text-gray-300">
            Drag and drop gates to build your quantum circuit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Circuit Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="qubits" className="text-white text-sm">
                Qubits:
              </Label>
              <Input
                id="qubits"
                type="number"
                min="1"
                max="4"
                value={circuit.numQubits}
                onChange={(e) => updateNumQubits(parseInt(e.target.value) || 1)}
                className="w-16 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <Button
              onClick={executeCircuit}
              disabled={circuit.gates.length === 0 || isExecuting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Executing..." : "Execute Circuit"}
            </Button>

            <Button
              onClick={resetCircuit}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={() =>
                setShowCircuitVisualization(!showCircuitVisualization)
              }
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showCircuitVisualization ? "Hide" : "Show"} Visualization
            </Button>
          </div>

          {/* Gate Palette */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">
              Gate Palette ({Object.keys(quantumGates).length} gates available)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(quantumGates).map(([key, gate]) => (
                <div
                  key={key}
                  draggable
                  onDragStart={() =>
                    handleDragStart(key as keyof typeof quantumGates)
                  }
                  className={`${gateColors[key as keyof typeof gateColors]} text-white px-3 py-3 rounded-lg cursor-move hover:opacity-80 draggable-item gate-select text-center`}
                  title={`${gateDescriptions[key as keyof typeof gateDescriptions]}\n\nClick and drag to circuit grid`}
                >
                  <div className="font-bold text-sm">{gate.name}</div>
                  <div className="text-xs opacity-80 mt-1">{key}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              💡 Tip: Drag gates from palette to circuit grid. Hover over gates
              for descriptions.
            </div>
          </div>

          {/* Circuit Grid */}
          <div
            ref={circuitRef}
            className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 min-h-48"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-white font-medium text-sm">
                Circuit Builder Grid
              </h4>
              <div className="text-xs text-gray-400">
                {circuit.gates.length > 0
                  ? `${circuit.gates.length} gates, depth ${Math.max(...circuit.gates.map((g) => g.position), 0) + 1}`
                  : "Empty circuit - drag gates from palette"}
              </div>
            </div>
            <div
              className="grid gap-4"
              style={{ gridTemplateRows: `repeat(${circuit.numQubits}, 1fr)` }}
            >
              {Array.from({ length: circuit.numQubits }).map(
                (_, qubitIndex) => (
                  <div key={qubitIndex} className="flex items-center gap-2">
                    {/* Qubit Label */}
                    <div className="w-16 text-center text-white text-sm font-mono bg-gray-800/50 py-1 rounded">
                      |q{qubitIndex}⟩
                    </div>

                    {/* Qubit Line */}
                    <div className="flex-1 relative">
                      <div className="h-1 bg-gray-600 w-full"></div>

                      {/* Gate Drop Zones */}
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: 8 }).map((_, position) => (
                          <div
                            key={position}
                            onDrop={() => handleDrop(qubitIndex, position)}
                            onDragOver={handleDragOver}
                            className="flex-1 h-12 -mt-6 border border-dashed border-transparent hover:border-gray-500 hover:bg-gray-700/20 rounded relative"
                          >
                            {/* Position indicator */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-mono">
                              {position}
                            </div>

                            {/* Render gates at this position */}
                            {circuit.gates
                              .filter(
                                (gate) =>
                                  gate.qubit === qubitIndex &&
                                  gate.position === position,
                              )
                              .map((gate) => (
                                <div
                                  key={gate.id}
                                  className={`${gateColors[gate.type]} text-white text-xs px-2 py-1 rounded-lg m-1 flex items-center justify-between cursor-pointer group relative`}
                                  title={`${gateDescriptions[gate.type]}\n\nGate: ${gate.type}\nQubit: ${gate.qubit}\nPosition: ${gate.position}\n\nClick X to remove`}
                                >
                                  <span className="font-bold">
                                    {quantumGates[gate.type].name}
                                  </span>
                                  <button
                                    onClick={() => removeGate(gate.id)}
                                    className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 rounded px-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Circuit Summary Bar */}
            <div className="mt-4 bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    Circuit: {circuit.numQubits} qubit
                    {circuit.numQubits !== 1 ? "s" : ""} ×{" "}
                    {Math.max(...circuit.gates.map((g) => g.position), 0) + 1}{" "}
                    depth
                  </span>
                  {circuit.gates.length > 0 && (
                    <span className="text-white">
                      {Array.from(
                        new Set(circuit.gates.map((g) => g.type)),
                      ).map((type, index) => (
                        <span
                          key={type}
                          className={`inline-block px-1 py-0.5 rounded mr-1 ${gateColors[type]}`}
                        >
                          {type}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="text-gray-400">
                  {circuit.gates.length} gates total
                </div>
              </div>
            </div>
          </div>

          {/* Execution Progress */}
          {isExecuting && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                Executing step {circuit.currentStep}...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Circuit Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circuit Execution Visualization */}
        <Card className="bg-black/40 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Layers className="h-5 w-5 text-cyan-400" />
              Circuit Execution
            </CardTitle>
            <CardDescription className="text-gray-300">
              Visual representation of circuit execution with step-by-step gate
              application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Execution Status */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Execution Status:
                  </span>
                  <Badge
                    variant="outline"
                    className={`${isExecuting ? "border-yellow-400 text-yellow-400" : "border-green-400 text-green-400"}`}
                  >
                    {isExecuting ? "Running..." : "Ready"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  Step:{" "}
                  <span className="text-white font-mono">
                    {circuit.currentStep}
                  </span>{" "}
                  /{" "}
                  <span className="text-white font-mono">
                    {Math.max(...circuit.gates.map((g) => g.position), 0) + 1}
                  </span>
                </div>
              </div>

              {/* Visual Circuit Representation */}
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 overflow-x-auto scrollbar-hide">
                <h4 className="text-white font-medium mb-3 text-sm">
                  Circuit Execution Sequence
                </h4>
                <div className="space-y-3 min-w-max pr-4">
                  {Array.from({ length: circuit.numQubits }).map(
                    (_, qubitIndex) => (
                      <div key={qubitIndex} className="flex items-center gap-2">
                        {/* Qubit Label */}
                        <div className="w-12 text-center text-white text-sm font-mono">
                          |q{qubitIndex}⟩
                        </div>

                        {/* Execution Timeline */}
                        <div className="flex-1 relative">
                          <div className="h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 w-full"></div>

                          {/* Execution Gates */}
                          <div className="absolute inset-0 flex">
                            {Array.from({ length: 8 }).map((_, position) => {
                              const gatesAtPosition = circuit.gates.filter(
                                (gate) =>
                                  gate.qubit === qubitIndex &&
                                  gate.position === position,
                              );
                              const isExecuted =
                                isExecuting && position <= circuit.currentStep;
                              const isCurrentStep =
                                isExecuting && position === circuit.currentStep;

                              return (
                                <div
                                  key={position}
                                  className="flex-1 h-8 -mt-4 flex items-center justify-center"
                                >
                                  {gatesAtPosition.map((gate) => (
                                    <div
                                      key={gate.id}
                                      className={`
                                      ${gateColors[gate.type]}
                                      text-white text-xs px-2 py-1 rounded
                                      ${isExecuted ? "opacity-100" : "opacity-70"}
                                    `}
                                    >
                                      {quantumGates[gate.type].name}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Execution Results */}
              {(executionResults.length > 0 || !isExecuting) && (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h4 className="text-white font-medium mb-2 text-sm">
                      Execution Results
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">
                          {executionResults.length}
                        </div>
                        <div className="text-xs text-gray-400">Total Steps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {isExecuting ? "In Progress" : "Complete"}
                        </div>
                        <div className="text-xs text-gray-400">Status</div>
                      </div>
                    </div>
                  </div>

                  {/* Circuit Result State Visualization */}
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3 text-sm">
                      Final Quantum State
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bloch Sphere for Final State */}
                      <div className="text-center flex flex-col items-center">
                        <div className="text-sm text-gray-400 mb-2">
                          Bloch Sphere Representation
                        </div>
                        <div className="w-full max-w-[250px]">
                          <BlochSphereVisualization
                            coordinates={blochCoords}
                            size={200}
                            animated={false}
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {currentState.numQubits === 1
                            ? "Single Qubit State"
                            : `First Qubit (of ${currentState.numQubits})`}
                        </div>
                      </div>

                      {/* State Information */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-400 mb-2">
                            State Vector Components
                          </div>
                          <div className="bg-gray-900/50 p-3 rounded max-h-32 overflow-y-auto">
                            <div className="space-y-1 font-mono text-xs">
                              {currentState.amplitudes
                                .slice(0, 8)
                                .map((amp, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between"
                                  >
                                    <span className="text-cyan-400">
                                      |
                                      {index
                                        .toString(2)
                                        .padStart(currentState.numQubits, "0")}
                                      ⟩:
                                    </span>
                                    <span className="text-white">
                                      {amp.real.toFixed(3)} +{" "}
                                      {amp.imaginary.toFixed(3)}i
                                    </span>
                                  </div>
                                ))}
                              {currentState.amplitudes.length > 8 && (
                                <div className="text-gray-500 text-center">
                                  ... and {currentState.amplitudes.length - 8}{" "}
                                  more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-400 mb-2">
                            Measurement Probabilities
                          </div>
                          <div className="space-y-1">
                            {probabilities.slice(0, 4).map((prob, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-300">
                                  |
                                  {index
                                    .toString(2)
                                    .padStart(currentState.numQubits, "0")}
                                  ⟩
                                </span>
                                <span className="text-white font-mono">
                                  {(prob * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                            {probabilities.length > 4 && (
                              <div className="text-gray-500 text-center text-xs">
                                ... and {probabilities.length - 4} more states
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-400 mb-2">
                            Bloch Coordinates
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-red-500/20 p-2 rounded text-center">
                              <div className="text-red-400">X</div>
                              <div className="text-white font-mono">
                                {blochCoords.x.toFixed(3)}
                              </div>
                            </div>
                            <div className="bg-green-500/20 p-2 rounded text-center">
                              <div className="text-green-400">Y</div>
                              <div className="text-white font-mono">
                                {blochCoords.y.toFixed(3)}
                              </div>
                            </div>
                            <div className="bg-blue-500/20 p-2 rounded text-center">
                              <div className="text-blue-400">Z</div>
                              <div className="text-white font-mono">
                                {blochCoords.z.toFixed(3)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Applied Gates Summary */}
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <h4 className="text-white font-medium mb-2 text-sm">
                  Applied Gates ({circuit.gates.length})
                </h4>
                <div className="flex flex-wrap gap-1 min-h-[2rem]">
                  {circuit.gates.length > 0 ? (
                    circuit.gates.map((gate, index) => (
                      <Badge
                        key={gate.id}
                        variant="outline"
                        className={`text-xs ${gateColors[gate.type]} border-none ${isExecuting && index <= circuit.currentStep
                          ? "opacity-100"
                          : "opacity-70"
                          }`}
                      >
                        {quantumGates[gate.type].name}(q{gate.qubit})
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm italic">
                      No gates applied yet - drag gates to the circuit above!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurement Probabilities */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">
              Measurement Probabilities
            </CardTitle>
            <CardDescription className="text-gray-300">
              Real-time probability distribution as circuit evolves
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                      fill="url(#gradientPurple)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="gradientPurple"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Circuit Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400">Total Gates</div>
                  <div className="text-lg font-semibold text-white">
                    {circuit.gates.length}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400">Circuit Depth</div>
                  <div className="text-lg font-semibold text-white">
                    {Math.max(...circuit.gates.map((g) => g.position), 0) + 1}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400">Active Qubits</div>
                  <div className="text-lg font-semibold text-white">
                    {circuit.numQubits}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400">Execution Steps</div>
                  <div className="text-lg font-semibold text-white">
                    {executionResults.length}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 flex-1"
                  onClick={() =>
                    setShowCircuitVisualization(!showCircuitVisualization)
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showCircuitVisualization ? "Hide" : "Show"} Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                  onClick={resetCircuit}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Qiskit-Style Circuit Diagram */}
      {circuit.gates.length > 0 && (
        <Card className="bg-black/40 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Atom className="h-5 w-5 text-emerald-400" />
              Qiskit Circuit Visualization
            </CardTitle>
            <CardDescription className="text-gray-300">
              Qiskit-style quantum circuit representation with gate sequence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Circuit Diagram Visualization */}
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6 overflow-x-auto">
                <div className="min-w-fit">
                  <div className="space-y-8">
                    {Array.from({ length: circuit.numQubits }).map(
                      (_, qubitIndex) => (
                        <div
                          key={qubitIndex}
                          className="flex items-center gap-4"
                        >
                          {/* Qubit Label */}
                          <div className="w-16 text-center text-white text-sm font-mono bg-gray-800 py-2 px-3 rounded-lg">
                            |q{qubitIndex}⟩
                          </div>

                          {/* Initial State */}
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            0
                          </div>

                          {/* Circuit Line with Gates */}
                          <div className="flex-1 relative min-w-96">
                            <div className="h-1 bg-gray-600 w-full"></div>

                            {/* Gates for this qubit */}
                            <div className="absolute inset-0 flex justify-start items-center">
                              {Array.from({
                                length:
                                  Math.max(
                                    ...circuit.gates.map((g) => g.position),
                                    0,
                                  ) + 1,
                              }).map((_, position) => {
                                const gatesAtPosition = circuit.gates.filter(
                                  (gate) =>
                                    gate.qubit === qubitIndex &&
                                    gate.position === position,
                                );

                                return (
                                  <div
                                    key={position}
                                    className="flex-1 flex justify-center items-center"
                                    style={{ minWidth: "80px" }}
                                  >
                                    {gatesAtPosition.map((gate) => (
                                      <div
                                        key={gate.id}
                                        className={`
                                        ${gateColors[gate.type]}
                                        text-white font-bold text-sm px-3 py-2 rounded
                                        border-2 border-gray-800
                                        relative z-10
                                      `}
                                        title={`${gateDescriptions[gate.type]}\nStep: ${position + 1}\nQubit: ${qubitIndex}\nQiskit: circuit.${String(gate.type).toLowerCase()}(${qubitIndex})`}
                                      >
                                        {gate.type}
                                      </div>
                                    ))}
                                    {gatesAtPosition.length === 0 && (
                                      <div className="w-8 h-1 bg-gray-600"></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Measurement */}
                          <div className="w-12 h-8 bg-gray-700 border-2 border-gray-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            M
                          </div>

                          {/* Output */}
                          <div className="w-16 text-center text-white text-sm font-mono bg-gray-800 py-2 px-3 rounded-lg">
                            c{qubitIndex}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Time Steps */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-16"></div>
                  <div className="w-8"></div>
                  <div className="flex-1 min-w-96">
                    <div className="flex justify-start">
                      {Array.from({
                        length:
                          Math.max(...circuit.gates.map((g) => g.position), 0) +
                          1,
                      }).map((_, position) => (
                        <div
                          key={position}
                          className="flex-1 text-center text-xs text-gray-400 font-mono"
                          style={{ minWidth: "80px" }}
                        >
                          t{position}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-12"></div>
                  <div className="w-16"></div>
                </div>
              </div>

              {/* Qiskit Code and Circuit Diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Qiskit Code */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium text-sm">
                      Qiskit Python Code
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700 text-xs"
                      onClick={() => {
                        const qiskitCode = generateQiskitCode();
                        navigator.clipboard
                          .writeText(qiskitCode)
                          .then(() => {
                            setCopyStatus("✓ Qiskit code copied!");
                            setTimeout(() => setCopyStatus(""), 3000);
                          })
                          .catch(() => {
                            setCopyStatus("⚠️ Failed to copy Qiskit code");
                            setTimeout(() => setCopyStatus(""), 3000);
                          });
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-300 font-mono overflow-x-auto bg-black/30 p-3 rounded border border-gray-700 max-h-80">
                    {generateQiskitCode()}
                  </pre>
                </div>

                {/* Qiskit Circuit Diagram */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium text-sm">
                      Qiskit Circuit Diagram
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700 text-xs"
                      onClick={() => {
                        const circuitDiagram = generateQiskitCircuitDiagram();
                        navigator.clipboard
                          .writeText(circuitDiagram)
                          .then(() => {
                            setCopyStatus("✓ Circuit diagram copied!");
                            setTimeout(() => setCopyStatus(""), 3000);
                          })
                          .catch(() => {
                            setCopyStatus("⚠️ Failed to copy diagram");
                            setTimeout(() => setCopyStatus(""), 3000);
                          });
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-300 font-mono overflow-x-auto bg-black/30 p-3 rounded border border-gray-700 max-h-80">
                    {generateQiskitCircuitDiagram()}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Circuit Visualization Details */}
      {showCircuitVisualization && (
        <Card className="bg-black/40 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white">
              Detailed Circuit Analysis
            </CardTitle>
            <CardDescription className="text-gray-300">
              In-depth quantum state and circuit information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* State Vector Details */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Quantum State Vector</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg max-h-48 overflow-y-auto">
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
                          ��:
                        </span>
                        <span className="text-white">
                          {amp.real.toFixed(3)} + {amp.imaginary.toFixed(3)}i
                        </span>
                        <span className="text-gray-400 text-xs">
                          (|A|² ={" "}
                          {(
                            (amp.real * amp.real +
                              amp.imaginary * amp.imaginary) *
                            100
                          ).toFixed(1)}
                          %)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Circuit Properties */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Circuit Properties</h4>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Gate Types Used:</span>
                      <span className="text-white">
                        {
                          Array.from(new Set(circuit.gates.map((g) => g.type)))
                            .length
                        }
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Quantum Volume:</span>
                      <span className="text-white">
                        {Math.pow(
                          2,
                          Math.min(
                            circuit.numQubits,
                            Math.max(
                              ...circuit.gates.map((g) => g.position),
                              0,
                            ) + 1,
                          ),
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">State Purity:</span>
                      <span className="text-white">
                        {Math.sqrt(
                          blochCoords.x ** 2 +
                          blochCoords.y ** 2 +
                          blochCoords.z ** 2,
                        ).toFixed(3)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Bloch Vector Length:
                      </span>
                      <span className="text-white">
                        {Math.sqrt(
                          blochCoords.x ** 2 +
                          blochCoords.y ** 2 +
                          blochCoords.z ** 2,
                        ).toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preset Circuits and Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preset Circuits */}
        <Card className="bg-black/40 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white">Preset Circuits</CardTitle>
            <CardDescription className="text-gray-300">
              Load common quantum circuits and algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => loadPresetCircuit("bell")}
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 h-auto p-4 flex flex-col items-start interactive-card"
              >
                <div className="font-semibold">Bell State Circuit</div>
                <div className="text-xs text-gray-400 mt-1">H → CNOT</div>
                <div className="text-xs text-gray-400">
                  Creates maximum entanglement
                </div>
              </Button>

              <Button
                onClick={() => loadPresetCircuit("teleportation")}
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 h-auto p-4 flex flex-col items-start interactive-card"
              >
                <div className="font-semibold">Quantum Teleportation</div>
                <div className="text-xs text-gray-400 mt-1">
                  3-qubit protocol
                </div>
                <div className="text-xs text-gray-400">
                  Transfer quantum information
                </div>
              </Button>

              <Button
                onClick={() => loadPresetCircuit("grover")}
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 h-auto p-4 flex flex-col items-start interactive-card"
              >
                <div className="font-semibold">Grover's Algorithm</div>
                <div className="text-xs text-gray-400 mt-1">
                  Database search setup
                </div>
                <div className="text-xs text-gray-400">Quadratic speedup</div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Circuit Information & Export */}
        <Card className="bg-black/40 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white">Circuit Analysis</CardTitle>
            <CardDescription className="text-gray-300">
              Detailed information about your quantum circuit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-white">
                Gate Sequence:
              </div>
              <div className="flex flex-wrap gap-1">
                {circuit.gates.map((gate, index) => (
                  <Badge
                    key={gate.id}
                    variant="outline"
                    className={`text-xs ${gateColors[gate.type]} border-none`}
                  >
                    {quantumGates[gate.type].name}(q{gate.qubit})
                  </Badge>
                ))}
                {circuit.gates.length === 0 && (
                  <span className="text-gray-400 text-sm italic">
                    No gates added yet
                  </span>
                )}
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Circuit Statistics */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-white">
                Circuit Statistics:
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Total Gates:</span>
                  <span className="text-white">{circuit.gates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Circuit Depth:</span>
                  <span className="text-white">
                    {Math.max(...circuit.gates.map((g) => g.position), 0) + 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Single-Qubit Gates:</span>
                  <span className="text-white">{circuit.gates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique Gate Types:</span>
                  <span className="text-white">
                    {
                      Array.from(new Set(circuit.gates.map((g) => g.type)))
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gate Variety:</span>
                  <span className="text-white">
                    {Array.from(new Set(circuit.gates.map((g) => g.type))).join(
                      ", ",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Applied Circuit Sequence */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-white">
                Circuit Sequence:
              </div>
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3 max-h-32 overflow-y-auto">
                {circuit.gates.length > 0 ? (
                  <div className="space-y-1 text-xs font-mono">
                    {circuit.gates
                      .sort(
                        (a, b) => a.position - b.position || a.qubit - b.qubit,
                      )
                      .map((gate, index) => (
                        <div
                          key={gate.id}
                          className="flex justify-between items-center"
                        >
                          <span className="text-cyan-400">
                            Step {gate.position + 1}:
                          </span>
                          <span className="text-white">
                            {gate.type}(q{gate.qubit})
                          </span>
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${gateColors[gate.type]}`}
                          >
                            {quantumGates[gate.type].name}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic text-xs">
                    No gates in circuit
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gray-600" />

            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                  onClick={copyCircuitToClipboard}
                  disabled={circuit.gates.length === 0}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Circuit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                  onClick={exportToQASM}
                  disabled={circuit.gates.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export QASM
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                  onClick={() => setShowQASMPreview(!showQASMPreview)}
                  disabled={circuit.gates.length === 0}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showQASMPreview ? "Hide" : "Preview"} QASM
                </Button>
              </div>

              {/* QASM Preview */}
              {showQASMPreview && circuit.gates.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">
                      QASM 2.0 Code:
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700 text-xs"
                      onClick={() => {
                        const qasm = generateQASMPreview();
                        navigator.clipboard
                          .writeText(qasm)
                          .then(() => {
                            setCopyStatus("✓ QASM code copied!");
                            setTimeout(() => setCopyStatus(""), 3000);
                          })
                          .catch(() => {
                            setCopyStatus("⚠️ Failed to copy QASM");
                            setTimeout(() => setCopyStatus(""), 3000);
                          });
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap bg-black/30 p-3 rounded border border-gray-700">
                    {generateQASMPreview()}
                  </pre>
                  <div className="mt-2 text-xs text-gray-400">
                    💡 OpenQASM 2.0 compatible with Qiskit - use circuit.qasm()
                    or save as .qasm file
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {(copyStatus || exportStatus) && (
                <div className="text-sm">
                  {copyStatus && (
                    <div
                      className={`${copyStatus.includes("✓") ? "text-green-400" : "text-red-400"}`}
                    >
                      {copyStatus}
                    </div>
                  )}
                  {exportStatus && (
                    <div
                      className={`${exportStatus.includes("✓") ? "text-green-400" : "text-red-400"}`}
                    >
                      {exportStatus}
                    </div>
                  )}
                </div>
              )}

              {circuit.gates.length === 0 && (
                <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-400 italic mb-2">
                    No gates in circuit yet
                  </div>
                  <div className="text-xs text-gray-500">
                    Drag gates from the palette above to start building your
                    quantum circuit!
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Circuit Data Modal for Manual Copying */}
      <Dialog
        open={showCircuitDataModal}
        onOpenChange={setShowCircuitDataModal}
      >
        <DialogContent className="bg-gray-900 border-gray-600 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Circuit Data</DialogTitle>
            <DialogDescription className="text-gray-300">
              Automatic clipboard copy was blocked by your browser. You can:
              <br />• Click "Try Copy Again" button below
              <br />• Click the text area to select all, then press Ctrl+C
              (Cmd+C on Mac)
              <br />• Manually select and copy the text
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm">
                  Circuit JSON Data:
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 text-xs"
                  onClick={() => {
                    try {
                      const textArea = document.createElement("textarea");
                      textArea.value = JSON.stringify(
                        getCircuitDataForCopy(),
                        null,
                        2,
                      );
                      textArea.style.position = "fixed";
                      textArea.style.left = "-999999px";
                      document.body.appendChild(textArea);
                      textArea.focus();
                      textArea.select();
                      const successful = document.execCommand("copy");
                      document.body.removeChild(textArea);

                      if (successful) {
                        setCopyStatus("✓ Circuit copied to clipboard!");
                        setTimeout(() => setCopyStatus(""), 3000);
                        setShowCircuitDataModal(false);
                      } else {
                        setCopyStatus(
                          "⚠️ Please select and copy the text manually",
                        );
                        setTimeout(() => setCopyStatus(""), 5000);
                      }
                    } catch (err) {
                      setCopyStatus(
                        "⚠️ Please select and copy the text manually",
                      );
                      setTimeout(() => setCopyStatus(""), 5000);
                    }
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Try Copy Again
                </Button>
              </div>
              <pre
                className="text-xs text-gray-300 font-mono overflow-auto max-h-64 whitespace-pre-wrap bg-gray-900/50 p-3 rounded border border-gray-700 cursor-pointer hover:bg-gray-800/50"
                onClick={(e) => {
                  const range = document.createRange();
                  range.selectNodeContents(e.currentTarget);
                  const selection = window.getSelection();
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                }}
                title="Click to select all text for manual copying"
              >
                {JSON.stringify(getCircuitDataForCopy(), null, 2)}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCircuitDataModal(false)}
                className="border-gray-600 hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
