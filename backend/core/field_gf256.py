# operasi GF(2^8) untuk mencari inverse multiplikatif
IRREDUCIBLE_POLY = 0x11B  # polynomial AES (default)

def gf_mul(a, b):
    result = 0
    for _ in range(8):
        if b & 1:
            result ^= a
        hi = a & 0x80
        a <<= 1
        if hi:
            a ^= IRREDUCIBLE_POLY
        a &= 0xFF
        b >>= 1
    return result

def gf_inverse(x):
    if x == 0:
        return 0
    for y in range(1, 256):
        if gf_mul(x, y) == 1:
            return y
    return 0
