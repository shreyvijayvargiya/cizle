# Real-time AR putting coach overlay for Meta Ray-Ban glasses

By @0xCodez
Language: ? · Domains: science, scifi, product · Source: V04

Original post: https://x.com/0xCodez/status/2112550881950396884

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xcodez-2112550881950396884

Demo video: https://video.twimg.com/amplify_video/2112548882789875713/vid/avc1/1920x1080/qN3EoehXYM70IuIg.mp4?tag=29

```
You're a senior AR + computer vision engineer. 

I own Meta Ray-Ban 2 glasses (photo attached) and an Android phone. Turn the glasses into a real-time AR putting coach.

STEP 1: RECON

- Walk me through enabling Bluetooth HCI snoop log, then parse btsnoop_hci.log with tshark
- Decompile the Meta AI app with jadx and map how the camera stream and display overlay are called
- Cross-check against Meta's Wearables Device Access Toolkit
- Output: a spec of how to pull camera frames to the phone and push rendered pixels back to the lens

STEP 2: AGENTS

Spin up 4 Claude Code agents in tmux with one shared SPEC.md:
- agent 1: camera stream + overlay link
- agent 2: vision
- agent 3: putt physics
- agent 4: UI
Each agent tests against recorded footage of a green before touching the live glasses.

STEP 3: SCAN THE GREEN

- Monocular SLAM for head pose + Depth Anything V2 for dense depth
- Metric scale from known objects: ball = 42.67 mm, cup = 108 mm
- Point cloud → Delaunay mesh → heightmap with 5 cm cells

STEP 4: READ THE BREAK

- Slope per cell from the heightmap gradient
- Contour line every 1 cm of elevation (marching squares)
- YOLO detects the ball, flagstick + dark ellipse = the hole

STEP 5: SIMULATE THE PUTT

- Rolling ball physics: 5/7 g along the slope, friction from green speed (default Stimp 10, editable)
- RK4 integration, 1 ms steps
- Search launch angle + speed so the ball finishes 17 inches past the cup
- Render: ideal line (blue), aim line (red), aim point, corridor of putts that still drop, yellow setup lines at my feet square to the aim line

STEP 6: HANDS-FREE UI

- MediaPipe Hands on the same camera feed, index fingertip on a bubble = tap
- Floating bubble menu: Ideal Line, Aiming Line, Contour Lines, Setup Lines, Corridor, Putt Info, Animation
- Actions: New Ball, New Target, New Putt

RULES

- Re-project every overlay into the current camera pose each frame, under 100 ms end to end
- Ask me before anything that needs a physical action (pairing, approving the connection)
- Ship a working build I can test on a practice green today
```

Creator's prompt, collected for private study. Ask before republishing.
