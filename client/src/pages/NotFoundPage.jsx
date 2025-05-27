import React from 'react';

const NotFoundPage = () => {

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>404 Not Found</h1>
      <p>The page you are looking for is not found</p>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: "column",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    fontSize: "1.5rem"
  },
  header: {
    display: "block",
    fontWeight: "bold",

  }
};

export default NotFoundPage;
