"use client";

import { Card } from "@/components/ui/card";
import { FilterField } from "@/components/ui/filterField";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { useUsersFilterStore } from "@/lib/store/stores/users-store";

export function UsersFilter() {
  const searchQuery = useUsersFilterStore(state => state.searchQuery);
  const setSearchQuery = useUsersFilterStore(state => state.setSearchQuery);

  return (
    <Card className="m-0 p-0">
      <Table className="overflow-hidden rounded-xl">
        <TableBody>
          <TableRow>
            <FilterField label="검색">
              <Input
                type="text"
                placeholder="이름 또는 전화번호"
                className="border-0 shadow-none hover:bg-accent"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
              />
            </FilterField>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
