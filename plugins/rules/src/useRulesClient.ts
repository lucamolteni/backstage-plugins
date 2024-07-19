import { useEffect, useState } from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { scoreCardApiRef } from './api/api';
import { Job, RawData, RawDataDetail, ScoreCard } from './api/types';

export const useScoreCards = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<ScoreCard[]>([]);
  const [error, setError] = useState<boolean>(false);
  const scoreCardApi = useApi(scoreCardApiRef);
  const getObjects = async () => {
    try {
      const scorecards = await scoreCardApi.listScoreCards();
      setValue(scorecards.results);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getObjects();
  }, []);
  return {
    error,
    loading,
    value,
  };
};

export const useAllRawData = (jobId: number) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<RawData[]>([]);
  const [error, setError] = useState<boolean>(false);
  const scoreCardApi = useApi(scoreCardApiRef);
  const getObjects = async () => {
    try {
      console.log('Finding raw data for jobId: ', jobId);
      const scorecards: { results: RawData[] } =
        await scoreCardApi.getRawData(jobId);

      setValue(scorecards.results);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getObjects();
  }, [jobId]);
  return {
    error,
    loading,
    value,
  };
};

export const useRawDataDetail = (jobId: number, rawDataId: number) => {
  const [loading, setLoading] = useState<boolean>(true);

  const [value, setValue] = useState<RawDataDetail>({
    id: 0,
    createdAt: '',
    data: 'zero',
  });
  const [error, setError] = useState<boolean>(false);
  const scoreCardApi = useApi(scoreCardApiRef);
  const getObjects = async () => {
    try {
      console.log(
        `Finding raw data detail for ` + jobId + ` rawId: `,
        rawDataId,
      );
      const rawDataDetail: { results: RawDataDetail } =
        await scoreCardApi.getRawDataDetail(jobId, rawDataId);

      const data = rawDataDetail.results.data;

      console.log('Data: ', data);

      rawDataDetail.results.data = data;

      setValue(rawDataDetail.results);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getObjects();
  }, [jobId, rawDataId]);
  return {
    error,
    loading,
    value,
  };
};
