import styled from 'styled-components';
import Head from 'next/head';
import Header from '../Header';

export const siteTitle = 'Next.js Sample Website';

export default function Layout({children}) {
  const footerContent = `
    © 2022 Sang-woo Park / Attribution 2.0 Korea \n You must give appropriate credit, provide a link to the license, and indicate if changes were made.
  `;

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="" />
        <meta property="og:image" content="" />
        <meta name="og:title" content="" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header />
      <Container>{children}</Container>
      <Footer>{footerContent}</Footer>
    </>
  );
}

const Container = styled.div`
  width: calc(100% - 3rem);
  max-width: 46rem;
  margin: 4rem auto 0 auto;

  @media (min-width: 1024px) {
    max-width: 64rem;
  }
`;

const Footer = styled.div`
  width: 100%;
  max-width: calc(100% - 14rem);
  min-width: calc(100% - 3rem);
  margin: 3rem auto 0 auto;
  text-align: center;
  font-size: 1rem;
  font-style: italic;
  line-height: 1.6rem;
  white-space: pre-line;
  color: ${({theme}) => theme.colors.muted};
`;
