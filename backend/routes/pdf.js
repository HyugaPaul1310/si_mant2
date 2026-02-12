const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer-core');

// Endpoint para generar PDF desde HTML
router.post('/generate', async (req, res) => {
    let browser;

    try {
        const { html } = req.body;

        if (!html) {
            return res.status(400).json({ success: false, error: 'HTML content is required' });
        }

        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || undefined;

        browser = await puppeteer.launch({
            headless: 'new',
            executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        // Enviar PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('[PDF] Error generando PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar PDF',
            details: error?.message || String(error)
        });
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('[PDF] Error cerrando browser:', closeError);
            }
        }
    }
});

module.exports = router;
