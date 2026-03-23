import bannerImage from '../../assets/banner.png';
import SearchBar from '@/frontend/components/SearchBar/SearchBar';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <main className="home">
      <SearchBar />
      <Link
        to={'https://ko-fi.com/jamstudio'}
        className="home__banner"
        target="_blank"
      >
        <img src={bannerImage} alt="Jam chat ko-fi banner image" />
      </Link>
      <section className="home__content">
        <div className="home__nav">
          <button className="home__nav__button">Explore</button>
          <button className="home__nav__button">Live Streaming</button>
          <button className="home__nav__button">PK Battles</button>
          <button className="home__nav__button">Party</button>
        </div>
      </section>
    </main>
  );
}
