'use strict'

module.exports = {
  extends: ['nicenice'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      'node': {
        'moduleDirectory': [
          'node_modules',
          'src',
          '.',
        ],
      },
    },
  },
}
