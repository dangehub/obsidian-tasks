import i18next from 'i18next';
import en from './locales/en.json';
import zh_cn from './locales/zh_cn.json';

let isInitialized = false;

// Get Obsidian language settings
const getObsidianLanguage = (): string => {
    return localStorage.getItem('language')?.toLowerCase() || 'en';
};

// Define a function to initialize i18next
export const initializeI18n = async () => {
    if (!isInitialized) {
        await i18next.init({
            lng: getObsidianLanguage(),
            fallbackLng: 'en', // Fallback language if detection fails or translation is missing
            returnEmptyString: false, // Use fallback language if i18next-parser put in empty value for untranslated text
            resources: {
                en: { translation: en },
                zh: { translation: zh_cn }, //Enter `localStorage.getItem("language")` in the console to check the current language code.
            },
            interpolation: {
                escapeValue: false, // Disable escaping of strings, like '&' -> '&amp;'
            },
        });

        isInitialized = true;
    }
};

export const i18n = new Proxy(i18next, {
    get(target, prop) {
        if (!isInitialized && prop === 't') {
            /* If you get the following error in tests, add this code block before the first
               test in the file.
               (Or add the 'await' line to the existing first beforeAll).

                    beforeAll(async () => {
                        await initializeI18n();
                    });
             */
            throw new Error('i18n.t() called before initialization. Call initializeI18n() first.');
        }
        return Reflect.get(target, prop);
    },
});
