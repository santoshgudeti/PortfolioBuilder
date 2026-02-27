import re

def fix_tailwind_classes(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements to support light/dark mode natively
    replacements = [
        (r'\bbg-gray-950\text-white\b', 'bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white'),
        (r'\bbg-gray-950\b', 'bg-gray-50 dark:bg-gray-950'),
        (r'\btext-white\b', 'text-gray-900 dark:text-white'),
        (r'\btext-gray-400\b', 'text-gray-600 dark:text-gray-400'),
        (r'\btext-gray-300\b', 'text-gray-700 dark:text-gray-300'),
        (r'\btext-gray-500\b', 'text-gray-500 dark:text-gray-500'),
        (r'\bborder-white/5\b', 'border-black/5 dark:border-white/5'),
        (r'\bborder-white/10\b', 'border-black/10 dark:border-white/10'),
        (r'\bbg-white/5\b', 'bg-black/5 dark:bg-white/5'),
        (r'\bbg-white/\[0\.02\]\b', 'bg-black/[0.02] dark:bg-white/[0.02]'),
        (r'\bbg-white/\[0\.04\]\b', 'bg-black/[0.04] dark:bg-white/[0.04]'),
        (r'\bbg-white/\[0\.05\]\b', 'bg-black/[0.05] dark:bg-white/[0.05]'),
        (r'\bbg-white/10\b', 'bg-black/10 dark:bg-white/10'),
        (r'\bhover:bg-white/5\b', 'hover:bg-black/5 dark:hover:bg-white/5'),
        (r'\bhover:bg-white/10\b', 'hover:bg-black/10 dark:hover:bg-white/10'),
        (r'\bhover:text-white\b', 'hover:text-black dark:hover:text-white'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    # Specific fix for the main container
    content = content.replace(
        '<div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">',
        '<div className={`min-h-screen transition-colors duration-300 ${mode === \'dark\' ? \'dark bg-gray-950 text-white\' : \'bg-gray-50 text-gray-900\'}`}>'
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    fix_tailwind_classes(r'c:\Users\santo\Downloads\Current Project\Portfolio builder\frontend\src\templates\StandardTemplate.tsx')
    print("Done")
