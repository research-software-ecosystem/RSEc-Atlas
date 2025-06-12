import hashlib
import json
import logging
import os

import yaml

logging.basicConfig(
    filename=os.path.join(os.path.dirname(__file__), "last_run_logs.txt"),
    filemode="w",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


def log_message(message):
    logging.info(message)


def hash_content(content):
    return hashlib.md5(json.dumps(content, sort_keys=True).encode()).hexdigest()


def parse_yaml(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def parse_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


DATA_KEY_MAPPINGS = {
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


def extract_data(tool_type, data):
    mappings = DATA_KEY_MAPPINGS.get(tool_type, {})
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


def process_files_in_folder(folder_path, search_index, hash_map, data_dir):
    log_message(f"Extracting data for folder: {folder_path}")
    fetched_metadata = {}
    folder_name = os.path.basename(folder_path)

    file_patterns = [
        (f"bioconda_{folder_name}.yaml", "bioconda"),
        (f"{folder_name}.biocontainers.yaml", "biocontainers"),
        (f"{folder_name}.biotools.json", "biotools"),
        (f"{folder_name}.bioschemas.jsonld", "bioschemas"),
        (f"{folder_name}.galaxy.json", "galaxy"),
    ]

    contents = set()

    for file_name, tool_type in file_patterns:
        file_path = os.path.join(folder_path, file_name)
        if not os.path.exists(file_path):
            log_message(f"File not found: {file_path}")
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

        extracted_data = extract_data(tool_type, data)
        log_message(f"Extracted data for file {file_name}: {extracted_data}")

        for key, value in extracted_data.items():
            if value:
                fetched_metadata[key] = {"file_name": file_name, "value": value}

    content_hash = hash_content(fetched_metadata)

    if content_hash in hash_map:
        hash_map[content_hash].append(folder_path)
    else:
        hash_map[content_hash] = [folder_path]

    metadata = {
        "search_index": search_index,
        "tool_name": folder_name,
        "contents": list(contents),
        "fetched_metadata": {k: v["value"] for k, v in fetched_metadata.items()},
    }

    return metadata, content_hash


def scan_directory(data_dir):
    search_index = 1
    combined_metadata = []
    hash_map = {}

    for root, dirs, files in os.walk(data_dir):
        if root != data_dir:
            metadata, content_hash = process_files_in_folder(
                root, search_index, hash_map, data_dir
            )
            combined_metadata.append(metadata)
            search_index += 1

    return combined_metadata


def save_combined_metadata(output_file, combined_metadata):
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(combined_metadata, f, separators=(",", ":"))


def main():
    script_dir = os.path.dirname(__file__)
    data_dir = os.path.join(script_dir, "content", "data")
    output_file = os.path.join(
        script_dir, "..", "StaticSiteGeneration", "public", "combined_metadata.json"
    )

    log_message(f"Fetching metadata from the directory {data_dir}")

    combined_metadata = scan_directory(data_dir)
    save_combined_metadata(output_file, combined_metadata)

    log_message(f"Metadata combined and saved to {output_file}")


if __name__ == "__main__":
    main()
