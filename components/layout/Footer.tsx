export default function Footer() {
    return (
      <footer className="w-full bg-neutral-800 text-white py-4 px-6 border-b-4 border-red-700 text-center">
        <p>
          &copy; {new Date().getFullYear()} <span className="text-red-600 font-semibold">The Grinders</span> Training Platform. Todos os direitos reservados.
        </p>
      </footer>
    );
  }