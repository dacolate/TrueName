import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUserBalance(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/user/${userId}/balance` : null,
    fetcher,
    {
      refreshInterval: 0, // Don't auto-refresh
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    balance: data?.balance,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useGameHistory(userId: string, limit?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    userId
      ? limit
        ? `/api/user/${userId}/history?limit=${limit}`
        : `/api/user/${userId}/history`
      : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  return {
    gameHistory: data?.gameHistory || [],
    isLoading,
    isError: error,
    mutate,
  };
}
