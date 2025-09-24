const API_URL = 'http://localhost:4000';
export const API_ROUTES = {
  SIGN_UP: `${API_URL}/api/auth/signup`,
  SIGN_IN: `${API_URL}/api/auth/login`,
  BOOKS: `${API_URL}/api/books`,
  BEST_RATED: `${API_URL}/api/books/bestrating`,
};

export const APP_ROUTES = {
  SIGN_UP: '/SignUp',
  SIGN_IN: '/SignIn',
  ADD_BOOK: '/Add',
  BOOK: '/book/:id',
  UPDATE_BOOK: '/book/edit/:id',
};
