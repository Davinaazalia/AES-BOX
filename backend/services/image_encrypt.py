import os
import numpy as np
from PIL import Image


def apply_subbytes_to_image(img_path, sbox_flat, out_path):
    im = Image.open(img_path).convert('RGB')
    arr = np.array(im, dtype=np.uint8)
    mapper = np.array(sbox_flat, dtype=np.uint8)
    mapped = mapper[arr]
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


def histogram_counts(img_path):
    """Return grayscale histogram counts length 256."""
    im = Image.open(img_path).convert('L')
    arr = np.array(im).flatten()
    counts = np.bincount(arr, minlength=256)
    return counts.tolist()


def histogram_rgb(img_path):
    """Return RGB histogram counts for each channel."""
    im = Image.open(img_path).convert('RGB')
    arr = np.array(im)
    r_counts = np.bincount(arr[:,:,0].flatten(), minlength=256)
    g_counts = np.bincount(arr[:,:,1].flatten(), minlength=256)
    b_counts = np.bincount(arr[:,:,2].flatten(), minlength=256)
    return {
        'r': [int(x) for x in r_counts],
        'g': [int(x) for x in g_counts],
        'b': [int(x) for x in b_counts]
    }


def uaci(img1_path, img2_path):
    """
    Calculate Unified Average Changing Intensity (UACI).
    Measures the average difference between two images as percentage.
    Formula: UACI = (1 / (M*N)) * Σ |I1[i,j] - I2[i,j]| / 255 * 100%
    """
    a = np.array(Image.open(img1_path).convert('L'), dtype=np.float32)
    b = np.array(Image.open(img2_path).convert('L'), dtype=np.float32)
    if a.shape != b.shape:
        raise ValueError("Images must be same shape for UACI")
    diff = np.sum(np.abs(a - b)) / (a.shape[0] * a.shape[1] * 255.0)
    return float(diff) * 100.0

