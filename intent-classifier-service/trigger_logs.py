import requests

print(requests.post("http://localhost:8002/api/process", json={"query": "log test"}).json())
