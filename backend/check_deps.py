import os
import re
import sys

# Get all standard library modules to ignore them
try:
    stdlib_modules = set(sys.stdlib_module_names)
except AttributeError:
    # Fallback for Python < 3.10
    import distutils.sysconfig as sysconfig
    std_lib_dir = sysconfig.get_python_lib(standard_lib=True)
    stdlib_modules = {f.split(".")[0] for f in os.listdir(std_lib_dir)}

# Known local modules
local_modules = {"routers", "models", "schemas", "utils", "services", "database", "config", "main"}

import_pattern = re.compile(r'^(?:from|import)\s+([a-zA-Z0-9_]+)')

all_imports = set()

for root, _, files in os.walk("."):
    if "venv" in root or "__pycache__" in root or ".git" in root:
        continue
    for file in files:
        if file.endswith(".py"):
            with open(os.path.join(root, file), "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    match = import_pattern.match(line.strip())
                    if match:
                        module = match.group(1)
                        if module not in stdlib_modules and module not in local_modules:
                            all_imports.add(module)

print("Found external imports:")
for imp in sorted(all_imports):
    print(f"- {imp}")
