import Link from 'next/link';
import Styles from './header.module.scss';

export default function Header() {
  return (
    <header className={Styles.header} >
      <Link href='/' >
        <a className={Styles.link}>
          <img src="/images/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
