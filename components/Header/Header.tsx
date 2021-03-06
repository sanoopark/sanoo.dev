import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';
import {Notion} from '@styled-icons/simple-icons/Notion';
import {Github} from '@styled-icons/simple-icons/Github';
import {Newspaper} from '@styled-icons/remix-fill/Newspaper';

export default function Header() {
  const linkIcons = [
    {
      id: 1,
      icon: () => <Github />,
      iconName: 'Github',
      url: '/github',
    },
    {
      id: 2,
      icon: () => <Notion />,
      iconName: 'Study',
      url: '/study',
    },
  ];

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
          <SiteName>
            <span>sanoopark</span>
          </SiteName>
        </LogoWrapper>
      </Link>
      <LinkWrapper>
        {linkIcons.map(({id, icon, iconName, url}) => (
          <SocialIcon key={id} target="_blank" rel="noreferrer" href={url}>
            {icon()}
            <IconName>{iconName}</IconName>
          </SocialIcon>
        ))}
      </LinkWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  justify-items: end;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  width: calc(100% - 3rem);
  max-width: 64rem;
  padding: 1rem 0;
`;

const LogoWrapper = styled.a`
  display: flex;
  align-items: center;

  &:hover {
    div:nth-child(2) > span {
      display: none;
    }

    div:nth-child(2):before {
      content: 'Home';
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
  width: 3rem;
  height: 3rem;
`;

const SiteName = styled.div`
  transition: all 0.2s ease-in-out;
  margin-left: 1rem;
  font-size: 1.5rem;
  line-height: 1.75rem;
  font-weight: 400;
  text-decoration: none;
`;

const LinkWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 3rem;
  position: relative;
  top: 0.3rem;
`;

const SocialIcon = styled.a`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: ${({theme}) => theme.colors.muted};
  font-size: 1.2rem;
  margin-left: 1.4rem;

  &:last-child {
    margin-left: 1.3rem;
  }

  &:hover {
    color: ${({theme}) => theme.colors.text};
  }
`;

const IconName = styled.div`
  line-height: 1.5rem;
  font-size: 0.8rem;
`;
