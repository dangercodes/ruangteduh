export const validateLength = (
    text: string | null | undefined,
    min: number,
    max: number,
    fieldName: string = 'Isian'
): string => {
    const trimmed = (text || '').trim();
    if (trimmed.length < min) {
        throw new Error(`${fieldName} minimal harus terdiri dari ${min} karakter. 🍃`);
    }
    if (trimmed.length > max) {
        throw new Error(`${fieldName} maksimal ${max} karakter. 🍃`);
    }
    return trimmed;
};

export const validateNotEmpty = (text: string | null | undefined, fieldName: string = 'Isian'): string => {
    const trimmed = (text || '').trim();
    if (!trimmed) {
        throw new Error(`${fieldName} tidak boleh kosong. 🍃`);
    }
    return trimmed;
};
