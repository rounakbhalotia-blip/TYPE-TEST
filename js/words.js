/**
 * TypePulse - Word Dictionaries & Content Collections
 * Categorized by difficulty, language/code mode, and curated quotes.
 */

const DICTIONARIES = {
  easy: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come",
    "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "any",
    "day", "most", "us", "cat", "dog", "sun", "sky", "run", "fast", "blue",
    "red", "air", "tree", "bird", "fly", "warm", "cold", "sea", "lake",
    "book", "pen", "desk", "room", "door", "walk", "play", "game", "jump",
    "hand", "face", "eye", "head", "home", "star", "moon", "rain", "wind",
    "fire", "rock", "road", "car", "bus", "ship", "boat", "fish", "gold",
    "hill", "city", "town", "park", "food", "cup", "milk", "tea", "song",
    "ring", "bell", "lamp", "shoe", "coat", "hat", "snow", "ice", "wood",
    "sand", "wave", "leaf", "lion", "bear", "frog", "duck", "cake", "bread",
    "ball", "kite", "flag", "drum", "bell", "ship", "nest", "rope", "card"
  ],

  medium: [
    "journey", "freedom", "balance", "whisper", "horizon", "silence",
    "courage", "harmony", "destiny", "mystery", "shelter", "thunder",
    "twilight", "compass", "lantern", "glacier", "starlight", "radiance",
    "serenity", "shadow", "wander", "breeze", "capture", "inspire",
    "fortune", "voyage", "crystal", "echoing", "pathway", "treasure",
    "bravery", "cascade", "emerald", "fountain", "gateway", "harvest",
    "infinite", "justice", "kindness", "luminous", "meadow", "nomad",
    "odyssey", "pioneer", "quest", "rainbow", "solitude", "triumph",
    "universe", "vibrant", "wildlife", "yearning", "zenith", "abandon",
    "blossom", "clarity", "dignity", "empathy", "flourish", "grateful",
    "heritage", "illuminate", "jubilant", "kinetic", "legacy", "marvel",
    "nurture", "optimism", "passion", "radiant", "sympathy", "tranquil",
    "umbrella", "velocity", "whistle", "altitude", "boundary", "champion",
    "delight", "electric", "fracture", "glamour", "holiday", "immense",
    "junction", "kingdom", "leopard", "miracle", "network", "obstacle",
    "pyramid", "quantum", "reunion", "scenery", "temple", "utopia",
    "volcano", "weather", "yellow", "zealous", "abstract", "brilliant",
    "celebrate", "discover", "enormous", "fabulous", "generate", "heritage",
    "identify", "judgment", "knowledge", "location", "momentum", "navigate",
    "ordinary", "patience", "question", "remember", "strength", "together",
    "unusual", "valuable", "wonder", "youthful", "activity", "boundary",
    "calendar", "definite", "emphasis", "festival", "governor", "hospital",
    "industry", "keyboard", "language", "molecule", "national", "organism"
  ],

  hard: [
    "phenomenon", "conscientious", "bureaucracy", "ubiquitous", "juxtaposition",
    "kaleidoscope", "serendipity", "rhythm", "quintessential", "melancholy",
    "idiosyncrasy", "chrysanthemum", "surreptitious", "magnanimous", "ephemeral",
    "perspicacity", "anachronism", "camaraderie", "belligerent", "cacophony",
    "dichotomy", "effervescent", "fastidious", "grandiloquent", "hyperbole",
    "impecunious", "jurisprudence", "labyrinth", "metamorphosis", "nonchalant",
    "obfuscate", "panacea", "quandary", "recalcitrant", "sagacious",
    "trepidation", "uncompromising", "vicarious", "whimsical", "xenophobia",
    "zealotry", "acquiesce", "benevolent", "capricious", "deleterious",
    "ebullient", "fallacious", "garrulous", "harangue", "iconoclast",
    "juxtapose", "kowtow", "loquacious", "maverick", "nefarious",
    "ostentatious", "paradoxical", "querulous", "resplendent", "syllogism",
    "taciturn", "unfathomable", "vacillate", "winsome", "zeitgeist",
    "aberration", "bourgeoisie", "circumlocution", "disingenuous", "equivocal",
    "flabbergasted", "gargantuan", "hierarchical", "indefatigable", "kaleidoscopic",
    "lugubrious", "machination", "nonpareil", "onomatopoeia", "pusillanimous",
    "quintessence", "rambunctious", "scintillating", "transcendental", "ubiquity",
    "verisimilitude", "weltschmerz", "xenodochial", "yieldingly", "zoological"
  ],

  nightmare: [
    "sesquipedalian", "antidisestablishmentarianism", "floccinaucinihilipilification",
    "pneumonoultramicroscopicsilicovolcanoconiosis", "honorificabilitudinitatibus",
    "pseudopseudohypoparathyroidism", "spectrophotofluorometrically",
    "incomprehensibilities", "psychoneuroendocrinological", "uncharacteristically",
    "electrophotomicrography", "radioimmunoelectrophoresis", "counterrevolutionaries",
    "deinstitutionalization", "supercalifragilisticexpialidocious",
    "thyroparathyroidectomy", "trichotillomania", "schadenfreude",
    "hippopotomonstrosesquippedaliophobia", "otorhinolaryngology",
    "defenestration", "circumnavigation", "prestidigitation", "terpsichorean",
    "sesquicentennial", "sphygmomanometer", "quasiquincentennial",
    "dichlorodifluoromethane", "microspectrophotometries", "crystallographically",
    "interconvertibility", "electroencephalography", "phenylethylamine",
    "psychopharmacological", "gastroenterostomy", "dacryocystorhinostomy",
    "proparoxytone", "chryselephantine", "anfractuosity", "plenipotentiary",
    "bathykolpian", "borborygmus", "callipygian", "crapulence", "effluvium",
    "flocculent", "glabella", "hamartia", "insouciance", "jentacular",
    "kakorrhaphiophobia", "leptodactylous", "mulligrubs", "nudiustertian",
    "omphaloskepsis", "pauciloquent", "qualtagh", "runcation", "sciamachy",
    "tarantism", "ulotrichous", "ventripotent", "welkin", "xenotransplantation"
  ],

  code: [
    "const", "let", "function", "return", "async", "await", "import", "export",
    "class", "extends", "constructor", "super", "prototype", "typeof", "instanceof",
    "try", "catch", "finally", "throw", "new", "Error('unexpected')", "null",
    "undefined", "boolean", "number", "string", "symbol", "Array.from()",
    "Object.keys()", "Promise.resolve()", "setTimeout()", "clearTimeout()",
    "document.getElementById()", "addEventListener('click')", "fetch(url)",
    "response.json()", "console.log()", "console.error()", "Math.floor()",
    "Math.random()", "JSON.stringify()", "JSON.parse()", "window.localStorage",
    "map(x => x * 2)", "filter(item => item.id)", "reduce((acc, curr) => acc + curr)",
    "if (x === 0)", "else if (x > 10)", "while (i < length)", "for (let i = 0; i < n; i++)",
    "switch (action.type)", "case 'SUCCESS':", "break;", "default:", "return false;",
    "def calculate_total(items):", "self.__init__()", "import numpy as np",
    "from typing import List, Dict, Optional", "lambda x: x['score']",
    "@staticmethod", "@property", "raise ValueError('Invalid')",
    "with open(filename, 'r') as f:", "try:", "except Exception as err:",
    "<div className='container'>", "<button onClick={handleClick}>",
    "display: flex; justify-content: center;", "align-items: center;",
    "margin: 0 auto; padding: 1.5rem;", "border-radius: 8px;", "box-shadow: 0 4px 6px;"
  ],

  quotes: [
    {
      text: "The only way to do great work is to love what you do.",
      source: "Steve Jobs"
    },
    {
      text: "In the middle of difficulty lies opportunity.",
      source: "Albert Einstein"
    },
    {
      text: "Life is what happens when you are busy making other plans.",
      source: "John Lennon"
    },
    {
      text: "Do what you can, with what you have, where you are.",
      source: "Theodore Roosevelt"
    },
    {
      text: "Simplicity is prerequisite for reliability.",
      source: "Edsger W. Dijkstra"
    },
    {
      text: "Talk is cheap. Show me the code.",
      source: "Linus Torvalds"
    },
    {
      text: "Programs must be written for people to read, and only incidentally for machines to execute.",
      source: "Harold Abelson"
    },
    {
      text: "Whether you think you can or you think you can't, you are right.",
      source: "Henry Ford"
    },
    {
      text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
      source: "Ralph Waldo Emerson"
    },
    {
      text: "It does not matter how slowly you go as long as you do not stop.",
      source: "Confucius"
    },
    {
      text: "Stay hungry, stay foolish.",
      source: "Stewart Brand"
    },
    {
      text: "Happiness depends upon ourselves.",
      source: "Aristotle"
    },
    {
      text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
      source: "Martin Fowler"
    },
    {
      text: "First, solve the problem. Then, write the code.",
      source: "John Johnson"
    },
    {
      text: "The secret of getting ahead is getting started.",
      source: "Mark Twain"
    },
    {
      text: "There are only two hard things in Computer Science: cache invalidation and naming things.",
      source: "Phil Karlton"
    },
    {
      text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
      source: "Antoine de Saint-Exupéry"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      source: "Winston Churchill"
    },
    {
      text: "Knowledge is power.",
      source: "Francis Bacon"
    },
    {
      text: "Believe you can and you are halfway there.",
      source: "Theodore Roosevelt"
    }
  ],

  punctuationMarks: [",", ".", "!", "?", ";", ":", "-", "'", "\"", "(", ")"],
  numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "42", "100", "2026", "99", "365"]
};

/**
 * Helper generator function to produce a randomized list of words.
 */
function generateWordList(difficulty = 'medium', count = 50, includePunctuation = false, includeNumbers = false) {
  let pool = DICTIONARIES[difficulty] || DICTIONARIES.medium;
  let result = [];

  for (let i = 0; i < count; i++) {
    // Occasionally inject a number if enabled
    if (includeNumbers && Math.random() < 0.15) {
      const num = DICTIONARIES.numbers[Math.floor(Math.random() * DICTIONARIES.numbers.length)];
      result.push(num);
      continue;
    }

    let word = pool[Math.floor(Math.random() * pool.length)];

    // Capitalize first letter occasionally for medium/hard
    if ((difficulty === 'medium' || difficulty === 'hard') && Math.random() < 0.12) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Add punctuation if enabled
    if (includePunctuation && Math.random() < 0.2) {
      const punct = DICTIONARIES.punctuationMarks[Math.floor(Math.random() * DICTIONARIES.punctuationMarks.length)];
      if (punct === '"' || punct === '(' || punct === ')') {
        word = `"${word}"`;
      } else {
        word = word + punct;
      }
    }

    result.push(word);
  }

  return result;
}

/**
 * Pick a random quote
 */
function getRandomQuote() {
  const quotes = DICTIONARIES.quotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
