import styles from './header.module.scss';
export default function Header() {
  // TODO:
  return (
    <header className={styles.headerContainer}>
      <a href="/">
        <img src="../images/Logo.svg" alt="" />
      </a>
    </header>
  );
}
