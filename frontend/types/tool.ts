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
        home?: string;
        license?: string;
        summary?: string;
        homepage?: string;
        documentation?: string;
        identifiers?: string[];
      };
      biotools?: {
        home?: string;
        version?: string | string[];
        license?: string;
        last_update_date?: string;
        addition_date?: string;
        summary?: string;
      };
      biocontainers?: {
        name?: string;
        license?: string;
        summary?: string;
        identifiers?: string[];
      };
      galaxy?: {
        summary?: string;
        source?: string;
        first_commit?: string;
        edam_operations?: string[];
        edam_topics?: string[];
        related_workflows?: string[];
        related_tutorials?: string[];
        usage_5_years: number;
        usage_all_time: number;
        users_5_years: number;
        users_all_time: number;
        toolshed_id?: string;
        toolshed_categories?: string[];
        bio_tools_name?: string;
        bio_tools_ids?: string[];
        conda_name?: string;
        conda_version?: string;
        tool_ids?: string[];
        no_of_tools?: {
          [country: string]: number;
        };
      };
    };
  }

  type Tools = Tool[];
}
