import os
import zipfile

# Folders to exclude
EXCLUDE_DIRS = {"node_modules", "venv"}

# Files you want to exclude (optional)
EXCLUDE_FILES = {".DS_Store"}

def should_exclude(path):
    # Exclude directories
    parts = path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True

    # Exclude specific files
    if os.path.basename(path) in EXCLUDE_FILES:
        return True

    return False


def zip_project(output_name="project.zip"):
    with zipfile.ZipFile(output_name, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Modify dirs in-place to skip excluded folders
            dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d))]

            for file in files:
                filepath = os.path.join(root, file)
                if not should_exclude(filepath):
                    zipf.write(filepath)

    print(f"\n✔ Zip created successfully: {output_name}\n")


if __name__ == "__main__":
    zip_project("project.zip")
