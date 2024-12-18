import os
import json
import yaml
import hashlib

def log_message(message, log_file='last_run_logs.txt'):
    print(message)
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(message + '\n')

def hash_content(content):
    return hashlib.md5(json.dumps(content, sort_keys=True).encode()).hexdigest()

def parse_yaml(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def parse_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def replace_empty_with_null(value):
    if value in ["", [], None]:
        return None
    return value

def extract_bioconda_data(data):
    return {
        "bioconda__name": replace_empty_with_null(data.get('package', {}).get('name')),
        "bioconda__home": replace_empty_with_null(data.get('about', {}).get('home')),
        "bioconda__documentation": replace_empty_with_null(data.get('about', {}).get('doc_url')),
        "bioconda__license": replace_empty_with_null(data.get('about', {}).get('license')),
        "bioconda__summary": replace_empty_with_null(data.get('about', {}).get('summary')),
        "bioconda__identifiers": replace_empty_with_null(data.get('extra', {}).get('identifiers')),
        "bioconda__version": replace_empty_with_null(data.get('package', {}).get('version'))
    }

def extract_biocontainers_data(data):
    return {
        "biocontainers__name": replace_empty_with_null(data.get('name')),
        "biocontainers__home": replace_empty_with_null(data.get('home_url')),
        "biocontainers__license": replace_empty_with_null(data.get('license')),
        "biocontainers__summary": replace_empty_with_null(data.get('description')),
        "biocontainers__identifiers": replace_empty_with_null(data.get('identifiers')),
        "biocontainers__total_pulls": replace_empty_with_null(data.get('total_pulls'))
    }

def extract_biotools_data(data):
    return {
        "biotools__home": replace_empty_with_null(data.get('homepage')),
        "biotools__license": replace_empty_with_null(data.get('license')),
        "biotools__summary": replace_empty_with_null(data.get('description')),
        "biotools__addition_date": replace_empty_with_null(data.get('additionDate')),
        "biotools__last_update_date": replace_empty_with_null(data.get('lastUpdate')),
        "biotools__tool_type": replace_empty_with_null(data.get('toolType'))
    }

def extract_bioschemas_data(data):
    if "@graph" not in data or not isinstance(data["@graph"], list):
        return {}
    bioschemas_entry = data["@graph"][0] if data["@graph"] else {}
    return {
        "bioschemas__name": replace_empty_with_null(bioschemas_entry.get('sc:name')),
        "bioschemas__home": replace_empty_with_null(bioschemas_entry.get('@id')),
        "bioschemas__license": replace_empty_with_null(bioschemas_entry.get('sc:license')),
        "bioschemas__summary": replace_empty_with_null(bioschemas_entry.get('sc:description')),
        "bioschemas__primary_contact": replace_empty_with_null(bioschemas_entry.get('biotools:primaryContact')),
        "bioschemas__tool_type": replace_empty_with_null(bioschemas_entry.get('@type'))
    }

def extract_galaxy_data(data):
    return {
        "galaxy__first_commit": replace_empty_with_null(data.get('Date_of_first_commit_of_the_suite')),
        "galaxy__source": replace_empty_with_null(data.get('Source')),
        "galaxy__status": replace_empty_with_null(data.get('Status')),
        "galaxy__conda_name": replace_empty_with_null(data.get('Conda_id')),
        "galaxy__conda_version": replace_empty_with_null(data.get('Conda_version')),
        "galaxy__summary": replace_empty_with_null(data.get('Description')),
        "galaxy__galaxy_ids": replace_empty_with_null(data.get('Galaxy_tool_ids')),
        "galaxy__edam_operation": replace_empty_with_null(data.get('EDAM_operation')),
        "galaxy__edam_topic": replace_empty_with_null(data.get('EDAM_topic')),
        "galaxy__toolshed_categories": replace_empty_with_null(data.get('ToolShed_categories')),
        "galaxy__toolshed_id": replace_empty_with_null(data.get('ToolShed_id')),
        "galaxy__users_5_years": replace_empty_with_null(data.get('No._of_tool_users_(5_years)_-_all_main_servers')),
        "galaxy__users_all_time": replace_empty_with_null(data.get('No._of_tool_users_(all_time)_-_all_main_servers')),
        "galaxy__usage_5_years": replace_empty_with_null(data.get('Tool_usage_(5_years)_-_all_main_servers')),
        "galaxy__usage_all_time": replace_empty_with_null(data.get('Tool_usage_(all_time)_-_all_main_servers')),
        "galaxy__bio_tools_summary": replace_empty_with_null(data.get('bio.tool_description')),
        "galaxy__bio_tools_ids": replace_empty_with_null(data.get('bio.tool_id')),
        "galaxy__bio_tools_name": replace_empty_with_null(data.get('bio.tool_name'))
    }

def process_files_in_folder(folder_path, search_index, hash_map, data_dir):
    fetched_metadata = {}

    folder_name = os.path.basename(folder_path)
    file_patterns = [
        (f"bioconda_{folder_name}.yaml", extract_bioconda_data),
        (f"{folder_name}.biocontainers.yaml", extract_biocontainers_data),
        (f"{folder_name}.biotools.json", extract_biotools_data),
        (f"{folder_name}.bioschemas.jsonld", extract_bioschemas_data),
        (f"{folder_name}.galaxy.json", extract_galaxy_data)
    ]

    for file_name, extractor in file_patterns:
        file_path = os.path.join(folder_path, file_name)
        if not os.path.exists(file_path):
            log_message(f"File not found: {file_path}")
            continue

        ext = os.path.splitext(file_path)[1]
        if ext in ['.yaml', '.yml']:
            data = parse_yaml(file_path)
        elif ext in ['.json', '.jsonld']:
            data = parse_json(file_path)
        else:
            continue

        extracted_data = extractor(data)
        log_message(f"Extracted data for {file_name}: {extracted_data}")

        for key, value in extracted_data.items():
            fetched_metadata[key] = {"file_name": file_name, "value": value}

    content_hash = hash_content(fetched_metadata)

    if content_hash in hash_map:
        hash_map[content_hash].append(folder_path)
    else:
        hash_map[content_hash] = [folder_path]

    metadata = {
        "search_index": search_index,
        "tool_name": folder_name,
        "fetched_metadata": {k: v['value'] for k, v in fetched_metadata.items()},
    }

    return metadata, content_hash

def scan_directory(data_dir):
    open('last_run_logs.txt', 'w').close()

    search_index = 1
    combined_metadata = []
    hash_map = {}

    for root, dirs, files in os.walk(data_dir):
        if root != data_dir:
            metadata, content_hash = process_files_in_folder(root, search_index, hash_map, data_dir)
            combined_metadata.append(metadata)
            search_index += 1

    return combined_metadata

def save_combined_metadata(output_file, combined_metadata):
    with open(output_file, 'w') as f:
        json.dump(combined_metadata, f, indent=4)

def main():
    data_dir = '.\\data'
    output_file = 'combined_metadata.json'
    combined_metadata = scan_directory(data_dir)
    save_combined_metadata(output_file, combined_metadata)
    log_message(f"Metadata combined and saved to {output_file}")

if __name__ == "__main__":
    main()
