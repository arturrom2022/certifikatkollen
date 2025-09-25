"use client"

import { ReactNode } from "react"

export type Option = { value: string; label: string }

export default function FilterBar({
  // Select
  selectId = "status",
  selectLabel = "Status",
  selectOptions,
  selectValue,
  onSelectChange,
  // Search
  searchId = "search",
  searchLabel = "Sök",
  searchPlaceholder = "Sök",
  searchValue,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchKeyDown,
  // A11y for autocomplete
  searchAriaControls,
  searchAriaAutocomplete = "list",
  // Autocomplete dropdown (renderas under inputen)
  autocomplete,
  // Extra (högerställda actions/knappar)
  toolbarPrefix,
}: {
  selectId?: string
  selectLabel?: string
  selectOptions: Option[]
  selectValue: string
  onSelectChange: (value: string) => void

  searchId?: string
  searchLabel?: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchFocus?: () => void
  onSearchBlur?: () => void
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void

  searchAriaControls?: string
  searchAriaAutocomplete?: "none" | "inline" | "list" | "both"

  autocomplete?: ReactNode
  toolbarPrefix?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-3">
      {/* Select – fast, smal bredd på desktop */}
      <div className="flex w-full flex-col md:w-32 md:flex-none md:shrink-0">
        <label
          htmlFor={selectId}
          className="mb-1 text-xs font-medium text-gray-700"
        >
          {selectLabel}
        </label>
        <div className="relative">
          <select
            id={selectId}
            value={selectValue}
            onChange={(e) => onSelectChange(e.target.value)}
            className="w-full appearance-none rounded-md border border-gray-300 pl-3 pr-10 py-2 text-sm
                       focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          >
            {selectOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {/* caret */}
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Sök – fyller all restyta fram till knapparna */}
      <div className="flex w-full flex-col md:flex-1 md:min-w-[18rem] md:max-w-36">
        <label
          htmlFor={searchId}
          className="mb-1 text-xs font-medium text-gray-700"
        >
          {searchLabel}
        </label>
        <div className="relative">
          <input
            id={searchId}
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onKeyDown={onSearchKeyDown}
            role="combobox"
            aria-expanded={!!autocomplete}
            aria-controls={searchAriaControls}
            aria-autocomplete={searchAriaAutocomplete}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            autoComplete="off"
            spellCheck={false}
          />
          {autocomplete}
        </div>
      </div>

      {/* Knappar till höger (jämnt avstånd via gap) */}
      {toolbarPrefix ? (
        <div className="flex items-center gap-3 shrink-0">{toolbarPrefix}</div>
      ) : null}
    </div>
  )
}
