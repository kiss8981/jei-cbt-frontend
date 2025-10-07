import React, { Suspense } from "react";
import { RegisterForm } from "./_components/RegisterForm";

export const metadata = {
  title: "회원가입",
};

const RegisterPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
};

export default RegisterPage;
