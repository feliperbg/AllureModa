import React from 'react';

const CookieConsent = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('cookie_consent');
    if (stored !== 'true' && stored !== 'false') {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto p-4 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-sm text-gray-700">
          Utilizamos cookies para personalizar conteúdos e oferecer uma experiência sob medida.
        </p>
        <div className="flex items-center gap-3 ml-auto">
          <button onClick={decline} className="px-4 py-2 text-sm border border-gray-300">Recusar</button>
          <button onClick={accept} className="px-4 py-2 text-sm bg-black text-white">Aceitar todos</button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
