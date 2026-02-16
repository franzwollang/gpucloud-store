import { QueryClient } from '@tanstack/react-query';

import { PageShell } from '../../lib/pageShell';
import { usersPageModel } from './_model';
import { usersQueryOptions } from './_queries';
import FilterSection from './filter_section';
import UsersStatus from './status';
import TableSection from './table_section';

export default async function UsersPage() {
  // Server-side: fetch TSQ data explicitly and reuse the same QueryClient for PageShell
  const queryClient = new QueryClient();
  const usersViaServerFetch = await queryClient.fetchQuery(usersQueryOptions);

  // Server-side: get full server store state via helper (with overrides if needed)
  const serverStateDirect = usersPageModel.getServerState({
    traceId: 'req_users_direct'
  });

  return (
    <PageShell
      model={usersPageModel}
      queries={[{ options: usersQueryOptions }]}
      queryClient={queryClient}
    >
      {({ results, snapshot, serverState }) => {
        // Prefetched users from TSQ (server-side fetchQuery)
        const prefetchedUsers = results[0] ?? [];
        // Full server store state (includes serverOnly/shared/clientOnly)
        const trace = serverState.traceId;

        return (
          <div className="space-y-4 p-4">
            <div className="text-xs text-gray-500">
              RSC snapshot: auth {snapshot.isAuthenticated ? 'yes' : 'no'} ·
              role {snapshot.userRole} · trace {trace}
            </div>
            <div className="text-xs text-gray-500">
              Prefetched users (first): {prefetchedUsers[0]?.name ?? '—'}
            </div>
            <div className="text-xs text-gray-500">
              Direct server fetch (first): {usersViaServerFetch[0]?.name ?? '—'}
            </div>
            <div className="text-xs text-gray-500">
              Direct server store helper trace: {serverStateDirect.traceId}
            </div>
            <UsersStatus />
            <FilterSection />
            <TableSection />
          </div>
        );
      }}
    </PageShell>
  );
}
