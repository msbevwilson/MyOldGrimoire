import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookItem from '../../components/Books/BookItem/BookItem';
import Banner from '../../images/home_banner.jpg';
import styles from './Home.module.css';
import { getBooks } from '../../lib/common';

function Home() {
  const [books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const displayBooks = () => (books ? books.map((book) => <BookItem size={2} book={book} key={book.id} />) : <h1>Empty</h1>);

  useEffect(() => {
    async function getBooksList() {
      const data = await getBooks();
      if (data) {
        setBooks(data);
        setLoading(false);
      }
    }
    getBooksList();
  }, []);
  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };
  return (
    <div className={styles.Home}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <header className={styles.head}>
          <h1>Our Books</h1>
          <p>to read and reread</p>
          <Link to="/Add" className="button">+ Add a book</Link>
        </header>
        <section className={styles.bookList}>
          {loading ? <h1>Loading</h1> : displayBooks()}
        </section>
      </main>
    </div>
  );
}

export default Home;
