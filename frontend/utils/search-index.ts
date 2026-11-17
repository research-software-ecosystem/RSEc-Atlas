// Imported explicitly: the module building the index at generate time loads
// this file outside of Nuxt, where nothing is auto-imported.
import {
  getToolDescription,
  getToolLicense,
  getToolName,
  getToolTags,
  getToolTopics,
  getToolVersion,
} from "./tools";

export const NO_DESCRIPTION = "No description";

// Longer descriptions are cut in the home page's file to keep it small; the full text stays on the tool page.
export const MAX_DESCRIPTION_LENGTH = 300;

// Cuts at the last word boundary within the limit and ends with "…"; shorter text is unchanged.
function shortenDescription(description: string): string {
  if (description.length <= MAX_DESCRIPTION_LENGTH) return description;

  let head = description.slice(0, MAX_DESCRIPTION_LENGTH);
  // The limit falls inside a word unless the next character is whitespace.
  if (!/\s/.test(description[MAX_DESCRIPTION_LENGTH])) {
    const boundary = head.search(/\s\S*$/);
    if (boundary > 0) head = head.slice(0, boundary);
  }
  // A lone high surrogate would be half of a character.
  if (/[\uD800-\uDBFF]$/.test(head)) head = head.slice(0, -1);

  const trimmed = head.replace(/[\s,.;:!?\-–—]+$/, "");
  return `${trimmed || head}…`;
}

function toEpochSeconds(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? undefined : Math.floor(time / 1000);
}

export function toIndexEntry(tool: Tool): ToolIndexEntry {
  const { biotools } = tool.fetched_metadata;
  const topics = getToolTopics(tool);
  const tags = getToolTags(tool);

  // Empty fields are left out to keep the index small.
  return {
    tool_name: tool.tool_name,
    name: getToolName(tool),
    description: getToolDescription(tool),
    license: getToolLicense(tool),
    version: getToolVersion(tool),
    added: toEpochSeconds(biotools?.addition_date),
    updated: toEpochSeconds(biotools?.last_update_date),
    topics: topics.length > 0 ? topics : undefined,
    tags: tags.length > 0 ? tags : undefined,
    contents: tool.contents,
  };
}

// The two files the home page loads: the index without the descriptions, and
// the descriptions by tool name.
export function buildSearchFiles(tools: Tool[]): {
  index: ToolIndexEntry[];
  descriptions: Record<string, string>;
} {
  const index: ToolIndexEntry[] = [];
  // No prototype, so a tool named "__proto__" stays a key in the emitted file.
  const descriptions: Record<string, string> = Object.create(null);

  for (const tool of tools) {
    const { description, ...entry } = toIndexEntry(tool);
    index.push(entry);
    // Tools without one read the default, as their pages do.
    if (description && description !== NO_DESCRIPTION) {
      descriptions[tool.tool_name] = shortenDescription(description);
    }
  }

  return { index, descriptions };
}
