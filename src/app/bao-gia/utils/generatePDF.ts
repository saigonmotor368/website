import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId: string, filename: string = 'BaoGia_SaigonMotor.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Tạm thời thêm class để tối ưu cho in PDF (ẩn scrollbar, set width cố định)
    element.classList.add('pdf-exporting');

    const canvas = await html2canvas(element, {
      scale: 2, // Tăng chất lượng ảnh
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    element.classList.remove('pdf-exporting');

    const imgData = canvas.toDataURL('image/png');
    
    // Khổ A4 (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Margin 10mm
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
