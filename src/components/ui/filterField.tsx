import { Label } from "./label";
import { TableCell } from "./table";

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}

export function FilterField({
  label,
  children,
  isLast = false,
}: FilterFieldProps) {
  return (
    <>
      <TableCell className="px-4 border-r w-16 bg-neutral-100 dark:bg-neutral-600">
        <Label>{label}</Label>
      </TableCell>
      <TableCell className={`w-64 ${isLast ? "" : "border-r"}`}>
        {children}
      </TableCell>
    </>
  );
}
