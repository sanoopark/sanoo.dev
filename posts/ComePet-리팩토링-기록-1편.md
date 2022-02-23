---
title: 'ComePet 리팩토링 기록 1편'
date: '2022-02-21'
image: 'https://user-images.githubusercontent.com/81365896/154947482-79d0ec59-aa3b-4888-b06f-ebc2f806431e.png'
---

[Github](https://github.com/prgrms-web-devcourse/Team_i6_comepet_FE) & [Netlify](https://comepet.netlify.app/)

## 소개

ComePet은 사용자가 반려동물 실종 공고를 올리면 해당 동물을 찾을 수 있도록 도와주는 웹 애플리케이션이다. 백엔드 3명과 협업해 총 6명이 참여했으며 대략 1달 동안 개발되었다. 짧은 기간 동안 오로지 완성을 목표로 개발했기 때문에 버그와 날림 코드가 많았다. 정식 프로젝트 기간은 끝났지만 백엔드 한 분이 리팩토링에 참여해주셔서 혼자 사이드 프로젝트로 전환해 진행해왔다. 리팩토링을 하면서 얻은 지식과 깨달음이 많아 정리를 해두어야겠다고 생각했다.

- 현재 구현된 기능에서 발생하는 버그 수정 - 1편
- 개발자 콘솔에 출력되는 각종 에러 수정 - 2편
- 리프레시 토큰 구현 및 프록시 - 3편

이외에 가독성이 좋지 못한 코드, 리액트를 충분히 이해하지 못한 코드들이 많지만, 현실적으로 시간이 부족하기 때문에 우선 중요한 것들만 계획했다.

## 1. 인가가 필요한 페이지에서 로그인 리다이렉트 시 뒤로가기 불가 문제

> `/` -> `/edit/profile` -> `/login` -> 뒤로가기 -> `/edit/profile` -> `/login`

비회원이 메인 페이지 `/`에서 프로필 수정 버튼을 눌러 프로필 수정 페이지 `/edit/profile`에 가려고 하면 로그인 페이지 `/login`로 리다이렉트 하도록 하고 싶었다. 이것을 `RequireAuth`라는 라우터 함수로 구현했다.

```javascript
const RequireAuth = () => {
const { isLoggedIn } = useAuth();
const location = useLocation();

if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} />;
}

return <Outlet />;
```

그런데 문제는 만약 비회원인 사용자가 로그인 페이지 `/login`에서 로그인하지 않고 뒤로가기 버튼을 누르면 메인 페이지 `/`로 돌아가지 못하는 현상이 발생한다.

돌아가지 못하는 게 당연한 것이 뒤로가기를 하면 `/edit/profile`이기 때문에 다시 `/login`으로 리다이렉트 되는 과정이 반복되기 때문이다. 다시 말하면 히스토리 스택에 `/edit/profile`이 계속 남아있기 때문이다. 이것을 해결하기 위해 replace 옵션을 사용했다.

```javascript
const RequireAuth = () => {
const { isLoggedIn } = useAuth();

if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
}

return <Outlet />;
```

> `/` -> ( `/edit/profile` 삭제) -> `/login` -> 뒤로가기 -> `/`

`/edit/profile` -> `/login` 과정에 replace 옵션을 사용하면 현재 히스토리인 `/edit/profile`을 스택에 저장하지 않고 메인 페이지 `/`로 리다이렉트한다.

## 2. 로그인 상태로 URL Path 변경하는 경우 진입 불가 문제

![image](https://user-images.githubusercontent.com/81365896/154974518-1c844f26-602a-4613-8e88-83ef99dcca1c.png)

사용자가 페이지를 변경하기 위해 URL을 입력하면 현재 페이지에 머무르는 현상이다. 원인은 `isLoggedIn`이라는 값이 인증 API를 거쳐 늦게 업데이트되기 때문이었다.

```javascript
const RequireAuth = () => {
const { isLoggedIn } = useAuth();

if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
}

return <Outlet />;
```

위의 RequireAuth 라우터 함수에서는 현재 사용자가 회원인지, 비회원인지 판별하기 위해 상위의 AuthContext를 구독해 isLoggedIn이라는 값을 받아온다. 정상적인 동작 순서를 나타내면 다음과 같다.

> `AuthContext` -> 인증 API -> `isLoggedIn = true` -> `RequireAuth` -> `Outlet`

그런데 URL을 입력해 리로드를 하게 되면 앱이 초기화되면서 인증 API의 결과로 `isLoggedIn`를 업데이트하기 전에 초깃값인 false를 RequireAuth에 전달한다.

> `AuthContext` -> `isLoggedIn = false` -> `RequireAuth` -> `/login` -> 회원 진입 불가

> `AuthContext` -> 인증 API -> `isLoggedIn = true` -> 이미 리다이렉트 끝난 이후

일단 문제에 대한 원인을 파악했기 때문에 해결은 쉽게 할 수 있었다.

```javascript
if (!isInitialized) return <></>;
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

위와 같이 플래그(isInitialized)를 이용해 `AuthContext`의 하위인 `RequireAuth`에서는 업데이트된 값만을 받게 했다.

## 3. 알림 읽음 여부에 따른 UI 변경 구현

![LongHeader](https://user-images.githubusercontent.com/81365896/154973216-50707697-c934-4872-bd52-b0c1dc656771.png)

---

![ShortHeader](https://user-images.githubusercontent.com/81365896/154973410-f93552f8-757d-4b93-9109-8e641e40c7d8.png)

위는 `LongHeader`, 아래는 `ShortHeader`라는 컴포넌트다.

두 컴포넌트는 공통으로 `NotificationModal`이라는 하위 컴포넌트를 갖는다. 그래서 알림 버튼을 클릭하면 알림 창인 `NotificationModal`이 나타나고 `NotificationModal`은 API 호출을 통해 현재 사용자의 알림 목록을 가져온다.

이때 빨간색 Badge를 구현하기 위해서는 안 읽은 알림 여부 `isUnreadNotification`를 `LongHeader`와 `ShortHeader`에 전달해야 한다. 첫 번째 방법은 각각의 상위 컴포넌트에 따로 전달하는 것이고, 두 번째 방법은 전역 상태로 관리하는 것이다. 나는 후자를 선택했는데 그 이유는 첫 번째 방법은 상태를 공유하기 위해 로직의 중복이 발생한다고 생각했기 때문이다.

## 느낀 점

지난 프로젝트에 react router v5를 사용했지만 내 담당이 아니었다. 그래서 이번에는 라우팅을 맡아서 잘해보고 싶었다.

라우팅에서 발생하는 문제를 해결하는 것은 꽤나 어려웠다. 히스토리를 제대로 이해하고 따라가지 않으면 원인을 밝히기 쉽지 않기 때문이다. 특히 내가 구현할 때는 v6를 사용했는데, 프로젝트 당시엔 업데이트된 지 얼마 되지 않았을 때라 레퍼런스가 많이 없어서 애를 먹었던 기억이 난다.

공식 문서를 통해 컨셉을 잡았지만 처음 사용해보는 거라 예기치 못한 버그가 많이 발생한 것 같다. 리팩토링에서 이러한 버그를 해결하면서 히스토리와 라우팅에 대한 이해도를 높일 수 있었다.
