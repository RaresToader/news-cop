import datetime
from unittest.mock import patch, MagicMock

from utils import schema, conn, existing_fps
import http.client
import json
import unittest

from django.test import Client, tag
from django.urls import resolve, reverse
from rest_framework import status

from app.views import compare_texts_view
from app.views import persist_url_view
from app.views import try_view
from app.views import reqex_view
from app.views import url_similarity_checker
from utils import statistics

from app.plagiarism_checker.fingerprinting import compute_fingerprint
from app.response_statistics import ResponseStatistics

from base_test import BaseTest


class UrlsTest(BaseTest):

    def setUp(self):
        self.reset_database()
        self.copy_statistics = ResponseStatistics(statistics.users, statistics.performed_queries,
                                                  statistics.stored_articles, statistics.similarities_retrieved)

    def tearDown(self):
        self.reset_database()
        statistics.set_values(self.copy_statistics)

    @tag("unit")
    def test_compare_texts(self):
        obtained_url = reverse('compare_texts')
        expected_url = '/compareTexts/'

        obtained_view_function = resolve(obtained_url).func
        expected_view_function = compare_texts_view

        self.assertEquals(obtained_url, expected_url)
        self.assertEquals(obtained_view_function, expected_view_function)

    @tag("integration")
    def test_compare_texts_get_instead_of_post(self):
        client = Client()
        obtained_url = reverse('compare_texts')
        response = client.get(obtained_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("integration")
    def test_compare_texts_post(self):
        data = {
            'original_text': 'A do run run run run, a do run run',
            'compare_text': 'run run run run',
        }

        expected_similarity = 1 / 3
        json_data = json.dumps(data)
        obtained_url = reverse('compare_texts')
        client = Client()
        response = client.post(obtained_url, data=json_data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), str(expected_similarity))

    @tag("unit")
    def test_persist_url_pattern_1(self):
        obtained_url = reverse('persist_url')
        expected_url = '/persistURL/'

        obtained_view_function = resolve(obtained_url).func
        expected_view_function = persist_url_view

        self.assertEquals(obtained_url, expected_url)
        self.assertEquals(obtained_view_function, expected_view_function)

    @tag("integration")
    def test_persist_url_pattern_post(self):
        data = {
            'key': 'https://www.bbc.com/news/entertainment-arts-65488861',
        }

        expected_persisted_url = 'https://www.bbc.com/news/entertainment-arts-65488861'

        json_data = json.dumps(data)
        obtained_url = reverse('persist_url')
        client = Client()

        response = client.post(obtained_url, data=json_data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), expected_persisted_url)

    @tag("integration")
    def test_persist_url_pattern_get_instead_of_post(self):
        client = Client()
        obtained_url = reverse('persist_url')
        response = client.get(obtained_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("unit")
    def test_try_path_variable(self):
        obtained_url = reverse('try', kwargs={'url': 'www.google.com'})
        expected_url = '/try/www.google.com/'

        obtained_view_function = resolve(obtained_url).func
        expected_view_function = try_view

        self.assertEquals(obtained_url, expected_url)
        self.assertEquals(obtained_view_function, expected_view_function)

    @tag("integration")
    def test_try_pattern_get(self):
        url = 'www.google.com'
        expected = "You entered " + url
        client = Client()
        obtained_url = reverse('try', kwargs={'url': url})
        response = client.get(obtained_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), expected)

    @tag("integration")
    def test_try_pattern_post(self):
        url = 'www.google.com'
        client = Client()
        obtained_url = reverse('try', kwargs={'url': url})
        response = client.post(obtained_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Endpoint called with something different than GET")

    @tag("unit")
    def test_reqex_req_body_unit(self):
        obtained_url = reverse('reqex')
        expected_url = '/reqex/'

        obtained_view_function = resolve(obtained_url).func
        expected_view_function = reqex_view

        self.assertEquals(obtained_url, expected_url)
        self.assertEquals(obtained_view_function, expected_view_function)

    @tag("integration")
    def test_reqex_req_body_pattern_get(self):
        client = Client()
        obtained_url = reverse('reqex')
        response = client.get(obtained_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Invalid request method")

    @tag("integration")
    def test_reqex_req_body_pattern_post_good(self):
        data = {
            'key': 'www.google.com',
        }
        json_data = json.dumps(data)
        client = Client()
        obtained_url = reverse('reqex')
        response = client.post(obtained_url, data=json_data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), ("Example response " + 'www.google.com'))

    @tag("integration")
    def test_reqex_req_body_pattern_post_bad(self):
        data = {
            'key': 'www.google.com',
        }
        client = Client()
        obtained_url = reverse('reqex')
        response = client.post(obtained_url, data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Invalid JSON data")

    @tag("unit")
    def test_check_url_pattern_1(self):
        obtained_url = reverse('url_similarity_checker')
        expected_url = '/urlsimilarity/'

        obtained_view_function = resolve(obtained_url).func
        expected_view_function = url_similarity_checker

        self.assertEquals(obtained_url, expected_url)
        self.assertEquals(obtained_view_function, expected_view_function)

    @tag("integration")
    def test_check_url_pattern_post_bad(self):
        the_url = 'https://www.bbc.com/news/uk-65609209'
        obtained_url = reverse('url_similarity_checker')
        client = Client()
        response = client.get(obtained_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), 'Expected POST, but got GET instead')

    @tag("integration")
    def test_check_url_pattern_post_success(self):
        data = {
            'key': 'https://www.bbc.com/news/uk-65609209',
        }

        json_data = json.dumps(data)
        client = Client()
        obtained_url = reverse('url_similarity_checker')
        response = client.post(obtained_url, data=json_data, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
