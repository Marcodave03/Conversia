import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";

// Import the MouthCue type from Avatar
import type { MouthCue } from "./Avatar";

type ExperienceProps = {
  expression: string | null;
  animation: string | null;
  mouthCues: MouthCue[];
  audioDuration: number;
};

export const Experience: React.FC<ExperienceProps> = ({
  expression,
  animation,
  mouthCues,
  audioDuration,
}) => {
  const cameraControls = useRef<CameraControls>(null);

  useEffect(() => {
    cameraControls.current?.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      <Avatar
        expression={expression}
        animation={animation}
        mouthCues={mouthCues}
        audioDuration={audioDuration}
        modelUrl="/models/girl6.glb"
      />
      <ContactShadows opacity={0.7} />
    </>
  );
};