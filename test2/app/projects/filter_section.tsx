'use client';

import { projectsPageModel } from './_model';

export default function ProjectsFilter() {
  const { usePageStore } = projectsPageModel;
  const filterTerm = usePageStore(s => s.filterTerm);
  const showArchived = usePageStore(s => s.showArchived);

  return (
    <div className="flex items-center gap-2">
      <input
        value={filterTerm}
        onChange={e => usePageStore.setState(s => ({ ...s, filterTerm: e.target.value }))}
        placeholder="Filter projects…"
        className="rounded border px-2 py-1"
      />
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={() =>
            usePageStore.setState(s => ({ ...s, showArchived: !s.showArchived }))
          }
        />
        Show archived
      </label>
    </div>
  );
}

