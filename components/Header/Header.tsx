import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';

export default function Header({name}: HeaderProps) {
  return (
    <Wrapper>
      <Link href="/" passHref>
        <LogoWrapper>
          <ImageWrapper>
            <Image
              src="/images/profile.png"
              alt="article"
              layout="fill"
              objectFit="cover"
            />
          </ImageWrapper>
          <SiteName>{name}</SiteName>
        </LogoWrapper>
      </Link>
    </Wrapper>
  );
}

interface HeaderProps {
  name: string;
}

const Wrapper = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  justify-items: end;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  width: calc(100% - 3rem);
  max-width: 65rem;
  padding: 1rem 1.5rem;
  background-color: ${({theme}) => theme.colors.background};

  @media (min-width: 768px) {
    position: static;
    padding: 1rem 0;
  }
`;

const LogoWrapper = styled.a`
  display: flex;
  align-items: center;

  &:hover {
    color: ${({theme}) => theme.colors.accent};
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 0.375rem;
  width: 3rem;
  height: 3rem;
`;

const SiteName = styled.div`
  transition: all 0.2s ease-in-out;
  margin-left: 1rem;
  font-size: 1.5rem;
  line-height: 1.75rem;
  font-family: 'NanumSquareRoundB';
  font-weight: 400;
  text-decoration: none;
  color: ${({theme}) => theme.colors.text};
`;
