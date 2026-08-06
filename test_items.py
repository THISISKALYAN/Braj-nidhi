import urllib.request
import urllib.parse
import json

url = "https://test.vcmerp.in/api/resource/Hotel Room Type"
headers = {
    "Authorization": "token 2972bbd57a6566d:97026a90b23b2be"
}

req = urllib.request.Request(url, headers=headers)
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode("utf-8"))
except Exception as e:
    print(e.read().decode("utf-8"))
