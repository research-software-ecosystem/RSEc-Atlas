declare global {
  interface Tool {
    tool_name: string;
    description?: string;
    contents?: string[];
    fetched_metadata: {
      bioschemas?: {
        name?: string;
        version?: string;
        license?: string;
      };
      bioconda?: {
        name?: string;
        version?: string;
        license?: string;
        summary?: string;
      };
      biotools?: {
        version?: string[];
        license?: string;
        last_update_date?: string;
        addition_date?: string;
        summary?: string;
      };
      biocontainers?: {
        name?: string;
        license?: string;
        summary?: string;
      };
      galaxy?: {
        summary?: string;
        edam_topics?: string[];
      };
    };
  }

  type Tools = Tool[];
}
