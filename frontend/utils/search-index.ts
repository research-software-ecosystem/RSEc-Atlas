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
      descriptions[tool.tool_name] = description;
    }
  }

  return { index, descriptions };
}
