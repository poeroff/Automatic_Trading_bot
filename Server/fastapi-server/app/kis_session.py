import requests
import ssl
import time
import logging
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager

logger = logging.getLogger(__name__)

class SSLAdapter(HTTPAdapter):
    """SSL/TLS 설정을 커스터마이징한 HTTP 어댑터"""
    def init_poolmanager(self, *args, **kwargs):
        kwargs['ssl_version'] = ssl.PROTOCOL_TLS
        return super().init_poolmanager(*args, **kwargs)

class KISSession:
    """한국투자증권 API 전용 세션 관리 클래스"""
    _instance = None
    _session = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._session is None:
            self._create_session()
    
    def _create_session(self):
        """안정적인 세션 생성"""
        self._session = requests.Session()
        
        # SSL 어댑터 설정
        adapter = SSLAdapter()
        
        # 재시도 전략 설정
        retry_strategy = Retry(
            total=3,  # 총 재시도 횟수
            backoff_factor=1,  # 재시도 간 대기 시간 배수
            status_forcelist=[429, 500, 502, 503, 504],  # 재시도할 HTTP 상태 코드
            allowed_methods=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE", "POST"]
        )
        
        adapter.max_retries = retry_strategy
        
        # 연결 풀 설정
        adapter.pool_connections = 10
        adapter.pool_maxsize = 10
        
        self._session.mount("https://", adapter)
        self._session.mount("http://", adapter)
        
        # 기본 헤더 설정
        self._session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # SSL 검증 비활성화 (한국투자증권 API 특성상 필요)
        self._session.verify = False
        
        logger.info("KIS API 세션 생성 완료")
    
    def get(self, url, **kwargs):
        """GET 요청 with 재시도 로직"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self._session.get(url, timeout=10, **kwargs)
                time.sleep(0.3)  # API 호출 후 대기
                return response
            except requests.exceptions.SSLError as e:
                logger.warning(f"SSL 에러 발생 (시도 {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # 지수 백오프
                    self._reset_session()
                else:
                    raise
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"연결 에러 발생 (시도 {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    self._reset_session()
                else:
                    raise
            except Exception as e:
                logger.error(f"예상치 못한 에러: {e}")
                raise
    
    def post(self, url, **kwargs):
        """POST 요청 with 재시도 로직"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self._session.post(url, timeout=10, **kwargs)
                time.sleep(0.3)  # API 호출 후 대기
                return response
            except requests.exceptions.SSLError as e:
                logger.warning(f"SSL 에러 발생 (시도 {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    self._reset_session()
                else:
                    raise
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"연결 에러 발생 (시도 {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    self._reset_session()
                else:
                    raise
            except Exception as e:
                logger.error(f"예상치 못한 에러: {e}")
                raise
    
    def _reset_session(self):
        """세션 재생성"""
        logger.info("세션 재생성 중...")
        if self._session:
            self._session.close()
        self._create_session()
    
    def close(self):
        """세션 종료"""
        if self._session:
            self._session.close()
            logger.info("KIS API 세션 종료")

# 싱글톤 인스턴스
kis_session = KISSession()