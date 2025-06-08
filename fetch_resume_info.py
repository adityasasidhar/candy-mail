import os
from PyPDF2 import PdfReader
from docx import Document


def get_resume_data(file_path: str) -> str:
    """
    Extracts text from a resume file (PDF, DOCX, or TXT) in a single function.

    Args:
        file_path (str): Path to the resume file.

    Returns:
        str: Extracted text content.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".pdf":
            reader = PdfReader(file_path)
            return ''.join(page.extract_text() or '' for page in reader.pages).strip()

        elif ext == ".docx":
            doc = Document(file_path)
            return '\n'.join(paragraph.text for paragraph in doc.paragraphs).strip()

        elif ext == ".txt":
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read().strip()

        else:
            raise ValueError(f"Unsupported file type: {ext}")

    except Exception as e:
        raise RuntimeError(f"Failed to extract text from {ext.upper()} file: {e}")
