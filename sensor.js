// sensor.js
import mqtt from "mqtt";
import {
  NUM_SPOTS,
  MQTT_BROKER,
  SIM_TIME_RATIO,
  spotFailures,
  FAILURE_TYPES,
  shouldArrive,
  randomStayTime,
  createEventPayload,
  getSectorIdString,
  getSpotIdString,
  SPOTS_PER_GATEWAY
} from "./config.js";

class ParkingSensor {
  constructor(spotId) {
    this.spotId = spotId;
    this.status = 'FREE'; // FREE or OCCUPIED
    this.lastPublishedStatus = null; // Para publicar apenas mudanças
    this.occupiedUntil = 0; // sim minutes
    this.flappingCount = 0;
    this.client = mqtt.connect(MQTT_BROKER);
    this.client.on('connect', () => {
      console.log(`Sensor ${spotId}: conectado`);
    });
  }

  publishEvent(state, simMinutes) {
    const sectorNum = Math.ceil(this.spotId / SPOTS_PER_GATEWAY);
    const sectorId = getSectorIdString(sectorNum);
    const spotIdStr = getSpotIdString(this.spotId);
    const topic = `campus/parking/sectors/${sectorId}/spots/${spotIdStr}/events`;
    const payload = createEventPayload(this.spotId, state, 'sensor', simMinutes);
    this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
    console.log(`Sensor ${this.spotId} (${spotIdStr}): Evento - ${state}`);
    this.lastPublishedStatus = state;
  }

  update(simMinutes) {
    this.simMinutes = simMinutes;

    let newStatus = this.status;

    if (this.status === 'FREE') {
      if (shouldArrive(simMinutes)) {
        newStatus = 'OCCUPIED';
        this.occupiedUntil = simMinutes + randomStayTime();
        console.log(`Sensor ${this.spotId}: Veículo chegou, ficará até ${this.occupiedUntil} min sim`);
      }
    } else { // OCCUPIED
      if (simMinutes >= this.occupiedUntil) {
        newStatus = 'FREE';
        console.log(`Sensor ${this.spotId}: Veículo saiu`);
      }
    }

    // Aplicar falhas
    const failure = spotFailures.get(this.spotId) || FAILURE_TYPES.NONE;
    if (failure === FAILURE_TYPES.STUCK_OCCUPIED) {
      newStatus = 'OCCUPIED';
    } else if (failure === FAILURE_TYPES.STUCK_FREE) {
      newStatus = 'FREE';
    } else if (failure === FAILURE_TYPES.FLAPPING) {
      // Alterna a cada atualização
      newStatus = this.flappingCount % 2 === 0 ? 'FREE' : 'OCCUPIED';
      this.flappingCount++;
    }

    // Publicar apenas se mudou
    if (newStatus !== this.lastPublishedStatus) {
      this.status = newStatus;
      this.publishEvent(newStatus, simMinutes);
    }
  }
}

// Simulação
const sensors = [];
for (let i = 1; i <= NUM_SPOTS; i++) {
  sensors.push(new ParkingSensor(i));
}

let simMinutes = 0;

setInterval(() => {
  simMinutes++;
  console.log(`Minuto simulado: ${simMinutes} (${Math.floor(simMinutes / 60)}:${(simMinutes % 60).toString().padStart(2, '0')})`);

  sensors.forEach(sensor => sensor.update(simMinutes));
}, 1000 * SIM_TIME_RATIO); // 1s = 1 min sim