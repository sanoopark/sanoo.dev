import styled from 'styled-components';
import Layout from 'components/Layout';
import Image from 'next/image';
import Link from 'next/Link';
import Date from 'components/Date';
import {GetStaticProps} from 'next';
import {getSortedPostsData} from '../lib/posts';

export default function IndexPage({
  allPostsData,
}: {
  allPostsData: {
    id: string;
    title: string;
    date: string;
  }[];
}) {
  return (
    <Layout>
      <Banner>
        <Heading>sanoo.dev</Heading>
        <SubHeading>경험으로 배운 지식을 알기 쉽게 공유합니다.</SubHeading>
      </Banner>
      <Label>Latest Articles</Label>
      {allPostsData.length && (
        <ArticlesWrapper>
          {allPostsData.map(({id, title, date}) => (
            <ArticleWrapper key={id}>
              <Link href={`/posts/${id}`}>
                <a>
                  <ImageWrapper>
                    <Image
                      src="/images/default.jpeg"
                      alt="article"
                      layout="fill"
                      objectFit="cover"
                    />
                  </ImageWrapper>
                  <Title>{title}</Title>
                  <DateWrapper>
                    <Date dateString={date} />
                  </DateWrapper>
                </a>
              </Link>
            </ArticleWrapper>
          ))}
        </ArticlesWrapper>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
};

const Banner = styled.section`
  display: flex;
  flex-direction: column;
  padding-bottom: 8rem;
`;

const Heading = styled.h1`
  font-size: 3rem;
  font-family: NanumSquareRoundB, sans-serif;
  line-height: 3.5rem;

  @media (min-width: 768px) {
    font-size: 3.75rem;
    line-height: 4rem;
  }
`;

const SubHeading = styled.h2`
  margin-top: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: 1.5rem;
    line-height: 2rem;
  }
`;

const Label = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-family: NanumSquareRoundB, sans-serif;
`;

const ArticlesWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 3rem 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ArticleWrapper = styled.div`
  transform: translateY(-2px);
  transition: all 0.2s linear;

  &:hover {
    & > div:first-child {
      transform: translateY(-2px);
      transition: all 0.2s linear;
      box-shadow: ${({theme}) => `0 8px 25px ${theme.colors.hover}`};
    }

    & > h3 {
      color: ${({theme}) => theme.colors.accent};
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  border-radius: 0.375rem;
  overflow: hidden;
  width: 100%;
  height: 16.5rem;
`;

const Title = styled.h3`
  display: inline-block;
  padding-top: 1rem;
  font-size: 1.5rem;
  line-height: 2rem;
`;

const DateWrapper = styled.div`
  padding: 1rem 0 0.5rem 0;
  line-height: 1.25rem;
  color: ${({theme}) => theme.colors.muted};
`;
