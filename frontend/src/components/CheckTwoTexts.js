import NavbarComponent from './navbarSecondary'
import Footer from './footer'
import BodyCheckTwoTexts from './BodyCheckTwoTexts'
import TextBox from './TextBox'
import SubmitButton from './submitButton'
import { useState } from 'react'

/**
 * The page for the checking two texts for overlapping. It contains all the components that will be present in the page,
 * and reuses some of the elements that can be found in the main page.
 *
 * @returns {JSX.Element} the check text for plagiarism component
 */
export default function CheckTwoTexts () {
  const applicationName = 'NewsCop'
  const originalTextBoxDescription = 'Enter the original content'
  const changedTextBoxDescription = 'Enter the changed content'
  const [loading, setLoading] = useState(false)

  /**
     * Disable a button after using it for 10 seconds.
     * Source: https://stackoverflow.com/questions/63820933/how-to-disable-a-button-using-react-usestate-hook-inside-event-handler
     *
     * @param event an event, a click event in our case
     * @returns {Promise<void>} after the time passes, the button will become usable again
     */
  async function handleSubmit (event) {
    setLoading(true)
    console.log(loading)
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve()
      }, 10000)
    )

    setLoading(false)
    console.log(loading)
  }

  const compareTextsEndpoint = 'http://localhost:8000/compareTexts/'

  /**
   * Send request to compute similarity between two pieces of text.
   * @param originalText the first text which is checked
   * @param compareText the second text which is checked
   * @returns {Promise<any>} the response after the similarity coefficient is computed
   */
  const compareTexts = async (originalText, compareText) => {
    try {
      const response = await axios.post(`${persistUrlEndpoint}`, {originalText, compareText})
      return response.data
    } catch (error) {
      console.error(error)
      throw new Error('Failed to persist url')
    }
  }

  return (
    <>
      {/* Navbar */}
      <NavbarComponent name={applicationName} />
      {/* The description text about news overlap */}
      <BodyCheckTwoTexts />
      <div className='parentBoxesContainer'>
        <div className='childBoxContainer'>
          {/* Text area */}
          <TextBox description={originalTextBoxDescription} disabled={loading} />
        </div>
        <div className='childBoxContainer'>
          {/* Text area */}
          <TextBox description={changedTextBoxDescription} disabled={loading} />
        </div>
      </div>
      {/* The submit button */}
      <SubmitButton disabled={loading} onClickMethod={handleSubmit} />
      {/* Footer */}
      <Footer />
    </>
  )
}
