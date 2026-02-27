"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface SlackDraftProps {
  draft: string | null;
}

export function SlackDraft({ draft }: SlackDraftProps) {
  const [value, setValue] = useState(draft ?? "");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
        <span className="text-[13px] font-semibold text-gray-800">
          Slack Draft
        </span>
        <span className="text-xs text-gray-400">#psc-team</span>
      </div>

      <div className="p-4">
        {draft ? (
          <>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-[160px] resize-y bg-[#f8f8f8] font-sans text-[13px] leading-relaxed"
            />
            <div className="mt-3 flex items-center gap-2">
              <Button onClick={handleCopy} size="sm">
                Copy to clipboard
              </Button>
              {copied && (
                <span className="text-xs text-green">Copied!</span>
              )}
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-[13px] text-gray-400">
            Run an analysis to generate your Slack draft.
          </p>
        )}
      </div>
    </div>
  );
}
