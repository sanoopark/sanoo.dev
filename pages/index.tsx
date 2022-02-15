import styled from 'styled-components';

const IndexPage = () => <Title>Index</Title>;

export default IndexPage;

const Title = styled.h1`
  font-size: 50px;
  color: ${({theme}) => theme.colors.primary};
`;
