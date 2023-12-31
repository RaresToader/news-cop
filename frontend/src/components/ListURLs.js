import ProgressLineCustom from './ProgressLineCustom'
import { Button, Container, Row, Col, Card, Accordion } from 'react-bootstrap'
import SideBySideRender from './SideBySideRender'
import { useState, useEffect } from 'react'
import OneArticleRender from './OneArticleRender'

/**
 * Displays a list of articles (title, publisher, date) together with their similarities.
 * If the width of the page on which the component is displayed is smaller or equal than 992, the list items will
 * be displayed in an Accordion expandable component.
 * @param sourceUrl the url of the input article used for the side-by-side rendering
 * @param articles the list of similar articles to be displayed
 * @returns {JSX.Element} the element that contains the list
 */

export default function ListURLs ({ type, sourceUrl, articles }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedArticleIndex, setSelectedArticleIndex] = useState(null)

  /**
   * Function for generating button types based on the scope of the service (text/URL) comparison
   * @param index of the similar article from the array to be displayed
   * @returns {JSX.Element} the button to be rendered ("Compare" rendering for URL similairty checking and "See article for text")
   */
  function RenderingButtons ({ index }) {
    if (type === 'text') { return <Button className='mx-auto custom-outline-button' variant='outline-success' onClick={() => handleShowByIndex(index)}>See article</Button> } else { return <Button className='mx-auto custom-outline-button' variant='outline-success' onClick={() => handleShowByIndex(index)}>Compare</Button> }
  }

  /**
   * Function for generating rendering component types based on the scope of the service (text/URL) comparison
   * @param article the article from the array to be displayed
   * @returns {JSX.Element} the component to be rendered
   */
  function RenderingType ({ article }) {
    if (type === 'text') { return (<OneArticleRender url={article} showModal={showModal} handleClose={handleClose} />) } else { return (<SideBySideRender urlLeft={sourceUrl} urlRight={article} showModal={showModal} handleClose={handleClose} />) }
  }

  /**
 * Sets the state to show the modal and updates the selected article index.*
 * @param  index - The index of the selected article.
 */
  const handleShowByIndex = (index) => {
    setShowModal(true)
    setSelectedArticleIndex(index)
  }
  /**
   * Close the modal ("pop-up") when going back from rendering option
   */
  const handleClose = () => setShowModal(false)

  const [width, setWidth] = useState(window.innerWidth)

  /**
   * Update the width on resizing
   */
  const updateDimensions = () => {
    setWidth(window.innerWidth)
  }

  /**
   * When the size of the windows are changed call the updateDimensions method
   */
  useEffect(() => {
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  if (articles.length === 0) {
    return <p>No articles were found</p>
  } else {
    return (

      <div>
        <Row>
          {width >= 992
            ? articles.map((article, index) => (
              <Col xs={12} className='mb-3' key={index}>
                <Card className='d-flex flex-row'>
                  <Container fluid className='d-flex flex-row my-3'>
                    <div className='pe-3 title-wrapper'>
                      <div style={{ fontWeight: 'bold' }}>Title</div>
                      <a href={article.url} target='_blank' rel='noopener noreferrer' className='forLinks'>
                        {article.title}
                      </a>
                    </div>
                    <div className='pe-3 publisher-wrapper'>
                      <div style={{ fontWeight: 'bold' }}>Publisher</div>
                      {/* {prefix the site with // if it does not already include it} */}
                      <a href={article.publisher.startsWith('http://') || article.publisher.startsWith('https://') ? article.publisher : `//${article.publisher}`} target='_blank' rel='noopener noreferrer' className='forLinks'>
                        {article.publisher}
                      </a>
                    </div>
                    <div className='pe-3'>
                      <div style={{ fontWeight: 'bold' }}>Published on</div>
                      <div>{article.date}</div>
                    </div>
                    <div className='pe-3 my-auto ms-auto'>
                      <ProgressLineCustom progress={article.similarity} hasOnlyOneProgressBar={false} />
                    </div>
                    <div className='ms-auto my-auto'>
                      {/* Render button */}
                      <RenderingButtons index={index} />
                      {/* Render SideBySideRender component */}
                      {selectedArticleIndex === index && (<RenderingType article={article.url} />)}
                    </div>
                  </Container>
                </Card>
              </Col>
              ))
            : (
              <Accordion alwaysOpen>
                {articles.map((article, index) => (
                  <Accordion.Item eventKey={index} key={index} style={{ marginBottom: '20px' }}>
                    <Accordion.Header className='d-flex flex-row'>
                      <div className='pe-3 title-wrapper'>
                        <div style={{ fontWeight: 'bold' }}>Title</div>
                        <a href={article.url} target='_blank' rel='noopener noreferrer' className='forLinks'>
                          {article.title}
                        </a>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className='pe-3 mb-2 d-flex'>
                        <div className='accordion-fixed-content'>Publisher</div>
                        {/* {prefix the site with // if it does not already include it} */}
                        <a href={article.publisher.startsWith('http://') || article.publisher.startsWith('https://') ? article.publisher : `//${article.publisher}`} target='_blank' rel='noopener noreferrer' className='forLinks'>
                          {article.publisher}
                        </a>
                      </div>
                      <div className='pe-3 mb-4 d-flex'>
                        <div className='accordion-fixed-content'>Published on</div>
                        <div>{article.date}</div>
                      </div>
                      <div className='my-auto mb-3'>
                        <ProgressLineCustom progress={article.similarity} hasOnlyOneProgressBar={false} />
                      </div>
                      <div className='d-flex flex-column align-items-center'>
                        {/* Render button */}
                        <RenderingButtons index={index} />
                        {/* Render SideBySideRender component */}
                        {selectedArticleIndex === index && (<RenderingType article={article.url} />)}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>)}
        </Row>
      </div>
    )
  }
}
