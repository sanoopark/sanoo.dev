---
title: 'ComePet 리팩토링 기록 3편'
date: '2022-03-13'
image: 'https://user-images.githubusercontent.com/81365896/154947482-79d0ec59-aa3b-4888-b06f-ebc2f806431e.png'
---

- [Release](https://comepet.netlify.app/)
- [Repository](https://github.com/prgrms-web-devcourse/Team_i6_comepet_FE)
- [현재 구현된 기능에서 발생하는 버그 수정 - 1편](https://sanoo.dev/posts/ComePet-리팩토링-기록-1편)
- [개발자 콘솔에 출력되는 각종 에러 수정 - 2편](https://sanoo.dev/posts/ComePet-리팩토링-기록-3편)
- 리프레시 토큰 구현 및 프록시 - 3편

리프레시 토큰을 구현하는 과정에서 겪는 문제가 많았다. 그런데 대부분 문제는 서버의 설정이 필요한 것들이었다. 백엔드 팀원이 바쁘다 보니 서버에서 뭘 해줘야 하는지 내가 먼저 알아야 했고, 그 과정에서 얻은 지식이 많았다. 백엔드 사정으로 작업이 중단되었지만, 생각보다 많은 공부를 하게 되어 이를 정리한다.

## 1. 무엇이 필요할까?

리프레시 토큰이 왜 필요한지는 [JWT 인증을 안전하게 처리하는 방법](https://sanoo.dev/posts/JWT-인증을-안전하게-처리하는-방법)에서 정리한 바 있다. 그렇다면 리프레시 토큰을 구현하기 위해선 무엇이 필요할까?

서버

- CORS 관련 설정 (Credential, Allow-Origin, SameSite 설정)
- HTTP 쿠키로 리프레시 토큰 발급하는 로그인 API
- 리프레시 토큰을 확인하고 액세스 토큰을 재발급하는 API

클라이언트

- CORS 관련 설정 (Credential 설정)
- 액세스 토큰의 유효기간이 만료되었을 때 재발급 받기 위한 로직

## 2. 어떻게 구현할까?

위에서 기술한 항목 중 세부적으로 알아야 할 몇몇 내용이 있다.

### 1) Credential 설정

- [JWT 인증을 안전하게 처리하는 방법](https://sanoo.dev/posts/JWT-인증을-안전하게-처리하는-방법)에서 리프레시 토큰을 HttpOnly 쿠키에 담아야 하는 이유를 설명했다. 그런데 CORS를 이용할 때는 기본적으로 쿠키를 포함하지 않게 되어 있다. 그 이유를 생각해보면, CORS는 기본적인 목적이 SOP의 엄격함을 풀어주는 것이라 CSRF 공격에 더 노출될 수밖에 없다. 그런데 이때 중요한(Credential) 정보인 쿠키를 포함하게 된다면 CSRF 공격으로 인한 피해가 커질 수 있다. 그래서 CORS에서 쿠키를 포함하기 위해서는 서버와 클라이언트 모두에서 쿠키 사용을 허용한다는 설정을 해줘야 한다. 다음과 같이 서버에서 `Access-Control-Allow-Credentials` Header 값을 `true`로 설정해준다. (스프링에서는 CORS 필터에서 메서드를 추가하면 되는 것으로 보인다.)

```
Access-Control-Allow-Credentials: true
```

클라이언트에서도 다음과 같이 설정해준다.

```
// fetch를 사용하는 경우
fetch('https://example.com', {
  credentials: 'include'
})
```

```
// axios를 사용하는 경우
axios.defaults.withCredentials = true;
```

### 2) Allow-Origin 설정

서버에서 응답을 줄 때 `Access-Control-Allow-Origin Header`를 `*`(와일드 카드)가 아닌 값으로 줘야 한다. 서버에서 와일드 카드로 응답을 준다면 클라이언트에서 다음과 같은 에러를 만날 수 있다.

> The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '\*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

원래 CORS는 기본적으로 쿠키를 포함하지 않는데 Credential 설정을 통해 쿠키를 포함하게 되었다면 와일드카드로 전체 Origin을 허용하는 것이 아니라 특정 Origin만 허용하는 것이 자연스럽다.

### 3) SameSite=None 설정

브라우저가 크롬인 경우에는 서버의 응답 쿠키에 `SameSite=None`을 추가해야 한다. `SameSite=None` 값이 추가되지 않은 쿠키는 응답 헤더의 `Set-Cookie` 부분에서 경고 표시가 나타나면서 쿠키가 저장되지 않는다.

> A cookie associated with a cross-site resource at URL was set without the SameSite attribute. It has been blocked, as Chrome now only delivers cookies with cross-site requests if they are set with SameSite=None and Secure

2020년 2월에 업데이트된 Chrome 80부터는 SameSite 값이 없는 쿠키의 기본값이 Lax이기 때문에 발생하는 문제다. Lax는 무조건 SameSite 여부를 체크하고, 허용된 몇 개의 패턴 이외에는 쿠키를 전송하지 않도록 막는 쿠키 정책이므로 SameSite가 아니라는 것을 `None`으로 명시할 필요가 있는 것이다.

### 4) 프록시 설정

`SameSite=None`을 쿠키에 추가하는 과정에 문제가 발생했다. 백엔드에서는 `SameSite=None` 값이 추가된 것을 컨트롤러 출력을 통해 확인했다고 했지만, 클라이언트에서는 아무리 봐도 그 값을 확인할 수가 없었다. 백엔드에 계속 확인을 요청할 수가 없어 클라이언트에서 프록시를 통해 임시로 해결했다. 또한 서버에서 `Allow-Origin`이 와일드카드에서 배포 도메인으로 변경되었기 때문에 로컬에서 테스트하기 위해서도 프록시 설정이 필요했다. 여기에서 말하는 프록시는 클라이언트의 요청을 서버의 도메인으로 위장해 마치 `SameSite`인 것처럼 하는 것이다.

리액트에서는 `package.json`에 한 줄을 추가해 간단하게 처리할 수 있다. 이때 중요한 것은 요청을 보낼 때 따로 `BASE_URL`을 설정하지 않아야 한다. 추정컨대 `http://localhost:3000/login`과 같은 식으로 요청할 때만 처리되는 방식으로 보인다. 실제로 브라우저의 네트워크 탭을 확인해보면 요청은 `http://localhost:3000/login`으로 되고 있지만 프록시는 잘 동작하는 것을 확인할 수 있다.

```
// package.json

"proxy": "https://www.comepet.com/api",
```

로컬 환경과 달리 배포 환경은 추가적인 설정이 필요하다. Netlify의 경우에는 자체적으로 프록시를 제공해 그 기능을 사용했다.

```
// netlify.toml

[[redirects]]
  from = "/proxy/*"
  to = "https://www.comepet.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

netlify 설정은 [Netlify : Redirects and rewrites](https://docs.netlify.com/routing/redirects/)에서 확인할 수 있다.

### 5) 리프레시 관련 로직

CORS 관련 문제를 모두 해결했다면 클라이언트에서 로직을 구현하는 것은 간단하다. 우선 로그인할 때 Set-Cookie Header를 통해 요청에 리프레시 토큰이 담길 것이고 액세스 토큰만 Authorization Header에 담아주면 된다. 그리고 리로드되거나 유효 기간이 만료될 때 사라지는 액세스 토큰은 API를 통해 재발급받으면 된다. 리로드되는 경우는 앱이 초기화될 때 가장 먼저 리프레시 API를 거쳐 액세스 토큰을 재발급 받도록 처리하면 된다. 또한 유효 기간이 만료된 액세스 토큰은 서버에서 요청마다 검증하고 있지만, 응답 에러가 발생하기 전에 먼저 처리하는 것이 사용성 면에서 좋을 것이다. 로그인해서 액세스 토큰을 발급받는 즉시 유효기간만큼 `setTimeout`을 설정하고, 타이머가 종료되면 리프레시 API를 호출하도록 처리하면 된다. 물론 리로드된다면 이 타이머는 초기화될 것이기 때문에 앱이 초기화되어 리프레시 API를 호출할 때에도 타이머를 재설정하는 로직이 필요할 것이다.

## 3. 느낀점

백엔드 팀원이 바쁜 관계로 서버에서 필요한 설정들을 직접 공부해야 했고 그것들을 팀원에게 짚어주면서 배운 게 많았다. CORS를 이론으로만 아는 게 아니라 서버에서 어떤 식으로 설정되는지 코드를 확인할 수 있어 좋았고, 직접 구현한 프록시 서버는 아니지만 프록시를 적용할 수 있게 되었다. 서버가 닫혀 더 이상의 작업은 어렵지만, 앞으로 개인 프로젝트로 전환해 Strapi와 같은 툴을 적용해볼 계획이다.

## 참고

- [MDN : Using Fetch](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN : Access-Control-Allow-Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials)
- [Google : Get Ready for New SameSite=None; Secure Cookie Settings](https://developers.google.com/search/blog/2020/01/get-ready-for-new-samesitenone-secure)
- [What exactly does the Access-Control-Allow-Credentials header do?](https://stackoverflow.com/questions/24687313/what-exactly-does-the-access-control-allow-credentials-header-do)
- [Netlify : Redirects and rewrites](https://docs.netlify.com/routing/redirects/)
