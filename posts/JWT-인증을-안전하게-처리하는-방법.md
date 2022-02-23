---
title: 'JWT 인증을 안전하게 처리하는 방법'
date: '2022-02-07'
image: 'https://user-images.githubusercontent.com/81365896/154716502-0d51700f-d921-472f-b01e-840d6e4a36bf.png'
---

[[Github] ComePet](https://github.com/prgrms-web-devcourse/Team_i6_comepet_FE)

## 1. JWT를 사용한 이유

인증을 처리하기 위한 일반적인 방법으로 세션과 JWT가 있다. 세션은 사용자의 상태를 제어할 수 있다는 장점이 있지만 서버에서 사용자 상태를 관리해야 하므로 구현하는 데 고려사항이 많다. 현 프로젝트의 요구사항을 보면 세션의 장점인 사용자 상태 제어가 필요한 기능이 따로 없었고 백엔드에서도 JWT를 선호했기 때문에 JWT로 인증을 처리하게 되었다.

## 2. 토큰을 사용할 때 발생한 보안 문제

팀원들의 개발 경험이 적었고 프로젝트 기간이 빠듯했기 때문에 우선 토큰 하나만으로 인증을 구현했다. 앱이 리로드될 때에도 인증을 유지하려면 브라우저 어딘가에는 토큰을 반드시 저장해야 했다. 그런데 문제는 어디에 토큰을 저장해도 손쉽게 탈취할 수 있다는 것이었다. 유일한 토큰이 탈취된다면 해당 토큰을 무효화할 수 없으니 토큰의 유효기간 동안 무방비로 공격당할 수 있는 것이다. 따라서 다음과 같은 방법으로 취약점을 방어해야 한다.

### 방법 1 : Refresh Token + HttpOnly

'토큰은 브라우저 어디에 저장하든 탈취될 수 있다'고 했다. 그렇다면 토큰이 탈취될 때 그 피해를 최소화하기 위해선 어떻게 해야 할까? 바로 그 토큰의 유효 기간을 짧게 하고, 실제 사용자가 로그인을 자주 해서 재발급받도록 해야 한다. 만약 토큰이 3분마다 만료되면 사용자가 굉장한 불편을 겪을 것이다. 이러한 문제를 해결하기 위해 Refresh Token이 등장했다.

기존의 토큰이 Access Token이고, 추가적인 토큰이 Refresh Token이라고 한다면 이것들은 각각 어떤 역할을 할까? 바로 이름에 답이 있다. Access Token은 말 그대로 사용자 정보에 직접적으로 ‘Access’ 할 수 있는 토큰이다. 이것은 탈취되었을 때 무효화 하더라도 성능에 영향을 주기 때문에 애초에 유효 기간을 짧게 준다.

Refresh Token은 말 그대로 Access Token을 ‘Refresh’ 재발급받을 수 있는 토큰이다. Access Token의 유효 기간이 만료되거나, 페이지가 리로드 될 때, 서버에 보내는 요청에 담겨(Credential Request) 새로운 Access Token을 발급받는 역할을 한다.

그런데 만약 Refresh Token이 탈취된다면 어떻게 될까? 공격자가 Access Token을 계속 재발급받아 공격할 수 있으니 최대한 안전한 곳에 저장해야 할 것이다.

따라서 쿠키에 Refresh Token을 저장하되, HttpOnly 옵션을 사용해 스크립트로 쿠키를 읽을 수 없도록 해야 한다. 서버에서 `HttpOnly`를 추가해 쿠키를 만들고, 로그인 요청에 대한 응답에 `Set-Cookie` 헤더를 추가하면 적용할 수 있다.

![](https://user-images.githubusercontent.com/81365896/154717171-d1e250f3-b4de-4281-bb6a-2a353b5cabd0.png)

[https://docs.wso2.com/display/IS530/Refresh+Token+Grant](https://docs.wso2.com/display/IS530/Refresh+Token+Grant)

### 방법 2 : Secure

위와 같은 HttpOnly 옵션을 통해 쿠키 탈취를 막을 수 있지만 또 하나의 취약점은 패킷이다. 와이어샤크 같은 툴로 패킷 스니핑을 하면 HTTP 요청과 응답에 담긴 Refresh Token과 Access Token을 가로챌 수 있다. 따라서 패킷이 암호화된 HTTPS 통신에서만 쿠키를 전송하도록 제한하는 Secure 옵션이 추가로 필요하다.

## 3. 결론

Refresh Token은 Access Token을 하나만 사용할 때의 위험성을 줄이고 편리성을 도모하는 수단이다. 그러나 인증에서 Refresh Token을 사용하는 것은 Silver Bullet이 아니다. CSRF 공격과 Access Token 탈취에 대한 가능성은 여전히 남아있기 때문이다. 다만 Refresh Token을 사용하면 사용자는 로그인을 자주 하지 않아도 되고, 서버는 토큰 무효화로 인한 성능 저하가 없다. 또한 XSS 공격에 어느 정도 대비할 수 있게 된다. 이러한 이유로 Refresh Token은 편의, 성능, 보안을 적절히 타협한 결과라고 생각된다.
