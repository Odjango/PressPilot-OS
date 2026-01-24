import os
import shutil

PROOF_CORES_DIR = "/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/proven-cores"

# 1. Redundant Folder
FOLDER_TO_DELETE = "spectra-one-next-release"

# 2. Image Extensions to Wipe
IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".svg", ".webp"}
EXCEPTION_FILE = "screenshot.png"

# 3. Dev Files to Delete (Recursively)
DEV_FILES = {
    "package.json",
    "package-lock.json",
    "webpack.config.js",
    "Gruntfile.js",
    ".gitignore",
}

def recursive_cleanup():
    print("Starting Recursive Cleanup...")
    deleted_files = 0
    deleted_dirs = 0

    # 1. Delete redundant folder
    redundant_path = os.path.join(PROOF_CORES_DIR, FOLDER_TO_DELETE)
    if os.path.exists(redundant_path):
        shutil.rmtree(redundant_path)
        print(f"DELETED FOLDER: {redundant_path}")
        deleted_dirs += 1
    else:
        print(f"Folder not found (good): {redundant_path}")

    # Walk top-down to delete files first
    for root, dirs, files in os.walk(PROOF_CORES_DIR, topdown=False):
        
        # 2 & 3. Delete Files (Images & Dev Bloat)
        for f in files:
            fp = os.path.join(root, f)
            _, ext = os.path.splitext(f)
            
            # Check Image Rule
            if ext.lower() in IMG_EXTENSIONS:
                if f == EXCEPTION_FILE:
                    continue # KEEP screenshot.png
                os.remove(fp)
                print(f"DELETED IMAGE: {fp}")
                deleted_files += 1
                continue
            
            # Check Dev Rule
            if f in DEV_FILES:
                os.remove(fp)
                print(f"DELETED DEV FILE: {fp}")
                deleted_files += 1
                continue

    # 4. Clean Empty Directories (Second pass, bottom-up naturally from topdown=False logic? No, os.walk(topdown=False) yields files before dirs, so we can check dirs after files are gone)
    
    # We need to re-walk or do it carefully. using topdown=False allows us to delete children before parents.
    # The previous loop walked files first. 
    # Let's do a dedicated pass for empty folders to be sure.
    
    for root, dirs, files in os.walk(PROOF_CORES_DIR, topdown=False):
        for d in dirs:
            dp = os.path.join(root, d)
            # Check if directory is empty
            if not os.listdir(dp):
                os.rmdir(dp)
                print(f"DELETED EMPTY DIR: {dp}")
                deleted_dirs += 1

    print(f"\nCleanup Complete.")
    print(f"Files Deleted: {deleted_files}")
    print(f"Directories Deleted: {deleted_dirs}")

if __name__ == "__main__":
    recursive_cleanup()
