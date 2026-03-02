/**
 * Tạo Room ID ngẫu nhiên dạng "abc-1234"
 * 3 chữ cái + "-" + 4 số
 */
export function generateRoomId(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const letterPart = Array.from({ length: 3 }, () =>
        letters[Math.floor(Math.random() * letters.length)]
    ).join('');
    const numberPart = Array.from({ length: 4 }, () =>
        numbers[Math.floor(Math.random() * numbers.length)]
    ).join('');
    return `${letterPart}-${numberPart}`;
}

/**
 * Kiểm tra định dạng Room ID hợp lệ
 */
export function isValidRoomId(id: string): boolean {
    return /^[a-z]{3}-\d{4}$/.test(id);
}
