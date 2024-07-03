# 1. concatenate all the JSON in sketches/*.json into one file as a JSON array
jq -s '.' static/*.json > all_sketches.json

# 2. run the server
python -m http.server 8800