import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";

// Import the MouthCue type from Avatar or a shared location
import { MouthCue } from "./Avatar";

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
      {/* Pass the props to Avatar too */}
      <Avatar 
        expression={expression}
        animation={animation}
        mouthCues={mouthCues}
        audioDuration={audioDuration}
      />
      <ContactShadows opacity={0.7} />
    </>
  );
};
