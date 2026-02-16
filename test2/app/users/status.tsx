'use client';

import { usersPageModel } from './_model';

export default function UsersStatus() {
  const { usePageStore } = usersPageModel;
  const isAuthenticated = usePageStore(s => s.isAuthenticated);
  const userRole = usePageStore(s => s.userRole);
  const theme = usePageStore(s => s.theme);
  const geoRegion = usePageStore(s => s.geoRegion);

  return (
    <div className="text-sm text-gray-500">
      <div>
        Auth: {isAuthenticated ? 'Yes' : 'No'} ({userRole})
      </div>
      <div>
        Theme: {theme} · Region: {geoRegion}
      </div>
    </div>
  );
}
