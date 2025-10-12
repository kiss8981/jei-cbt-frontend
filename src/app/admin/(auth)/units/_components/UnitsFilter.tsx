"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FilterField } from "@/components/ui/filterField";
import { useUnitsFilterStore } from "@/lib/store/stores/units-store";

export function UnitsFilter() {
  const router = useRouter();
  const store = useUnitsFilterStore();

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (store.searchQuery.trim()) {
      params.set("search", store.searchQuery.trim());
    }

    if (store.page > 1) {
      params.set("page", store.page.toString());
    }

    if (store.pageSize !== 10) {
      params.set("pageSize", store.pageSize.toString());
    }

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    router.push(newURL);
  }, [router, store.searchQuery, store.page, store.pageSize]);

  // URL 업데이트를 위한 useEffect
  useEffect(() => {
    updateURL();
  }, [store.searchQuery, store.page, store.pageSize]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      store.setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <>
      <Card className="p-0 m-0">
        <Table className="rounded-xl overflow-hidden">
          <TableBody>
            <TableRow>
              <FilterField label="검색">
                <Input
                  type="text"
                  placeholder="능력 단위명"
                  className="border-0 shadow-none hover:bg-accent"
                  value={store.searchQuery}
                  onChange={handleSearchChange}
                />
              </FilterField>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
