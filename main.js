"use strict"

const app           = require('express')(),
      helmet        = require('helmet'),
      cors          = require('cors'),
      moment        = require('moment'),
      uuid          = require("uuid"),
      logger        = require('pino')(),
      httplogger    = require('pino-http')();

const port = process.env.PORT || 3000;


app.use(cors());
app.use(helmet());

process.on('SIGINT',  shutDown);
process.on('SIGQUIT', shutDown);
process.on('SIGTERM', shutDown);

app.get('/', (req, res) => {
  httplogger(req, res)
  const ts = moment();
  let response = {
    req_id: uuid.v4(),
    timestamp: ts.valueOf(),
    date_time: ts.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  }
  logger.info(`got request ${req.url}`);
  res.json(response);
})

const server = app.listen(port, ()=>{
  logger.info(`APIv2 service listening on port ${port}`);
});


function shutDown(signal) {
  logger.info(`Received ${signal} signal, shutting down gracefully`);
  server.close(() => {
    logger.info('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    logger.info('Could not close connections in time, forcefully shutting down')
    process.exit(1);
  }, 1000);
}
