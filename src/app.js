import express from 'express';
import dbOracle from '../routes/oracle.js';
// import cluster from 'cluster';
// import os from 'os';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocuments } from '../config/doc.js';
// const numCPUs = os.cpus().length;

const app = express();
const APP_PORT = process.env.PORT || 9090;

app.use(express.json());
app.use('/oracle', dbOracle);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocuments));

app.get('/', (_, res) => {
  res.send({ message: 'API para monitoração Banco' });
});

// if (cluster.isMaster) {
//   console.log('Master process is running');
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(
//       `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`
//     );
//     console.log('Starting a new worker');
//     cluster.fork();
//   });
// } else {
app.listen(APP_PORT, async () => {
  try {
    console.log(
      `Serviço iniciado na porta ${APP_PORT}`
      // `Serviço iniciado na porta ${APP_PORT}, iniciando cluster ${cluster.worker.id}`
    );
  } catch (err) {
    console.log(err);
  }
});
// }
