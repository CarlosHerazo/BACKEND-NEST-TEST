import { addIva } from "./iva-calculate";

describe('AGREGAR IVA', () => {
    it('Agregar iva a un monto especifico', () => {
        const amount = 1000; // Monto sin IVA
        const ouput = 1190; // Monto con IVA incluido

        const result = addIva(amount);
        const expectationIva = amount + result;
        expect(expectationIva).toBe(ouput);
    });
});