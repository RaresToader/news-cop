from winnowing import winnow, sanitize, kgrams, select_min, winnowing_hash


def compute_fingerprint(article_text):
    '''
        Function for computing the fingerprint of a given article using winnowing.
        See the algorithm encapsulated by the winnow function provided in pip package
        at https://pypi.org/project/winnowing/
        The function also checks for possible empty text edge case
        :param article_text: the text of the document to compute the fingerprint for
        :return: empty list if the text provided is empty or list of fingerprints otherwise
        '''
    # verify if article text is empty => no text was crawled
    if article_text is None:
        return {}

    return [{"shingle_hash": element[1], "shingle_position": element[0]} for element in modified_winnow(article_text)]


# modify the winnowing algorithm to use N-Gram = 8 with window = 6
def modified_winnow(text, k=8):
    n = len(list(text))

    text = zip(range(n), text)
    text = sanitize(text)

    hashes = map(lambda x: winnowing_hash(x), kgrams(text, k))

    windows = kgrams(hashes, 6)

    return set(map(select_min, windows))


# modify the hash function used
def modified_hash(text):
    import hashlib

    hs = hashlib.sha1(text.encode("utf-8"))
    hs = hs.hexdigest()[-8:]
    hs = int(hs, 16)

    return hs


# change the winnowing hash_function to the new one created
winnow.hash_function = modified_hash
