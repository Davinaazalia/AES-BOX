import numpy as np


def allowed_file(filename: str, allowed_ext) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_ext


def bit_balance(flat):
    arr = np.array(flat, dtype=np.uint8)
    return [int(np.sum(((arr >> b) & 1) == 1)) for b in range(8)]


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
