"use client";

import { Button } from "@/components/ui/button";
import useAppRouter from "@/hooks/useAppRouter";

export default function Home() {
  const { navigate } = useAppRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-3 mx-auto">
      <div className="flex flex-col items-center">
        <img
          src="/images/logo.png"
          alt="재능고등학교"
          className="w-full h-10"
        />
        <h1 className="text-lg text-gray-500  mt-1">도제학교 외부평가 CBT</h1>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full mt-32">
        <Button onClick={() => navigate("push", "/learn/unit")} size="lg">
          능력 단위별 학습
        </Button>
        <Button onClick={() => navigate("push", "/learn/all")} size="lg">
          전체 문제 학습
        </Button>
        <Button
          onClick={() => navigate("push", "/learn/mock")}
          className="col-span-2"
          size="lg"
        >
          모의고사
        </Button>
      </div>
    </div>
  );
}
