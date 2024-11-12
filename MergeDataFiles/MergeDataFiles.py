import os
import json
import yaml
import hashlib

def log_message(message, log_file='last_run_logs.txt'):
    print(message)
    with open(log_file, 'a') as f:
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
        "bioconda__home": replace_empty_with_null(data.get('about', {}).get('home')),
        "bioconda__license": replace_empty_with_null(data.get('about', {}).get('license')),
        "bioconda__summary": replace_empty_with_null(data.get('about', {}).get('summary')),
        "bioconda__additional_platforms": replace_empty_with_null(data.get('extra', {}).get('additional-platforms')),
        "bioconda__identifiers": replace_empty_with_null(data.get('extra', {}).get('identifiers')),
        "bioconda__version": replace_empty_with_null(data.get('package', {}).get('version'))
    }

def extract_biocontainers_data(data):
    return {
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
        "biotools__operating_systems": replace_empty_with_null(data.get('operatingSystem')),
        "biotools__owner": replace_empty_with_null(data.get('owner')),
        "biotools__tool_type": replace_empty_with_null(data.get('toolType'))
    }

def process_files_in_folder(folder_path, search_index, hash_map, data_dir):
    combined_meta = {}
    duplicate_keys = {}

    folder_name = os.path.basename(folder_path)
    file_patterns = [
        (f"bioconda_{folder_name}.yaml", extract_bioconda_data),
        (f"{folder_name}.biocontainers.yaml", extract_biocontainers_data),
        (f"{folder_name}.biotools.json", extract_biotools_data)
    ]

    for file_name, extractor in file_patterns:
        file_path = os.path.join(folder_path, file_name)
        if not os.path.exists(file_path):
            log_message(f"File not found: {file_path}")
            continue

        ext = os.path.splitext(file_path)[1]
        if ext in ['.yaml', '.yml']:
            data = parse_yaml(file_path)
        elif ext == '.json':
            data = parse_json(file_path)
        else:
            continue

        extracted_data = extractor(data)
        log_message(f"Extracted data for {file_name}: {extracted_data}")

        for key, value in extracted_data.items():
            if key in combined_meta:
                if key not in duplicate_keys:
                    duplicate_keys[key] = []
                duplicate_keys[key].append({"file_name": file_name, "value": value})
                duplicate_keys[key].append({"file_name": combined_meta[key]['file_name'], "value": combined_meta[key]['value']})
                del combined_meta[key]
            else:
                combined_meta[key] = {"file_name": file_name, "value": value}

    content_hash = hash_content(combined_meta)

    if content_hash in hash_map:
        hash_map[content_hash].append(folder_path)
    else:
        hash_map[content_hash] = [folder_path]

    relative_folder_path = os.path.relpath(folder_path, data_dir)
    normalized_tool_path = os.path.join('.', 'data', relative_folder_path)

    metadata = {
        "search_index": search_index,
        "tool_path": normalized_tool_path,
        "combined_meta": {k: v['value'] for k, v in combined_meta.items()},
        "duplicate_keys": duplicate_keys,
        "duplicate_paths": []
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

    for metadata in combined_metadata:
        content_hash = hash_content(metadata['combined_meta'])
        if content_hash in hash_map and len(hash_map[content_hash]) > 1:
            metadata["duplicate_paths"] = [path for path in hash_map[content_hash] if path != metadata["tool_path"]]

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
