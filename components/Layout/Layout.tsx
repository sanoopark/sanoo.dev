import styled from 'styled-components';
import Head from 'next/head';
import Footer from '../Footer';
import Header from '../Header';

export const siteTitle = 'Next.js Sample Website';

export default function Layout({children}) {
  const social = [{name: 'Github', url: 'github.com/sanoopark'}];

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
      <Footer social={social} />
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
