#!/usr/bin/env python3
"""Decode a base64 file to a binary file. Usage: decode-b64.py <b64_input> <bin_output>"""
import base64
import sys

with open(sys.argv[1]) as f:
    data = f.read().strip()
with open(sys.argv[2], "wb") as f:
    f.write(base64.b64decode(data))
print(f"Wrote {sys.argv[2]} ({len(base64.b64decode(data))} bytes)")
