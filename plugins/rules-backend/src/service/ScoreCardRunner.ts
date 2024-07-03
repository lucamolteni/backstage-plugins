import 'http';

import axios from 'axios';

// TODO Figure how to report connection to service broken

export interface Record {
  status: String;
  measureValue: number;
  measureName: String;
  maxValue: number;
  yaml: string;
  thresholds: Threshold[];
}

export interface Threshold {
  name: string;
  value: number;
}

export interface RawData {
  id: number;
  createdAt: string;
  data: string;
}

export async function runScorecards(): Promise<Record[]> {
  const url = 'http://localhost:8080/scorecards/run';

  const resp = await axios.get(url);

  return resp.data;
}

export async function runJobs(): Promise<Record[]> {
  const url = 'http://localhost:8082/job';

  const resp = await axios.get(url);

  return resp.data;
}

export async function findRawData(jobId: number): Promise<RawData[]> {
  const url = `http://localhost:8082/job/${jobId}/data`;

  const resp = await axios.get(url);

  return resp.data;
}

export async function findRawDataDetail(
  jobId: number,
  rawDataId: number,
): Promise<RawData> {
  const url = `http://localhost:8082/job/${jobId}/data/${rawDataId}`;

  const resp = await axios.get(url);

  return resp.data;
}

export async function testJob(jobId: number): Promise<object[]> {
  const url = `http://localhost:8082/job/${jobId}/test`;

  const resp = await axios.post(url);

  return resp.data;
}

export async function deleteJob(jobId: number): Promise<object[]> {
  const url = `http://localhost:8082/job/${jobId}`;

  const resp = await axios.delete(url);

  return resp.data;
}

export async function createJob(
  cron: string,
  type: string,
  endpoint: string,
): Promise<object[]> {
  const url = `http://localhost:8082/job`;

  const data = {
    cron: cron,
    type: type,
    endpoint: endpoint,
  };

  const resp = await axios.post(url, data);

  return resp.data;
}
