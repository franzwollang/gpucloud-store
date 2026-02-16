export type Project = {
  id: string;
  name: string;
  status: 'active' | 'archived';
};

export const projectsQueryOptions = {
  queryKey: ['projects'],
  queryFn: async (): Promise<Project[]> => {
    const res = await fetch('/api/projects');
    return res.json();
  },
  staleTime: 60_000
};

