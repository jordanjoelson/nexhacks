# Pickleball Analysis System - Architecture Plan

## Overview
A comprehensive pickleball video analysis system with pose detection, court mapping, and AI-powered technique analysis.

## Core Features

### 1. Video Upload & Processing
- **Drag-and-drop upload area**
  - Accept video files (MP4, MOV, etc.)
  - Show upload progress
  - Preview uploaded video
  - File size validation

### 2. Pose Detection & Joint Tracking
- **MediaPipe Pose** (or alternative)
  - Track 33 body keypoints:
    - Head, shoulders, elbows, wrists
    - Hips, knees, ankles
  - Real-time processing on video frames
  - Visualize with red dots/connections
  - Store pose data per frame

### 3. Court Mapping & Framing
- **Court boundary detection**
  - Detect pickleball court lines
  - Map 2D coordinates to court space
  - Track player positions relative to court
  - Identify zones (kitchen, baseline, etc.)

### 4. Video Analysis Pipeline
- **Frame-by-frame processing**
  - Extract frames from video
  - Run pose detection on each frame
  - Detect court boundaries
  - Track ball position (if visible)
  - Identify game events (serve, rally, etc.)

### 5. Summary Generation
- **AI-powered summary** (using Overshoot SDK)
  - Overall game analysis
  - Key moments identified
  - Player statistics
  - Technique highlights
  - Areas for improvement
- **Typing Animation Effect**
  - Display summary with character-by-character typing animation
  - Simulate "Pala" (AI assistant) typing out the analysis
  - Smooth, readable typing speed (configurable, ~30-50ms per character)
  - Pause at punctuation for natural flow:
    - Short pause at commas (100-150ms)
    - Medium pause at periods (200-300ms)
    - Longer pause at paragraph breaks (400-500ms)
  - Show animated typing cursor/indicator while generating
  - Blinking cursor effect (|) at end of text
  - Allow user to skip animation with "Skip" button
  - Show "Pala is typing..." indicator before animation starts

### 6. Detailed Analysis View
- **Interactive video player**
  - Play/pause controls
  - Frame-by-frame navigation
  - Timeline scrubber
  - Annotations overlay:
    - Joint positions (red dots)
    - Skeleton connections
    - Court boundaries
    - Player position tracking
    - Ball trajectory (if detected)

### 7. Technique Analysis
- **Movement analysis**
  - Stance evaluation
  - Swing mechanics
  - Footwork patterns
  - Reach and extension
  - Balance and stability
  - Specific recommendations per moment

## Technical Architecture

### Frontend Structure
```
src/app/
├── page.tsx                    # Live camera analysis (current)
├── analyze/
│   ├── page.tsx               # Main analysis page
│   ├── upload.tsx             # Video upload component
│   ├── summary.tsx             # Summary view component
│   └── detailed/
│       └── page.tsx           # Detailed analysis view
├── components/
│   ├── VideoUpload.tsx        # Drag-and-drop upload
│   ├── VideoPlayer.tsx        # Video player with controls
│   ├── PoseCanvas.tsx         # Canvas overlay for pose visualization
│   ├── CourtOverlay.tsx        # Court boundary visualization
│   ├── JointTracker.tsx       # Joint position tracking
│   ├── AnalysisSummary.tsx    # Summary display
│   └── TypingAnimation.tsx     # "Pala" typing effect component
└── lib/
    ├── pose-detection.ts      # MediaPipe integration
    ├── court-mapping.ts        # Court detection logic
    ├── video-processor.ts     # Video frame extraction
    └── analysis-engine.ts     # Analysis orchestration
```

### Data Flow

1. **Upload Phase**
   ```
   User uploads video → File validation → 
   Create video object URL → Extract metadata →
   Show preview → Ready for analysis
   ```

2. **Processing Phase**
   ```
   Video file → Extract frames → 
   For each frame:
     - Run pose detection → Store joint positions
     - Detect court boundaries → Store court mapping
     - Track ball (optional) → Store ball positions
   → Aggregate data → Generate pose timeline
   ```

3. **Analysis Phase**
   ```
   Pose data + Court data + Video →
   Send to Overshoot SDK (summary prompt) →
   Generate summary →
   Identify key moments →
   Create technique insights
   ```

4. **Display Phase**
   ```
   Video player + Current frame index →
   Lookup pose data for frame →
   Draw joints on canvas overlay →
   Show court boundaries →
   Display analysis for current moment
   ```

### Key Technologies

#### Pose Detection
- **Option 1: MediaPipe Pose** (Recommended)
  - Browser-based, no server needed
  - 33 keypoints, real-time capable
  - Good accuracy
  - Package: `@mediapipe/pose`

- **Option 2: TensorFlow.js PoseNet**
  - Lighter weight
  - Fewer keypoints (17)
  - Package: `@tensorflow-models/posenet`

- **Option 3: Use Overshoot SDK**
  - Could prompt for pose detection
  - Might be less precise than dedicated library

#### Video Processing
- **HTML5 Video API** - Basic playback
- **Canvas API** - Frame extraction and drawing
- **File API** - Video file handling
- **URL.createObjectURL()** - Video preview

#### Court Detection
- **Computer Vision Approach**
  - Use Overshoot SDK to detect court lines
  - Prompt: "Detect pickleball court boundaries, lines, and zones"
  - Map detected lines to coordinate system

- **Manual Calibration** (Fallback)
  - User clicks 4 corners of court
  - Calculate perspective transform
  - Map to standard court dimensions

#### Analysis Engine
- **Overshoot SDK** for:
  - Summary generation
  - Technique analysis
  - Key moment identification
  - Improvement suggestions

- **Custom Logic** for:
  - Pose data analysis
  - Movement pattern detection
  - Statistical calculations

### Data Structures

```typescript
// Pose Data per Frame
interface FramePoseData {
  frameNumber: number;
  timestamp: number;
  players: PlayerPose[];
}

interface PlayerPose {
  id: number;
  joints: {
    head: Point;
    leftShoulder: Point;
    rightShoulder: Point;
    leftElbow: Point;
    rightElbow: Point;
    leftWrist: Point;
    rightWrist: Point;
    leftHip: Point;
    rightHip: Point;
    leftKnee: Point;
    rightKnee: Point;
    leftAnkle: Point;
    rightAnkle: Point;
  };
  confidence: number;
}

// Court Mapping
interface CourtMapping {
  boundaries: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
  zones: {
    kitchen: Polygon;
    leftService: Polygon;
    rightService: Polygon;
    baseline: Polygon;
  };
  transformMatrix: number[]; // For coordinate transformation
}

// Analysis Result
interface VideoAnalysis {
  summary: string;
  keyMoments: KeyMoment[];
  statistics: PlayerStats;
  techniqueInsights: TechniqueInsight[];
  poseTimeline: FramePoseData[];
  courtMapping: CourtMapping;
}

interface KeyMoment {
  frameNumber: number;
  timestamp: number;
  type: 'serve' | 'rally' | 'shot' | 'movement';
  description: string;
  analysis: string;
}

interface TechniqueInsight {
  frameNumber: number;
  area: 'stance' | 'swing' | 'footwork' | 'reach' | 'balance';
  issue: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}
```

### UI/UX Flow

1. **Upload Page**
   - Large drag-and-drop area
   - File preview after upload
   - "Analyze Video" button
   - Loading state during processing

2. **Processing State**
   - Progress bar showing:
     - Frame extraction progress
     - Pose detection progress
     - Court mapping progress
     - Analysis generation progress
   - Estimated time remaining

3. **Summary View**
   - Video thumbnail/preview
   - AI-generated summary card with typing animation
     - "Pala" typing effect (character-by-character)
     - Animated cursor/indicator
     - Smooth, readable typing speed
     - Natural pauses at punctuation
     - Skip animation button
   - Key statistics
   - "Dive Deeper" button (appears after summary completes)

4. **Detailed Analysis View**
   - Split screen:
     - Left: Video player with annotations
     - Right: Analysis panel
   - Timeline scrubber
   - Frame-by-frame navigation
   - Technique insights sidebar
   - Export/share options

### Implementation Phases

#### Phase 1: Foundation
- [ ] Set up routing structure
- [ ] Create video upload component
- [ ] Basic video player
- [ ] File handling and validation

#### Phase 2: Pose Detection
- [ ] Integrate MediaPipe Pose
- [ ] Process video frames
- [ ] Store pose data
- [ ] Basic visualization on canvas

#### Phase 3: Court Mapping
- [ ] Court detection (Overshoot SDK or CV)
- [ ] Coordinate transformation
- [ ] Zone identification
- [ ] Overlay visualization

#### Phase 4: Analysis
- [ ] Integrate Overshoot SDK for summary
- [ ] Generate key moments
- [ ] Create technique insights
- [ ] Build summary view
- [ ] Implement typing animation component ("Pala" effect)
  - Character-by-character display
  - Animated cursor
  - Configurable typing speed
  - Pause logic for punctuation

#### Phase 5: Detailed View
- [ ] Annotated video player
- [ ] Frame synchronization
- [ ] Interactive timeline
- [ ] Technique recommendations

#### Phase 6: Polish
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsiveness

### Performance Considerations

- **Video Processing**
  - Process frames in chunks (not all at once)
  - Use Web Workers for heavy computation
  - Show progress to user
  - Cache processed data

- **Pose Detection**
  - Process every Nth frame (e.g., every 5th frame)
  - Interpolate between detected frames
  - Use lower resolution for faster processing

- **Rendering**
  - Use requestAnimationFrame for smooth playback
  - Optimize canvas drawing
  - Debounce timeline scrubbing

### Alternative Approaches

#### Server-Side Processing
- Upload video to server
- Process on backend (faster, more resources)
- Stream results back
- Better for long videos

#### Hybrid Approach
- Quick preview with client-side processing
- Full analysis on server
- Progressive enhancement

### Open Questions

1. **Real-time vs. Batch Processing**
   - Should we process during upload or after?
   - How to handle long videos (5+ minutes)?

2. **Multi-Player Tracking**
   - How to distinguish between players?
   - Track multiple people simultaneously?

3. **Ball Tracking**
   - Is ball tracking necessary?
   - How accurate can it be?

4. **Storage**
   - Store processed videos?
   - User accounts/profiles?
   - Cloud storage integration?

5. **Export Options**
   - Export annotated video?
   - PDF report?
   - Shareable links?

## Typing Animation Implementation Details

### Component: TypingAnimation.tsx
```typescript
interface TypingAnimationProps {
  text: string;           // Full text to type out
  speed?: number;        // Milliseconds per character (default: 40)
  onComplete?: () => void; // Callback when typing finishes
  showSkip?: boolean;    // Show skip button
  className?: string;     // Additional CSS classes
}

// Features:
// - Character-by-character reveal
// - Animated cursor (|) that blinks
// - Natural pauses at punctuation
// - Skip functionality
// - Smooth animation using requestAnimationFrame
```

### Implementation Approach
1. **State Management**
   - Track current displayed text length
   - Track animation state (idle, typing, complete)
   - Store original full text

2. **Timing Logic**
   - Base speed: 40ms per character
   - Punctuation delays:
     - Comma: +100ms
     - Period: +200ms
     - Exclamation/Question: +200ms
     - Newline: +400ms

3. **Visual Effects**
   - Blinking cursor using CSS animation
   - Smooth text reveal (no jarring jumps)
   - Optional fade-in effect for each character

4. **User Controls**
   - "Skip" button appears after 1 second
   - Clicking skip instantly shows full text
   - Animation can be paused/resumed (optional)

5. **Performance**
   - Use requestAnimationFrame for smooth animation
   - Batch DOM updates if needed
   - Clean up timers on unmount

## Next Steps

1. Review and refine this plan
2. Decide on pose detection library
3. Choose processing approach (client vs. server)
4. Design database schema (if storing data)
5. Create detailed component specifications
6. Set up project structure
7. Begin Phase 1 implementation