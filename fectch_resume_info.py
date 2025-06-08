import os
from PyPDF2 import PdfReader
from docx import Document

def extract_text_from_pdf(path):
    try:
        reader = PdfReader(path)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Error reading PDF: {e}")

def extract_text_from_docx(path):
    try:
        doc = Document(path)
        text = '\n'.join(paragraph.text for paragraph in doc.paragraphs)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Error reading DOCX: {e}")

def extract_text_from_txt(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except Exception as e:
        raise RuntimeError(f"Error reading TXT: {e}")

def extract_text_from_resume(file_path: str) -> str:
    """
    Extract text from a resume file (PDF, DOCX, TXT).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    elif ext == ".txt":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
