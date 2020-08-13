import express from 'express';
import dbOracle from '../services/oracleTransaction.js';

const router = express.Router();

router.get('/', dbOracle.findAllMetrics);
router.get('/locked', dbOracle.findAllMetrics2);
router.get('/lockwait', dbOracle.findLockWait);
router.post('/select', dbOracle.findAllSelect);
router.get('/tablespace', dbOracle.findAllTableSpace);
router.post('/tablespace', dbOracle.collectTablespace);
router.get('/instance', dbOracle.findAllInstance);
router.post('/instance', dbOracle.collectInstance);

export default router;
