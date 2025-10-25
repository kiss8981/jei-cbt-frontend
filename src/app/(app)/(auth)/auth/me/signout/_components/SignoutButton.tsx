"use client";

import { useSignout } from "@/app/(app)/_hooks/useSignout";
import { Button, FixedButton } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

const SignoutButton = () => {
  const [signoutModalOpen, setSignoutModalOpen] = useState(false);
  const { handleSignout, isLoading } = useSignout();

  return (
    <>
      <Dialog open={signoutModalOpen} onOpenChange={setSignoutModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">회원 탈퇴</DialogTitle>
            <DialogDescription>회원 탈퇴를 진행하시겠습니까?</DialogDescription>
          </DialogHeader>

          <DialogFooter className="w-full">
            <div className="grid grid-cols-2 w-full gap-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={() => setSignoutModalOpen(false)}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                disabled={isLoading}
                onClick={handleSignout} // 회원 탈퇴 처리 함수 연결
              >
                {isLoading ? <Spinner /> : "탈퇴하기"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FixedButton
        className="w-full"
        variant="default"
        onClick={() => setSignoutModalOpen(true)}
      >
        회원 탈퇴
      </FixedButton>
    </>
  );
};

export default SignoutButton;
