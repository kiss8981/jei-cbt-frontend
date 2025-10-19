import React, { Suspense } from "react";
import { LoginForm } from "./_components/LoginForm";

export const metadata = {
  title: "로그인",
};

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(90vh-10rem)] bg-white px-3 mx-auto w-full">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;
