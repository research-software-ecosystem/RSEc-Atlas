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
