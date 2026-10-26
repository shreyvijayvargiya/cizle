/**
 * English only. The gallery and the skills are shown in English: harvested rows get an English category and title, a Latin handle in place of a
 * non-Latin display name, and the few foreign-language lines inside otherwise English prompts are replaced by their English meaning.
 * Used by gallery-normalize.mjs (all rows) and server/harvest/gallery-v3.mjs (new rows).
 */
export const NON_LATIN = /[぀-ヿ㐀-鿿가-힯؀-ۿ฀-๿Ѐ-ӿ＀-￯　-〿]/;

const CATEGORY = { "短动效": "motion graphics", "知识讲解": "explainer", "产品宣传": "product promo", "叙事短片": "story short", "3D 与交互": "3d interactive", "像素与角色": "pixel characters", "音乐与歌词": "music video" };
const TITLE = {
	"Seedance 2.0 提示词：Nike Basketball Sprint": "Seedance 2.0 prompt: Nike Basketball Sprint",
	"Prompt de video: Reina al estilo Conan el Bárbaro con panteras": "Conan the Barbarian-style queen with panthers (video prompt)",
	"The exact same character from the reference image @画像1 — 100%…": "The exact same character from the reference image @image1 — 100%…",
};
/** Exact foreign strings inside prompts → English. Longest first. */
const TEXT = [
	["逐帧手绘 / 线条沸腾 Cel Animation / Frame-by-Frame & Line Boil", "Cel Animation / Frame-by-Frame & Line Boil"],
	["手绘逐帧或在矢量动画上叠加逐帧质感，标志性特征是 line boil——线条每隔几帧轻微抖动，仿佛画面在'呼吸'。Giant Ant、Buck 等工作室大量使用 cel 元素（烟、水花、速度线）点缀主动画，反数字精致感的核心手段。", "Hand-drawn frame by frame, or frame-by-frame texture layered on vector animation. The signature is line boil: lines wobble slightly every few frames, as if the picture were breathing. Studios such as Giant Ant and Buck dress the main animation with cel elements (smoke, splashes, speed lines); it is the core device against digital polish."],
	["视觉特征 线条持续微抖(boil), 一拍二/一拍三节奏, smear拖影帧, 手绘烟火水花点缀, 纸纹底", "Visual traits: continuously wobbling lines (boil), animating on twos and threes, smear frames, hand-drawn smoke and splash accents, paper-grain base"],
	["关键技法 打帧节奏：24fps 下'一拍二'（实际12fps）为主，快动作切'一拍一'，静止镜头'一拍三'", "Key technique, frame timing: at 24 fps mostly on twos (effectively 12 fps), fast action on ones, held shots on threes"],
	["line boil 伪造法：AE 用 Turbulent Displace（数量2~5、大小50）+ 每 2 帧随机化 evolution + Posterize Time 12fps；真 boil 则画 3~4 张微差线稿循环", "Faking line boil: in After Effects use Turbulent Displace (amount 2-5, size 50), randomise the evolution every 2 frames and apply Posterize Time at 12 fps; for a real boil, draw a loop of 3-4 slightly different line drawings"],
	["smear frame：快速位移的", "smear frame: for fast movement"],
	["top 抖音/B站 designer accounts", "top Douyin/Bilibili designer accounts"],
	["「墨戏」", "INK PLAY"],
	["「がんばれ！ がんばれー！」", "\"Go for it! Go for it!\""], ["「その調子！ もう少し！」", "\"That's the way! Almost there!\""], ["「がんばって！ 負けないで！」", "\"Do your best! Don't lose!\""], ["「いけるよ！ いける！」", "\"You can do it! You can!\""], ["「やったー！ よくできました！」", "\"We did it! Well done!\""],
	["開幕 (Kickoff)", "Kickoff"], ["攻撃 (Attack)", "Attack"], ["緊迫 (Tension)", "Tension"], ["決着 (Goal)", "Goal"],
	["「世界が見ている、この一瞬を」", "\"The world is watching this one moment\""], ["「月影が完璧に跳ね返す！」", "\"Tsukikage deflects it perfectly!\""], ["「まだ終わらせない」", "\"I'm not finished yet\""], ["「これが最後のチャンスか！」", "\"Is this the last chance?!\""],
	["\"다녀왔어요.\"", "\"I'm home.\""], ["\"오늘 많이 배고프네요.\"", "\"I'm so hungry today.\""], ["\"언니~\"", "\"Sis~\""], ["\"왜?\"", "\"What?\""], ["\"잘 먹겠습니다.\"", "\"Thank you for the meal.\""], ["\"이제 양치해야지.\"", "\"Time to brush my teeth now.\""], ["\"오늘 피부가 조금 좋아 보이는 것 같아요.\"", "\"My skin looks a little better today.\""], ["\"샤워하니까 정말 개운해.\"", "\"A shower feels so refreshing.\""], ["\"영화 볼래?\"", "\"Want to watch a movie?\""], ["\"좋아요.\"", "\"Sure.\""], ["\"오늘도 함께해줘서 정말 고마워요. 좋은 꿈 꾸세요.\"", "\"Thank you for being with me again today. Sweet dreams.\""],
	["@画像1", "@image1"],
	["[作者补充制作说明]", "[Author's production notes]"], ["“오늘 농장에 왔어요.”", "“I came to the farm today.”"], ["\"너한테 잘 어울려.\"", "\"It really suits you.\""], ["\"정말?\"", "\"Really?\""],
	["\"魔障降临......启动诛邪令\"", "\"The demonic barrier descends... activate the exorcism order\""], ["動態設計師", "Motion Designer"], ["動態設計", "Dynamic design"], ["西尾泰和(NISHIO Hirokazu)の活動", "NISHIO Hirokazu's work"], ["- 功績", "- Achievements"],
	["\"春風駅 / Harukaze Station\"", "\"Harukaze Station\""], ["(はるかぜ / Harukaze, with neighbouring stations)", "(Harukaze, with neighbouring stations)"], ["\"春風駅\"", "\"Harukaze Station\""], ["\"止まれ\"", "\"STOP\""],
	["「ネットに潜れば、真実が見える。でも見えすぎると、もう戻れない。私はとっくに戻る場所をなくした。」", "\"If you dive into the net, you can see the truth. But if you see too much, you can never go back. I lost the place I could return to long ago.\""],
	["「ねぇ、15秒でパリ全部見せるね。」", "\"Hey, I'll show you all of Paris in 15 seconds.\""], ["「ヤバい、映画みたい！！」", "\"No way, it's like a movie!!\""], ["「パリ、大好き。」", "\"I love Paris.\""], ["「ねぇ… ロンドン、一緒に旅しよ？」", "\"Hey... London, want to travel together?\""],
	["\"드디어 도쿄에 왔어요...!\"", "\"I'm finally in Tokyo...!\""], ["\"뜨거워! 진짜 맛있어!\"", "\"It's hot! It's so good!\""], ["\"이런 야경은 처음 보는 것 같아요.\"", "\"I think this is the first time I've seen a night view like this.\""],
	["\"물이 시원해서 좋다\"", "\"The water is cool and nice\""], ["\"너도 들어와!\"", "\"You come in too!\""],
	["“오늘 중국 무술을 배워볼 거예요!”", "“Today I'm going to try learning Chinese martial arts!”"], ["“생각보다 어렵지만 정말 재미있었어요!”", "“It was harder than I thought, but really fun!”"],
	["“오늘은 일본 무술을 직접 배워볼게요!”", "“Today I'm going to learn Japanese martial arts myself!”"], ["“생각보다 어렵지만 정말 재미있어요!”", "“It's harder than I thought, but really fun!”"],
	["\"잠깐, 바다가 보여요!\"", "\"Wait, I can see the sea!\""], ["\"생각보다 훨씬 무거운데요?\"", "\"It's much heavier than I thought?\""], ["\"우와, 진짜 크다!\"", "\"Wow, it's really big!\""], ["\"오늘 진짜 재밌었다. 다음에 또 올게요. 안녕!\"", "\"That was really fun today. I'll come again next time. Bye!\""],
	["{定時だ…捕まったら終わり。}", "{Quitting time... if I get caught, it's over.}"], ["{来ないで…こっち見ないで。}", "{Don't come... don't look this way.}"], ["{なぎさん、追加の仕事が…}", "{Nagi-san, there's extra work...}"], ["{今だけは無理…！}", "{Not now, please...!}"],
	["「卍解……花天狂骨枯松心中。」", "\"Bankai... Katen Kyokotsu: Karamatsu Shinju.\""],
	["“아… 배고프다.”", "“Ah... I'm hungry.”"], ["“뭐 먹을래?”", "“What do you want to eat?”"], ["“잠깐만…”", "“Wait a moment...”"], ["“어서 오세요.”", "“Welcome.”"], ["“안녕하세요.”", "“Hello.”"], ["“야…”", "“Hey...”"], ["“안 떨어졌잖아.”", "“It didn't fall off.”"], ["“와… 맛있겠다.”", "“Wow... that looks delicious.”"],
	["黒鉛の粒", "graphite grain"], ["黒鉛の層", "graphite layers"], ["炭素の六角形", "carbon hexagon"], ["炭素原子", "carbon atom"], ["\"鉛筆\"", "\"pencil\""], ["\"芯\"", "\"lead\""],
	["(立涌, 青海波, 麻の葉 …)", "(Tatewaku, Seigaiha, Asanoha …)"], ["群青", "Gunjo (ultramarine)"], ["濃紺", "Konkon (deep navy)"], ["山吹", "Yamabuki (golden yellow)"], ["生成", "Kinari (ecru)"], ["臙脂", "Enji (crimson)"], ["深緑", "Fukamidori (deep green)"], ["萌黄", "Moegi (spring green)"],
	["\"見て、でっか！\"", "\"Look, it's huge!\""], ["\"俺はこっち\"", "\"I'll take this side.\""], ["\"ついてるよ\"", "\"You've got something on you\""],
];

const PUNCT = [["【", "["], ["】", "]"], ["「", "\""], ["」", "\""], ["『", "\""], ["』", "\""], ["・", "- "], ["！", "!"], ["？", "?"], ["：", ": "], ["，", ", "], ["（", "("], ["）", ")"], ["、", ", "], ["。", ". "]];

export function englishText(text) {
	let t = String(text ?? "");
	for (const [from, to] of TEXT.sort((a, b) => b[0].length - a[0].length)) t = t.split(from).join(to);
	for (const [from, to] of PUNCT) t = t.split(from).join(to);
	return t;
}

/** One gallery row (a copy): English category and title, Latin handle instead of a non-Latin display name, English text. */
export function englishRow(row) {
	const e = { ...row };
	if (e.category && CATEGORY[e.category]) e.category = CATEGORY[e.category];
	else if (e.category && NON_LATIN.test(e.category)) e.category = "other";
	if (e.title && TITLE[e.title]) e.title = TITLE[e.title];
	if (e.author?.name && NON_LATIN.test(e.author.name)) e.author = { ...e.author, name: null };
	e.tags = (e.tags || []).filter((t) => !NON_LATIN.test(t));
	if (e.text) e.text = englishText(e.text);
	return e;
}
