import { createApiRef } from '@backstage/core-plugin-api';

import { Job, RawData, RawDataDetail, ScoreCard } from './types';

export interface ScoreCardApi {
  getHealth(): Promise<{ status: string }>;

  listScoreCards(): Promise<{ results: ScoreCard[] }>;

  getJobs(): Promise<{ results: Job[] }>;

  getRawData(jobId: number): Promise<{ results: RawData[] }>;

  getRawDataDetail(
    jobId: number,
    rawDataId: number,
  ): Promise<{ results: RawDataDetail }>;

  testJob(jobId: number): Promise<Response>;

  deleteJob(jobId: number): Promise<Response>;

  createJob(cron: string, type: string, endpoint: string): Promise<Response>;
}

export const scoreCardApiRef = createApiRef<ScoreCardApi>({
  id: 'plugin.rules.api',
});
