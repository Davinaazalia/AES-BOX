import os
import pandas as pd
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUT_ROOT = os.path.join(BASE_DIR, 'outputs')
GENERATED_DIR = os.path.join(OUTPUT_ROOT, 'generated_sboxes')
UPLOADED_DIR = os.path.join(OUTPUT_ROOT, 'uploaded_sboxes')

os.makedirs(GENERATED_DIR, exist_ok=True)
os.makedirs(UPLOADED_DIR, exist_ok=True)


def read_sbox_from_excel(path):
    try:
        df = pd.read_excel(path, header=None)
        mat = df.iloc[:16, :16].fillna(0).astype(int).values
        flat = mat.flatten().tolist()
        return flat, mat
    except Exception as e:
        error_msg = str(e).lower()
        if 'crc' in error_msg or 'bad' in error_msg or 'zip' in error_msg:
            raise ValueError(
                f"Excel file is corrupted or invalid. "
                f"Please try: 1) Re-download and re-upload the file, "
                f"2) Save Excel in newer format (.xlsx), "
                f"3) Use .csv or .json format instead. "
                f"Details: {str(e)}"
            )
        raise


def read_sbox_from_csv(path):
    """Read S-box from CSV file (can be 16×16 matrix or flat 256 values)"""
    df = pd.read_csv(path, header=None)
    
    # If it's a 16×16 matrix
    if df.shape[0] == 16 and df.shape[1] == 16:
        mat = df.fillna(0).astype(int).values
        flat = mat.flatten().tolist()
    else:
        # If it's flat 256 values (1D or as 1×256 or 256×1)
        flat = df.values.flatten().astype(int).tolist()
        # Reshape to 16×16 matrix
        if len(flat) == 256:
            mat = [flat[i:i+16] for i in range(0, 256, 16)]
        else:
            raise ValueError(f"Expected 256 values, got {len(flat)}")
    
    return flat, mat


def read_sbox_from_txt(path):
    """Read S-box from TXT file (space/comma/newline separated values)"""
    with open(path, 'r') as f:
        content = f.read()
    
    # Replace commas and newlines with spaces, then split
    content = content.replace(',', ' ').replace('\n', ' ')
    values = [int(x) for x in content.split() if x.strip()]
    
    if len(values) != 256:
        raise ValueError(f"Expected 256 values, got {len(values)}")
    
    flat = values
    mat = [flat[i:i+16] for i in range(0, 256, 16)]
    
    return flat, mat


def read_sbox_from_json(path):
    """Read S-box from JSON file"""
    with open(path, 'r') as f:
        data = json.load(f)
    
    # Support both direct array or object with 'sbox' key
    if isinstance(data, list):
        flat = data
    elif isinstance(data, dict) and 'sbox' in data:
        flat = data['sbox']
    else:
        raise ValueError("JSON must contain array or object with 'sbox' key")
    
    if len(flat) != 256:
        raise ValueError(f"Expected 256 values, got {len(flat)}")
    
    flat = [int(x) for x in flat]
    mat = [flat[i:i+16] for i in range(0, 256, 16)]
    
    return flat, mat


def read_sbox_from_file(path):
    """
    Auto-detect file format and read S-box
    Supports: .xlsx, .xls, .csv, .txt, .json
    """
    ext = os.path.splitext(path)[1].lower()
    
    if ext in {'.xlsx', '.xls'}:
        return read_sbox_from_excel(path)
    elif ext == '.csv':
        return read_sbox_from_csv(path)
    elif ext == '.txt':
        return read_sbox_from_txt(path)
    elif ext == '.json':
        return read_sbox_from_json(path)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Supported: .xlsx, .xls, .csv, .txt, .json")


def export_sbox_to_excel(sbox, filename=None):
    if filename is None:
        ts = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'sbox_{ts}.xlsx'
    out_path = os.path.join(GENERATED_DIR, filename)
    df = pd.DataFrame([sbox[i:i+16] for i in range(0, 256, 16)])
    df.to_excel(out_path, header=False, index=False)
    return out_path


def export_analysis_to_excel(data_dict, filename=None):
    """
    Export comprehensive analysis to Excel with multiple sheets
    data_dict should contain: sbox, matrix, constant, metrics (entropy, npcr, etc), histograms
    """
    if filename is None:
        ts = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'analysis_{ts}.xlsx'
    out_path = os.path.join(GENERATED_DIR, filename)
    
    with pd.ExcelWriter(out_path, engine='openpyxl') as writer:
        # Sheet 1: S-box matrix (16x16)
        if 'sbox' in data_dict:
            sbox = data_dict['sbox']
            sbox_df = pd.DataFrame([sbox[i:i+16] for i in range(0, 256, 16)])
            sbox_df.to_excel(writer, sheet_name='S-box', header=False, index=False)
        
        # Sheet 2: Matrix configuration
        if 'matrix' in data_dict:
            matrix_df = pd.DataFrame(data_dict['matrix'])
            matrix_df.to_excel(writer, sheet_name='Matrix', header=False, index=False)
        
        # Sheet 3: Metrics summary
        if 'metrics' in data_dict:
            metrics_df = pd.DataFrame([data_dict['metrics']])
            metrics_df.to_excel(writer, sheet_name='Metrics', index=False)
        
        # Sheet 4: Histogram data
        if 'histograms' in data_dict:
            hist_df = pd.DataFrame(data_dict['histograms'])
            hist_df.to_excel(writer, sheet_name='Histograms', index=False)
    
    return out_path
