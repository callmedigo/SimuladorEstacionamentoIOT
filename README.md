# IOT-Estacionamento

Simulação de sistema IoT para estacionamento com 90 sensores de vagas e 3 gateways.

## Funções

- **90 Sensores**: Um por vaga, publicam status (FREE/OCCUPIED) via MQTT.
- **3 Gateways**: Um por setor (30 vagas cada), agregam status do setor.
- **Padrões Realistas**: Horários de pico (7-9h e 17-19h) com mais chegadas, tempo de permanência 30min-6h.
- **Tempo Simulado**: 1 segundo = 1 minuto simulado.
- **Injeção Automática de Falhas**: Falhas aleatórias injetadas continuamente no simulador.

## Arquivos

- `config.js`: Configurações e constantes.
- `sensor.js`: Simula os 90 sensores.
- `gateway.js`: Simula os 3 gateways.
- `failure_server.js`: Simula injeção automática de falhas aleatórias.

## Execução

### Rápido (tudo junto):
```bash
npm install
npm start
```

### Componente por componente:
1. Dependências: `npm install`

2. Iniciar broker MQTT: `mosquitto -p 1883`

3. Executar sensores: `npm run start:sensors`

4. Executar gateways: `npm run start:gateways`

5. Executar simulador de falhas: `npm run start:failures`

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

## Simulador de Falhas

O `failure_server.js` injeta falhas aleatoriamente e continuamente:
- **Intervalo de injeção**: 30 segundos
- **Probabilidade**: 30% de chance de injetar falha a cada intervalo
- **Duração**: Cada falha dura entre 1-5 minutos e é removida automaticamente
- **Funcionamento**: Roda autonomamente sem necessidade de requisições HTTP

Tipos de falha: `stuck_occupied`, `stuck_free`, `flapping`