function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-logo">📚 ReadTogether</span>
        <p className="footer-tagline">Read together. Share stories.</p>
        <p className="footer-copy">© {year} ReadTogether. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;