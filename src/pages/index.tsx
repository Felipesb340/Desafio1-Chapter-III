/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {  FiCalendar, FiUser } from 'react-icons/fi';
import { parseISO, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState(postsPagination);
  const [hasNext, setHasNext] = useState(!!postsPagination.next_page);

  function loadAllPosts(link: string) {
    fetch(link).then(response => response.json())
      .then(data => {
        const newPosts = { ...posts };

        setPosts({
          ...newPosts,
          next_page: data.next_page,
          results: [...newPosts.results, ...data.results]
        })
        setHasNext(!!data.next_page)
      })
  }

  return (
    <>
      <Head>
        <title> Home | spacetraveling </title>
      </Head>
      <main className={commonStyles.container} >
        <div className={styles.posts} >
          {
            posts.results.map(post => (
              <Link href={`/post/${post.uid}`}>
                <a key={post.uid}  >
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.infoContainer} >
                    <div className={styles.info} >
                      <FiCalendar />
                      <time>{format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                        locale: ptBR,
                      }).toString()}</time>
                    </div>
                    <div className={styles.info} >
                      <FiUser />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))
          }
          {
            hasNext &&
            <button
              type='button'
              className={styles.loadMorePostsButton}
              onClick={() => loadAllPosts(posts.next_page)}
            >
              <a href="/">Carregar mais posts</a>
            </button>
          }
        </div>
      </main>
    </>)

}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    lang: 'pt-BR',
    pageSize: 2,
  });


  const postsPagination = { ...postsResponse }


  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60 * 24,
  }
};

