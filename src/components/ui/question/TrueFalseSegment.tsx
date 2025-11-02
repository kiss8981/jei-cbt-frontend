// components/questions/YesNoSegment.tsx
import { Button } from "../button";

type Props = {
  value: boolean | null;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

export function YesNoSegment({ value, onChange, disabled }: Props) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="예/아니요 선택">
      <Button
        type="button"
        variant={value === false ? "default" : "outline"}
        data-state={value === false ? "on" : "off"}
        aria-checked={value === false}
        role="radio"
        disabled={disabled}
        onClick={() => onChange(false)}
      >
        아니요
      </Button>
      <Button
        type="button"
        variant={value === true ? "default" : "outline"}
        data-state={value === true ? "on" : "off"}
        aria-checked={value === true}
        role="radio"
        disabled={disabled}
        onClick={() => onChange(true)}
      >
        예
      </Button>
    </div>
  );
}
