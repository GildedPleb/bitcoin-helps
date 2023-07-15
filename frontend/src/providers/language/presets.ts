import { type LanguageOptionType, type LanguageStatus } from "./types";

const LANGUAGE_OPTIONS_PARTIAL: Array<Omit<LanguageOptionType, "status">> = [
  {
    value: "ar",
    label: "العربية",
    direction: "rtl",
    speak: "أنا أتكلم",
    loading: "جارٍ تحميل الإعدادات المحددة للغة",
  }, // Arabic
  {
    value: "bn",
    label: "বাংলা",
    direction: "ltr",
    speak: "আমি কথা বলি",
    loading: "ভাষা নির্দিষ্ট সেটিংস লোড হচ্ছে",
  }, // Bengali
  {
    value: "de",
    label: "Deutsch",
    direction: "ltr",
    speak: "Ich spreche",
    loading: "Laden der sprachspezifischen Einstellungen",
  }, // German
  {
    value: "en",
    label: "English",
    direction: "ltr",
    speak: "I speak",
    loading: "Loading language specific settings",
  }, // English
  {
    value: "es",
    label: "Español",
    direction: "ltr",
    speak: "Yo hablo",
    loading: "Cargando configuraciones específicas del idioma",
  }, // Spanish
  {
    value: "fr",
    label: "Français",
    direction: "ltr",
    speak: "Je parle",
    loading: "Chargement des paramètres spécifiques à la langue",
  }, // French
  {
    value: "hi",
    label: "हिन्दी",
    direction: "ltr",
    speak: "मैं बोलता हूँ", // "I speak" in Hindi
    loading: "भाषा विशिष्ट सेटिंग्स लोड हो रही हैं", // "Loading language specific settings" in Hindi
  }, // Hindi
  {
    value: "id",
    label: "Bahasa Indonesia",
    direction: "ltr",
    speak: "Saya berbicara", // "I speak" in Indonesian
    loading: "Memuat pengaturan spesifik bahasa", // "Loading language specific settings" in Indonesian
  }, // Indonesian
  {
    value: "ja",
    label: "日本語",
    direction: "ltr",
    speak: "私は話す", // "I speak" in Japanese
    loading: "言語固有の設定を読み込んでいます", // "Loading language specific settings" in Japanese
  }, // Japanese
  {
    value: "jv",
    label: "Basa Jawa",
    direction: "ltr",
    speak: "Aku ngomong", // "I speak" in Javanese
    loading: "Ngunduh setelan khusus basa", // "Loading language specific settings" in Javanese
  }, // Javanese
  {
    value: "ko",
    label: "한국어",
    direction: "ltr",
    speak: "나는 말한다", // "I speak" in Korean
    loading: "언어별 설정을 로드하는 중", // "Loading language specific settings" in Korean
  }, // Korean
  {
    value: "mr",
    label: "मराठी",
    direction: "ltr",
    speak: "माझी बोलणे", // "I speak" in Marathi
    loading: "भाषेच्या विशिष्ट सेटिंग्ज लोड करीत आहे", // "Loading language specific settings" in Marathi
  }, // Marathi
  {
    value: "ms",
    label: "Bahasa Melayu",
    direction: "ltr",
    speak: "Saya bercakap",
    loading: "Memuatkan tetapan khusus bahasa",
  }, // Malay
  {
    value: "pa",
    label: "ਪੰਜਾਬੀ",
    direction: "ltr",
    speak: "ਮੈਂ ਬੋਲਦਾ ਹਾਂ",
    loading: "ਭਾਸ਼ਾ ਵਿਸ਼ੇਸ਼ ਸੈਟਿੰਗਜ਼ ਲੋਡ ਕਰ ਰਿਹਾ ਹੈ",
  }, // Punjabi
  {
    value: "pt",
    label: "Português",
    direction: "ltr",
    speak: "Eu falo",
    loading: "Carregando configurações específicas de idioma",
  }, // Portugies
  {
    value: "ru",
    label: "Русский",
    direction: "ltr",
    speak: "Я говорю",
    loading: "Загрузка специфических для языка настроек",
  }, // Russian
  {
    value: "ta",
    label: "தமிழ்",
    direction: "ltr",
    speak: "நான் பேசுகிறேன்",
    loading: "மொழி குறிப்பிட்ட அமைப்புகளை ஏற்றுகின்றது",
  }, // Tamil
  {
    value: "te",
    label: "తెలుగు",
    direction: "ltr",
    speak: "నేను మాట్లాడుతున్నాను",
    loading: "భాషా ప్రత్యేక అమరికలను లోడ్ చేస్తోంది",
  }, // Telugu
  {
    value: "th",
    label: "ไทย",
    direction: "ltr",
    speak: "ฉันพูด", // Thai
    loading: "กำลังโหลดการตั้งค่าเฉพาะภาษา",
  }, // Thai
  {
    value: "tr",
    label: "Türkçe",
    direction: "ltr",
    speak: "Ben konuşuyorum", // Turkish
    loading: "Dil özel ayarları yükleniyor",
  }, // Turkish
  {
    value: "uk",
    label: "Українська",
    direction: "ltr",
    speak: "Я говорю", // Ukrainian
    loading: "Завантаження мовних налаштувань",
  }, // Ukrainian
  {
    value: "ur",
    label: "اردو",
    direction: "rtl",
    speak: "میں بات کرتا ہوں", // Pakistani Urdu
    loading: "زبان کی خاص ترتیبات لوڈ کر رہا ہے",
  }, // Pakistani
  {
    value: "vi",
    label: "Tiếng Việt",
    direction: "ltr",
    speak: "Tôi nói", // Vietnamese
    loading: "Đang tải cài đặt đặc biệt cho ngôn ngữ",
  }, // Vietnamese
  {
    value: "zh-CN",
    label: "简体中文",
    direction: "ltr",
    speak: "我会说", // Simplified Chinese
    loading: "正在加载语言特定设置",
  }, // Simplified Chinese
  {
    value: "zh-TW",
    label: "繁體中文",
    direction: "ltr",
    speak: "我說", // I speak in Traditional Chinese
    loading: "正在載入語言特定設定", // Loading language specific settings in Traditional Chinese
  }, // Traditional Chinese
  {
    value: "it",
    label: "Italiano",
    direction: "ltr",
    speak: "Parlo", // I speak in Italian
    loading: "Caricamento delle impostazioni specifiche della lingua", // Loading language specific settings in Italian
  }, // Italian
  {
    value: "pl",
    label: "Polski",
    direction: "ltr",
    speak: "Mówię", // I speak in Polish
    loading: "Ładowanie ustawień specyficznych dla języka", // Loading language specific settings in Polish
  }, // Polish
  {
    value: "ro",
    label: "Română",
    direction: "ltr",
    speak: "Eu vorbesc", // I speak in Romanian
    loading: "Încărcare setări specifice limbii", // Loading language specific settings in Romanian
  }, // Romanian
  {
    value: "nl",
    label: "Nederlands",
    direction: "ltr",
    speak: "Ik spreek", // I speak in Dutch
    loading: "Taal specifieke instellingen laden", // Loading language specific settings in Dutch
  }, // Dutch
  {
    value: "el",
    label: "Ελληνικά",
    direction: "ltr",
    speak: "Μιλάω", // I speak in Greek
    loading: "Φόρτωση ειδικών ρυθμίσεων γλώσσας", // Loading language specific settings in Greek
  }, // Greek
  {
    value: "hu",
    label: "Magyar",
    direction: "ltr",
    speak: "Beszélek",
    loading: "Nyelvi beállítások betöltése",
  }, // Hungarian
  {
    value: "sv",
    label: "Svenska",
    direction: "ltr",
    speak: "Jag talar",
    loading: "Laddar språkspecifika inställningar",
  }, // Swedish
  {
    value: "cs",
    label: "Čeština",
    direction: "ltr",
    speak: "Mluvím",
    loading: "Načítání jazykových nastavení",
  }, // Czech
  {
    value: "az",
    label: "Azərbaycan",
    direction: "ltr",
    speak: "Mən danışıram",
    loading: "Dil spesifik ayarlar yüklənir",
  }, // Azerbaijani
  {
    value: "sr",
    label: "Српски / srpski",
    direction: "ltr",
    speak: "Ja govorim",
    loading: "Učitavanje jezičkih postavki",
  }, // Serbian
  {
    value: "hr",
    label: "Hrvatski",
    direction: "ltr",
    speak: "Govorim",
    loading: "Učitavanje postavki specifičnih za jezik",
  }, // Croatian
  {
    value: "fi",
    label: "Suomi",
    direction: "ltr",
    speak: "Puhun",
    loading: "Ladataan kieli-kohtaisia asetuksia",
  }, // Finnish
  {
    value: "hy",
    label: "Հայերեն",
    direction: "ltr",
    speak: "Ես խոսում եմ",
    loading: "Բեռնվում են լեզվական կոնֆիգուրացիաները",
  }, // Armenian
  {
    value: "km",
    label: "ខ្មែរ",
    direction: "ltr",
    speak: "ខ្ញុំ​និយាយ",
    loading: "កំពុង​ផ្ទុក​ការ​កំណត់​ភាសា​រួម",
  }, // Camdodian
  {
    value: "fil",
    label: "Filipino",
    direction: "ltr",
    speak: "Nagsasalita ako ng",
    loading: "Naglo-load ng mga setting ng partikular na wika",
  }, // Filipino
  {
    value: "sw",
    label: "Kiswahili",
    direction: "ltr",
    speak: "Ninazungumza",
    loading: "Inapakia mipangilio ya lugha",
  }, // Swahili
  {
    value: "ha",
    label: "Hausa",
    direction: "rtl",
    speak: "Ina magana",
    loading: "Loading saitunan harshen",
  }, // Hausa
  {
    value: "am",
    label: "አማርኛ",
    direction: "ltr",
    speak: "እኔ እናገራለሁ", // I speak in Amharic
    loading: "ቋንቋ አማርኛ ቀድሞ እየተከበበን ነው", // Loading language specific settings in Amharic
  }, // Amharic
  {
    value: "yo",
    label: "Yorùbá",
    direction: "ltr",
    speak: "Mo sọ", // I speak in Yoruba
    loading: "Oniyi-ẹrọ aṣeyọri ti ede naa nlo", // Loading language specific settings in Yoruba
  }, // Yoruba
  {
    value: "ig",
    label: "Igbo",
    direction: "ltr",
    speak: "Ana m asụ", // I speak in Igbo
    loading: "Na-echiwa ntọala mmasị mmasị asụsụ", // Loading language specific settings in Igbo
  }, // Igbo
  {
    value: "ff",
    label: "Fulfulde",
    direction: "ltr",
    speak: "Miɗo waawi yiyde", // I speak in Fulfulde
    loading: "Nana yiyde njumre nder Fulfulde", // Loading language specific settings in Fula
  }, // Fula
  {
    value: "zu",
    label: "isiZulu",
    direction: "ltr",
    speak: "Ngikhuluma", // I speak in Zulu
    loading: "Ilanga lokuqalisa izilungiselelo ezikhethwe kwenkulumo", // Loading language specific settings in Zulu
  }, // Zulu
  {
    value: "he",
    label: "עִבְרִית",
    direction: "rtl",
    speak: "אני מדבר", // I speak in Hebrew
    loading: "טוען הגדרות ספציפיות לשפה", // Loading language specific settings in Hebrew
  }, // Hebrew
  {
    value: "fa",
    label: "فارسی",
    direction: "rtl",
    speak: "من صحبت می کنم",
    loading: "در حال بارگذاری تنظیمات خاص زبان ",
  }, // Persian/Farsi
  {
    value: "ps",
    label: "دری",
    direction: "rtl",
    speak: "زه خبرې کوم",
    loading: "د زبان خاصه تنظیماتو بارکښتېدنې په حال کې دی ",
  }, // Dari
  {
    value: "tg",
    label: "тоҷикӣ",
    direction: "ltr",
    speak: "Ман гап мезанам",
    loading: "Танзимоти хусусии забон дар хол меборад ",
  }, // Tajik
  {
    value: "ku",
    label: "Kurdish",
    direction: "ltr",
    speak: "Ez diaxivim",
    loading: "Mîhengên zimanê taybetî bar dibe ",
  }, // Kurdish
  {
    value: "ht",
    label: "Haitian Creole",
    direction: "ltr",
    speak: "Mwen pale",
    loading: "Chaje reglaj espesifik lang ",
  }, // Haitian Creole
  {
    value: "so",
    label: "Somali",
    direction: "ltr",
    speak: "Waan hadlayaa",
    loading: "Loading luqadda gaarka ah go'aanno ",
  }, // Somali
  {
    value: "lo",
    label: "ລາວ",
    direction: "ltr",
    speak: "ຂ້າພະເຈົ້າເວົ້າ",
    loading: "ກຳລັງໂຫຼດການຕັ້ງຄ່າພິເສດພາສາ",
  }, // Lao
  {
    value: "my",
    label: "ဗမာ",
    direction: "ltr",
    speak: "ကျွန်ုပ်စကားပြော",
    loading: "ဘာသာစကားအထူးသတ်မှတ်ချက်များကိုဖတ်ခြင်း",
  }, // Myanmar (Burmese)
  {
    value: "fy",
    label: "Frisian",
    direction: "ltr",
    speak: "Ik sprek",
    loading: "It laden fan taalspesifike ynstellingen",
  }, // Frisian
  {
    value: "da",
    label: "Dansk",
    direction: "ltr",
    speak: "Jeg taler",
    loading: "Indlæser sprogindstillinger",
  }, // Danish (Dansk)
  {
    value: "no",
    label: "Norsk",
    direction: "ltr",
    speak: "Jeg snakker",
    loading: "Laster språkinnstillinger",
  }, // Norwegian (Norsk)
  {
    value: "is",
    label: "Íslenska",
    direction: "ltr",
    speak: "Ég tala",
    loading: "Hleð inn tungumálaspecifískar stillingar",
  }, // Icelandic (Íslenska)
  {
    value: "lb",
    label: "اللبناني", // Lebanese
    direction: "rtl", // Arabic script is written from right to left
    speak: "أنا أتكلم", // I speak
    loading: "جاري تحميل الإعدادات الخاصة باللغة", // Loading language specific settings
  },
];

export const DEFAULT_LANGUAGE_STATUS = "available" as LanguageStatus;

// Initialize a default status for each language option
export const LANGUAGE_OPTIONS: LanguageOptionType[] =
  LANGUAGE_OPTIONS_PARTIAL.map((option) => ({
    ...option,
    status: DEFAULT_LANGUAGE_STATUS,
  }));

export const RTL_LANGUAGES = [
  "ar",
  "fa",
  "ur",
  "ks",
  "yi",
  "he",
  "dv",
  "syc",
  "men",
  "lb",
];
