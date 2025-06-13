import json
import logging
import os
import shutil

import yaml

script_dir = os.path.dirname(__file__)
output_folder = os.path.join(script_dir, "..", "frontend", "public", "metadata")
data_dir = os.path.join(script_dir, "content", "data")


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


def log_message(message):
    logging.info(message)


def parse_yaml(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def parse_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


SUMMARY_DATA_KEY_MAPPINGS = {
    "bioconda": {
        "bioconda__name": ("package", "name"),
        "bioconda__version": ("package", "version"),
        "bioconda__license": ("about", "license"),
        "bioconda__summary": ("about", "summary"),
    },
    "biotools": {
        "biotools__license": ("license",),
        "biotools__summary": ("description",),
        "biotools__addition_date": ("additionDate",),
        "biotools__last_update_date": ("lastUpdate",),
        "biotools__version": ("version",),
    },
    "bioschemas": {
        "bioschemas__name": ("sc:name",),
        "bioschemas__license": ("sc:license",),
        "bioschemas__version": ("sc:softwareVersion",),
    },
    "galaxy": {
        "galaxy__summary": ("Description",),
        "galaxy__edam_topics": ("EDAM_topics",),
    },
    "biocontainers": {
        "biocontainers__name": ("name",),
        "biocontainers__license": ("license",),
        "biocontainers__summary": ("description",),
    },
}

PAGE_DATA_KEY_MAPPINGS = {
    "bioconda": {
        "bioconda__name": ("package", "name"),
        "bioconda__version": ("package", "version"),
        "bioconda__home": ("about", "home"),
        "bioconda__documentation": ("about", "doc_url"),
        "bioconda__license": ("about", "license"),
        "bioconda__summary": ("about", "summary"),
        "bioconda__identifiers": ("extra", "identifiers"),
    },
    "biocontainers": {
        "biocontainers__name": ("name",),
        "biocontainers__identifiers": ("identifiers",),
        "biocontainers__license": ("license",),
        "biocontainers__summary": ("description",),
    },
    "biotools": {
        "biotools__id": ("biotoolsID",),
        "biotools__home": ("homepage",),
        "biotools__license": ("license",),
        "biotools__summary": ("description",),
        "biotools__addition_date": ("additionDate",),
        "biotools__last_update_date": ("lastUpdate",),
        "biotools__tool_type": ("toolType",),
        "biotools__version": ("version",),
    },
    "bioschemas": {
        "bioschemas__name": ("sc:name",),
        "bioschemas__home": ("@id",),
        "bioschemas__license": ("sc:license",),
        "bioschemas__version": ("sc:softwareVersion",),
        "bioschemas__summary": ("sc:description",),
        "bioschemas__tool_type": ("@type",),
    },
    "galaxy": {
        "galaxy__first_commit": ("Suite_first_commit_date",),
        "galaxy__conda_name": ("Suite_conda_package",),
        "galaxy__conda_version": ("Latest_suite_conda_package_version",),
        "galaxy__summary": ("Description",),
        "galaxy__edam_operations": ("EDAM_operations",),
        "galaxy__edam_topics": ("EDAM_topics",),
        "galaxy__toolshed_categories": ("ToolShed_categories",),
        "galaxy__toolshed_id": ("Suite_ID",),
        "galaxy__users_5_years": ("Suite_users_(last_5_years)_on_main_servers",),
        "galaxy__users_all_time": ("Suite_users_on_main_servers",),
        "galaxy__usage_5_years": ("Suite_runs_(last_5_years)_on_main_servers",),
        "galaxy__usage_all_time": ("Suite_runs_on_main_servers",),
        "galaxy__bio_tools_summary": ("bio.tool_description",),
        "galaxy__bio_tools_ids": ("bio.tool_ID",),
        "galaxy__bio_tools_name": ("bio.tool_name",),
        "galaxy__related_tutorials": ("Related_Tutorials",),
        "galaxy__related_workflows": ("Related_Workflows",),
        "galaxy__tool_ids": ("Tool_IDs",),
        "galaxy__number_of_tools_on_usegalaxy_eu": ("Number_of_tools_on_UseGalaxy.eu",),
    },
}


def extract_data(tool_type, data, key_mappings):
    mappings = key_mappings.get(tool_type, {})
    if tool_type == "bioschemas":
        graph = data.get("@graph", [])
        software_data = next(
            (
                entry
                for entry in graph
                if entry.get("@type") == "sc:SoftwareApplication"
            ),
            None,
        )
        if software_data:
            return {
                k: traverse_keys(software_data, *v) or None for k, v in mappings.items()
            }
        else:
            return {}
    else:
        return {k: traverse_keys(data, *v) or None for k, v in mappings.items()}


def traverse_keys(data, *keys):
    for key in keys:
        if isinstance(data, list):
            data = data[0] if data else None
        elif isinstance(data, dict):
            data = data.get(key)
        else:
            return None
    return data


def process_files_in_folder(folder_path):
    folder_name = os.path.basename(folder_path)
    log_message(f"Extracting data for: {folder_name}")

    file_patterns = [
        (f"bioconda_{folder_name}.yaml", "bioconda"),
        (f"{folder_name}.biocontainers.yaml", "biocontainers"),
        (f"{folder_name}.biotools.json", "biotools"),
        (f"{folder_name}.bioschemas.jsonld", "bioschemas"),
        (f"{folder_name}.galaxy.json", "galaxy"),
    ]

    contents, fetched_metadata, extracted_page_metadata = set(), {}, {}

    for file_name, tool_type in file_patterns:
        file_path = os.path.join(folder_path, file_name)
        if not os.path.exists(file_path):
            # log_message(f"File not found: {file_path}")
            continue

        contents.add(tool_type)

        ext = os.path.splitext(file_path)[1]
        data = (
            parse_yaml(file_path)
            if ext in [".yaml", ".yml"]
            else parse_json(file_path) if ext in [".json", ".jsonld"] else None
        )
        if data is None:
            continue

        # log_message(f"Extracted data for file {file_name}: {extracted_data}")

        extracted_data = extract_data(tool_type, data, SUMMARY_DATA_KEY_MAPPINGS)
        for key, value in extracted_data.items():
            if value:
                fetched_metadata[key] = value

        page_data = extract_data(tool_type, data, PAGE_DATA_KEY_MAPPINGS)
        if page_data:
            for key, value in page_data.items():
                if value:
                    extracted_page_metadata[key] = value

    metadata = {
        "tool_name": folder_name,
        "contents": list(contents),
        "fetched_metadata": fetched_metadata,
    }

    page_metadata = {
        "tool_name": folder_name,
        "contents": list(contents),
        "page_metadata": extracted_page_metadata,
    }

    return metadata, page_metadata


def main():
    combined_metadata = []

    for root, _, _ in os.walk(data_dir):
        if root != data_dir:
            metadata, page_metadata = process_files_in_folder(root)
            combined_metadata.append(metadata)
            save_metadata(f"tools/{page_metadata['tool_name']}.json", page_metadata)

    save_metadata("combined_metadata.json", combined_metadata)


def save_metadata(output_file, metadata):
    output_combined_file = os.path.join(output_folder, output_file)
    os.makedirs(os.path.dirname(output_combined_file), exist_ok=True)
    with open(output_combined_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, separators=(",", ":"))


if __name__ == "__main__":
    log_message("Starting metadata extraction and merging process")
    shutil.rmtree(output_folder, ignore_errors=True)
    log_message(f"Fetching metadata from the directory {data_dir}")
    main()
    log_message(f"Metadata combined and saved")
