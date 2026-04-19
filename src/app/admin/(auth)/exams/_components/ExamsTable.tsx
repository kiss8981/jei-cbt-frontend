"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetExamAdminDto } from "@/lib/http/apis/dtos/admin/exam/get-exam.admin.dto";
import { ExamUpdateModal } from "./ExamUpdateModal";

interface ExamsTableProps {
  items: GetExamAdminDto[];
  isLoading?: boolean;
}

const TABLE_HEADERS = ["ID", "시험 유형", "시험 제목", "표시여부", "수정"] as const;

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
        <TableRow key={idx} className="h-20">
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
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
          일치하는 시험이 없습니다.
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function ExamTableRow({ item }: { item: GetExamAdminDto }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <ExamUpdateModal
        open={openModal}
        onOpenChange={setOpenModal}
        exam={item}
      />
      <TableRow className="h-20">
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.type}</TableCell>
        <TableCell>{item.title}</TableCell>
        <TableCell>{item.isDisplayed ? "표시" : "숨김"}</TableCell>
        <TableCell>
          <Button variant="outline" size="sm" onClick={() => setOpenModal(true)}>
            수정
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}

export function ExamsTable({
  items,
  isLoading = false,
}: ExamsTableProps) {
  const tableBody = useMemo(() => {
    if (isLoading) return <LoadingTableBody />;
    if (!items.length) return <EmptyTableBody />;
    return (
      <TableBody>
        {items.map(item => (
          <ExamTableRow key={item.id} item={item} />
        ))}
      </TableBody>
    );
  }, [items, isLoading]);

  return (
    <Card className="m-0 p-0">
      <Table className="overflow-hidden rounded-xl">
        <TableHeaderRow />
        {tableBody}
      </Table>
    </Card>
  );
}
