import jsPDF from 'jspdf';

/**
 * Export a book with its pages to a PDF document.
 *
 * @param {Object} book - The book entity
 * @param {Array} pages - Array of page entities (sorted by page_number)
 * @param {Object} options
 * @param {string} options.format - 'a4' | 'letter' (default: 'a4')
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @returns {Promise<void>} - Downloads the PDF
 */
export async function exportBookToPDF(book, pages, { format = 'a4', onProgress } = {}) {
  const isA4 = format === 'a4';
  const pageWidth = isA4 ? 210 : 215.9;
  const pageHeight = isA4 ? 297 : 279.4;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA4 ? 'a4' : 'letter'
  });

  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const totalSteps = pages.length + 1; // +1 for cover
  let completedSteps = 0;

  const reportProgress = () => {
    completedSteps++;
    onProgress?.(Math.round((completedSteps / totalSteps) * 100));
  };

  // Cover page
  doc.setFillColor(124, 58, 237); // purple-600
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  if (book.cover_image) {
    try {
      const img = await loadImage(book.cover_image);
      const imgRatio = img.width / img.height;
      const maxImgWidth = contentWidth;
      const maxImgHeight = pageHeight * 0.5;
      let imgW, imgH;

      if (imgRatio > maxImgWidth / maxImgHeight) {
        imgW = maxImgWidth;
        imgH = maxImgWidth / imgRatio;
      } else {
        imgH = maxImgHeight;
        imgW = maxImgHeight * imgRatio;
      }

      const imgX = (pageWidth - imgW) / 2;
      doc.addImage(img.src, 'JPEG', imgX, 30, imgW, imgH);

      // Title below image
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      const titleY = 30 + imgH + 20;
      doc.text(book.title || 'My Book', pageWidth / 2, titleY, { align: 'center', maxWidth: contentWidth });
    } catch {
      // Fallback: text-only cover
      drawTextCover(doc, book, pageWidth, pageHeight, contentWidth);
    }
  } else {
    drawTextCover(doc, book, pageWidth, pageHeight, contentWidth);
  }

  reportProgress();

  // Content pages
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    doc.addPage();

    // Page number
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text(`${i + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    let yPos = margin;

    // Illustration
    if (page.image_url) {
      try {
        const img = await loadImage(page.image_url);
        const imgRatio = img.width / img.height;
        const maxH = pageHeight * 0.4;
        let imgW = contentWidth;
        let imgH = contentWidth / imgRatio;

        if (imgH > maxH) {
          imgH = maxH;
          imgW = maxH * imgRatio;
        }

        const imgX = (pageWidth - imgW) / 2;
        doc.addImage(img.src, 'JPEG', imgX, yPos, imgW, imgH);
        yPos += imgH + 10;
      } catch {
        // Skip image if it fails to load
      }
    }

    // Text content
    if (page.text_content) {
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      const lines = doc.splitTextToSize(page.text_content, contentWidth);
      doc.text(lines, margin, yPos + 5);
    }

    reportProgress();
  }

  // Download
  const fileName = (book.title || 'my-book').replace(/[^a-zA-Z0-9\u0590-\u05FF ]/g, '').replace(/\s+/g, '-');
  doc.save(`${fileName}.pdf`);
}

function drawTextCover(doc, book, pageWidth, pageHeight, contentWidth) {
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.text(book.title || 'My Book', pageWidth / 2, pageHeight / 3, { align: 'center', maxWidth: contentWidth });

  if (book.child_name) {
    doc.setFontSize(18);
    doc.text(`A story for ${book.child_name}`, pageWidth / 2, pageHeight / 3 + 20, { align: 'center' });
  }

  if (book.description) {
    doc.setFontSize(12);
    doc.setTextColor(220, 220, 255);
    doc.text(book.description, pageWidth / 2, pageHeight / 2 + 10, { align: 'center', maxWidth: contentWidth });
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
