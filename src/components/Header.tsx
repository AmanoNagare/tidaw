interface HeaderProps {
  title?: string;
}

function Header({ title = "TIDAW" }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
    </header>
  );
}

export default Header;
