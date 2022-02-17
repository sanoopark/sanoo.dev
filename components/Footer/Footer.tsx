import styled from 'styled-components';

export default function Footer({social}: FooterProps) {
  return (
    <Wrapper>
      <IconsWrapper></IconsWrapper>
    </Wrapper>
  );
}

interface FooterProps {
  social: {name: string; url: string}[];
}

const IconsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4.5rem;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const Wrapper = styled.footer`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  border-top: ${({theme}) => `1px solid ${theme.colors.muted}`};
  padding: 4rem 0 5rem 0;
  width: calc(100% - 3rem);
  max-width: 65rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: ${({theme}) => theme.colors.muted};

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;
