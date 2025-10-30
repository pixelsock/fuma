'use client';

interface Language {
  name: string;
  code: string;
}

interface LanguageSelectorProps {
  languages: Language[];
}

export function LanguageSelector({ languages }: LanguageSelectorProps) {
  const handleLanguageChange = (code: string) => {
    if (code !== 'en') {
      const domain = window.location.hostname;
      // Convert domain format: charlotteudo.org -> charlotteudo-org
      const translatedDomain = domain.replace(/\./g, '-');
      const translateUrl = `https://${translatedDomain}.translate.goog${window.location.pathname}${window.location.search}?_x_tr_sl=en&_x_tr_tl=${code}&_x_tr_hl=en&_x_tr_pto=wapp`;
      window.location.href = translateUrl;
    }
  };

  if (languages.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="language-select" className="text-fd-muted-foreground text-sm font-medium">
        Language
      </label>
      <select
        id="language-select"
        className="bg-fd-secondary text-fd-foreground px-3 py-1.5 rounded-md text-sm border border-fd-border focus:ring-2 focus:ring-fd-ring focus:outline-none cursor-pointer"
        defaultValue="en"
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        <option value="en">English</option>
        {languages.map((lang, index) => (
          <option key={index} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
