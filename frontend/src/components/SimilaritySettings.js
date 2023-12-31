import React from 'react'
import { collect } from 'collect.js'
import { Accordion, Button } from 'react-bootstrap'
import { AccordionDetails, Slider, Typography } from '@mui/material'
import ListURLs from './ListURLs'

/**
 * A special component encapsulating the slider and "see more articles" functionalities.
 * The component also represents the parent of the ListURLs component as the latter is updated dynamically
 * based on the settings of the lower-bound and number of documents.
 *
 * @param type - The type of the service for which is called (text/url similarity checker).
 * @param sourceUrl - The URL for which it was called.
 * @param articles - The similar articles to the one given.
 */
export default function SimilaritySettings ({ type, sourceUrl, articles }) {
  const [ratioValue, setRatioValue] = React.useState(0)
  const [resultArticles, setResultArticles] = React.useState(collect(articles).take(5))
  const [displayButton, setDisplayButton] = React.useState(true)
  const [articlesAmount, setArticlesAmount] = React.useState(5)

  // set of similarity thresholds used in the slider based on the maximum similarity score obtained from the query
  const marks = [
    {
      value: 0,
      label: '0'
    },
    {
      value: articles[0].similarity / 4,
      label: `${articles[0].similarity / 4}`
    },
    {
      value: articles[0].similarity / 2,
      label: `${articles[0].similarity / 2}`
    },
    {
      value: articles[0].similarity * 3 / 4,
      label: `${articles[0].similarity * 3 / 4}`
    },
    {
      value: articles[0].similarity,
      label: `${articles[0].similarity}`
    }
  ]

  /**
   * Handle change of similarity ratio value being changed
   * @param event of moving the slider hence modifying its value
   * @param newValue the new value that the slider points to
   */
  const handleRatioValueChange = (event, newValue) => {
    setRatioValue(newValue)
    setResultArticles(collect(articles).take(articlesAmount).filter(a => a.similarity >= newValue))
  }

  /**
   * Handle clicking on the "See more articles" button
   * @param event of clicking on the button
   */
  const handleSeeMoreArticles = (event) => {
    setResultArticles(articles)
    setArticlesAmount(articles.length)
    setRatioValue(0)
    setDisplayButton(false)
  }

  return (
    <div>
      <div className='d-flex justify-content-center slider-container pt-3'>
        <Accordion>
          <AccordionDetails>
            <div style={{ textAlign: 'center' }}>
              <Typography>Display articles with similarity above {ratioValue} %</Typography>
              <Slider
                style={{ width: window.innerWidth / 2 }}
                marks={marks}
                value={ratioValue} onChange={handleRatioValueChange} min={0} max={articles[0].similarity}
              />
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='pt-3'>
        <ListURLs type={type} sourceUrl={sourceUrl} articles={resultArticles} />
      </div>
      <div className='d-flex justify-content-center pt-3'>
        {(articles.length > 5) &&
                    (displayButton) &&
                    (
                      <div>
                        <Button
                          className='mx-auto custom-outline-button' variant='outline-success'
                          onClick={handleSeeMoreArticles}
                        >See more articles
                        </Button>
                      </div>)}
      </div>
    </div>
  )
}
