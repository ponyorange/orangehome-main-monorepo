import useSWR from 'swr';
import { getCurrentUser } from '../api/auth';

export const useUser = () => {
  const { data: user, error, isLoading, mutate } = useSWR(
    'currentUser',
    getCurrentUser,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  return {
    user,
    isLoading,
    error,
    refresh: mutate,
  };
};
