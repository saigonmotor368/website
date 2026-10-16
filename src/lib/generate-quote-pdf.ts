import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const captureQuoteCanvas = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  try {
    element.classList.add('pdf-exporting');

    const canvas = await html2canvas(element, {
      scale: 2, // Tăng chất lượng ảnh
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    return canvas;
  } catch (error) {
    console.error('Error rendering quote:', error);
    return null;
  } finally {
    element.classList.remove('pdf-exporting');
  }
};

export const generateQuotePdf = async (elementId: string, filename: string = 'BaoGia_SaigonMotor.pdf') => {
  try {
    const canvas = await captureQuoteCanvas(elementId);
    if (!canvas) return false;

    const imgData = canvas.toDataURL('image/png');

    // Khổ A4 (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Margin 10mm
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    const printableHeight = pdfHeight - margin * 2;

    let pageIndex = 0;
    let remainingHeight = contentHeight;
    do {
      if (pageIndex > 0) pdf.addPage();
      const y = margin - pageIndex * printableHeight;
      pdf.addImage(imgData, 'PNG', margin, y, contentWidth, contentHeight);
      remainingHeight -= printableHeight;
      pageIndex += 1;
    } while (remainingHeight > 0);
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const generateQuoteImage = async (
  elementId: string,
  filename: string = 'BaoGia_SaigonMotor.jpg'
) => {
  try {
    const canvas = await captureQuoteCanvas(elementId);
    if (!canvas) return false;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.94)
    );
    if (!blob) return false;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Error generating quote image:', error);
    return false;
  }
};
