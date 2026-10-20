import mongoose from 'mongoose';

const invitadoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    acompanante: {
        type: String,
        required: true,
        enum: ['Voy solo/a', '1 Acompañante', '2 Acompañantes']
    },
    tomaAlcohol: {
        type: String,
        required: true,
        enum: ['Sí', 'No']
    },
    problemasComida: {
        type: String,
        default: 'Ninguna',
        trim: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

export const Invitado = mongoose.model('Invitado', invitadoSchema);
