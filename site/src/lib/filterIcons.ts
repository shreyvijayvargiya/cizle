import {
	Book02Icon, ChartLineData01Icon, Clock01Icon, CodeIcon, Film01Icon, FacebookIcon, FileScriptIcon, GameController01Icon, GiftIcon, Globe02Icon, GridViewIcon, Idea01Icon,
	Image01Icon, InstagramIcon, Layers01Icon, Layout01Icon, LinkedinIcon, LockIcon, Megaphone01Icon, MusicNote01Icon, NewTwitterIcon, Rocket01Icon, ShuffleIcon, SmartPhone01Icon,
	SortByDown01Icon, SortingAZ01Icon, SparklesIcon, SquareIcon, TiktokIcon, Tv01Icon, Video01Icon, YoutubeIcon, GoogleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

/** One icon per dropdown option (landing, skills and gallery filters). Keyed by the option's value or label. */
export const KIND_ICON: Record<string, IconSvgElement> = { "": Layers01Icon, skills: FileScriptIcon, prompts: Video01Icon };
export const FORMAT_ICON: Record<string, IconSvgElement> = { Video: Video01Icon, Image: Image01Icon };
export const ASPECT_ICON: Record<string, IconSvgElement> = { "9:16": SmartPhone01Icon, "16:9": Tv01Icon, "4:5": Image01Icon, "1:1": SquareIcon, Other: GridViewIcon };
export const ACCESS_ICON: Record<string, IconSvgElement> = { free: GiftIcon, premium: LockIcon };
export const SORT_ICON: Record<string, IconSvgElement> = { random: ShuffleIcon, new: Clock01Icon, az: SortingAZ01Icon, short: SortByDown01Icon, long: SortByDown01Icon, rec: SparklesIcon };
const PLATFORM: Record<string, IconSvgElement> = { Meta: FacebookIcon, TikTok: TiktokIcon, Google: GoogleIcon, YouTube: YoutubeIcon, LinkedIn: LinkedinIcon, X: NewTwitterIcon, Instagram: InstagramIcon, Spotify: MusicNote01Icon };
export const platformIcon = (p: string) => PLATFORM[p] ?? Globe02Icon;

const CATEGORY: [RegExp, IconSvgElement][] = [
	[/\bads?\b|advert/i, Megaphone01Icon],
	[/explain|educat|learn|lesson/i, Book02Icon],
	[/idea|story|stories|narrat/i, Idea01Icon],
	[/game|pixel/i, GameController01Icon],
	[/music|song|lyric/i, MusicNote01Icon],
	[/film|cinema|movie/i, Film01Icon],
	[/launch|growth|release|promo/i, Rocket01Icon],
	[/engineer|code|dev/i, CodeIcon],
	[/data|chart|stat/i, ChartLineData01Icon],
	[/saas|product|ui|app|screen/i, Layout01Icon],
	[/3d|lowpoly|cinematic|interactive/i, Layers01Icon],
	[/art|image|poster|design/i, Image01Icon],
	[/motion|video|comparison|reel/i, Video01Icon],
];
export const categoryIcon = (c: string): IconSvgElement => CATEGORY.find(([re]) => re.test(c))?.[1] ?? Layers01Icon;
