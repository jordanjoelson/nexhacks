"use client";

import { PlayerPose, FramePoseData, Point } from "./types/pose";

export class PoseDetector {
  private pose: any = null;
  private isInitialized = false;
  private PoseClass: any = null;
  private currentDetectionResolve: ((pose: PlayerPose | null) => void) | null = null;
  private currentVideoElement: HTMLVideoElement | null = null;

  get initialized(): boolean {
    return this.isInitialized;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Dynamic import for MediaPipe to avoid Next.js build issues
    if (typeof window === "undefined") {
      throw new Error("Pose detection only works in browser");
    }

    try {
      const mediapipePose = await import("@mediapipe/pose");
      this.PoseClass = mediapipePose.Pose;

      if (!this.PoseClass) {
        throw new Error("MediaPipe Pose not available");
      }

      // Initialize with proper file location configuration
      this.pose = new this.PoseClass({
        locateFile: (file: string) => {
          // Try multiple CDNs for reliability
          const version = "0.5.1675469404";
          const cdnUrls = [
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${version}/${file}`,
            `https://unpkg.com/@mediapipe/pose@${version}/${file}`,
          ];
          // Return first CDN URL (jsdelivr is usually more reliable)
          return cdnUrls[0];
        },
      });

      // Set options before initializing
      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Set up persistent results handler
      this.pose.onResults((results: any) => {
        this.handlePoseResults(results);
      });

      // Initialize the pose detector (this loads WASM files)
      // Add delays to ensure MediaPipe's internal Module is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        await this.pose.initialize();
        // Wait a bit more for WASM to fully load
        await new Promise(resolve => setTimeout(resolve, 300));
        this.isInitialized = true;
      } catch (initError) {
        console.error("MediaPipe initialization error:", initError);
        // Retry once after a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await this.pose.initialize();
          this.isInitialized = true;
        } catch (retryError) {
          console.error("MediaPipe initialization retry failed:", retryError);
          throw retryError;
        }
      }
    } catch (error) {
      console.error("Failed to initialize MediaPipe Pose:", error);
      throw error;
    }
  }

  // Handle pose detection results
  private handlePoseResults(results: any): void {
    if (!this.currentDetectionResolve || !this.currentVideoElement) return;

    if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
      this.currentDetectionResolve(null);
      this.currentDetectionResolve = null;
      this.currentVideoElement = null;
      return;
    }

    const landmarks = results.poseLandmarks;
    const videoWidth = this.currentVideoElement.videoWidth;
    const videoHeight = this.currentVideoElement.videoHeight;

    // Convert normalized coordinates to pixel coordinates
    const convertPoint = (landmark: any): Point => ({
      x: landmark.x * videoWidth,
      y: landmark.y * videoHeight,
      z: landmark.z,
    });

    const pose: PlayerPose = {
      id: 0,
      joints: {
        // Face
        nose: landmarks[0] ? convertPoint(landmarks[0]) : undefined,
        leftEye: landmarks[2] ? convertPoint(landmarks[2]) : undefined,
        rightEye: landmarks[5] ? convertPoint(landmarks[5]) : undefined,
        leftEar: landmarks[7] ? convertPoint(landmarks[7]) : undefined,
        rightEar: landmarks[8] ? convertPoint(landmarks[8]) : undefined,

        // Upper body
        leftShoulder: landmarks[11] ? convertPoint(landmarks[11]) : undefined,
        rightShoulder: landmarks[12] ? convertPoint(landmarks[12]) : undefined,
        leftElbow: landmarks[13] ? convertPoint(landmarks[13]) : undefined,
        rightElbow: landmarks[14] ? convertPoint(landmarks[14]) : undefined,
        leftWrist: landmarks[15] ? convertPoint(landmarks[15]) : undefined,
        rightWrist: landmarks[16] ? convertPoint(landmarks[16]) : undefined,

        // Torso
        leftHip: landmarks[23] ? convertPoint(landmarks[23]) : undefined,
        rightHip: landmarks[24] ? convertPoint(landmarks[24]) : undefined,

        // Lower body
        leftKnee: landmarks[25] ? convertPoint(landmarks[25]) : undefined,
        rightKnee: landmarks[26] ? convertPoint(landmarks[26]) : undefined,
        leftAnkle: landmarks[27] ? convertPoint(landmarks[27]) : undefined,
        rightAnkle: landmarks[28] ? convertPoint(landmarks[28]) : undefined,
      },
      confidence: results.poseLandmarks.reduce(
        (acc: number, lm: any) => acc + (lm.visibility || 0),
        0
      ) / results.poseLandmarks.length,
    };

    this.currentDetectionResolve(pose);
    this.currentDetectionResolve = null;
    this.currentVideoElement = null;
  }

  async detectPose(videoElement: HTMLVideoElement): Promise<PlayerPose | null> {
    if (!this.pose || !this.isInitialized) {
      await this.initialize();
    }

    // Ensure video is ready
    if (videoElement.readyState < 2) {
      await new Promise((resolve) => {
        videoElement.addEventListener("loadeddata", resolve, { once: true });
      });
    }

    return new Promise((resolve) => {
      if (!this.pose) {
        resolve(null);
        return;
      }

      // Set timeout to avoid hanging (reduced for faster response)
      const timeout = setTimeout(() => {
        if (this.currentDetectionResolve === resolve) {
          this.currentDetectionResolve = null;
          this.currentVideoElement = null;
        }
        resolve(null);
      }, 1000);

      // Store resolve and video element for the handler
      this.currentDetectionResolve = (pose: PlayerPose | null) => {
        clearTimeout(timeout);
        resolve(pose);
      };
      this.currentVideoElement = videoElement;

      try {
        // Send current video frame - handler is already set up
        this.pose.send({ image: videoElement });
      } catch (error) {
        clearTimeout(timeout);
        this.currentDetectionResolve = null;
        this.currentVideoElement = null;
        console.error("Error sending image to MediaPipe:", error);
        resolve(null);
      }
    });
  }

  drawPose(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    pose: PlayerPose,
    videoWidth: number,
    videoHeight: number
  ): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale canvas to match video dimensions
    const scaleX = canvas.width / videoWidth;
    const scaleY = canvas.height / videoHeight;

    // Draw joints as red dots
    const joints = Object.values(pose.joints).filter(
      (point): point is Point => point !== undefined
    );

    joints.forEach((joint) => {
      ctx.fillStyle = "#ef4444"; // Red color
      ctx.beginPath();
      ctx.arc(
        joint.x * scaleX,
        joint.y * scaleY,
        4,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw connections (skeleton)
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;

    // Draw connections between key joints
    const connections = [
      // Face
      [pose.joints.nose, pose.joints.leftEye],
      [pose.joints.nose, pose.joints.rightEye],
      [pose.joints.leftEye, pose.joints.leftEar],
      [pose.joints.rightEye, pose.joints.rightEar],

      // Upper body
      [pose.joints.leftShoulder, pose.joints.rightShoulder],
      [pose.joints.leftShoulder, pose.joints.leftElbow],
      [pose.joints.leftElbow, pose.joints.leftWrist],
      [pose.joints.rightShoulder, pose.joints.rightElbow],
      [pose.joints.rightElbow, pose.joints.rightWrist],

      // Torso
      [pose.joints.leftShoulder, pose.joints.leftHip],
      [pose.joints.rightShoulder, pose.joints.rightHip],
      [pose.joints.leftHip, pose.joints.rightHip],

      // Lower body
      [pose.joints.leftHip, pose.joints.leftKnee],
      [pose.joints.leftKnee, pose.joints.leftAnkle],
      [pose.joints.rightHip, pose.joints.rightKnee],
      [pose.joints.rightKnee, pose.joints.rightAnkle],
    ];

    connections.forEach(([start, end]) => {
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * scaleX, start.y * scaleY);
        ctx.lineTo(end.x * scaleX, end.y * scaleY);
        ctx.stroke();
      }
    });
  }

  async processVideoFrames(
    videoElement: HTMLVideoElement,
    onFrameProcessed?: (frameData: FramePoseData) => void,
    frameSkip: number = 5 // Process every Nth frame
  ): Promise<FramePoseData[]> {
    const poseData: FramePoseData[] = [];
    const originalTime = videoElement.currentTime;
    const fps = 30; // Assuming 30fps, adjust if needed
    const frameDuration = 1 / fps;

    // Reset video to start
    videoElement.currentTime = 0;
    await new Promise((resolve) => {
      videoElement.addEventListener("seeked", resolve, { once: true });
    });

    let frameNumber = 0;

    while (videoElement.currentTime < videoElement.duration) {
      if (frameNumber % frameSkip === 0) {
        const pose = await this.detectPose(videoElement);
        
        if (pose) {
          const frameData: FramePoseData = {
            frameNumber,
            timestamp: videoElement.currentTime,
            players: [pose],
          };
          
          poseData.push(frameData);
          onFrameProcessed?.(frameData);
        }
      }

      // Move to next frame
      frameNumber++;
      videoElement.currentTime = frameNumber * frameDuration;

      await new Promise((resolve) => {
        videoElement.addEventListener("seeked", resolve, { once: true });
      });
    }

    // Restore original time
    videoElement.currentTime = originalTime;
    await new Promise((resolve) => {
      videoElement.addEventListener("seeked", resolve, { once: true });
    });

    return poseData;
  }

  dispose(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.isInitialized = false;
    this.currentDetectionResolve = null;
    this.currentVideoElement = null;
  }
}
