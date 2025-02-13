import { atom } from "recoil";

interface CustomUser {
    name: string;
    email: string;
    image: string;
    id: string;
    author: string;
    accessToken: string;
  }
  
  interface CustomSession {
    user: CustomUser;
  }

export const SessionName = atom<string | null>({
    key: "SessionName",
    default: null, // 초기값은 null
});

export const SessionEmail = atom<string | null>({
    key: "SessionEmail",
    default: null, // 초기값은 null
});

export const SessionAuthor = atom<string | null>({
    key: "SessionAuthor",
    default: null, // 초기값은 null
});