import Container from 'react-bootstrap/Container'

/**
 * A container that will hold the plagiarism header and description subheader that
 * can be found on the Figma wireframe.
 *
 *
 * @returns {JSX.Element} that represents the plagiarism text and description of our tool;
 * Can be found directly under the navbar component of the page
 */
export default function BodyCheckTwoTexts () {
  const description = 'News overlap checker'
  const secondDescription = 'Our similarity checker determines the similarity levels between two text paragraphs.'

  return (
    <Container className='my-3 d-flex'>
      <div className='d-flex flex-column justify-content-center mx-auto'>
        <div className='mb-3 mx-auto'>
          <h2 className='title' id='plagiarismChecker' style={{ textAlign: 'center' }}>{description}</h2>
        </div>
        <div className='mb-4'>
          <p className='description-paragraph'>{secondDescription}</p>
        </div>
      </div>
    </Container>
  )
}
