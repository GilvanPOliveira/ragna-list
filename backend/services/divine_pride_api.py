import os, requests
from config import Config

BASE_URL = "https://www.divine-pride.net/api/database"

def get_item(item_id: int):
    url = f"{BASE_URL}/item/{item_id}"
    params = {"apiKey": Config.DIVINE_PRIDE_API_KEY}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()
