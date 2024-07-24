import {ConfigApi, DiscoveryApi} from '@backstage/core-plugin-api';

import {data} from 'msw';

import {ScoreCardApi} from './api';
import {Job, RawData, RawDataDetail, ScoreCard} from './types';

export class ScoreCardBackendClient implements ScoreCardApi {
  private readonly configApi: ConfigApi;

  static readonly DEFAULT_INGESTOR_PROXY_PATH = '/ingestor/api';
  static readonly DEFAULT_PROCESSOR_PROXY_PATH = '/processor/api';

  private readonly discoveryApi: DiscoveryApi;
  constructor(options: { discoveryApi: DiscoveryApi, configApi: ConfigApi}) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
  }
  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error();
    }
    return await response.json();
  }

  private async getBaseUrl(proxyPath: String) {
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async getIngestorBaseUrl() {
    return await this.getBaseUrl(ScoreCardBackendClient.DEFAULT_INGESTOR_PROXY_PATH);
  }

  private async getProcessorBaseUrl() {
    return this.getBaseUrl(ScoreCardBackendClient.DEFAULT_PROCESSOR_PROXY_PATH)
  }

  async listScoreCards(): Promise<{ results: ScoreCard[] }> {
    const url = `${await this.getProcessorBaseUrl()}/scorecards/run`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async getJobs(): Promise<{ results: Job[] }> {
    const url = `${await this.getIngestorBaseUrl()}/job`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async getRawData(jobId: number): Promise<{ results: RawData[] }> {
    const url = `${await this.getIngestorBaseUrl()}/job/${jobId}/data`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async getRawDataDetail(
    jobId: number,
    rawDataId: number,
  ): Promise<{ results: RawDataDetail }> {
    const url = `${(await this.getIngestorBaseUrl())}/job/${jobId}/data/${rawDataId}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async testJob(jobId: number): Promise<Response> {
    const url = `${await this.getIngestorBaseUrl()}/job/${jobId}/test`;
    const response: Response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteJob(jobId: number): Promise<Response> {
    const url = `${await this.getIngestorBaseUrl()}/job/${jobId}`;
    return await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async createJob(
    cron: string,
    type: string,
    endpoint: string,
  ): Promise<Response> {
    const url = `${await this.getIngestorBaseUrl()}/job`;
    const createJobRequest = {
      cron: cron,
      type: type,
      endpoint: endpoint,
    };
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createJobRequest),
    });
  }
}
