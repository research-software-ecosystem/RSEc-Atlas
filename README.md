# Documentation: RSE Metadata Explorer

## Aim:
This web application aims to allow researchers and scientists to explore the metadata of various bioinformatics tools and containers. To make the process of finding and utilizing these biotools and biocontainers more efficient, this application fetches the metadata of biotools and biocontainers from the git repository of Research Software Ecosystem Content (https://github.com/research-software-ecosystem/content.git), and provides a user-friendly interface to show, search, and filter these biotools and biocontainers.

## Setup and Installation:

Since this application utilizes make file, the procedure of setting up and running this project locally can be simply done by:

### 1. Installing `make`
   #### Windows: Open PowerShell as Administrator and run:
      choco install make
   #### Ubuntu: # Install using apt in Terminal:
      sudo apt update
      sudo apt install make
### 2. Change the directory to the root of the project `./StudyProject`:
      cd ./StudyProject
### 3. Run the following make command:
      make run-full-workflow 

In case of initializing without make, we can do it by:

### Prerequisites:
Before setting up the project, ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher): Required for running the Nuxt.js frontend.
- **Python** (v3.x): Required for running the Python scripts to process and merge metadata files.
- **Git**: For version control and managing repository changes.
- **GitHub CLI** (optional): For easier management of GitHub Actions and repository interactions.

### Clone the Repository:
To get started, clone the repository to your local machine using the following commands:
```bash
git clone https://github.com/hash-bash/StudyProject.git
cd StudyProject
```

### Install Python Dependencies:
Navigate to the **MergeDataFiles** folder and install the required Python dependencies:
1. Set up a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install the necessary Python packages from the `requirements.txt` file:
   ```bash
   pip install -r MergeDataFiles/requirements.txt
   ```
   This will install all required packages, including `PyYAML` for parsing YAML files.

### Install Node.js Dependencies:
Navigate to the **StaticSiteGeneration** folder and install the required Node.js dependencies:
1. Ensure you have Node.js installed (v18+).
2. Install the dependencies using `npm`:
   ```bash
   cd StaticSiteGeneration
   npm install
   ```

## Tools and Utilities Utilized:
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

## Working:
The application consists of several key components:

### Main Page:
The main landing page of the application provides an overview of the available bio tools and containers. Users can quickly access search functionalities and view featured tools.

### Search: Query Search:
The search functionality allows users to perform query-based searches to find specific bio tools and containers. The search results are displayed in a user-friendly manner, allowing users to easily navigate through the available options.

### Favourites:
Users can mark bio tools and containers as favorites for quick access in the future. The favorites functionality ensures that users can maintain a personalized list of frequently used tools.

### Filters:
The application provides various filtering options to narrow down search results based on specific criteria such as tool type, functionality, and more. This helps users quickly find the most relevant tools for their needs.

### Tool Page:
Each bio tool and container has a dedicated tool page that provides detailed information about the tool, including its description, usage instructions, and related resources. Users can also view metadata and other relevant details.

## Automation:
Automation is a key aspect of the project, ensuring seamless workflows and efficient build processes:

### Makefile:
The `Makefile` is used to automate various build processes and tasks. It defines a set of rules and commands for compiling, linking, and managing dependencies, making the development process more efficient.

### Workflow File:
The GitHub Actions workflow file automates the deployment process to GitHub Pages. It runs predefined steps such as generating the static site, executing Python scripts, and deploying the site to the `gh-pages` branch.

## Implementation:

### Python Script:
The Python script is responsible for processing and merging metadata files. It includes the following components:

- **Directory Structure**:
  ```
  MergeDataFiles/
  ├── data/
  ├── output/
  ├── scripts/
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
  StaticSiteGeneration/
  ├── assets/
  ├── components/
  ├── layouts/
  ├── pages/
  ├── plugins/
  ├── static/
  ├── store/
  ├── nuxt.config.js
  ├── package.json
  └── README.md
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

## Running the Project Locally:

### Step 1: Run the Python Script
The Python script (`merge_data_files.py`) processes and merges the data into `combined_metadata.json`. This file is later used by the Nuxt.js frontend.
```bash
python MergeDataFiles/merge_data_files.py
```
This will generate the `combined_metadata.json` file in the `MergeDataFiles` folder.

### Step 2: Copy the Generated JSON to the Static Site Folder
After running the Python script, copy the `combined_metadata.json` file from the **MergeDataFiles** folder to the **StaticSiteGeneration/public** folder:
```bash
cp MergeDataFiles/combined_metadata.json StaticSiteGeneration/public/
```

### Step 3: Generate the Static Site
Navigate to the **StaticSiteGeneration** directory and run the following command to generate the static site:
```bash
npm run generate
```
This will create a fully static site in the `.output/public` directory.

### Step 4: Preview the Site
To preview the generated static site, run:
```bash
npm run preview
```
You should now be able to access the site locally at `http://localhost:3000`.

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
