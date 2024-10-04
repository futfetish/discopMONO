import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async () => {
    return {
      redirect: {
        destination: '/friends',
        permanent: false,
      },
    };
};


export default function Home() {
  return <div>...</div>;
}