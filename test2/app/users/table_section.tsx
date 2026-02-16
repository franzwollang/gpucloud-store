'use client';

import { useQuery } from '@tanstack/react-query';

import { usersQueryOptions } from './_queries';
import { usersPageModel } from './_model';

export default function UsersTable() {
  const { usePageStore } = usersPageModel;
  const filterTerm = usePageStore(s => s.filterTerm);
  const selectedUserId = usePageStore(s => s.selectedUserId);

  const usersQuery = useQuery(usersQueryOptions);

  const users = (usersQuery.data ?? []).filter(u =>
    u.name.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <table className="w-full border">
      <tbody>
        {users.map(u => (
          <tr
            key={u.id}
            className={
              selectedUserId === u.id ? 'bg-blue-100' : 'hover:bg-gray-50'
            }
            onClick={() =>
              usePageStore.setState(s => ({
                ...s,
                selectedUserId: u.id
              }))
            }
          >
            <td className="border-b p-2">{u.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
