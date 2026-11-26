import { describe, expect, it } from 'vitest';
import { silentWav } from './silent-switch';

describe('silentWav', () => {
    it('AUD-1.4 and AUD-7.2 makes a silent 16-bit mono WAV in code', () => {
        const bytes = silentWav(0.5, 8000);
        const view = new DataView(bytes.buffer);
        const text = (at: number, length: number) => String.fromCharCode(...bytes.slice(at, at + length));

        expect(text(0, 4)).toBe('RIFF');
        expect(text(8, 4)).toBe('WAVE');
        expect(view.getUint32(24, true)).toBe(8000);
        expect(view.getUint16(34, true)).toBe(16);
        expect(view.getUint32(40, true)).toBe(8000);
        expect(bytes.length).toBe(44 + 8000);
        expect(bytes.slice(44).every(byte => byte === 0)).toBe(true);
    });
});
