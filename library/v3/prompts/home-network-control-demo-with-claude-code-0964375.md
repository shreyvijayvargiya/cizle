# Home network control demo with Claude Code

By @0xCodila
Language: ? · Domains: product, engineering · Source: V04

Original post: https://x.com/0xCodila/status/2113353404470964375

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xcodila-2113353404470964375

Demo video: https://video.twimg.com/amplify_video/2113352851313344512/vid/avc1/3840x2160/_EurARRy7h6WofBC.mp4?tag=29

```
These are my own devices on my home network, but I don't know their brands and models.
If you can't run commands on this computer (you're not Claude Code or a similar agent), say so in one line, tell me to paste this into Claude Code on a computer on my home Wi-Fi, and stop.
Find the devices on my own network: reach every address in my own subnet once (one ping each; ask me first if the subnet has more than 256 addresses), then read the ARP table, then mDNS (Bonjour) and SSDP (UPnP), then the router's client list if I've given you its login. If a VPN is on, ask me to pause it. Ask me whether I also have a guest or IoT network. For each device, tell me what it is, with brand and model where you can, and how sure you are. If only a chip maker shows (Espressif, Tuya and the like), ask me what that device is.
Then list what you found and ask me which devices I also have that aren't on the network (an IR-only AC, a fridge, a microwave and the like); for those, offer the next best option (an IR blaster, a Wi-Fi sensor).
Then ask me which ones to make mine, and for each one I pick, make it mine: control from this chat, and fix what bugs me. If I say "just diagnose", change nothing.

Rules for every device
- Only my own devices on my own network. If this computer isn't on my home network (a cloud session, a virtual machine, or WSL without mirrored networking), say so and stop. To find them: reach every address in my own subnet once (one ping each; ask me first if the subnet has more than 256 addresses), then read the ARP table (a device that ignores ping still shows up there); then mDNS (Bonjour) and SSDP (UPnP); then the router's client list if I've given you its login. If a VPN is on, ask me to pause it: it can hide my home network. Ask me whether I also have a guest or IoT network. Never scan or touch any other network.
- On macOS, if pings or connections to my devices fail with "No route to host", tell me to allow this app under System Settings > Privacy & Security > Local Network, then retry.
- One device at a time, in the order listed (or the order I pick), with the router's Wi-Fi changes last. Finish it, or tell me it's stuck, before the next.
- Back up first: save each device's current settings in its own folder under "rea-home-devices" in my home folder before any change. Keep that folder private: it can hold passwords and tokens, never share or upload it. Keep README.md and CLAUDE.md there listing every tool you made and how to run it, so a new chat started in that folder can use them.
- Before each change, show the old and new value and wait for my yes. Read the value back after. Keep a way to undo every change.
- Build each device's limits below into its tool's code too, so a later request can't break them.
- Passwords and tokens: you can't type hidden input, so give me one command to run in my own terminal window that saves it, then read it inside your scripts without printing it. macOS: security add-generic-password -U -a
```

Creator's prompt, collected for private study. Ask before republishing.
