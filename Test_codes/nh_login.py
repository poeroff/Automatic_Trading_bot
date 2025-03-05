import requests

# # API 엔드포인트
# url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP"

# # 요청 헤더
# headers = {
#     "Content-Type": "application/json; charset=UTF-8"
# }

# # 요청 바디
# data = {
#     "grant_type": "client_credentials",
#     "appkey": "PSqNXbaCGR3m6pI4Pe5UUckJXJqCAVMb5h2c",  # 본인의 AppKey로 변경
#     "appsecret": "lIs9MYDhG3pONv202A7BeeSz2jwCpvPO/HxnJwzneLxYlPJTqjb+5nTYzmhyZ45sv6LwIXKx9TidcKQ0Hwvsy81cZ6Q9RQp4bFgTLGmVcIEvXCBHjNuVjMgVBTf6DYZ2I0wuaWgKkCgKRy4f29ZLNVFwSU7x36kCDKJkcplk+ET8srLWPBA="  # 본인의 AppSecret으로 변경
# }

# # POST 요청 보내기
# response = requests.post(url, json=data, headers=headers)

# # 응답 확인
# if response.status_code == 200:
#     print(response.json())  # JSON 응답 출력
# else:
#     print(f"Error {response.status_code}: {response.text}")





# # API 엔드포인트
# url = "https://openapi.koreainvestment.com:9443/oauth2/revokeP"

# # 요청 헤더
# headers = {
#     "Content-Type": "application/json; charset=UTF-8"
# }

# # 요청 바디
# data = {
#   "appkey" : "PSqNXbaCGR3m6pI4Pe5UUckJXJqCAVMb5h2c",
#   "appsecret" : "lIs9MYDhG3pONv202A7BeeSz2jwCpvPO/HxnJwzneLxYlPJTqjb+5nTYzmhyZ45sv6LwIXKx9TidcKQ0Hwvsy81cZ6Q9RQp4bFgTLGmVcIEvXCBHjNuVjMgVBTf6DYZ2I0wuaWgKkCgKRy4f29ZLNVFwSU7x36kCDKJkcplk+ET8srLWPBA=",
#   "token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6Ijc2YWYxZmFlLTllNjYtNGI2Ni1iODU0LWEzMzQ5YTkwM2RkYSIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTc0MDA0NzkzOCwiaWF0IjoxNzM5OTYxNTM4LCJqdGkiOiJQU3FOWGJhQ0dSM202cEk0UGU1VVVja0pYSnFDQVZNYjVoMmMifQ.ePK0lPnyHuT4CWXqGB3-zLSzFI8-JvbZSq594OJwgvUuiRmm8_1efd3ra8V4DA7bGTWIiB2jSrCgfwSQJA1JQg"
# }

# # POST 요청 보내기
# response = requests.post(url, json=data, headers=headers)

# # 응답 확인
# if response.status_code == 200:
#     print(response.json())  # JSON 응답 출력
# else:
#     print(f"Error {response.status_code}: {response.text}")



# API 엔드포인트
url = "https://openapi.koreainvestment.com:9443/uapi/hashkey"

# 요청 헤더
headers = {
    "Content-Type": "application/json; charset=UTF-8",
    "appkey" : "PSqNXbaCGR3m6pI4Pe5UUckJXJqCAVMb5h2c",
    "appsecret" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6Ijc2YWYxZmFlLTllNjYtNGI2Ni1iODU0LWEzMzQ5YTkwM2RkYSIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTc0MDA0NzkzOCwiaWF0IjoxNzM5OTYxNTM4LCJqdGkiOiJQU3FOWGJhQ0dSM202cEk0UGU1VVVja0pYSnFDQVZNYjVoMmMifQ.ePK0lPnyHuT4CWXqGB3-zLSzFI8-JvbZSq594OJwgvUuiRmm8_1efd3ra8V4DA7bGTWIiB2jSrCgfwSQJA1JQg"

}

# 요청 바디
data = {
    "ORD_PRCS_DVSN_CD": "02",
    "CANO": "계좌번호",
    "ACNT_PRDT_CD": "03",
    "SLL_BUY_DVSN_CD": "02",
    "SHTN_PDNO": "101S06",
    "ORD_QTY": "1",
    "UNIT_PRICE": "370",
    "NMPR_TYPE_CD": "",
    "KRX_NMPR_CNDT_CD": "",
    "CTAC_TLNO": "",
    "FUOP_ITEM_DVSN_CD": "",
    "ORD_DVSN_CD": "02"
}

# POST 요청 보내기
response = requests.post(url, json=data, headers=headers)

# 응답 확인
if response.status_code == 200:
    print(response.json())  # JSON 응답 출력
else:
    print(f"Error {response.status_code}: {response.text}")

