/**
 * Languages the library can hold. A harvest version records a language code for every prompt and skill; this table gives each code a name,
 * its own-language name, a flag and a reading direction. Later versions (v5, v6, v7 ... up to 100+ languages) only need their codes to be here;
 * a code that is not listed still works (shown with a globe and the code).
 */
type Row = [code: string, name: string, native: string, flag: string, rtl?: 1];
const ROWS: Row[] = [
	["en", "English", "English", "🇬🇧"], ["zh", "Chinese", "中文", "🇨🇳"], ["ja", "Japanese", "日本語", "🇯🇵"], ["ko", "Korean", "한국어", "🇰🇷"],
	["es", "Spanish", "Español", "🇪🇸"], ["fr", "French", "Français", "🇫🇷"], ["de", "German", "Deutsch", "🇩🇪"], ["pt", "Portuguese", "Português", "🇧🇷"],
	["it", "Italian", "Italiano", "🇮🇹"], ["ru", "Russian", "Русский", "🇷🇺"], ["ar", "Arabic", "العربية", "🇸🇦", 1], ["hi", "Hindi", "हिन्दी", "🇮🇳"],
	["bn", "Bengali", "বাংলা", "🇧🇩"], ["ur", "Urdu", "اردو", "🇵🇰", 1], ["fa", "Persian", "فارسی", "🇮🇷", 1], ["he", "Hebrew", "עברית", "🇮🇱", 1],
	["tr", "Turkish", "Türkçe", "🇹🇷"], ["vi", "Vietnamese", "Tiếng Việt", "🇻🇳"], ["th", "Thai", "ไทย", "🇹🇭"], ["id", "Indonesian", "Bahasa Indonesia", "🇮🇩"],
	["ms", "Malay", "Bahasa Melayu", "🇲🇾"], ["fil", "Filipino", "Filipino", "🇵🇭"], ["nl", "Dutch", "Nederlands", "🇳🇱"], ["pl", "Polish", "Polski", "🇵🇱"],
	["uk", "Ukrainian", "Українська", "🇺🇦"], ["cs", "Czech", "Čeština", "🇨🇿"], ["sk", "Slovak", "Slovenčina", "🇸🇰"], ["hu", "Hungarian", "Magyar", "🇭🇺"],
	["ro", "Romanian", "Română", "🇷🇴"], ["bg", "Bulgarian", "Български", "🇧🇬"], ["sr", "Serbian", "Српски", "🇷🇸"], ["hr", "Croatian", "Hrvatski", "🇭🇷"],
	["sl", "Slovenian", "Slovenščina", "🇸🇮"], ["el", "Greek", "Ελληνικά", "🇬🇷"], ["sv", "Swedish", "Svenska", "🇸🇪"], ["da", "Danish", "Dansk", "🇩🇰"],
	["no", "Norwegian", "Norsk", "🇳🇴"], ["fi", "Finnish", "Suomi", "🇫🇮"], ["is", "Icelandic", "Íslenska", "🇮🇸"], ["et", "Estonian", "Eesti", "🇪🇪"],
	["lv", "Latvian", "Latviešu", "🇱🇻"], ["lt", "Lithuanian", "Lietuvių", "🇱🇹"], ["ga", "Irish", "Gaeilge", "🇮🇪"], ["cy", "Welsh", "Cymraeg", "🏴"],
	["ca", "Catalan", "Català", "🇪🇸"], ["gl", "Galician", "Galego", "🇪🇸"], ["eu", "Basque", "Euskara", "🇪🇸"], ["mt", "Maltese", "Malti", "🇲🇹"],
	["sq", "Albanian", "Shqip", "🇦🇱"], ["mk", "Macedonian", "Македонски", "🇲🇰"], ["bs", "Bosnian", "Bosanski", "🇧🇦"], ["be", "Belarusian", "Беларуская", "🇧🇾"],
	["ka", "Georgian", "ქართული", "🇬🇪"], ["hy", "Armenian", "Հայերեն", "🇦🇲"], ["az", "Azerbaijani", "Azərbaycanca", "🇦🇿"], ["kk", "Kazakh", "Қазақша", "🇰🇿"],
	["uz", "Uzbek", "Oʻzbekcha", "🇺🇿"], ["ky", "Kyrgyz", "Кыргызча", "🇰🇬"], ["tg", "Tajik", "Тоҷикӣ", "🇹🇯"], ["mn", "Mongolian", "Монгол", "🇲🇳"],
	["ta", "Tamil", "தமிழ்", "🇮🇳"], ["te", "Telugu", "తెలుగు", "🇮🇳"], ["kn", "Kannada", "ಕನ್ನಡ", "🇮🇳"], ["ml", "Malayalam", "മലയാളം", "🇮🇳"],
	["mr", "Marathi", "मराठी", "🇮🇳"], ["gu", "Gujarati", "ગુજરાતી", "🇮🇳"], ["pa", "Punjabi", "ਪੰਜਾਬੀ", "🇮🇳"], ["or", "Odia", "ଓଡ଼ିଆ", "🇮🇳"],
	["as", "Assamese", "অসমীয়া", "🇮🇳"], ["ne", "Nepali", "नेपाली", "🇳🇵"], ["si", "Sinhala", "සිංහල", "🇱🇰"], ["my", "Burmese", "မြန်မာ", "🇲🇲"],
	["km", "Khmer", "ខ្មែរ", "🇰🇭"], ["lo", "Lao", "ລາວ", "🇱🇦"], ["ps", "Pashto", "پښتو", "🇦🇫", 1], ["ku", "Kurdish", "Kurdî", "🇮🇶"],
	["sw", "Swahili", "Kiswahili", "🇰🇪"], ["am", "Amharic", "አማርኛ", "🇪🇹"], ["ha", "Hausa", "Hausa", "🇳🇬"], ["yo", "Yoruba", "Yorùbá", "🇳🇬"],
	["ig", "Igbo", "Igbo", "🇳🇬"], ["zu", "Zulu", "isiZulu", "🇿🇦"], ["xh", "Xhosa", "isiXhosa", "🇿🇦"], ["af", "Afrikaans", "Afrikaans", "🇿🇦"],
	["so", "Somali", "Soomaali", "🇸🇴"], ["rw", "Kinyarwanda", "Kinyarwanda", "🇷🇼"], ["mg", "Malagasy", "Malagasy", "🇲🇬"], ["sn", "Shona", "chiShona", "🇿🇼"],
	["ht", "Haitian Creole", "Kreyòl ayisyen", "🇭🇹"], ["la", "Latin", "Latina", "🏛️"], ["eo", "Esperanto", "Esperanto", "🏳️"], ["jv", "Javanese", "Basa Jawa", "🇮🇩"],
	["su", "Sundanese", "Basa Sunda", "🇮🇩"], ["ceb", "Cebuano", "Cebuano", "🇵🇭"], ["mi", "Māori", "Te Reo Māori", "🇳🇿"], ["haw", "Hawaiian", "ʻŌlelo Hawaiʻi", "🇺🇸"],
	["sm", "Samoan", "Gagana Samoa", "🇼🇸"], ["to", "Tongan", "Lea faka-Tonga", "🇹🇴"], ["fj", "Fijian", "Vosa Vakaviti", "🇫🇯"], ["qu", "Quechua", "Runa Simi", "🇵🇪"],
	["gn", "Guaraní", "Avañeʼẽ", "🇵🇾"], ["zh-tw", "Chinese (Traditional)", "繁體中文", "🇹🇼"], ["yue", "Cantonese", "粵語", "🇭🇰"], ["bo", "Tibetan", "བོད་སྐད།", "🏔️"],
	["ug", "Uyghur", "ئۇيغۇرچە", "🇨🇳", 1], ["dv", "Dhivehi", "ދިވެހި", "🇲🇻", 1], ["yi", "Yiddish", "ייִדיש", "🇮🇱", 1], ["sd", "Sindhi", "سنڌي", "🇵🇰", 1],
];
export type Language = { code: string; name: string; native: string; flag: string; rtl: boolean };
const BY_CODE = new Map<string, Language>(ROWS.map(([code, name, native, flag, rtl]) => [code, { code, name, native, flag, rtl: Boolean(rtl) }]));
export const ALL_LANGUAGES: Language[] = [...BY_CODE.values()];
/** A language by code (case and region tolerant: "pt-BR" → "pt"). Unknown codes get a globe and the code itself. */
export function languageOf(code?: string | null): Language {
	const c = String(code || "en").toLowerCase();
	return BY_CODE.get(c) ?? BY_CODE.get(c.split("-")[0]) ?? { code: c, name: c.toUpperCase(), native: c.toUpperCase(), flag: "🌐", rtl: false };
}
export const isRtl = (code?: string | null) => languageOf(code).rtl;
