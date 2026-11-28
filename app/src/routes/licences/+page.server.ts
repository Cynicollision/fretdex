// Credits and licences (APP-1.6), read from CREDITS.md and the licence files it names when the screen is prerendered,
// so the built app carries every notice its libraries' licences ask for, and shows them offline. A licence file that's
// missing fails the build.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readCredits } from '#lib/about/credits.ts';
import type { PageServerLoad } from './$types';

// The screen's data is written beside it as licences/__data.json, and GitHub Pages sends a path that is also a folder
// to the folder, so the page is licences/index.html at /licences/ rather than licences.html.
export const trailingSlash = 'always';

/** The repository's root: the nearest folder up from where the build runs that holds CREDITS.md. */
function repositoryRoot(): string {
    let folder = process.cwd();
    while (!existsSync(path.join(folder, 'CREDITS.md'))) {
        const parent = path.dirname(folder);
        if (parent === folder) throw new Error('CREDITS.md not found above ' + process.cwd());
        folder = parent;
    }
    return folder;
}

export const load: PageServerLoad = async () => {
    const root = repositoryRoot();
    const credits = readCredits(await readFile(path.join(root, 'CREDITS.md'), 'utf8'));
    return {
        credits: await Promise.all(
            credits.map(async credit => ({
                ...credit,
                text:
                    credit.licenceFile === undefined
                        ? undefined
                        : (await readFile(path.join(root, credit.licenceFile), 'utf8')).trim()
            }))
        )
    };
};
