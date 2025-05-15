import requests

url = 'https://www.goldapi.io/api/XAU/USD'
headers = {
    'x-access-token': 'goldapi-j7wasma85rvro-io',
    'Content-Type': 'application/json'
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print(f"현재 금값: ${data} (USD per ounce)")
else:
    print(f"API 호출 실패. 상태 코드: {response.status_code}")
    print(response.text)