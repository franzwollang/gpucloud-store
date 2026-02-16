'use client';

import { useQuery } from '@tanstack/react-query';

import { projectsQueryOptions } from './_queries';
import { projectsPageModel } from './_model';

export default function ProjectsTable() {
  const { usePageStore } = projectsPageModel;
  const filterTerm = usePageStore(s => s.filterTerm);
  const selectedProjectId = usePageStore(s => s.selectedProjectId);
  const showArchived = usePageStore(s => s.showArchived);

  const projectsQuery = useQuery(projectsQueryOptions);

  const projects = (projectsQuery.data ?? [])
    .filter(p =>
      p.name.toLowerCase().includes(filterTerm.toLowerCase())
    )
    .filter(p => (showArchived ? true : p.status !== 'archived'));

  return (
    <table className="w-full border">
      <tbody>
        {projects.map(p => (
          <tr
            key={p.id}
            className={
              selectedProjectId === p.id ? 'bg-green-100' : 'hover:bg-gray-50'
            }
            onClick={() =>
              usePageStore.setState(s => ({
                ...s,
                selectedProjectId: p.id
              }))
            }
          >
            <td className="border-b p-2">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-500">{p.status}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

