import {createGlobalStyle, ThemeProvider} from 'styled-components';
import reset from 'styled-reset';
import {lightTheme, darkTheme} from 'theme';
import {AppProps} from 'next/app';

const GlobalStyle = createGlobalStyle`
  ${reset}

  a {
    text-decoration: none;
    color: inherit;
  }

  body {
    transition: color 0.2s ease-in-out;
    transition: background-color 0.2s ease-in-out;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    height: 100%;
    min-height: 100vh;
    background-color: #fff;
    background-image: linear-gradient(#fff 90%, #73737d 145%);
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-family: NanumSquareRoundR, sans-serif;
    color: #0a0c10;
  }

  @font-face {
    font-family: NanumSquareRoundR, sans-serif;
    src: url("/fonts/NanumSquareRoundR.ttf") format("truetype");
  }

  @font-face {
    font-family: NanumSquareRoundB, sans-serif;
    src: url("/fonts/NanumSquareRoundB.ttf") format("truetype");
  }
`;

export default function App({Component, pageProps}: AppProps) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={lightTheme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
