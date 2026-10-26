# Interactive home-device diagnosis site on a TV

By @0xCodila
Language: ? · Domains: engineering, product · Source: V04

Original post: https://x.com/0xCodila/status/2113693154130215237

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xcodila-2113693154130215237

Demo video: https://video.twimg.com/amplify_video/2113688055815024640/vid/avc1/3840x2160/L-2F0txzboU5uBEq.mp4?tag=29

```
Everything below is about my own devices on my own home network. I just don't know their brands or models.

If you can't run commands on this machine (you aren't Claude Code or a similar agent), tell me that in one line, ask me to paste this into Claude Code on a computer connected to my home Wi-Fi, and stop there.

Start by finding what's on my network: ping every address in my own subnet one time (check with me first if the subnet is bigger than 256 addresses), then look at the ARP table, then mDNS (Bonjour) and SSDP (UPnP), and last the router's client list if I've shared its login with you. If a VPN is running, ask me to pause it. Ask whether I also have a guest or IoT network. For every device, tell me what it is, the brand and model when you can tell, and how confident you are. If all you can see is a chip vendor (Espressif, Tuya and similar), ask me what that device is.

Next, show me the list and ask which of my devices aren't on the network at all (an AC that only takes IR, a fridge, a microwave and so on). For those, suggest the closest alternative (an IR blaster, a Wi-Fi sensor).

Then ask which devices to bring under my control, and for each one I pick, do it: I run it from this chat, and you fix whatever annoys me about it. If I say "just diagnose", don't change anything.

Rules that apply to every device
My devices on my network only. If this machine isn't on my home network (a cloud session, a virtual machine, or WSL without mirrored networking), tell me and stop. Discovery order: ping every address in my own subnet one time (check with me first if it's bigger than 256 addresses), then the ARP table (devices that ignore ping still appear there), then mDNS (Bonjour) and SSDP (UPnP), then the router's client list if I've shared its login. If a VPN is running, ask me to pause it, since it can hide my home network. Ask whether I have a guest or IoT network too. Never scan or touch any network that isn't mine.
On macOS, if pings or connections to my devices fail with "No route to host", ask me to allow this app in System Settings > Privacy & Security > Local Network, then try again.
Work on one device at a time, in the order of the list (or the order I choose), and leave the router's Wi-Fi changes for the very end. Either finish a device or tell me it's stuck before moving on to the next.
Backups come first: before changing anything, save each device's current settings in a folder of its own inside "rea-home-devices" in my home folder. That folder stays private because it may hold passwords and tokens: never share or upload it. Keep a README.md and a CLAUDE.md in it listing every tool you built and how to run it, so a fresh chat opened in that folder can pick them up.
Before any change, show me the current value and the new one and wait until I say yes. Read the value back afterwards. Always keep a way to undo each change.
Also write each device's limits (below) into that device's tool cod
```

Creator's prompt, collected for private study. Ask before republishing.
