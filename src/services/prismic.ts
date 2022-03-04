import Prismic from '@prismicio/client';
import { Document } from '@prismicio/client/types/documents';
import { DefaultClient } from '@prismicio/client/types/client';

const url = process.env.PRISMIC_API_ENDPOINT;
const accessToken = process.env.PRISMIC_ACCESS_TOKEN;

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(url, {
    req,
    accessToken,
  });

  return prismic;
}

export function linkResolver(doc: Document): string {
  if (doc.type === 'post') {
    return `/post/${doc.uid}`;
  }
  return '/';
}
