import { atom } from "recoil";

export const loadingState = atom<boolean>({
  key: "loadingState", // ✅ key는 중복되지 않아야 합니다.
  default: false,      // ✅ 기본값 설정
});
