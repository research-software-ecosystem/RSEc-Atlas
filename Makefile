# Define variables for paths and dependencies
PYTHON_SCRIPT = MergeDataFiles/merge_data_files.py
COMBINED_METADATA = MergeDataFiles/combined_metadata.json
PUBLIC_DIR = StaticSiteGeneration/public
STATIC_SITE_DIR = StaticSiteGeneration
RSE_CONTENT_DIR = MergeDataFiles/content
REPO_URL = https://github.com/research-software-ecosystem/content.git

# Install Python, Node.js, and dependencies
install-all:
	@sudo apt-get install -y python3 || echo "Python3 is already installed."
	@sudo apt-get install -y python3-pip || echo "pip is already installed."
	@sudo apt-get install -y nodejs || echo "Node.js is already installed."
	@export NUXT_TELEMETRY_DISABLED=1 && cd $(STATIC_SITE_DIR) && npm install

# Clone or update the RSE content repository
update-content:
	@if [ -d "$(RSE_CONTENT_DIR)" ]; then \
		if [ -d "$(RSE_CONTENT_DIR)/.git" ]; then \
			cd $(RSE_CONTENT_DIR) && git remote update && git branch --set-upstream-to=origin/master master && \
			CHANGES=$$(git pull | grep -c "Already up to date.") && \
			if [ "$$CHANGES" -eq 0 ]; then \
				echo "Updates found, running Python script..."; \
				make run-python; \
			else \
				echo "No updates, skipping Python script."; \
			fi; \
		else \
			echo "$(RSE_CONTENT_DIR) is not a valid Git repository. Initializing it now..."; \
			rm -rf $(RSE_CONTENT_DIR) && \
			git clone $(REPO_URL) $(RSE_CONTENT_DIR) && \
			echo "Repository cloned, running Python script..." && \
			make run-python; \
		fi; \
	else \
		echo "Cloning repository..."; \
		git clone $(REPO_URL) $(RSE_CONTENT_DIR) && \
		echo "Repository cloned, running Python script..." && \
		make run-python; \
	fi

# Run the Python script to generate combined metadata
run-python:
	@python3 -m pip install -r MergeDataFiles/requirements.txt
	@python3 $(PYTHON_SCRIPT)

# Copy the generated metadata to the static site directory
copy-metadata:
	@cp $(COMBINED_METADATA) $(PUBLIC_DIR)

# Generate the static site
generate-site:
	@cd $(STATIC_SITE_DIR) && npm run generate

# Push combined_metadata.json to a special branch
push-metadata:
	@git checkout -B combined_metadata
	@git add $(COMBINED_METADATA)
	@git commit -m "Update combined_metadata.json"
	@git push origin combined_metadata

# Full workflow
run-full-workflow: install-all generate-site
