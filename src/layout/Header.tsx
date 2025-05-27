import Image from "next/image";

const Header = () => {
  return (
    <header>
      <div>
        <Image src="/logo.svg" alt="logo" width={100} height={100} />
      </div>
    </header>
  );
};
export default Header;
