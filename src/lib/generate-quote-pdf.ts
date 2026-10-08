import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateQuotePdf = async (elementId: string, filename: string = 'BaoGia_SaigonMotor.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    element.classList.add('pdf-exporting');

    const canvas = await html2canvas(element, {
      scale: 2, // Tăng chất lượng ảnh
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

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
  } finally {
    element.classList.remove('pdf-exporting');
  }
};
