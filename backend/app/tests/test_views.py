import json
from unittest.mock import patch

from django.test import TestCase, RequestFactory
from django.http import HttpResponse, HttpResponseBadRequest
from rest_framework import status

from app.views import compare_texts_view
from app.views import persist_url_view
from app.views import try_view
from app.views import reqex_view
from app.views import compare_URLs

from utils import db
import sys


class TestPersistUrlView(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_post_request_compare_texts(self):

        # create the request body
        data = {
            'original_text': 'A do run run run, a do run run',
            'compare_text': 'run run',
        }

        json_data = json.dumps(data)
        request = self.factory.post("/compareTexts/", data=json_data, content_type='application/json')

        response = compare_texts_view(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), str(1 / 3))

    def test_post_request_with_valid_url_no_text(self):
        url = 'https://www.vlad.com'
        # clear database
        db.nd_collection.delete_one({'_id': url})

        # create the request body
        data = {
            'key': url,
        }
        json_data = json.dumps(data)
        request = self.factory.post("/persistURL/", data=json_data, content_type='application/json')

        response = persist_url_view(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), url)

        res = db.nd_collection.delete_one({'_id': url})
        self.assertEqual(res.deleted_count, 1)

    def test_post_request_with_valid_url_text(self):
        url = 'https://www.bbc.com/news/entertainment-arts-65488861'

        # clear database
        db.nd_collection.delete_one({'_id': url})

        # create the request body
        data = {
            'key': url,
        }
        json_data = json.dumps(data)
        request = self.factory.post("/persistURL/", data=json_data, content_type='application/json')

        response = persist_url_view(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), url)

        res = db.nd_collection.delete_one({'_id': url})
        self.assertEqual(res.deleted_count, 1)

    def test_post_request_with_invalid_url(self):
        url = 'https://www.dianamicloiu.com'
        # clear database
        db.nd_collection.delete_one({'_id': url})

        # create the request body
        data = {
            'key': url,
        }
        json_data = json.dumps(data)
        request = self.factory.post("/persistURL/", data=json_data, content_type='application/json')

        response = persist_url_view(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "The url provided is invalid")

    def test_post_request_with_invalid_method(self):
        request = self.factory.get("/persistURL/")
        response = persist_url_view(request)

        self.assertIsInstance(response, HttpResponseBadRequest)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Expected POST, but got GET instead")


class TestTryView(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_get_request_with_valid_url(self):
        url = "www.google.com"
        request = self.factory.get(f"/try/{url}")
        response = try_view(request, url)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), "You entered " + url)

    def test_post_request_with_valid_url(self):
        url = "www.google.com"
        request = self.factory.put(f"/try/{url}")
        response = try_view(request, url)

        self.assertIsInstance(response, HttpResponseBadRequest)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Endpoint called with something different than GET")


class TestReqExView(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_post_request_with_valid_url(self):
        data = {
            'key': 'www.google.com',
        }
        json_data = json.dumps(data)
        request = self.factory.post("/reqex/", data=json_data, content_type='application/json')
        response = reqex_view(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), "Example response " + 'www.google.com')

    def test_get_request_with_valid_url(self):
        data = {
            'key': 'www.google.com',
        }
        json_data = json.dumps(data)
        request = self.factory.put("/reqex/", data=json_data, content_type='application/json')
        response = reqex_view(request)

        self.assertIsInstance(response, HttpResponseBadRequest)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Invalid request method")

    def test_post_request_with_invalid_data(self):
        data = {
            'key': 'www.google.com',
        }
        request = self.factory.post("/reqex/", data=data)
        response = reqex_view(request)

        self.assertIsInstance(response, HttpResponseBadRequest)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Invalid JSON data")

class TestDatabase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    # test database
    def test_check_database_indexing(self):
        url = 'www.matiboss157.com'

        # make sure the url is not already in the database -> clean up
        db.nd_collection.delete_one({'_id': url})

        # add it
        db.nd_collection.insert_one({'_id': 'www.matiboss157.com', 'published_date': '2023-05-09 01:00:00',
                                     'fingerprints': [{'shingle_hash': {'$numberInt': '3'}}]})

        self.assertTrue(sys.getsizeof(db.nd_collection.find({'fingerprints.shingle_hash': 3})) > 0)

        # final clean up
        db.nd_collection.delete_one({'_id': url})


class TestCompareURLs(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    def test_same_url(self):
        url = 'https://getbootstrap.com/docs/5.0/forms/layout/'

        # create the request body
        data = {
            'url_left': url,
            'url_right': url
        }

        json_data = json.dumps(data)
        request = self.factory.post("/compareURLs/", data=json_data, content_type='application/json')

        response = compare_URLs(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode(), '1.0')

    def test_different_urls_valid(self):
        url_left = 'https://getbootstrap.com/docs/5.0/forms/layout/'
        url_right = 'https://getbootstrap.com/docs/5.0/forms/validation/'

        # create the request body
        data = {
            'url_left': url_left,
            'url_right': url_right
        }

        json_data = json.dumps(data)
        request = self.factory.post("/compareURLs/", data=json_data, content_type='application/json')

        response = compare_URLs(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_left_invalid(self):
        url_left = 'https://dianamicloiu.com/'
        url_right = 'https://getbootstrap.com/docs/5.0/forms/validation/'

        # create the request body
        data = {
            'url_left': url_left,
            'url_right': url_right
        }

        json_data = json.dumps(data)
        request = self.factory.post("/compareURLs/", data=json_data, content_type='application/json')

        response = compare_URLs(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), 'The original url provided is invalid.')

    def test_right_invalid(self):
        url_left = 'https://getbootstrap.com/docs/5.0/forms/validation/'
        url_right = 'https://dianamicloiu.com/'

        # create the request body
        data = {
            'url_left': url_left,
            'url_right': url_right
        }

        json_data = json.dumps(data)
        request = self.factory.post("/compareURLs/", data=json_data, content_type='application/json')

        response = compare_URLs(request)

        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), 'The changed url provided is invalid.')

    def test_invalid_request(self):
        request = self.factory.get("/compareURLs/")
        response = compare_URLs(request)

        self.assertIsInstance(response, HttpResponseBadRequest)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.content.decode(), "Expected POST, but got GET instead")
