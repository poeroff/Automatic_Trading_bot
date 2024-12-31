import socket
import json
import pickle


def start_server(host='127.0.0.1', port=65432):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, port))
        s.listen()
        print(f"서버가 {host}:{port}에서 실행 중입니다.")
        
        while True:
            conn, addr = s.accept()
            with conn:
                print(f"클라이언트 {addr}가 연결되었습니다.")
                
                # 데이터 크기 수신
                data_size = int.from_bytes(conn.recv(4), byteorder='big')
                
                # 데이터 수신
                data = b''
                while len(data) < data_size:
                    chunk = conn.recv(min(data_size - len(data), 4096))
                    if not chunk:
                        raise RuntimeError("socket connection broken")
                    data += chunk
                
                # pickle로 역직렬화하여 DataFrame 복원
                df = pickle.loads(data)
                print("DataFrame을 수신했습니다:")
                print(df[0])  # DataFrame의 처음 몇 행 출력
                    

if __name__ == "__main__":
    start_server()
