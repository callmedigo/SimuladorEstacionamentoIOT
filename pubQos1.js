import mqtt from "mqtt";

const options = {
  will: {
    topic: "estufa/agua/nivel/status",
    payload: JSON.stringify({ status: "offline", timestamp: new Date().toISOString() }),
    qos: 1,
    retain: true,
  },
};

const client = mqtt.connect("mqtt://localhost:1883", options);

client.on("connect", () => {
  console.log("PUB QoS1: conectado");

  // Publica um status online retido para que novos assinantes saibam que o publisher está ativo.
  client.publish(
    "estufa/agua/nivel/status",
    JSON.stringify({ status: "online", timestamp: new Date().toISOString() }),
    { qos: 1, retain: true }
  );

  let i = 0;

  const t = setInterval(() => {
    const nivelLitros = Math.max(0, 1000 - i * 90); // diminui 90L por envio
    const payload = {
      nivelLitros,
      capacidadeLitros: 1000,
      percentual: Number(((nivelLitros / 1000) * 100).toFixed(1)),
      status:
        nivelLitros <= 200 ? "baixo" : nivelLitros >= 900 ? "cheio" : "normal",
      timestamp: new Date().toISOString(),
    };

    client.publish("estufa/agua/nivel", JSON.stringify(payload), { qos: 1, retain: true });
    console.log("PUB QoS1 enviou:", payload);
    i++;

    if (i === 10) {
      clearInterval(t);
      client.end();
    }
  }, 10000); //30000
});
