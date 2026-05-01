# IOT-Estacionamento

Simulação de sistema IoT para estacionamento com 90 sensores de vagas e 3 gateways.

## Funções

- **90 Sensores**: Um por vaga, publicam status (FREE/OCCUPIED) via MQTT.
- **3 Gateways**: Um por setor (30 vagas cada), agregam status do setor.
- **Padrões Realistas**: Horários de pico (7-9h e 17-19h) com mais chegadas, tempo de permanência 30min-6h.
- **Tempo Simulado**: 1 segundo = 1 minuto simulado.
- **Modo de Teste**: Injeção de falhas via HTTP API.

## Arquivos

- `config.js`: Configurações e constantes.
- `sensor.js`: Simula os 90 sensores.
- `gateway.js`: Simula os 3 gateways.
- `failure_server.js`: Servidor HTTP para injetar falhas.

## Execução

1. dependências: `npm install mqtt express`

2. Iniciar broker: `mosquitto -p 1883`

3. Executar sensores: `node sensor.js`

4. Executar gateways: `node gateway.js`

5. Executar servidor de falhas: `node failure_server.js`

## Tópicos MQTT

- Eventos de vaga: `campus/parking/sectors/<sectorId>/spots/<spotId>/events`
- Status do gateway: `campus/parking/sectors/<sectorId>/gateway/status`

Payload JSON:
```json
{
  "eventId": "uuid",
  "ts": "2026-04-29T10:15:30.000Z",
  "sectorId": "A",
  "spotId": "A-07",
  "state": "OCCUPIED",
  "source": "sensor|gateway"
}
```

Para gateways, spotId pode ser "ALL" e state "HEALTHY" com contagens adicionais.

## API de Falhas

- `POST /inject-failure`: Body: `{ "spotId": 1, "failureType": "stuck_occupied" }`
- `DELETE /clear-failure/{spotId}`: Limpa falha da vaga
- `GET /failures`: Lista falhas ativas

Tipos de falha: `none`, `stuck_occupied`, `stuck_free`, `flapping`