"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useAppRouter from "@/hooks/useAppRouter";
import { useAuthStore } from "@/lib/store/providers/auth.provider";

export function My() {
  // useAuthStore에서 필요한 상태와 함수를 가져옵니다.
  const { user } = useAuthStore(state => state);
  const { navigate } = useAppRouter();

  const handleLogout = () => {
    // 1. 인증 상태 초기화
    // 토큰과 사용자 정보를 null 또는 초기값으로 설정하여 로그아웃 처리
    // setTokens({ accessToken: null, refreshToken: null });
    // setUser(null); // 또는 setUser({ name: '', phone: '' }) 등 초기 상태로 설정
    // // 2. 로그아웃 API 호출 (필요한 경우)
    // // 💡 백엔드에 로그아웃 요청을 보내는 로직을 여기에 추가할 수 있습니다.
    // console.log("로그아웃 시도 및 인증 상태 초기화 완료");
  };

  // user 객체가 없는 경우 (로그아웃 상태 등) 처리
  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.</p>
        <Button
          onClick={() => navigate("replace", "/auth/login")}
          className="mt-4"
        >
          로그인 페이지로 이동
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm px-4 mx-auto">
      <div className="space-y-4 h-full">
        {/* 내 이름 표시 영역 */}
        <div className="space-y-1">
          <Label htmlFor="userName">이름</Label>
          <Input
            id="userName"
            value={user.name || "정보 없음"} // user.name이 undefined일 경우 대비
            readOnly
            className="bg-gray-50 border-gray-200 cursor-default"
          />
        </div>

        {/* 전화번호 표시 영역 */}
        <div className="space-y-1">
          <Label htmlFor="userPhone">전화번호</Label>
          <Input
            id="userPhone"
            value={user.phone || "정보 없음"} // user.phone이 undefined일 경우 대비
            readOnly
            type="tel"
            className="bg-gray-50 border-gray-200 cursor-default"
          />
        </div>
      </div>
    </div>
  );
}
