export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container text-center text-secondary">
        © {new Date().getFullYear()} Kevin Hagstrom
      </div>
    </footer>
  );
}
