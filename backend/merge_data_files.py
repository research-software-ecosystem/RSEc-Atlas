import glob
import json
import logging
import os
import re
import shutil

import yaml

script_dir = os.path.dirname(__file__)
output_folder = os.path.join(script_dir, "..", "frontend", "public", "metadata")
data_dir = os.path.join(script_dir, "content", "data")
imports_dir = os.path.join(script_dir, "content", "imports")

# Sources whose records can describe a tool on their own: metadata type, folder
# in imports/ and file name pattern capturing the identifier in that source.
# The order decides which identifier names a group of linked records that has
# no data/ folder, i.e. no bio.tools entry.
IMPORT_SOURCES = [
    ("bioconductor", "bioconductor", re.compile(r"^(.+)\.bioconductor\.json$")),
    ("bioconda", "bioconda", re.compile(r"^bioconda_(.+)\.yaml$")),
    ("galaxy", "galaxy", re.compile(r"^(.+)\.galaxy\.json$")),
    ("debian", "debian-med", re.compile(r"^(.+)\.debian\.yaml$")),
]
SOURCE_PRIORITY = {source: rank for rank, (source, _, _) in enumerate(IMPORT_SOURCES)}

# A tool page shows a single record of these sources, so two groups both
# holding one are never merged. Debian packages are listed, so they can pile up.
SINGLE_RECORD_SOURCES = {"biotools", "bioconductor", "bioconda", "galaxy"}


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
        "summary": ("descr", "description"),
    },
    "neubias": {
        "name": ("title", "value"),
    },
    "bioconductor": {
        "name": ("Package",),
        "version": ("Version",),
        "license": ("License",),
        "summary": ("Title",),
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
        "summary": ("descr", "description"),
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
    "bioconductor": {
        "name": ("Package",),
        "version": ("Version",),
        "license": ("License",),
        "summary": ("Title",),
        "description": ("Description",),
        "home": ("URL",),
        "author": ("Author",),
        "maintainer": ("Maintainer",),
        "bioc_views": ("biocViews",),
        "git_url": ("git_url",),
        "last_commit_date": ("git_last_commit_date",),
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


def load_data(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext in [".yaml", ".yml"]:
        return parse_yaml(file_path)
    elif ext in [".json", ".jsonld"]:
        return parse_json(file_path)
    return None


def parse_metadata(tool_type, file_path, data=None):
    if data is None:
        data = load_data(file_path)
    if not data:
        return None, None

    return (
        extract_data(tool_type, data, SUMMARY_DATA_KEY_MAPPINGS),
        extract_data(tool_type, data, PAGE_DATA_KEY_MAPPINGS),
    )


def build_metadata(tool_name, contents, fetched, page, identifiers):
    meta = {"tool_name": tool_name, "contents": sorted(contents)}
    return (
        {**meta, "fetched_metadata": fetched},
        {**meta, "identifiers": identifiers, "fetched_metadata": page},
    )


def add_record(metadata, tool_type, fetched, page):
    """Merge one parsed record into the (contents, fetched, page) of a tool.

    Debian packages pile up into a list, other sources keep the last record.
    """
    contents, fetched_metadata, page_metadata = metadata
    contents.add(tool_type)
    for target, record in ((fetched_metadata, fetched), (page_metadata, page)):
        value = record.get(tool_type)
        if tool_type == "debian" and tool_type in target:
            previous = target[tool_type]
            previous = previous if isinstance(previous, list) else [previous]
            target[tool_type] = previous + [value]
        else:
            target[tool_type] = value


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
        (f"{folder_name}.bioconductor.json", "bioconductor"),
    ]

    # The Bioconda package may be named differently from the folder slug,
    # e.g. bioconda_r-wgcna.yaml in wgcna.
    if not any(
        os.path.exists(os.path.join(folder_path, f))
        for f, tool_type in file_patterns
        if tool_type == "bioconda"
    ):
        bioconda_files = sorted(glob.glob(os.path.join(folder_path, "bioconda_*.yaml")))
        if bioconda_files:
            file_patterns.append((os.path.basename(bioconda_files[0]), "bioconda"))

    # Glob-based patterns for sources where filename may not match folder slug
    glob_patterns = [
        ("*.oeb.metrics.json", "oeb"),
        ("*.debian.yaml", "debian"),
        ("*.neubias.raw.json", "neubias"),
    ]

    if not any(os.path.exists(os.path.join(folder_path, f)) for f, _ in file_patterns):
        if not any(glob.glob(os.path.join(folder_path, pattern)) for pattern, _ in glob_patterns):
            return None

    metadata = (set(), {}, {})

    for file_name, tool_type in file_patterns:
        file_path = os.path.join(folder_path, file_name)
        if not os.path.exists(file_path):
            continue

        fetched, page = parse_metadata(tool_type, file_path)
        if fetched and page:
            add_record(metadata, tool_type, fetched, page)

    for pattern, tool_type in glob_patterns:
        for file_path in sorted(glob.glob(os.path.join(folder_path, pattern))):
            fetched, page = parse_metadata(tool_type, file_path)
            if fetched and page:
                add_record(metadata, tool_type, fetched, page)

    return metadata


def match_record(file_name):
    """Return the (source, identifier) of a source file, or None."""
    for source, _, pattern in IMPORT_SOURCES:
        match = pattern.match(file_name)
        if match:
            return source, match.group(1)
    return None


def scan_data_folders():
    """Map each data/ folder to the (source, identifier) records it holds,
    and each of these records to its file."""
    folders, record_files = {}, {}
    for folder_name in sorted(os.listdir(data_dir)):
        folder_path = os.path.join(data_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue
        records = []
        biotools_file = os.path.join(folder_path, f"{folder_name}.biotools.json")
        if os.path.exists(biotools_file):
            records.append(("biotools", folder_name))
            record_files[(folder_name, records[0])] = biotools_file
        for file_name in sorted(os.listdir(folder_path)):
            record = match_record(file_name)
            if record is None:
                continue
            # Bioconductor files are named after the folder, which may carry
            # the bioconductor- prefix of the bio.tools ID, not after the package.
            if record[0] == "bioconductor":
                record = (record[0], record[1].removeprefix("bioconductor-"))
            records.append(record)
            record_files[(folder_name, record)] = os.path.join(folder_path, file_name)
        folders[folder_name] = records
    return folders, record_files


def scan_imports(held):
    """Load the imports/ records that no data/ folder holds."""
    records = {}
    for source, folder, pattern in IMPORT_SOURCES:
        for file_name in sorted(os.listdir(os.path.join(imports_dir, folder))):
            match = pattern.match(file_name)
            if not match or (source, match.group(1)) in held:
                continue
            file_path = os.path.join(imports_dir, folder, file_name)
            try:
                data = load_data(file_path)
            except (ValueError, yaml.YAMLError) as e:
                log_message(f"Skipping {file_path}: {e}")
                continue
            if isinstance(data, dict):
                records[(source, match.group(1))] = (file_path, data)
    return records


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def record_links(source, record_id, data):
    """List the (source, identifier) records a record points to.

    These are the cross-links documented at
    https://research-software-ecosystem.org/docs, plus the bioconductor-<name>
    naming convention of Bioconda for Bioconductor packages.
    """
    links = []
    if source == "biotools":
        for download in as_list(data.get("download")):
            url = (download or {}).get("url") or ""
            for prefix, target in (
                ("https://anaconda.org/bioconda/", "bioconda"),
                ("https://tracker.debian.org/pkg/", "debian"),
            ):
                if url.startswith(prefix):
                    links.append((target, url[len(prefix):].strip("/")))
    elif source == "bioconda":
        for identifier in as_list((data.get("extra") or {}).get("identifiers")):
            if isinstance(identifier, str) and identifier.startswith("biotools:"):
                links.append(("biotools", identifier[len("biotools:"):]))
    elif source == "galaxy":
        links += [("biotools", i) for i in as_list(data.get("bio.tool_ID"))]
        links += [("bioconda", i) for i in as_list(data.get("Suite_conda_package"))]
    elif source == "debian":
        for registry in as_list(data.get("registries")):
            name = (registry or {}).get("name")
            if name == "bio.tools":
                links.append(("biotools", registry.get("entry")))
            elif name == "conda:bioconda":
                links.append(("bioconda", registry.get("entry")))
    elif source == "bioconductor":
        links.append(("bioconda", f"bioconductor-{record_id.lower()}"))
    return [(target, str(i).strip()) for target, i in links if i and str(i).strip()]


def is_loose_link(node, target):
    """Tell whether a link only relates two tools rather than identifying one.

    The Bioconda package of a Galaxy suite is its main requirement, which is
    the same tool only when the names agree (abyss), not for a wrapper suite
    (artbio_bam_cleaning requires samtools).
    """
    def simplify(name):
        return re.sub(r"[-_.]", "", name.lower())

    return (
        node[0] == "galaxy"
        and target[0] == "bioconda"
        and simplify(node[1]) != simplify(target[1])
    )


class Groups:
    """Union-find over the records of the Atlas.

    A merge is refused when both groups hold a data/ folder or a record of the
    same single-record source, so that one page never hides another tool.
    """

    def __init__(self):
        self.parent = {}
        self.sources = {}

    def add(self, node, sources):
        self.parent[node] = node
        self.sources[node] = set(sources) & (SINGLE_RECORD_SOURCES | {"data"})

    def find(self, node):
        while self.parent[node] != node:
            self.parent[node] = self.parent[self.parent[node]]
            node = self.parent[node]
        return node

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return True
        if self.sources[root_a] & self.sources[root_b]:
            return False
        self.parent[root_b] = root_a
        self.sources[root_a] |= self.sources.pop(root_b)
        return True


def link_records(folders, record_files, orphans):
    """Group the data/ folders and orphan import records that link to each other."""
    groups = Groups()
    exact, lower, ambiguous = {}, {}, set()

    def index(record, node):
        source, record_id = record
        for table, key in ((exact, record), (lower, (source, record_id.lower()))):
            if table.get(key, node) != node:
                table[key] = None
                if table is exact:
                    ambiguous.add(record)
            else:
                table.setdefault(key, node)

    for folder_name, records in folders.items():
        node = ("data", folder_name)
        groups.add(node, ["data"] + [source for source, _ in records])
        for record in records:
            index(record, node)
    for record in orphans:
        groups.add(record, [record[0]])
        index(record, record)

    def resolve(target):
        source, record_id = target
        if target in exact:
            return exact[target]
        return lower.get((source, record_id.lower()))

    # (node, record, target): the record of the node links to the target.
    edges = set()
    for record, (_, data) in orphans.items():
        for target in record_links(*record, data):
            edges.add((record, record, target))
    for folder_name, records in folders.items():
        for record in records:
            file_path = record_files[(folder_name, record)]
            if record[0] == "biotools":
                # Few bio.tools entries list downloads from Bioconda or Debian.
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
                if "anaconda.org/bioconda/" not in text and "tracker.debian.org/pkg/" not in text:
                    continue
                data = json.loads(text)
            elif record[0] == "bioconductor":
                data = {}
            else:
                try:
                    data = load_data(file_path)
                except (ValueError, yaml.YAMLError):
                    continue
            if isinstance(data, dict):
                for target in record_links(*record, data):
                    edges.add((("data", folder_name), record, target))

    # Links to bio.tools go first: they are curated and anchor the groups.
    refused, loose = [], []
    for node, record, target in sorted(edges, key=lambda e: (e[2][0] != "biotools", e)):
        target_node = resolve(target)
        if target_node is None:
            continue
        if is_loose_link(record, target):
            loose.append((node, target_node))
        elif not groups.union(node, target_node):
            refused.append((node, target_node))
    log_message(f"Refused {len(refused)} links joining two tools already distinct")

    members = {}
    for node in groups.parent:
        members.setdefault(groups.find(node), []).append(node)
    # Tools linked without being merged still point to each other.
    related = [(groups.find(a), groups.find(b)) for a, b in refused + loose]
    return list(members.items()), related, ambiguous


def main():
    combined_metadata, aliases = [], {}

    folders, record_files = scan_data_folders()
    held = {record for records in folders.values() for record in records}
    orphans = scan_imports(held)
    log_message(f"Found {len(folders)} data folders, {len(orphans)} import records outside them")

    groups, related, ambiguous = link_records(folders, record_files, orphans)
    group_tool_names = {}

    for root, members in groups:
        folder_name = next((n[1] for n in members if n[0] == "data"), None)
        records = sorted(
            (n for n in members if n[0] != "data"),
            key=lambda n: (SOURCE_PRIORITY[n[0]], n[1]),
        )

        # The data/ folder keeps naming the tool so that existing links stay
        # valid; otherwise the identifier from the preferred source does.
        metadata = None
        if folder_name is not None:
            metadata = process_files_in_folder(os.path.join(data_dir, folder_name))
        if metadata is not None:
            tool_name = folder_name
            identifiers = list(folders[folder_name])
        elif records:
            tool_name = "/".join(records[0])
            metadata = (set(), {}, {})
            identifiers = []
        else:
            continue

        for record in records:
            file_path, data = orphans[record]
            fetched, page = parse_metadata(record[0], file_path, data)
            if fetched and page:
                add_record(metadata, record[0], fetched, page)
            identifiers.append(record)

        if not metadata[0] and tool_name != folder_name:
            continue

        summary, page_metadata = build_metadata(
            tool_name,
            *metadata,
            [f"{source}:{record_id}" for source, record_id in identifiers],
        )
        combined_metadata.append(summary)
        save_metadata(f"tools/{tool_name}.json", page_metadata)
        group_tool_names[root] = tool_name

        # Every identifier of the tool in another source leads to its page, so
        # a URL stays valid when the tool later gets a better identifier.
        for source, record_id in identifiers:
            if source != "biotools" and (source, record_id) not in ambiguous:
                aliases[f"{source}/{record_id}"] = tool_name
        # Galaxy suites outside data/ used to be published under their bare
        # ID, which must keep working once a suite moves into a data/ folder.
        for source, record_id in identifiers:
            if source == "galaxy" and (source, record_id) not in ambiguous:
                aliases.setdefault(record_id, tool_name)

    related_tools = {}
    for a, b in related:
        a, b = group_tool_names.get(a), group_tool_names.get(b)
        if a and b and a != b:
            related_tools.setdefault(a, set()).add(b)
            related_tools.setdefault(b, set()).add(a)
    for tool_name, others in related_tools.items():
        file_path = os.path.join(output_folder, f"tools/{tool_name}.json")
        page_metadata = parse_json(file_path)
        page_metadata["related_tools"] = sorted(others)
        save_metadata(f"tools/{tool_name}.json", page_metadata)

    tool_names = {tool["tool_name"] for tool in combined_metadata}
    aliases = {a: t for a, t in aliases.items() if a not in tool_names}
    for alias, tool_name in sorted(aliases.items()):
        save_metadata(f"aliases/{alias}.json", {"tool_name": tool_name})

    log_message(f"Saved {len(combined_metadata)} tools and {len(aliases)} aliases")
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
