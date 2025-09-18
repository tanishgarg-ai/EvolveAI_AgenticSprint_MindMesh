# utils/pdf_generator.py

import markdown
from xhtml2pdf import pisa

def create_pdf_report(markdown_text: str, filename: str = "summary.pdf"):
    """
    Creates a PDF file from a Markdown formatted string by converting it to HTML first.
    """
    # Convert Markdown to HTML
    html_text = markdown.markdown(markdown_text)

    # Add some basic styling for better readability
    styled_html = f"""
    <html>
    <head>
        <style>
            @page {{
                size: a4 portrait;
                @frame content_frame {{
                    left: 50pt;
                    right: 50pt;
                    top: 50pt;
                    bottom: 50pt;
                }}
            }}
            body {{
                font-family: "Helvetica", sans-serif;
                font-size: 11pt;
                line-height: 1.5;
            }}
            h1 {{
                font-size: 24pt;
                font-weight: bold;
                color: #333366;
                border-bottom: 2px solid #333366;
                padding-bottom: 5px;
            }}
            h2 {{
                font-size: 18pt;
                font-weight: bold;
                color: #444477;
                border-bottom: 1px solid #cccccc;
                padding-bottom: 3px;
                margin-top: 20px;
            }}
            h3 {{
                font-size: 14pt;
                font-weight: bold;
                color: #555588;
                margin-top: 15px;
            }}
            ul {{
                padding-left: 20pt;
            }}
            li {{
                margin-bottom: 5pt;
            }}
            p {{
                margin-bottom: 10pt;
            }}
        </style>
    </head>
    <body>
        {html_text}
    </body>
    </html>
    """

    # Open the output file in binary write mode
    with open(filename, "wb") as pdf_file:
        # Create the PDF
        pisa_status = pisa.CreatePDF(
            styled_html,                # The HTML content
            dest=pdf_file)              # File handle to receive result

    # Check if PDF creation was successful
    if not pisa_status.err:
        print(f"--- 📄 Report successfully generated and saved as {filename} ---")
        return filename
    else:
        print(f"--- ❌ Error creating PDF: {pisa_status.err} ---")
        return None