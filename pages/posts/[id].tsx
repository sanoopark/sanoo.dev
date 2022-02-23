import styled from 'styled-components';
import {GetStaticProps, GetStaticPaths} from 'next';
import {getAllPostIds, getPostData} from 'lib/posts';
import Head from 'next/head';
import Image from 'next/image';
import Date from 'components/Date';
import Layout from 'components/Layout';
import MaxImage from 'components/MaxImage';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {atomOneLight} from 'react-syntax-highlighter/dist/cjs/styles/hljs';

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
        <ImageFrame>
          <Image
            src={postData.image || '/images/default.jpeg'}
            alt="article"
            width={48}
            height={32}
            layout="responsive"
            objectFit="cover"
            priority={true}
          />
        </ImageFrame>
        <h1>{postData.title}</h1>
        <DateWrapper>
          <Date dateString={postData.date} />
        </DateWrapper>
        <ReactMarkdown components={customComponents as any}>
          {postData.contentHtml}
        </ReactMarkdown>
      </article>
    </Layout>
  );
}

const customComponents = {
  p: ({node, children}) => {
    const element = node.children[0];
    const isImageElement =
      element.type === 'element' && element.tagName === 'img';

    if (isImageElement) {
      return (
        <MaxImage
          src={`${element.properties.src}`}
          alt={`${element.properties.alt}`}
        />
      );
    }

    return <p>{children}</p>;
  },
  code({className, children}) {
    const language = className?.replace('language-', '');

    return (
      <SyntaxHighlighter style={atomOneLight} language={language}>
        {children[0]}
      </SyntaxHighlighter>
    );
  },
};

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

const ImageFrame = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 0.4rem;
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
