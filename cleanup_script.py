import os
import shutil
import glob

PROOF_CORES_DIR = "/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/proven-cores"
THEMES = ["blockbase", "frost", "ollie", "spectra-one", "tove", "twentytwentyfour"]

def get_dir_size(path):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # skip if it is symbolic link
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)
    return total_size

def format_size(size):
    # Convert bytes to MB
    return f"{size / (1024 * 1024):.2f} MB"

def cleanup_theme(theme_path):
    deleted_items = []
    
    # 1. Delete node_modules
    node_modules = os.path.join(theme_path, "node_modules")
    if os.path.exists(node_modules):
        shutil.rmtree(node_modules)
        deleted_items.append("node_modules/")

    # 2. Delete .git
    git_dir = os.path.join(theme_path, ".git")
    if os.path.exists(git_dir):
        shutil.rmtree(git_dir)
        deleted_items.append(".git/")
        
    # 3. Delete .zip files
    zip_files = glob.glob(os.path.join(theme_path, "*.zip"))
    for zip_file in zip_files:
        os.remove(zip_file)
        deleted_items.append(os.path.basename(zip_file))

    # 4. Delete uploads or assets/images folders that look like content
    # Common paths for dummy content: assets/images, uploads, images (if random stock photos)
    # We need to be careful not to delete theme UI assets (icons, etc)
    # Strategy: Look for specific 'uploads' folder or large media files
    
    # Delete 'uploads' folder if strictly used for content
    # Just walking to find large files (>5MB)
    for dirpath, dirnames, filenames in os.walk(theme_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp):
                size_mb = os.path.getsize(fp) / (1024 * 1024)
                if size_mb > 5: # Delete files larger than 5MB
                    os.remove(fp)
                    deleted_items.append(f"{f} ({size_mb:.2f} MB)")
                elif f.endswith(".mp4") or f.endswith(".mov") or f.endswith(".zip"):
                     os.remove(fp)
                     deleted_items.append(f)

    return deleted_items

print(f"{'THEME':<20} | {'BEFORE':<10} | {'AFTER':<10} | {'DELETED ITEMS'}")
print("-" * 80)

for theme in THEMES:
    theme_path = os.path.join(PROOF_CORES_DIR, theme)
    if not os.path.isdir(theme_path):
        print(f"{theme:<20} | NOT FOUND")
        continue

    size_before = get_dir_size(theme_path)
    
    deleted = cleanup_theme(theme_path)
    
    size_after = get_dir_size(theme_path)
    
    # Format deleted list
    deleted_str = ", ".join(deleted)
    if len(deleted_str) > 50:
        deleted_str = deleted_str[:47] + "..."
        
    print(f"{theme:<20} | {format_size(size_before):<10} | {format_size(size_after):<10} | {deleted_str}")
