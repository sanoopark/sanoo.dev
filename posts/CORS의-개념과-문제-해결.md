---
title: 'CORS의 개념과 문제 해결'
date: '2022-02-17'
image: 'https://user-images.githubusercontent.com/81365896/154742239-b9b48c6f-19ba-403f-9d8f-d1388c5a7b91.png'
---

## CORS란 무엇일까?

> **Cross-Origin Resource Sharing**
> a mechanism that allows restricted resources on a web page to be requested from another domain outside the domain from which the first resource was served.

위의 정의는 CORS를 가장 잘 설명하는 정의라고 생각한다. 쉽게 말하면 제한된 리소스를 다른 도메인에 허용하는 메커니즘이다. 이렇게 허용하는 메커니즘이 따로 있다는 것은 이것을 차단해야 될 때가 많기 때문일 것이다.

## CORS는 왜 필요할까?

CORS는 SOP의 엄격함을 풀어주기 위한 정책이라고 할 수 있다. CSRF 공격과 같이 다른 Origin에서의 악의적인 요청을 차단하려면 동일 출처 정책인 SOP가 필요한데, 항상 Origin이 같은 상황만 있는 것이 아니니, CORS를 통해 조건적으로 허용하는 것이다. 그 조건은 클라이언트에서 확인했을 때, 서버에서 허용한 Origin(Access-Control-Allowed-Origin)과 현재 Origin이 동일해야 하는 것이다. 만약 동일하지 않다면 클라이언트에서 응답 값을 참조할 수 없게 된다.

## CORS를 어떻게 지킬 수 있을까?

CORS는 엄격함을 풀어주는 정책이라고 했고, 이것을 이용하기 위해선 정해진 조건을 지켜야 한다고 이해했다. 그리고 이 조건은 안전한 요청인가, 안전하지 않은 요청인가에 따라 달라진다.

### 안전한? 안전하지 않은?

메서드와 헤더에 따라 안전, 비안전을 가른다. 그럼 기준은 알겠는데 왜 이런 기준이 있을까? 추측을 해보자면 과거에 GET, POST 메서드만 사용할 수 있었던 시절에 남아 있던 기준이 그대로 이어져 오는 거라고 생각한다. 더 좋은 체계가 있겠지만 이미 웹에서 사용되는 체계를 바꾸는 것은 불가능에 가까울 것이다.

### 안전한 요청이라면

안전한 요청은 [안전한 메서드(safe method)](https://fetch.spec.whatwg.org/#cors-safelisted-method)와 [안전한 헤더(safe header)](https://fetch.spec.whatwg.org/#cors-safelisted-request-header)를 사용하는 요청이다. 안전한 요청은 다음과 같은 과정으로 처리된다.

1. 브라우저는 크로스 오리진 요청 시 `Origin`에 값이 제대로 설정되어 전송되었는지 확인한다.
2. 서버로부터 응답을 받으면 브라우저에서는 `Access-Control-Allow-Origin`을 확인해 크로스 오리진 요청을 허용하는지를 확인한다. 응답 헤더에 `Access-Control-Allow-Origin`이 없거나 `Origin`과 동일하지 않으면 에러가 발생한다.

### 안전하지 않은 요청이라면

안전하지 않은 요청이 이뤄지는 경우, 브라우저는 서버에 바로 요청을 보내지 않고 preflight이라는 사전 요청을 보내 권한이 있는지 확인한다. preflight 요청은 `OPTIONS` 메서드를 사용하고 다음과 같은 두 헤더를 포함한다.

- `Access-Control-Request-Method` – 안전하지 않은 요청에서 사용할 메서드 정보
- `Access-Control-Request-Headers` – 안전하지 않은 요청에서 사용할 헤더 목록

만약 허용된 요청이 아니라면 다음과 같은 에러가 발생한다.

> Access to XMLHttpRequest at 'https://www.comepet.com' from origin 'https://comepet.netlify.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check

허용된 요청이라면 상태 코드 200인 응답을 다음과 같은 헤더와 함께 보낸다.

- `Access-Control-Allow-Origin` – `*` 이나 요청을 보낸 오리진
- `Access-Control-Allow-Methods` – 허용된 메서드 정보
- `Access-Control-Allow-Headers` – 허용된 헤더 목록
- `Access-Control-Max-Age` – 퍼미션 체크 여부를 캐싱해놓는 시간 (preflight 요청이 생략 가능한 시간)

preflight 요청이 성공적으로 이뤄지면 브라우저는 본 요청을 보내며 이후 과정은 안전한 요청과 같다.

## CORS 문제 해결 사례 1

클라이언트에서 `Set-Cookie` Header를 통해 쿠키를 저장하기 위해서, fetch의 `credential`을 `include`로 설정하거나, axios의 `withCredentails`을 true로 설정한다. 그런데 이러한 상황에서 서버로부터 받은 응답의 `Access-Control-Allow-Origin` Header가 와일드카드(`*`)라면 다음과 같은 에러가 발생한다.

> The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '\*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

와일드 카드로 전체 Origin을 허용해버리면 어느 Origin에서나 쿠키를 저장할 수 있으므로 허용하지 않는 것이 자연스럽다. 서버 설정에서 `Access-Control-Allow-Origin`를 실제 Orgin으로 변경해 해결할 수 있다.

## CORS 문제 해결 사례 2

브라우저마다 다르지만 적어도 크롬에서는, 크로스 사이트 쿠키를 저장하기 위해 서버에서 `SameSite=None`을 `Set-Cookie`에 추가해야 한다. 그 이유는 2020년 2월에 업데이트된 Chrome 80부터 `SameSite` 값이 없다면 `Lax`를 기본값으로 설정하기 때문이다. `SameSite` 값이 없다면 다음과 같은 경고 메시지를 볼 수 있다.

> This Set-Cookie didn’t specify a “SameSite” attribute and was defaulted to “SameSite=Lax,” and was blocked because it came from a cross-site response which was not the response to a top-level navigation. The Set-Cookie had to have been set with “SameSite=None” to enable cross-site usage.

Lax는 무조건 SameSite 여부를 체크하고, 허용된 몇 개의 패턴 이외에는 쿠키를 전송하지 않도록 막는 쿠키 정책이다. 따라서 클라이언트에서는 Set-Cookie에 담긴 값이 쿠키에 저장되지 않는다.

![image](https://user-images.githubusercontent.com/81365896/162779633-3ac6113a-ecfb-4e2d-9e63-30e70159ee37.png)

또한 [Google Search Central Blog](https://developers.google.com/search/blog/2020/01/get-ready-for-new-samesitenone-secure)를 보면 기본적으로 퍼스트 파티 쿠키를 권장하지만, 많은 개발자들이 크로스 사이트 쿠키를 사용해 CSRF 공격에 노출되기 때문에, HTTPS에서만 쿠키에 접근할 수 있도록 `secure` 속성을 사용하도록 강제하는 것을 알 수 있다.

결론적으로 `Set-Cookie` 값에 `SameSite=None`과 `secure`를 추가하면 된다. 또는 프록시 서버를 통해 `origin`을 `allow-origin`과 일치시켜 same-site 상황을 만들어주면 된다.
