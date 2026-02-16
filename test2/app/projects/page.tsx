import { QueryClient } from '@tanstack/react-query';

import { PageShell } from '../../lib/pageShell';
import { projectsPageModel } from './_model';
import { projectsQueryOptions } from './_queries';
import ProjectsFilter from './filter_section';
import ProjectsStatus from './status';
import ProjectsTable from './table_section';

export default async function ProjectsPage() {
  // Server-side: fetch TSQ data explicitly and reuse the same QueryClient for PageShell
  const queryClient = new QueryClient();
  const projectsViaServerFetch =
    await queryClient.fetchQuery(projectsQueryOptions);

  // Server-side: get full server store state via helper (with overrides)
  const serverStateDirect = projectsPageModel.getServerState({
    traceId: 'req_projects_direct'
  });

  return (
    <PageShell
      model={projectsPageModel}
      queries={[{ options: projectsQueryOptions }]}
      buildOverrides={() => ({ traceId: 'req_projects' })}
      queryClient={queryClient}
    >
      {({ results, snapshot, serverState }) => {
        const prefetchedProjects = results[0] ?? [];
        const trace = serverState.traceId;

        return (
          <div className="space-y-4 p-4">
            <div className="text-xs text-gray-500">
              RSC snapshot: role {snapshot.userRole} · org {snapshot.orgId} ·
              trace {trace}
            </div>
            <div className="text-xs text-gray-500">
              Prefetched projects (first): {prefetchedProjects[0]?.name ?? '—'}
            </div>
            <div className="text-xs text-gray-500">
              Direct server fetch (first):{' '}
              {projectsViaServerFetch[0]?.name ?? '—'}
            </div>
            <div className="text-xs text-gray-500">
              Direct server store helper trace: {serverStateDirect.traceId}
            </div>
            <ProjectsStatus />
            <ProjectsFilter />
            <ProjectsTable />
          </div>
        );
      }}
    </PageShell>
  );
}
