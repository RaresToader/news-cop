def read_urls_from_file(file_path):
    """
    Reads URLs from a file located at the given file path.
    Removes leading and trailing spaces from each URL.
    Removes any URLs that do not start with 'https://'.

    Parameters:
    file_path (str): The path to the file containing URLs.

    Returns:
    list: A list of URLs contained in the file, with leading and trailing spaces removed and non-'https://' URLs removed.
    """

    with open(file_path) as f:
        urls = f.readlines()
    urls = [url.strip() for url in urls]  # Remove leading and trailing spaces
    urls = [url[2:] if url.startswith('""') else url for url in urls]
    urls = [url[:-2] if url.endswith('""') else url for url in urls]
    urls = [url for url in urls if url.startswith("https://")]
    return urls

def write_urls_to_file(urls, file_path):
    """
    Writes a list of URLs to a file located at the given file path.

    Parameters:
    urls (list): A list of URLs to be written to file.
    file_path (str): The path to the output file.

    Returns:
    None
    """

    with open(file_path, "w") as out:
        out.write('\n'.join(urls))

def main(input_file, output_file):
    """
    Reads URLs from an input file, processes them, and writes the result to an output file.

    Parameters:
    input_file (str): The path to the input file containing URLs.
    output_file (str): The path to the output file.

    Returns:
    None
    """

    urls = read_urls_from_file(input_file)
    write_urls_to_file(urls, output_file)


if __name__ == '__main__':
    input_file = 'unique_urls.txt'
    output_file = 'preprocessed_unique_urls.txt'

    main(input_file, output_file)
