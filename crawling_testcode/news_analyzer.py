#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
주식 뉴스 분석 모듈
"""

import re

# 긍정/부정 키워드 정의
POSITIVE_KEYWORDS = [
    "상승", "급등", "증가", "성장", "호재", "개발 성공", "매출 증가", "실적 호조", 
    "수익 증가", "계약 체결", "투자 확대", "새로운 기술", "시장 확대", "수주", 
    "1위", "최대", "기록", "돌파", "혁신", "선도", "출시", "성공적"
]

NEGATIVE_KEYWORDS = [
    "하락", "급락", "감소", "위기", "악재", "실패", "매출 감소", "실적 부진", 
    "수익 감소", "계약 해지", "투자 축소", "기술 유출", "시장 축소", "적자", 
    "손실", "최저", "부진", "경쟁 심화", "규제", "소송", "리콜", "불확실성"
]

def analyze_news(articles, stock_name):
    """
    뉴스 기사를 분석하여 해당 주식과 관련성이 높은 기사만 필터링합니다.
    
    Args:
        articles (list): 뉴스 기사 리스트
        stock_name (str): 주식 종목명
        
    Returns:
        list: 관련성이 높은 기사 리스트
    """
    print(f"{len(articles)}개 기사에 대한 관련성 분석 시작")
    related_articles = []
    
    # 종목명 변형 (예: "삼성전자"에서 "삼성"만 추출)
    company_name = stock_name
    if len(company_name) > 2:
        company_short = company_name[:2]  # 회사명의 앞 2글자만 추출
    else:
        company_short = company_name
    
    for article in articles:
        title = article["title"]
        content = article["content"]
        
        # 관련성 점수 계산
        relevance_score = 0
        
        # 제목에 정확한 종목명이 있으면 높은 점수
        if stock_name in title:
            relevance_score += 5
            print(f"제목에 종목명 발견: '{title}' (점수 +5)")
        
        # 제목에 회사명 일부가 있으면 중간 점수
        elif company_short in title and len(company_short) > 1:
            relevance_score += 3
            print(f"제목에 회사명 일부 발견: '{title}' (점수 +3)")
        
        # 내용에 종목명이 여러 번 등장하면 점수 추가
        stock_name_count = content.count(stock_name)
        if stock_name_count > 0:
            add_score = min(stock_name_count, 5)  # 최대 5점까지만 추가
            relevance_score += add_score
            print(f"내용에 종목명 {stock_name_count}회 발견 (점수 +{add_score})")
        
        # 관련성 분류
        if relevance_score >= 5:
            article["relevance"] = "high"
            article["relevance_score"] = relevance_score
            related_articles.append(article)
            print(f"고관련성 기사로 분류: '{title}' (점수: {relevance_score})")
        elif relevance_score >= 3:
            article["relevance"] = "medium"
            article["relevance_score"] = relevance_score
            related_articles.append(article)
            print(f"중관련성 기사로 분류: '{title}' (점수: {relevance_score})")
    
    print(f"관련성 분석 완료: {len(related_articles)}/{len(articles)}개 기사가 관련성 있음")
    return related_articles

def find_related_stocks(text):
    """
    텍스트에서 언급된 다른 주식 종목들을 찾습니다.
    """
    # 주요 상장사 리스트 (실제로는 더 많은 종목을 포함시켜야 함)
    major_stocks = [
        "삼성전자", "SK하이닉스", "LG화학", "현대차", "카카오", "네이버", 
        "셀트리온", "삼성바이오로직스", "POSCO", "KB금융", "신한지주"
    ]
    
    mentioned_stocks = []
    for stock in major_stocks:
        if stock in text:
            mentioned_stocks.append(stock)
    
    return mentioned_stocks

def extract_keywords(text, count=5):
    """
    텍스트에서 주요 키워드를 추출합니다.
    (간단한 구현을 위해 빈도수 기반으로 처리)
    """
    # 한글 단어만 추출 (2글자 이상)
    words = re.findall(r'[가-힣]{2,}', text)
    
    # 불용어 제거
    stopwords = ["있다", "이다", "된다", "한다", "그리고", "하지만", "또한", "그런", "이런"]
    filtered_words = [w for w in words if w not in stopwords]
    
    # 빈도수 계산
    word_count = {}
    for word in filtered_words:
        if word in word_count:
            word_count[word] += 1
        else:
            word_count[word] = 1
    
    # 빈도수 기준으로 정렬하여 상위 키워드 반환
    sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    keywords = [word for word, _ in sorted_words[:count]]
    
    return keywords

def summarize_articles(article):
    """
    기사를 요약하고 감성 분석을 수행합니다.
    
    Args:
        article (dict): 기사 정보
        
    Returns:
        dict: 요약 및 감성 분석 결과
    """
    title = article["title"]
    content = article["content"]
    
    # 간단한 요약 (첫 몇 문장 사용)
    sentences = re.split(r'(?<=[.!?])\s+', content)
    summary_length = min(3, len(sentences))  # 최대 3문장
    summary = ' '.join(sentences[:summary_length])
    
    # 감성 분석
    positive_count = sum(1 for keyword in POSITIVE_KEYWORDS if keyword in content)
    negative_count = sum(1 for keyword in NEGATIVE_KEYWORDS if keyword in content)
    
    is_positive = positive_count > negative_count
    
    # 중요도 계산
    importance = 3  # 기본값
    
    # 제목에 중요 키워드가 있으면 중요도 상승
    if any(keyword in title for keyword in ["단독", "속보", "긴급", "특종"]):
        importance += 1
    
    # 내용에 중요 키워드가 많으면 중요도 상승
    keyword_importance = max(positive_count, negative_count)
    if keyword_importance > 5:
        importance += 1
    
    # 관련성 점수가 높으면 중요도 상승
    relevance_score = article.get("relevance_score", 0)
    if relevance_score > 8:
        importance += 1
    
    # 중요도 범위 제한
    importance = max(1, min(5, importance))
    
    # 관련 종목 찾기
    related_stocks = find_related_stocks(content)
    
    # 키워드 추출
    keywords = extract_keywords(content)
    
    print(f"기사 '{title}' 분석 결과:")
    print(f"  - 긍정 키워드: {positive_count}개, 부정 키워드: {negative_count}개")
    print(f"  - 감성: {'긍정' if is_positive else '부정'}")
    print(f"  - 중요도: {importance}/5")
    print(f"  - 키워드: {', '.join(keywords)}")
    
    return {
        "summary_output": summary,
        "is_positive": is_positive,
        "importance": importance,
        "related_stocks": related_stocks,
        "keywords": keywords
    }