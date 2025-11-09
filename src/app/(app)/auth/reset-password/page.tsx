import { ResetPassword } from "./_components/ResetPassword";

export const metadata = {
  title: "비밀번호 찾기",
};

export default function ResetPasswordPage() {
  return (
    <div className="h-full flex items-center justify-center w-full py-10">
      <ResetPassword />
    </div>
  );
}
