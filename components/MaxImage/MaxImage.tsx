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
  width: 100%;

  > span {
    position: unset !important;
  }

  > span > img {
    object-fit: contain;
    width: 100% !important;
    position: relative !important;
    height: unset !important;
  }
`;
