---
title: 'CSR과 SSR에 대한 오해'
date: '2022-02-10'
image: 'https://user-images.githubusercontent.com/81365896/154722750-a4854ecc-529e-4a05-a55c-ee81b2bd608d.png'
---

CSR과 SSR은 모두 렌더링 방식 중 하나인데 렌더링이란 단어 때문에 이해하는 데 많은 시간이 걸렸다. 모던 자바스크립트 Deep Dive 책에서는 렌더링을 다음과 같이 정의한다.

![DOM과 CSSOM를 결합해 생성되는 렌더 트리](https://user-images.githubusercontent.com/81365896/154719330-0b66a858-00f6-441e-bfcd-b8adcd06d0ba.png)

> HTML, CSS, JS로 작성된 문서를 파싱하여 브라우저에 시각적으로 출력하는 것.

그렇다면 SSR에서도 위의 그림처럼 서버에서 렌더 트리를 만들고 페인트까지 해준다는 말인가? 그렇지 않다. 렌더 트리를 기반으로 페인트하는 과정은 CSR과 SSR 둘 다 클라이언트에서 이뤄진다. 다만 CSR, SSR에서 렌더링이란 단어가 내포하고 있는 의미가 조금 다를 뿐이다.

결국 렌더링이란 용어에서 비롯된 오해인데 그렇다면 렌더링의 정확한 의미는 무엇일까? [이 곳](https://stackoverflow.com/questions/16518951/rendering-in-context-of-web-development)에서 웹에 대한 렌더링의 일반적인 의미를 찾을 수 있었다.

> The process of gathering data and load the associated templates and apply the gathered data to the associated templates.

쉽게 해석하자면 **데이터를 모아서 템플릿에 적용하는 것**이다. 이 정의대로라면 클라이언트에서 AJAX를 통해 데이터를 응답받아 리페인트하는 과정도 렌더링이고, 아래의 코드와 같이 서버의 데이터를 index에 담아 데이터가 포함된 HTML을 만드는 것도 렌더링이다.

따라서 클라이언트 사이드 렌더링, 서버 사이드 렌더링은 데이터를 모아서 템플릿에 적용하는 과정인 렌더링이 어디에서 발생하냐를 따지는 것이다. 그리고 많은 곳에서 SSR에 대해 설명할 때 빠지지 않고 등장했던 ‘완성된 HTML’이란 ‘데이터가 포함된 HTML’이었던 것이다.

```javascript
app.get('/', function (req, res) {
  res.render('index', {title: 'Hey', message: 'Hello there!'});
});
```

> 💡 위와 같은 렌더링이 빌드 타임에 한 번 이뤄지는가, 요청마다 이뤄지는가에 따라 각각 SSG와 SSR로 분류할 수 있다.

‘완성된 HTML’이란 용어는 또 하나의 오해를 불러일으켰는데, HTML에 DOM을 조작하는 코드를 포함하면 DOM이 변경된 결과물이 나올 것 같다는 오해다. 조금만 생각해보면 DOM은 브라우저가 서버로부터 HTML을 응답 받아 파싱하는 과정에서 생성되는 것이니, 없는 DOM을 조작하는 건 당연히 안 되는 셈이다.

이것이 ejs와 같은 템플릿 엔진을 사용할 때 `<% %>` 안에 DOM API를 아무리 사용해도 `EJS unable to access DOM causing Document is not Defined` 에러가 발생하는 이유였다. 만약 script 태그나 JS 파일을 연결하면 서버 렌더링 이후, 브라우저 렌더링 과정에서 JS가 실행되기 때문에 정상적으로 동작한다.

> 💡 SSR은 JS로 DOM을 조작하는 것이 아니라 static HTML을 만드는 과정이며,
> 이것을 Next.js에서는 Pre-rendering이라고 한다.

이러한 과정을 알면 각각의 장단점을 더 쉽게 이해할 수 있다.

![image](https://user-images.githubusercontent.com/81365896/154721400-af17464b-75b2-454f-90cf-7873322b5001.png)

![image](https://user-images.githubusercontent.com/81365896/154721749-ad7ecccf-8373-4400-9e22-f6f132127243.png)
