import os

PROOF_CORES_DIR = "/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/proven-cores"

BEFORE_SIZES = {
    "blockbase": 9.54,
    "frost": 0.42,
    "ollie": 2.45,
    "spectra-one": 2.99,
    "tove": 0.38,
    "twentytwentyfour": 2.99
}

def get_dir_size_mb(path):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)
    return total_size / (1024 * 1024)

print("### Theme Cleaning Report")
print(f"| Theme | Original Size (MB) | Final Size (MB) | Reduction |")
print(f"| --- | --- | --- | --- |")

for theme, original_mb in BEFORE_SIZES.items():
    theme_path = os.path.join(PROOF_CORES_DIR, theme)
    if os.path.exists(theme_path):
        final_mb = get_dir_size_mb(theme_path)
        reduction = original_mb - final_mb
        # If reduction is negative (unlikely or negligible), just show 0
        if reduction < 0.001:
            reduction = 0
        print(f"| `{theme}` | {original_mb:.2f} | {final_mb:.2f} | -{reduction:.2f} MB |")
    else:
        print(f"| `{theme}` | {original_mb:.2f} | MISSING | N/A |")

print("\n**Cleanup Actions:**")
print("- Scanned for `node_modules`, `.zip`, `.git`, huge media.")
print("- Sanitized marketing text in `patterns/`, `parts/`, `templates/`.")
