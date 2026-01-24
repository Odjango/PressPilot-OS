import os
import shutil
import glob

PROOF_CORES_DIR = "/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/proven-cores"

# 1. Redundant Folder
FOLDER_TO_DELETE = "spectra-one-next-release"

# 2. Image Extensions to Wipe
IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".svg", ".webp"}

# 3. Dev Files to Delete (Recursively in each theme)
DEV_FILES = {
    "package.json",
    "package-lock.json",
    "webpack.config.js",
    "Gruntfile.js",
    ".gitignore",
    ".editorconfig",
}

DEV_DIRS = {
    "tests",
    "node_modules",
    ".git" # Adding .git again to be sure
}

def aggressive_cleanup():
    print("Starting Aggressive Cleanup...")
    deleted_count = 0

    # 1. Delete redundant folder
    redundant_path = os.path.join(PROOF_CORES_DIR, FOLDER_TO_DELETE)
    if os.path.exists(redundant_path):
        shutil.rmtree(redundant_path)
        print(f"DELETED FOLDER: {redundant_path}")
    else:
        print(f"Folder not found (good): {redundant_path}")

    # Walk through all themes
    for root, dirs, files in os.walk(PROOF_CORES_DIR):
        # check if we are inside a 'proven-cores' subdirectory (theme root or deeper)
        # Avoid deleting things in the root of proven-cores if any (though usually just themes)
        
        # 2. Image Wipe in assets/images or assets/img
        # We check if current directory path contains 'assets/images' or 'assets/img'
        if "assets/images" in root or "assets/img" in root:
            for f in files:
                _, ext = os.path.splitext(f)
                if ext.lower() in IMG_EXTENSIONS:
                    fp = os.path.join(root, f)
                    os.remove(fp)
                    print(f"DELETED IMAGE: {fp}")
                    deleted_count += 1
        
        # 3. Dev Bloat Removal (Files)
        for f in files:
            if f in DEV_FILES:
                fp = os.path.join(root, f)
                os.remove(fp)
                print(f"DELETED DEV FILE: {fp}")
                deleted_count += 1

        # 3. Dev Bloat Removal (Directories)
        # modifiy dirs in-place to recurse correctly? 
        # Actually os.walk allows modifying 'dirs' to prevent recursion into deleted dirs.
        # But we want to delete the dir itself.
        for d in list(dirs):
            if d in DEV_DIRS:
                dp = os.path.join(root, d)
                shutil.rmtree(dp)
                print(f"DELETED DEV DIR: {dp}")
                dirs.remove(d) # Don't traverse into deleted dir
                deleted_count += 1

    print(f"\nCleanup Complete. Total items removed: {deleted_count}")

if __name__ == "__main__":
    aggressive_cleanup()
