/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { BsCalendarEvent } from 'react-icons/bs';
import { BiUser } from 'react-icons/bi';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Link from 'next/link';
import { useState } from 'react';

import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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
  preview: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [pagination, setPagination] = useState<string>(
    postsPagination.next_page
  );

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function loadNewPosts(url: string | null) {
    if (pagination) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const newPosts = data.results.map(result => {
            return {
              uid: result.uid,
              first_publication_date: result.first_publication_date,
              data: {
                title: result.data.title,
                subtitle: result.data.subtitle,
                author: result.data.author,
              },
            };
          });
          setPosts([...posts, ...newPosts]);
          setPagination(data.next_page);
        });
    }
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <section className={commonStyles.containerContent}>
        <Header />
        <div className={styles.post}>
          {posts.map((post: Post) => {
            return (
              <div className={styles.onePost} key={post.uid}>
                <Link key={post.uid} href={`/post/${String(post.uid)}`}>
                  <a>
                    <h1> {post.data.title} </h1>
                  </a>
                </Link>
                <span className={styles.subtitle}> {post.data.subtitle} </span>
                <div className={styles.postDateAndAuthor}>
                  <div>
                    <BsCalendarEvent />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'd MMM yyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </div>
                  <div>
                    <BiUser />
                    <span> {post.data.author} </span>
                  </div>
                </div>
              </div>
            );
          })}
          {pagination ? (
            <button type="button" onClick={() => loadNewPosts(pagination)}>
              Carregar mais posts
            </button>
          ) : null}

          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
      pageSize: 4,
      ref: previewData?.ref ?? null,
    }
  );

  // TODO:
  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
      preview,
    },
  };
};
