import { render, screen } from '@testing-library/react'
import CheckTwoURLs from '../CheckTwoURLs'
import { MemoryRouter } from 'react-router-dom'

describe('CheckTwoURLs', () => {
  test('renders the prompt text', () => {
    const prompt = '... or you may want to check the similarity of two text paragraphs'

    render(
      <MemoryRouter>
        <CheckTwoURLs />
      </MemoryRouter>
    )

    // Check if the text element containing the prompt text
    const promptElement = screen.getByText(prompt)
    expect(promptElement).toBeInTheDocument()
  })
})
