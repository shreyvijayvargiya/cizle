/**
 * FFmpeg helpers for the URL → video pipeline: image crops, Ken Burns scene clips,
 * concat, procedural (royalty-free) music + whoosh SFX, and the final audio mix.
 */
import { execFile } from "child_process";
import fsp from "fs/promises";
import path from "path";
import { currentSignal } from "./cancel.js";

export const FPS = 30;

let resolvedFfmpeg = null;

/** Run a binary; resolves stdout, rejects with stderr tail. Returns stderr too for -i probing. */
function run(bin, args, label, timeout = 600_000, cwd) {
	return new Promise((resolve, reject) => {
		execFile(bin, args, { timeout, maxBuffer: 50 * 1024 * 1024, cwd, signal: currentSignal() }, (err, stdout, stderr) => {
			if (err) {
				const se = stderr ? String(stderr).slice(-3000) : "";
				const e = new Error(`${label}: ${err.message}${se ? `\n${se}` : ""}`);
				e.stderr = String(stderr || "");
				reject(e);
				return;
			}
			resolve(String(stdout || ""));
		});
	});
}

async function bundledFfmpegPath() {
	try {
		const mod = await import("ffmpeg-static");
		return mod.default || null;
	} catch {
		return null;
	}
}

/**
 * Pick the first ffmpeg that actually runs: FFMPEG_PATH → system `ffmpeg` → bundled ffmpeg-static.
 * A broken system install (e.g. Homebrew ffmpeg linked against a removed libx265 dylib) is skipped.
 */
export async function ensureFfmpeg() {
	if (resolvedFfmpeg) return resolvedFfmpeg;
	const candidates = [process.env.FFMPEG_PATH?.trim(), "ffmpeg", await bundledFfmpegPath()].filter(Boolean);
	const failures = [];
	for (const bin of [...new Set(candidates)]) {
		try {
			await run(bin, ["-hide_banner", "-version"], "ffmpeg -version", 15_000);
			resolvedFfmpeg = bin;
			console.log(`[cizle] using ffmpeg: ${bin}`);
			return bin;
		} catch (e) {
			failures.push(`${bin}: ${String(e.stderr || e.message).split("\n").find(Boolean)?.slice(0, 200)}`);
		}
	}
	throw new Error(
		`No working ffmpeg found. Tried:\n${failures.join("\n")}\n` +
			"Fix: `npm install` (bundles ffmpeg-static), or `brew reinstall ffmpeg`, or set FFMPEG_PATH.",
	);
}

export async function ffmpeg(args, label, { cwd } = {}) {
	const bin = await ensureFfmpeg();
	return run(bin, ["-hide_banner", "-loglevel", "error", "-y", ...args], label, 600_000, cwd);
}

/**
 * Read width/height from the PNG or JPEG header — no ffprobe needed.
 * @returns {Promise<{ width: number, height: number }>}
 */
export async function probeImageSize(file) {
	const buf = await fsp.readFile(file);
	// PNG: 8-byte signature, then IHDR with width/height as big-endian uint32.
	if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
		return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
	}
	// JPEG: walk segments until a SOFn marker.
	if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
		let i = 2;
		while (i + 9 < buf.length) {
			if (buf[i] !== 0xff) {
				i++;
				continue;
			}
			const marker = buf[i + 1];
			const len = buf.readUInt16BE(i + 2);
			if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
				return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
			}
			i += 2 + len;
		}
	}
	throw new Error(`Unable to read image size of ${path.basename(file)} (not a PNG/JPEG)`);
}

/** Media duration parsed from `ffmpeg -i` output (works without ffprobe). */
export async function probeDurationSec(file) {
	const bin = await ensureFfmpeg();
	// `ffmpeg -i <file>` with no output exits non-zero but prints the container info to stderr.
	const stderr = await new Promise((resolve) =>
		execFile(bin, ["-hide_banner", "-i", file], { timeout: 30_000 }, (_e, _o, se) => resolve(String(se || ""))),
	);
	const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
	return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number.parseFloat(m[3]) : 0;
}

export async function cropImage(input, output, { x, y, width, height }) {
	await ffmpeg(
		["-i", input, "-vf", `crop=${width}:${height}:${x}:${y}`, "-frames:v", "1", output],
		"ffmpeg crop",
	);
}

/** Downscaled JPEG for vision models (keeps request size small). */
export async function toPreviewJpeg(input, output, maxWidth = 1024) {
	await ffmpeg(
		["-i", input, "-vf", `scale='min(${maxWidth},iw)':-2`, "-q:v", "4", "-frames:v", "1", output],
		"ffmpeg preview",
	);
}

/** Small pre-blurred JPEG used as a frame backdrop (CSS blur on full-res images is very slow). */
export async function makeBlurredBackdrop(input, output) {
	await ffmpeg(
		["-i", input, "-vf", "scale=360:-2,boxblur=12:2,eq=saturation=1.2", "-q:v", "5", "-frames:v", "1", output],
		"ffmpeg backdrop",
	);
}

/**
 * Turn one still frame into a scene clip with a camera move.
 * @param {{ input: string, output: string, durationSec: number, width: number, height: number,
 *   motion?: string, focus?: { x: number, y: number } }} p
 */
export async function renderSceneClip({ input, output, durationSec, width, height, motion = "zoom_in", focus }) {
	const frames = Math.max(1, Math.round(durationSec * FPS));
	const fx = clamp01(focus?.x ?? 0.5);
	const fy = clamp01(focus?.y ?? 0.5);
	const maxZ = 1.12;
	const step = ((maxZ - 1) / frames).toFixed(6);
	// Centre the crop window on the focus point while staying inside the frame.
	const xExpr = `max(0,min(iw-iw/zoom,${fx}*iw-iw/zoom/2))`;
	const yExpr = `max(0,min(ih-ih/zoom,${fy}*ih-ih/zoom/2))`;
	let z;
	let x = xExpr;
	let y = yExpr;
	switch (motion) {
		case "zoom_out":
			z = `max(${maxZ}-on*${step},1)`;
			break;
		case "pan_down":
			z = "1.15";
			x = "(iw-iw/zoom)/2";
			y = `(ih-ih/zoom)*on/${frames}`;
			break;
		case "pan_up":
			z = "1.15";
			x = "(iw-iw/zoom)/2";
			y = `(ih-ih/zoom)*(1-on/${frames})`;
			break;
		case "static":
			z = `1+on*${(0.02 / frames).toFixed(6)}`;
			break;
		default:
			z = `min(1+on*${step},${maxZ})`;
	}
	const fade = Math.min(0.35, durationSec / 4).toFixed(2);
	const fadeOutStart = Math.max(0, durationSec - Number(fade)).toFixed(2);
	// Upscale 2x before zoompan so sub-pixel motion does not jitter.
	const vf = [
		`scale=${width * 2}:${height * 2}:flags=lanczos`,
		`zoompan=z='${z}':x='${x}':y='${y}':d=${frames}:s=${width}x${height}:fps=${FPS}`,
		`fade=t=in:st=0:d=${fade}`,
		`fade=t=out:st=${fadeOutStart}:d=${fade}`,
		"format=yuv420p",
	].join(",");
	await ffmpeg(
		["-loop", "1", "-i", input, "-vf", vf, "-frames:v", String(frames), "-r", String(FPS), "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-an", output],
		"ffmpeg scene clip",
	);
}

/**
 * A scene clip from captured animation frames (dir/0000.jpg…). Each captured frame is shown for two output frames
 * (animating "on twos", crisp rather than blended); if the scene is longer than the capture, the last frame is held.
 */
export async function renderAnimatedClip({ dir, fps, output, durationSec, captureSec, width, height }) {
	const hold = Math.max(0, durationSec - captureSec);
	const fade = Math.min(0.12, durationSec / 10).toFixed(2); // short: the styled backdrops are bright, a long dip to black looks dingy
	const fadeOutStart = Math.max(0, durationSec - Number(fade)).toFixed(2);
	const vf = [
		`scale=${width}:${height}`,
		`fps=${FPS}`,
		hold > 0.01 ? `tpad=stop_mode=clone:stop_duration=${hold.toFixed(3)}` : null,
		`fade=t=in:st=0:d=${fade}`,
		`fade=t=out:st=${fadeOutStart}:d=${fade}`,
		"format=yuv420p",
	]
		.filter(Boolean)
		.join(",");
	await ffmpeg(
		["-framerate", String(fps), "-i", `${dir}/%04d.jpg`, "-vf", vf, "-t", durationSec.toFixed(3), "-r", String(FPS), "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-an", output],
		"ffmpeg animated clip",
	);
}

export async function concatClips(clips, output, workDir) {
	const listFile = path.join(workDir, "concat.txt");
	await fsp.writeFile(listFile, clips.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join("\n"));
	await ffmpeg(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", output], "ffmpeg concat");
}

/** Pad/trim a narration file to an exact scene length (stereo 44.1 kHz). */
export async function fitAudioToDuration(input, output, durationSec, leadInSec = 0.25) {
	const delayMs = Math.round(leadInSec * 1000);
	await ffmpeg(
		["-i", input, "-af", `aresample=44100,aformat=channel_layouts=stereo,adelay=${delayMs}|${delayMs},apad,atrim=0:${durationSec.toFixed(3)}`, "-c:a", "pcm_s16le", output],
		"ffmpeg fit narration",
	);
}

export async function silence(output, durationSec) {
	await ffmpeg(
		["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", durationSec.toFixed(3), "-c:a", "pcm_s16le", output],
		"ffmpeg silence",
	);
}

export async function concatAudio(files, output, workDir) {
	const listFile = path.join(workDir, "concat-audio.txt");
	await fsp.writeFile(listFile, files.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join("\n"));
	await ffmpeg(["-f", "concat", "-safe", "0", "-i", listFile, "-c:a", "pcm_s16le", output], "ffmpeg concat audio");
}

const MOOD_PROGRESSIONS = {
	// Root frequencies (Hz) of a four-chord loop; each chord = root, major/minor third, fifth, octave.
	uplifting: [[261.63, "maj"], [196.0, "maj"], [220.0, "min"], [174.61, "maj"]], // C G Am F
	energetic: [[220.0, "min"], [174.61, "maj"], [261.63, "maj"], [196.0, "maj"]], // Am F C G
	calm: [[174.61, "maj7"], [220.0, "min7"], [196.0, "maj"], [261.63, "maj7"]],
	cinematic: [[146.83, "min"], [116.54, "maj"], [174.61, "maj"], [130.81, "maj"]], // Dm Bb F C
	techy: [[164.81, "min"], [130.81, "maj"], [196.0, "maj"], [146.83, "maj"]], // Em C G D
	playful: [[196.0, "maj"], [246.94, "min"], [261.63, "maj"], [293.66, "maj"]],
};
const INTERVALS = { maj: [1, 1.26, 1.498, 2], min: [1, 1.189, 1.498, 2], maj7: [1, 1.26, 1.498, 1.888], min7: [1, 1.189, 1.498, 1.782] };

/**
 * Procedurally generated ambient pad + soft pulse — free, offline, no licensing.
 * @param {{ output: string, durationSec: number, mood?: string, bpm?: number }} p
 */
export async function generateMusic({ output, durationSec, mood = "uplifting", bpm = 100 }) {
	const prog = MOOD_PROGRESSIONS[mood] || MOOD_PROGRESSIONS.uplifting;
	const beat = 60 / Math.min(140, Math.max(70, Number(bpm) || 100));
	const chordLen = beat * 8; // two bars per chord
	const cycle = chordLen * prog.length;
	// Each chord is gated by a smooth window so frequency changes never click.
	const terms = prog.map(([root, quality], i) => {
		const tones = INTERVALS[quality]
			.map((m, k) => `${(0.5 / (k + 1)).toFixed(3)}*sin(2*PI*${(root * m).toFixed(2)}*t)`)
			.join("+");
		const gate = `between(mod(t,${cycle.toFixed(3)}),${(i * chordLen).toFixed(3)},${((i + 1) * chordLen).toFixed(3)})*pow(sin(PI*mod(t,${chordLen.toFixed(3)})/${chordLen.toFixed(3)}),0.6)`;
		return `${gate}*(${tones})`;
	});
	const bassTerms = prog.map(([root], i) => {
		const gate = `between(mod(t,${cycle.toFixed(3)}),${(i * chordLen).toFixed(3)},${((i + 1) * chordLen).toFixed(3)})`;
		// Plucked bass note on every beat: exponential decay envelope.
		return `${gate}*0.35*exp(-6*mod(t,${beat.toFixed(4)}))*sin(2*PI*${(root / 2).toFixed(2)}*t)`;
	});
	const expr = `0.22*(${terms.join("+")})+${bassTerms.join("+")}`;
	const fadeOut = Math.max(0, durationSec - 2.5).toFixed(2);
	await ffmpeg(
		["-f", "lavfi", "-i", `aevalsrc='${expr}':s=44100:d=${durationSec.toFixed(2)}`, "-af", `lowpass=f=2400,aecho=0.8:0.6:60|120:0.25|0.15,afade=t=in:d=1.5,afade=t=out:st=${fadeOut}:d=2.5,aformat=channel_layouts=stereo,volume=0.9`, "-c:a", "pcm_s16le", output],
		"ffmpeg generate music",
	);
}

/** Short filtered-noise whoosh for scene transitions. */
export async function generateWhoosh(output) {
	await ffmpeg(
		["-f", "lavfi", "-i", "anoisesrc=d=0.7:c=pink:r=44100:a=0.6", "-af", "highpass=f=400,lowpass=f=5000,afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.35,aformat=channel_layouts=stereo,volume=0.35", "-c:a", "pcm_s16le", output],
		"ffmpeg whoosh",
	);
}

/**
 * Mix narration (full length), music (looped + ducked under the voice) and transition whooshes.
 * @param {{ narration: string, music?: string|null, whoosh?: string|null, whooshAtSec?: number[],
 *   durationSec: number, output: string, musicVolume?: number }} p
 */
export async function mixAudio({ narration, music, whoosh, whooshAtSec = [], durationSec, output, musicVolume = 0.18 }) {
	const args = ["-i", narration];
	const filters = ["[0:a]aformat=sample_rates=44100:channel_layouts=stereo,asplit=2[voice][sc]"];
	const mixInputs = ["[voice]"];
	let idx = 1;
	if (music) {
		args.push("-stream_loop", "-1", "-i", music);
		const fadeOut = Math.max(0, durationSec - 2).toFixed(2);
		filters.push(
			`[${idx}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:${durationSec.toFixed(3)},asetpts=N/SR/TB,volume=${musicVolume},afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[mus]`,
			"[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[ducked]",
		);
		mixInputs.push("[ducked]");
		idx++;
	} else {
		filters.push("[sc]anullsink");
	}
	if (whoosh && whooshAtSec.length) {
		args.push("-i", whoosh);
		const labels = whooshAtSec.map((_, i) => `[w${i}]`);
		filters.push(`[${idx}:a]asplit=${whooshAtSec.length}${labels.join("")}`);
		whooshAtSec.forEach((t, i) => {
			const ms = Math.max(0, Math.round((t - 0.35) * 1000));
			filters.push(`[w${i}]adelay=${ms}|${ms}[wd${i}]`);
			mixInputs.push(`[wd${i}]`);
		});
	}
	filters.push(
		`${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=first:normalize=0,alimiter=limit=0.95,atrim=0:${durationSec.toFixed(3)}[out]`,
	);
	await ffmpeg(
		[...args, "-filter_complex", filters.join(";"), "-map", "[out]", "-c:a", "aac", "-b:a", "192k", output],
		"ffmpeg mix audio",
	);
}

/**
 * Final MP4. Captions are burned from an ASS file referenced by bare file name with FFmpeg's
 * working directory set to its folder, so the filter string has no path, quotes, colons or commas.
 * If burning fails (e.g. a build without libass), the video is still produced without it.
 * @returns {Promise<{ burned: boolean, burnError?: string }>}
 */
export async function muxFinal({ video, audio, output, ass, burnCaptions = false }) {
	if (!audio) {
		// Silent short: keep the H.264 stream as-is, just move the moov atom for web playback.
		await ffmpeg(["-i", video, "-c:v", "copy", "-an", "-movflags", "+faststart", output], "ffmpeg finalize silent");
		return { burned: false };
	}
	const tail = ["-map", "0:v:0", "-map", "1:a:0", "-c:a", "copy", "-shortest", "-movflags", "+faststart", output];
	if (burnCaptions && ass) {
		try {
			await ffmpeg(
				["-i", video, "-i", audio, "-vf", `ass=${path.basename(ass)}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", ...tail],
				"ffmpeg mux final (burn captions)",
				{ cwd: path.dirname(ass) },
			);
			return { burned: true };
		} catch (e) {
			await ffmpeg(["-i", video, "-i", audio, "-c:v", "copy", ...tail], "ffmpeg mux final");
			return { burned: false, burnError: e.message };
		}
	}
	await ffmpeg(["-i", video, "-i", audio, "-c:v", "copy", ...tail], "ffmpeg mux final");
	return { burned: false };
}

function clamp01(n) {
	const v = Number(n);
	return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5;
}
