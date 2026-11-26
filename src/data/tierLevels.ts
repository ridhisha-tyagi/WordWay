import { DifficultyLevel } from './wordBank';

export type StagePuzzleMode =
  | 'spell'
  | 'word_match'
  | 'bug_zap'
  | 'jigsaw'
  | 'odd_one'
  | 'vocab'
  | 'grammar'
  | 'arena';

export interface TierLevelStage {
  levelNumber: number; // 1 to 16
  title: string;
  subtitle: string;
  focus: string;
  difficultyTag: 'Basics' | 'Intermediate' | 'Advanced' | 'Master' | 'Placement';
  difficultyStars: number; // 1 to 5 stars
  puzzleMode: StagePuzzleMode;
  requiredXp: number;
}

export const TIER_LEVELS: Record<DifficultyLevel, TierLevelStage[]> = {
  basic_foundation: [
    { levelNumber: 1, title: 'First Sparks', subtitle: 'Gentle vowel & consonant tiles', focus: '3-4 letter word phonics', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'spell', requiredXp: 35 },
    { levelNumber: 2, title: 'Everyday Pairs', subtitle: 'Direct synonym matching', focus: 'Friendly descriptive words', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'word_match', requiredXp: 40 },
    { levelNumber: 3, title: 'Spot the Glitch', subtitle: 'Fix simple sentence slips', focus: 'Clear concord & tense', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'bug_zap', requiredXp: 45 },
    { levelNumber: 4, title: 'Clause Blocks', subtitle: 'Assemble basic sentences', focus: 'Subject + Verb + Object order', difficultyTag: 'Basics', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 50 },
    { levelNumber: 5, title: 'Core Vocab Duel', subtitle: 'Pick the clearest definition', focus: 'Everyday fluency meanings', difficultyTag: 'Basics', difficultyStars: 2, puzzleMode: 'vocab', requiredXp: 55 },
    { levelNumber: 6, title: 'Outsider Spotting', subtitle: 'Spot the contrast word', focus: 'Synonym family distinction', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'odd_one', requiredXp: 60 },
    { levelNumber: 7, title: 'Double Letter Path', subtitle: 'Calendar & tomorrow tiles', focus: 'Spelling rules (i before e)', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'spell', requiredXp: 65 },
    { levelNumber: 8, title: 'Midway Concord Check', subtitle: 'Grammar essentials milestone', focus: 'Is/Are & Have/Has precision', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 70 },
    { levelNumber: 9, title: 'Antonym Wire Link', subtitle: 'Connect direct opposite pairs', focus: 'Clear antonym associations', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 75 },
    { levelNumber: 10, title: 'Pronoun Sentry', subtitle: 'Fix objective vs subjective cases', focus: 'He vs Him, I vs Me in context', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'bug_zap', requiredXp: 80 },
    { levelNumber: 11, title: 'Sentence Builder', subtitle: 'Combine compound clauses', focus: 'Conjunctions (and, but, so)', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'jigsaw', requiredXp: 85 },
    { levelNumber: 12, title: 'Context Precision', subtitle: 'Choose words in real sentences', focus: 'Contextual nuance & tone', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 90 },
    { levelNumber: 13, title: 'Homophone Sentry', subtitle: 'Its vs It’s & Their vs There', focus: 'Apostrophe & possessive rules', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 95 },
    { levelNumber: 14, title: 'Preposition Mastery', subtitle: 'In, On, At & Between rules', focus: 'Everyday preposition traps', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'grammar', requiredXp: 100 },
    { levelNumber: 15, title: 'Syntax Precision', subtitle: '4-piece jigsaw with phrases', focus: 'Introductory preposition flow', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 105 },
    { levelNumber: 16, title: 'Foundations Boss Blitz', subtitle: '60-second speed multiplier finale', focus: 'Fast recall under pressure', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 120 },
  ],

  college_entry: [
    { levelNumber: 1, title: 'Freshman Roots', subtitle: 'Collegiate academic vocabulary', focus: 'Pedantic, pragmatic & anomaly', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'word_match', requiredXp: 40 },
    { levelNumber: 2, title: 'Campus Tile Sparks', subtitle: 'Plagiarism & curriculum anagrams', focus: 'University registration spellings', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'spell', requiredXp: 45 },
    { levelNumber: 3, title: 'Concord on Campus', subtitle: 'Subject concord in campus notices', focus: 'Each of the students + singular verb', difficultyTag: 'Basics', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 50 },
    { levelNumber: 4, title: 'Thesis Fragments', subtitle: 'Assemble collegiate arguments', focus: 'Coordinated academic clauses', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 55 },
    { levelNumber: 5, title: 'CUET Reading Links', subtitle: 'Contextual synonym matching', focus: 'CUET UG/PG verbal reading aptitude', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 60 },
    { levelNumber: 6, title: 'CUET Vocab Duel', subtitle: 'Academic context MCQs', focus: 'High-frequency college entrance lexis', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'vocab', requiredXp: 65 },
    { levelNumber: 7, title: 'Dangling Participle Sentry', subtitle: 'Zap introductory participle bugs', focus: 'Dangling & misplaced modifiers', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'bug_zap', requiredXp: 70 },
    { levelNumber: 8, title: 'Campus Grammar Milestone', subtitle: 'SAT & CUET error-spotting check', focus: 'Modifier & verb tense clarity', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 75 },
    { levelNumber: 9, title: 'Placement Arena: IT Verbal', subtitle: 'TCS NQT & Infosys corporate pairs', focus: 'Corporate aptitude terms & analogies', difficultyTag: 'Placement', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 80 },
    { levelNumber: 10, title: 'Placement Arena: Drive Spellings', subtitle: 'Entrepreneur & questionnaire tiles', focus: 'Top misspelled words in recruitment drives', difficultyTag: 'Placement', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 85 },
    { levelNumber: 11, title: 'Placement Arena: Resume Grammar', subtitle: 'Parallelism in corporate bullets', focus: 'Correlative parallelism in applications', difficultyTag: 'Placement', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 90 },
    { levelNumber: 12, title: 'Placement Arena: Verbal Drill', subtitle: 'Wipro & Accenture verbal spotting', focus: 'Redundant prepositions & voice', difficultyTag: 'Placement', difficultyStars: 4, puzzleMode: 'grammar', requiredXp: 95 },
    { levelNumber: 13, title: 'Corporate Register Intruder', subtitle: 'Spot informal slang vs formal terms', focus: 'Formal business tone evaluation', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'odd_one', requiredXp: 100 },
    { levelNumber: 14, title: 'Analytical Root Match', subtitle: 'Connect Latin & Greek prefixes', focus: 'Bene, Mal, Omni & Chron roots', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 105 },
    { levelNumber: 15, title: 'Executive Synthesis Jigsaw', subtitle: 'Formal proposal clause assembly', focus: 'Transitional adverbs & cohesion', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 110 },
    { levelNumber: 16, title: 'Dean’s Career Blitz', subtitle: '60-second placement sprint boss round', focus: 'Complete verbal score benchmark', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 125 },
  ],

  college_placement: [
    { levelNumber: 1, title: 'Recruitment Roots', subtitle: 'Aptitude & corporate vocabulary', focus: 'Synergy, pragmatic & cogent', difficultyTag: 'Placement', difficultyStars: 1, puzzleMode: 'word_match', requiredXp: 45 },
    { levelNumber: 2, title: 'Placement Spell Surge', subtitle: 'Entrepreneur & questionnaire tiles', focus: 'High-frequency drive spellings', difficultyTag: 'Placement', difficultyStars: 2, puzzleMode: 'spell', requiredXp: 50 },
    { levelNumber: 3, title: 'Business Report Zap', subtitle: 'Parallel structure errors in resumes', focus: 'Correlative parallelism & modifiers', difficultyTag: 'Placement', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 55 },
    { levelNumber: 4, title: 'Aptitude Jigsaw', subtitle: 'Assemble cohesive corporate statements', focus: 'Formal business syntax', difficultyTag: 'Placement', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 60 },
    { levelNumber: 5, title: 'Corporate Intruder', subtitle: 'Spot the unprofessional tone outlier', focus: 'Nuance & register evaluation', difficultyTag: 'Placement', difficultyStars: 3, puzzleMode: 'odd_one', requiredXp: 65 },
    { levelNumber: 6, title: 'TCS NQT Verbal Match', subtitle: 'Technical campus recruitment match', focus: 'Data interpretation & analogies', difficultyTag: 'Placement', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 70 },
    { levelNumber: 7, title: 'TCS Verbal Context Duel', subtitle: 'Contextual vocabulary blanks', focus: 'Pragmatic, cogent & feasible', difficultyTag: 'Placement', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 75 },
    { levelNumber: 8, title: 'Infosys Grammar Milestone', subtitle: 'Parallelism & transitive traps', focus: 'Discuss (no "about") & series flow', difficultyTag: 'Placement', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 80 },
    { levelNumber: 9, title: 'Executive Anagrams', subtitle: 'Hierarchy, supersede & liaison', focus: 'Tricky management spellings', difficultyTag: 'Placement', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 85 },
    { levelNumber: 10, title: 'Email Grammar Detective', subtitle: 'Zap apostrophe & concord bugs', focus: 'Professional communication grammar', difficultyTag: 'Placement', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 90 },
    { levelNumber: 11, title: 'Presentation Jigsaw', subtitle: 'Reorder presentation flow blocks', focus: 'Logical transition sequences', difficultyTag: 'Placement', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 95 },
    { levelNumber: 12, title: 'Infosys Verbal Logic', subtitle: 'Deduce contextual nuances', focus: 'Technical verbal aptitude', difficultyTag: 'Placement', difficultyStars: 4, puzzleMode: 'odd_one', requiredXp: 100 },
    { levelNumber: 13, title: 'Accenture Clause Drill', subtitle: 'Sentence correction & precision', focus: 'Eliminating wordiness & redundancy', difficultyTag: 'Placement', difficultyStars: 4, puzzleMode: 'grammar', requiredXp: 105 },
    { levelNumber: 14, title: 'Management Lexicon Duel', subtitle: 'Identify precision business terms', focus: 'Executive vocabulary mastery', difficultyTag: 'Placement', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 110 },
    { levelNumber: 15, title: 'Wipro Corporate Syntax', subtitle: 'Assemble cohesive proposals', focus: 'Executive clarity & clauses', difficultyTag: 'Placement', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 115 },
    { levelNumber: 16, title: 'Campus Placement Gauntlet', subtitle: '60s final campus test blitz', focus: 'Complete verbal aptitude sprint', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 130 },
  ],

  ssc_exams: [
    { levelNumber: 1, title: 'Cadet Warmup', subtitle: '4-letter clerical exam spellings', focus: 'SSC MTS & GD clerical core', difficultyTag: 'Intermediate', difficultyStars: 1, puzzleMode: 'spell', requiredXp: 40 },
    { levelNumber: 2, title: 'MTS People Puzzles', subtitle: 'One Word Substitution personas', focus: 'Altruist, stoic, somnambulist', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 50 },
    { levelNumber: 3, title: 'Latin Adjective Traps', subtitle: 'Zap senior/superior "than" errors', focus: 'Latin comparatives with "to"', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 55 },
    { levelNumber: 4, title: 'CHSL Correlative Jigsaw', subtitle: 'Assemble "Scarcely... when" syntax', focus: 'Inverted correlative structures', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 60 },
    { levelNumber: 5, title: 'CHSL Idiom Match', subtitle: 'Link idioms to real exam meanings', focus: 'Bite the bullet, wild goose chase', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 65 },
    { levelNumber: 6, title: 'OWS & Idiom Duel', subtitle: 'Master Tier-1 one-word questions', focus: 'Phobias, governance & personas', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 70 },
    { levelNumber: 7, title: 'Staff Spelling Drill', subtitle: 'Bureaucracy & liaison unscramble', focus: 'Administrative terminology', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 75 },
    { levelNumber: 8, title: 'CHSL Error Spotting Check', subtitle: 'Part A/B/C/D PYQ milestone', focus: 'TCS 2018-2024 error spotting', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 80 },
    { levelNumber: 9, title: 'CGL Spelling Surge', subtitle: 'Lieutenant, silhouette & surveillance', focus: 'CGL Tier-1 double consonants', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 85 },
    { levelNumber: 10, title: 'CGL Officer OWS & Roots', subtitle: 'Connect high-yield Tier-1 substitutions', focus: 'PYQ 2018-2024 vocabulary', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 90 },
    { levelNumber: 11, title: 'CGL Conditional Sentry', subtitle: 'Spotting errors in conditional inversions', focus: 'Third conditional & inversion rules', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 95 },
    { levelNumber: 12, title: 'SSC Synonym Intruder', subtitle: 'Isolate the odd meaning out', focus: 'Nuanced Tier-2 antonyms', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'odd_one', requiredXp: 100 },
    { levelNumber: 13, title: 'Inspector Inversion Jigsaw', subtitle: 'Seldom, rarely & scarcely openings', focus: 'Negative adverb clause inversions', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 105 },
    { levelNumber: 14, title: 'Tier-2 Cloze & Idiom Duel', subtitle: 'Advanced contextual choices', focus: 'Editorial & administrative prose', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 110 },
    { levelNumber: 15, title: 'CGL Para-Jumble Architecture', subtitle: 'Construct complex Tier-2 sentences', focus: 'Cohesive sentence flow & voice', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 115 },
    { levelNumber: 16, title: 'Inspector Gauntlet Blitz', subtitle: '60s full speed mock gauntlet', focus: 'Peak accuracy under clock', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 130 },
  ],

  ssc_chsl: [
    { levelNumber: 1, title: 'Clerical Anagrams', subtitle: 'Guarantee & maintenance', focus: 'High-frequency SSC spellings', difficultyTag: 'Intermediate', difficultyStars: 1, puzzleMode: 'spell', requiredXp: 45 },
    { levelNumber: 2, title: 'One-Word Substitution', subtitle: 'Connect exam people & personas', focus: 'Altruist, stoic, somnambulist', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 55 },
    { levelNumber: 3, title: 'Latin Adjective Traps', subtitle: 'Zap senior/superior "than" errors', focus: 'Latin comparatives with "to"', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 60 },
    { levelNumber: 4, title: 'Correlative Jigsaw', subtitle: 'Assemble "Scarcely... when" sentences', focus: 'Inverted correlative structures', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 65 },
    { levelNumber: 5, title: 'Intruder in the Ranks', subtitle: 'Deduce non-fitting staff selection words', focus: 'SSC Tier-1 vocabulary', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'odd_one', requiredXp: 70 },
    { levelNumber: 6, title: 'CHSL Vocab Duel', subtitle: 'Quick-fire synonym & OWS quiz', focus: 'Neetu Singh Vol. 1 core terms', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 75 },
    { levelNumber: 7, title: 'Staff Spelling Drill', subtitle: 'Bureaucracy & liaison unscramble', focus: 'Administrative terminology', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 80 },
    { levelNumber: 8, title: 'MTS Idiom Match', subtitle: 'Link idioms to real meanings', focus: 'Bite the bullet, wild goose chase', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 85 },
    { levelNumber: 9, title: 'CHSL Error Spotting', subtitle: 'TCS pattern sentence segments', focus: 'Tense & concord errors', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 90 },
    { levelNumber: 10, title: 'Preposition Detective', subtitle: 'Spotting errors in Part A/B/C/D', focus: 'Fixed preposition pairings', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 95 },
    { levelNumber: 11, title: 'Phrasal Verb Wire Link', subtitle: 'Call off, put off & break out', focus: 'Essential SSC phrasal verbs', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 100 },
    { levelNumber: 12, title: 'CHSL Syntax Assembly', subtitle: 'Reorder split sentence fragments', focus: 'Active & passive transformations', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 105 },
    { levelNumber: 13, title: 'Passive Transformation Zap', subtitle: 'Zap voice shift glitches', focus: 'Active to passive precision', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 110 },
    { levelNumber: 14, title: 'Governance OWS Quiz', subtitle: 'Plutocracy, oligarchy & anarchy', focus: 'SSC Civics & Government words', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 115 },
    { levelNumber: 15, title: 'Tier-1 Speed Run', subtitle: 'Speed drill across synonym traps', focus: 'Timed accuracy', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'odd_one', requiredXp: 120 },
    { levelNumber: 16, title: 'CHSL Tier-1 Mock Sprint', subtitle: 'Speed mock under real timer', focus: '60s Prelims time pressure', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 130 },
  ],

  ssc_cgl: [
    { levelNumber: 1, title: 'CGL Anagram Surge', subtitle: 'Lieutenant, silhouette & surveillance', focus: 'Defence & intelligence spellings', difficultyTag: 'Advanced', difficultyStars: 2, puzzleMode: 'spell', requiredXp: 50 },
    { levelNumber: 2, title: 'CGL Vocabulary Link', subtitle: 'Match technical & editorial lexis', focus: 'High-yield Tier-2 words', difficultyTag: 'Advanced', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 60 },
    { levelNumber: 3, title: 'Conjunction Redundancy', subtitle: 'Zap "Although... yet/still" traps', focus: 'CGL & GATE error spotting', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'bug_zap', requiredXp: 65 },
    { levelNumber: 4, title: 'Inversion Jigsaw', subtitle: 'Assemble negative adverb openings', focus: 'Seldom, rarely & scarcely syntax', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'jigsaw', requiredXp: 70 },
    { levelNumber: 5, title: 'Officer OWS Intruder', subtitle: 'Isolate antonyms in verbal analogies', focus: 'Root words and nuances', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'odd_one', requiredXp: 75 },
    { levelNumber: 6, title: 'Tier-2 Vocab Challenge', subtitle: 'Nuanced administrative synonyms', focus: 'SP Bakshi & TCS shift lexis', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 80 },
    { levelNumber: 7, title: 'Inspector’s Spelling', subtitle: 'Privilege, questionnaire & camouflage', focus: 'Tricky double consonants', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 85 },
    { levelNumber: 8, title: 'CGL Idiom Vault', subtitle: 'Connect high-yield Tier-2 idioms', focus: 'PYQ 2018-2024 idioms', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 90 },
    { levelNumber: 9, title: 'Tier-2 Grammar Lab', subtitle: 'Mixed voice, narration & concord', focus: 'Full 45-question pattern prep', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'grammar', requiredXp: 95 },
    { levelNumber: 10, title: 'Conditionals Sentry', subtitle: 'Zap "Had I known... would have" bugs', focus: 'Third conditional inversions', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 100 },
    { levelNumber: 11, title: 'Para-Jumble Architecture', subtitle: 'Construct complex CGL sentences', focus: 'Cohesive sentence flow', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 105 },
    { levelNumber: 12, title: 'Direct-Indirect Shift', subtitle: 'Zap speech shift tense errors', focus: 'Reported speech conversion', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 110 },
    { levelNumber: 13, title: 'Officer Lexicon Link', subtitle: 'Match editorial Officer vocab', focus: 'High administrative vocabulary', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 115 },
    { levelNumber: 14, title: 'Editorial Cloze Duel', subtitle: 'Context inference for Tier-2 passages', focus: 'Reading tone & precision', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'vocab', requiredXp: 120 },
    { levelNumber: 15, title: 'Complex Clause Builder', subtitle: 'Subjunctive & conditional syntax', focus: 'Tier-2 Mastery', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 125 },
    { levelNumber: 16, title: 'CGL Tier-2 Gauntlet', subtitle: 'Full speed mock blitz', focus: 'Peak accuracy under clock', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 140 },
  ],

  banking_po: [
    { levelNumber: 1, title: 'Clerk Prelims Speed Drill', subtitle: 'Fast vocabulary & spelling check', focus: 'Speed spelling & synonyms', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'spell', requiredXp: 40 },
    { levelNumber: 2, title: 'The Hindu Editorial Match', subtitle: 'Ephemeral, pragmatic & esoteric', focus: 'Editorial reading vocabulary', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 50 },
    { levelNumber: 3, title: 'Phrase Replacement Zap', subtitle: 'Zap faulty banking prepositions', focus: 'Phrasal verb precision', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 60 },
    { levelNumber: 4, title: 'Banking Inversion Jigsaw', subtitle: 'Assemble regulatory announcements', focus: 'Inverted formal declarations', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 65 },
    { levelNumber: 5, title: 'Editorial Context Duel', subtitle: 'Economic & fiscal vocabulary blanks', focus: 'SBI / IBPS Prelims cloze style', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 70 },
    { levelNumber: 6, title: 'Financial Lexicon Anagrams', subtitle: 'Acquiesce & idiosyncrasy', focus: 'Banking exam spelling traps', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 75 },
    { levelNumber: 7, title: 'RBI Grade B Intruder', subtitle: 'Spot contextual tone outliers', focus: 'Monetary & fiscal prose nuances', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'odd_one', requiredXp: 80 },
    { levelNumber: 8, title: 'PO Prelims Error Lab', subtitle: 'Collective nouns & Lie vs Lay traps', focus: 'Bank PO sentence improvement', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 85 },
    { levelNumber: 9, title: 'Norman Lewis Master', subtitle: 'Root words from Word Power Made Easy', focus: 'Greek & Latin root pairs', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 90 },
    { levelNumber: 10, title: 'Phrasal Verb Match', subtitle: 'Editorial phrasal verb precision', focus: 'Bank Mains filler patterns', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 95 },
    { levelNumber: 11, title: 'Parallelism Sentry', subtitle: 'Zap non-parallel banking series', focus: 'Correlative parallelism rules', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 100 },
    { levelNumber: 12, title: 'Editorial Verb Duel', subtitle: 'Exacerbate, ameliorate & curb', focus: 'The Indian Express & Hindu op-eds', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 105 },
    { levelNumber: 13, title: 'Sentence Synthesis', subtitle: 'Merge two independent clauses cleanly', focus: 'Advanced transition markers', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 110 },
    { levelNumber: 14, title: 'RBI Mains Error Check', subtitle: 'Subtle modifier & preposition nuances', focus: 'High-stakes Mains grammar', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'grammar', requiredXp: 115 },
    { levelNumber: 15, title: 'Monetary Policy Prose Jigsaw', subtitle: 'Reorder central bank communiqués', focus: 'High-density economic logic', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 120 },
    { levelNumber: 16, title: 'SBI PO Mains Blitz', subtitle: 'High-speed verbal blitz', focus: 'Speed plus complex deduction', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 135 },
  ],

  gate_aptitude: [
    { levelNumber: 1, title: 'GATE Technical Spelling', subtitle: 'Simultaneous & homogeneous', focus: 'Engineering verbal spellings', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'spell', requiredXp: 40 },
    { levelNumber: 2, title: 'Verbal Logic Links', subtitle: 'Match aptitude terms & analogies', focus: 'Verbal analogies & logic', difficultyTag: 'Basics', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 50 },
    { levelNumber: 3, title: 'Conjunction Redundancy', subtitle: 'Zap "Although... yet/still" traps', focus: 'GATE Aptitude error spotting', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 55 },
    { levelNumber: 4, title: 'Inversion Jigsaw', subtitle: 'Assemble negative adverb openings', focus: 'Seldom, rarely & scarcely syntax', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 60 },
    { levelNumber: 5, title: 'GATE Technical Vocab Duel', subtitle: 'Anomaly, mitigate & corroborate', focus: 'IIT GATE verbal definitions', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 65 },
    { levelNumber: 6, title: 'Technical Intruder', subtitle: 'Isolate antonyms in verbal analogies', focus: 'Engineering aptitude nuances', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'odd_one', requiredXp: 70 },
    { levelNumber: 7, title: 'Equilibrium Anagrams', subtitle: 'Equilibrium & surveillance tiles', focus: 'High-frequency technical words', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 75 },
    { levelNumber: 8, title: 'GATE Aptitude Grammar Check', subtitle: 'Unless double-negatives & redundancy', focus: 'Official IIT verbal rules', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 80 },
    { levelNumber: 9, title: 'Paradigm Wire Link', subtitle: 'Equivocal, paradigm & anomaly', focus: 'GATE Aptitude vocabulary', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 85 },
    { levelNumber: 10, title: 'Conditional Sentry', subtitle: 'Zap scientific condition bugs', focus: 'Hypothetical conditions & modals', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 90 },
    { levelNumber: 11, title: 'Hypothesis Jigsaw', subtitle: 'Reorder scientific deductions', focus: 'Premise to conclusion syntax', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 95 },
    { levelNumber: 12, title: 'Analogy Nuance Duel', subtitle: 'Word relationship precision', focus: 'GATE General Aptitude analogies', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 100 },
    { levelNumber: 13, title: 'Syllogism Wire Link', subtitle: 'Match deductive terms to meanings', focus: 'Formal propositional reasoning', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 105 },
    { levelNumber: 14, title: 'PSU Verbal Error Lab', subtitle: 'Preposition & subject concord checks', focus: 'Engineering PSU verbal cutoffs', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'grammar', requiredXp: 110 },
    { levelNumber: 15, title: 'GATE Verbal Synthesis', subtitle: 'Complex research hypothesis flow', focus: 'Scientific prose cohesion', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 115 },
    { levelNumber: 16, title: 'GATE General Aptitude Sprint', subtitle: '60s full general aptitude sprint', focus: 'Complete verbal score booster', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 130 },
  ],

  defence_cds: [
    { levelNumber: 1, title: 'Cadet Spell Check', subtitle: 'Lieutenant & manoeuvre tiles', focus: 'Core military & academy spellings', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'spell', requiredXp: 40 },
    { levelNumber: 2, title: 'Officer Virtues Match', subtitle: 'Intrepid, gallant & stalwart', focus: 'Defence character vocabulary', difficultyTag: 'Basics', difficultyStars: 1, puzzleMode: 'word_match', requiredXp: 45 },
    { levelNumber: 3, title: 'Fixed Preposition Zap', subtitle: 'Comply with, abide by & adhere to', focus: 'UPSC NDA / CDS prepositions', difficultyTag: 'Basics', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 50 },
    { levelNumber: 4, title: 'S1–S6 Tactical Jigsaw', subtitle: 'Assemble sequence blocks cleanly', focus: 'Ordering of words in sentence', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'jigsaw', requiredXp: 55 },
    { levelNumber: 5, title: 'CDS Vocab Duel', subtitle: 'Select exact synonym meanings', focus: 'UPSC CDS vocabulary staples', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'vocab', requiredXp: 60 },
    { levelNumber: 6, title: 'Courage vs Timidity Intruder', subtitle: 'Spot the outlier in antonym drills', focus: 'CDS antonym & synonym pairs', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'odd_one', requiredXp: 65 },
    { levelNumber: 7, title: 'Reconnaissance Anagrams', subtitle: 'Reconnaissance & camaraderie', focus: 'High-difficulty NDA spellings', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 70 },
    { levelNumber: 8, title: 'AFCAT Grammar Milestone', subtitle: 'As well as & correlative checks', focus: 'Compound subject concord', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 75 },
    { levelNumber: 9, title: 'Command Idiom Link', subtitle: 'Bite the bullet & tactical idioms', focus: 'AFCAT & CDS idioms & phrases', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 80 },
    { levelNumber: 10, title: 'Voice & Speech Sentry', subtitle: 'Zap active/passive verb traps', focus: 'Reported commands & voice', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 85 },
    { levelNumber: 11, title: 'Para-Ordering Jigsaw', subtitle: 'Reconstruct S1–S6 tactical reports', focus: 'Cohesive sequence markers', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 90 },
    { levelNumber: 12, title: 'Phrasal Verb Match', subtitle: 'Break out, call off & stand by', focus: 'Defence phrasal verb mastery', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 95 },
    { levelNumber: 13, title: 'CAPF Officer Vocab Duel', subtitle: 'High-stakes passage vocabulary', focus: 'Administrative & defence lexis', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 100 },
    { levelNumber: 14, title: 'CDS Part A/B/C Sentry', subtitle: 'Full error-spotting simulation', focus: 'UPSC CDS 20-mark error block', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'grammar', requiredXp: 105 },
    { levelNumber: 15, title: 'Strategic Inversion Jigsaw', subtitle: 'Had the convoy moved...', focus: 'Conditional & negative inversions', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 115 },
    { levelNumber: 16, title: 'IMA Officer Gauntlet', subtitle: '60s defence verbal sprint', focus: 'Speed & precision under pressure', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 130 },
  ],

  ielts_clat: [
    { levelNumber: 1, title: 'Academic Spellings', subtitle: 'Consensus & conscientious tiles', focus: 'IELTS Writing Task 2 precision', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'spell', requiredXp: 45 },
    { levelNumber: 2, title: 'Legal Maxims Wire Link', subtitle: 'Bona fide, ultra vires & quid pro quo', focus: 'Core CLAT & AILET Latin maxims', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 55 },
    { levelNumber: 3, title: 'Countable Trap Zap', subtitle: 'Fewer vs Less & gerund possessives', focus: 'IELTS Band 8+ grammar accuracy', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'bug_zap', requiredXp: 60 },
    { levelNumber: 4, title: 'Legal Clause Jigsaw', subtitle: 'Construct statutory argument flow', focus: 'CLAT legal reasoning syntax', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'jigsaw', requiredXp: 65 },
    { levelNumber: 5, title: 'Academic Collocation Match', subtitle: 'Ubiquitous, detrimental & indispensable', focus: 'Band 8+ lexical resource', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'word_match', requiredXp: 70 },
    { levelNumber: 6, title: 'Legal Lexicon Duel', subtitle: 'Ultra vires, equivocal & acquittal', focus: 'Constitutional & judicial terms', difficultyTag: 'Intermediate', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 75 },
    { levelNumber: 7, title: 'Jurisprudence Anagrams', subtitle: 'Jurisprudence & acquittal tiles', focus: 'Complex law & academic spellings', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'spell', requiredXp: 80 },
    { levelNumber: 8, title: 'Gerund & Case Milestone', subtitle: 'Possessive pronouns before gerunds', focus: 'Formal judicial English', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'grammar', requiredXp: 85 },
    { levelNumber: 9, title: 'Genuine vs Spurious Intruder', subtitle: 'Detect counterfeit or tone outliers', focus: 'Argument validity & nuance', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'odd_one', requiredXp: 90 },
    { levelNumber: 10, title: 'Evidence & Proof Duel', subtitle: 'Corroborate, equivocal & mitigate', focus: 'LSAT / CLAT reading nuance', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 95 },
    { levelNumber: 11, title: 'Judicial Comparison Zap', subtitle: 'Zap faulty precedent comparisons', focus: 'Parallel comparison accuracy', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 100 },
    { levelNumber: 12, title: 'Editorial Precision Match', subtitle: 'Match high-register Academic verbs', focus: 'Ameliorate, proliferate & curb', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 105 },
    { levelNumber: 13, title: 'Precedent Argument Jigsaw', subtitle: 'Assemble multi-clause rulings', focus: 'Complex subordination syntax', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 110 },
    { levelNumber: 14, title: 'Band 8+ Register Check', subtitle: 'Eliminate ambiguity & comma splices', focus: 'TOEFL / IELTS academic review', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'grammar', requiredXp: 115 },
    { levelNumber: 15, title: 'Rhetorical Clarity Intruder', subtitle: 'Spot subtle semantic drift', focus: 'Oxford / Ivy critical reading', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'odd_one', requiredXp: 120 },
    { levelNumber: 16, title: 'Chancery Scholar Sprint', subtitle: '60s legal & academic blitz', focus: 'Peak lexical mastery', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 135 },
  ],

  cat_upsc: [
    { levelNumber: 1, title: 'GRE High-Frequency 333', subtitle: 'Laconic, ubiquitous & obfuscate', focus: 'ETS high-yield vocabulary link', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'word_match', requiredXp: 50 },
    { levelNumber: 2, title: 'Elite Anagram Forge', subtitle: 'Grandiloquent & pusillanimous', focus: 'Polysyllabic GRE spellings', difficultyTag: 'Intermediate', difficultyStars: 2, puzzleMode: 'spell', requiredXp: 60 },
    { levelNumber: 3, title: 'GMAT Comparison Zap', subtitle: 'Zap "Like vs As" comparative errors', focus: 'GMAT comparison rubrics', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'bug_zap', requiredXp: 70 },
    { levelNumber: 4, title: 'Subjunctive Architecture', subtitle: 'Assemble "Mandate that X be..." syntax', focus: 'Mandative bossy-verb subjunctive', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'jigsaw', requiredXp: 75 },
    { levelNumber: 5, title: 'Verbal Logic Intruder', subtitle: 'Deduce subtle semantic distinctions', focus: 'Subtle degree & tone outliers', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'odd_one', requiredXp: 80 },
    { levelNumber: 6, title: 'GRE Context Completion', subtitle: 'Solve high-register sentence blanks', focus: 'Ostentatious, laconic & esoteric', difficultyTag: 'Advanced', difficultyStars: 3, puzzleMode: 'vocab', requiredXp: 85 },
    { levelNumber: 7, title: 'UPSC CSAT Vocabulary', subtitle: 'Administrative philosophical terms', focus: 'Wren & Martin advanced lexis', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'word_match', requiredXp: 90 },
    { levelNumber: 8, title: 'GMAT Sentence Correction Check', subtitle: 'Parallel comparison & subjunctives', focus: 'Official GMAC grammar rules', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'grammar', requiredXp: 95 },
    { levelNumber: 9, title: 'Sesquipedalian Anagrams', subtitle: 'Verisimilitude & perspicacious', focus: 'Rare etymology spellings', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'spell', requiredXp: 100 },
    { levelNumber: 10, title: 'GMAT Modifier Sentry', subtitle: 'Zap misplaced modifier clauses', focus: 'Noun-modifying vs adverbial clauses', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'bug_zap', requiredXp: 105 },
    { levelNumber: 11, title: 'CAT Critical Paragraph Jigsaw', subtitle: 'Reconstruct argument sequences', focus: 'Premise, evidence & conclusion', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'jigsaw', requiredXp: 110 },
    { levelNumber: 12, title: 'Governance & Philosophy Duel', subtitle: 'Match abstract & critical words', focus: 'UPSC Mains & CSAT precision', difficultyTag: 'Advanced', difficultyStars: 4, puzzleMode: 'vocab', requiredXp: 115 },
    { levelNumber: 13, title: 'Philosophical Tone Intruder', subtitle: 'Identify tone and bias in prose', focus: 'Epistemological register', difficultyTag: 'Advanced', difficultyStars: 5, puzzleMode: 'odd_one', requiredXp: 120 },
    { levelNumber: 14, title: 'Restrictive Clause Lab', subtitle: 'That vs Which punctuation precision', focus: 'CAT & GMAT clause accuracy', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'grammar', requiredXp: 125 },
    { levelNumber: 15, title: 'Epistemology Jigsaw', subtitle: 'Assemble complex philosophical prose', focus: 'Abstract clause architecture', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'jigsaw', requiredXp: 130 },
    { levelNumber: 16, title: 'The Ultimate Scholar Sprint', subtitle: '60s elite gauntlet finale', focus: 'Peak mastery across all domains', difficultyTag: 'Master', difficultyStars: 5, puzzleMode: 'arena', requiredXp: 150 },
  ],
};
