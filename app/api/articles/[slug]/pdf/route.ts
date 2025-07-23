import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Article slug required' }, { status: 400 });
  }

  try {
    console.log('[/api/articles/[slug]/pdf] Generating PDF for:', slug);
    
    // Check if there's a PDF file available from Directus
    // For now, we'll redirect to a placeholder or generate a simple response
    const baseUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
    const pdfUrl = `${baseUrl}/assets/pdfs/${slug}.pdf`;
    
    // Try to fetch the PDF from Directus assets
    try {
      const pdfResponse = await fetch(pdfUrl);
      if (pdfResponse.ok) {
        const pdfBuffer = await pdfResponse.arrayBuffer();
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${slug}.pdf"`
          }
        });
      }
    } catch (fetchError) {
      console.log('[/api/articles/[slug]/pdf] PDF not found in assets, generating placeholder');
    }

    // Generate a simple text file as fallback
    const textContent = `Charlotte UDO - ${slug}\n\nPDF generation is not yet implemented.\nVisit the article online for full content.\n\nGenerated: ${new Date().toISOString()}`;
    
    return new NextResponse(textContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${slug}.txt"`
      }
    });
  } catch (error) {
    console.error('[/api/articles/[slug]/pdf] Error generating PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

