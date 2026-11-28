/**
 * Reading `CREDITS.md` for the Credits and licences screen (APP-1.6), so the screen lists exactly what the file does.
 * Each table row is a credit; its Licence column names the licence file it ships under in parentheses, as
 * `(`node_modules/svelte/LICENSE.md`)`, where the licence asks for its notice to travel with the code.
 */

/** One row of a table in `CREDITS.md`. */
export interface Credit {
    /** The What column, without Markdown's backticks. */
    readonly name: string;
    /** The Version column, for a library. */
    readonly version?: string;
    /** The Author column, for data, fonts and images. */
    readonly author?: string;
    /** The Source column: a URL. */
    readonly source: string;
    /** The Licence column without its file: "MIT, © danigb". */
    readonly licence: string;
    /** The licence file's path from the repository's root, where the Licence column names one. */
    readonly licenceFile?: string;
}

/** A Licence column's file, in backticks inside parentheses. */
const LICENCE_FILE = /\s*\(`([^`]+)`\)/;

function cells(line: string): string[] {
    return line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map(cell => cell.trim());
}

function plain(text: string): string {
    return text.replaceAll('`', '');
}

/** Every credit in `CREDITS.md`'s tables, in the file's order. */
export function readCredits(markdown: string): Credit[] {
    const credits: Credit[] = [];
    let columns: string[] | undefined;
    for (const line of markdown.split(/\r?\n/)) {
        if (!line.trimStart().startsWith('|')) {
            columns = undefined;
            continue;
        }
        const row = cells(line);
        if (columns === undefined) {
            columns = row;
            continue;
        }
        if (row.every(cell => /^:?-+:?$/.test(cell))) continue;
        const column = (name: string): string | undefined => {
            const at = columns?.indexOf(name) ?? -1;
            return at < 0 || row[at] === '' ? undefined : row[at];
        };
        const licenceCell = column('Licence') ?? '';
        const file = LICENCE_FILE.exec(licenceCell)?.[1];
        const version = column('Version');
        const author = column('Author');
        credits.push({
            name: plain(column('What') ?? ''),
            ...(version !== undefined && { version }),
            ...(author !== undefined && { author: plain(author) }),
            source: column('Source') ?? '',
            licence: plain(licenceCell.replace(LICENCE_FILE, '')),
            ...(file !== undefined && { licenceFile: file })
        });
    }
    return credits;
}
