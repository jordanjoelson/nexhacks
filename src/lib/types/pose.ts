// Pose detection types

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface Joint {
  name: string;
  position: Point;
  visibility?: number;
}

export interface PlayerPose {
  id: number;
  joints: {
    // Face
    nose?: Point;
    leftEye?: Point;
    rightEye?: Point;
    leftEar?: Point;
    rightEar?: Point;
    
    // Upper body
    leftShoulder?: Point;
    rightShoulder?: Point;
    leftElbow?: Point;
    rightElbow?: Point;
    leftWrist?: Point;
    rightWrist?: Point;
    
    // Torso
    leftHip?: Point;
    rightHip?: Point;
    
    // Lower body
    leftKnee?: Point;
    rightKnee?: Point;
    leftAnkle?: Point;
    rightAnkle?: Point;
  };
  confidence: number;
}

export interface FramePoseData {
  frameNumber: number;
  timestamp: number;
  players: PlayerPose[];
}
