# Used to convert complex data to native Python data types, 
# which will be then rendered to JSON that will be used on client-side (by React) 
from rest_framework_mongoengine.serializers import DocumentSerializer, EmbeddedDocumentSerializer
from .models import *

class ReactSerializer(DocumentSerializer):
    class Meta:
        model = React
        fields = ['url', 'published_date']


class NewsDocumentSerializer(DocumentSerializer):
    class Meta:
        model = NewsDocument
        fields = ['url', 'published_date', 'fingerprints']
        depth = 2


class FingerprintSerializer(EmbeddedDocumentSerializer):
    class Meta:
        model = Fingerprint
        fields = ['shingle_hash', 'shingle_pos']
