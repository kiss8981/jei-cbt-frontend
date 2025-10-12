"use client";

import { Check, ChevronDown } from "lucide-react";
import cn from "classnames";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo, useState } from "react";
import { useUnits } from "@/app/admin/_hooks/apis/useUnits";

interface ProgramSearcherProps {
  initialValue?: string[];
  onUnitChange: (unitIds: string[]) => void;
}

export function UnitMultiSelect({
  initialValue = ["ALL"],
  onUnitChange,
}: ProgramSearcherProps) {
  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>(initialValue);

  const {
    units: apiUnits,
    isLoading,
    error,
  } = useUnits({
    keyword: searchKeyword,
    limit: 20,
    page: 1,
  });

  const units = useMemo(() => {
    return [...apiUnits].sort((a, b) => {
      return a.name.localeCompare(b.name, "ko-KR");
    });
  }, [apiUnits]);

  const handleSelect = (currentValue: string) => {
    let newSelectedPartners: string[];

    if (currentValue === "ALL") {
      newSelectedPartners = ["ALL"];
    } else {
      if (selectedUnits.includes("ALL")) {
        newSelectedPartners = [currentValue];
      } else if (selectedUnits.includes(currentValue)) {
        newSelectedPartners = selectedUnits.filter(id => id !== currentValue);
        if (newSelectedPartners.length === 0) {
          newSelectedPartners = ["ALL"];
        }
      } else {
        newSelectedPartners = [...selectedUnits, currentValue];
      }
    }
    setSelectedUnits(newSelectedPartners);
    onUnitChange(newSelectedPartners);
  };

  const displayText = () => {
    if (selectedUnits.includes("ALL")) {
      return "전체";
    }
    if (selectedUnits.length === 1) {
      const partner = units.find(p => p.id.toString() == selectedUnits[0]);
      return partner ? partner.name : "";
    }
    return `${selectedUnits.length}개 선택됨`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {displayText()}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="능력단위 검색..."
            className="h-9"
            value={searchKeyword}
            onValueChange={setSearchKeyword}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground">검색 중</div>
            ) : error ? (
              <div className="p-2 text-sm text-red-500">{error.message}</div>
            ) : (
              <>
                <CommandEmpty>검색 결과 없음</CommandEmpty>
                <CommandGroup>
                  {/* 전체 옵션 */}
                  <CommandItem value="ALL" onSelect={() => handleSelect("ALL")}>
                    <div className="flex flex-col">
                      <span className="font-medium">전체</span>
                      <span className="text-xs text-muted-foreground">
                        모든 능력단위
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedUnits.includes("ALL")
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>

                  {/* 능력단위 목록 */}
                  {units.map(unit => (
                    <CommandItem
                      key={unit.id}
                      value={unit.id.toString()}
                      onSelect={() => handleSelect(unit.id.toString())}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{unit.name}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedUnits.includes(unit.id.toString())
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
