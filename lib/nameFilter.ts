const BLOCKED_EXACT_WORDS = new Set([
  // Adult / 18+ / Sexual / Slurs
  "porn",
  "porno",
  "pornhub",
  "xxx",
  "nsfw",
  "hentai",
  "erotic",
  "nude",
  "nudes",
  "naked",
  "boob",
  "boobs",
  "booby",
  "boobies",
  "tits",
  "titties",
  "tit",
  "vagina",
  "penis",
  "dick",
  "cock",
  "pussy",
  "asshole",
  "bitch",
  "bastard",
  "slut",
  "whore",
  "fuck",
  "fucker",
  "fucking",
  "shit",
  "cunt",
  "cum",
  "jizz",
  "blowjob",
  "handjob",
  "anal",
  "anus",
  "rape",
  "rapist",
  "molest",
  "pedophile",
  "pedo",
  "chutiya",
  "bc",
  "mc",
  "bhosdike",
  "gaand",
  "gandu",
  "randi",
  "lauda",
  "lund",
  "chut",

  // Alcohol / Daaru / Drinks
  "daaru",
  "daru",
  "sharab",
  "sharaab",
  "alcohol",
  "liquor",
  "booze",
  "beer",
  "vodka",
  "whiskey",
  "whisky",
  "rum",
  "gin",
  "tequila",
  "wine",
  "scotch",
  "brandy",
  "drunk",
  "peeyakkad",
  "bewda",
  "bevda",
  "tharra",
  "countryliquor",

  // Drugs / Nasha / Substances
  "drug",
  "drugs",
  "nasha",
  "nashedi",
  "ganja",
  "weed",
  "marijuana",
  "charas",
  "hash",
  "hashish",
  "cocaine",
  "coke",
  "heroin",
  "smack",
  "brownsugar",
  "meth",
  "amphetamine",
  "ecstasy",
  "molly",
  "lsd",
  "acid",
  "opium",
  "afeem",
  "bhang",
  "ketamine",
  "xanax",
  "stoney",
  "stoner",
  "high",
  "junkie",
  "addict",
  "cartel",
  "dealer",
]);

const BLOCKED_PHRASES = [
  "teri maa ki",
  "teri ma ki",
  "terimaaki",
  "terimaki",
];

const BLOCKED_SUBSTRINGS = [
  "porn",
  "xxx",
  "hentai",
  "boob",
  "vagina",
  "penis",
  "blowjob",
  "handjob",
  "chutiya",
  "bhosdi",
  "gaand",
  "gandu",
  "randi",
  "lauda",
  "lund",
  "chut",
  "terimaaki",
  "terimaki",
  "daaru",
  "daru",
  "sharab",
  "sharaab",
  "alcohol",
  "liquor",
  "booze",
  "vodka",
  "whiskey",
  "whisky",
  "tequila",
  "cocaine",
  "heroin",
  "marijuana",
  "charas",
  "hashish",
  "ganja",
  "nashedi",
  "brownsugar",
  "afeem",
  "bhang",
  "ketamine",
  "pedophile",
];

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAppropriateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter your name." };
  }

  const normalized = normalizeText(trimmed);
  const compact = normalized.replace(/\s+/g, "");
  const tokens = normalized.split(" ").filter(Boolean);

  const hasExactTokenMatch = tokens.some((token) => BLOCKED_EXACT_WORDS.has(token));
  const hasCompactExactMatch = BLOCKED_EXACT_WORDS.has(compact);
  const hasPhraseMatch = BLOCKED_PHRASES.some(
    (phrase) => normalized.includes(phrase) || compact.includes(phrase.replace(/\s+/g, ""))
  );
  const hasSubstringMatch = BLOCKED_SUBSTRINGS.some(
    (bad) => normalized.includes(bad) || compact.includes(bad)
  );

  if (hasExactTokenMatch || hasCompactExactMatch || hasPhraseMatch || hasSubstringMatch) {
    return {
      valid: false,
      error: "Please use a clean name without inappropriate, alcohol, or drug-related words.",
    };
  }

  return { valid: true };
}