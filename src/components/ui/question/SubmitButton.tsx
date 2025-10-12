import { Button } from "../button";
import { Spinner } from "../spinner";

const SubmitButton = ({
  isFirst = false,
  onPrevious,
  disabledSubmit = false,
  loadingSubmit = false,
  loadingPrevious = false,
}: {
  isFirst?: boolean;
  onPrevious?: () => void;
  disabledSubmit?: boolean;
  loadingSubmit?: boolean;
  loadingPrevious?: boolean;
}) => {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50
    w-[calc(100vw-2rem)] max-w-[600px]
    pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className={`grid ${isFirst ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
        {!isFirst && (
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => {
              onPrevious && onPrevious();
            }}
            disabled={loadingPrevious || loadingSubmit}
          >
            {loadingPrevious ? <Spinner /> : "이전"}
          </Button>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={disabledSubmit || loadingSubmit || loadingPrevious}
        >
          {loadingSubmit ? <Spinner /> : "제출"}
        </Button>
      </div>
    </div>
  );
};

export default SubmitButton;
