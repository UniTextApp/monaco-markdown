import { languages } from "monaco-editor";

interface ILang extends languages.ILanguageExtensionPoint {
  loader: () => Promise<ILangImpl>;
}

interface ILangImpl {
  conf: languages.LanguageConfiguration;
  language: languages.IMonarchLanguage;
}

let languageDefinitions: { [languageId: string]: ILang } = {};

function _loadLanguage(languageId: string): Promise<void> {
  const loader = languageDefinitions[languageId].loader;
  return loader().then((mod) => {
    languages.setMonarchTokensProvider(languageId, mod.language);
    languages.setLanguageConfiguration(languageId, mod.conf);
  });
}

let languagePromises: { [languageId: string]: Promise<void> } = {};

export function loadLanguage(languageId: string): Promise<void> {
  if (!languagePromises[languageId]) {
    languagePromises[languageId] = _loadLanguage(languageId);
  }
  return languagePromises[languageId];
}

export function registerLanguage(def: ILang): void {
  let languageId = def.id;

  languageDefinitions[languageId] = def;
  languages.register(def);
  languages.onLanguage(languageId, () => {
    loadLanguage(languageId);
  });
}
