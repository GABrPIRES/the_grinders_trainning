export default function Footer() {
    return (
      <footer className="w-full bg-black text-gray-400 text-center py-4 text-sm mt-auto">
        <p>
          &copy; {new Date().getFullYear()} <span className="text-red-600 font-semibold">The Grinders</span> Training Platform. Todos os direitos reservados.
        </p>
      </footer>
    );
  }