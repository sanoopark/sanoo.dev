import styled from 'styled-components';
import Layout from 'components/Layout';
import {getAllPostIds, getPostData} from 'lib/posts';
import Head from 'next/head';
import Date from 'components/Date';
import Image from 'next/image';
import {GetStaticProps, GetStaticPaths} from 'next';

export default function Post({
  postData,
}: {
  postData: {
    title: string;
    date: string;
    contentHtml: string;
    image: string;
  };
}) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article className="markdown-body">
        <ImageWrapper>
          <Image
            src={postData.image || '/images/default.jpeg'}
            alt="article"
            width={48}
            height={32}
            layout="responsive"
            objectFit="cover"
          />
        </ImageWrapper>
        <h1>{postData.title}</h1>
        <DateWrapper>
          <Date dateString={postData.date} />
        </DateWrapper>
        <div dangerouslySetInnerHTML={{__html: postData.contentHtml}} />
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const postData = await getPostData(params.id as string);
  return {
    props: {
      postData,
    },
  };
};

const ImageWrapper = styled.div`
  position: relative;
  border-radius: 0.375rem;
  overflow: hidden;
  width: 100%;
  margin-bottom: 2rem;

  &:hover {
    transition: all 0.2s linear;
    box-shadow: ${({theme}) => `0 8px 25px ${theme.colors.hover}`};
  }
`;

const DateWrapper = styled.div`
  display: flex;
  justify-content: left;
  margin: 1rem 0;
`;
