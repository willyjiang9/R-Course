"""
export_stats.py
===============
Downloads all courseStats from Firebase and saves as src/data/courseStats.json
Run this whenever you want to update the bundled stats.

USAGE:
    python3 export_stats.py
"""

import json
import sys
import os

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("Run: pip3 install firebase-admin")
    sys.exit(1)

SERVICE_KEY  = "serviceAccountKey.json"
OUTPUT_FILE  = "src/data/courseStats.json"

def main():
    if not os.path.exists(SERVICE_KEY):
        print(f"❌ Missing {SERVICE_KEY}")
        sys.exit(1)

    print("Connecting to Firebase...")
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate(SERVICE_KEY)
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    print("Downloading all course stats...")
    docs = db.collection('courseStats').stream()

    stats = {}
    count = 0
    for doc in docs:
        d = doc.to_dict()
        code = d.get('courseCode', '')
        if not code:
            continue
        review_count = d.get('reviewCount', 0)
        if review_count == 0:
            continue
        stats[code] = {
            'reviewCount':   review_count,
            'avgDifficulty': round(d.get('totalDifficulty', 0) / review_count, 2),
            'avgProfRating': round(d.get('totalProfRating', 0) / review_count, 2),
            'recommendPct':  round((d.get('recommendCount', 0) / review_count) * 100),
        }
        count += 1

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(stats, f, indent=2)

    print(f"✅ {count} course stats saved to {OUTPUT_FILE}")
    print(f"\nNow run:")
    print(f"  git add .")
    print(f"  git commit -m 'update bundled course stats'")
    print(f"  git push")

if __name__ == "__main__":
    main()
