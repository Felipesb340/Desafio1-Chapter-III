/* eslint-disable prettier/prettier */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { parseISO, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { getPrismicClient } from '../../services/prismic';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}




export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  const totalPostWords = post.data.content.reduce((acc, item) => {
    const heading = item.heading.trim().split(' ').length;
    const body = item.body.reduce((accumulator, { text }) => {
      return (accumulator += text.trim().split(' ').length);
    }, 0);

    return (acc += heading + body);
  }, 0);

  const minutesToReadThePost = Math.ceil(totalPostWords / 200);

  return !post ? (
    <h1>Carregando...</h1>
  ) : (
    <>
      <Head>
        <title>{post.data.title} | Spacetravelling</title>
      </Head>

      <section className={styles.header}>
        <img src={post.data.banner.url} alt="banner" />
      </section>
      <main className={commonStyles.container}>
        <article className={styles.posts} >
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.infoContainer}>
            <div className={styles.info}>
              <FiCalendar />
              <span>
                {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                }).toString()}
              </span>
            </div>
            <div className={styles.info}>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div className={styles.info}>
              <FiClock />
              <span>{minutesToReadThePost} min</span>
            </div>
          </div>
          <div className={styles.content}>
            {post.data.content.map(({ heading, body }) => {
              return (
                <div key={heading} className={styles.heading_content}>
                  <h3>{heading}</h3>
                  {body.map(({ text }, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </div>
              );
            })}
          </div>
        </article>
      </main>
    </>
  );
}



export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    lang: 'pt-BR',
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true
  }

};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content,
      }
    }

  return {
    props: {
      post
    },
    redirect: 60 * 30,
  };

};