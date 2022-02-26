/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Link from 'next/link';
import styles from './header.module.scss';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Header() {
  // TODO:
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img src="../images/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
