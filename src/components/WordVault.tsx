import React, { useState } from 'react';
import { Bookmark, Volume2, Trash2, Plus, RotateCw, Search, ArrowLeft, BookOpen } from 'lucide-react';
import { GameStorage } from '../services/gameState';
import { sound } from '../services/sound';
import { ThemeId } from '../services/theme';

interface WordVaultProps {
  onBack: () => void;
  embedded?: boolean;
  theme?: ThemeId;
}

export const WordVault: React.FC<WordVaultProps> = ({
  onBack,
  embedded = false,
  theme = 'midnight',
}) => {
  const [stats, setStats] = useState(GameStorage.load());
  const [filter, setFilter] = useState<'all' | 'spelling' | 'vocab' | 'grammar' | 'bookmarked'>('all');
  const [search, setSearch] = useState('');
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [customWord, setCustomWord] = useState('');
  const [customPhonetic, setCustomPhonetic] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');
  const [customCategory, setCustomCategory] = useState<'spelling' | 'vocab' | 'grammar'>('spelling');

  const isLight = theme === 'clean_light' || theme === 'parchment';

  const filteredItems = stats.vaultItems.filter((item) => {
    if (filter === 'bookmarked' && !item.isBookmarked) return false;
    if (filter !== 'all' && filter !== 'bookmarked' && item.type !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDelete = (id: string) => {
    sound.playTap();
    GameStorage.removeVaultItem(id);
    setStats(GameStorage.load());
  };

  const handleToggleBookmark = (id: string) => {
    sound.playTap();
    GameStorage.toggleBookmark(id);
    setStats(GameStorage.load());
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWord.trim()) return;

    sound.playTap();
    GameStorage.addVaultItem({
      id: `custom_${Date.now()}`,
      type: customCategory,
      title: customWord.trim(),
      subtitle: customPhonetic.trim() || 'Custom Word',
      detail: customMeaning.trim() || 'Personal study card.',
    });

    setStats(GameStorage.load());
    setCustomWord('');
    setCustomPhonetic('');
    setCustomMeaning('');
    setShowAddModal(false);
  };

  const currentFlashcard = filteredItems[flashcardIdx];

  const surfaceCard = isLight
    ? 'bg-white border-slate-200 text-slate-900'
    : 'bg-slate-900/90 border-slate-800 text-slate-100';

  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div
      className={`relative w-full ${
        embedded ? '' : 'max-w-3xl mx-auto p-4 pb-10 min-h-[82vh]'
      } flex flex-col select-none`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {!embedded && (
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition whitespace-nowrap shrink-0 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold font-heading truncate">Word Vault</h2>
            <p className={`text-xs tabular-nums ${mutedText}`}>
              {stats.vaultItems.length} saved words and rules for quick review
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Word</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="my-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`} />
            <input
              type="text"
              placeholder="Search saved words or grammar rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500'
              }`}
            />
          </div>

          {filteredItems.length > 0 && (
            <button
              onClick={() => {
                setIsFlashcardMode(!isFlashcardMode);
                setFlashcardIdx(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition whitespace-nowrap shrink-0 ${
                isFlashcardMode
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isFlashcardMode ? 'List View' : 'Flashcard Mode'}</span>
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div
          className={`inline-flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          {(['all', 'spelling', 'vocab', 'grammar', 'bookmarked'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilter(tab);
                setFlashcardIdx(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap shrink-0 transition ${
                filter === tab
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'bookmarked' ? 'Bookmarked' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Flashcard Practice Mode */}
      {isFlashcardMode && currentFlashcard ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className={`text-xs font-medium tabular-nums mb-3 ${mutedText}`}>
            Card {flashcardIdx + 1} of {filteredItems.length}
          </div>

          <div
            onClick={() => {
              sound.playTap();
              setIsFlipped(!isFlipped);
            }}
            className={`w-full max-w-md min-h-[260px] rounded-2xl border p-6 flex flex-col justify-between items-center text-center cursor-pointer shadow-sm transition-transform duration-200 active:scale-[0.99] ${surfaceCard}`}
          >
            <div className="w-full flex items-center justify-between text-xs">
              <span className="font-semibold capitalize text-indigo-500">{currentFlashcard.type}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.speak(currentFlashcard.title, 0.85);
                }}
                className={`p-2 rounded-lg transition ${
                  isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-800 text-slate-300'
                }`}
                aria-label="Pronounce word"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {!isFlipped ? (
              <div className="my-4">
                <h3 className="text-3xl font-bold font-heading mb-2">{currentFlashcard.title}</h3>
                {currentFlashcard.subtitle && (
                  <p className={`text-xs font-mono ${mutedText}`}>{currentFlashcard.subtitle}</p>
                )}
              </div>
            ) : (
              <div className="my-4">
                <p className="text-base leading-relaxed font-medium">{currentFlashcard.detail}</p>
              </div>
            )}

            <div className={`text-xs ${mutedText}`}>
              {isFlipped ? 'Tap card to show word' : 'Tap card to reveal definition & rule'}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => {
                sound.playTap();
                setIsFlipped(false);
                setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
              }}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setIsFlipped(false);
                setFlashcardIdx((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Next Card
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className={`text-center py-14 rounded-2xl border ${surfaceCard}`}>
              <BookOpen className={`w-8 h-8 mx-auto mb-2.5 ${mutedText}`} />
              <p className="text-sm font-semibold">No saved words yet</p>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${mutedText}`}>
                Words you miss during puzzles or bookmark while playing are saved here automatically for review.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${surfaceCard}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base font-bold">{item.title}</span>
                    <span className={`text-xs capitalize ${mutedText}`}>· {item.type}</span>
                    {item.subtitle && (
                      <span className={`text-xs font-mono truncate ${mutedText}`}>
                        · {item.subtitle}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {item.detail}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => sound.speak(item.title, 0.85)}
                    className={`p-2 rounded-lg transition ${
                      isLight
                        ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Pronounce"
                    aria-label={`Pronounce ${item.title}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleBookmark(item.id)}
                    className={`p-2 rounded-lg transition ${
                      item.isBookmarked
                        ? 'text-amber-500'
                        : isLight
                        ? 'text-slate-400 hover:text-slate-700'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Bookmark"
                    aria-label={`Bookmark ${item.title}`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className={`p-2 rounded-lg transition ${
                      isLight
                        ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                        : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                    title="Remove"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${surfaceCard}`}>
            <h3 className="text-lg font-bold font-heading mb-1">Add Custom Study Card</h3>
            <p className={`text-xs mb-4 ${mutedText}`}>
              Add your own spelling words, vocabulary, or grammar notes to practice anytime.
            </p>

            <form onSubmit={handleAddCustom} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Word or Rule</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rendezvous, conscientious"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phonetic Hint or Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. French loanword"
                  value={customPhonetic}
                  onChange={(e) => setCustomPhonetic(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Definition or Memory Tip</label>
                <textarea
                  rows={2}
                  placeholder="e.g. A planned meeting at an agreed time and place."
                  value={customMeaning}
                  onChange={(e) => setCustomMeaning(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <div className="flex gap-2">
                  {(['spelling', 'vocab', 'grammar'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCustomCategory(cat)}
                      className={`flex-1 py-2 rounded-lg capitalize font-semibold border transition ${
                        customCategory === cat
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-600'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl border font-semibold ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
