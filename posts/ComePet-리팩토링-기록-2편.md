---
title: 'ComePet 리팩토링 기록 2편'
date: '2022-02-24'
image: 'https://user-images.githubusercontent.com/81365896/154947482-79d0ec59-aa3b-4888-b06f-ebc2f806431e.png'
---

- [Release](https://comepet.netlify.app/)
- [Repository](https://github.com/prgrms-web-devcourse/Team_i6_comepet_FE)
- [현재 구현된 기능에서 발생하는 버그 수정 - 1편](https://sanoo.dev/posts/ComePet-리팩토링-기록-1편)
- 개발자 콘솔에 출력되는 각종 에러 수정 - 2편
- 리프레시 토큰 구현 및 프록시 - 3편

## 1. 무한 스크롤 API 중복 호출 문제

네트워크 비용을 줄이기 위해 무엇을 할 수 있을지 고민하다가 발견한 문제다. 네트워크가 느린 환경에서 스크롤을 위아래로 빠르게 움직이면 리스트가 렌더링 되지 않은 상태에서 추가적인 API 요청이 계속 발생하는 모습을 발견할 수 있다. 이렇게 짧은 시간에 연속해서 함수가 호출되는 것을 방지하기 위해서는 디바운스나 쓰로틀 기법을 사용해야 한다.

그런데 아래와 같이 디바운스를 무한스크롤에 적용하면 또 다른 문제가 발생한다.

```javascript
useEffect(() => {
  if (!isReachingEnd && isTargetInView) {
    const debounce = setTimeout(() => {
      setSize(size + 1);
    }, 1000);
    return () => clearTimeout(debounce);
  }
}, [isTargetInView]);
```

![화면 기록 2022-02-25 오후 11 12 03](https://user-images.githubusercontent.com/81365896/155730010-d539f85b-6dd8-491d-970f-216f560a3e63.gif)

위와 같이 네트워크가 느린 환경에서 스크롤이 연달아 발생해 `isTargetInView` 값이 계속 바뀌는 상황에서는 타이머가 계속 초기화되므로, 스크롤이 움직이는 동안에는 API를 호출하지 못하고 스크롤을 멈췄을 때 호출하는 모습을 볼 수 있다.

물론 속도가 빠른 데스크탑 환경에서는 리스트가 빠르게 늘어나 `isTargetInView` 값이 계속 바뀌기 힘들다. 그러나 속도가 느린 모바일 환경에서는 마음이 급한 사용자가 스크롤을 계속 움직여 무한 스크롤이 동작하지 않을 수도 있을 것이다.

따라서 다음과 같이 쓰로틀을 사용해 일정 시간 간격 동안 API가 한 번씩만 호출되게 해야 한다.

```javascript
...

const [throttledFunction, ready] = useThrottle(() => setSize(size + 1), 1000);

useEffect(() => {
  if (!isReachingEnd && isTargetInView && ready) {
    throttledFunction();
  }
}, [isTargetInView]);

...
```

```javascript
// https://github.com/imbhargav5/rooks/blob/main/src/hooks/useThrottle.ts

const useThrottle = (callback, delay = 300) => {
  const [ready, setReady] = useState(true);
  const timerRef = useRef();

  const throttledFunction = useCallback(() => {
    if (!ready) {
      return;
    }

    setReady(false);
    callback();
  }, [ready, callback]);

  useEffect(() => {
    if (!ready) {
      timerRef.current = setTimeout(() => {
        setReady(true);
      }, delay);

      return () => clearTimeout(timerRef.current);
    }
  }, [ready, delay]);

  return [throttledFunction, ready];
```

1. `useThrottle` hook이 실행되면 `throttledFunction`과 `ready` 상태를 반환한다.
2. 컴포넌트의 `useEffect`에서 `throttledFunction`를 실행해 `ready` 상태를 false로 변경한다.
3. `useEffect`의 dependancy인 `ready`가 변경되었으므로 `useEffect`의 callback이 실행된다.
4. callback에서 타이머가 `delay`만큼 설정되고, `delay` 후에 `ready`를 다시 true로 변경한다.
5. `ready`가 true로 변경되기 전, 컴포넌트가 리렌더링 된다면 `useThrottle` hook이 다시 실행된다.
6. `useCallback`과 `useEffect`에서 변경된 dependancy가 없으므로 이전과 반환값이 같다.
7. 컴포넌트에서 throttledFunction을 실행해도 `ready` 값이 아직 false이므로 `setSize`를 실행하지 못한다.
8. 타이머가 끝나면 `ready`값이 true가 되어 throttledFunction에서 `setSize`을 실행하고, useEffect에서는 타이머를 재설정한다.

![화면 기록 2022-02-25 오후 10 30 52](https://user-images.githubusercontent.com/81365896/155724989-5b1ddb9f-655e-4286-8811-e2d3b862f5d2.gif)

위와 같이 스크롤을 위아래로 움직여 `isTargetInView` 값을 계속 변경하더라도 API 호출은 일정 시간 간격을 유지하는 모습을 확인할 수 있다.

## 2. 알 수 없는 로그인 요청을 보내는 현상

이 문제는 콘솔에서 Mixed Content 에러를 추적하다가 발견했다. Mixed Content 에러와는 별개로, `http://www.comepet.com/login`라는 처음 보는 URL에 대한 요청 흔적이 계속 생겼다. 코드를 아무리 봐도 해당 URL로 보내는 요청은 없었다. 원인을 찾기 위해 네트워크 탭을 열어 확인한 끝에 몇몇 Response Header의 Location에서 해당 URL을 찾을 수 있었다.

> Location : The Location response header indicates the URL to redirect a page to.

알아보니 Location Header는 리다이렉트할 URL을 지정하기 위해 서버에서 추가하는 것이었다. 이것은 특정 API의 응답에만 있었고, 로그인하지 않은 상태에서만 볼 수 있었다. 그렇다면 로그인하지 않은 상태에서 인가되지 않은 사용자가 요청을 보냈을 때 `/login`으로 리다이렉트하도록 서버에 설정되어있다는 추측을 할 수 있었다.

인가되지 않은 사용자는 해당 요청 자체를 보내지 못하도록 막을 필요가 있었다. 프론트에서 1차적으로 막는다면 Location Header를 통한 리다이렉션은 필요 없다고 생각되어 백엔드에 해당 내용을 알려주었다.

## 3. 서버에서 받은 이미지 데이터에 다른 확장자 파일이 포함된 문제

게시글 목록 조회 API에서 이미지 URL을 포함한 데이터를 응답해주는데 csv, pdf와 같은 파일이 있어 img src에서 에러가 발생하고 있었다. 프론트에서는 img accept 속성으로 검사를 하고 있지만, 서버에서는 검사가 따로 이뤄지지 않은 모양이었다.

프론트에서의 검증은 거의 무의미하지만, 에러를 없애기 위한 최소한의 조치로 다음과 같은 코드를 추가했다.

```javascript
<Image className={className} src={checkImageUrl(src)} alt={alt} />;

const checkImageUrl = src => {
  const isImageUrl = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(src);
  return isImageUrl ? src : null;
};
```

## 느낀 점

무한 스크롤에 디바운스와 쓰로틀링을 직접 적용해보며 둘의 차이를 명확히 이해하는 좋은 기회였다. 그리고 개발자 콘솔에 뜨는 에러는 모두 해결했지만 아직도 비효율적으로 호출되는 API가 많은 것 같아 아쉽다. 만약 이것들을 다 고치려면 디자인 패턴을 적용해 새 프로젝트를 만들어야 할 것 같다. 겉으로 보기엔 멀쩡하지만 API 중복 호출, 불필요한 렌더링, 의존성, 코드 가독성 등 해결해야 할 부분이 많다. 시간이 된다면 리액트 디자인 패턴을 공부하면서 타입스크립트로 마이그레이션 해보고 싶다.
