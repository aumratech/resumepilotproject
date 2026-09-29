import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export type PaperSize = 'a1' | 'a2' | 'a3' | 'a4'

export interface PaperSizeOption {
  id: PaperSize
  name: string
  widthMm: number
  heightMm: number
  label: string
  description: string
}

export const PAPER_SIZES: Record<PaperSize, PaperSizeOption> = {
  a4: {
    id: 'a4',
    name: 'A4',
    widthMm: 210,
    heightMm: 297,
    label: 'A4 (Standard)',
    description: '210 × 297 mm — Best for job applications & ATS',
  },
  a3: {
    id: 'a3',
    name: 'A3',
    widthMm: 297,
    heightMm: 420,
    label: 'A3 (Large)',
    description: '297 × 420 mm — Expanded format for portfolio resumes',
  },
  a2: {
    id: 'a2',
    name: 'A2',
    widthMm: 420,
    heightMm: 594,
    label: 'A2 (Poster)',
    description: '420 × 594 mm — Large presentation display',
  },
  a1: {
    id: 'a1',
    name: 'A1',
    widthMm: 594,
    heightMm: 841,
    label: 'A1 (Architectural)',
    description: '594 × 841 mm — Maximum blueprint scale display',
  },
}

export interface ExportResumePdfOptions {
  element: HTMLElement
  fileName?: string
  paperSize?: PaperSize
  marginMm?: number
  onStart?: () => void
  onComplete?: () => void
  onError?: (err: Error) => void
}

/**
 * Capture a resume DOM element, format to the selected paper size (A1, A2, A3, A4),
 * and automatically download it as a high-resolution PDF.
 */
export async function exportResumeToPdf({
  element,
  fileName = 'Resume.pdf',
  paperSize = 'a4',
  marginMm = 10,
  onStart,
  onComplete,
  onError,
}: ExportResumePdfOptions): Promise<void> {
  try {
    onStart?.()

    const sizeConfig = PAPER_SIZES[paperSize] || PAPER_SIZES.a4
    const { widthMm, heightMm } = sizeConfig

    // Printable area after margins
    const printableWidth = widthMm - marginMm * 2
    const printableHeight = heightMm - marginMm * 2

    // Helper dummy canvas to convert any CSS color function (lab, oklch, etc.) into standard hex / rgb
    const dummyCanvas = document.createElement('canvas')
    const dummyCtx = dummyCanvas.getContext('2d')

    function sanitizeColor(val: string): string {
      if (!val || val === 'transparent' || val === 'inherit' || val === 'initial') return val
      if (!/lab\(|oklch\(|oklab\(|lch\(/i.test(val)) return val
      try {
        if (dummyCtx) {
          dummyCtx.fillStyle = '#000000'
          dummyCtx.fillStyle = val
          return dummyCtx.fillStyle
        }
      } catch {}
      return '#0f172a'
    }

    // Render to high-DPI canvas with onclone sanitization
    const canvas = await html2canvas(element, {
      scale: 2, // 2x gives 300+ DPI sharpness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
      onclone: (clonedDoc, clonedElement) => {
        // 1. Sanitize all stylesheets in the cloned document so html2canvas doesn't fail on lab() or oklch()
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent && /lab\(|oklch\(|oklab\(|lch\(/i.test(styleEl.textContent)) {
            styleEl.textContent = styleEl.textContent
              .replace(/oklch\([^)]+\)/gi, '#4f46e5')
              .replace(/oklab\([^)]+\)/gi, '#4f46e5')
              .replace(/lab\([^)]+\)/gi, '#4f46e5')
              .replace(/lch\([^)]+\)/gi, '#4f46e5')
          }
        })

        // 2. Ensure clean white background and dark text on the root cloned element
        clonedElement.style.backgroundColor = '#ffffff'
        clonedElement.style.color = '#0f172a'
        clonedElement.style.boxShadow = 'none'
        clonedElement.style.border = 'none'

        // 3. Inspect every element and sanitize any computed colors that use modern lab / oklch functions
        const colorProps = [
          'color',
          'backgroundColor',
          'borderColor',
          'borderTopColor',
          'borderBottomColor',
          'borderLeftColor',
          'borderRightColor',
          'outlineColor',
        ]

        const allNodes = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))] as HTMLElement[]
        allNodes.forEach((node) => {
          // Remove dark mode text overrides
          if (node.classList.contains('dark:text-white') || node.classList.contains('text-white')) {
            node.style.color = '#0f172a'
          }
          if (node.classList.contains('bg-card') || node.classList.contains('bg-background')) {
            node.style.backgroundColor = '#ffffff'
          }

          // Inline style attribute sanitization
          const inlineStyle = node.getAttribute('style')
          if (inlineStyle && /lab\(|oklch\(|oklab\(|lch\(/i.test(inlineStyle)) {
            node.setAttribute(
              'style',
              inlineStyle
                .replace(/oklch\([^)]+\)/gi, '#4f46e5')
                .replace(/oklab\([^)]+\)/gi, '#4f46e5')
                .replace(/lab\([^)]+\)/gi, '#4f46e5')
                .replace(/lch\([^)]+\)/gi, '#4f46e5')
            )
          }

          try {
            const comp = window.getComputedStyle(node)
            for (const prop of colorProps) {
              const val = (comp as any)[prop]
              if (val && /lab\(|oklch\(|oklab\(|lch\(/i.test(val)) {
                ;(node.style as any)[prop] = sanitizeColor(val)
              }
            }
          } catch {}
        })
      },
    })

    // Initialize jsPDF with selected paper size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
      compress: true,
    })

    // Calculate height of one page in canvas pixels
    const pageCanvasHeight = (canvas.width * printableHeight) / printableWidth
    let renderedHeight = 0
    let pageIndex = 0

    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight)

      // Create a page canvas slice
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = pageCanvasHeight
      const ctx = pageCanvas.getContext('2d')

      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight)
        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        )
      }

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95)

      if (pageIndex > 0) {
        pdf.addPage([widthMm, heightMm], 'portrait')
      }

      pdf.addImage(
        imgData,
        'JPEG',
        marginMm,
        marginMm,
        printableWidth,
        printableHeight,
        undefined,
        'FAST'
      )

      renderedHeight += pageCanvasHeight
      pageIndex++
    }

    // Ensure valid extension
    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    pdf.save(finalFileName)

    onComplete?.()
  } catch (err: any) {
    console.error('PDF export failed:', err)
    onError?.(err)
    throw err
  }
}
