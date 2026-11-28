import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readCredits } from './credits';

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));

describe('readCredits', () => {
    it('APP-1.6 reads each table row, its licence file apart from its licence', () => {
        const markdown = [
            '# Credits',
            '',
            '| What | Version | Source | Licence | Where |',
            '|---|---|---|---|---|',
            '| Tonal.js (`tonal`) | 6.5.1 | https://github.com/tonaljs/tonal | MIT, © danigb (`node_modules/tonal/LICENSE`) | In `_app/` |',
            '',
            '| What | Author | Source | Licence | Where |',
            '|---|---|---|---|---|',
            '| A font | The Authors | https://example.org | SIL Open Font License 1.1; in the metadata | `_app/` |'
        ].join('\n');
        expect(readCredits(markdown)).toEqual([
            {
                name: 'Tonal.js (tonal)',
                version: '6.5.1',
                source: 'https://github.com/tonaljs/tonal',
                licence: 'MIT, © danigb',
                licenceFile: 'node_modules/tonal/LICENSE'
            },
            {
                name: 'A font',
                author: 'The Authors',
                source: 'https://example.org',
                licence: 'SIL Open Font License 1.1; in the metadata'
            }
        ]);
    });

    it("APP-1.6 finds every library's licence file that CREDITS.md names", () => {
        const credits = readCredits(readFileSync(`${ROOT}CREDITS.md`, 'utf8'));
        const libraries = credits.filter(credit => credit.version !== undefined);
        expect(libraries.length).toBeGreaterThan(0);
        for (const credit of credits) {
            expect(credit.source, credit.name).toMatch(/^https:\/\//);
            expect(credit.licence, credit.name).not.toBe('');
        }
        for (const library of libraries) {
            expect(library.licenceFile, library.name).toBeDefined();
            expect(existsSync(`${ROOT}${library.licenceFile}`), library.licenceFile).toBe(true);
        }
    });
});
