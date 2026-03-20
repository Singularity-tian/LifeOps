"use client";

import { useState, useRef, useEffect } from "react";

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    description: string,
    systemPrompt: string
  ) => void;
}

export default function CreateChannelDialog({
  open,
  onClose,
  onCreate,
}: CreateChannelDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSystemPrompt("");
      setShowAdvanced(false);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), systemPrompt.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ animation: "overlayFadeIn 0.2s ease-out" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "var(--bg-overlay)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in-scale"
        style={{
          background: "var(--bg-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <h2
          className="text-[16px] font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          New Channel
        </h2>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label
              className="block text-[12px] font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., stocks, school, work"
              className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none transition-shadow duration-200"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--accent-medium)`;
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-[12px] font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
              <span
                className="ml-1.5 normal-case tracking-normal font-normal"
                style={{ color: "var(--text-tertiary)" }}
              >
                optional
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none transition-shadow duration-200"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--accent-medium)`;
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[13px] font-medium flex items-center gap-1 transition-colors duration-200"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                transform: showAdvanced
                  ? "rotate(90deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M4 2l4 4-4 4" />
            </svg>
            Advanced
          </button>

          {showAdvanced && (
            <div className="animate-fade-in">
              <label
                className="block text-[12px] font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                System Prompt
                <span
                  className="ml-1.5 normal-case tracking-normal font-normal"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  customize AI behavior for this channel
                </span>
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="e.g., You are a stock analysis assistant focused on tech stocks..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none resize-none transition-shadow duration-200"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px var(--accent-medium)`;
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-200 active:scale-[0.97]"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-200 active:scale-[0.97]"
            style={{
              background: name.trim()
                ? "var(--accent)"
                : "var(--bg-tertiary)",
              color: name.trim()
                ? "var(--text-on-accent)"
                : "var(--text-tertiary)",
              cursor: name.trim() ? "pointer" : "default",
            }}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
