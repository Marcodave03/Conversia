// import { useAnimations, useGLTF } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// import { button, useControls } from "leva";
// import React, { useEffect, useRef, useState } from "react";

// import * as THREE from "three";

// const facialExpressions = { /* facial expressions data */ };
// const corresponding = { /* corresponding data */ };

// let setupMode = false;

// export function Avatar(props) {
//   const { nodes, materials, scene } = useGLTF(
//     "/models/67d03bfc1a20f78f15a414bc.glb"
//   );

//   const [lipsync, setLipsync] = useState();

//   const { animations } = useGLTF("/models/animations.glb");

//   const group = useRef();
//   const { actions, mixer } = useAnimations(animations, group);
//   const [animation, setAnimation] = useState(
//     animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name
//   );

//   useEffect(() => {
//     actions[animation]
//       .reset()
//       .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
//       .play();
//     return () => actions[animation].fadeOut(0.5);
//   }, [animation]);

//   const lerpMorphTarget = (target, value, speed = 0.1) => {
//     scene.traverse((child) => {
//       if (child.isSkinnedMesh && child.morphTargetDictionary) {
//         const index = child.morphTargetDictionary[target];
//         if (index === undefined || child.morphTargetInfluences[index] === undefined) {
//           return;
//         }
//         child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
//           child.morphTargetInfluences[index],
//           value,
//           speed
//         );
//       }
//     });
//   };

//   const [blink, setBlink] = useState(false);
//   const [winkLeft, setWinkLeft] = useState(false);
//   const [winkRight, setWinkRight] = useState(false);
//   const [facialExpression, setFacialExpression] = useState("");
//   const [audio, setAudio] = useState();

//   useFrame(() => {
//     !setupMode &&
//       Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
//         const mapping = facialExpressions[facialExpression];
//         if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
//           return;
//         }
//         if (mapping && mapping[key]) {
//           lerpMorphTarget(key, mapping[key], 0.1);
//         } else {
//           lerpMorphTarget(key, 0, 0.1);
//         }
//       });

//     lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
//     lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);
//   });

//   useControls("FacialExpressions", {
//     winkLeft: button(() => {
//       setWinkLeft(true);
//       setTimeout(() => setWinkLeft(false), 300);
//     }),
//     winkRight: button(() => {
//       setWinkRight(true);
//       setTimeout(() => setWinkRight(false), 300);
//     }),
//     animation: {
//       value: animation,
//       options: animations.map((a) => a.name),
//       onChange: (value) => setAnimation(value),
//     },
//     facialExpression: {
//       options: Object.keys(facialExpressions),
//       onChange: (value) => setFacialExpression(value),
//     },
//     enableSetupMode: button(() => {
//       setupMode = true;
//     }),
//     disableSetupMode: button(() => {
//       setupMode = false;
//     }),
//   });

//   useEffect(() => {
//     let blinkTimeout;
//     const nextBlink = () => {
//       blinkTimeout = setTimeout(() => {
//         setBlink(true);
//         setTimeout(() => {
//           setBlink(false);
//           nextBlink();
//         }, 200);
//       }, THREE.MathUtils.randInt(1000, 5000));
//     };
//     nextBlink();
//     return () => clearTimeout(blinkTimeout);
//   }, []);

//   return (
//     <group {...props} dispose={null} ref={group}>
//       <primitive object={nodes.Hips} />
//       {/* Remaining skinned mesh components */}
//     </group>
//   );
// }

// useGLTF.preload("/models/67d03bfc1a20f78f15a414bc.glb");
// useGLTF.preload("/models/animations.glb");
