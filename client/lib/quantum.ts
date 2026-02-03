// Quantum State Simulator for Quantara
// Implements basic quantum operations and state manipulations

export interface QuantumState {
  amplitudes: Complex[];
  numQubits: number;
  name?: string;
}

export interface Complex {
  real: number;
  imaginary: number;
}

export interface QuantumGate {
  name: string;
  matrix: Complex[][];
  description: string;
  targets: number[];
  controls?: number[];
}

export interface BlochCoordinates {
  x: number;
  y: number;
  z: number;
}

// Complex number operations
export const complexAdd = (a: Complex, b: Complex): Complex => ({
  real: a.real + b.real,
  imaginary: a.imaginary + b.imaginary,
});

export const complexMultiply = (a: Complex, b: Complex): Complex => ({
  real: a.real * b.real - a.imaginary * b.imaginary,
  imaginary: a.real * b.imaginary + a.imaginary * b.real,
});

export const complexMagnitude = (c: Complex): number =>
  Math.sqrt(c.real * c.real + c.imaginary * c.imaginary);

export const complexPhase = (c: Complex): number =>
  Math.atan2(c.imaginary, c.real);

// Initialize quantum states
export const createZeroState = (numQubits: number): QuantumState => {
  const numStates = Math.pow(2, numQubits);
  const amplitudes: Complex[] = new Array(numStates).fill(null).map((_, i) => ({
    real: i === 0 ? 1 : 0,
    imaginary: 0,
  }));

  return { amplitudes, numQubits, name: `|${"0".repeat(numQubits)}⟩` };
};

export const createSuperpositionState = (numQubits: number): QuantumState => {
  const numStates = Math.pow(2, numQubits);
  const amplitude = 1 / Math.sqrt(numStates);
  const amplitudes: Complex[] = new Array(numStates).fill(null).map(() => ({
    real: amplitude,
    imaginary: 0,
  }));

  return { amplitudes, numQubits, name: `|+⟩^⊗${numQubits}` };
};

// Quantum Gates
export const quantumGates = {
  H: {
    name: "Hadamard",
    matrix: [
      [
        { real: 1 / Math.sqrt(2), imaginary: 0 },
        { real: 1 / Math.sqrt(2), imaginary: 0 },
      ],
      [
        { real: 1 / Math.sqrt(2), imaginary: 0 },
        { real: -1 / Math.sqrt(2), imaginary: 0 },
      ],
    ],
    description:
      "Creates superposition: |0⟩ → (|0⟩+|1⟩)/√2, |1⟩ → (|0⟩-|1⟩)/√2",
    targets: [0],
  },
  X: {
    name: "Pauli-X",
    matrix: [
      [
        { real: 0, imaginary: 0 },
        { real: 1, imaginary: 0 },
      ],
      [
        { real: 1, imaginary: 0 },
        { real: 0, imaginary: 0 },
      ],
    ],
    description: "Bit flip: |0⟩ → |1⟩, |1⟩ → |0⟩",
    targets: [0],
  },
  Y: {
    name: "Pauli-Y",
    matrix: [
      [
        { real: 0, imaginary: 0 },
        { real: 0, imaginary: -1 },
      ],
      [
        { real: 0, imaginary: 1 },
        { real: 0, imaginary: 0 },
      ],
    ],
    description: "Y rotation: |0⟩ → i|1⟩, |1⟩ → -i|0⟩",
    targets: [0],
  },
  Z: {
    name: "Pauli-Z",
    matrix: [
      [
        { real: 1, imaginary: 0 },
        { real: 0, imaginary: 0 },
      ],
      [
        { real: 0, imaginary: 0 },
        { real: -1, imaginary: 0 },
      ],
    ],
    description: "Phase flip: |0⟩ → |0⟩, |1⟩ → -|1⟩",
    targets: [0],
  },
  S: {
    name: "S Gate",
    matrix: [
      [
        { real: 1, imaginary: 0 },
        { real: 0, imaginary: 0 },
      ],
      [
        { real: 0, imaginary: 0 },
        { real: 0, imaginary: 1 },
      ],
    ],
    description: "Phase gate: |0⟩ → |0⟩, |1⟩ → i|1⟩",
    targets: [0],
  },
  T: {
    name: "T Gate",
    matrix: [
      [
        { real: 1, imaginary: 0 },
        { real: 0, imaginary: 0 },
      ],
      [
        { real: 0, imaginary: 0 },
        { real: Math.cos(Math.PI / 4), imaginary: Math.sin(Math.PI / 4) },
      ],
    ],
    description: "π/8 phase gate: |0⟩ → |0⟩, |1⟩ → e^(iπ/4)|1⟩",
    targets: [0],
  },
  I: {
    name: "Identity",
    matrix: [
      [
        { real: 1, imaginary: 0 },
        { real: 0, imaginary: 0 },
      ],
      [
        { real: 0, imaginary: 0 },
        { real: 1, imaginary: 0 },
      ],
    ],
    description: "Identity gate: |0⟩ → |0⟩, |1⟩ → |1⟩",
    targets: [0],
  },
  RX: {
    name: "RX(π/2)",
    matrix: [
      [
        { real: Math.cos(Math.PI / 4), imaginary: 0 },
        { real: 0, imaginary: -Math.sin(Math.PI / 4) },
      ],
      [
        { real: 0, imaginary: -Math.sin(Math.PI / 4) },
        { real: Math.cos(Math.PI / 4), imaginary: 0 },
      ],
    ],
    description:
      "X-axis rotation by π/2: rotates around X-axis on Bloch sphere",
    targets: [0],
  },
  RY: {
    name: "RY(π/2)",
    matrix: [
      [
        { real: Math.cos(Math.PI / 4), imaginary: 0 },
        { real: -Math.sin(Math.PI / 4), imaginary: 0 },
      ],
      [
        { real: Math.sin(Math.PI / 4), imaginary: 0 },
        { real: Math.cos(Math.PI / 4), imaginary: 0 },
      ],
    ],
    description:
      "Y-axis rotation by π/2: rotates around Y-axis on Bloch sphere",
    targets: [0],
  },
  RZ: {
    name: "RZ(π/2)",
    matrix: [
      [
        { real: Math.cos(Math.PI / 4), imaginary: -Math.sin(Math.PI / 4) },
        { real: 0, imaginary: 0 },
      ],
      [
        { real: 0, imaginary: 0 },
        { real: Math.cos(Math.PI / 4), imaginary: Math.sin(Math.PI / 4) },
      ],
    ],
    description:
      "Z-axis rotation by π/2: rotates around Z-axis on Bloch sphere",
    targets: [0],
  },
  SX: {
    name: "√X",
    matrix: [
      [
        { real: 0.5, imaginary: 0.5 },
        { real: 0.5, imaginary: -0.5 },
      ],
      [
        { real: 0.5, imaginary: -0.5 },
        { real: 0.5, imaginary: 0.5 },
      ],
    ],
    description: "Square root of X gate: √X · √X = X",
    targets: [0],
  },
  SY: {
    name: "√Y",
    matrix: [
      [
        { real: 0.5, imaginary: 0.5 },
        { real: -0.5, imaginary: -0.5 },
      ],
      [
        { real: 0.5, imaginary: 0.5 },
        { real: 0.5, imaginary: 0.5 },
      ],
    ],
    description: "Square root of Y gate: √Y · √Y = Y",
    targets: [0],
  },
};

// Apply single-qubit gate
export const applySingleQubitGate = (
  state: QuantumState,
  gate: Complex[][],
  targetQubit: number,
): QuantumState => {
  const numStates = state.amplitudes.length;
  const newAmplitudes: Complex[] = new Array(numStates);

  for (let i = 0; i < numStates; i++) {
    newAmplitudes[i] = { real: 0, imaginary: 0 };
  }

  for (let i = 0; i < numStates; i++) {
    const targetBit = (i >> targetQubit) & 1;
    const otherBits = i ^ (targetBit << targetQubit);

    // Apply gate matrix
    for (let j = 0; j < 2; j++) {
      const newState = otherBits | (j << targetQubit);
      const gateElement = gate[j][targetBit];
      const contribution = complexMultiply(gateElement, state.amplitudes[i]);
      newAmplitudes[newState] = complexAdd(
        newAmplitudes[newState],
        contribution,
      );
    }
  }

  return { ...state, amplitudes: newAmplitudes };
};

// Convert single qubit state to Bloch sphere coordinates
export const toBlochCoordinates = (state: QuantumState): BlochCoordinates => {
  if (state.numQubits !== 1) {
    throw new Error("Bloch coordinates only available for single qubits");
  }

  const [alpha, beta] = state.amplitudes;

  // Convert to Bloch sphere coordinates
  const x = 2 * (alpha.real * beta.real + alpha.imaginary * beta.imaginary);
  const y = 2 * (alpha.imaginary * beta.real - alpha.real * beta.imaginary);
  const z = complexMagnitude(alpha) ** 2 - complexMagnitude(beta) ** 2;

  return { x, y, z };
};

// Calculate measurement probabilities
export const getMeasurementProbabilities = (state: QuantumState): number[] => {
  return state.amplitudes.map((amplitude) => complexMagnitude(amplitude) ** 2);
};

// Calculate entanglement entropy between qubits
export const calculateEntanglement = (
  state: QuantumState,
  qubitA: number,
  qubitB: number,
): number => {
  if (state.numQubits < 2) return 0;

  // Simplified entanglement measure based on correlation
  const probs = getMeasurementProbabilities(state);
  let entanglement = 0;

  for (let i = 0; i < probs.length; i++) {
    const bitA = (i >> qubitA) & 1;
    const bitB = (i >> qubitB) & 1;
    if (bitA === bitB && probs[i] > 0) {
      entanglement += probs[i] * Math.log2(probs[i] + 1e-10);
    }
  }

  return Math.abs(entanglement);
};

// Generate common quantum states
export const bellState = (): QuantumState => {
  const state = createZeroState(2);
  // Apply H to first qubit
  let newState = applySingleQubitGate(state, quantumGates.H.matrix, 0);
  // Apply CNOT (simplified for demo)
  const amplitudes = newState.amplitudes.map(() => ({ real: 0, imaginary: 0 }));
  amplitudes[0] = { real: 1 / Math.sqrt(2), imaginary: 0 };
  amplitudes[3] = { real: 1 / Math.sqrt(2), imaginary: 0 };

  return { amplitudes, numQubits: 2, name: "|Φ+⟩ Bell State" };
};

export const ghzState = (): QuantumState => {
  const amplitudes = new Array(8)
    .fill(null)
    .map(() => ({ real: 0, imaginary: 0 }));
  amplitudes[0] = { real: 1 / Math.sqrt(2), imaginary: 0 };
  amplitudes[7] = { real: 1 / Math.sqrt(2), imaginary: 0 };

  return { amplitudes, numQubits: 3, name: "|GHZ⟩ State" };
};
