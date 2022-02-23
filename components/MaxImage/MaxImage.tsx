import styled from 'styled-components';
import Image from 'next/image';

export default function MaxImage({src, alt}) {
  return (
    <ImageWrapper>
      <Image src={src} alt={alt} layout="fill" priority={true} />
    </ImageWrapper>
  );
}

const ImageWrapper = styled.div`
  width: 80%;
  margin: 0 auto;
  margin-bottom: 1rem;

  > span {
    position: unset !important;
    border-radius: 0.4rem;
    overflow: hidden;
  }

  > span > img {
    position: relative !important;
    object-fit: contain;
    width: 100% !important;
    height: unset !important;
  }
`;
