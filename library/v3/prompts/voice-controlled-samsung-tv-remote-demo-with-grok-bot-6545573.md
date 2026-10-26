# Voice-controlled Samsung TV remote demo with Grok Bot

By @0xCodez
Language: ? · Domains: education, finance · Source: V04

Original post: https://x.com/0xCodez/status/2113270979476545573

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xcodez-2113270979476545573

Demo video: https://video.twimg.com/amplify_video/2113270621178138624/vid/avc1/1920x1080/fAe9M_3cL52_1uYE.mp4?tag=29

```
This is my own smart TV, my own home Wi-Fi and my own laptop.

I want to control my TV by voice through Grok Bot: I say "Hey Grok, open Netflix" and the TV opens the Netflix home screen and browses it on command ("go right", "scroll down", "open this one").

I'll press Allow on the TV myself and approve every connection.

I authorize you to set up the laptop side, talk to the TV through its official local remote-control API, install what's needed and make the changes below. Every change must be reversible.

I've attached a photo of the TV's Settings → About screen.

Done means: a small local "TV remote" service runs on this laptop with exactly three tools (open_netflix, press_key, status), Grok Bot can call it, and one voice command opens Netflix on my TV while I watch each step.

When a step doesn't need me, keep going.

→ First, identify my TV from the photo and explain in 5 lines how it can be controlled on my network: which OS it runs (Tizen, webOS or Google TV), which local API it exposes, how pairing works, how apps get launched by ID, and how remote key presses are sent. 

If the photo shows a TV without network remote control, tell me plainly, and stop. Never root, flash, sideload or put the TV in developer mode.

→ Install only the official or most widely used library for my TV from official sources (PyPI, Homebrew or official GitHub releases): samsungtvws for Samsung, the SSAP/websocket API for LG webOS, adb for Google TV. Find the TV's IP on my network. 

If the connection is blocked, tell me exactly which TV setting to check. On macOS, "No route to host" usually means the terminal needs Local Network access: allow it and retry.

→ Before changing anything, save the TV's current app and input, every setting you'll touch, and the undo commands.

→ Pair with the TV. The first time, wait for me to press Allow on the screen. Save the pairing token to a local file with owner-only permissions.

→ Build tvremote: a tiny MCP server with exactly three tools.

open_netflix: launches the Netflix app by its official app ID and waits for the home screen.

press_key: accepts only UP, DOWN, LEFT, RIGHT, ENTER, BACK, HOME, with a short pause between presses.
status: returns what's on the TV right now.
No shell access, no other apps, no free-form commands.

→ Connect tvremote to Grok Bot as a custom plugin through a Cloudflare Tunnel protected by a secret token. Write a short instruction for the bot: "Open Netflix when I ask, navigate only with press_key, describe what's on screen after each step." 

If my Grok Bot plan can't use custom plugins, tell me plainly and fall back to a local wake phrase listener on the laptop instead.

→ Check the TV's state before every action and show me what you're about to send.

→ If Netflix shows "Who's watching?", a sign-in screen or any payment or plan prompt, stop and let me handle it. Never sign in, never pick a profile for me, never change the plan, never buy or rent anything.

→ Never touch the TV'
```

Creator's prompt, collected for private study. Ask before republishing.
