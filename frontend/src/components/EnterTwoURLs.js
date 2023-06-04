import { useState } from 'react'
import { Button, Container, Form } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import axios from 'axios'
import SubmitButton from './submitButton'
import ProgressLineCustom from './ProgressLineCustom'
import SideBySideRender from './SideBySideRender'
import LoadingCircle from './LoadingCircle'

/**
 * Container that displays:
 * 1. The description of the form from 2.
 * 2. The `Article's URL` form where the user will input the URLs that he wants to
 * check for overlapping
 * 3. The `Submit button` that sends the URLs to the backend server to do the computations
 * Can also be found on the Figma wireframe.
 *
 * @returns {JSX.Element} that represents the overlapping description, form and submit button;
 * Can be found directly under the navbar component of the page
 */

export default function EnterTwoURLs () {
  const PreInputArticlePromptOriginal = 'Enter the original URL'
  const PreInputArticlePromptChanged = 'Enter the changed URL'

  const [inputValueOriginal, setInputValueOriginal] = useState('')
  const [inputValueChanged, setInputValueChanged] = useState('')
  const [showInputValue, setShowInputValue] = useState(false)
  const [answerValue, setAnswerValue] = useState(0)
  const [showCompareButton, setShowCompareButton] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [outputValue, setOutputValue] = useState('')
  const [outputColor, setOutputColor] = useState('black')
  const [loadingValue, setLoadingValue] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [outputVisualisations, setOutputVisualisations] = useState(false)

  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  const compareURLsEndpoint = 'http://localhost:8000/compareURLs/'

  const createRequestBody = (dataLeft, dataRight) => {
    return {
      url_left: dataLeft,
      url_right: dataRight
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setButtonDisabled(true)

    // set output value to be empty before
    setShowInputValue(false)
    setShowCompareButton(false)
    setOutputVisualisations(false)
    setOutputValue('')
    setAnswerValue(0)
    setLoadingValue(true)

    await axios.post(`${compareURLsEndpoint}`, createRequestBody(inputValueOriginal, inputValueChanged))
      .then(response => {
        const answer = Math.round(100 * response.data)

        // change color accordingly
        if (answer >= 80) setOutputColor('red')
        else setOutputColor('green')

        setOutputValue(`The two news articles given have similarity level of ${answer} %`)
        setShowCompareButton(true)
        setAnswerValue(answer)
        setOutputVisualisations(true)
      })
      .catch(error => {
        console.log(error)
        setOutputColor('darkred')
        setOutputValue('Please provide a valid input!')
        setOutputVisualisations(false)
      })

    setShowInputValue(true)
    setLoadingValue(false)

    setTimeout(() => {
      setButtonDisabled(false)
    }, 5000)
  }

  const handleInputChangeOriginal = (event) => {
    setInputValueOriginal(event.target.value)
    console.log(event.target.value)
  }

  const handleInputChangeChanged = (event) => {
    setInputValueChanged(event.target.value)
    console.log(event.target.value)
  }

  return (
    <Container className='my-3'>
      <div className='mt-5'>
        <h2 className='text-center' style={{ fontSize: '1.5vh' }}>
          Enter the article's URLs to check for similarity
        </h2>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Form.Group controlId='formUrl'>
          <Row className='url-part'>
            <Col md={6} className='pe-sm-6 mb-6 mb-sm-0 pb-2 pb-md-0'>
              <Form.Control
                type='url'
                placeholder={PreInputArticlePromptOriginal}
                className='rounded-pill border-success'
                style={{ height: '50px' }}
                value={inputValueOriginal}
                onChange={handleInputChangeOriginal}
                disabled={buttonDisabled}
              />
            </Col>
            <Col md={6} className='pe-sm-6 mb-6 mb-sm-0 pt-2 pt-md-0'>
              <Form.Control
                type='url'
                placeholder={PreInputArticlePromptChanged}
                className='rounded-pill border-success'
                style={{ height: '50px' }}
                value={inputValueChanged}
                onChange={handleInputChangeChanged}
                disabled={buttonDisabled}
              />
            </Col>
          </Row>
        </Form.Group>
        <SubmitButton onClickMethod={handleSubmit} disabled={buttonDisabled || !inputValueChanged || !inputValueOriginal} />
        {loadingValue && (<LoadingCircle />)}
        {showInputValue && (
          <div>
            {/* Render similarity score */}
            <div className='pt-5' style={{ display: 'flex', justifyContent: 'center', color: outputColor, fontSize: '1.25rem', textAlign: 'center' }}>
              {outputValue}
            </div>

            {outputVisualisations && (
              <div>
                {/* Render the side-by-side button and the component itself */}
                <div className='d-flex justify-content-center pt-3'>
                  {showCompareButton && (
                    <div>
                      {/* Render button */}
                      <Button className='mx-auto custom-outline-button' variant='outline-success' onClick={handleShow}>View Side-by-Side</Button>

                      {/* Render SideBySideRender component */}
                      <SideBySideRender urlLeft={inputValueOriginal} urlRight={inputValueChanged} showModal={showModal} handleClose={handleClose} />
                    </div>
                  )}
                </div>
                <ProgressLineCustom progress={answerValue} />
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}
