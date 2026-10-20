import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HEADERS = [
    'Nombre',
    'Acompañante',
    'Toma alcohol',
    'Restricciones',
    'Fecha registro',
];

function getExcelPath() {
    const configured = process.env.EXCEL_PATH || './data/invitados.xlsx';
    return path.isAbsolute(configured)
        ? configured
        : path.resolve(process.cwd(), configured);
}

async function loadOrCreateWorkbook(filePath) {
    const workbook = new ExcelJS.Workbook();

    if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
        return workbook;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const sheet = workbook.addWorksheet('Invitados');
    sheet.addRow(HEADERS);
    sheet.getRow(1).font = { bold: true };
    sheet.columns = [
        { key: 'nombre', width: 30 },
        { key: 'acompanante', width: 18 },
        { key: 'tomaAlcohol', width: 14 },
        { key: 'problemasComida', width: 30 },
        { key: 'fecha', width: 22 },
    ];

    await workbook.xlsx.writeFile(filePath);
    return workbook;
}

/** Agrega una fila al Excel local (offline). */
export async function appendInvitadoToExcel(invitado) {
    const filePath = getExcelPath();
    const workbook = await loadOrCreateWorkbook(filePath);
    const sheet = workbook.getWorksheet('Invitados') || workbook.worksheets[0];

    sheet.addRow([
        invitado.nombre,
        invitado.acompanante,
        invitado.tomaAlcohol,
        invitado.problemasComida || 'Ninguna',
        new Date(invitado.fechaRegistro || Date.now()).toLocaleString('es-AR'),
    ]);

    await workbook.xlsx.writeFile(filePath);
    return { synced: true, path: filePath };
}
