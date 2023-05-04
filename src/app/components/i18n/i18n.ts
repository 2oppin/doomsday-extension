const lang = (global as any).DD_LANG || "en";
const translations = {
  ...(require(`./lang/default/${lang}/help`)).default,
  ...(require(`./lang/default/${lang}/main`)).default,
}

export function i18n(key: string, alt = '') {
  return translations[key] || alt || key;
}

export {HelpInfo} from "./values";