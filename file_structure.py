import os

# Base directories for the project
project_structure = {
    "client": {
        "src": {
            "components": {
                "common": ["Sidebar.tsx", "Marquee.tsx", "Alerts.tsx"],
                "dashboard": ["Dashboard.tsx", "Contribution.tsx"],
                "user": ["UserDiagnostic.tsx", "UserProfile.tsx"],
                "settings": ["Settings.tsx"],
            },
            "styles": ["index.css"],
            "": ["App.tsx", "main.tsx", "vite-env.d.ts"],
        },
        "": [".gitignore", "eslint.config.js", "index.html", "package.json", "package-lock.json", 
             "postcss.config.js", "tailwind.config.js", "tsconfig.app.json", "tsconfig.json", 
             "tsconfig.node.json", "vite.config.ts"],
    },
    "server": {
        "controllers": ["uploadController.js", "userController.js"],
        "middleware": ["authMiddleware.js"],
        "models": ["User.js", "Upload.js"],
        "routes": ["uploadRoutes.js", "userRoutes.js"],
        "uploads": [],
        "": ["server.js", "package.json", "package-lock.json", ".gitignore"],
    },
}

def create_structure(base_path, structure):
    """
    Recursively creates directories and files based on the provided structure.
    Skips files that already exist to prevent overwriting.
    """
    for key, value in structure.items():
        # Build the current path
        current_path = os.path.join(base_path, key)
        
        # If value is a dictionary, create the directory and recurse
        if isinstance(value, dict):
            os.makedirs(current_path, exist_ok=True)
            create_structure(current_path, value)
        # If value is a list, create files inside the current directory
        elif isinstance(value, list):
            os.makedirs(current_path, exist_ok=True)
            for file in value:
                file_path = os.path.join(current_path, file)
                if not os.path.exists(file_path):  # Check if the file already exists
                    with open(file_path, 'w') as f:
                        f.write('')  # Create an empty file
                        print(f"Created file: {file_path}")
                else:
                    print(f"File already exists, skipping: {file_path}")

# Set the root directory for your project
root_dir = os.getcwd()  # Change to your desired directory if needed

# Create the structure
create_structure(root_dir, project_structure)

print("Project structure created successfully!")
