'use client'

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { useCompanySettings } from '@/lib/use-company-settings'
import { getLogoUrl, getFaviconUrl } from '@/lib/company'
import { FileImage, FileText, MapPin, Phone, Globe, Mail, Loader2 } from 'lucide-react'

interface DocumentProps {
  title: string;
  documentNumber: string;
  date: string;
  children: React.ReactNode;
}

export interface PrintableDocumentRef {
  downloadPDF: () => Promise<void>;
  downloadPNG: () => Promise<void>;
}

const PrintableDocument = forwardRef<PrintableDocumentRef, DocumentProps>(
  ({ title, documentNumber, date, children }, ref) => {
    const { data: settings, isLoading, error, refetch } = useCompanySettings();
    const documentRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingType, setGeneratingType] = useState<'pdf' | 'png' | null>(null);
    
    const logoUrl = getLogoUrl(settings || null);
    const faviconUrl = getFaviconUrl(settings || null);

  const downloadPDF = async () => {
  const element = documentRef.current;
  if (!element) return;
  
  setIsGenerating(true);
  setGeneratingType('pdf');
  
  try {
    element.classList.add('pdf-printing');
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: false,
    });
    
    // Ensure canvas has valid dimensions
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Invalid canvas dimensions');
    }
    
    // Get image data
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate aspect ratio
    const aspectRatio = canvas.height / canvas.width;
    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth * aspectRatio;
    
    // If image height exceeds page height, scale down to fit
    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight / aspectRatio;
    }
    
    // Validate dimensions are numbers
    if (isNaN(imgWidth) || isNaN(imgHeight) || imgWidth <= 0 || imgHeight <= 0) {
      throw new Error('Invalid image dimensions');
    }
    
    // Center the image on the page
    const x = (pdfWidth - imgWidth) / 2;
    const y = 0;
    
    // Add image with all required parameters
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    pdf.save(`${title}-${documentNumber}.pdf`);
    
    element.classList.remove('pdf-printing');
  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.error('Failed to generate PDF. Please try again.');
  } finally {
    setIsGenerating(false);
    setGeneratingType(null);
  }
};

    const downloadPNG = async () => {
      const element = documentRef.current;
      if (!element) return;
      
      setIsGenerating(true);
      setGeneratingType('png');
      
      try {
        const canvas = await html2canvas(element, {
          scale: 3,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: false
        });
        
        const link = document.createElement('a');
        link.download = `${title}-${documentNumber}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (error) {
        console.error('PNG generation failed:', error);
        toast.error('Failed to generate PNG');
      } finally {
        setIsGenerating(false);
        setGeneratingType(null);
      }
    };

    useImperativeHandle(ref, () => ({
      downloadPDF,
      downloadPNG
    }));

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-500">Loading company settings...</p>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="text-red-500 text-center">
            <p className="font-semibold">Failed to load company settings</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      );
    }

    const companyName = settings?.companyName || 'MY COMPANY';
    const companyAddress = settings?.address || '';
    const companyPhone = settings?.phone || '';
    const companyEmail = settings?.email || '';
    const companyWebsite = settings?.website || '';
    const footerText = settings?.footerText || '';

    return (
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-3 justify-end no-print">
          <button 
            onClick={downloadPDF} 
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingType === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {generatingType === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
          </button>
          
          <button 
            onClick={downloadPNG} 
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingType === 'png' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileImage className="w-4 h-4" />
            )}
            {generatingType === 'png' ? 'Generating PNG...' : 'Download PNG'}
          </button>
        </div>

        {/* Printable Document Area */}
        <div 
          ref={documentRef} 
          data-printable-document
          className="printable-document bg-white mx-auto overflow-hidden shadow-2xl rounded-xl"
          style={{
            maxWidth: '800px',
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '12pt',
            lineHeight: 1.5,
            color: '#1a1a1a'
          }}
        >
          <div className="p-12" style={{ padding: '2cm' }}>
            {/* Header Section */}
            <div className="flex justify-between items-start border-b-2 pb-8 mb-8" style={{ borderColor: '#2c5f2d' }}>
              <div className="space-y-4">
                {logoUrl ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={logoUrl} 
                      alt={`${companyName} Logo`}
                      className="object-contain"
                      style={{ height: '80px', width: 'auto', maxWidth: '200px' }}
                      onError={(e) => {
                        console.error('Logo failed to load:', logoUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <h2 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#2c5f2d', letterSpacing: '1px', margin: 0 }}>
                    {companyName}
                  </h2>
                )}
                
                <div style={{ fontSize: '10pt', color: '#4a5568', marginTop: '8px' }}>
                  {companyAddress && (
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} style={{ color: '#2c5f2d' }} />
                      <span>{companyAddress}</span>
                    </div>
                  )}
                  {companyPhone && (
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={12} style={{ color: '#2c5f2d' }} />
                      <span>{companyPhone}</span>
                    </div>
                  )}
                  {companyEmail && (
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={12} style={{ color: '#2c5f2d' }} />
                      <span>{companyEmail}</span>
                    </div>
                  )}
                  {companyWebsite && (
                    <div className="flex items-center gap-2">
                      <Globe size={12} style={{ color: '#2c5f2d' }} />
                      <span>{companyWebsite}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <h1 style={{ fontSize: '28pt', fontWeight: 'bold', color: '#2c5f2d', marginBottom: '8px', letterSpacing: '2px' }}>
                  {title}
                </h1>
                <div style={{ fontSize: '11pt', marginTop: '8px' }}>
                  <strong>No:</strong> <span style={{ color: '#2c5f2d' }}>{documentNumber}</span>
                </div>
                <div style={{ fontSize: '11pt', marginTop: '4px' }}>
                  <strong>Date:</strong> {date}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div style={{ minHeight: '400px', marginBottom: '32px' }}>
              {children}
            </div>

            {/* Footer Section */}
            <div className="border-t pt-6 mt-8" style={{ borderColor: '#e2e8f0' }}>
              <div className="grid grid-cols-3 gap-4 text-center" style={{ fontSize: '9pt', color: '#718096' }}>
                {companyAddress && (
                  <div className="flex items-center justify-center gap-2">
                    <MapPin size={10} style={{ color: '#2c5f2d' }} />
                    <span>{companyAddress.split(',')[0]}</span>
                  </div>
                )}
                {companyPhone && (
                  <div className="flex items-center justify-center gap-2">
                    <Phone size={10} style={{ color: '#2c5f2d' }} />
                    <span>{companyPhone}</span>
                  </div>
                )}
                {companyWebsite && (
                  <div className="flex items-center justify-center gap-2">
                    <Globe size={10} style={{ color: '#2c5f2d' }} />
                    <span>{companyWebsite}</span>
                  </div>
                )}
              </div>
              
              <p style={{ textAlign: 'center', fontSize: '8pt', color: '#a0aec0', marginTop: '16px', letterSpacing: '1px' }}>
                This is a computer generated document. No signature is required.
              </p>
              
              {footerText && (
                <p style={{ textAlign: 'center', fontSize: '8pt', color: '#a0aec0', marginTop: '8px' }}>
                  {footerText}
                </p>
              )}
            </div>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            .printable-document, .printable-document * { visibility: visible; }
            .printable-document { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; }
            .no-print { display: none !important; }
            @page { size: A4; margin: 0; }
          }
          .pdf-printing { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .printable-document { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
          .printable-document h1, .printable-document h2, .printable-document h3 { font-family: 'Times New Roman', Times, serif; }
          .printable-document table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .printable-document th, .printable-document td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          .printable-document th { background-color: #f7fafc; font-weight: bold; color: #2d3748; }
          .printable-document tr:hover { background-color: #f7fafc; }
        `}</style>
      </div>
    );
  }
);

PrintableDocument.displayName = 'PrintableDocument';

export default PrintableDocument;