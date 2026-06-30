import glob
import json
import logging
import os
import shutil

import yaml

script_dir = os.path.dirname(__file__)
output_folder = os.path.join(script_dir, "..", "frontend", "public", "metadata")
data_dir = os.path.join(script_dir, "content", "data")
galaxy_data_dir = os.path.join(script_dir, "content", "imports", "galaxy")


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
        "name": ("package", "name"),
        "version": ("package", "version"),
        "license": ("about", "license"),
        "summary": ("about", "summary"),
    },
    "biotools": {
        "license": ("license",),
        "summary": ("description",),
        "addition_date": ("additionDate",),
        "last_update_date": ("lastUpdate",),
        "version": ("version",),
        "collections": ("collectionID",),
    },
    "bioschemas": {
        "name": ("sc:name",),
        "license": ("sc:license",),
        "version": ("sc:softwareVersion",),
    },
    "galaxy": {
        "toolshed_id": ("Suite_ID",),
        "summary": ("Description",),
        "version": ("Suite_version",),
        "first_commit": ("Suite_first_commit_date",),
        "edam_topics": ("EDAM_topics",),
        "users_5_years": ("Suite_users_(last_5_years)_on_main_servers",),
        "users_all_time": ("Suite_users_on_main_servers",),
        "usage_5_years": ("Suite_runs_(last_5_years)_on_main_servers",),
        "usage_all_time": ("Suite_runs_on_main_servers",),
        "tool_output_formats": ("Tool_output_formats",),
    },
    "biocontainers": {
        "name": ("name",),
        "license": ("license",),
        "summary": ("description",),
    },
    "oeb": {
        "deprecated": ("deprecated",),
    },
    "debian": {
        "name": ("package",),
        "version": ("version",),
        "license": ("license",),
        "blend": ("blend",),
    },
    "neubias": {
        "name": ("title", "value"),
    },
}

PAGE_DATA_KEY_MAPPINGS = {
    "bioconda": {
        "name": ("package", "name"),
        "version": ("package", "version"),
        "home": ("about", "home"),
        "documentation": ("about", "doc_url"),
        "license": ("about", "license"),
        "summary": ("about", "summary"),
        "identifiers": ("extra", "identifiers"),
        "description": ("about", "description"),
        "license_file": ("about", "license_file"),
        "build": ("build",),
        "requirements": ("requirements",),
        "source_url": ("source", "url"),
        "test": ("test",),
        "recipe_maintainers": ("extra", "recipe-maintainers"),
        "parent_recipe": ("extra", "parent_recipe"),
    },
    "biocontainers": {
        "name": ("name",),
        "identifiers": ("identifiers",),
        "license": ("license",),
        "summary": ("description",),
        "home_url": ("home_url",),
        "keywords": ("keywords",),
        "manually_check": ("manually_check",),
        "total_pulls": ("total_pulls",),
    },
    "biotools": {
        "id": ("biotoolsID",),
        "home": ("homepage",),
        "license": ("license",),
        "summary": ("description",),
        "addition_date": ("additionDate",),
        "last_update_date": ("lastUpdate",),
        "tool_type": ("toolType",),
        "version": ("version",),
        "collections": ("collectionID",),
        "accessibility": ("accessibility",),
        "biotools_curie": ("biotoolsCURIE",),
        "cost": ("cost",),
        "credit": ("credit",),
        "documentation": ("documentation",),
        "edit_permission": ("editPermission",),
        "function": ("function",),
        "maturity": ("maturity",),
        "name": ("name",),
        "operating_system": ("operatingSystem",),
        "owner": ("owner",),
        "publication": ("publication",),
        "topic": ("topic",),
        "validated": ("validated",),
    },
    "bioschemas": {
        "name": ("sc:name",),
        "home": ("@id",),
        "license": ("sc:license",),
        "version": ("sc:softwareVersion",),
        "summary": ("sc:description",),
        "tool_type": ("@type",),
    },
    "galaxy": {
        "version": ("Suite_version",),
        "first_commit": ("Suite_first_commit_date",),
        "conda_name": ("Suite_conda_package",),
        "conda_version": ("Latest_suite_conda_package_version",),
        "summary": ("Description",),
        "edam_operations": ("EDAM_operations",),
        "edam_topics": ("EDAM_topics",),
        "toolshed_categories": ("ToolShed_categories",),
        "toolshed_id": ("Suite_ID",),
        "users_5_years": ("Suite_users_(last_5_years)_on_main_servers",),
        "users_all_time": ("Suite_users_on_main_servers",),
        "usage_5_years": ("Suite_runs_(last_5_years)_on_main_servers",),
        "usage_all_time": ("Suite_runs_on_main_servers",),
        "bio_tools_summary": ("bio.tool_description",),
        "bio_tools_ids": ("bio.tool_ID",),
        "bio_tools_name": ("bio.tool_name",),
        "related_tutorials": ("Related_Tutorials",),
        "related_workflows": ("Related_Workflows",),
        "tool_ids": ("Tool_IDs",),
        "tool_output_formats": ("Tool_output_formats",),
        "homepage": ("Homepage",),
        "suite_source": ("Suite_source",),
        "suite_owner": ("Suite_owner",),
        "suite_parsed_folder": ("Suite_parsed_folder",),
        "suite_version_status": ("Suite_version_status",),
        "biii_id": ("biii_ID",),
        "no_of_tools": {
            "eu": ("Number_of_tools_on_UseGalaxy.eu",),
            "org": ("Number_of_tools_on_UseGalaxy.org_(Main)",),
            "org.au": ("Number_of_tools_on_UseGalaxy.org.au",),
            "be": ("Number_of_tools_on_UseGalaxy.be",),
            "cz": ("Number_of_tools_on_UseGalaxy.cz",),
            "fr": ("Number_of_tools_on_UseGalaxy.fr",),
            "no": ("Number_of_tools_on_UseGalaxy.no",),
            "apostl": ("Number_of_tools_on_APOSTL",),
            "cirm_cfbp": ("Number_of_tools_on_CIRM-CFBP",),
            "chemflow": ("Number_of_tools_on_ChemFlow",),
            "coloc_stats": ("Number_of_tools_on_Coloc-stats",),
            "gaslini": ("Number_of_tools_on_GASLINI",),
            "aubi": ("Number_of_tools_on_Galaxy@AuBi",),
            "pasteur": ("Number_of_tools_on_Galaxy@Pasteur",),
            "trakr": ("Number_of_tools_on_GalaxyTrakr",),
            "hyphy": ("Number_of_tools_on_HyPhy_HIV_NGS_Tools",),
            "ipk": ("Number_of_tools_on_IPK_Galaxy_Blast_Suite",),
            "immport": ("Number_of_tools_on_ImmPort_Galaxy",),
            "interactomix": ("Number_of_tools_on_InteractoMIX",),
            "lebanese": ("Number_of_tools_on_Lebanese_University_Galaxy",),
            "mbac": ("Number_of_tools_on_MBAC_Metabiome_Portal",),
            "mississippi": ("Number_of_tools_on_MISSISSIPPI",),
            "mandoiu": ("Number_of_tools_on_Mandoiu_Lab",),
            "oqtans": ("Number_of_tools_on_Oqtans",),
            "palfinder": ("Number_of_tools_on_Palfinder",),
            "pepsimili": ("Number_of_tools_on_PepSimili",),
            "phagepromotor": ("Number_of_tools_on_PhagePromotor",),
            "vvv": ("Number_of_tools_on_Viral_Variant_Visualizer_(VVV)",),
        },
        "runs_by_server": {
            "eu": ("Suite_runs_(usegalaxy.eu)",),
            "fr": ("Suite_runs_(usegalaxy.fr)",),
            "org": ("Suite_runs_(usegalaxy.org)",),
            "org.au": ("Suite_runs_(usegalaxy.org.au)",),
            "eu_5_years": ("Suite_runs_(last_5_years)_(usegalaxy.eu)",),
            "fr_5_years": ("Suite_runs_(last_5_years)_(usegalaxy.fr)",),
            "org_5_years": ("Suite_runs_(last_5_years)_(usegalaxy.org)",),
            "org.au_5_years": ("Suite_runs_(last_5_years)_(usegalaxy.org.au)",),
        },
        "users_by_server": {
            "eu": ("Suite_users_(usegalaxy.eu)",),
            "fr": ("Suite_users_(usegalaxy.fr)",),
            "org": ("Suite_users_(usegalaxy.org)",),
            "org.au": ("Suite_users_(usegalaxy.org.au)",),
            "eu_5_years": ("Suite_users_(last_5_years)_(usegalaxy.eu)",),
            "fr_5_years": ("Suite_users_(last_5_years)_(usegalaxy.fr)",),
            "org_5_years": ("Suite_users_(last_5_years)_(usegalaxy.org)",),
            "org.au_5_years": ("Suite_users_(last_5_years)_(usegalaxy.org.au)",),
        },
    },
    "oeb": {
        "metrics": (),
    },
    "debian": {
        "package": ("package",),
        "distribution": ("distribution",),
        "release": ("release",),
        "component": ("component",),
        "version": ("version",),
        "source": ("source",),
        "homepage": ("homepage",),
        "license": ("license",),
        "blend": ("blend",),
        "topics": ("topics",),
        "edam_scopes": ("edam_scopes",),
        "registries": ("registries",),
        "bib": ("bib",),
        "tags": ("tags",),
        "popcon": ("popcon",),
        "descr": ("descr",),
    },
    "neubias": {
        "body": ("body",),
        "changed": ("changed",),
        "created": ("created",),
        "default_langcode": ("default_langcode",),
        "attribution_instructions": ("field_attribution_instructions",),
        "comments_2023": ("field_comments2023",),
        "free_tagging": ("field_free_tagging",),
        "give_feedback_on_this_soft": ("field_give_feedback_on_this_soft",),
        "has_author": ("field_has_author",),
        "has_biological_terms": ("field_has_biological_terms",),
        "has_comparison": ("field_has_comparison",),
        "has_documentation": ("field_has_documentation",),
        "has_doi": ("field_has_doi",),
        "has_entry_curator": ("field_has_entry_curator",),
        "has_function": ("field_has_function",),
        "has_implementation": ("field_has_implementation",),
        "has_interaction_level": ("field_has_interaction_level",),
        "has_license": ("field_has_license",),
        "has_location": ("field_has_location",),
        "has_programming_language": ("field_has_programming_language",),
        "has_reference_publication": ("field_has_reference_publication",),
        "has_usage_example": ("field_has_usage_example",),
        "image": ("field_image",),
        "is_compatible_with": ("field_is_compatible_with",),
        "is_covered_by_training_mat": ("field_is_covered_by_training_mat",),
        "is_dependent_of": ("field_is_dependent_of",),
        "license_openness": ("field_license_openness",),
        "platform": ("field_platform",),
        "supported_image_dimension": ("field_supported_image_dimension",),
        "type": ("field_type",),
        "workflow_steps": ("field_workflow_steps",),
        "title": ("title",),
    },
}


def extract_data(tool_type, data, key_mappings):
    def traverse_keys(d, *keys):
        for key in keys:
            if isinstance(d, list):
                d = d[0] if d else None
            if isinstance(d, dict):
                d = d.get(key)
            else:
                return None
        return d

    def extract(d, mappings):
        result = {}
        for k, v in mappings.items():
            value = extract(d, v) if isinstance(v, dict) else traverse_keys(d, *v)
            if value is not None:
                result[k] = value
        return result

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
        return {tool_type: extract(software_data, mappings)} if software_data else {}
    else:
        return {tool_type: extract(data, mappings)}


def parse_metadata(tool_type, file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext in [".yaml", ".yml"]:
        data = parse_yaml(file_path)
    elif ext in [".json", ".jsonld"]:
        data = parse_json(file_path)
    else:
        return None, None
    if not data:
        return None, None

    return (
        extract_data(tool_type, data, SUMMARY_DATA_KEY_MAPPINGS),
        extract_data(tool_type, data, PAGE_DATA_KEY_MAPPINGS),
    )


def build_metadata(tool_name, contents, fetched, page):
    meta = {"tool_name": tool_name, "contents": list(contents)}
    return (
        {**meta, "fetched_metadata": fetched},
        {**meta, "fetched_metadata": page},
    )


def process_files_in_folder(folder_path):
    folder_name = os.path.basename(folder_path)
    log_message(f"Extracting data for: {folder_name}")

    file_patterns = [
        (f"bioconda_{folder_name}.yaml", "bioconda"),
        (f"bioconda_bioconductor-{folder_name}.yaml", "bioconda"),
        (f"{folder_name}.biocontainers.yaml", "biocontainers"),
        (f"{folder_name}.biotools.json", "biotools"),
        (f"{folder_name}.bioschemas.jsonld", "bioschemas"),
        (f"{folder_name}.galaxy.json", "galaxy"),
    ]

    # Glob-based patterns for sources where filename may not match folder slug
    glob_patterns = [
        ("*.oeb.metrics.json", "oeb"),
        ("*.debian.yaml", "debian"),
        ("*.neubias.raw.json", "neubias"),
    ]

    contents, fetched_metadata, extracted_page_metadata = set(), {}, {}

    if not any(os.path.exists(os.path.join(folder_path, f)) for f, _ in file_patterns):
        if not any(glob.glob(os.path.join(folder_path, pattern)) for pattern, _ in glob_patterns):
            return {}, {}

    for file_name, tool_type in file_patterns:
        file_path = os.path.join(folder_path, file_name)
        if not os.path.exists(file_path):
            continue

        fetched, page = parse_metadata(tool_type, file_path)
        if fetched and page:
            contents.add(tool_type)
            fetched_metadata.update(fetched)
            extracted_page_metadata.update(page)

    # Track all glob-found files per tool type for proper merging.
    glob_file_map = {}
    for pattern, tool_type in glob_patterns:
        for file_path in sorted(glob.glob(os.path.join(folder_path, pattern))):
            fetched, page = parse_metadata(tool_type, file_path)
            if not (fetched and page):
                continue
            contents.add(tool_type)
            glob_file_map.setdefault(tool_type, []).append((fetched, page))

    # Merge glob results: multiple Debian packages become lists.
    for tool_type, entries in glob_file_map.items():
        if tool_type == "debian" and len(entries) > 1:
            fetched_metadata[tool_type] = [
                entry[0].get(tool_type) for entry in entries
            ]
            extracted_page_metadata[tool_type] = [
                entry[1].get(tool_type) for entry in entries
            ]
        else:
            for fetched, page in entries:
                fetched_metadata.update(fetched)
                extracted_page_metadata.update(page)

    return build_metadata(
        folder_name, contents, fetched_metadata, extracted_page_metadata
    )


def main():
    combined_metadata = []

    for root, _, _ in os.walk(data_dir):
        if root == data_dir:
            continue
        metadata, page_metadata = process_files_in_folder(root)
        if not metadata or not page_metadata:
            continue
        combined_metadata.append(metadata)
        save_metadata(f"tools/{page_metadata['tool_name']}.json", page_metadata)

    for file_name in os.listdir(galaxy_data_dir):
        if not file_name.endswith(".galaxy.json"):
            continue
        file_path = os.path.join(galaxy_data_dir, file_name)
        tool_name = os.path.basename(file_path).replace(".galaxy.json", "")
        if any(tool_name == m["tool_name"] for m in combined_metadata):
            log_message(f"Skipping {tool_name}: already processed.")
            continue
        fetched, page = parse_metadata("galaxy", file_path)
        if not fetched or not page:
            log_message(f"Skipping {tool_name}: failed to parse metadata.")
            continue
        metadata, page_metadata = build_metadata(
            tool_name, fetched.keys(), fetched, page
        )
        log_message(f"Adding Galaxy tool: {tool_name}")
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
