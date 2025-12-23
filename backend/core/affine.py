import numpy as np



AES_MATRIX = np.array([
    [1,1,0,1,1,0,1,0],
    [0,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,0],
    [0,1,0,1,1,0,1,1],
    [1,0,1,0,1,1,0,1],
    [1,1,0,1,0,1,1,0],
    [0,1,1,0,1,0,1,1],
    [1,0,1,1,0,1,0,1]
], dtype=int)

C = np.array([1,0,0,0,1,0,0,1], dtype=int)  # 0x89 (137)



def affine_transform(byte):
    bits = np.array([(byte >> i) & 1 for i in range(8)], dtype=int)
    mul = (AES_MATRIX.dot(bits) % 2 + C) % 2
    out = 0
    for i in range(8):
        out |= (mul[i] << i)
    return out


def affine_transform_custom(byte, matrix, constant):
    """Apply affine transformation with custom matrix and constant"""
    bits = np.array([(byte >> i) & 1 for i in range(8)], dtype=int)
    const_bits = np.array([(constant >> i) & 1 for i in range(8)], dtype=int)
    mul = (matrix.dot(bits) % 2 + const_bits) % 2
    out = 0
    for i in range(8):
        out |= (mul[i] << i)
    return out
