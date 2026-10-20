import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { Invitado } from './models/invitado.js';
import { appendInvitadoToExcel } from './services/excel.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API Endpoint: Recibir confirmaciones
app.post('/api/confirmar', async (req, res) => {
    try {
        const { nombre, tomaAlcohol, problemasComida } = req.body;
        const acompanante = req.body.acompanante ?? req.body.acompañante;

        const nuevoInvitado = new Invitado({
            nombre,
            acompanante,
            tomaAlcohol,
            problemasComida
        });

        await nuevoInvitado.save();

        let excelSynced = false;
        try {
            const excelResult = await appendInvitadoToExcel(nuevoInvitado);
            excelSynced = Boolean(excelResult?.synced);
        } catch (excelError) {
            console.error('❌ Error escribiendo Excel:', excelError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Asistencia registrada correctamente.',
            excelSynced,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// API Endpoint: Obtener lista completa para el Panel Admin
app.post('/api/admin/invitados', async (req, res) => {
    try {
        const { password } = req.body;

        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }

        const lista = await Invitado.find().sort({ fechaRegistro: -1 });
        res.json({ success: true, invitados: lista });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`));
