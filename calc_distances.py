import urllib.request, urllib.parse, json, time

def geocode(query):
    url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={'User-Agent': 'BrajNidhiApp/1.0'})
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode())
            if data:
                return {'lat': data[0]['lat'], 'lon': data[0]['lon']}
    except Exception as e:
        pass
    return None

def get_distance(origin, dest):
    if not origin or not dest: return None
    url = f'http://router.project-osrm.org/route/v1/driving/{origin["lon"]},{origin["lat"]};{dest["lon"]},{dest["lat"]}?overview=false'
    try:
        with urllib.request.urlopen(url) as res:
            data = json.loads(res.read().decode())
            if data.get('routes'):
                return round(data['routes'][0]['distance'] / 1000.0, 1)
    except Exception as e:
        pass
    return None

origin_query = 'Vrindavan Chandrodaya Mandir, Vrindavan, India'
origin = geocode(origin_query)
if not origin:
    origin_query = 'Prem Mandir, Vrindavan, India'
    origin = geocode(origin_query)

print('Origin:', origin_query, origin)

places = [
    'Radha Vallabh Temple, Vrindavan',
    'Prem Mandir, Vrindavan',
    'Keshi Ghat, Vrindavan',
    'Nidhivan, Vrindavan',
    'Radha Raman Temple, Vrindavan',
    'Neem Karoli Baba Ashram, Vrindavan',
    'Raman Reti, Gokul, India',
    'Nand Bhavan, Nandgaon, India',
    'Vishram Ghat, Mathura, India',
    'Banke Bihari Temple, Vrindavan'
]

for place in places:
    dest = geocode(place)
    dist = get_distance(origin, dest)
    print(f'{place}: {dist} km')
    time.sleep(1.5)
