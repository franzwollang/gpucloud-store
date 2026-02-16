import {
  buildServerOnlyBase,
  buildSharedBase,
  type ServerOnlyBase,
  type SharedBase
} from '../../commonPageState';
import {
  type ClientStateOf,
  definePageModel,
  type PageModelStateShape,
  type ServerStateOf
} from '../../lib/pageModel';

// In a real app, you might import headers/cookies here to use in the factories
// import { cookies, headers } from 'next/headers';

type UsersStateShape = PageModelStateShape & {
  // SERVER ONLY:
  // Data needed for server-side logic/rendering but never sent to the client.
  // Use cases:
  // - Request tracing IDs
  // - High-fidelity timestamps for server metrics
  // - Raw feature flags (before processing into boolean UI toggles)
  // - Sensitive tokens used for server-side fetching (if not using process.env)
  serverOnly: ServerOnlyBase;

  // SHARED:
  // Data derived on the server that MUST be available on the client immediately (hydration).
  // Use cases:
  // - User authentication status (isAuthenticated) - derived from httpOnly cookies
  // - User preferences (theme, language) - derived from cookies/headers
  // - Geo/Region data - derived from request headers
  // - AB Test variants - assigned on server to ensure consistent rendering
  // - Permissions/Roles - simplified check results (canEdit, isAdmin)
  shared: SharedBase;

  // CLIENT ONLY:
  // Pure UI state that lives only in the browser.
  // Use cases:
  // - Form inputs / filters
  // - Modal/Sidebar open state
  // - Optimistic UI updates
  // - Scroll position or active tab
  clientOnly: {
    filterTerm: string;
    selectedUserId: string | null;
    isSidebarExpanded: boolean;
    setFilterTerm: (value: string) => void;
    toggleSidebar: () => void;
  };
};

export const usersPageModel = definePageModel<UsersStateShape>({
  serverOnly: () =>
    buildServerOnlyBase({
      traceId: 'req_users',
      rawFeatureFlags: { 'beta-users-table': true, 'dark-mode-forced': false }
    }),
  shared: () =>
    buildSharedBase({
      userRole: 'admin'
    }),
  clientOnly: ({ set }) => ({
    filterTerm: '' as string,
    selectedUserId: null as string | null,
    isSidebarExpanded: true,
    setFilterTerm: (value: string) => {
      set(s => ({ ...s, filterTerm: value }));
    },
    toggleSidebar: () => {
      set(s => ({ ...s, isSidebarExpanded: !s.isSidebarExpanded }));
    }
  })
});

export type UsersState<T extends 'client' | 'server'> = T extends 'server'
  ? ServerStateOf<typeof usersPageModel>
  : ClientStateOf<typeof usersPageModel>;
