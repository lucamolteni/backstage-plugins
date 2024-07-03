export type ScoreCard = {
  status: string;
  measureValue: number;
  measureName: string;
  maxValue: number;
  yaml: string;
  thresholds: Threshold[];
};
export type Threshold = {
  name: string;
  value: number;
};

export type Job = {
  id: number;
  type: string;
  endpoint: string;
};

export type RawData = {
  id: number;
  createdAt: string;
};

export type RawDataDetail = {
  id: number;
  createdAt: string;
  data: string;
};
