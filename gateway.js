// gateway.js
import mqtt from "mqtt";
import { NUM_GATEWAYS, SPOTS_PER_GATEWAY, MQTT_BROKER, getSectorIdString } from "./config.js";
import { randomUUID } from 'crypto';

class ParkingGateway {
  constructor(gatewayId) {
    this.gatewayId = gatewayId;
    this.spotStatuses = new Map(); // spotId string -> status

    this.client = mqtt.connect(MQTT_BROKER);
    this.client.on('connect', () => {
      console.log(`Gateway ${gatewayId}: conectado, setor ${getSectorIdString(gatewayId)}`);
      // Subscribe to events from spots in sector
      const sectorId = getSectorIdString(gatewayId);
      this.client.subscribe(`campus/parking/sectors/${sectorId}/spots/+/events`, { qos: 1 });
    });

    this.client.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString());
      this.spotStatuses.set(payload.spotId, payload.state);
      console.log(`Gateway ${gatewayId}: Spot ${payload.spotId} = ${payload.state}`);
    });
  }

  publishGatewayStatus(simMinutes) {
    const sectorId = getSectorIdString(this.gatewayId);
    const topic = `campus/parking/sectors/${sectorId}/gateway/status`;
    const payload = {
      eventId: randomUUID(),
      ts: new Date(Date.now() + simMinutes * 60000).toISOString(),
      sectorId: sectorId,
      spotId: "ALL",
      state: "HEALTHY",
      source: "gateway",
      freeCount: Array.from(this.spotStatuses.values()).filter(s => s === 'FREE').length,
      occupiedCount: Array.from(this.spotStatuses.values()).filter(s => s === 'OCCUPIED').length
    };
    this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
    console.log(`Gateway ${this.gatewayId}: Status - Free: ${payload.freeCount}, Occupied: ${payload.occupiedCount}`);
  }
}

// Criar 3 gateways
const gateways = [];
for (let i = 1; i <= NUM_GATEWAYS; i++) {
  gateways.push(new ParkingGateway(i));
}

// Publicar status do gateway a cada 10s (10 min sim)
let simMinutes = 0;
setInterval(() => {
  simMinutes += 10;
  gateways.forEach(gateway => gateway.publishGatewayStatus(simMinutes));
}, 10000);