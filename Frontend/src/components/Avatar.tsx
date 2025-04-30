import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Facial Expressions Data
const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.17,
    noseSneerRight: 0.14,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 1,
    mouthDimpleLeft: 0.41,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35,
    mouthSmileRight: 0.35,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78,
    browInnerUp: 0.45,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.35,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.57,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39,
    eyeLookUpRight: 0.4,
    eyeLookInLeft: 0.96,
    eyeLookInRight: 0.96,
    jawOpen: 0.96,
    mouthDimpleLeft: 0.96,
    mouthDimpleRight: 0.96,
    mouthStretchLeft: 0.28,
    mouthStretchRight: 0.29,
    mouthSmileLeft: 0.56,
    mouthSmileRight: 0.38,
    tongueOut: 0.96,
  },
};

const correspondingViseme = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
} as const; // 👈 important!

// Avatar Props
export interface MouthCue {
  start: number;
  end: number;
  value: string;
}

interface AvatarProps {
  expression: string | null;
  animation: string | null;
  mouthCues: MouthCue[];
  audioDuration: number;
  modelUrl?: string; 
}

// GLTF Model Type
type GLTFResult = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.Bone };
  materials: { [name: string]: THREE.Material };
  scene: THREE.Group;
};

export function Avatar({
  expression,
  animation,
  mouthCues,
  audioDuration,
  modelUrl = "/models/girl1.glb",
}: AvatarProps) {
  const group = useRef<THREE.Group>(null);

  const { nodes, materials, scene } = useGLTF(modelUrl) as GLTFResult;
  const { animations } = useGLTF("/models/animations.glb") as GLTFResult & { animations: THREE.AnimationClip[] };
  const { actions } = useAnimations(animations, group);

  const [blink, setBlink] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null); // ✅ fix this

  // Play idle or animation
  useEffect(() => {
    const idleAction = actions["Idle"];

    if (!idleAction) {
      console.warn("No 'Idle' animation found!");
      return;
    }

    if (!animation) {
      idleAction.reset().fadeIn(0.5).play();
    } else {
      const requestedAction = actions[animation];
      if (requestedAction) {
        requestedAction.reset().fadeIn(0.5).play();
      }
    }

    return () => {
      if (actions["Idle"]) actions["Idle"].fadeOut(0.5);
      if (animation && actions[animation]) actions[animation].fadeOut(0.5);
    };
  }, [animation, actions]);

  // Blink
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 200);
      }, THREE.MathUtils.randInt(3000, 6000));
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Watch for mouthCues change -> reset timer
  useEffect(() => {
    if (mouthCues.length > 0) {
      setStartTime(performance.now());
    }
  }, [mouthCues]);

  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child) => {
      if ("morphTargetDictionary" in child) {
        const skinned = child as THREE.SkinnedMesh & {
          morphTargetInfluences: number[];
          morphTargetDictionary: { [key: string]: number };
        };
        const index = skinned.morphTargetDictionary[target];
        if (index !== undefined) {
          skinned.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            skinned.morphTargetInfluences[index],
            value,
            speed
          );
        }
      }
    });
  };

  useFrame(() => {

    let talkingNow = false;

    if (startTime !== null && audioDuration > 0) {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed <= audioDuration / 1000) {
        talkingNow = true;

        let activeViseme: string | null = null;
        for (const cue of mouthCues) {
          if (elapsed >= cue.start && elapsed <= cue.end) {
            activeViseme = correspondingViseme[cue.value as keyof typeof correspondingViseme];
            break;
          }
        }

        Object.values(correspondingViseme).forEach((viseme) => {
          lerpMorphTarget(viseme, viseme === activeViseme ? 1 : 0, 0.2);
        });
      } else {
        Object.values(correspondingViseme).forEach((viseme) => {
          lerpMorphTarget(viseme, 0, 0.2);
        });
      }
    }

    if (talkingNow !== isTalking) {
      setIsTalking(talkingNow);
      if (!talkingNow && actions["Idle"]) {
        actions["Idle"].reset().fadeIn(0.5).play(); // ✅ go back idle after talking
      }
    }

    // Blinking
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.3);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.3);

    // Expression when not talking
    if (
      !talkingNow &&
      expression &&
      nodes.EyeLeft instanceof THREE.SkinnedMesh &&
      nodes.EyeLeft.morphTargetDictionary
    ) {
      const face: Record<string, number> = facialExpressions[expression as keyof typeof facialExpressions] || {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
        lerpMorphTarget(key, face[key] || 0, 0.1);
      });
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={nodes.Hips} />

      {/* Character Meshes */}
      {nodes.Wolf3D_Body instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Body.geometry}
          material={materials.Wolf3D_Body}
          skeleton={nodes.Wolf3D_Body.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Bottom instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
          material={materials.Wolf3D_Outfit_Bottom}
          skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Footwear instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
          material={materials.Wolf3D_Outfit_Footwear}
          skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Top instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Top.geometry}
          material={materials.Wolf3D_Outfit_Top}
          skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
        />
      )}
      {nodes.Wolf3D_Hair instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
      )}
      {nodes.EyeLeft instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.EyeLeft.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
      )}
      {nodes.EyeRight instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.EyeRight.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Head instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Teeth instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/girl1.glb");
useGLTF.preload("/models/boy.glb");
useGLTF.preload("/models/girl2.glb");
useGLTF.preload("/models/girl3.glb");
useGLTF.preload("/models/girl4.glb");
useGLTF.preload("/models/girl5.glb");
useGLTF.preload("/models/girl6.glb");
useGLTF.preload("/models/girl7.glb");
useGLTF.preload("/models/girl2benertapi.glb");
useGLTF.preload("/models/animations.glb");
