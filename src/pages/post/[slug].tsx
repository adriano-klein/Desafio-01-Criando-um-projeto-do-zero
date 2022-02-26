import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import { BsCalendarEvent, BsClock } from 'react-icons/bs';
import { BiUser } from 'react-icons/bi';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

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
  // TODO:
  return (
    <>
      <img
        src={post.data.banner.url}
        alt="Banner principal"
        className={styles.banner}
      />
      <main className={styles.post}>
        <div>
          <section>
            <h1> {post.data.title} </h1>
          </section>
          <div className={styles.dateAndAuthor}>
            <section>
              <BsCalendarEvent /> {post.first_publication_date}{' '}
            </section>
            <section>
              <BiUser />
              {post.data.author}
            </section>
            <section>
              <BsClock />
              4min
            </section>
          </div>
          <div
            className={styles.contentBody}
            dangerouslySetInnerHTML={{ __html: post.data.content.body.text }}
          />
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
      pageSize: 10,
    }
  );

  // TODO:
  return {
    paths: [
      {
        params: { slug: 'construindo-app-com-mapa-usando-react-native-maps-e' },
      },
    ],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('post', String(slug), {});

  // console.log(JSON.stringify(response, null, 2));
  const post = {
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: {
        heading: response.data.content[0].heading,
        body: {
          text: RichText.asHtml(response.data.content[0].body),
        },
      },
    },
  };

  return {
    props: { post },
  };
};
