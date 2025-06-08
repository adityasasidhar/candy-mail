import os
from PyPDF2 import PdfReader
from docx import Document

def get_resume_data(file_path: str) -> str:
    """
    Extracts text content from a resume file without explicit error handling.

    This function supports PDF (.pdf), DOCX (.docx), and plain text (.txt) files.
    It assumes valid file paths and formats.

    Args:
        file_path (str): The full path to the resume file.

    Returns:
        str: The extracted text content from the resume.

    Raises:
        FileNotFoundError: If the specified file does not exist.
        ValueError: If the file type is not supported.
        (Other exceptions from PyPDF2, docx, or file operations may occur
         if the files are corrupted or malformed.)
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        reader = PdfReader(file_path)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return text.strip()
    elif ext == ".docx":
        doc = Document(file_path)
        text = '\n'.join(paragraph.text for paragraph in doc.paragraphs)
        return text.strip()
    elif ext == ".txt":
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    else:
        raise ValueError(f"Unsupported file type: {ext}. Only .pdf, .docx, and .txt are supported.")


print(get_resume_data("resume.pdf"))