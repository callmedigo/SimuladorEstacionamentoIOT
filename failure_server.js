// failure_server.js - Simulador de falhas automático
import { spotFailures, FAILURE_TYPES, NUM_SPOTS, SIM_TIME_RATIO } from "./config.js";

const FAILURE_TYPES_LIST = Object.values(FAILURE_TYPES).filter(f => f !== 'none');

// Configurações
const FAILURE_INJECTION_INTERVAL = 30000; // 30s = injeta falha a cada 30s
const FAILURE_DURATION_MIN = 60000; // 1 min
const FAILURE_DURATION_MAX = 300000; // 5 min
const FAILURE_PROBABILITY = 0.3; // 30% chance de injetar falha a cada intervalo

// Mapa com timeout das falhas em andamento
const activeFailures = new Map(); // spotId -> timeoutId

function getRandomSpot() {
  return Math.floor(Math.random() * NUM_SPOTS) + 1;
}

function getRandomFailureType() {
  return FAILURE_TYPES_LIST[Math.floor(Math.random() * FAILURE_TYPES_LIST.length)];
}

function getRandomFailureDuration() {
  return Math.floor(Math.random() * (FAILURE_DURATION_MAX - FAILURE_DURATION_MIN + 1)) + FAILURE_DURATION_MIN;
}

function injectFailure(spotId, failureType) {
  // Se já há falha ativa neste spot, aguarde limpar
  if (activeFailures.has(spotId)) {
    clearTimeout(activeFailures.get(spotId));
  }

  spotFailures.set(spotId, failureType);
  const duration = getRandomFailureDuration();
  
  console.log(`[${new Date().toLocaleTimeString()}] 🔴 Falha injetada: Spot ${spotId} - ${failureType} (duração: ${Math.floor(duration / 1000)}s)`);

  // Agendar limpeza da falha
  const timeoutId = setTimeout(() => {
    clearFailure(spotId);
  }, duration);

  activeFailures.set(spotId, timeoutId);
}

function clearFailure(spotId) {
  if (spotFailures.has(spotId)) {
    const failureType = spotFailures.get(spotId);
    spotFailures.delete(spotId);
    activeFailures.delete(spotId);
    console.log(`[${new Date().toLocaleTimeString()}] 🟢 Falha removida: Spot ${spotId} (${failureType})`);
  }
}

// Loop principal de injeção de falhas
setInterval(() => {
  if (Math.random() < FAILURE_PROBABILITY) {
    const spotId = getRandomSpot();
    const failureType = getRandomFailureType();
    injectFailure(spotId, failureType);
  }
}, FAILURE_INJECTION_INTERVAL);

console.log('🚗 Simulador de falhas iniciado');
console.log(`   - Intervalo de injeção: ${FAILURE_INJECTION_INTERVAL / 1000}s`);
console.log(`   - Probabilidade de falha: ${FAILURE_PROBABILITY * 100}%`);
console.log(`   - Duração das falhas: ${FAILURE_DURATION_MIN / 1000}s a ${FAILURE_DURATION_MAX / 1000}s`);
console.log('   - Vou injetar falhas aleatoriamente neste simulador...\n');