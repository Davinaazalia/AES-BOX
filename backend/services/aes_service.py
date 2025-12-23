"""AES helpers for text and image encryption/decryption.

Uses AES-CBC with PKCS7 padding. Keys are provided as hex strings with
length 32/48/64 (128/192/256-bit). IV is 16-byte hex; generated randomly
when omitted.
"""
import base64
import os
from typing import Optional, Tuple

from cryptography.hazmat.primitives import padding, hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


DEFAULT_SALT = b"SBOX_AES_SALT_V1"


def _derive_key_from_passphrase(passphrase: str, length: int = 32, salt: Optional[bytes] = None) -> bytes:
    if not passphrase:
        raise ValueError("Key wajib diisi")
    if length not in (16, 24, 32):
        raise ValueError("Panjang key harus 16/24/32 byte")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(), length=length, salt=salt or DEFAULT_SALT, iterations=200_000, backend=default_backend()
    )
    return kdf.derive(passphrase.encode("utf-8"))


def _get_key(key_input: str, preferred_len: int = 32) -> bytes:
    """Accept hex string or passphrase; derive AES key if not hex."""
    if not key_input:
        raise ValueError("Key wajib diisi")
    # Try hex first
    try:
        key_bytes = bytes.fromhex(key_input)
        if len(key_bytes) not in (16, 24, 32):
            raise ValueError("Key HEX harus 32/48/64 chars untuk 128/192/256-bit")
        return key_bytes
    except Exception:
        # Treat as passphrase; derive with PBKDF2 (default 32 bytes)
        return _derive_key_from_passphrase(key_input, preferred_len)


def _normalize_iv(iv_hex: Optional[str]) -> bytes:
    if iv_hex is None or iv_hex == "":
        return os.urandom(16)
    try:
        iv = bytes.fromhex(iv_hex)
    except ValueError as exc:
        raise ValueError("IV harus dalam format hex") from exc
    if len(iv) != 16:
        raise ValueError("IV harus 16 byte (32 hex)")
    return iv


def _pad(data: bytes) -> bytes:
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    return padder.update(data) + padder.finalize()


def _unpad(data: bytes) -> bytes:
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    try:
        return unpadder.update(data) + unpadder.finalize()
    except ValueError as e:
        raise ValueError(f"Invalid padding bytes (PKCS7). Kemungkinan key atau IV salah. Error: {str(e)}")


def encrypt_bytes(data: bytes, key_hex: str, iv_hex: Optional[str] = None, key_len: int = 32) -> Tuple[bytes, str]:
    key = _get_key(key_hex, key_len)
    iv = _normalize_iv(iv_hex)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    padded = _pad(data)
    ct = encryptor.update(padded) + encryptor.finalize()
    return ct, iv.hex()


def decrypt_bytes(ciphertext: bytes, key_hex: str, iv_hex: str, key_len: int = 32) -> bytes:
    key = _get_key(key_hex, key_len)
    iv = _normalize_iv(iv_hex)
    
    # Check if ciphertext length is valid (must be multiple of 16 for AES block size)
    if len(ciphertext) == 0:
        raise ValueError("Ciphertext kosong. Pastikan base64 yang dimasukkan benar.")
    
    if len(ciphertext) < 16:
        raise ValueError(
            f"Ciphertext terlalu pendek ({len(ciphertext)} bytes). "
            f"AES memerlukan minimal 16 bytes. "
            f"Kemungkinan: ciphertext tidak valid atau tidak lengkap."
        )
    
    if len(ciphertext) % 16 != 0:
        raise ValueError(
            f"Ciphertext length ({len(ciphertext)} bytes) bukan kelipatan 16. "
            f"AES CBC mode memerlukan kelipatan 16 bytes. "
            f"Kemungkinan: base64 tidak valid atau ciphertext corrupt."
        )
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()
    return _unpad(padded)


def encrypt_text(plaintext: str, key_hex: str, iv_hex: Optional[str] = None, key_len: int = 32) -> Tuple[str, str]:
    ct, iv_used = encrypt_bytes(plaintext.encode("utf-8"), key_hex, iv_hex, key_len)
    return base64.b64encode(ct).decode("utf-8"), iv_used


def decrypt_text(cipher_b64: str, key_hex: str, iv_hex: str, key_len: int = 32) -> str:
    try:
        ciphertext = base64.b64decode(cipher_b64)
    except Exception as exc:
        raise ValueError("Ciphertext harus base64") from exc
    
    try:
        pt = decrypt_bytes(ciphertext, key_hex, iv_hex, key_len)
    except ValueError as e:
        # Re-raise with more context
        raise ValueError(f"Decrypt failed: {str(e)}")
    
    try:
        return pt.decode("utf-8", errors="replace")
    except Exception as e:
        raise ValueError(f"Failed to decode plaintext as UTF-8: {str(e)}")


def encrypt_file(in_path: str, key_hex: str, out_dir: str, iv_hex: Optional[str] = None, key_len: int = 32) -> Tuple[str, str]:
    with open(in_path, "rb") as f:
        data = f.read()
    ct, iv_used = encrypt_bytes(data, key_hex, iv_hex, key_len)
    base = os.path.basename(in_path)
    out_name = f"{base}.aes"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, out_name)
    with open(out_path, "wb") as f:
        f.write(ct)
    return out_path, iv_used


def decrypt_file(in_path: str, key_hex: str, out_dir: str, iv_hex: str, original_ext: Optional[str] = None, key_len: int = 32) -> str:
    with open(in_path, "rb") as f:
        data = f.read()
    pt = decrypt_bytes(data, key_hex, iv_hex, key_len)
    base = os.path.basename(in_path)
    if base.endswith(".aes"):
        base = base[:-4]
    if original_ext:
        original_ext = original_ext.lstrip(".")
        base = f"{base}.{original_ext}"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, base)
    with open(out_path, "wb") as f:
        f.write(pt)
    return out_path
