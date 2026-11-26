/**
 * Expanded Puzzle Bank for WordForge
 * Pure interactive puzzle mechanics:
 * 1. Word Match / Link: 15 themed 4-pair puzzle decks (60 pairs total)
 * 2. Bug Zap: 18 interactive grammar error sentences
 * 3. Sentence Jigsaw: 12 scrambled syntax assembly challenges
 * 4. Odd One Out: 14 semantic intruder puzzles
 */

export interface WordMatchLevel {
  id: string;
  theme: string;
  pairs: { word: string; match: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface BugZapLevel {
  id: string;
  category: string;
  sentenceWords: string[];
  bugIndex: number;
  correction: string;
  ruleTip: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SentenceJigsawLevel {
  id: string;
  category: string;
  correctBlocks: string[];
  jumbledBlocks: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface OddOneOutLevel {
  id: string;
  category: string;
  words: string[];
  oddIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 1. WORD MATCH / PAIR LINK PUZZLES (15 Devised Decks)
export const WORD_MATCH_PUZZLES: WordMatchLevel[] = [
  {
    id: 'wm_1',
    theme: 'Everyday Mastery',
    pairs: [
      { word: 'Candid', match: 'Frank & Honest' },
      { word: 'Diligent', match: 'Hardworking' },
      { word: 'Resilient', match: 'Bounces Back' },
      { word: 'Vivid', match: 'Intensely Bright' },
    ],
    difficulty: 'easy',
  },
  {
    id: 'wm_2',
    theme: 'One-Word People (SSC)',
    pairs: [
      { word: 'Altruist', match: 'Helps Others Selflessly' },
      { word: 'Stoic', match: 'Indifferent to Pain/Joy' },
      { word: 'Demagogue', match: 'Rabble-Rousing Agitator' },
      { word: 'Somnambulist', match: 'Sleepwalker' },
    ],
    difficulty: 'medium',
  },
  {
    id: 'wm_3',
    theme: 'Famous Idiom Links',
    pairs: [
      { word: 'Bite the bullet', match: 'Face hardship bravely' },
      { word: "Achilles' heel", match: 'Fatal weak spot' },
      { word: "Hobson's choice", match: 'No real alternative' },
      { word: 'Red herring', match: 'Misleading clue' },
    ],
    difficulty: 'medium',
  },
  {
    id: 'wm_4',
    theme: 'GRE & Editorial High-Yield',
    pairs: [
      { word: 'Laconic', match: 'Using very few words' },
      { word: 'Esoteric', match: 'Understood by a few' },
      { word: 'Obsequious', match: 'Servile & fawning' },
      { word: 'Sanctimonious', match: 'Hypocritically holy' },
    ],
    difficulty: 'hard',
  },
  {
    id: 'wm_5',
    theme: 'Word Opposites (Antonyms)',
    pairs: [
      { word: 'Ephemeral', match: 'Eternal' },
      { word: 'Intransigent', match: 'Flexible' },
      { word: 'Fastidious', match: 'Careless' },
      { word: 'Mitigate', match: 'Aggravate' },
    ],
    difficulty: 'hard',
  },
  {
    id: 'wm_6',
    theme: 'Campus Placement Verbal',
    pairs: [
      { word: 'Pragmatic', match: 'Practical & realistic' },
      { word: 'Cogent', match: 'Clear & convincing' },
      { word: 'Synergy', match: 'Combined greater effect' },
      { word: 'Feasible', match: 'Possible to do easily' },
    ],
    difficulty: 'easy',
  },
  {
    id: 'wm_7',
    theme: 'Latin & Greek Roots',
    pairs: [
      { word: 'Benevolent', match: 'Well-wishing & kind' },
      { word: 'Malevolent', match: 'Wishing harm to others' },
      { word: 'Omniscient', match: 'All-knowing' },
      { word: 'Chronology', match: 'Order of events in time' },
    ],
    difficulty: 'easy',
  },
  {
    id: 'wm_8',
    theme: 'Phrasal Verbs (Banking & SSC)',
    pairs: [
      { word: 'Call off', match: 'Cancel an event' },
      { word: 'Put off', match: 'Postpone to later' },
      { word: 'Break out', match: 'Start suddenly (war/fire)' },
      { word: 'Give in', match: 'Surrender or yield' },
    ],
    difficulty: 'medium',
  },
  {
    id: 'wm_9',
    theme: 'Legal Maxims (CLAT / Judiciary)',
    pairs: [
      { word: 'Bona fide', match: 'In genuine good faith' },
      { word: 'Ultra vires', match: 'Beyond legal authority' },
      { word: 'Quid pro quo', match: 'Favor for a favor' },
      { word: 'Status quo', match: 'Existing state of affairs' },
    ],
    difficulty: 'hard',
  },
  {
    id: 'wm_10',
    theme: 'Defence & Officer Virtues (CDS)',
    pairs: [
      { word: 'Intrepid', match: 'Fearless & dauntless' },
      { word: 'Gallant', match: 'Heroic & brave' },
      { word: 'Stalwart', match: 'Loyal & dependable' },
      { word: 'Vigilant', match: 'Watchful for danger' },
    ],
    difficulty: 'medium',
  },
  {
    id: 'wm_11',
    theme: 'GATE Technical & Logic Terms',
    pairs: [
      { word: 'Anomaly', match: 'Deviation from normal' },
      { word: 'Corroborate', match: 'Confirm with evidence' },
      { word: 'Paradigm', match: 'Distinct pattern or model' },
      { word: 'Redundant', match: 'No longer needed; excess' },
    ],
    difficulty: 'medium',
  },
  {
    id: 'wm_12',
    theme: 'The Hindu Editorial Verbs',
    pairs: [
      { word: 'Exacerbate', match: 'Make a problem worse' },
      { word: 'Ameliorate', match: 'Improve a bad situation' },
      { word: 'Proliferate', match: 'Multiply rapidly' },
      { word: 'Curb', match: 'Restrain or keep in check' },
    ],
    difficulty: 'hard',
  },
  {
    id: 'wm_13',
    theme: 'Phobias & Manias (OWS)',
    pairs: [
      { word: 'Claustrophobia', match: 'Fear of confined spaces' },
      { word: 'Xenophobia', match: 'Fear of strangers/foreigners' },
      { word: 'Bibliophile', match: 'Lover of books' },
      { word: 'Misanthrope', match: 'Hater of humankind' },
    ],
    difficulty: 'medium',
  },
  {
    id: 'wm_14',
    theme: 'IELTS Academic Collocations',
    pairs: [
      { word: 'Ubiquitous', match: 'Found everywhere' },
      { word: 'Detrimental', match: 'Tending to cause harm' },
      { word: 'Indispensable', match: 'Absolutely necessary' },
      { word: 'Unprecedented', match: 'Never done before' },
    ],
    difficulty: 'medium',
  },
  {
    id: 'wm_15',
    theme: 'Forms of Government (OWS)',
    pairs: [
      { word: 'Plutocracy', match: 'Rule by the wealthy' },
      { word: 'Theocracy', match: 'Rule by religious priests' },
      { word: 'Oligarchy', match: 'Rule by a small elite' },
      { word: 'Anarchy', match: 'Absence of government' },
    ],
    difficulty: 'hard',
  },
];

// 2. BUG ZAP PUZZLES (18 Interactive Grammar Bugs)
export const BUG_ZAP_PUZZLES: BugZapLevel[] = [
  {
    id: 'bz_1',
    category: 'Do/Does/Did Rule',
    sentenceWords: ['No', 'sooner', 'did', 'he', 'arrived', 'than', 'the', 'meeting', 'started.'],
    bugIndex: 4,
    correction: 'arrive',
    ruleTip: '"Did" already shows past tense! It takes the base verb (arrive), not arrived.',
    difficulty: 'medium',
  },
  {
    id: 'bz_2',
    category: 'Latin Preposition Trap',
    sentenceWords: ['In', 'seniority,', 'the', 'officer', 'is', 'senior', 'than', 'everyone', 'else.'],
    bugIndex: 6,
    correction: 'to',
    ruleTip: 'Adjectives ending in -ior (senior, junior, superior) take TO, never THAN!',
    difficulty: 'easy',
  },
  {
    id: 'bz_3',
    category: 'Conditional Clause Trap',
    sentenceWords: ['If', 'he', 'would', 'have', 'studied,', 'he', 'would', 'have', 'topped.'],
    bugIndex: 2,
    correction: 'had',
    ruleTip: 'Conditional "If" clauses never take "would have"—use Past Perfect: "If he had studied"!',
    difficulty: 'medium',
  },
  {
    id: 'bz_4',
    category: 'Correlative Conjunction Trap',
    sentenceWords: ['Hardly', 'had', 'the', 'bell', 'rung', 'then', 'the', 'students', 'left.'],
    bugIndex: 5,
    correction: 'when',
    ruleTip: 'Hardly and Scarcely pair with WHEN; No Sooner pairs with THAN!',
    difficulty: 'easy',
  },
  {
    id: 'bz_5',
    category: 'Transitive vs Intransitive',
    sentenceWords: ['Tired', 'after', 'work,', 'she', 'decided', 'to', 'lay', 'down', 'peacefully.'],
    bugIndex: 6,
    correction: 'lie',
    ruleTip: '"To lie" means recline (no object). "To lay" needs an object (e.g. lay a book down)!',
    difficulty: 'hard',
  },
  {
    id: 'bz_6',
    category: 'Lest Rule',
    sentenceWords: ['Walk', 'cautiously', 'lest', 'you', 'will', 'slip', 'on', 'the', 'ice.'],
    bugIndex: 4,
    correction: 'should',
    ruleTip: '"Lest" means "so that not" and is always paired with SHOULD or bare subjunctive!',
    difficulty: 'medium',
  },
  {
    id: 'bz_7',
    category: 'Subject-Verb Preposition Trap',
    sentenceWords: ['The', 'box', 'of', 'rare', 'gold', 'coins', 'were', 'safely', 'locked.'],
    bugIndex: 6,
    correction: 'was',
    ruleTip: 'The real subject is "The box" (singular), not "coins"! Box was locked.',
    difficulty: 'easy',
  },
  {
    id: 'bz_8',
    category: 'Parallel Comparison Trap',
    sentenceWords: ['Unlike', 'Germany,', 'the', 'economy', 'of', 'India', 'is', 'expanding', 'fast.'],
    bugIndex: 1,
    correction: 'that of Germany,',
    ruleTip: 'You cannot compare a country (Germany) with an economy! Compare "that of Germany" with "the economy of India".',
    difficulty: 'hard',
  },
  {
    id: 'bz_9',
    category: 'GATE Conjunction Redundancy',
    sentenceWords: ['Although', 'the', 'server', 'crashed,', 'but', 'our', 'backups', 'worked', 'cleanly.'],
    bugIndex: 4,
    correction: '(remove "but")',
    ruleTip: 'Never pair "Although/Though" with "but" in the same sentence!',
    difficulty: 'easy',
  },
  {
    id: 'bz_10',
    category: 'Possessive Pronoun Trap',
    sentenceWords: ['Every', 'student', 'must', 'submit', 'their', 'assignment', 'before', 'Friday', 'evening.'],
    bugIndex: 4,
    correction: 'his or her',
    ruleTip: '"Every student" is singular, so formal exam grammar pairs it with singular possessive (his/her)!',
    difficulty: 'medium',
  },
  {
    id: 'bz_11',
    category: 'Transitive Discuss Trap',
    sentenceWords: ['The', 'panel', 'discussed', 'about', 'the', 'budget', 'for', 'two', 'hours.'],
    bugIndex: 3,
    correction: '(remove "about")',
    ruleTip: '"Discuss" takes a direct object with NO preposition—"discussed the budget", never "discussed about"!',
    difficulty: 'easy',
  },
  {
    id: 'bz_12',
    category: 'As Well As Concord',
    sentenceWords: ['The', 'captain,', 'as', 'well', 'as', 'his', 'crew,', 'were', 'decorated.'],
    bugIndex: 7,
    correction: 'was',
    ruleTip: 'With "as well as", the verb agrees with the FIRST subject ("The captain" -> singular "was")!',
    difficulty: 'medium',
  },
  {
    id: 'bz_13',
    category: 'One of the + Plural Noun',
    sentenceWords: ['One', 'of', 'my', 'closest', 'friend', 'cleared', 'the', 'IAS', 'exam.'],
    bugIndex: 4,
    correction: 'friends',
    ruleTip: '"One of the..." is always followed by a PLURAL noun ("one of my closest friends")!',
    difficulty: 'easy',
  },
  {
    id: 'bz_14',
    category: 'Countable vs Uncountable',
    sentenceWords: ['There', 'were', 'much', 'fewer', 'errors', 'in', 'the', 'revised', 'code.'],
    bugIndex: 2,
    correction: 'far',
    ruleTip: 'Use "far" or "many" before "fewer"—never "much fewer"!',
    difficulty: 'hard',
  },
  {
    id: 'bz_15',
    category: 'Subjunctive Mandate (GMAT)',
    sentenceWords: ['The', 'regulator', 'insisted', 'that', 'every', 'bank', 'reports', 'its', 'reserves.'],
    bugIndex: 6,
    correction: 'report',
    ruleTip: 'Bossy verbs ("insisted that...") require bare subjunctive infinitive: "report", not "reports"!',
    difficulty: 'hard',
  },
  {
    id: 'bz_16',
    category: 'Between vs Among',
    sentenceWords: ['Between', 'the', 'four', 'candidates,', 'she', 'scored', 'highest', 'in', 'verbal.'],
    bugIndex: 0,
    correction: 'Among',
    ruleTip: 'Use "between" for two distinct items and "among" for three or more!',
    difficulty: 'easy',
  },
  {
    id: 'bz_17',
    category: 'Possessive Before Gerund',
    sentenceWords: ['The', 'judge', 'objected', 'to', 'him', 'speaking', 'out', 'of', 'turn.'],
    bugIndex: 4,
    correction: 'his',
    ruleTip: 'Before a gerund ("speaking"), use the possessive pronoun ("his speaking")!',
    difficulty: 'hard',
  },
  {
    id: 'bz_18',
    category: 'Time Expression Tense',
    sentenceWords: ['I', 'am', 'preparing', 'for', 'this', 'exam', 'since', 'last', 'year.'],
    bugIndex: 1,
    correction: 'have been',
    ruleTip: 'With "since" + past point of time, use Present Perfect Continuous ("have been preparing")!',
    difficulty: 'medium',
  },
];

// 3. SENTENCE JIGSAW PUZZLES (12 Syntax Builders)
export const SENTENCE_JIGSAW_PUZZLES: SentenceJigsawLevel[] = [
  {
    id: 'sj_1',
    category: 'Proximity Rule',
    correctBlocks: ['Neither the captain', 'nor the sailors', 'were ready', 'for the storm.'],
    jumbledBlocks: ['were ready', 'Neither the captain', 'for the storm.', 'nor the sailors'],
    difficulty: 'easy',
  },
  {
    id: 'sj_2',
    category: 'Negative Adverb Inversion',
    correctBlocks: ['Seldom have we witnessed', 'such dramatic volatility', 'in international currency', 'exchange rates.'],
    jumbledBlocks: ['in international currency', 'Seldom have we witnessed', 'exchange rates.', 'such dramatic volatility'],
    difficulty: 'medium',
  },
  {
    id: 'sj_3',
    category: 'Subjunctive Mandate',
    correctBlocks: ['The committee mandated', 'that every officer', 'submit the financial report', 'before midnight.'],
    jumbledBlocks: ['before midnight.', 'submit the financial report', 'The committee mandated', 'that every officer'],
    difficulty: 'hard',
  },
  {
    id: 'sj_4',
    category: 'Dangling Modifier Fix',
    correctBlocks: ['Having analyzed the data,', 'the scientist formulated', 'a groundbreaking hypothesis', 'on quantum mechanics.'],
    jumbledBlocks: ['the scientist formulated', 'Having analyzed the data,', 'on quantum mechanics.', 'a groundbreaking hypothesis'],
    difficulty: 'hard',
  },
  {
    id: 'sj_5',
    category: 'Correlative Pair (No Sooner)',
    correctBlocks: ['No sooner had', 'the siren sounded', 'than the convoy', 'moved into formation.'],
    jumbledBlocks: ['than the convoy', 'No sooner had', 'moved into formation.', 'the siren sounded'],
    difficulty: 'medium',
  },
  {
    id: 'sj_6',
    category: 'Conditional Inversion (Third)',
    correctBlocks: ['Had the pilot noticed', 'the crosswind earlier,', 'the landing would have', 'been far smoother.'],
    jumbledBlocks: ['the landing would have', 'been far smoother.', 'Had the pilot noticed', 'the crosswind earlier,'],
    difficulty: 'hard',
  },
  {
    id: 'sj_7',
    category: 'Corporate Parallelism (Placement)',
    correctBlocks: ['The new platform enables', 'engineers to write code,', 'run automated tests,', 'and deploy releases faster.'],
    jumbledBlocks: ['and deploy releases faster.', 'engineers to write code,', 'The new platform enables', 'run automated tests,'],
    difficulty: 'easy',
  },
  {
    id: 'sj_8',
    category: 'Not Only... But Also',
    correctBlocks: ['Not only did she', 'top the entrance test,', 'but she also', 'won the national scholarship.'],
    jumbledBlocks: ['won the national scholarship.', 'top the entrance test,', 'Not only did she', 'but she also'],
    difficulty: 'medium',
  },
  {
    id: 'sj_9',
    category: 'Logical Comparison (GMAT)',
    correctBlocks: ['Unlike the output', 'of older turbines,', 'that of modern reactors', 'remains remarkably stable.'],
    jumbledBlocks: ['remains remarkably stable.', 'of older turbines,', 'that of modern reactors', 'Unlike the output'],
    difficulty: 'hard',
  },
  {
    id: 'sj_10',
    category: 'Everyday Subject Concord',
    correctBlocks: ['Each of the finalists', 'was awarded a medal', 'for exceptional clarity', 'during the debate.'],
    jumbledBlocks: ['during the debate.', 'Each of the finalists', 'for exceptional clarity', 'was awarded a medal'],
    difficulty: 'easy',
  },
  {
    id: 'sj_11',
    category: 'Legal Bench Precision (CLAT)',
    correctBlocks: ['Because the statute lacked', 'clear enforcement guidelines,', 'the constitutional bench', 'declared it ultra vires.'],
    jumbledBlocks: ['declared it ultra vires.', 'the constitutional bench', 'Because the statute lacked', 'clear enforcement guidelines,'],
    difficulty: 'medium',
  },
  {
    id: 'sj_12',
    category: 'GATE Technical Premise',
    correctBlocks: ['Although the primary sensor', 'displayed minor drift,', 'the calibration algorithm', 'restored accurate readings.'],
    jumbledBlocks: ['restored accurate readings.', 'displayed minor drift,', 'Although the primary sensor', 'the calibration algorithm'],
    difficulty: 'medium',
  },
];

// 4. ODD ONE OUT PUZZLES (14 Semantic Intruder Challenges)
export const ODD_ONE_OUT_PUZZLES: OddOneOutLevel[] = [
  {
    id: 'ooo_1',
    category: 'Fleeting vs Permanent',
    words: ['Ephemeral', 'Transient', 'Perpetual', 'Fleeting'],
    oddIndex: 2,
    explanation: '"Perpetual" means everlasting. The other three mean short-lived or fleeting!',
    difficulty: 'easy',
  },
  {
    id: 'ooo_2',
    category: 'Talkative vs Quiet',
    words: ['Loquacious', 'Garrulous', 'Voluble', 'Laconic'],
    oddIndex: 3,
    explanation: '"Laconic" means using very few words. The other three mean talkative or chatty!',
    difficulty: 'medium',
  },
  {
    id: 'ooo_3',
    category: 'Uncompromising vs Pliable',
    words: ['Intransigent', 'Obdurate', 'Compliant', 'Resolute'],
    oddIndex: 2,
    explanation: '"Compliant" means willing to agree/yield. The others mean stubbornly unyielding!',
    difficulty: 'hard',
  },
  {
    id: 'ooo_4',
    category: 'Harmful vs Healing',
    words: ['Pernicious', 'Baleful', 'Insidious', 'Salutary'],
    oddIndex: 3,
    explanation: '"Salutary" means producing healthy/good effects. The other three mean harmful or destructive!',
    difficulty: 'hard',
  },
  {
    id: 'ooo_5',
    category: 'Brave vs Cowardly',
    words: ['Intrepid', 'Valiant', 'Dauntless', 'Pusillanimous'],
    oddIndex: 3,
    explanation: '"Pusillanimous" means timid or lacking courage. The others mean fearless and brave!',
    difficulty: 'medium',
  },
  {
    id: 'ooo_6',
    category: 'Clear vs Confusing',
    words: ['Lucid', 'Pellucid', 'Perspicuous', 'Esoteric'],
    oddIndex: 3,
    explanation: '"Esoteric" means obscure and understood by few. The others mean crystal clear!',
    difficulty: 'hard',
  },
  {
    id: 'ooo_7',
    category: 'Generous vs Stingy',
    words: ['Munificent', 'Magnanimous', 'Benevolent', 'Parsimonious'],
    oddIndex: 3,
    explanation: '"Parsimonious" means overly stingy or frugal. The others describe generosity!',
    difficulty: 'medium',
  },
  {
    id: 'ooo_8',
    category: 'Genuine vs Fake',
    words: ['Authentic', 'Veritable', 'Bona fide', 'Spurious'],
    oddIndex: 3,
    explanation: '"Spurious" means false or counterfeit. The other three mean genuine and real!',
    difficulty: 'easy',
  },
  {
    id: 'ooo_9',
    category: 'Praise vs Scold',
    words: ['Extol', 'Laud', 'Eulogize', 'Castigate'],
    oddIndex: 3,
    explanation: '"Castigate" means to reprimand severely. The other three mean to praise highly!',
    difficulty: 'medium',
  },
  {
    id: 'ooo_10',
    category: 'Calm vs Chaotic',
    words: ['Serene', 'Placid', 'Tranquil', 'Tumultuous'],
    oddIndex: 3,
    explanation: '"Tumultuous" means loud, stormy, and disorderly. The others mean calm and peaceful!',
    difficulty: 'easy',
  },
  {
    id: 'ooo_11',
    category: 'Reduce vs Worsen',
    words: ['Mitigate', 'Alleviate', 'Assuage', 'Exacerbate'],
    oddIndex: 3,
    explanation: '"Exacerbate" means to make a problem worse. The others mean to ease or lessen pain!',
    difficulty: 'medium',
  },
  {
    id: 'ooo_12',
    category: 'Everywhere vs Rare',
    words: ['Ubiquitous', 'Omnipresent', 'Pervasive', 'Scarce'],
    oddIndex: 3,
    explanation: '"Scarce" means rare or insufficient. The others mean present everywhere!',
    difficulty: 'easy',
  },
  {
    id: 'ooo_13',
    category: 'Hasty vs Careful',
    words: ['Meticulous', 'Fastidious', 'Scrupulous', 'Impetuous'],
    oddIndex: 3,
    explanation: '"Impetuous" means acting rashly without thought. The others mean painstakingly careful!',
    difficulty: 'hard',
  },
  {
    id: 'ooo_14',
    category: 'Corporate Formal vs Slang',
    words: ['Pragmatic', 'Feasible', 'Cogent', 'Sketchy'],
    oddIndex: 3,
    explanation: '"Sketchy" is informal slang. The others are standard formal/corporate adjectives!',
    difficulty: 'easy',
  },
];
