# Define variables for paths and dependencies
PYTHON_VERSION = 3.x
NODE_VERSION = 18
PYTHON_SCRIPT = MergeDataFiles/MergeDataFiles.py
COMBINED_METADATA = MergeDataFiles/combined_metadata.json
PUBLIC_DIR = StaticSiteGeneration/public
STATIC_SITE_DIR = StaticSiteGeneration
PUBLISH_DIR = StaticSiteGeneration/.output/public

# Install Python dependencies and run the Python script
run-python:
	python -m pip install --upgrade pip
	python -m pip install pyyaml
	python $(PYTHON_SCRIPT)

# Copy the generated metadata to the static site directory
copy-metadata:
	cp $(COMBINED_METADATA) $(PUBLIC_DIR)

# Install npm dependencies for static site generation
install-node:
	cd $(STATIC_SITE_DIR) && npm install

# Generate the static site
generate-site:
	cd $(STATIC_SITE_DIR) && npm run generate

# Full workflow
run-full-workflow: run-python copy-metadata install-node generate-site
