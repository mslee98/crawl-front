# 인증 (로그인 · 회원가입) 가이드

로그인·회원가입·인증 컨텍스트 구조와 사용 방법을 정리한 문서입니다.

---

## 1. 개요

- **회원가입**: `POST /auth/signup` → 성공 시 로그인 페이지로 이동
- **로그인**: `POST /auth/login` → 성공 시 토큰·유저 정보를 **AuthContext**에 저장 후 대시보드로 이동
- **인증 상태**: AuthContext에서 전역 관리, `localStorage`에 저장해 새로고침 후에도 유지
- **로그아웃**: AuthContext의 `logout()` → 로컬 초기화 + `POST /auth/logout`으로 refreshToken 무효화

API 기본 주소는 `.env`의 `VITE_API_URL`로 설정 (비어 있으면 현재 도메인 기준).

---

## 2. 회원가입

### 2.1 API

| 항목 | 내용 |
|------|------|
| **URL** | `POST {API_BASE}/auth/signup` |
| **Header** | `Content-Type: application/json` |
| **Body** | `{ id, email, password, nickname }` (모두 필수, 평문 비밀번호) |

**요청 예시**

```json
{
  "id": "lms980321",
  "email": "lms980321@kakao.com",
  "password": "alstjd12",
  "nickname": "민성"
}
```

### 2.2 폼 (SignUpForm)

- **파일**: `src/components/auth/SignUpForm.tsx`
- **경로**: `/signup`

**입력 규칙**

| 필드 | 규칙 | 비고 |
|------|------|------|
| 아이디 | 영문·숫자·`_` 만, 2~100자 | `dataRuleCheckForID`로 입력 시 한 글자씩 검사, Caps Lock 안내 |
| 닉네임 | 필수, 공백만 아니면 됨 | 띄어쓰기 저장 불가 |
| 이메일 | 필수 | 띄어쓰기 저장 불가 |
| 비밀번호 | 8자 이상, 영문+숫자 포함 | 띄어쓰기 저장 불가 |
| 비밀번호 확인 | 비밀번호와 일치 | |
| 이용약관 | 체크 필수 | |

- 에러 메시지는 **blur(포커스 아웃) 후** 해당 필드에만 표시됩니다.
- 제출 시 유효하지 않으면 API 호출하지 않음. 성공 시 `/signin`으로 이동.

---

## 3. 로그인

### 3.1 API

| 항목 | 내용 |
|------|------|
| **URL** | `POST {API_BASE}/auth/login` |
| **Header** | `Content-Type: application/json` |
| **Body** | `{ id, password }` (평문) |

**성공 응답 예시**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "expiresIn": 900,
  "user": {
    "uuid": "7980dc76-89ff-44af-a070-f431ee675d7c",
    "id": "lms980321",
    "email": "lms980321@kakao.com",
    "nickname": "민성"
  }
}
```

### 3.2 폼 (SignInForm)

- **파일**: `src/components/auth/SignInForm.tsx`
- **경로**: `/signin`
- **동작**: 성공 시 `useAuth().login(응답 데이터)` 호출 → AuthContext에 저장 → `/`로 이동

---

## 4. 인증 컨텍스트 (AuthContext)

### 4.1 역할

- 로그인 상태(user, accessToken, refreshToken, expiresIn)를 **전역**으로 보관
- **localStorage**와 동기화해 새로고침 후에도 로그인 유지
- 로그아웃 시 `POST /auth/logout`으로 refreshToken 무효화

### 4.2 제공 값 (useAuth)

| 이름 | 타입 | 설명 |
|------|------|------|
| `user` | `AuthUser \| null` | uuid, id, email, nickname |
| `accessToken` | `string \| null` | API 호출 시 `Authorization: Bearer {accessToken}` 에 사용 |
| `isAuthenticated` | `boolean` | 로그인 여부 |
| `login` | `(data) => void` | 로그인 성공 시 호출 (SignInForm에서 사용) |
| `logout` | `() => Promise<void>` | 로그아웃 (상태 초기화 + 서버 무효화) |

### 4.3 사용 위치

- **설정**: `src/main.tsx`에서 앱 전체를 `<AuthProvider>`로 감쌈
- **로그인 폼**: `SignInForm`에서 `login()` 호출
- **헤더**: `UserDropdown`에서 `user`, `isAuthenticated`, `logout` 사용
- **사이드바**: `AppSidebar`에서 닉네임/로그인 링크 표시
- **프로필**: `UserMetaCard`에서 로그인 시 아바타·닉네임 표시

### 4.4 인증 필요한 API 호출 시

```ts
import { useAuth } from "../context/AuthContext";

// 컴포넌트 내부
const { accessToken } = useAuth();

fetch(`${API_BASE}/some-api`, {
  headers: {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  },
});
```

---

## 5. UI 연동 요약

| 위치 | 로그인 O | 로그인 X |
|------|----------|----------|
| **헤더 (UserDropdown)** | DiceBear 아바타 + 닉네임, 드롭다운(프로필/로그아웃) | "로그인" 링크 → /signin |
| **사이드바 하단** | 아바타 + 닉네임 | "로그인" 링크 → /signin |
| **프로필 페이지 (UserMetaCard)** | DiceBear 아바타 + 닉네임 | 기본 이미지 + placeholder 이름 |

프로필 이미지는 `src/utils/avatar.ts`의 `getDiceBearAvatarUrl(user.id)` 사용 (DiceBear 9.x API).

---

## 6. 관련 파일 구조

```
src/
├── context/
│   └── AuthContext.tsx      # 인증 상태, login, logout, localStorage 동기화
├── components/
│   ├── auth/
│   │   ├── SignUpForm.tsx   # 회원가입 폼 + POST /auth/signup
│   │   └── SignInForm.tsx   # 로그인 폼 + POST /auth/login + login()
│   ├── header/
│   │   └── UserDropdown.tsx # 헤더: 닉네임/아바타 또는 로그인 링크, 로그아웃
│   └── UserProfile/
│       └── UserMetaCard.tsx # 프로필 카드: 로그인 시 아바타·닉네임
├── layout/
│   └── AppSidebar.tsx       # 사이드바 하단: 닉네임+아바타 또는 로그인 링크
├── utils/
│   └── avatar.ts            # getDiceBearAvatarUrl(seed) — 프로필 이미지 URL
└── main.tsx                 # AuthProvider로 앱 래핑
```

---

## 7. 기타 API (참고)

- **토큰 갱신**: `POST /auth/refresh` + body `{ refreshToken }` → 새 accessToken 발급
- **현재 사용자**: `GET /auth/me` + Header `Authorization: Bearer {accessToken}`

현재 구현에서는 로그인·로그아웃·저장만 사용하며, accessToken 만료 시 refresh 호출은 별도 구현이 필요합니다.
