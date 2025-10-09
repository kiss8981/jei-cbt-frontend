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
import { GetQuestionListAdminDto } from "@/lib/http/apis/dtos/admin/question/get-question-list.admin.dto";
import dayjs from "dayjs";
interface QuestionTableProps {
  items: GetQuestionListAdminDto[];
  pageNum?: number;
  perPage?: number;
  isLoading?: boolean;
}

const TABLE_HEADERS = [
  "No",
  "유형",
  "문제 이름",
  "능력단위",
  "등록일",
  "수정",
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
      {Array.from({ length: 5 }, (_, idx) => (
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

interface QuestionTableRowProps {
  item: GetQuestionListAdminDto;
  index: number;
  baseIndex: number;
}

function ReviewTableRow({ item }: QuestionTableRowProps) {
  const typeText = useMemo(() => {
    switch (item.type) {
      case "MULTIPLE_CHOICE":
        return "객관식";
      case "MATCHING":
        return "연결형";
      case "TRUE_FALSE":
        return "진위형";
      case "SHORT_ANSWER":
        return "단답형";
      case "COMPLETION":
        return "완성형";
      case "MULTIPLE_SHORT_ANSWER":
        return "복수 단답형";
      case "INTERVIEW":
        return "면접형";
      default:
        return "-";
    }
  }, [item.type]);

  return (
    <TableRow key={item.id} className="h-24">
      <TableCell className={COLUMN_STYLES[0]}>{item.id}</TableCell>
      <TableCell className={COLUMN_STYLES[1]}>{typeText}</TableCell>
      <TableCell className={COLUMN_STYLES[2]}>{item.title}</TableCell>
      <TableCell className={COLUMN_STYLES[3]}>{item.unitName}</TableCell>
      <TableCell className={COLUMN_STYLES[4]}>
        {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
      </TableCell>
      <TableCell className={COLUMN_STYLES[5]}>
        <Link
          href={`/admin/questions/${item.id}`}
          className="text-blue-600 hover:underline"
        >
          수정
        </Link>
      </TableCell>
    </TableRow>
  );
}

function DataTableBody({
  items,
  baseIndex,
}: {
  items: GetQuestionListAdminDto[];
  baseIndex: number;
}) {
  return (
    <TableBody>
      {items.map((item, idx) => (
        <ReviewTableRow
          key={item.id}
          item={item}
          index={idx}
          baseIndex={baseIndex}
        />
      ))}
    </TableBody>
  );
}

export function QuestionsTable({
  items,
  pageNum = 1,
  perPage,
  isLoading = false,
}: QuestionTableProps) {
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
