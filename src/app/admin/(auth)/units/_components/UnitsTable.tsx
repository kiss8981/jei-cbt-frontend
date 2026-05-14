import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { GetUnitAdminDto } from "@/lib/http/apis/dtos/admin/question/get-unit.admin.dto";
import { uesUnitUpdate } from "@/app/admin/_hooks/apis/useUnits";
import { Button } from "@/components/ui/button";
import { UnitUpdateModal } from "./UnitUpdateModal";

interface UnitTableProps {
  items: GetUnitAdminDto[];
  pageNum?: number;
  perPage?: number;
  isLoading?: boolean;
}

const TABLE_HEADERS = ["ID", "능력단위", "시험", "표시여부", "수정"] as const;

const COLUMN_STYLES = [
  "bg-accent align-top w-8",
  "align-top w-24",
  "bg-accent align-top w-40",
  "bg-accent align-top w-24",
  "align-top w-24",
] as const;

function TableHeaderRow() {
  return (
    <TableHeader>
      <TableRow className="bg-neutral-300 dark:bg-neutral-600">
        {TABLE_HEADERS.map(header => (
          <TableHead key={header}>{header}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

function LoadingTableBody() {
  return (
    <TableBody>
      {Array.from({ length: 5 }, (_, idx) => (
        <TableRow key={idx} className="h-24">
          <TableCell className={COLUMN_STYLES[0]}>
            <Skeleton className="h-4 w-6" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[1]}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[2]}>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[3]}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[4]}>
            <Skeleton className="h-8 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function EmptyTableBody() {
  return (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={TABLE_HEADERS.length}
          className="py-8 text-center text-muted-foreground"
        >
          일치하는 데이터가 없습니다.
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function UnitTableRow({ item }: { item: GetUnitAdminDto }) {
  const [openModal, setOpenModal] = useState(false);
  const { handleUpdate, updatedUnit, setUpdatedUnit, isLoading } =
    uesUnitUpdate(item);

  return (
    <>
      <UnitUpdateModal
        open={openModal}
        onOpenChange={setOpenModal}
        unit={updatedUnit}
        onChangeUnit={setUpdatedUnit}
        onSubmit={async () => {
          const data = await handleUpdate();
          if (data) setOpenModal(false);
        }}
        isLoading={isLoading}
      />

      <TableRow className="h-24">
        <TableCell className={COLUMN_STYLES[0]}>{item.id}</TableCell>
        <TableCell className={COLUMN_STYLES[1]}>{item.name}</TableCell>
        <TableCell className={COLUMN_STYLES[2]}>
          {item.exams.length > 0
            ? item.exams.map((exam) => `${exam.title} (${exam.type})`).join(", ")
            : "-"}
        </TableCell>
        <TableCell className={COLUMN_STYLES[3]}>
          {item.isDisplayed ? "표시" : "숨김"}
        </TableCell>
        <TableCell className={COLUMN_STYLES[4]}>
          <Button variant="outline" size="sm" onClick={() => setOpenModal(true)}>
            수정
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}

function DataTableBody({ items }: { items: GetUnitAdminDto[] }) {
  return (
    <TableBody>
      {items.map(item => (
        <UnitTableRow key={item.id} item={item} />
      ))}
    </TableBody>
  );
}

export function UnitsTable({
  items,
  pageNum = 1,
  perPage,
  isLoading = false,
}: UnitTableProps) {
  const tableBody = useMemo(() => {
    if (isLoading) return <LoadingTableBody />;
    if (!items?.length) return <EmptyTableBody />;
    return <DataTableBody items={items} />;
  }, [isLoading, items, pageNum, perPage]);

  return (
    <Card className="m-0 p-0">
      <Table className="overflow-hidden rounded-xl">
        <TableHeaderRow />
        {tableBody}
      </Table>
    </Card>
  );
}
