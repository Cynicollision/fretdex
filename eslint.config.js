import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import ts from 'typescript-eslint';

export default defineConfig(
    includeIgnoreFile(path.resolve(import.meta.dirname, '.gitignore')),
    // Claude Code keeps its worktrees in .claude/worktrees/, each a full copy of the repository.
    globalIgnores(['.claude/']),
    js.configs.recommended,
    ts.configs.recommendedTypeChecked,
    svelte.configs.recommended,
    prettier,
    svelte.configs.prettier,
    {
        languageOptions: {
            parserOptions: {
                // Each package's tsconfig.json covers its files; the root's config files get a default project.
                projectService: { allowDefaultProject: ['*.js'] },
                tsconfigRootDir: import.meta.dirname
            },
            globals: { ...globals.browser, ...globals.node }
        },
        rules: {
            // TypeScript already checks for undefined names.
            'no-undef': 'off'
        }
    },
    {
        // The root's config files are plain JavaScript outside every package, with no types to check against.
        files: ['*.js'],
        extends: [ts.configs.disableTypeChecked]
    },
    {
        files: ['**/*.svelte', '**/*.svelte.ts'],
        languageOptions: {
            parserOptions: {
                extraFileExtensions: ['.svelte'],
                parser: ts.parser
            }
        }
    }
);
