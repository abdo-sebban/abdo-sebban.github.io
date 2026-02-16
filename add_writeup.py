#!/usr/bin/env python3

import json
import os
import sys
from datetime import date

WRITEUPS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'writeups')
MANIFEST = os.path.join(WRITEUPS_DIR, 'posts.json')

def load_manifest():
    if os.path.exists(MANIFEST):
        with open(MANIFEST, 'r') as f:
            return json.load(f)
    return []


def save_manifest(data):
    with open(MANIFEST, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'✓ Updated {MANIFEST}')


def next_id(manifest):
    if not manifest:
        return 1
    return max(entry['id'] for entry in manifest) + 1


def scan_mode():
    """Find .md files not in the manifest and add them."""
    manifest = load_manifest()
    known_files = {entry['file'] for entry in manifest}
    md_files = [f for f in os.listdir(WRITEUPS_DIR)
                if f.endswith('.md') and f not in known_files]

    if not md_files:
        print('No new .md files found in writeups/.')
        return
    
    print(f'Found {len(md_files)} new writeup(s):\n')
    for f in md_files:
        print(f'  → {f}')
    print()

    for f in md_files:
        print(f'--- Adding: {f} ---')
        title = input('  Title: ').strip()
        category = input('  Category (ctf/lab/concept): ').strip()
        tags = input('  Tags (comma-separated): ').strip()
        excerpt = input('  Excerpt (one-liner): ').strip()
        read_time = input('  Read time (e.g. "5 min read"): ').strip()
        d = input(f'  Date (YYYY-MM-DD, default {date.today()}): ').strip()
        entry = {
            'id': next_id(manifest),
            'file': f,
            'category': category,
            'tags': [t.strip() for t in tags.split(',')],
            'title': title,
            'date': d if d else str(date.today()),
            'readTime': read_time if read_time else '5 min read',
            'excerpt': excerpt
        }
        manifest.append(entry)
        print(f'  ✓ Added "{title}"\n')
    save_manifest(manifest)
    print('Done! Refresh your blog to see the new writeups.')


def interactive_mode():
    """Create a new writeup from scratch."""
    manifest = load_manifest()
    print('=== New Writeup ===\n')
    title = input('Title: ').strip()
    if not title:
        print('Title is required.')
        sys.exit(1)

    slug = title.lower()
    for ch in [' ', ':', '/', '\\', '?', '&', '#', "'", '"']:
        slug = slug.replace(ch, '-')
    while '--' in slug:
        slug = slug.replace('--', '-')
    slug = slug.strip('-')
    filename = f'{slug}.md'

    category = input('Category (ctf/lab/concept): ').strip()
    tags = input('Tags (comma-separated): ').strip()
    excerpt = input('Excerpt (one-liner): ').strip()
    read_time = input('Read time (e.g. "5 min read"): ').strip()
    d = input(f'Date (YYYY-MM-DD, default {date.today()}): ').strip()

    md_path = os.path.join(WRITEUPS_DIR, filename)
    with open(md_path, 'w') as f:
        f.write(f'## Overview\n\nWrite your content here.\n\n## Details\n\nAdd more sections with `## Heading`.\n\n'
                f'Code blocks:\n\n```\nyour code here\n```\n\n'
                f'> 💡 Notes and tips use blockquote syntax.\n\n'
                f'- List items use dashes\n- Like this\n')
    print(f'✓ Created {md_path}')

    entry = {
        'id': next_id(manifest),
        'file': filename,
        'category': category,
        'tags': [t.strip() for t in tags.split(',')],
        'title': title,
        'date': d if d else str(date.today()),
        'readTime': read_time if read_time else '5 min read',
        'excerpt': excerpt
    }
    manifest.append(entry)
    save_manifest(manifest)

    print(f'\n✓ Writeup "{title}" added!')
    print(f'  Edit your writeup: writeups/{filename}')
    print(f'  Refresh the blog to see it live.')


if __name__ == '__main__':
    if '--scan' in sys.argv:
        scan_mode()
    else:
        interactive_mode()
