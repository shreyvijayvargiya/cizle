# Audio harvest

Background music, sound effects and ambience for AI video agents. Own version line (`audio/v1`, `v2`, ...), separate from the prompt harvests.

```bash
node audio/harvest.mjs --target 200 --batch 25      # fetch, enrich, store (resumable: stored ids are skipped)
cd site && npm run audio                             # public/audio.json + public/audio/v1/*.mp3 (also part of `npm run content`)
```

- Sources: `sources.v1.graph.json` (A01 Wikimedia Commons, A02 ccMixter; rejected ones are listed with the reason).
- Only CC0, public domain, CC BY and CC BY-SA. Credit and licence are kept on every record and shown in the site and MCP.
- Per clip: the original (ogg/oga/opus/mp3/wav as the source has it) in `v1/original/`, a 96 kbps MP3 preview (first 90 s) in `v1/preview/`, one line in `v1/records.jsonl`.
- Enrich: ffprobe (duration, codec, rate, channels), ffmpeg `volumedetect` (silent files dropped), length class, a usage prompt built from name, tags and description.
- A clip that does not download or decode, has no name, or repeats a stored file (sha1) or name is dropped. Log: `v1/harvest.log`.
- `original/` and `preview/` are git-ignored; the site build copies the previews into `site/public/audio/v1/`.
