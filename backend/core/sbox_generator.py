from core.field_gf256 import gf_inverse
from core.affine import affine_transform, affine_transform_custom
import numpy as np

def generate_sbox():
    sbox = []
    for x in range(256):
        inv = gf_inverse(x)
        val = affine_transform(inv)
        sbox.append(int(val))   # ⬅ ubah numpy.int64 → int
    return sbox


def generate_sbox_from_matrix(matrix_list, constant_hex):
    """
    Generate S-box from custom matrix and constant
    matrix_list: 8x8 array (list of lists) with 0/1 values
    constant_hex: hex string like '63' or integer
    """
    matrix = np.array(matrix_list, dtype=int)
    if isinstance(constant_hex, str):
        constant = int(constant_hex, 16)
    else:
        constant = int(constant_hex)
    
    sbox = []
    for x in range(256):
        inv = gf_inverse(x)
        val = affine_transform_custom(inv, matrix, constant)
        sbox.append(int(val))
    return sbox
