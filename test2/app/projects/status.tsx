'use client';

import { projectsPageModel } from './_model';

export default function ProjectsStatus() {
  const { usePageStore } = projectsPageModel;
  const isAuthenticated = usePageStore(s => s.isAuthenticated);
  const userRole = usePageStore(s => s.userRole);
  const theme = usePageStore(s => s.theme);
  const geoRegion = usePageStore(s => s.geoRegion);
  const abTestVariant = usePageStore(s => s.abTestVariant);
  const orgId = usePageStore(s => s.orgId);

  return (
    <div className="text-sm text-gray-500">
      <div>
        Auth: {isAuthenticated ? 'Yes' : 'No'} ({userRole}) · Org: {orgId}
      </div>
      <div>
        Theme: {theme} · Region: {geoRegion} · AB: {abTestVariant}
      </div>
    </div>
  );
}

