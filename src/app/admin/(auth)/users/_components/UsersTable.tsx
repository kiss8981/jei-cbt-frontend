import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetUserListAdminDto } from "@/lib/http/apis/dtos/admin/user/get-user-list.admin.dto";
import dayjs from "dayjs";

const headers = ["회원번호", "이름", "전화번호", "가입일"];

export function UsersTable({
  items,
  isLoading,
}: {
  items: GetUserListAdminDto[];
  isLoading: boolean;
}) {
  return (
    <Card className="m-0 p-0">
      <Table className="overflow-hidden rounded-xl">
        <TableHeader>
          <TableRow className="bg-neutral-300 dark:bg-neutral-600">
            {headers.map(header => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index} className="h-20">
                {headers.map(header => (
                  <TableCell key={header}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!isLoading && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={headers.length}
                className="py-8 text-center text-muted-foreground"
              >
                일치하는 데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            items.map(item => (
              <TableRow key={item.id} className="h-20">
                <TableCell className="bg-accent">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="bg-accent">{item.phone}</TableCell>
                <TableCell>
                  {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}
