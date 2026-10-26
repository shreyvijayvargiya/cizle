# CarPlay reverse-engineering demo controlling a BMW iDrive head unit

By @0xCodez
Language: ? · Domains: scifi, engineering · Source: V04

Original post: https://x.com/0xCodez/status/2111875629473743224

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xcodez-2111875629473743224

Demo video: https://video.twimg.com/amplify_video/2111873680212963328/vid/avc1/1920x1080/tx09rD-DD_PxPpVO.mp4?tag=29

```
"This is my own car head unit (Android-based / CarPlay AI-box) on my own device. 

It came full of preinstalled bloat, recommendation rows and apps I can't remove from the menu, and I want it clean, fast and controlled from this computer. 

I'll turn on developer mode myself and approve the connection on the screen. 

I authorize you to connect to it with ADB, Android's official developer tool, read its settings and make the changes below. Every change must be reversible.

I've attached a photo of my head unit (or its Settings → About screen).

Done means: you're connected, the unit is cleaned of bloat and runs faster, an open-source app of my choice is installed, and one command opens YouTube on the dash and plays a video I name while I watch each step on the screen. 

When a step doesn't need me, keep going.

- Identify the model from the photo. If it's a locked OEM system (like BMW iDrive, not an Android-based unit), tell me plainly that ADB control isn't possible there and what its official local control allows, and do only that.

- Install adb from official sources if it's missing. Tell me exactly where to tap to turn on Developer options and USB or Wireless debugging, and to find the unit's IP. If adb connect is refused, use Wireless debugging pairing. On macOS, "No route to host" usually means the terminal needs Local Network access: allow it and retry.

- Before changing anything, save the package list, every setting you'll touch and the undo commands.

- Propose the cleanup and wait for my OK: disable (never uninstall) ad, recommendation, feedback and demo apps; never touch the CarPlay or Android Auto service, navigation, radio or tuner, the reverse camera, CAN-bus or any driving or safety app, the launcher, Play Services, the keyboard or input services, or anything you can't identify; animations to 0.5; 

Private DNS https://t.co/IRnLxLsuE2

- Install apps only from their official GitHub releases, for example the TV Bro browser.

- Use real taps and key presses so I see every step, and check the screen (screenshot or uiautomator dump) before pressing OK. Screenshots of a playing video are blank because of DRM. Handle the "Who's watching?" screen.

- Add a live monitor that prints each command with a timestamp and shows logcat only while a command runs.

- End with a cheat sheet and the undo commands.

Do everything parked with the engine off. Never type passwords or sign in for me, never root or flash anything, never modify vehicle firmware, no pirate sites."
```

Creator's prompt, collected for private study. Ask before republishing.
