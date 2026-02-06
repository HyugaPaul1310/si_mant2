const express = require('express');
const router = express.Router();
const htmlPdf = require('html-pdf-node');

// Endpoint para generar PDF desde HTML
router.post('/generate', async (req, res) => {
    try {
        const { html } = req.body;

        if (!html) {
            return res.status(400).json({ success: false, error: 'HTML content is required' });
        }

        const options = {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        };
        const file = { content: html };

        // Generar PDF
        const pdfBuffer = await htmlPdf.generatePdf(file, options);

        // Enviar PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('[PDF] Error generando PDF:', error);
        res.status(500).json({ success: false, error: 'Error al generar PDF' });
    }
});

module.exports = router;
