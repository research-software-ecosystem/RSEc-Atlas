# StudyProject Documentation

## Project Overview

This repo is a web application built with **Nuxt.js** (a Vue.js framework) for the frontend and a Python script to process and merge bio tools and containers data into a combined metadata JSON file. The project uses GitHub Actions for automated deployment to **GitHub Pages**.

### Key Features:
- **Python Script**: Processes and merges data into a `combined_metadata.json` file.
- **Nuxt.js Frontend**: Displays the processed data through a static site.
- **GitHub Pages Deployment**: Automated deployment using GitHub Actions.

---

## Installation & Setup

### Prerequisites
Before setting up the project, make sure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.x)
- **Git** (for version control)
- **GitHub CLI** (optional for easier management of GitHub Actions)

### Clone the Repository
To start, clone the repository to your local machine:
```bash
git clone https://github.com/<your-username>/StudyProject.git
cd StudyProject
```

### Install Python Dependencies
Navigate to the **MergeDataFiles** folder and install the required Python dependencies:
1. Ensure you have a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install the necessary Python packages:
   ```bash
   pip install -r MergeDataFiles/requirements.txt
   ```
   This will install all required packages, including `PyYAML` for parsing YAML files.

### Install Node.js Dependencies
Navigate to the **StaticSiteGeneration** folder and install the required Node.js dependencies:
1. Make sure you have Node.js installed (v18+).
2. Install the dependencies using `npm`:
   ```bash
   cd StaticSiteGeneration
   npm install
   ```

---

## Running the Project Locally

### Step 1: Run the Python Script
The Python script (`MergeDataFiles.py`) processes and merges the data into `combined_metadata.json`. This file is later used by the Nuxt.js frontend.

To run the script, use the following command:
```bash
python MergeDataFiles/MergeDataFiles.py
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

---

## GitHub Pages Deployment

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
