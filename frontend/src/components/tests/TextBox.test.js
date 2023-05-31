import React from 'react'
import { render, screen } from '@testing-library/react'
import TextBox, { highlightWordsOnly } from '../TextBox'
import ResizeObserver from 'resize-observer-polyfill'

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver
}
describe('TextBox', () => {
  it('renders the component with the correct title and textarea', () => {
    render(<TextBox description='Enter your article here' placeholder='Enter your article here' />)

    /* Check if the text area is rendered correctly */
    const textareaElement = screen.getByPlaceholderText('Enter your article here')
    expect(textareaElement).toBeInTheDocument()
  })

  describe('highlightWordsOnly function', () => {
    test('returns an empty array if similarity is 0', () => {
      const result = highlightWordsOnly({
        autoEscape: true,
        caseSensitive: false,
        sanitize: true,
        searchWords: ['word1', 'word2'],
        textToHighlight: 'some text',
        similarity: 0
      })

      expect(result).toEqual([])
    })

    test('finds and returns chunks for matched words', () => {
      const result = highlightWordsOnly({
        autoEscape: true,
        caseSensitive: false,
        sanitize: true,
        searchWords: ['fox', 'dog'],
        textToHighlight: 'The quick brown fox jumps over the lazy dog',
        similarity: 1
      })

      expect(result).toEqual([
        { start: 16, end: 19 }, // chunk for 'fox'
        { start: 40, end: 43 } // chunk for 'dog'
      ])
    })

    test('handles case sensitivity properly', () => {
      const result = highlightWordsOnly({
        autoEscape: true,
        caseSensitive: true,
        sanitize: true,
        searchWords: ['Fox'],
        textToHighlight: 'The quick brown fox jumps over the lazy dog',
        similarity: 1
      })

      expect(result).toEqual([])
    })
  })
})
