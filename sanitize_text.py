import os

PROOF_CORES_DIR = "/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/proven-cores"

REPLACEMENTS = {
    "ollie": [
        ("Welcome to Ollie", "Welcome to Your Site"),
        ("Ollie ships with", "This theme ships with"),
        ("Download Ollie", "Download this theme"),
        ("patterns from Ollie", "patterns from our library"),
        ("Ollie.", "WordPress."), # specific sentence case
    ],
    "frost": [
        ("Frost enables agencies", "This theme enables you"),
        ("Welcome to Frost", "Welcome to Your Site"),
        ("Frost is a", "This theme is a"),
    ],
    "spectra-one": [
        ("Welcome to Spectra One", "Welcome to Your Site"),
    ],
    "blockbase": [], # Mostly fonts/css
    "tove": [],
    "twentytwentyfour": []
}

def sanitize_theme(theme_name):
    theme_path = os.path.join(PROOF_CORES_DIR, theme_name)
    if not os.path.exists(theme_path):
        return 0
    
    replacements = REPLACEMENTS.get(theme_name, [])
    if not replacements:
        return 0

    count = 0
    # Walk through specific directories to avoid breaking core PHP logic
    # We focus on patterns, parts, templates where content lives
    target_subs = ["patterns", "parts", "templates", "inc/patterns"]
    
    for sub in target_subs:
        search_path = os.path.join(theme_path, sub)
        if not os.path.exists(search_path):
            continue
            
        for dirpath, _, filenames in os.walk(search_path):
            for f in filenames:
                if f.endswith(".php") or f.endswith(".html"):
                    filepath = os.path.join(dirpath, f)
                    try:
                        with open(filepath, "r", encoding="utf-8") as file:
                            content = file.read()
                        
                        new_content = content
                        for old, new in replacements:
                            new_content = new_content.replace(old, new)
                        
                        if new_content != content:
                            with open(filepath, "w", encoding="utf-8") as file:
                                file.write(new_content)
                            count += 1
                            print(f"Sanitized: {filepath}")
                    except Exception as e:
                        print(f"Error reading {filepath}: {e}")
    return count

print("Starting Text Sanitization...")
total_files = 0
for theme in REPLACEMENTS.keys():
    c = sanitize_theme(theme)
    if c > 0:
        print(f"[{theme}] Sanitized {c} files.")
        total_files += c

print(f"Total files sanitized: {total_files}")
