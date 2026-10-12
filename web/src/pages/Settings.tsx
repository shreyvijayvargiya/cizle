import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckmarkCircle02Icon, Folder01Icon, Key01Icon, StopIcon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Skeleton, Switch } from "@/components/ui/misc";
import { OptionSelect } from "@/components/ui/select";
import { isAborted, useAbort } from "@/lib/abort";
import { api, useSettings, type Settings } from "@/lib/api";
import { ASPECTS, AUDIO, VOICES } from "@/lib/constants";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
	return (
		<div className="grid gap-1.5 py-3 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
			<div>
				<p className="text-sm font-medium">{label}</p>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</div>
			<div>{children}</div>
		</div>
	);
}

export function SettingsPage() {
	const settings = useSettings();
	const qc = useQueryClient();
	const [form, setForm] = useState<Partial<Settings>>({});
	const [keyInput, setKeyInput] = useState("");
	const [utInput, setUtInput] = useState("");
	useEffect(() => {
		if (settings.data) setForm(settings.data);
	}, [settings.data]);

	const save = useMutation({
		mutationFn: (patch: Partial<Settings>) => api.saveSettings(patch),
		onSuccess: (s) => {
			qc.setQueryData(["settings"], s);
			toast.success("Settings saved");
		},
		onError: (e: Error) => toast.error(e.message),
	});
	const abort = useAbort();
	const test = useMutation({
		mutationFn: () => api.testKey(keyInput || undefined, abort.next()),
		onSuccess: (r) => (r.ok ? toast.success("OpenRouter key works", { description: r.label || undefined }) : toast.error(r.error || "Key rejected")),
		onError: (e: Error) => (isAborted(e) ? toast.info("Test stopped.") : toast.error(e.message)),
	});

	if (!settings.data)
		return (
			<Page title="Settings">
				<Skeleton className="h-64" />
			</Page>
		);
	const s = settings.data;
	const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((f) => ({ ...f, [k]: v }));

	return (
		<Page title="Settings" description="Everything is stored on this machine in data/settings.json. Nothing leaves your computer except the API calls you make.">
			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon={Key01Icon} size={16} /> API keys
						</CardTitle>
						<CardDescription>
							cizle uses <a className="underline" href="https://openrouter.ai/settings/keys" target="_blank" rel="noreferrer">OpenRouter</a> for scripts, screenshot analysis and voice-overs. One key covers all models.
						</CardDescription>
					</CardHeader>
					<CardContent className="divide-y divide-border">
						<Row label="OpenRouter API key" hint="Required">
							<div className="flex flex-col gap-2 sm:flex-row">
								<Input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder={s.openrouter_api_key || "sk-or-v1-…"} autoComplete="off" />
								<div className="flex gap-2">
									{test.isPending ? (
										<Button variant="outline" onClick={abort.stop}>
											<Icon icon={StopIcon} size={13} className="fill-current" /> Stop
										</Button>
									) : (
										<Button variant="outline" onClick={() => test.mutate()} disabled={!keyInput && !s.openrouter_api_key_set}>
											Test
										</Button>
									)}
									<Button
										onClick={() => {
											save.mutate({ openrouter_api_key: keyInput });
											setKeyInput("");
										}}
										disabled={!keyInput || save.isPending}
									>
										Save key
									</Button>
								</div>
							</div>
							<p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
								{s.openrouter_api_key_set ? (
									<>
										<Icon icon={CheckmarkCircle02Icon} size={13} className="text-success" /> Connected {s.openrouter_api_key_source === "env" ? "from your environment (.env)" : "from Settings"}
									</>
								) : (
									"Not set yet"
								)}
							</p>
						</Row>
						<Row label="UploadThing token" hint="Optional — also upload finished videos">
							<div className="flex gap-2">
								<Input type="password" value={utInput} onChange={(e) => setUtInput(e.target.value)} placeholder={s.uploadthing_token || "eyJh…"} autoComplete="off" />
								<Button
									variant="outline"
									onClick={() => {
										save.mutate({ uploadthing_token: utInput });
										setUtInput("");
									}}
									disabled={!utInput}
								>
									Save
								</Button>
							</div>
							{s.uploadthing_token_set ? <Badge tone="success" className="mt-1.5">Uploads on</Badge> : <p className="mt-1.5 text-xs text-muted-foreground">Off — videos stay in data/videos.</p>}
						</Row>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Defaults</CardTitle>
						<CardDescription>Starting values for the composer. You can change them per video.</CardDescription>
					</CardHeader>
					<CardContent className="divide-y divide-border">
						<Row label="Aspect ratio">
							<OptionSelect value={form.aspect || "9:16"} onValueChange={(v) => set("aspect", v as Settings["aspect"])} options={ASPECTS.map((a) => ({ value: a.value, label: `${a.label} — ${a.hint}` }))} />
						</Row>
						<Row label="Audio">
							<OptionSelect value={form.audio || "voice"} onValueChange={(v) => set("audio", v as Settings["audio"])} options={AUDIO.map((a) => ({ value: a.value, label: a.label }))} />
						</Row>
						<Row label="Voice">
							<OptionSelect value={form.voice || "nova"} onValueChange={(v) => set("voice", v)} options={VOICES.map((v) => ({ value: v, label: v }))} />
						</Row>
						<Row label="Length" hint="Seconds, 10–59">
							<Input type="number" min={10} max={59} value={form.duration_sec ?? 30} onChange={(e) => set("duration_sec", Number(e.target.value))} />
						</Row>
						<Row label="Burn in captions" hint="When there's a voice-over">
							<Switch checked={Boolean(form.captions)} onCheckedChange={(v) => set("captions", v)} />
						</Row>
						<Row label="Script model" hint="Any OpenRouter model id">
							<Input value={form.script_model || ""} onChange={(e) => set("script_model", e.target.value)} />
						</Row>
						<Row label="Vision model" hint="Reads screenshots">
							<Input value={form.vision_model || ""} onChange={(e) => set("vision_model", e.target.value)} />
						</Row>
						<Row label="Voice model" hint="Text-to-speech">
							<Input value={form.tts_model || ""} onChange={(e) => set("tts_model", e.target.value)} />
						</Row>
						<Row label="Free script model" hint="Used when the Free switch is on. “auto” picks the best free model OpenRouter lists">
							<Input value={form.free_script_model || ""} onChange={(e) => set("free_script_model", e.target.value)} placeholder="auto" />
						</Row>
						<Row label="Free vision model" hint="Reads screenshots in free mode">
							<Input value={form.free_vision_model || ""} onChange={(e) => set("free_vision_model", e.target.value)} placeholder="auto" />
						</Row>
						<Row label="Keep products fresh" hint="Check repos and sites for changes when cizle starts and every 6 hours">
							<Switch checked={form.auto_sync !== false} onCheckedChange={(v) => set("auto_sync", v)} />
						</Row>
						<div className="flex justify-end pt-4">
							<Button
								onClick={() =>
									save.mutate({
										aspect: form.aspect,
										audio: form.audio,
										voice: form.voice,
										duration_sec: form.duration_sec,
										captions: form.captions,
										script_model: form.script_model,
										vision_model: form.vision_model,
										tts_model: form.tts_model,
										free_script_model: form.free_script_model,
										free_vision_model: form.free_vision_model,
										auto_sync: form.auto_sync,
									})
								}
								disabled={save.isPending}
							>
								Save defaults
							</Button>
						</div>
					</CardContent>
				</Card>

				{s.data_dir ? (
					<div className="flex items-center gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground">
						<Icon icon={Folder01Icon} size={16} /> Videos and settings live in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{s.data_dir}</code>
					</div>
				) : null}
			</div>
		</Page>
	);
}
