"use client";

import { useState, useEffect } from "react";
import type { Channel } from "@/lib/types";

interface ChannelSettingsProps {
  channel: Channel;
  open: boolean;
  onClose: () => void;
  onUpdate: (
    updates: Partial<Pick<Channel, "name" | "description" | "system_prompt">>
  ) => void;
  onDelete: () => void;
}

export default function ChannelSettings({
  channel,
  open,
  onClose,
  onUpdate,
  onDelete,
}: ChannelSettingsProps) {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [systemPrompt, setSystemPrompt] = useState(channel.system_prompt);
  const [showMemory, setShowMemory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setName(channel.name);
      setDescription(channel.description);
      setSystemPrompt(channel.system_prompt);
      setConfirmDelete(false);
      setShowMemory(false);
    }
  }, [open, channel]);

  if (!open) return null;

  const hasChanges =
    name !== channel.name ||
    description !== channel.description ||
    systemPrompt !== channel.system_prompt;

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdate({
      name: name.trim(),
      description: description.trim(),
      system_prompt: systemPrompt.trim(),
    });
    onClose();
  };

  const inputStyle = {
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ animation: "overlayFadeIn 0.2s ease-out" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "var(--bg-overlay)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in-scale max-h-[85vh] overflow-y-auto"
        style={{
          background: "var(--bg-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <h2
          className="text-[16px] font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Channel Settings
        </h2>

        <div className="space-y-3">
          <div>
            <label
              className="block text-[12px] font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none transition-shadow duration-200"
              style={inputStyle}
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

          <div>
            <label
              className="block text-[12px] font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none transition-shadow duration-200"
              style={inputStyle}
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

          <div>
            <label
              className="block text-[12px] font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Custom instructions for the AI in this channel..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none resize-none transition-shadow duration-200"
              style={inputStyle}
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

          {/* Memory summary */}
          {channel.memory_summary && (
            <div>
              <button
                type="button"
                onClick={() => setShowMemory(!showMemory)}
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
                    transform: showMemory
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <path d="M4 2l4 4-4 4" />
                </svg>
                Memory Summary
              </button>
              {showMemory && (
                <div
                  className="mt-2 px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed animate-fade-in"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {channel.memory_summary}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  color: "var(--red)",
                  background: "var(--red-subtle)",
                }}
              >
                Delete Channel
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-[12.5px]" style={{ color: "var(--red)" }}>
                  Confirm?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{
                    color: "var(--text-on-accent)",
                    background: "var(--red)",
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-[13px] px-2 py-1.5 rounded-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
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
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || !name.trim()}
              className="px-4 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-200 active:scale-[0.97]"
              style={{
                background:
                  hasChanges && name.trim()
                    ? "var(--accent)"
                    : "var(--bg-tertiary)",
                color:
                  hasChanges && name.trim()
                    ? "var(--text-on-accent)"
                    : "var(--text-tertiary)",
                cursor:
                  hasChanges && name.trim() ? "pointer" : "default",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
