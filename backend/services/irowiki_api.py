import requests

BASE_URL = "https://irowiki.org/api/??"  # ajustar

def get_item_by_name(name: str) -> dict | None:
    """
    Retorna dados brutos do item pelo nome.  Troque pelo endpoint correto.
    """
    # Exemplo fictício
    resp = requests.get(f"{BASE_URL}/items", params={"search": name})
    if resp.ok:
        return resp.json()
    return None
