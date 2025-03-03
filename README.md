# Documentation: RSE Metadata Explorer


## Aim:
This web application aims to allow researchers and scientists to explore the metadata of various bioinformatics tools and containers. To make the process of finding and utilizing these biotools and biocontainers more efficient, this application fetches the metadata of biotools and biocontainers from the git repository of Research Software Ecosystem Content (https://github.com/research-software-ecosystem/content.git), and provides a user-friendly interface to show, search, and filter these biotools and biocontainers.


## Table of Contents
1. [Project Aim and Scope](#1-project-aim-and-scope)
2. [System Requirements](#2-system-requirements)
3. [Detailed Installation Guide](#3-detailed-installation-guide)
4. [Core Technologies Breakdown](#4-core-technologies-breakdown)
5. [Application Workflow](#5-application-workflow)
6. [Automation Infrastructure](#6-automation-infrastructure)
7. [Implementation Deep Dive](#7-implementation-deep-dive)
8. [Maintenance and Operations](#8-maintenance-and-operations)
9. [Troubleshooting Guide](#9-troubleshooting-guide)


## Usage:
To use the application, use the static site deployed at (https://hash-bash.github.io/StudyProject/) using GitHub Pages. The web application has the following features:

### Searching:
The search functionality allows users to perform query-based searches to find specific bio tools and containers. Searching is relevance-based, which lists relevant tools according to the search string being part of Tool Name > Tool Tags > Tool Description.

> **Notes:** Searching is case-insensitive, so "BWA" and "bwa" will return the same results. Tags in the context of searching are the `EDAM Topics` available on the tool details page if they exist.

**Query Search:** Searching in the web application also employs querying. Query searching allows users to search a combination of different comma-separated queries, where a query can be can either a search string or a tag. Following are some of the examples of the input string describing the use-case:
1. Single search string (Tool Name, Tool Description, or a Tag):
   - BWA
   - DeepTools
   - tag:mapping
   - tag:antimicrobial resistance
2. Combination of search strings: (input comma separated queries like below)
   - bwa, kit
   - BWA, tag:mapping
   - tag:sequence assembly, tag:mapping
   - SALSA, tag:sequence assembly, tag:mapping
3. Input `tag:*` to list all the tags available.

Searching can be done by the search bar available on the home page of the application.

### Filtering:
The application provides various filtering options to narrow down search results based on specific criteria. This helps users quickly find the most relevant tools for their needs. The following are the filters available in the web application:
1. Data Availability: Filter to check if tools have Bioconda Packages or Biocontainers or if they are compatible with Galaxy.
2. License: Filter the tools according to the licenses fetched from the metadata.
3. Favourite: Filter the tools that are marked as Favourite by the user.

These filters are available on the home page of the application.

### Sorting:
The tools on the homepage can be sorted by Name, Creation Date, and Last Modified Date. A drop-down on the home page of the application provides this functionality. By default, the tools are sorted by their Names.

### Favourites:
Users can mark bio tools and containers as favorites for quick access in the future. The favorites functionality ensures that users can maintain a personalized list of frequently used tools, stored in the browser. To mark a tool as a favourite, Users must go to the tool's details page by clicking on the tool name and then toggling the star in the top-right corner.

### URLs Sharing:
If users want to share the URL with a search query, it can be done by sharing the URL and appending `/?search=SEARCH QUERY`, which will be automatically converted to `/?search=SEARCH+QUERY`. Following are some of the examples of the URLs with the search query:
   - https://hash-bash.github.io/StudyProject/?search=1000Genomes+ID+history+converter `(Gives the tools with search string as 1000Genomes ID history converter)`
   - https://hash-bash.github.io/StudyProject/?search=tag:antimicrobial+resistance,+fargene `(Gives the tools with result consisting Tag antimicrobial resistance and search string as fargene)`

If users want to share a link to a tool, they can directly share the URL available on the tool's details page. The following are some of the examples:
   - https://hash-bash.github.io/StudyProject/tool/1000genomes_id_history_converter
   - https://hash-bash.github.io/StudyProject/tool/fargene


## Setup and Installation:

### With Makefile

Since this application utilizes Makefile, the procedure of setting up and running this project locally can be done simply by:

#### 1. Installing `make`
   **Windows (Open PowerShell as Administrator and run):**
   ```bash
   choco install make
   ```
   **Ubuntu (Install using apt in Terminal):**
   ```bash
   sudo apt update
   sudo apt install make
   ```
#### 2. Clone the Repository:
   > **Note:** Make sure that Git is installed beforehand
   ```bash
   git clone https://github.com/hash-bash/StudyProject.git
   ```
#### 3. Change the current directory to the root of the project `StudyProject`:
   ```bash
   cd StudyProject
   ```
#### 4. Run the following `make` command:
   ```bash
   make run-full-workflow
   ```

You should now be able to access the site locally at `http://localhost:3000`.

This `make` command will install all the necessary dependencies, collect/update all the metadata from the RSC repository, share it with the frontend app, and generate/update a static site to browse through this metadata. Please check other `make` commands in the Makefile for ease of development and usage of the application.

### Without Makefile

To set up and run the project locally **without** using `make`, we can follow the below procedure:

### 1. Install the prerequisites:
Before setting up the project, ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher): Required for running the Nuxt.js frontend.
- **Python** (v3.x): Required for running the Python scripts to process and merge metadata files.
- **Git**: For version control and managing repository changes.
- **GitHub CLI** (optional): For easier management of GitHub Actions and repository interactions.

### 2. Clone the Repository:
To get started, clone the repository to your local machine using the following commands:
```bash
git clone https://github.com/hash-bash/StudyProject.git
```

### 3. Install Python Dependencies:
Navigate to the `StudyProject/MergeDataFiles` folder and install the required Python dependencies:
1. Set up a virtual environment (optional but recommended):
   ```bash
   cd StudyProject/MergeDataFiles
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install the necessary Python packages from the `requirements.txt` file:
   ```bash
   pip install -r requirements.txt
   ```
   This will install all required packages, including `PyYAML` for parsing YAML files.

### 4. Install Node.js Dependencies:
Navigate to the `StudyProject/StaticSiteGeneration` directory and install the required Node.js dependencies using `npm`:
   ```bash
   cd StudyProject/StaticSiteGeneration
   npm install
   ```

### 5. Clone the RSE Content Repository:
We have to clone the RSE Content Repository to the directory `StudyProject/MergeDataFiles`, which will be later used by the python script to fetch and combine the metadata file:
```bash
cd StudyProject/MergeDataFiles
git clone https://github.com/hash-bash/StudyProject.git
```
This will create a folder called as `content` in the directory.

### 6. Run the Python Script
The Python script `merge_data_files.py` in `StudyProject/MergeDataFiles` processes and merges the metadata into `combined_metadata.json`. This file is later used by the Nuxt.js frontend.
```bash
python merge_data_files.py
```
This will generate the `combined_metadata.json` file in the `StudyProject/MergeDataFiles` folder.

### 7. Copy the Generated JSON to the Static Site Folder
After running the Python script, copy the `combined_metadata.json` file from the `StudyProject/MergeDataFiles` folder to the `StudyProject/StaticSiteGeneration/public` folder:
```bash
cp StudyProject/MergeDataFiles/combined_metadata.json StudyProject/StaticSiteGeneration/public/
```

### 8. Generate the Static Site
Navigate to the `StudyProject/StaticSiteGeneration` directory and run the following command to generate the static site:
```bash
cd StudyProject/StaticSiteGeneration
npm run generate
```
This will create a fully static site in the `.output/public` directory.

### 9. Preview the Site
To preview the generated static site, run:
```bash
npm run preview
```
You should now be able to access the site locally at `http://localhost:3000`.


## Tools and Utilities used:
The project leverages a variety of tools and utilities to ensure a robust and efficient development process:

- **Python**: Used for scripting and data processing.
- **Python Libraries**: Various libraries such as `PyYAML` for handling YAML files.
- **Nuxt.js**: A powerful framework for creating server-rendered Vue.js applications.
- **Frontend Libraries**: Utilized for building the user interface and enhancing user experience.
- **GitHub Pages**: For deploying the static site.
- **GZip Compression**: To optimize the performance of the web application.
- **Makefile**: For automating build processes and tasks.
- **Git**: For version control and collaborative development.
- **Git Workflow**: A structured workflow for managing code changes and collaboration.


## Implementation:

### Python Script:
The Python script is responsible for processing and merging metadata files. It includes the following components:

- **Directory Structure**:
  ```
  StudyProject/MergeDataFiles/
  ├── content/
  ├── merge_data_files.py
  └── requirements.txt
  ```
  The directory structure is organized to separate data files, output files, and scripts for better maintainability.

- **merge_data_files.py**:
  This script processes and merges bio tools and containers data into a combined metadata JSON file. It reads data from various sources, processes it, and generates a unified output file.

- **requirements.txt**:
  This file lists all the Python dependencies required for the project. It ensures that the necessary libraries are installed for the script to run successfully.

### Frontend Project:
The frontend project is built using Nuxt.js and includes the following components:

- **Directory Structure**:
  ```
  StudyProject/StaticSiteGeneration/
  ├── pages/
  ├── plugins/
  ├── public/
  ├── server/
  ├── stores/
  ├── app.vue
  ├── nuxt.config.js
  ├── package.json
  ├── tsconfig.json
  ```
  
  The directory structure is organized to separate assets, components, layouts, pages, plugins, static files, and store modules for better maintainability.

- **Main Page**:
  The main landing page of the application, providing an overview and quick access to search functionalities.

- **Tool Page**:
  Detailed information about individual bio tools and containers, including metadata and usage instructions.

- **Index Page**:
  The index page serves as the entry point for the application, providing navigation to various sections.

- **Search Page**:
  The search page allows users to perform query-based searches and view the search results.

- **App Page**:
  The app page serves as the main container for the application, managing the overall layout and structure.

- **Plugins**: 
  - **Pinia Store**: A state management library for Vue.js applications, used to manage the application's state.
  - **Vuetify**: A Material Design component framework for Vue.js, used to create a visually appealing user interface.

- **package.json Packages**:
  The `package.json` file lists all the Node.js dependencies required for the frontend project. It ensures that the necessary libraries are installed for the application to run successfully.

## GitHub Pages Deployment:

### Step 1: GitHub Actions Setup
The project is set up with GitHub Actions to automatically deploy to **GitHub Pages** when changes are pushed to the `main` branch.

To trigger deployment:
1. **Push your changes to the `main` branch**:
   ```bash
   git add .
   git commit -m "Update site content"
   git push origin main
   ```
2. The GitHub Action will automatically run the following steps:
   - Execute the Python script to generate the `combined_metadata.json` file.
   - Generate the Nuxt.js static site.
   - Deploy the site to the `gh-pages` branch.

### Step 2: Access the Live Site
Once the deployment is complete, you can access the live site via the GitHub Pages URL:
```
https://hash-bash.github.io/StudyProject/
```
