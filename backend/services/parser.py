import io
from typing import Callable

import fitz
import pdfplumber
from pypdf import PdfReader


PDFExtractionFn = Callable[[bytes], str]


def _normalize_extracted_text(text: str) -> str:
    return "\n".join(line.strip() for line in text.splitlines() if line.strip()).strip()


def _extract_with_pdfplumber(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text(x_tolerance=2, y_tolerance=2)
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def _extract_with_pypdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text.strip():
            text_parts.append(page_text)
    return "\n".join(text_parts)


def _extract_with_pymupdf(file_bytes: bytes) -> str:
    text_parts = []
    with fitz.open(stream=file_bytes, filetype="pdf") as pdf:
        for page in pdf:
            page_text = page.get_text("text") or ""
            if page_text.strip():
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes with multiple parser fallbacks."""
    extractors: list[tuple[str, PDFExtractionFn]] = [
        ("pdfplumber", _extract_with_pdfplumber),
        ("pypdf", _extract_with_pypdf),
        ("pymupdf", _extract_with_pymupdf),
    ]
    errors: list[str] = []

    for extractor_name, extractor in extractors:
        try:
            text = _normalize_extracted_text(extractor(file_bytes))
            if text:
                return text
            errors.append(f"{extractor_name}: empty")
        except Exception as exc:
            errors.append(f"{extractor_name}: {exc}")

    error_summary = "; ".join(errors) if errors else "no extractor attempts were made"
    raise ValueError(
        "No extractable text found in the PDF. This usually means the file is scanned, image-based, encrypted, or malformed. "
        f"Extraction attempts: {error_summary}"
    )


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    import io as _io
    from docx import Document
    doc = Document(_io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Route to correct extractor based on file extension."""
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == "docx":
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
