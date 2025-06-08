import RegisterForm from "./register-form";

const RegisterPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-[#FF0086] to-[#03D1FE] bg-clip-text text-transparent">
            Create an account
          </h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};
export default RegisterPage;
