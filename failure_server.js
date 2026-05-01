// failure_server.js
import express from "express";
import { spotFailures, FAILURE_TYPES, NUM_SPOTS } from "./config.js";

const app = express();
app.use(express.json());

app.post('/inject-failure', (req, res) => {
  const { spotId, failureType } = req.body;
  if (spotId < 1 || spotId > NUM_SPOTS) {
    return res.status(400).json({ error: 'Invalid spotId' });
  }
  if (!Object.values(FAILURE_TYPES).includes(failureType)) {
    return res.status(400).json({ error: 'Invalid failureType' });
  }
  spotFailures.set(spotId, failureType);
  res.json({ message: `Failure ${failureType} injected for spot ${spotId}` });
});

app.delete('/clear-failure/:spotId', (req, res) => {
  const spotId = parseInt(req.params.spotId);
  if (spotFailures.has(spotId)) {
    spotFailures.delete(spotId);
    res.json({ message: `Failure cleared for spot ${spotId}` });
  } else {
    res.status(404).json({ error: 'No failure for this spot' });
  }
});

app.get('/failures', (req, res) => {
  const failures = {};
  for (let [spotId, failure] of spotFailures) {
    failures[spotId] = failure;
  }
  res.json(failures);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Failure injection server running on port ${PORT}`);
});