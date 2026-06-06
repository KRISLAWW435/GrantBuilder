import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "docx";
import { saveAs } from "file-saver";

const parseMarkdownRuns = (text: string, isTitle = false, isSubtitle = false, sizePt = 14) => {
    // Basic bold markdown parser for **text**
    const parts = text.split('**');
    const runs: TextRun[] = [];
    for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
            runs.push(new TextRun({
                text: parts[i],
                bold: i % 2 !== 0 || isTitle,
                font: "Times New Roman",
                size: sizePt * 2, // docx uses half-points (e.g., 28 half-points = 14pt)
            }));
        }
    }
    return runs;
};

export const exportToDocx = async (markdownText: string, fileName = "Grant_Application.docx") => {
    const lines = markdownText.split('\n');
    const sectionsAndChildren: any[] = [];
    
    let currentTableRows: TableRow[] = [];
    let isInsideTable = false;

    const flushTable = () => {
        if (currentTableRows.length > 0) {
            sectionsAndChildren.push(new Table({
                rows: currentTableRows,
                width: {
                    size: 100,
                    type: "pct" as any
                }
            }));
            currentTableRows = [];
        }
        isInsideTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect Table Lines
        if (line.startsWith('|')) {
            isInsideTable = true;
            // Check if it's a separator line (contains only dashes, colons, pipes)
            const isSeparator = /^\|[\s\-:|]+$/.test(line);
            if (!isSeparator) {
                const cells = line.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                const isHeader = currentTableRows.length === 0;

                const row = new TableRow({
                    children: cells.map(cellText => {
                        const cellVal = cellText.trim();
                        const isCellBold = cellVal.startsWith('**') && cellVal.endsWith('**');
                        const cleanCellText = cellVal.replace(/\*\*/g, '');

                        return new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: cleanCellText,
                                            font: "Times New Roman",
                                            size: 22, // 11pt fits nicely inside standard tables
                                            bold: isHeader || isCellBold
                                        })
                                    ],
                                    spacing: { before: 120, after: 120, line: 240 }
                                })
                            ],
                            margins: {
                                top: 120,
                                bottom: 120,
                                left: 180,
                                right: 180
                            }
                        });
                    })
                });
                currentTableRows.push(row);
            }
            continue;
        } else {
            if (isInsideTable) {
                flushTable();
            }
        }

        if (!line) {
            // Empty space helper
            continue;
        }

        // Horizontal line separator
        if (line === '---') {
            paragraphsPush(new Paragraph({
                children: [new TextRun({ text: "__________________________________________________________________", font: "Times New Roman", size: 24, color: "CCCCCC" })],
                spacing: { before: 240, after: 240 }
            }));
            continue;
        }

        if (line.startsWith('# ')) {
             paragraphsPush(new Paragraph({
                 children: parseMarkdownRuns(line.replace('# ', ''), true, false, 18), // 18pt title
                 spacing: { before: 360, after: 180, line: 360 }
             }));
        } else if (line.startsWith('## ')) {
             paragraphsPush(new Paragraph({
                 children: parseMarkdownRuns(line.replace('## ', ''), true, false, 16), // 16pt primary header
                 spacing: { before: 360, after: 140, line: 360 }
             }));
        } else if (line.startsWith('### ')) {
             paragraphsPush(new Paragraph({
                 children: parseMarkdownRuns(line.replace('### ', ''), true, false, 14), // 14pt subheading
                 spacing: { before: 280, after: 120, line: 360 }
             }));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
             // Handle checklists vs standard bullet items
             const textPart = line.substring(2);
             paragraphsPush(new Paragraph({
                 children: parseMarkdownRuns(textPart, false, false, 14),
                 bullet: { level: 0 },
                 spacing: { before: 80, after: 80, line: 360 }
             }));
        } else {
             paragraphsPush(new Paragraph({
                 children: parseMarkdownRuns(line, false, false, 14),
                 spacing: { before: 120, after: 120, line: 360 } // Standard 1.5 spacing
             }));
        }
    }

    // Flush final table if open
    if (isInsideTable) {
        flushTable();
    }

    function paragraphsPush(p: any) {
        sectionsAndChildren.push(p);
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1134,    // 2cm in twips
                        bottom: 1134, // 2cm in twips
                        left: 1134,   // 2cm in twips
                        right: 1134   // 2cm in twips
                    }
                }
            },
            children: sectionsAndChildren
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
};
