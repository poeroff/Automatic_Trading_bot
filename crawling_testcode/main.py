# main.py
import json
from news_crawler import crawl_news_for_stock
from news_analyzer import analyze_news, summarize_articles

def main():
    # 사용자 입력 받기
    stock_code = input("분석할 주식 종목 코드를 입력하세요: ")
    
    # 뉴스 크롤링
    print(f"{stock_code} 관련 뉴스를 수집하는 중...")
    articles = crawl_news_for_stock(stock_code)
    print(f"총 {len(articles)}개의 기사를 수집했습니다.")
    
    # 기사 분석 및 필터링
    related_articles = analyze_news(articles, stock_code)
    print(f"관련성 있는 기사 {len(related_articles)}개를 찾았습니다.")
    
    # 요약 생성
    summarized_articles = []
    for article in related_articles:
        summary = summarize_articles(article)
        article["summary"] = summary["summary_output"]
        article["sentiment"] = "positive" if summary["is_positive"] else "negative"
        article["importance"] = summary["importance"]
        summarized_articles.append(article)
        
        print(f"\n기사: {article['title']}")
        print(f"중요도: {article['importance']}/5")
        print(f"감성: {article['sentiment']}")
        print(f"요약: {article['summary']}")
    
    # 결과 저장
    with open(f"{stock_code}_analysis.json", "w", encoding="utf-8") as f:
        json.dump(summarized_articles, f, ensure_ascii=False, indent=2)
    
    print(f"\n분석 결과가 {stock_code}_analysis.json 파일에 저장되었습니다.")

if __name__ == "__main__":
    main()