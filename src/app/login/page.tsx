import { LoginForm } from "@/app/login/login-form";

const LoginPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-[#FF0086] to-[#03D1FE] bg-clip-text text-transparent">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
