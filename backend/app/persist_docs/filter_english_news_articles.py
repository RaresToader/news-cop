import sys
import os
import django

# Add the project's root directory to the system path
persist_docs_path = os.path.dirname(os.path.realpath(__file__))
root_path = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '../..'))
sys.path.append(root_path)

# Set the Django settings module environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

# Initialize Django
django.setup()

import logging
import time
from newsplease import NewsPlease as NewsPlease
from app.models import NewsDocument
from app.plagiarism_checker.crawling import crawl_url
from app.plagiarism_checker.fingerprinting import compute_fingerprint
import signal


class TimeoutException(Exception):
    """Exception that is thrown to handle timeouts, if an URL was not crawled in at most 10 seconds
    """
    pass


def timeout_handler(signum, frame):
    raise TimeoutException()


"""
Setting up logging
"""
# create a logger for the root level: INFO:root
logger = logging.getLogger()
logger.setLevel(level=logging.INFO)

# create a logger for newspleas: INFO:newsplease
pipeline_logger = logging.getLogger('newsplease')
pipeline_logger.setLevel(logging.WARNING)


def read_urls_from_file(filepath):
    with open(filepath) as f:
        urls = [url.strip() for url in f.readlines()]  # remove '\n' that gets appended by `readlines()`
    return urls


def process_article(url):
    """Processes a single news article from the given URL.
    Crawls the article to retrieve its text and published date, computes its fingerprint, and saves it to the database.

    :param url: The URL of the news article to process.
    :return: A tuple containing the URL and a boolean
    indicating whether the article was successfully persisted to the database.
    """

    article = NewsPlease.from_url(url)
    if hasattr(article, 'language') and article.language == 'en':
        article_text, _ = crawl_url(url)
        fps = compute_fingerprint(article_text)
        only_shingle_values = [i['shingle_hash'] for i in fps]

        # verify if it has more than 2000 hashes
        if len(only_shingle_values) > 2000:
            return url, False

        # verify if it has any fingerprints
        if len(only_shingle_values) == 0:
            return url, False
        # try:
        newsdoc = NewsDocument(url=url, fingerprints=only_shingle_values)
        newsdoc.save()
        # except:
        #     logging.warning("encountered another error")
        return url, True

    elif hasattr(article, 'language'):
        logging.info('Article found, but it is not written in EN')
    return url, False


def process_urls(urls):
    """Processes a list of news article URLs.
    Calls process_article on each URL, and appends successfully persisted URLs to the articles list.

    :param urls: A list of news article URLs to process.
    :return: A tuple containing the number of URLs processed and the list of successfully persisted articles.
    """

    articles = []
    urls_seen = 0
    for url_id, url in enumerate(urls):
        logging.info(f'You are currently seeing URL_ID {url_id} being crawled.')
        urls_seen += 1
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(10)  # 10 seconds timeout
        try:
            url, persisted = process_article(url)
            signal.alarm(0)  # cancel the timeout
            if persisted:
                articles.append(url)
                logging.info(f'Article w/ URL: {url} appended')
        except TimeoutException:
            logging.warning(f'Timeout occurred while processing article: {url}')
        except Exception as e:
            logging.warning(f'Another error occured for: {url}, the error is %s', str(e))

    return urls_seen, articles


def main():
    """Reads news article URLs from a file, processes them, and saves them to the database.
    Outputs the number of URLs processed and the number of articles successfully persisted to the database.
    """

    start_time = time.time()
    urls = read_urls_from_file(persist_docs_path + '/' + 'preprocessed_unique_urls.txt')
    urls_seen, articles = process_urls(urls)
    end_time = time.time()
    duration = end_time - start_time
    logging.info(f'It took me {duration} seconds to process {urls_seen} articles')
    logging.info(f'There were {len(articles)} articles that were persisted in the DB')


if __name__ == '__main__':
    main()
