import urllib.request
import json

url = "https://test.vcmerp.in/api/method/guesthouse.website_booking_api.search_rooms"
headers = {
    "Content-Type": "application/json",
    "Authorization": "token 2972bbd57a6566d:97026a90b23b2be"
}
data = {
    "property": "BRAJ-NIDHI-GUEST-HOUSE-VRN",
    "check_in_date": "2026-08-10",
    "check_out_date": "2026-08-11",
    "guests": 3,
    "rooms": 3,
    "booking_type": "Walk-In",
    "hold_type": "BN-BN-VCM Web Site-0001-0001"
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode("utf-8"))
except Exception as e:
    print(e.read().decode("utf-8"))
