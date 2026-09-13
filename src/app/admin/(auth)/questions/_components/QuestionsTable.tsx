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
import { typeText } from "@/lib/http/apis/dtos/common/question-type.enum";
interface QuestionTableProps {
  items: GetQuestionListAdminDto[];
  pageNum?: number;
  perPage?: number;
  isLoading?: boolean;
  selectedIds: string[];
  onToggle: (item: GetQuestionListAdminDto) => void;
  onTogglePage: () => void;
}

const TABLE_HEADERS = [
  "No",
  "유형",
  "문제 이름",
  "능력단위",
  "등록일",
] as const;

const COLUMN_STYLES = [
  "bg-accent align-top w-8",
  "align-top w-24",
  "bg-accent align-top w-24",
  "align-top w-24",
  "bg-accent align-top w-24",
] as const;

function TableHeaderRow({ checked, onToggle, disabled }: { checked: boolean; onToggle: () => void; disabled: boolean }) {
  return (
    <TableHeader>
      <TableRow className="bg-neutral-300 dark:bg-neutral-600">
        <TableHead className="w-10"><input type="checkbox" aria-label="현재 페이지 문제 전체 선택" checked={checked} disabled={disabled} onChange={onToggle} /></TableHead>
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
          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
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
          colSpan={TABLE_HEADERS.length + 1}
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
  selected: boolean;
  onToggle: (item: GetQuestionListAdminDto) => void;
}

function ReviewTableRow({ item, selected, onToggle }: QuestionTableRowProps) {
  return (
    <TableRow key={item.id} className="h-24">
      <TableCell><input type="checkbox" aria-label={`문제 ${item.id} 선택`} checked={selected} onChange={() => onToggle(item)} /></TableCell>
      <TableCell className={COLUMN_STYLES[0]}>{item.id}</TableCell>
      <TableCell className={COLUMN_STYLES[1]}>{typeText(item.type)}</TableCell>
      <TableCell className={COLUMN_STYLES[2]}>
        <Link
          href={`/admin/questions/${item.id}`}
          className="text-blue-600 hover:underline"
        >
          {item.title}
        </Link>
      </TableCell>
      <TableCell className={COLUMN_STYLES[3]}>{item.unitName}</TableCell>
      <TableCell className={COLUMN_STYLES[4]}>
        {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
      </TableCell>
    </TableRow>
  );
}

function DataTableBody({
  items,
  baseIndex,
  selectedIds,
  onToggle,
}: {
  items: GetQuestionListAdminDto[];
  baseIndex: number;
  selectedIds: string[];
  onToggle: (item: GetQuestionListAdminDto) => void;
}) {
  return (
    <TableBody>
      {items.map((item, idx) => (
        <ReviewTableRow
          key={item.id}
          item={item}
          index={idx}
          baseIndex={baseIndex}
          selected={selectedIds.includes(String(item.id))}
          onToggle={onToggle}
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
  selectedIds,
  onToggle,
  onTogglePage,
}: QuestionTableProps) {
  const baseIndex = useMemo(() => {
    const effectivePerPage = perPage ?? (items?.length || 5);
    return (Math.max(pageNum, 1) - 1) * effectivePerPage;
  }, [pageNum, perPage, items?.length]);

  const tableBody = useMemo(() => {
    if (isLoading) return <LoadingTableBody />;
    if (!items?.length) return <EmptyTableBody />;
    return <DataTableBody items={items} baseIndex={baseIndex} selectedIds={selectedIds} onToggle={onToggle} />;
  }, [isLoading, items, baseIndex, selectedIds, onToggle]);

  return (
    <Card className="p-0 m-0">
      <Table className="rounded-xl overflow-hidden">
        <TableHeaderRow checked={items.length > 0 && items.every(item => selectedIds.includes(String(item.id)))} onToggle={onTogglePage} disabled={isLoading || !items.length} />
        {tableBody}
      </Table>
    </Card>
  );
}
