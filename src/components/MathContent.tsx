"use client";

import { useMemo } from "react";
import katex from "katex";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

function renderMath(expression: string, display: boolean): string {
  try {
    return katex.renderToString(expression, {
      displayMode: display,
      throwOnError: false,
      strict: "ignore",
    });
  } catch {
    return escapeHtml(expression);
  }
}

/**
 * Renders text containing inline `$...$` and display `$$...$$` LaTeX segments.
 * Content is authored/trusted, so the generated KaTeX HTML is injected directly.
 */
export function MathContent({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const html = useMemo(() => {
    const pattern = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
    const parts: string[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      parts.push(escapeHtml(text.slice(last, match.index)));
      if (match[1] !== undefined) {
        parts.push(renderMath(match[1], true));
      } else if (match[2] !== undefined) {
        parts.push(renderMath(match[2], false));
      }
      last = match.index + match[0].length;
    }
    parts.push(escapeHtml(text.slice(last)));
    return parts.join("");
  }, [text]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
