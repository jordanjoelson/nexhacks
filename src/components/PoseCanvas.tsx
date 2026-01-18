"use client";

import { useEffect, useRef } from "react";
import { PlayerPose } from "@/lib/types/pose";

interface PoseCanvasProps {
  videoElement: HTMLVideoElement | null;
  pose: PlayerPose | null;
  className?: string;
}

export default function PoseCanvas({ videoElement, pose, className = "" }: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoElement || !pose) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video's displayed size (not actual video dimensions)
    const updateCanvas = () => {
      const rect = videoElement.getBoundingClientRect();
      // Use device pixel ratio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      // Get video's actual dimensions for coordinate conversion
      const videoWidth = videoElement.videoWidth || rect.width;
      const videoHeight = videoElement.videoHeight || rect.height;
      
      // Calculate scale factors
      const scaleX = rect.width / videoWidth;
      const scaleY = rect.height / videoHeight;
      
      // Clear and redraw
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawPose(ctx, pose, scaleX, scaleY);
    };

    // Use requestAnimationFrame for smooth updates
    let animationFrameId: number;
    const animate = () => {
      updateCanvas();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animate();

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateCanvas();
    });
    resizeObserver.observe(videoElement);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [videoElement, pose]);

  const drawPose = (
    ctx: CanvasRenderingContext2D,
    pose: PlayerPose,
    scaleX: number,
    scaleY: number
  ) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // TODO: Re-enable joint and skeleton drawing
    // Draw joints as red dots
    // const joints = Object.entries(pose.joints).filter(
    //   ([_, point]) => point !== undefined
    // ) as [string, { x: number; y: number}][];

    // Draw connections first (so they appear behind joints)
    // ctx.strokeStyle = "#ef4444";
    // ctx.lineWidth = 2;

    // const connections = [
    //   // Face
    //   [pose.joints.nose, pose.joints.leftEye],
    //   [pose.joints.nose, pose.joints.rightEye],
    //   [pose.joints.leftEye, pose.joints.leftEar],
    //   [pose.joints.rightEye, pose.joints.rightEar],

    //   // Upper body
    //   [pose.joints.leftShoulder, pose.joints.rightShoulder],
    //   [pose.joints.leftShoulder, pose.joints.leftElbow],
    //   [pose.joints.leftElbow, pose.joints.leftWrist],
    //   [pose.joints.rightShoulder, pose.joints.rightElbow],
    //   [pose.joints.rightElbow, pose.joints.rightWrist],

    //   // Torso
    //   [pose.joints.leftShoulder, pose.joints.leftHip],
    //   [pose.joints.rightShoulder, pose.joints.rightHip],
    //   [pose.joints.leftHip, pose.joints.rightHip],

    //   // Lower body
    //   [pose.joints.leftHip, pose.joints.leftKnee],
    //   [pose.joints.leftKnee, pose.joints.leftAnkle],
    //   [pose.joints.rightHip, pose.joints.rightKnee],
    //   [pose.joints.rightKnee, pose.joints.rightAnkle],
    // ];

    // connections.forEach(([start, end]) => {
    //   if (start && end) {
    //     ctx.beginPath();
    //     ctx.moveTo(start.x * scaleX, start.y * scaleY);
    //     ctx.lineTo(end.x * scaleX, end.y * scaleY);
    //     ctx.stroke();
    //   }
    // });

    // Draw joints as red dots
    // joints.forEach(([name, joint]) => {
    //   ctx.fillStyle = "#ef4444"; // Red color
    //   ctx.beginPath();
    //   ctx.arc(joint.x * scaleX, joint.y * scaleY, 5, 0, 2 * Math.PI);
    //   ctx.fill();
    // });
  };

  if (!videoElement || !pose) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
      style={{
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
      }}
    />
  );
}
