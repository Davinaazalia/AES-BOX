# app_combined.py - Frontend + Backend in one app
import os
import sys
from flask import Flask, request, render_template, redirect, url_for, flash, send_from_directory, send_file, jsonify
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
from PIL import Image
import io

# Import backend modules
from core.sbox_generator import generate_sbox
from core.sbox_validator import is_bijective, is_balanced, check_sac, differential_uniformity, nonlinearity

# --------------------
# Configuration
# --------------------
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXCEL = {'xlsx', 'xls'}
ALLOWED_IMAGES = {'png', 'jpg', 'jpeg'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__, template_folder='../templates', static_folder='../frontend')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'ganti_dengan_secret_key_yang_aman'

# --------------------
# Helpers
# --------------------
def allowed_file(filename, allowed_ext):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_ext

def read_sbox_from_excel(path):
    df = pd.read_excel(path, header=None)
    mat = df.iloc[:16, :16].fillna(0).astype(int).values
    flat = mat.flatten().tolist()
    return flat, mat

def validate_sbox(flat):
    if len(flat) != 256:
        return False, "S-box harus 256 nilai (16x16)."
    for v in flat:
        if not (0 <= int(v) <= 255):
            return False, f"Nilai {v} di luar rentang 0..255."
    if len(set(flat)) != 256:
        dup = 256 - len(set(flat))
        return False, f"S-box tidak bijektif: terdapat {dup} duplikat."
    return True, "S-box valid dan bijektif."

def bit_balance(flat):
    arr = np.array(flat, dtype=np.uint8)
    counts = []
    for b in range(8):
        ones = int(np.sum(((arr >> b) & 1) == 1))
        counts.append(ones)
    return counts

def hamming(a, b):
    return bin(int(a) ^ int(b)).count("1")

def avalanche_test(flat, flip_bit=0):
    arr = np.array(flat, dtype=np.uint8)
    total = 0
    n = 256
    for x in range(n):
        y = x ^ (1 << flip_bit)
        s1 = int(arr[x])
        s2 = int(arr[y])
        total += hamming(s1, s2)
    return float(total) / n

def apply_subbytes_to_image(img_path, sbox_flat, out_path):
    im = Image.open(img_path).convert('RGB')
    arr = np.array(im, dtype=np.uint8)
    mapper = np.array(sbox_flat, dtype=np.uint8)
    flat = arr.flatten()
    mapped = mapper[flat]
    mapped = mapped.reshape(arr.shape)
    out = Image.fromarray(mapped, mode='RGB')
    out.save(out_path)
    return out_path

def image_entropy(img_path):
    im = Image.open(img_path).convert('L')
    arr = np.array(im).flatten()
    counts = np.bincount(arr, minlength=256)
    probs = counts / counts.sum()
    probs = probs[probs > 0]
    H = -np.sum(probs * np.log2(probs))
    return float(H)

def npcr(img1_path, img2_path):
    a = np.array(Image.open(img1_path).convert('RGB'))
    b = np.array(Image.open(img2_path).convert('RGB'))
    if a.shape != b.shape:
        raise ValueError("Images must be same shape for NPCR")
    diff = np.sum(np.any(a != b, axis=2))
    total = a.shape[0] * a.shape[1]
    return float(diff) / float(total) * 100.0

# --------------------
# Frontend Routes
# --------------------
@app.route('/')
def index():
    return render_template('index.html', report=None)

@app.route('/analyze', methods=['POST'])
def analyze():
    report = {}
    
    # Handle S-box Excel
    if 'sbox' not in request.files:
        flash('File S-box tidak ditemukan.')
        return redirect(url_for('index'))
    
    sbox_file = request.files['sbox']
    if sbox_file.filename == '':
        flash('Tidak ada file S-box yang dipilih.')
        return redirect(url_for('index'))
    
    if not allowed_file(sbox_file.filename, ALLOWED_EXCEL):
        flash('Format file harus .xlsx atau .xls')
        return redirect(url_for('index'))
    
    sbox_fname = secure_filename(sbox_file.filename)
    sbox_path = os.path.join(app.config['UPLOAD_FOLDER'], sbox_fname)
    sbox_file.save(sbox_path)
    
    try:
        flat, mat = read_sbox_from_excel(sbox_path)
    except Exception as e:
        flash(f"Error membaca Excel: {e}")
        return redirect(url_for('index'))
    
    ok, msg = validate_sbox(flat)
    report['valid'] = ok
    report['message'] = msg
    report['matrix_html'] = pd.DataFrame(mat).to_html(classes='table table-sm', header=False, index=False)
    
    report['bit_balance'] = bit_balance(flat)
    report['avalanche'] = {f'bit_{b}': round(avalanche_test(flat, flip_bit=b), 4) for b in range(8)}
    
    # Optional image testing
    if 'sample_img' in request.files and request.files['sample_img'].filename != '':
        imgf = request.files['sample_img']
        if imgf and allowed_file(imgf.filename, ALLOWED_IMAGES):
            img_name = secure_filename(imgf.filename)
            img_path = os.path.join(app.config['UPLOAD_FOLDER'], img_name)
            imgf.save(img_path)
            
            cipher_name = 'cipher_' + img_name
            cipher_path = os.path.join(app.config['UPLOAD_FOLDER'], cipher_name)
            apply_subbytes_to_image(img_path, flat, cipher_path)
            
            # Create modified plaintext
            im = Image.open(img_path).convert('RGB')
            arr = np.array(im)
            arr2 = arr.copy()
            arr2[0, 0, 0] = (int(arr2[0, 0, 0]) + 1) % 256
            mod_plain = os.path.join(app.config['UPLOAD_FOLDER'], 'plain_mod_' + img_name)
            Image.fromarray(arr2).save(mod_plain)
            
            cipher_mod = os.path.join(app.config['UPLOAD_FOLDER'], 'cipher_mod_' + img_name)
            apply_subbytes_to_image(mod_plain, flat, cipher_mod)
            
            report['image_cipher'] = cipher_name
            report['entropy'] = round(image_entropy(cipher_path), 6)
            report['npcr'] = round(npcr(cipher_path, cipher_mod), 6)
    
    return render_template('index.html', report=report)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --------------------
# Backend API Routes
# --------------------
@app.route("/api/")
def api_home():
    return jsonify({"message": "Backend S-Box API berjalan!"})

@app.route("/api/generate-sbox", methods=["GET"])
def api_generate():
    sbox = generate_sbox()
    return jsonify({"sbox": sbox})

@app.route("/api/validate-sbox", methods=["POST"])
def api_validate_sbox():
    data = request.get_json()
    sbox = data.get("sbox")
    result = {
        "bijective": is_bijective(sbox),
        "balanced": is_balanced(sbox),
        "sac": check_sac(sbox)
    }
    return jsonify(result)

@app.route("/api/validate-sbox-debug", methods=["GET"])
def api_validate_sbox_debug():
    sbox = generate_sbox()
    result = {
        "bijective": is_bijective(sbox),
        "balanced": is_balanced(sbox),
        "sac": check_sac(sbox),
        "differential_uniformity": differential_uniformity(sbox),
        "nonlinearity": nonlinearity(sbox)
    }
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
