import axios from 'axios'
import { useState } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import CheckUrlDecision from './CheckUrlDecision'
import LoadingCircle from './LoadingCircle'
/* The endpoint that is going to be used for the request, see urls.py and views.py */
const persistUrlEndpoint = 'http://localhost:8000/urlsimilarity/'

/**
 * Persists a URL asynchronously, the URL will have to be stored as the value for "key" in
 * a JSON format.
 * @param url the URL, in the format above
 * @returns {Promise<any>} the response after the persistance
 */
export const persistUrl = async (url) => {
  try {
    const response = await axios.post(`${persistUrlEndpoint}`, url)
    return response.data
  } catch (error) {
    console.error(error)
    throw new Error('Failed to persist url')
  }
}

/**
 * Container that displays:
 * 1. The description of the form from 2.
 * 2. The `Article's URL` form where the user will input the URL that he wants to
 * check for overlapping with other articles stored in our database
 * 3. The `Submit button` that sends the URL to the backend server to do the computations
 * Can also be found on the Figma wireframe.
 *
 * @returns {JSX.Element} that represents the overlapping description, form and submit button;
 * Can be found directly under the navbar component of the page
 */
export default function EnterURL () {
  const PreInputArticlePrompt = "Article's URL"
  const buttonStyle = {
    width: '30%',
    height: '7vh',
    maxHeight: '100px',
    fontWeight: 'bold',
    fontSize: 'min(calc(1vh + 1vw), 50px)', // Adjust the font size as needed
    backgroundColor: '#2E837E',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '25%',
    marginRight: '25%'
  }
  const [titleValue, setTitleValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [decisionValue, setDecisionValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [showInputValue, setShowInputValue] = useState(false)
  const [loadingValue, setLoadingValue] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault()
    setButtonDisabled(true)
    setLoadingValue(true)
    const response = await axios.post(`${persistUrlEndpoint}`,
      '{ "key":' + `"${inputValue}"}`)
      .catch(function (error) {
        if (error.response) {
          setLoadingValue(false)
          // https://stackoverflow.com/questions/49967779/axios-handling-errors
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data)
          console.log(error.response.status)
          console.log(error.response.headers)
        } else if (error.request) {
          setLoadingValue(false)
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser
          // and an instance of http.ClientRequest in node.js
          console.log(error.request)
        } else {
          setLoadingValue(false)
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message)
        }
      })
    if (response != null) {
      console.log(response.data)
      setLoadingValue(false)
      setTitleValue(inputValue)
      setDateValue(response.data.date)
      setDecisionValue('Has a maximum overlap of ' + Math.round(100 * response.data.max_val) + '% with ' + response.data.max_url)
      setShowInputValue(true)
    }
    setTimeout(() => {
      // setShowInputValue(false)
      setButtonDisabled(false)
      setLoadingValue(false)
      setInputValue('')
    }, 10000)
  }

  const handleInputChange = (event) => {
    setShowInputValue(false)
    // setLoadingValue(true)
    setTitleValue('')
    setDateValue('')
    setDecisionValue('')
    setInputValue(event.target.value)
    console.log(event.target.value)
  }

  return (
    <Container className='my-3'>
      <div className='mt-5'>
        <h2 className='text-center' style={{ fontSize: '1.5vh' }}>
          Enter the article's URL to check for plagiarism
        </h2>
      </div>
      <div style={{ maxWidth: '70vh', margin: '0 auto' }}>
        <Form.Group controlId='formUrl'>
          <Form.Control
            type='url'
            placeholder={PreInputArticlePrompt}
            className='rounded-pill border-success'
            style={{ height: '50px' }}
            value={inputValue}
            onChange={handleInputChange}
            disabled={buttonDisabled}
          />
        </Form.Group>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant='primary'
            type='submit'
            className='mt-4 rounded'
            style={buttonStyle}
            onClick={handleSubmit}
            disabled={buttonDisabled || !inputValue}
          >
            Submit
          </Button>
        </div>
      </div>
      {loadingValue && (<LoadingCircle />)}
      {showInputValue && (
        <CheckUrlDecision title={titleValue} publishingDate={dateValue} decision={decisionValue} />
      )}
    </Container>

  )
}
