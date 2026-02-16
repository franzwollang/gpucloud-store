'use client';

import { usersPageModel } from './_model';

export default function UsersFilter() {
  const { usePageStore } = usersPageModel;
  const tutorialSeen = usePageStore(s => s.tutorialSeen);
  const filterTerm = usePageStore(s => s.filterTerm);
  const setFilterTerm = (value: string) => {
    usePageStore.setState(s => ({ ...s, filterTerm: value }));
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={filterTerm}
        onChange={e => setFilterTerm(e.target.value)}
        placeholder="Filter users…"
        className="rounded border px-2 py-1"
      />
      {!tutorialSeen && (
        <span className="text-xs text-orange-600">Complete tutorial</span>
      )}
    </div>
  );
}
