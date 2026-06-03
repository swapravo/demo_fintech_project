import os
from docling.document_converter import DocumentConverter
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.datamodel.base_models import InputFormat
from docling.document_converter import PdfFormatOption

# Force CPU to avoid MPS float64 incompatibility on Apple Silicon
os.environ["DOCLING_DEVICE"] = "cpu"


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract and return the full text from a PDF file using Docling.

    Args:
        pdf_path: Absolute or relative path to the PDF file.

    Returns:
        Extracted text as a single string (markdown format).
    """
    pipeline_options = PdfPipelineOptions()
    pipeline_options.accelerator_options.device = "cpu"  # force CPU for MPS compatibility

    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
        }
    )

    result = converter.convert(pdf_path)
    text = result.document.export_to_markdown()
    return text


if __name__ == "__main__":
    pdf_path = "offer_letter.pdf"
    extracted_text = extract_text_from_pdf(pdf_path)
    print(extracted_text)
