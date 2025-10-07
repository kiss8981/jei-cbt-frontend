import React, { Suspense } from "react";
import { AdminLoginForm } from "./_components/LoginForm";

export const metadata = {
  title: "로그인",
};

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;
