export const translations = {
  tr: {
    welcome: 'Hoşgeldiniz',
    auth: {
      register:           'Hesap Oluştur',
      login:              'Giriş Yap',
      email:              'E-posta',
      password:           'Şifre',
      name:               'Ad Soyad',
      registerSuccess:    'Hesap oluşturuldu!',
      alreadyHaveAccount: 'Zaten hesabın var mı? Giriş Yap',
      registerFailed:     'Kayıt başarısız',
    },
    match: {
      like:          'Beğen',
      pass:          'Geç',
      compatibility: 'Uyumluluk',
      message:       'Mesaj Gönder',
    },
    settings: {
      language:      'Dil',
      logout:        'Çıkış Yap',
      notifications: 'Bildirimler',
      privacy:       'Gizlilik',
    },
  },
  pl: {
    welcome: 'Witaj',
    auth: {
      register:           'Utwórz konto',
      login:              'Zaloguj się',
      email:              'E-mail',
      password:           'Hasło',
      name:               'Imię i nazwisko',
      registerSuccess:    'Konto utworzone!',
      alreadyHaveAccount: 'Masz już konto? Zaloguj się',
      registerFailed:     'Rejestracja nie powiodła się',
    },
    match: {
      like:          'Polub',
      pass:          'Pomiń',
      compatibility: 'Zgodność',
      message:       'Wyślij wiadomość',
    },
    settings: {
      language:      'Język',
      logout:        'Wyloguj się',
      notifications: 'Powiadomienia',
      privacy:       'Prywatność',
    },
  },
  en: {
    welcome: 'Welcome',
    auth: {
      register:           'Create Account',
      login:              'Login',
      email:              'Email',
      password:           'Password',
      name:               'Full Name',
      registerSuccess:    'Account created!',
      alreadyHaveAccount: 'Already have an account? Login',
      registerFailed:     'Registration failed',
    },
    match: {
      like:          'Like',
      pass:          'Pass',
      compatibility: 'Compatibility',
      message:       'Send Message',
    },
    settings: {
      language:      'Language',
      logout:        'Logout',
      notifications: 'Notifications',
      privacy:       'Privacy',
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = string;
