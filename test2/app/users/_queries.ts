export type User = { id: string; name: string };

export const usersQueryOptions = {
  queryKey: ['users'],
  queryFn: async (): Promise<User[]> => {
    const res = await fetch('/api/users', { next: { tags: ['users'] } });
    return (await res.json()) as User[];
  },
  staleTime: 60_000
};
