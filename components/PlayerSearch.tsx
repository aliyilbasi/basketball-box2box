'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Player } from '@/types/game';
import { searchPlayers, getPlayerImageUrl, getPlayerInitials } from '@/lib/playerUtils';

interface PlayerSearchProps {
  onSelect: (player: Player) => void;
  placeholder?: string;
}

export default function PlayerSearch({
  onSelect,
  placeholder = 'Search for a player…',
}: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    // Capture query at scheduling time to detect staleness
    const currentQuery = query;
    debounceRef.current = setTimeout(() => {
      const results = searchPlayers(currentQuery);
      // Only apply if query hasn't changed since we scheduled
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(player: Player) {
    setSuggestions([]);
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
    onSelect(player);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 rounded-lg bg-gray-800 border border-gray-600 shadow-xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((player, idx) => {
            const imgUrl = getPlayerImageUrl(player);
            const initials = getPlayerInitials(player.name);
            return (
              <li
                key={player.id}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseDown={e => {
                  // Prevent input blur before click registers
                  e.preventDefault();
                  handleSelect(player);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                  idx === activeIndex
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-200 hover:bg-gray-700'
                } ${idx < suggestions.length - 1 ? 'border-b border-gray-700' : ''}`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center">
                  {imgUrl ? (
                    <img src={imgUrl} alt={player.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  ) : (
                    <span className="text-xs font-bold text-gray-400">{initials}</span>
                  )}
                </div>
                {/* Name + info */}
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{player.name}</span>
                  <span className="text-xs text-gray-400">{player.position} · {player.nationality}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
