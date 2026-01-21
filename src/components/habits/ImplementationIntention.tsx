'use client';

/**
 * ImplementationIntention - Displays the habit's implementation intention
 * in a subtle, readable format.
 */

interface ImplementationIntentionProps {
  intention: string;
  /** Collapsed by default, expandable on click */
  collapsible?: boolean;
  /** Max lines to show when collapsed */
  maxLines?: number;
}

import { useState } from 'react';

export function ImplementationIntention({
  intention,
  collapsible = false,
  maxLines = 2
}: ImplementationIntentionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!intention) return null;

  const lineClampClass = !expanded && collapsible
    ? maxLines === 1 ? 'line-clamp-1' : maxLines === 2 ? 'line-clamp-2' : 'line-clamp-3'
    : '';

  return (
    <div
      className={`text-[#92c0c9]/80 text-sm leading-relaxed italic ${
        collapsible ? 'cursor-pointer hover:text-[#92c0c9]' : ''
      } ${lineClampClass}`}
      onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      title={collapsible && !expanded ? 'Click to expand' : undefined}
    >
      &ldquo;{intention}&rdquo;
    </div>
  );
}

/**
 * CompactIntention - Even more compact version for tight spaces
 */
interface CompactIntentionProps {
  intention: string;
}

export function CompactIntention({ intention }: CompactIntentionProps) {
  if (!intention) return null;

  // Truncate to ~60 chars
  const truncated = intention.length > 60
    ? intention.substring(0, 57) + '...'
    : intention;

  return (
    <p
      className="text-[#92c0c9]/70 text-xs italic truncate"
      title={intention}
    >
      &ldquo;{truncated}&rdquo;
    </p>
  );
}
