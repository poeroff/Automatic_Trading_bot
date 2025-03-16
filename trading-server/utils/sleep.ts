//sleep(숫자)를 입력하면 그 시간만큼 시간을 쉰다.(1초 = 1000)
export function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }