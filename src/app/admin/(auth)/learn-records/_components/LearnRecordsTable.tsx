import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { GetQuestionSessionListAdminDto } from "@/lib/http/apis/dtos/admin/question/get-question-session-list.admin.dto";
import { SessionType } from "@/lib/http/apis/dtos/common/session-type.enum";
import { formatHMS } from "@/utils/formatHMS";
interface QuestionSessionsTableProps {
  items: GetQuestionSessionListAdminDto[];
  pageNum?: number;
  perPage?: number;
  isLoading?: boolean;
}

const TABLE_HEADERS = [
  "No",
  "이름",
  "유형",
  "학습 시간",
  "최근 7일 학습 시간",
  "전체 학습 시간 ",
] as const;

const COLUMN_STYLES = [
  "bg-accent align-top w-8",
  "align-top w-24",
  "bg-accent align-top w-24",
  "align-top w-24",
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
      {Array.from({ length: 6 }, (_, idx) => (
        <TableRow key={idx} className="h-24">
          <TableCell className={COLUMN_STYLES[0]}>
            <Skeleton className="h-4 w-6" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[1]}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[2]}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[3]}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[4]}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className={COLUMN_STYLES[5]}>
            <Skeleton className="h-4 w-24" />
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
          className="text-center py-8 text-muted-foreground"
        >
          일치하는 데이터가 없습니다.
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

interface QuestionSessionTableRowProps {
  item: GetQuestionSessionListAdminDto;
  index: number;
  baseIndex: number;
}

function LearnRecordsTableRow({ item }: QuestionSessionTableRowProps) {
  const typeText = useMemo(() => {
    switch (item.sessionType) {
      case SessionType.ALL:
        return "전체";
      case SessionType.MOCK:
        return "모의고사";
      case SessionType.UNIT:
        return "능력 단위";
      default:
        return "-";
    }
  }, [item.sessionType]);

  return (
    <TableRow key={item.sessionId} className="h-24">
      <TableCell className={COLUMN_STYLES[0]}>{item.sessionId}</TableCell>
      <TableCell className={COLUMN_STYLES[1]}>{item.userName}</TableCell>
      <TableCell className={COLUMN_STYLES[2]}>{typeText}</TableCell>
      <TableCell className={COLUMN_STYLES[3]}>
        {formatHMS(Math.round(item.elapsedMs / 1000))}
      </TableCell>
      <TableCell className={COLUMN_STYLES[4]}>
        {formatHMS(Math.round(item.elapsedMs7d / 1000))}
      </TableCell>
      <TableCell className={COLUMN_STYLES[5]}>
        {formatHMS(Math.round(item.elapsedMsTotal / 1000))}
      </TableCell>
    </TableRow>
  );
}

function DataTableBody({
  items,
  baseIndex,
}: {
  items: GetQuestionSessionListAdminDto[];
  baseIndex: number;
}) {
  return (
    <TableBody>
      {items.map((item, idx) => (
        <LearnRecordsTableRow
          key={item.sessionId}
          item={item}
          index={idx}
          baseIndex={baseIndex}
        />
      ))}
    </TableBody>
  );
}

export function LearnRecordsTable({
  items,
  pageNum = 1,
  perPage,
  isLoading = false,
}: QuestionSessionsTableProps) {
  const baseIndex = useMemo(() => {
    const effectivePerPage = perPage ?? (items?.length || 5);
    return (Math.max(pageNum, 1) - 1) * effectivePerPage;
  }, [pageNum, perPage, items?.length]);

  const tableBody = useMemo(() => {
    if (isLoading) return <LoadingTableBody />;
    if (!items?.length) return <EmptyTableBody />;
    return <DataTableBody items={items} baseIndex={baseIndex} />;
  }, [isLoading, items, baseIndex]);

  return (
    <Card className="p-0 m-0">
      <Table className="rounded-xl overflow-hidden">
        <TableHeaderRow />
        {tableBody}
      </Table>
    </Card>
  );
}
