import numpy as np
from itertools import product
import pandas as pd
# Cek bijective
def is_bijective(sbox):
    return sorted(sbox) == list(range(256))

# Cek balancedness
def is_balanced(sbox):
    sbox_bits = np.array([[ (byte >> i) & 1 for i in range(8)] for byte in sbox])
    bit_sums = sbox_bits.sum(axis=0)
    return all(120 <= count <= 136 for count in bit_sums)  # ±8 tolerance

# Cek SAC (relaxed: rata-rata per bit input sekitar 4)
def check_sac(sbox, lower=3.0, upper=5.0):
    n = 256
    for i in range(8):
        total_ones = 0
        for x in range(n):
            flipped = x ^ (1 << i)
            diff = sbox[x] ^ sbox[flipped]
            total_ones += bin(diff).count("1")
        avg = total_ones / n  # ideal ~4
        if not (lower <= avg <= upper):
            return False
    return True


def calculate_sac_value(sbox):
    """Calculate actual SAC value (average proportion of changed bits)"""
    n = 256
    total_proportion = 0
    for i in range(8):
        total_ones = 0
        for x in range(n):
            flipped = x ^ (1 << i)
            diff = sbox[x] ^ sbox[flipped]
            total_ones += bin(diff).count("1")
        proportion = total_ones / (n * 8)  # proportion of bits changed
        total_proportion += proportion
    return total_proportion / 8  # average over all input bits

# Differential Uniformity
def differential_uniformity(sbox):
    n = 256
    max_count = 0
    for dx in range(1, n):
        counter = {}
        for x in range(n):
            dy = sbox[x] ^ sbox[x ^ dx]
            counter[dy] = counter.get(dy, 0) + 1
        max_count = max(max_count, max(counter.values()))
    return max_count

# Nonlinearity (optimized - simplified approximation)
def nonlinearity(sbox):
    """Fast approximation: check first 32 masks instead of all 255"""
    n = 256
    min_nl = 128
    
    # Sample masks untuk speed (full calculation 255 masks = slow)
    sample_masks = [1, 2, 4, 8, 16, 32, 64, 128, 3, 5, 9, 17, 33, 65, 129, 255,
                    7, 15, 31, 63, 127, 85, 170, 204, 153, 102, 51, 105, 210, 45, 90, 180]
    
    for mask in sample_masks:
        walsh_sum = 0
        for x in range(n):
            fx = bin(sbox[x]).count('1') % 2
            ux = bin(x & mask).count('1') % 2
            walsh_sum += (-1)**(fx ^ ux)
        nl = (n - abs(walsh_sum)) // 2
        min_nl = min(min_nl, nl)
    
    return min_nl



def export_sbox_to_excel(sbox, filename="sbox.xlsx"):
    df = pd.DataFrame([sbox[i:i+16] for i in range(0, 256, 16)])
    df.to_excel(filename, index=False, header=False)
    return filename
