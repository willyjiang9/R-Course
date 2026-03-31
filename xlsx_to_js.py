"""
xlsx_to_js.py
=============
Converts ucr_all_terms.xlsx into src/data/allCourses.json
Reads ALL term sheets and combines unique courses across all terms.

USAGE:
    python3 xlsx_to_js.py
"""

import json
import os
import openpyxl

XLSX_FILE   = "ucr_all_terms.xlsx"
OUTPUT_FILE = "src/data/allCourses.json"
SKIP_SHEETS = {"All Courses", "Summary"}


def load_courses(xlsx_path):
    print(f"Loading {xlsx_path}...")
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)

    print(f"Sheets found: {wb.sheetnames}")

    headers = None
    all_rows = []

    for sheet_name in wb.sheetnames:
        if sheet_name in SKIP_SHEETS:
            continue
        ws = wb[sheet_name]
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            continue
        if headers is None:
            headers = [str(h).strip() if h else "" for h in rows[0]]
        all_rows.extend(rows[1:])
        print(f"  {sheet_name}: {len(rows)-1} rows")

    if not headers:
        print("No data found!")
        return []

    print(f"Total rows across all terms: {len(all_rows)}")
    print(f"Columns: {headers}")

    col = {h: i for i, h in enumerate(headers)}

    def get(row, name, default=""):
        i = col.get(name)
        if i is None or i >= len(row):
            return default
        v = row[i]
        return str(v).strip() if v is not None else default

    seen = set()
    courses = []

    for row in all_rows:
        subject = get(row, "Subject Code")
        number  = get(row, "Course Number")
        if not subject or not number:
            continue

        full_code = get(row, "Full Code") or f"{subject} {number}"

        # Skip duplicates — keep first occurrence (most recent term)
        if full_code in seen:
            continue
        seen.add(full_code)

        courses.append({
            "fullCode":      full_code,
            "subject":       subject,
            "number":        number,
            "title":         get(row, "Title"),
            "units":         get(row, "Units"),
            "description":   get(row, "Description"),
            "prerequisites": get(row, "Prerequisites"),
            "scheduleType":  get(row, "Schedule Type"),
        })

    return courses


def main():
    if not os.path.exists(XLSX_FILE):
        print(f"❌ File not found: {XLSX_FILE}")
        print("Make sure ucr_all_terms.xlsx is in the ucr-courses folder.")
        return

    courses = load_courses(XLSX_FILE)
    print(f"\nUnique courses found: {len(courses)}")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(courses, f, indent=2)

    print(f"✅ Written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
