export type ServerOnlyBase = {
  serverRenderedAt: number;
  traceId: string;
  rawFeatureFlags: Record<string, boolean>;
};

export type SharedBase = {
  tutorialSeen: boolean;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  userRole: 'admin' | 'viewer' | 'editor';
  abTestVariant: 'control' | 'new-dashboard';
  geoRegion: string;
};

export const buildServerOnlyBase = (
  overrides: Partial<ServerOnlyBase> = {}
): ServerOnlyBase => ({
  serverRenderedAt: Date.now(),
  traceId: 'req_shared',
  rawFeatureFlags: {
    'beta-users-table': true,
    'dark-mode-forced': false
  },
  ...overrides
});

export const buildSharedBase = (
  overrides: Partial<SharedBase> = {}
): SharedBase => ({
  tutorialSeen: true,
  isAuthenticated: true,
  theme: 'system',
  userRole: 'viewer',
  abTestVariant: 'control',
  geoRegion: 'us-east-1',
  ...overrides
});
