import os
import sys
import shutil
from collections import namedtuple
from dotenv import load_dotenv  # for loading environment variables from .env
from pathlib import Path
import requests  # for making HTTP requests
import base64  # for encoding the image to base64 necessary for the API
import mimetypes  # for guessing the mime type of the file needed for the API
import json
import tempfile

load_dotenv()  # take environment variables from .env.

TEMP_DIR = Path(tempfile.TemporaryDirectory().name)
OUTPUT_DIR = Path("static")

GPT4o_output = namedtuple(
    "GPT4o_output",
    [
        "stylistic_words",
        "title",
        "file_name",
        "description",
        "differences",
        "insights",
        "keywords",
    ],
)


def send_to_gpt4o(mime_type, base64_image) -> GPT4o_output:
    # Prepare the request headers and payload
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
    }

    msg = """
INPUT: Analyze the sketch and memorize the graph representation.
Return a JSON with the following information:
{
    "stylistic_words": <Keywords to describe this sketch>,
    "title": <Title of the sketch>,
    "file_name": <Name of the file>,
    "description": <Succinct but correct descriptions of the sketch>,
    "differences": <Contrast the subtle differences between a world view as interpreted in this sketch versus today's reality>,
    "insights": [Provide a list of insights that are not immediately obvious from the sketch representation],
    "keywords": [List technical tags to describe the sketch. Use tags that might be used in  research publication like IEEE, Science, Nature in technology. Pick the 5 that are most relevant to this sketch],
}
    """

    payload = {
        "model": "gpt-4o",
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": "Write in the style of an expert technical publication: no filler words, to the point, succinct, summarized and correct. Assume a high technical literacy but not domain-specific knowledge.",
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": msg},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{base64_image}"},
                    },
                ],
            },
        ],
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )
    return response.json()


def prep_for_openai(file_path):
    # convert the svg to png.
    # this is the default expected format, however, don't block as long as the file is an image
    if file_path.suffix == ".svg":
        file_path = svg_to_png(file_path)

    # encode the valid image to base64
    base64_image = encode_image(file_path)
    return file_path, base64_image


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def get_mime_type(image_path):
    return mimetypes.guess_type(image_path)[0]


def svg_to_png(svg_path, format="png"):
    # using librsvg
    target_path = svg_path.with_suffix(f".{format}")
    os.system(
        f"rsvg-convert --zoom 1 --format {format} --keep-aspect-ratio {svg_path} > {target_path}"
    )
    return target_path


def process(svg_file_path):
    # read the input file and convert it for openai
    mime_type = get_mime_type(svg_file_path)
    if not mime_type.startswith("image"):
        print(f"File {svg_file_path} is not an image.")
        sys.exit(1)

    # prepare the image for openai
    image_path, base64_image = prep_for_openai(svg_file_path)
    # call the openai api with
    resp = send_to_gpt4o(mime_type, base64_image)
    response = GPT4o_output(
        **json.loads(resp["choices"][0]["message"]["content"])
    )._asdict()
    response["files"] = {
        "svg": str(svg_file_path.name),
        "png": str(image_path.name),
        "source_mime_type": mime_type,
    }

    # write the response to a json file
    with open(svg_file_path.with_suffix(".json"), "w") as f:
        json.dump(response, f, indent=4)


if __name__ == "__main__":
    svg_file_path = Path(sys.argv[1]).resolve()
    if not svg_file_path.exists():
        print(f"File {svg_file_path} does not exist.")
        sys.exit(1)

    # copy the source svg to the OUTPUT_DIR and process it
    shutil.copyfile(svg_file_path, OUTPUT_DIR / svg_file_path.name)
    svg_file_path = OUTPUT_DIR / svg_file_path.name
    process(svg_file_path)
