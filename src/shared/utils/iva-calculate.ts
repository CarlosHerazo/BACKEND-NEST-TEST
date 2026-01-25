const ADD_IVA = 0.19;

export function addIva(amount: number): number {
    return amount * ADD_IVA;
}