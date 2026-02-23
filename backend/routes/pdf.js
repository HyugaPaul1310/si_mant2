const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer-core');

// Endpoint para generar PDF desde HTML
router.post('/generate', async (req, res) => {
    let browser;

    try {
        const { html } = req.body;
        console.log('[PDF] Cuerpo recibido. Tamaño HTML:', html ? html.length : 0);

        if (!html) {
            return res.status(400).json({ success: false, error: 'HTML content is required' });
        }

        console.log('[PDF] Iniciando generación de PDF (Puppeteer)...');

        // Búsqueda robusta de ejecutable de Chrome/Chromium
        const executablePath =
            process.env.PUPPETEER_EXECUTABLE_PATH ||
            process.env.CHROME_PATH ||
            (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);

        console.log('[PDF] Usando ejecutable:', executablePath || 'Default (Bundled)');

        browser = await puppeteer.launch({
            headless: 'new',
            executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none'
            ]
        });

        const page = await browser.newPage();

        // Establecer contenido y esperar a que esté listo
        await page.setContent(html, {
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 30000
        });

        // Generar Buffer del PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0'
            },
            preferCSSPageSize: true
        });

        console.log(`[PDF] Generado exitosamente. Tamaño: ${pdfBuffer.length} bytes`);

        // Enviar PDF como respuesta binaria pura
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Content-Disposition', 'attachment; filename="reporte.pdf"');

        return res.end(pdfBuffer, 'binary');

    } catch (error) {
        console.error('[PDF] Error crítico:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al generar PDF en el servidor',
            details: error?.message || String(error)
        });
    } finally {
        if (browser) {
            try {
                await browser.close();
                console.log('[PDF] Navegador cerrado.');
            } catch (closeError) {
                console.error('[PDF] Error al cerrar navegador:', closeError);
            }
        }
    }
});

module.exports = router;
