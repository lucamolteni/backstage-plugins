import {ConfigApi, DiscoveryApi} from '@backstage/core-plugin-api';

import { data } from 'msw';

import { ScoreCardApi } from './api';
import { Job, RawData, RawDataDetail, ScoreCard } from './types';

export class ScoreCardBackendClient implements ScoreCardApi {
  private readonly configApi: ConfigApi;

  static readonly DEFAULT_PROXY_PATH = '/scorecards/api';

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
  async getHealth(): Promise<{ status: string }> {
    const url = `${await this.discoveryApi.getBaseUrl('rules')}/health`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }

  private async getBaseUrl() {
    const proxyPath = ScoreCardBackendClient.DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  async listScoreCards(): Promise<{ results: ScoreCard[] }> {
    const url = `${await this.discoveryApi.getBaseUrl('rules')}/scorecards`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async getJobs(): Promise<{ results: Job[] }> {
    const url = `${await this.getBaseUrl()}/job`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async getRawData(jobId: number): Promise<{ results: RawData[] }> {
    const url = `${await this.getBaseUrl()}/job/${jobId}/data`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async getRawDataDetail(
    jobId: number,
    rawDataId: number,
  ): Promise<{ results: RawDataDetail }> {
    const url = `${(await this.getBaseUrl())}/job/${jobId}/data/${rawDataId}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }

  async testJob(jobId: number): Promise<Response> {
    const url = `${await this.discoveryApi.getBaseUrl('rules')}/job/${jobId}/test`;
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
    const url = `${await this.discoveryApi.getBaseUrl('rules')}/job/${jobId}`;
    const response: Response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  async createJob(
    cron: string,
    type: string,
    endpoint: string,
  ): Promise<Response> {
    const url = `${await this.discoveryApi.getBaseUrl('rules')}/job`;
    const data = {
      cron: cron,
      type: type,
      endpoint: endpoint,
    };
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
}
