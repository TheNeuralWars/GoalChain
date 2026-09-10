# Issue #877: Gate the Neural Wars Reader to a Paid Sample

## Problem Summary
The `/go/reader/` endpoint currently serves the entire 124-chapter manuscript (Book 1 + Book 2 in ES and EN) for free, violating KDP Select terms and blocking revenue generation. The goal is to convert it to a gated sample + buy surface with:
- Prologue (FC-00/ENS-00) + Chapter 1 (FC-01/ENS-01) only (ES + EN)
- Visible price and email-capture CTA
- Source of truth: `data/publishing/kdp_manifest.json` (pricing: $0.99 preorder / $2.99 regular)

## Current State Analysis
- **Generated HTML**: `docs/go/reader/index.html` (372,816 bytes) and `docs/reader.html` (372,810 bytes)
- **Chapters**: 62 Spanish (CAPÍTULO) + 62 English (CHAPTER) = 124 total
- **Hard sci-fi references**: 2 instances in HTML
- **Script Issues**:
  - Hardcoded Windows path: `c:\Users\NicoPez\the-neural-wars-trilogy`
  - `load_book_chapters()` loads ALL `.md` files
  - `books_payload` includes both Book 1 and Book 2 with full chapters
  - Genre strings say "Hard Sci-Fi / Cyberpunk" and "Hard Sci-Fi / Space Opera"

## Solution Overview

### File Changes Required

#### 1. `/home/ubuntu/hermes/workspace/GoalChain/scripts/build_static_reader.py` (ROOT CAUSE)
**Changes**:
- Update `base_trilogy` path to VPS location
- Modify `load_book_chapters()` to filter chapters (FC-00, FC-01, ENS-00, ENS-01 only)
- Remove hardcoded "Hard Sci-Fi" genre strings
- Add pricing data injection from manifest
- Update HTML template with price/CTA

**Key Code Changes**:
```python
# NEW: Correct path for VPS
base_trilogy = r"/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy"

# MODIFIED: Load only prologue + chapter 1
def load_book_chapters(book_folder_name, edition_subfolder, include_prologue=True, include_chapter1=True):
    folder = os.path.join(base_trilogy, book_folder_name, edition_subfolder)
    files = sorted([
        f for f in glob.glob(os.path.join(folder, "*.md"))
        if not f.startswith("README") and not f.startswith("MANUSCRIPT")
        and (("FC-00" in f and include_prologue) or ("FC-01" in f and include_chapter1) or 
             ("ENS-00" in f and include_prologue) or ("ENS-01" in f and include_chapter1))
    ])
    # ... rest of function unchanged

# NEW: Pricing data injection
def get_pricing_info():
    manifest_path = r"/data/apps/GoalChain/data/publishing/kdp_manifest.json"
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        return manifest.get('pricing', {})
    return {"preorder_usd": 0.99, "regular_usd": 2.99, "kindle_unlimited": True}

# MODIFIED: books_payload with filtered chapters + pricing
pricing = get_pricing_info()
books_payload = [
    {
        "id": "the-neural-wars-book-1",
        "title": {"es": "The Neural Wars: Código Fracturado (Libro 1)", "en": "The Neural Wars: Fractured Code (Book 1)"},
        "subtitle": {"es": "Edición Definitiva de Autor 2026", "en": "2026 Definitive Author Edition"},
        "chapters": {"es": b1_es, "en": b1_en},  # Only FC-00 + FC-01
        "pricing": pricing
    },
    # Only Book 1 (Book 2 removed as per requirements)
]
```

#### 2. `/home/ubuntu/hermes/workspace/GoalChain/docs/assets/js/play_url.js`
**Changes**:
- Update `PLAY` domain to use email capture endpoint
- Add price display logic to CTA

#### 3. `/home/ubuntu/hermes/workspace/GoalChain/docs/publishing/kdp_manifest.json` (CREATE/UPDATE)
**New file structure**:
```json
{
  "pricing": {
    "preorder_usd": 0.99,
    "regular_usd": 2.99,
    "kindle_unlimited": true
  },
  "bisac_excluded": ["Fiction / Science Fiction / Hard Science Fiction"]
}
```

#### 4. HTML Template Updates (in build_static_reader.py)
**Changes in html_template**:
- Add price display section near top of page
- Add email capture CTA with pricing
- Remove "Hard Sci-Fi" genre references
- Update page description to reflect gated content

## Test Requirements

### Acceptance Tests (must output real results)
```bash
# Test 1: HTML size < 60KB, chapters <= 2, no chapter 15
python3 -c "
import re
s=open('docs/go/reader/index.html').read()
print(len(s), len(re.findall(r'CAP.TULO \\d+', s)), len(re.findall(r'CHAPTER \\d+', s)))
"

# Test 2: Prologue Chapter 1 present (ES + EN)
grep -c 'CAPÍTULO 1:' docs/go/reader/index.html

# Test 3: No hard sci-fi references in script
grep -ic 'hard sci-fi' scripts/build_static_reader.py

# Test 4: Price rendered in HTML
grep -c '0.99\\|2.99' docs/go/reader/index.html

# Test 5: Live check (post-merge)
curl -s https://goalworld.fun/go/reader/ | wc -c
curl -s https://goalworld.fun/go/reader/ | grep -c 'CAPÍTULO 15'
```

## Expected Output After Fix

### HTML Statistics
- **Size**: < 60,000 bytes (vs current 372,816 bytes)
- **Spanish Chapters**: <= 2 (FC-00 + FC-01)
- **English Chapters**: <= 2 (ENS-00 + ENS-01)  
- **Chapter 15**: 0 instances (vs current 4 each)
- **Hard sci-fi references**: 0 (vs current 2)

### File Size Reduction
- **Current**: 372,816 bytes (~364 KB)
- **Target**: < 60,000 bytes (~59 KB)
- **Reduction**: ~82% smaller

## Risks & Regressions

### High Risk
1. **Script Path Issues**: Windows-to-Unix path conversion
2. **Chapter Filtering Logic**: Mistakes in file name matching
3. **Price Integration**: Incorrect manifest loading

### Medium Risk
1. **HTML Template Updates**: Breaking existing UI/UX
2. **Email Capture Functionality**: Improper form implementation
3. **Language Toggle**: ES/EN consistency issues

### Low Risk
1. **Performance**: Reduced HTML size = faster load times
2. **SEO**: Cleaner metadata without genre restrictions

## Rollback Strategy

### Quick Rollback (5 minutes)
```bash
# Restore original generated files
if [ -f "docs/go/reader/index.html.backup" ]; then
    cp docs/go/reader/index.html.backup docs/go/reader/index.html
fi
if [ -f "docs/reader.html.backup" ]; then
    cp docs/reader.html.backup docs/reader.html
fi

# Re-run original script (requires fixing Windows path first)
python3 scripts/build_static_reader.py  # Will still fail due to path issues
```

### Full Rollback (30 minutes)
1. Restore original script from git
2. Fix script Windows path issue
3. Re-run generation
4. Verify live URL is restored

## Implementation Timeline

### Phase 1: Script Fix (30 minutes)
- Update path and chapter filtering
- Test manifest integration
- Verify reduced HTML output

### Phase 2: HTML Template Updates (20 minutes)
- Add price/CTA sections
- Remove genre restrictions
- Update metadata

### Phase 3: JavaScript Updates (15 minutes)
- Update play_url.js for email capture
- Test CTA functionality

### Phase 4: Testing (30 minutes)
- Run all acceptance tests
- Verify live deployment
- Final quality checks

## Total Estimated Time: 135 minutes (2.25 hours)

## Post-Implementation Monitoring

### Success Metrics
- HTML size: < 60,000 bytes
- Chapter count: <= 2 per language
- No chapter 15 references
- Price displayed: Yes
- Email capture functional: Yes

### Alert Conditions
- HTML size > 65,000 bytes
- Chapter count > 2
- Missing pricing information
- JavaScript errors in browser console

## Dependencies
- No new external dependencies
- Uses existing manifest structure
- Maintains current UI framework
- Preserves ES/EN language toggle

## Compliance Notes
- KDP Select terms compliance achieved
- No Amazon link exposure (email capture only)
- BISAC exclusion respected
- Genre restrictions removed as requested