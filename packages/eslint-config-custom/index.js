module.exports = {
    extends: ['next', 'turbo', 'prettier'],
    plugins: ['import'],
    rules: {
        '@next/next/no-html-link-for-pages': 'off',
        'react/jsx-key': 'off',
        'import/no-anonymous-default-export': 'off',
        'import/order': [
            'warn',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                pathGroups: [
                    {
                        pattern: '@empire/**',
                        group: 'internal',
                    },
                    {
                        pattern: '@orchid/**',
                        group: 'external',
                    },
                    {
                        pattern: 'orchid',
                        group: 'external',
                    },
                ],
                pathGroupsExcludedImportTypes: ['builtin'],
                'newlines-between': 'always',
            },
        ],
    },
}
