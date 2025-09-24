import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AddBook.module.css';
import BookForm from '../../components/Books/BookForm/BookForm';
import BackArrow from '../../components/BackArrow/BackArrow';
import { useUser } from '../../lib/customHooks';
import { APP_ROUTES } from '../../utils/constants';
import bookAdd from '../../images/book_add.jpg';

function AddBook() {
  const navigate = useNavigate();
  const { connectedUser, auth, userLoading } = useUser();
  const [created, setCreated] = useState(false);
  useEffect(() => {
    if (!userLoading) {
      if (!connectedUser || !auth) {
        navigate(APP_ROUTES.SIGN_IN);
      }
    }
  }, [userLoading]);

  return (
    <div className="content-container">
      <BackArrow />
      <div className={styles.Container}>
        {!created ? (
          <>
            <h1>Add a book</h1>
            <p>All fields are required</p>
            <BookForm validate={setCreated} />
          </>
        ) : (
          <div className={styles.Created}>
            <h1>Thank you!</h1>
            <p>Your book has been successfully published</p>
            <img src={bookAdd} alt="Book added" />
            <Link to="/" className="button">Return to home</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddBook;
