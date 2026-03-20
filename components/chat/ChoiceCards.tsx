"use client";

import type { Choice } from "@/lib/types";

interface ChoiceCardsProps {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
  disabled?: boolean;
  selectedValue?: string | null;
}

export default function ChoiceCards({
  choices,
  onSelect,
  disabled,
  selectedValue,
}: ChoiceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 stagger-children">
      {choices.map((choice) => {
        const isSelected = selectedValue === choice.value;
        const isFaded = selectedValue != null && !isSelected;

        return (
          <button
            key={choice.value}
            onClick={() => !disabled && !selectedValue && onSelect(choice)}
            disabled={disabled || selectedValue != null}
            className="text-left px-3.5 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: isSelected
                ? "var(--bg-choice-selected)"
                : "var(--bg-choice)",
              boxShadow: isSelected
                ? "none"
                : "var(--shadow-choice)",
              opacity: isFaded ? 0.45 : 1,
              color: isSelected
                ? "var(--text-on-accent)"
                : "var(--text-primary)",
              cursor:
                disabled || selectedValue != null ? "default" : "pointer",
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (!disabled && !selectedValue) {
                e.currentTarget.style.boxShadow =
                  "var(--shadow-choice-hover)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !selectedValue) {
                e.currentTarget.style.boxShadow = isSelected
                  ? "none"
                  : "var(--shadow-choice)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
            onMouseDown={(e) => {
              if (!disabled && !selectedValue) {
                e.currentTarget.style.transform = "scale(0.98)";
              }
            }}
            onMouseUp={(e) => {
              if (!disabled && !selectedValue) {
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
          >
            <span
              className="block text-[13.5px] font-medium leading-snug"
              style={{
                color: isSelected
                  ? "var(--text-on-accent)"
                  : "var(--text-primary)",
              }}
            >
              {choice.label}
            </span>
            {choice.description && (
              <span
                className="block text-[12.5px] mt-0.5 leading-snug"
                style={{
                  color: isSelected
                    ? "rgba(255,255,255,0.75)"
                    : "var(--text-secondary)",
                }}
              >
                {choice.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
