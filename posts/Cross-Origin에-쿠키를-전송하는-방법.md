---
title: 'Cross Origin에 쿠키를 전송하는 방법'
date: '2022-03-13'
image: 'https://user-images.githubusercontent.com/81365896/162795619-e5291d65-6325-445b-b847-6d0ad6351a6a.png'
---

Cross Origin에 리프레시 토큰과 같은 HTTP 쿠키에 전송하기 위해서는 몇 가지 준비가 필요하다.

## Cross Origin 상황에서 필요한 설정

### Credentials

Cross Origin이라면 [Request.credentials](https://developer.mozilla.org/ko/docs/Web/API/Request/credentials)을 `include`로 변경해야 한다. credentials의 기본값이 `same-origin`으로 동일 출처일 때만 쿠키를 전송하기 때문이다. 설정하는 방법은 다음과 같다.

**클라이언트**

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

**서버**

```
Access-Control-Allow-Credentials: true
```

### Response Header

서버에서 응답의 `Access-Control-Allow-Origin`과 `Access-Control-Allow-Headers`를 와일드카드가 아닌 값으로 변경해야 한다. 와일드카드라면 클라이언트에서 다음과 같은 에러가 발생한다.

> The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '\*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

### SameSite / Secure

SameSite는 CSRF에 대비하기 위해, 쿠키가 Cross Origin에 전송되지 않도록 하는 속성이므로, `None`이어야 Cross Origin에 쿠키를 전송할 수 있다. 특히 클라이언트가 크롬이라면, 서버에서 `SameSite=None`을 `Set-Cookie`에 명시적으로 추가해야 한다. 그 이유는 2020년 2월에 업데이트된 Chrome 80부터 `SameSite` 값이 없다면 `Lax`를 기본값으로 설정하기 때문이다. Lax는 무조건 SameSite 여부를 체크하고, 허용된 몇 개의 패턴 이외에는 쿠키를 전송하지 않도록 막는 쿠키 정책이므로 SameSite가 아니라는 것을 `None`으로 명시할 필요가 있는 것이다. 또한 [Google Search Central Blog](https://developers.google.com/search/blog/2020/01/get-ready-for-new-samesitenone-secure)를 보면 기본적으로 퍼스트 파티 쿠키를 권장하지만, 많은 개발자들이 크로스 사이트 쿠키를 사용해 CSRF 공격에 노출되기 때문에, HTTPS에서만 쿠키에 접근할 수 있도록 `secure` 속성을 사용하도록 강제하는 것을 알 수 있다.

> A cookie associated with a cross-site resource at URL was set without the SameSite attribute. It has been blocked, as Chrome now only delivers cookies with cross-site requests if they are set with SameSite=None and Secure

## Cross Origin을 Same Origin으로 만드는 방법

프록시를 통해 Same Origin으로 만든다면 위의 설정이 불필요할 수 있다. 내가 프록시를 사용하게 된 이유는 `SameSite=None`을 쿠키에 추가하는 과정에 문제가 발생했기 때문이다. 백엔드에서는 컨트롤러 출력을 통해 `SameSite=None`이 추가된 것을 확인했다고 했지만, 클라이언트에서는 아무리 봐도 그 값을 확인할 수가 없었다. 백엔드에 계속 확인을 요청할 수 있는 상황이 아니라 프록시를 통해 해결하기로 결정했다. 어차피 서버에서 `Allow-Origin`이 와일드카드에서 실제 origin으로 변경되었기 때문에 로컬에서도 테스트하려면 프록시가 필요한 상황이기도 했다.

프록시는 Webpack Dev Server를 통해 설정할 수 있다. 만약 CRA를 사용한다면 `package.json`에 한 줄만 추가하면 간단하게 처리할 수 있다.

```
// package.json

"proxy": "https://www.comepet.com/api",
```

클라이언트의 요청이 발생했을 때 웹팩 데브 서버에서 해당 요청을 받아 백엔드 서버로 전달하고, 백엔드에서 응답한 내용을 다시 응답해준다. 이때 중요한 것은 요청을 보낼 때 따로 `BASE_URL`을 설정하지 않아야 한다. 실제로 브라우저의 네트워크 탭을 확인해보면 요청은 `http://localhost:3000/login`으로 이뤄지고 있지만 정상적으로 응답받는 것을 볼 수 있다.

Webpack Dev Server가 프록시 역할을 해주는 로컬 환경과 달리 배포 환경은 따로 서버가 필요하다. 따로 서버를 만드는 대신 Netlify에서 제공하는 리다이렉트 기능을 사용했다.

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

## 참고

- [MDN : Using Fetch](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN : Access-Control-Allow-Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials)
- [Google : Get Ready for New SameSite=None; Secure Cookie Settings](https://developers.google.com/search/blog/2020/01/get-ready-for-new-samesitenone-secure)
- [What exactly does the Access-Control-Allow-Credentials header do?](https://stackoverflow.com/questions/24687313/what-exactly-does-the-access-control-allow-credentials-header-do)
- [Netlify : Redirects and rewrites](https://docs.netlify.com/routing/redirects/)
- [Stack Overflow : Set cookies for cross origin requests](https://stackoverflow.com/questions/46288437/set-cookies-for-cross-origin-requests)
