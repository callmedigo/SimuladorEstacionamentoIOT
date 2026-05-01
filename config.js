// config.js
import { randomUUID } from 'crypto';

export const NUM_SPOTS = 90;
export const NUM_GATEWAYS = 3;
export const SPOTS_PER_GATEWAY = NUM_SPOTS / NUM_GATEWAYS; // 30
export const SIM_TIME_RATIO = 1; // 1s = 1 min simulated
export const MQTT_BROKER = "mqtt://localhost:1883";

// Mapeamento de setores
export const SECTOR_MAP = { 1: 'A', 2: 'B', 3: 'C' };

// Função para gerar spotId string
export function getSpotIdString(spotId) {
  const sectorNum = Math.ceil(spotId / SPOTS_PER_GATEWAY);
  const sectorLetter = SECTOR_MAP[sectorNum];
  const spotInSector = ((spotId - 1) % SPOTS_PER_GATEWAY) + 1;
  return `${sectorLetter}-${spotInSector.toString().padStart(2, '0')}`;
}

// Função para gerar sectorId string
export function getSectorIdString(sectorNum) {
  return SECTOR_MAP[sectorNum];
}

// Horários de pico: 7-9h e 17-19h (em minutos simulados: 420-540 e 1020-1140)
export const PEAK_HOURS = [
  { start: 420, end: 540 }, // 7-9h
  { start: 1020, end: 1140 } // 17-19h
];

// Probabilidades de chegada (por minuto simulado)
export const ARRIVAL_PROB_PEAK = 0.1; // 10% chance por minuto em pico
export const ARRIVAL_PROB_OFF_PEAK = 0.02; // 2% fora pico

// Tempo de permanência: 30-360 min simulados
export const MIN_STAY = 30;
export const MAX_STAY = 360;

// Falhas possíveis
export const FAILURE_TYPES = {
  NONE: 'none',
  STUCK_OCCUPIED: 'stuck_occupied',
  STUCK_FREE: 'stuck_free',
  FLAPPING: 'flapping'
};

// Estado global de falhas (por spot ID)
export const spotFailures = new Map();

// Função para checar se horário é pico
export function isPeakHour(simMinutes) {
  const hour = simMinutes % 1440; // 24h = 1440 min
  return PEAK_HOURS.some(peak => hour >= peak.start && hour < peak.end);
}

// Função para gerar tempo de permanência aleatório
export function randomStayTime() {
  return Math.floor(Math.random() * (MAX_STAY - MIN_STAY + 1)) + MIN_STAY;
}

// Função para decidir se há chegada
export function shouldArrive(simMinutes) {
  const prob = isPeakHour(simMinutes) ? ARRIVAL_PROB_PEAK : ARRIVAL_PROB_OFF_PEAK;
  return Math.random() < prob;
}

// Função para criar payload de evento
export function createEventPayload(spotId, state, source, simMinutes) {
  const sectorNum = Math.ceil(spotId / SPOTS_PER_GATEWAY);
  return {
    eventId: randomUUID(),
    ts: new Date(Date.now() + simMinutes * 60000).toISOString(), // sim time
    sectorId: getSectorIdString(sectorNum),
    spotId: getSpotIdString(spotId),
    state: state,
    source: source
  };
}