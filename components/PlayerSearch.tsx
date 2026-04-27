'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Player } from '@/types/game';
import { searchPlayers, getPlayerImageUrl, getPlayerInitials } from '@/lib/playerUtils';

interface PlayerSearchProps {
  onSelect: (player: Player) => void;
  placeholder?: string;
}

export default function PlayerSearch({ onSelect, placeholder = 'Search for a player…' }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      debounceRef.current = setTimeout(() => {
        setSuggestions([]);
        setIsOpen(false);
        setActiveIndex(-1);
      }, 0);
      return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }
    const q = query;
    debounceRef.current = setTimeout(() => {
      const results = searchPlayers(q);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function handleSelect(player: Player) {
    setSuggestions([]); setIsOpen(false); setQuery(''); setActiveIndex(-1);
    onSelect(player);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex >= 0) handleSelect(suggestions[activeIndex]); }
    else if (e.key === 'Escape') { setIsOpen(false); setActiveIndex(-1); }
  }

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    (listRef.current.children[activeIndex] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="search-input"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="player-search-listbox"
        role="combobox"
      />

      {isOpen && suggestions.length > 0 && (
        <ul id="player-search-listbox" ref={listRef} role="listbox" className="search-dropdown">
          {suggestions.map((player, idx) => {
            const imgUrl = getPlayerImageUrl(player);
            const initials = getPlayerInitials(player.name);
            const isActive = idx === activeIndex;
            return (
              <li
                key={player.id}
                role="option"
                aria-selected={isActive}
                onMouseDown={e => { e.preventDefault(); handleSelect(player); }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`search-item ${isActive ? 'search-item--active' : ''}`}
              >
                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-lo)' }}>{initials}</span>
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="search-item-name" style={{ fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-lo)' }}>{player.position} · {player.nationality}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
