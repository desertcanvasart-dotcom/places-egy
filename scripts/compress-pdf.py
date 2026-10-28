# Shrinks a PDF by re-encoding its raster images as JPEG (capped at MAX_PX on
# the long side). Text, vectors, fonts and links are left untouched.
# Used for client/public/places-company-profile.pdf (35.3 MB -> 7.9 MB):
#
#   python3 -m venv .pdfenv && .pdfenv/bin/pip install pikepdf pillow
#   .pdfenv/bin/python scripts/compress-pdf.py in.pdf out.pdf 1920 78
#
# After replacing the file, update the size in client/src/lib/company-profile.ts.
import io, sys, pikepdf
from pikepdf import PdfImage, Name
from PIL import Image
src, out, maxpx, q = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
pdf = pikepdf.open(src)
done = skipped = 0
for o in list(pdf.objects):
    if not (isinstance(o, pikepdf.Stream) and o.get('/Subtype') == '/Image'): continue
    if o.get('/ImageMask') or int(o.get('/BitsPerComponent', 8)) == 1: skipped += 1; continue
    raw = len(o.read_raw_bytes())
    if raw < 8_000: skipped += 1; continue
    try:
        im = PdfImage(o).as_pil_image()
    except Exception as e:
        skipped += 1; continue
    gray = im.mode in ('L', 'LA')
    im = im.convert('L' if gray else 'RGB')
    w, h = im.size
    scale = min(1.0, maxpx / max(w, h))
    if scale < 1: im = im.resize((max(1, round(w*scale)), max(1, round(h*scale))), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
    if buf.tell() >= raw: skipped += 1; continue
    o.write(buf.getvalue(), filter=Name.DCTDecode)
    o.Width, o.Height = im.size
    o.ColorSpace = Name.DeviceGray if gray else Name.DeviceRGB
    o.BitsPerComponent = 8
    for k in ('/DecodeParms', '/Decode'):
        if k in o: del o[k]
    done += 1
pdf.remove_unreferenced_resources()
pdf.save(out, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate, recompress_flate=True)
print("re-encoded", done, "skipped", skipped)
