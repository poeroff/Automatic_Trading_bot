#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
주식 뉴스 크롤러 모듈
"""

import time
from datetime import datetime, timedelta
from urllib.parse import quote
import requests
from bs4 import BeautifulSoup
import json
from trafilatura import extract, fetch_url
from trafilatura.settings import DEFAULT_CONFIG
from copy import deepcopy

# Trafilatura 설정
TRAFILATURA_CONFIG = deepcopy(DEFAULT_CONFIG)
TRAFILATURA_CONFIG["DEFAULT"]["DOWNLOAD_TIMEOUT"] = "5"
TRAFILATURA_CONFIG["DEFAULT"]["MAX_REDIRECTS"] = "0"
TRAFILATURA_CONFIG["DEFAULT"]["MIN_OUTPUT_SIZE"] = "50"

def get_article_body(url):
    """
    URL에서 기사 본문을 추출합니다.
    """
    try:
        downloaded = fetch_url(url, config=TRAFILATURA_CONFIG)
        extracted_news_content = extract(
            downloaded,
            output_format="json",
            include_tables=False,
            with_metadata=True,
            deduplicate=True,
            config=TRAFILATURA_CONFIG,
        )
        if not extracted_news_content:
            return None
        return json.loads(extracted_news_content)
    except Exception as e:
        print(f"기사 내용 추출 중 오류 발생: {url}, {str(e)}")
        return None

def crawl_news_for_stock(stock_name, days=7):
    """
    특정 주식 종목에 대한 뉴스 기사를 크롤링합니다.
    
    Args:
        stock_name (str): 주식 종목명
        days (int): 몇 일 전까지의 뉴스를 가져올지 설정
        
    Returns:
        list: 뉴스 기사 리스트
    """
    articles = []
    encoded_query = quote(stock_name)
    
    # 날짜 범위 설정
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    date_str_start = start_date.strftime("%Y%m%d")
    date_str_end = end_date.strftime("%Y%m%d")
    
    print(f"{stock_name} 관련 뉴스를 {days}일 동안의 기간에 대해 크롤링합니다.")
    
    # 네이버 뉴스 검색 URL
    next_url = (
        "https://s.search.naver.com/p/newssearch/search.naver?"
        f"query={encoded_query}&sort=0related=0&"
        f"nso=so%3Ar%2Cp%3Afrom{date_str_start}to{date_str_end},a:all&where=news_tab_api"
    )
    
    crawled_urls = set()
    max_trials = 3
    page_count = 0
    
    while next_url != "" and page_count < 5:  # 최대 5페이지만 크롤링
        page_count += 1
        num_trials = 0
        success = False
        
        while not success and num_trials < max_trials:
            try:
                print(f"페이지 {page_count} 크롤링 중: {next_url}")
                request_result = requests.get(next_url)
                request_result = request_result.json()
                success = True
            except Exception as e:
                print(f"페이지 요청 실패: {str(e)}")
                num_trials += 1
                if num_trials >= max_trials:
                    print(f"최대 재시도 횟수에 도달했습니다. 페이지 {page_count} 크롤링을 건너뜁니다.")
                    break
                print(f"5초 후 재시도... (시도 {num_trials}/{max_trials})")
                time.sleep(5)
        
        if not success:
            break
            
        try:
            contents = BeautifulSoup(request_result["collection"][0]["html"], features="lxml")
            contents = contents.find_all("li", {"class": "bx"})
            next_url = request_result.get("url", "")
            
            # 각 기사 URL 추출
            for content in contents:
                title_tag = content.find("a", {"class": "news_tit"})
                if not title_tag:
                    continue
                    
                title = title_tag.text.strip()
                news_url = title_tag["href"]
                
                if news_url in crawled_urls:
                    continue
                
                crawled_urls.add(news_url)
                
                # 기사 날짜 추출
                date_tag = content.find("span", {"class": "info"})
                date = date_tag.text.strip() if date_tag else "날짜 정보 없음"
                
                # 언론사 추출
                press_tag = content.find("a", {"class": "press"})
                press = press_tag.text.strip() if press_tag else "언론사 정보 없음"
                
                print(f"기사 발견: {title} ({press}, {date})")
                
                # 기사 본문 추출
                article_body = get_article_body(news_url)
                if article_body:
                    article_data = {
                        "title": title,
                        "url": news_url,
                        "press": press,
                        "date": article_body.get("date", date),
                        "content": article_body.get("text", ""),
                    }
                    articles.append(article_data)
                    print(f"기사 추가됨: {title} (내용 길이: {len(article_data['content'])}자)")
                else:
                    print(f"기사 본문 추출 실패: {title}")
            
            # 너무 빠른 요청을 방지하기 위한 딜레이
            time.sleep(1)
            
        except Exception as e:
            print(f"페이지 처리 중 오류 발생: {str(e)}")
            break
    
    print(f"크롤링 완료: 총 {len(articles)}개의 기사를 수집했습니다.")
    return articles