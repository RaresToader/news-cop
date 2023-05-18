import NavbarComponent from './navbar'
import Footer from './footer'
import BodyCheckTwoTexts from './BodyCheckTwoTexts'
import TextBox from './TextBox'
import SubmitButton from './submitButton'
import { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'

/**
 * The page for the checking two texts for overlapping. It contains all the components that will be present in the page,
 * and reuses some of the elements that can be found in the main page.
 *
 * @returns {JSX.Element} the check text for plagiarism component
 */
export default function CheckTwoTexts ({ applicationName, firstPlaceholder, secondPlaceholder }) {
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
  return (
    <>
      <div className='d-flex flex-column' style={{ height: '100vh' }}>
        {/* Navbar */}
        <NavbarComponent name={applicationName} mainPage={false} />
        {/* The description text about news overlap */}
        <BodyCheckTwoTexts />
        <Container style={{ height: 'calc(100% - 90px)' }}>
          <Row style={{ height: '100%' }}>
            <Col md={6}>
              {/* Text area */}
              <TextBox description={originalTextBoxDescription} disabled={loading} placeholder={firstPlaceholder} />
            </Col>
            <Col md={6}>
              {/* Text area */}
              <TextBox description={changedTextBoxDescription} disabled={loading} placeholder={secondPlaceholder} />
            </Col>
          </Row>
        </Container>
        {/* The submit button */}
        <SubmitButton disabled={loading} onClickMethod={handleSubmit} />
      </div>
      {/* Footer */}
      <Footer />
    </>
  )
}
