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

type ProjectsStateShape = PageModelStateShape & {
  serverOnly: ServerOnlyBase;
  shared: SharedBase & {
    orgId: string;
  };
  clientOnly: {
    filterTerm: string;
    selectedProjectId: string | null;
    showArchived: boolean;
    setFilterTerm: (value: string) => void;
    toggleShowArchived: () => void;
    selectProject: (value: string | null) => void;
  };
};

export const projectsPageModel = definePageModel<ProjectsStateShape>({
  serverOnly: () =>
    buildServerOnlyBase({
      traceId: 'req_projects',
      rawFeatureFlags: { 'beta-projects-board': true }
    }),
  shared: () => ({
    ...buildSharedBase({
      userRole: 'editor',
      abTestVariant: 'new-dashboard'
    }),
    orgId: 'acme-inc'
  }),
  clientOnly: ({ set }) => ({
    filterTerm: '' as string,
    selectedProjectId: null as string | null,
    showArchived: false,
    setFilterTerm: value => {
      set(s => ({ ...s, filterTerm: value }));
    },
    toggleShowArchived: () => {
      set(s => ({ ...s, showArchived: !s.showArchived }));
    },
    selectProject: value => {
      set(s => ({ ...s, selectedProjectId: value }));
    }
  })
});

export type ProjectsState<T extends 'client' | 'server'> = T extends 'server'
  ? ServerStateOf<typeof projectsPageModel>
  : ClientStateOf<typeof projectsPageModel>;
