# Copilot Instructions: AES Box Project

## Project Overview
**AES Box** is a full-stack cryptography toolkit for analyzing, generating, and testing AES S-boxes with custom affine transformations. The project combines educational visualization with cryptographic validation.

### Architecture
- **Backend**: Flask API (`backend/app.py`) serving both REST endpoints (`/api/*`) and traditional routes for template rendering
- **Frontend**: React UI (`frontend/`) served via `/ui/` routes; fallback to dev server on port 5173 if no build exists
- **Core Crypto**: Modular `backend/core/` for S-box generation, validation, and field operations
- **Services**: Specialized modules for AES encryption, image processing, and Excel I/O

### Data Flow
1. **S-Box Generation**: Random or user-provided affine matrix → GF(256) inverse → affine transform → 256-byte S-box
2. **Validation Pipeline**: Bijectivity → Balanced property → SAC (Strict Avalanche Criterion) → Differential uniformity → Nonlinearity
3. **Image Testing**: Apply S-box as lookup table to image pixels → compute entropy/NPCR metrics
4. **Export**: Results exported as Excel sheets or JSON

## Key Technologies & Dependencies
- **Backend**: Flask 3.x, pandas, numpy, Pillow (PIL), cryptography, openpyxl, Flask-CORS
- **Frontend**: React, Vite, React Router
- **Crypto Libs**: Uses `cryptography` library for AES-CBC (PKCS7 padding), not custom implementation

## Essential File Structure
```
backend/
  app.py                 # Main Flask app; 645 lines with all routes
  app_combined.py        # Older monolithic version (reference only)
  core/
    field_gf256.py      # GF(256) multiplication, inverse (uses 0x11B polynomial)
    sbox_generator.py   # generate_sbox(), generate_sbox_from_matrix()
    sbox_validator.py   # is_bijective(), is_balanced(), check_sac(), etc.
    affine.py           # affine_transform(), affine_transform_custom()
    matrix_explorer.py  # explore_affine_candidates(), get_top_candidates()
    utils.py            # bit_balance(), avalanche_test()
  services/
    aes_service.py      # AES-CBC encrypt/decrypt (text/files); key derivation via PBKDF2
    image_encrypt.py    # apply_subbytes_to_image(), entropy, NPCR, histogram functions
    excel_service.py    # read_sbox_from_excel(), export_sbox_to_excel()
  templates/            # Jinja2 templates for legacy routes; landing.html, aes.html, batch_sbox_analyzer.html
  outputs/              # Runtime-created directories: uploaded_sboxes/, generated_sboxes/, encrypted_images/, aes_*
frontend/
  src/pages/           # Analyzer.jsx, Landing.jsx (React pages)
  src/components/      # GenerateSection, UploadForm, SboxTable, MetricsCard
  vite.config.js       # Vite build config; dev server on port 5173
app_root.py            # Entry point; adds backend/ to sys.path, runs app.run()
```

## Critical Patterns & Conventions

### S-Box Format & Validation
- **Format**: Flat array of 256 unique bytes (0–255); displayable as 16×16 matrix
- **Validation**: Always check `is_bijective()` first; duplicate values indicate invalid S-box
- **Validation flow** (see `validate_sbox_format()` in app.py):
  1. Length check: `len(flat) == 256`
  2. Range check: each value in `[0, 255]`
  3. Uniqueness check: `len(set(flat)) == 256`

### GF(256) & Affine Transform
- **Irreducible polynomial**: `0x11B` (standard AES polynomial)
- **Inverse**: via `gf_inverse(x)` using brute-force multiplicative search
- **Affine**: `affine_transform(inv) = M × inv_byte ⊕ constant_vec`
- Custom matrices/constants passed to `generate_sbox_from_matrix(matrix, constant_hex)`

### Metrics & Properties
All metrics defined in `backend/core/sbox_validator.py`:
- **Bijective**: All 256 values appear exactly once
- **Balanced**: Bit distribution uniform across all 256 outputs
- **SAC**: Changing one input bit should flip ~50% of output bits
- **Differential Uniformity**: Max difference table entry (lower is better)
- **Nonlinearity**: Distance from linear/affine functions (max 112 for 8-bit S-boxes)

### Image Testing Workflow
1. User uploads plaintext image → store in `uploaded_sboxes/`
2. Apply S-box: `apply_subbytes_to_image(img_path, sbox, out_path)`
3. Flip one pixel bit in plaintext → create modified version
4. Apply S-box to modified plaintext → get modified ciphertext
5. Compute **NPCR** (Number of Pixels Changed Rate): `% pixels different`
6. Compute **Entropy**: Shannon entropy of grayscale histogram

### File Serving & Routes
- **Static uploads/outputs**: `/uploads/<filename>`, `/generated/<filename>`, `/encrypted/<filename>`, `/aes-cipher/`, `/aes-plain/`, `/aes-visual/`
- **React fallback**: If `frontend/dist/` exists, serve from there; else redirect to dev server `http://localhost:5173`
- **Template routes** (legacy): `/`, `/analyzer`, `/aes`, `/batch-analyzer` render Jinja2 templates
- **REST API**: `/api/*` endpoints return JSON; no view parameters in request body (use query strings for simple flags like `?random=true`)

### Key API Endpoints
- `POST /api/validate-sbox`: Body `{"sbox": [0..255 array]}` → returns metrics dict
- `GET /api/generate-sbox?random=true`: Returns `{"sbox": [...], "metrics": {...}}`
- `POST /api/sbox/generate-from-matrix`: Body `{"matrix": 8×8 array, "constant": hex_str}` → S-box + metrics
- `POST /api/aes/text/encrypt`: Body `{"plaintext": str, "key": hex_or_passphrase, "iv": hex_or_null}`
- `POST /analyze` (form): Multipart file upload for `/analyzer` route (legacy, template-based)

### Excel/Export Format
- S-box exported as **16×16 matrix sheet** (flattened array reshaped)
- Analysis exports multiple sheets: S-box, matrix config, metrics, histograms
- Read via `read_sbox_from_excel(path)` → `(flat_array, matrix_2d)`; assumes Excel in first 16×16 range

## Development Workflows

### Running the Application
```bash
# Backend Flask server (port 5000, debug=True)
python app_root.py
# OR: cd backend && python app.py

# Frontend dev server (port 5173, if using Vite)
cd frontend && npm install && npm run dev
```

### Testing Changes
- **S-box generation**: Call `POST /api/validate-sbox` with test S-box
- **Metrics**: Use `api_validate_sbox_debug()` to get expected values for standard AES S-box
- **Image processing**: Upload test image via `/analyzer` or via `POST /analyze`
- **Excel round-trip**: Save S-box as Excel, re-upload, verify data integrity

### Common Extensions
- **New affine constants**: Edit `affine.py` constants or pass custom via API
- **New metrics**: Add validator function in `sbox_validator.py`, wire in `/api/validate-sbox` and frontend `MetricsCard`
- **New cryptanalysis**: Add to `backend/core/`, expose via new `/api/*` route, add React component to `frontend/src/`

## Project-Specific Details
- **Language**: Indonesian UI labels (e.g., "S-box harus 256 nilai")
- **Hardcoded secret key**: `app.secret_key = 'ganti_dengan_secret_key_yang_aman'` (TODO: move to env var)
- **No database**: All I/O is file-based; outputs stored in `backend/outputs/` subdirectories
- **CORS enabled**: `Flask-CORS(app)` allows frontend dev server to call backend
- **Jinja2 + React coexistence**: Legacy `/analyzer` uses Jinja2 templates; newer `/ui/` uses React SPA

## Common Gotchas
1. **Type conversion**: S-box values often come as `numpy.int64`; convert to Python `int` before JSON serialization
2. **Path handling**: Use `os.path.join()` for cross-platform compatibility; frontend refs use forward slashes (`/api/`)
3. **Matrix/flat duality**: Always keep track of whether you're working with flattened array or 16×16 matrix
4. **Validation order**: Always validate bijection before computing other properties (duplicates break metrics)
5. **PIL image mode**: Use `convert('RGB')` for color images; `convert('L')` for grayscale entropy
