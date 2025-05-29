import { LuMapPin } from "react-icons/lu";

const DiscoverPage = () => {
  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold">Discover Concerts</h1>
          <p className="text-lg text-gray-500">Find live music near you</p>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center gap-2">
          <LuMapPin className="text-2xl stroke-accent-cyan" />
          <p className="text-lg text-gray-500">Location</p>
        </div>
      </div>
    </>
  );
};
export default DiscoverPage;
