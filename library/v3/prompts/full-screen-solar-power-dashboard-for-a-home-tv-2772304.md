# Full-screen solar power dashboard for a home TV

By @leopardracer
Language: ? · Domains: product, data, science · Source: V04

Original post: https://x.com/leopardracer/status/2113571629422772304

Source page: https://data.openchamber.dev/opus-5-5-videos/v/leopardracer-2113571629422772304

Demo video: https://video.twimg.com/amplify_video/2113571200756588544/vid/avc1/1280x720/Ggw6O7OQpf-i5UEv.mp4?tag=29

```
These are my own solar, battery and home devices on my home network, but I don't know all their brands and models.
If you can't run commands on this computer (you're not Claude Code or a similar agent), say so in one line, tell me to paste this into Claude Code on a computer on my home Wi-Fi, and stop.
Goal: a live full-screen dashboard on my TV that shows my solar power, my house and the weather, and switches screens when I ask out loud.

Find my energy devices. Check my own subnet only (one ping per address; ask me first if it has more than 256 addresses), then the ARP table, mDNS (Bonjour) and SSDP (UPnP). Look for the inverter, battery, smart meter, EV charger, boiler or heat pump and any temperature sensors. For each one, tell me what it is, with brand and model where you can, how sure you are, and how its live data can be read: local API, Modbus TCP, Home Assistant, or the maker's cloud API. If I already run Home Assistant, ask me for it first and use it as the main source.

List what you found and ask what I have that isn't on the network. For anything missing, offer the next best option (a smart plug with metering, a Wi-Fi sensor, the maker's cloud API).
Ask me my city for the weather. Use a free forecast source with no account (Open-Meteo or similar).
Build the dashboard as one local web page plus a small local server, made for a 4K TV seen from the sofa: dark background, big numbers, live updates every few seconds. Three screens:Solar: live power flow between roof, house, battery, grid and boiler, plus today's kWh made, used, sent to the grid and % self-sufficient, battery %, a forecast for the next days, and a year history.
Climate: inside and outside temperature and humidity, plus every room I have a sensor for, with graphs.
Weather: now, the next 24 hours, 14 days, sunrise and sunset, and air quality if it's available.
The screens rotate on their own every 30 seconds and can be switched by URL (/solar, /climate, /weather).

Ask what's plugged into my TV (a smart TV browser, Apple TV, Chromecast, a mini PC over HDMI) and get the dashboard showing full screen on it, opening by itself after a restart.
Voice: ask what I use (Siri, Google, Home Assistant Assist). Set up a phrase like show my solar on my TV that opens the right screen, and a short spoken answer with today's real numbers.
Rules
Only my own devices on my own network. If this computer isn't on my home network (a cloud session, a virtual machine, or WSL without mirrored networking), say so and stop. Never scan or touch any other network.
Read only. Never change a setting on the inverter, battery, charger or meter, even if I ask in passing. If something can only be read by changing a setting, explain it and wait for my yes.
Passwords and tokens never go into the chat. Give me one command to run in my own terminal that saves each one to the system keychain, then read it inside your scripts without printing it.
Keep everything in a solar-tv folder in my home
```

Creator's prompt, collected for private study. Ask before republishing.
