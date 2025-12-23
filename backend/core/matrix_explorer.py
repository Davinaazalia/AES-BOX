import numpy as np
from core.field_gf256 import gf_inverse
from core.sbox_validator import is_bijective, is_balanced, check_sac, differential_uniformity, nonlinearity


def generate_random_invertible_matrix_8x8():
    """Generate random 8x8 binary matrix yang invertible di GF(2)"""
    max_attempts = 100
    for _ in range(max_attempts):
        M = np.random.randint(0, 2, size=(8, 8), dtype=int)
        # Cek determinant mod 2 != 0 (invertible)
        det = int(np.round(np.linalg.det(M))) % 2
        if det == 1:
            return M
    # Fallback: identity matrix jika gagal
    return np.eye(8, dtype=int)


def generate_random_vector_8():
    """Generate random 8-bit constant vector"""
    return np.random.randint(0, 2, size=8, dtype=int)


def affine_transform_custom(byte, matrix, constant):
    """Apply custom affine transform dengan matriks & konstanta tertentu"""
    bits = np.array([(byte >> i) & 1 for i in range(8)], dtype=int)
    mul = (matrix.dot(bits) % 2 + constant) % 2
    out = 0
    for i in range(8):
        out |= (mul[i] << i)
    return out


def generate_sbox_from_affine(matrix, constant):
    """Generate S-Box dari matriks affine + constant vector"""
    sbox = []
    for x in range(256):
        inv = gf_inverse(x)
        val = affine_transform_custom(inv, matrix, constant)
        sbox.append(int(val))
    return sbox


def evaluate_sbox(sbox):
    """Evaluate properti S-Box, return dict score"""
    return {
        'bijective': is_bijective(sbox),
        'balanced': is_balanced(sbox),
        'sac': check_sac(sbox),
        'differential_uniformity': differential_uniformity(sbox),
        'nonlinearity': nonlinearity(sbox)
    }


def explore_affine_candidates(n_candidates=50, seed=None):
    """
    Generate n kandidat matriks affine, test semuanya, return ranked results.
    
    Returns:
        List of dict: [{id, matrix, constant, sbox, metrics}, ...]
        Sorted by nonlinearity (descending)
    """
    if seed is not None:
        np.random.seed(seed)
    
    results = []
    
    for i in range(n_candidates):
        M = generate_random_invertible_matrix_8x8()
        C = generate_random_vector_8()
        
        sbox = generate_sbox_from_affine(M, C)
        metrics = evaluate_sbox(sbox)
        
        results.append({
            'id': i,
            'matrix': M.tolist(),  # convert to list for JSON serialization
            'constant': C.tolist(),
            'sbox': sbox,
            'bijective': metrics['bijective'],
            'balanced': metrics['balanced'],
            'sac': metrics['sac'],
            'diff_uniformity': metrics['differential_uniformity'],
            'nonlinearity': metrics['nonlinearity']
        })
    
    # Sort by nonlinearity (higher = better), then diff_uniformity (lower = better)
    results.sort(key=lambda x: (-x['nonlinearity'], x['diff_uniformity']))
    
    return results


def get_top_candidates(results, top_n=10):
    """Filter top N candidates dari hasil exploration"""
    return results[:top_n]
