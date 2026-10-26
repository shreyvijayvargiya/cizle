# TV dashboard of six Claude Code agents controlled by voice

By @0xCodez
Language: ? · Domains: data, education, product · Source: V04

Original post: https://x.com/0xCodez/status/2112958529988669742

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xcodez-2112958529988669742

Demo video: https://video.twimg.com/amplify_video/2112956737439371264/vid/avc1/1920x1080/lhEng5LdeACeg4tY.mp4?tag=29

```
This is my own Samsung Smart TV, my own home Wi-Fi and my own laptop.

I want a wall of Claude Code agents running on this laptop and shown live on my TV, opened by voice: I say "Open Claude Code CLI on my TV" to ChatGPT voice mode and the agents appear on the screen.

I'll press Allow on the TV myself and approve every connection.

I authorize you to set up the laptop side, talk to the TV through Samsung's local remote-control API, install what's needed and make the changes below. Every change must be reversible.

I've attached a photo of the TV's Settings → Support → About This TV screen.

Done means: 6 Claude Code agents run in a tmux grid on this laptop, the grid streams as a password-protected web page on my home network only, and one voice command makes the TV open it full screen while I watch each step.

When a step doesn't need me, keep going.

→ First, map how my TV can be controlled and explain it in 5 lines: what runs on Tizen, what the local remote-control API (WebSocket, port 8002) allows, why it can open a URL in the TV browser, and why that's the way in. If the photo shows a TV without Tizen or without network remote control, tell me plainly, and stop. Never root, flash or sideload anything onto the TV.

→ Identify the model from the photo. Install tmux, ttyd and the samsungtvws Python library from official sources (Homebrew, PyPI or official GitHub releases) if missing. Find the TV's IP on my network. Tell me exactly where to look if "Device Connection Manager" or "Access Notification" blocks the connection. On macOS, "No route to host" usually means the terminal needs Local Network access: allow it and retry.

→ Before changing anything, save the TV's current input and app, every setting you'll touch, and the undo commands.

→ Build the agent grid: a tmux session called "tvwall" with 6 panes in a 3×2 layout, each running claude in my repo. Ask me for the repo path and the 6 tasks. If I skip, use refactor, tests, docs, build, review, deploy.

→ Write https://t.co/X0Fwi1AKip with start, stop and status. Start runs ttyd in writable mode on port 7681, bound to my Wi-Fi interface only, with a random password saved to a local file (never print it in chat), a dark theme and a font size readable from the couch on a 4K screen.

→ Open it on the TV: use samsungtvws to open the TV browser at http://<laptop-ip>:7681 and go full screen. The first time, wait for me to press Allow on the TV. Save the pairing token to a local file with owner-only permissions.

→ Build the voice trigger: a tiny MCP server with exactly ONE tool, open_claude_wall, that runs https://t.co/X0Fwi1AKip start and opens the page on the TV. No shell access, no arguments, nothing else. Connect it to ChatGPT as a custom connector in developer mode through a Cloudflare Tunnel protected by a secret token. If my ChatGPT plan or voice mode can't call custom connectors, tell me plainly and fall back to a local wake phrase listener on the laptop instead.

→ Check th
```

Creator's prompt, collected for private study. Ask before republishing.
