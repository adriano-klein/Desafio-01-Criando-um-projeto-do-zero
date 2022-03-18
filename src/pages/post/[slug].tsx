/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { BsCalendarEvent, BsClock } from 'react-icons/bs';
import { BiUser } from 'react-icons/bi';
import { format, getHours, getMinutes } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Header from '../../components/Header';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
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
  prevPost: Post;
  nextPost: Post;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Post({ post, prevPost, nextPost }: PostProps) {
  const router = useRouter();

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function readingTime() {
    if (router.isFallback) {
      return 0;
    }

    const totalWords = post.data.content.reduce((accWords, postContent) => {
      let postHeading = 0;
      let postBody = 0;

      if (postContent.heading) {
        postHeading = postContent.heading.trim().split(/\s+/).length;
      }

      if (RichText.asText(postContent.body)) {
        postBody = RichText.asText(postContent.body).trim().split(/\s+/).length;
      }

      return accWords + postHeading + postBody;
    }, 0);

    const wordsPerMinute = 200;
    return Math.ceil(totalWords / wordsPerMinute);
  }

  // TODO:
  return (
    <main>
      <Head>
        <script
          async
          defer
          src="https://static.cdn.prismic.io/prismic.js?new=true&repo=spacetraveling2022v1"
        />
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <Header />
      <img
        src={post.data.banner.url}
        alt="Banner principal"
        className={styles.banner}
      />
      <section className={commonStyles.containerContent}>
        <div className={styles.post}>
          <h1> {post.data.title} </h1>
          <div className={styles.dateAndAuthor}>
            <div>
              <BsCalendarEvent />
              <time>
                {format(new Date(post.first_publication_date), 'd MMM yyy', {
                  locale: ptBR,
                })}
              </time>
            </div>

            <div>
              <BiUser />
              {post.data.author}
            </div>
            <section>
              <BsClock />
              {readingTime()} min
            </section>
          </div>
          <div className={styles.editedAt}>
            <p>
              *Editado em
              {format(new Date(post.last_publication_date), 'd MMM yyy', {
                locale: ptBR,
              })}
              , às {getHours(new Date(post.last_publication_date))}:
              {getMinutes(new Date(post.last_publication_date))}
            </p>
          </div>
          <div className={styles.contentBody}>
            {post.data.content.map(postContent => {
              return (
                <div key={postContent.heading} className={styles.postContent}>
                  <h2>{postContent.heading}</h2>
                  <article
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(postContent.body),
                    }}
                  />
                  <div>
                    <div className={styles.previousAndNext}>
                      <div>
                        {prevPost ? (
                          <>
                            <p className={styles.title}>
                              {prevPost.data.title}
                            </p>
                            <Link
                              href={`http://localhost:3000/post/${prevPost.uid}`}
                            >
                              <a>Post anterior</a>
                            </Link>
                          </>
                        ) : null}
                      </div>

                      <div>
                        {nextPost ? (
                          <>
                            <p className={styles.title}>
                              {nextPost.data.title}
                            </p>
                            <Link
                              href={`http://localhost:3000/post/${nextPost.uid}`}
                            >
                              <a>Próximo post</a>
                            </Link>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Comments />
        </div>
      </section>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  // TODO:
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('post', String(slug), {});

  const nextResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const prevResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = nextResponse?.results[0] || null;
  const prevPost = prevResponse?.results[0] || null;

  return {
    props: {
      post: response,
      prevPost,
      nextPost,
    },
    revalidate: 60 * 60 * 24, // 24h = second * minute * hour
  };
};
