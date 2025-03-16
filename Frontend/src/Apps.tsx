import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";

function Apps() {
  return (
    <div className="w-[100vw] h-[100vh] relative">
      <Loader />
      <Leva />
      <Canvas
        shadows
        camera={{ position: [0, 0, 1], fov: 30 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Experience />
      </Canvas>
    </div>
  );
}

export default Apps;