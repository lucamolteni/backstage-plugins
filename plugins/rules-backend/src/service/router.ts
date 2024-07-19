import { errorHandler } from '@backstage/backend-common';

import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

import {
  createJob,
  deleteJob,
  findRawData,
  findRawDataDetail,
  runJobs,
  runScorecards,
  testJob,
} from './ScoreCardRunner';

export interface RouterOptions {
  logger: Logger;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG1!');
    response.json({ status: 'ok' });
  });

  router.get('/health2', (_, response) => {
    logger.info('PONG2!');
    response.json({ status: 'ok' });
  });

  router.get('/job', async (_, response) => {
    const records = await runJobs();

    console.log('results: ', records);
    response.json({
      results: records,
    });
  });

  router.get('/job/:jobId/data', async (request, response) => {
    const jobId = parseInt(request.params.jobId, 10); // Convert jobId to number
    const records = await findRawData(jobId);

    console.log('results: ', records);
    response.json({
      results: records,
    });
  });

  router.get('/job/:jobId/data/:rawDataId', async (request, response) => {
    const jobId = parseInt(request.params.jobId, 10); // Convert jobId to number
    const rawDataId = parseInt(request.params.rawDataId, 10); // Convert jobId to number
    const records = await findRawDataDetail(jobId, rawDataId);

    console.log('results: ', records);
    response.json({
      results: records,
    });
  });

  router.post('/job/:jobId/test', async (request, response) => {
    const jobId = parseInt(request.params.jobId, 10); // Convert jobId to number
    const records = await testJob(jobId);

    console.log('results: ', records);
    response.json({
      results: records,
    });
  });

  router.delete('/job/:jobId', async (request, response) => {
    const jobId = parseInt(request.params.jobId, 10); // Convert jobId to number
    const records = await deleteJob(jobId);

    console.log('deleted: ', jobId);
    response.json({
      results: records,
    });
  });

  router.post('/job', async (request, response) => {
    const body = request.body;
    console.log('body: ', JSON.stringify(body));

    const records = await createJob(body.cron, body.type, body.endpoint);

    console.log('results: ', JSON.stringify(records));
    response.json({
      results: records,
    });
  });

  router.get('/scorecards', async (_, response) => {
    const records = await runScorecards();

    logger.info('PONG3!');

    response.json({
      results: records,
    });
  });

  router.use(errorHandler());
  return router;
}
