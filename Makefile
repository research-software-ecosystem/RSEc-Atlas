# Define variables for paths and dependencies
STATIC_SITE_DIR = StaticSiteGeneration
PUBLIC_DIR = StaticSiteGeneration/public
PYTHON_SCRIPT = MergeDataFiles/merge_data_files.py
PYTHON_REQUIREMENTS = MergeDataFiles/requirements.txt
COMBINED_METADATA = MergeDataFiles/combined_metadata.json
RSE_CONTENT_DIR = MergeDataFiles/content
REPO_URL = https://github.com/research-software-ecosystem/content.git

# Install Python, Node.js, and dependencies
install-all:
	if ! command -v python3 >/dev/null 2>&1; then echo "Python3 not found, installing..."; sudo apt-get install -y python3; fi
	if ! command -v pip3 >/dev/null 2>&1; then echo "pip not found, installing..."; sudo apt-get install -y python3-pip; fi
	if ! command -v node >/dev/null 2>&1; then echo "Node.js not found, installing..."; sudo apt-get install -y nodejs; fi

	python3 -m pip install -r $(PYTHON_REQUIREMENTS)

	export NUXT_TELEMETRY_DISABLED=1
	cd $(STATIC_SITE_DIR) && npm install

# Clone or update the RSE content repository
refresh-metadata:
	if [ ! -d "$(RSE_CONTENT_DIR)/.git" ]; then \
		echo "Cloning repository..."; \
		git clone $(REPO_URL) $(RSE_CONTENT_DIR); \
	else \
		echo "Updating repository..."; \
		cd $(RSE_CONTENT_DIR) && git pull; \
	fi

	# Check if updates exist
	cd $(RSE_CONTENT_DIR) && git remote update && \
	CHANGES=$$(git log HEAD..origin/master --oneline | wc -l); \
	if [ $$CHANGES -gt 0 ] || [ ! -f "$(COMBINED_METADATA)" ]; then \
		echo "Updates found or combined_metadata.json not present, running Python script..."; \
		make run-python; \
	else \
		echo "No updates, skipping Python script."; \
	fi

# Run the Python script to generate combined metadata
run-python:
	python3 $(PYTHON_SCRIPT)

# Copy the generated metadata to the static site directory
copy-metadata:
	cp $(COMBINED_METADATA) $(PUBLIC_DIR)

# Generate the static site
generate-site:
	cd $(STATIC_SITE_DIR) && npm run generate

# Push combined_metadata.json to a special branch
push-metadata:
	git checkout -B combined_metadata
	git add $(COMBINED_METADATA)
	git commit -m "Update combined_metadata.json"
	git push origin combined_metadata

# Full workflow
run-full-workflow: install-all refresh-metadata copy-metadata generate-site
