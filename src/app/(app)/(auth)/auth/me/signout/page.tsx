import SignoutButton from "./_components/SignoutButton";

export default function Signout() {
  return (
    <div className="h-full flex items-center justify-center w-full">
      <div className="w-full max-w-sm px-4 mx-auto">
        <div className="space-y-4 h-full flex flex-col items-start">
          <h1 className="text-2xl font-bold text-center">회원 탈퇴</h1>
          <ul className="ml-4 list-disc [&>li]:mt-2">
            <li>회원 탈퇴를 진행하시겠습니까?</li>
            <li>탈퇴 시 모든 개인 정보가 삭제되며, 복구할 수 없습니다.</li>
            <li>모의고사 응시 기록 등의 데이터도 함께 삭제됩니다.</li>
          </ul>
          <div className="flex flex-col space-y-4">
            <SignoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
