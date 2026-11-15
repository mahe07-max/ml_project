import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const normalize = (value) => value.trim().toLocaleLowerCase();

export default function AutocompleteInput({
  id,
  name,
  value,
  options = [],
  onChange,
  onSelect,
  className = 'input',
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listId = `${inputId}-options`;
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const uniqueOptions = useMemo(() => {
    const seen = new Set();
    return options.filter((option) => {
      const key = normalize(option);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [options]);

  const matchingOptions = useMemo(() => {
    const query = normalize(value || '');
    const matches = query
      ? uniqueOptions.filter((option) => normalize(option).includes(query))
      : uniqueOptions;
    return matches.slice(0, 8);
  }, [uniqueOptions, value]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [uniqueOptions, value]);

  useEffect(() => {
    const closeOnOutsidePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  const selectOption = (option) => {
    onChange(option);
    onSelect?.(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && matchingOptions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index + 1) % matchingOptions.length);
    } else if (event.key === 'ArrowUp' && matchingOptions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index <= 0 ? matchingOptions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
      event.preventDefault();
      selectOption(matchingOptions[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <input
        {...inputProps}
        id={inputId}
        name={name}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        className={`${className} pr-10`}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(-1);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        aria-label={`Show ${name || 'field'} suggestions`}
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-emerald-50 hover:text-agri-green"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsOpen((open) => !open)}
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-emerald-950/10"
        >
          {matchingOptions.length > 0 ? matchingOptions.map((option, index) => (
            <button
              key={option}
              id={`${listId}-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                activeIndex === index
                  ? 'bg-emerald-50 font-semibold text-agri-dark'
                  : 'text-slate-700 hover:bg-emerald-50'
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
            >
              {option}
            </button>
          )) : (
            <div className="px-3 py-2.5 text-sm text-slate-500" role="status">
              {uniqueOptions.length === 0 ? 'No options available for this selection.' : 'No matching results.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
