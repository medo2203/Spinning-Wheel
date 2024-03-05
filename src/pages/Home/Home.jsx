import SpinWheel from "./SpinWheel";
import SpinWheelApp from "./SpinWheelTest";

const Home = () => {
  return (
    <div
      className="w-full h-full"
      style={{
        backgroundImage: "url('/assets/GMF-BG.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <SpinWheel />
      {/* <SpinWheelApp /> */}
    </div>
  );
};

export default Home;
