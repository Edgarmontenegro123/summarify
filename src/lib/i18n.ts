import type {SummaryLanguage} from '@/types'

interface Translations {
  'header.viewHistory': string
  'header.signOut': string
  'header.themeToLight': string
  'header.themeToDark': string
  'header.languageLabel': string

  'hero.title1': string
  'hero.titleHighlight': string
  'hero.subtitle': string

  'buttons.brief': string
  'buttons.detailed': string

  'upload.onlyPdfError': string
  'upload.scannedError': string
  'upload.readError': string
  'upload.extracting': string
  'upload.replaceHint': string
  'upload.dragHint': string
  'upload.pasteHint': string
  'upload.pasteLabel': string
  'upload.clear': string
  'upload.placeholder': string
  'upload.charCount': string

  'summaryPanel.titleBrief': string
  'summaryPanel.titleDetailed': string
  'summaryPanel.titleGeneric': string
  'summaryPanel.copyAria': string
  'summaryPanel.readAloud': string
  'summaryPanel.pause': string
  'summaryPanel.resume': string
  'summaryPanel.stopAria': string
  'summaryPanel.save': string
  'summaryPanel.saved': string

  'export.button': string
  'export.asPdf': string
  'export.asMarkdown': string
  'export.asText': string
  'export.dateLabel': string
  'export.languageLabel': string
  'export.languageEs': string
  'export.languageEn': string
  'export.summaryHeading': string
  'export.fileBaseName': string

  'summarize.emptyResultError': string
  'summarize.genericError': string
  'summarize.saveError': string
  'summarize.savePending': string
  'summarize.notEnglishWarning': string
  'summarize.footer': string

  'history.back': string
  'history.title': string
  'history.subtitle': string
  'history.loadError': string
  'history.empty': string
  'history.reload': string
  'history.tagBrief': string
  'history.tagDetailed': string
  'history.offlineBadge': string

  'offline.banner': string

  'update.available': string
  'update.later': string
  'update.reload': string

  'login.title': string
  'login.subtitle': string
  'login.email': string
  'login.emailPlaceholder': string
  'login.password': string
  'login.passwordPlaceholder': string
  'login.forgotPassword': string
  'login.submit': string
  'login.noAccount': string
  'login.registerLink': string

  'register.title': string
  'register.subtitle': string
  'register.email': string
  'register.emailPlaceholder': string
  'register.password': string
  'register.passwordPlaceholder': string
  'register.confirmPassword': string
  'register.confirmPasswordPlaceholder': string
  'register.passwordTooShort': string
  'register.passwordMismatch': string
  'register.submit': string
  'register.hasAccount': string
  'register.loginLink': string
  'register.checkEmailTitle': string
  'register.checkEmailSubtitle': string
  'register.checkEmailBody': string
  'register.goToLogin': string

  'forgotPassword.title': string
  'forgotPassword.subtitle': string
  'forgotPassword.email': string
  'forgotPassword.emailPlaceholder': string
  'forgotPassword.submit': string
  'forgotPassword.backToLogin': string
  'forgotPassword.successTitle': string
  'forgotPassword.successSubtitle': string
  'forgotPassword.successBody': string

  'resetPassword.title': string
  'resetPassword.subtitle': string
  'resetPassword.invalidLinkTitle': string
  'resetPassword.invalidLinkSubtitle': string
  'resetPassword.requestNewLink': string
  'resetPassword.newPassword': string
  'resetPassword.confirmPassword': string
  'resetPassword.passwordTooShort': string
  'resetPassword.passwordMismatch': string
  'resetPassword.submit': string
  'resetPassword.successTitle': string
  'resetPassword.successSubtitle': string
  'resetPassword.continueButton': string

  'logout.confirmTitle': string
  'logout.confirmBody': string
  'logout.cancel': string
  'logout.confirm': string
}

export const translations: Record<SummaryLanguage, Translations> = {
  es: {
    'header.viewHistory': 'Ver historial',
    'header.signOut': 'Cerrar sesión',
    'header.themeToLight': 'Cambiar a modo claro',
    'header.themeToDark': 'Cambiar a modo oscuro',
    'header.languageLabel': 'Idioma',

    'hero.title1': 'Resúmenes claros,',
    'hero.titleHighlight': 'al instante.',
    'hero.subtitle':
      'Sube un PDF o pega tu texto. Summarify lo resume al instante y te lo lee en voz alta, en español.',

    'buttons.brief': 'Resumen Breve',
    'buttons.detailed': 'Resumen Detallado',

    'upload.onlyPdfError': 'Solo se admiten archivos PDF.',
    'upload.scannedError':
      'No se pudo extraer texto de este PDF (¿quizás es una imagen escaneada?).',
    'upload.readError':
      'Ocurrió un error al leer el PDF. Intenta con otro archivo.',
    'upload.extracting': 'Extrayendo texto del PDF…',
    'upload.replaceHint': 'Haz clic para reemplazar el archivo',
    'upload.dragHint': 'Arrastra tu PDF aquí o haz clic para buscarlo',
    'upload.pasteHint': 'También puedes pegar el texto directamente abajo',
    'upload.pasteLabel': 'O pega tu texto',
    'upload.clear': 'Limpiar',
    'upload.placeholder': 'Pega aquí el texto largo que quieres resumir…',
    'upload.charCount': '{count} caracteres',

    'summaryPanel.titleBrief': 'Resumen breve',
    'summaryPanel.titleDetailed': 'Resumen detallado',
    'summaryPanel.titleGeneric': 'Resumen',
    'summaryPanel.copyAria': 'Copiar resumen',
    'summaryPanel.readAloud': 'Leer en voz alta',
    'summaryPanel.pause': 'Pausar',
    'summaryPanel.resume': 'Reanudar',
    'summaryPanel.stopAria': 'Detener lectura',
    'summaryPanel.save': '💾 Guardar en mi historial',
    'summaryPanel.saved': 'Guardado en tu historial',

    'export.button': 'Exportar',
    'export.asPdf': 'Exportar como PDF',
    'export.asMarkdown': 'Exportar como Markdown (.md)',
    'export.asText': 'Exportar como texto plano (.txt)',
    'export.dateLabel': 'Fecha de creación',
    'export.languageLabel': 'Idioma del resumen',
    'export.languageEs': 'Español',
    'export.languageEn': 'Inglés',
    'export.summaryHeading': 'Resumen',
    'export.fileBaseName': 'resumen_exportado',

    'summarize.emptyResultError':
      'No se pudo generar el resumen. Intenta con otro texto.',
    'summarize.genericError': 'Ocurrió un error al generar el resumen.',
    'summarize.saveError': 'No se pudo guardar el resumen en tu historial.',
    'summarize.savePending':
      'Sin conexión: resumen guardado localmente. Se sincronizará con tu historial cuando vuelvas a estar online.',
    'summarize.notEnglishWarning':
      'Para generar resúmenes en inglés, por favor introduce un texto originalmente en inglés (el motor local no traduce de forma automática).',
    'summarize.footer':
      'Summarify — hecho con React, TypeScript y un motor de resumen 100% local (sin APIs externas).',

    'history.back': 'Volver a Summarify',
    'history.title': 'Tu historial',
    'history.subtitle': 'Tus últimos 5 resúmenes guardados.',
    'history.loadError': 'No se pudo cargar tu historial de resúmenes.',
    'history.empty':
      'Todavía no guardaste ningún resumen. Generá uno y tocá "💾 Guardar en mi historial".',
    'history.reload': 'Recargar',
    'history.tagBrief': 'Resumen breve',
    'history.tagDetailed': 'Resumen detallado',
    'history.offlineBadge': 'Offline',

    'offline.banner':
      'Estás sin conexión. Podés seguir resumiendo, leyendo y exportando — se guardará cuando vuelva internet.',

    'update.available': 'Hay una nueva versión de Summarify disponible.',
    'update.later': 'Después',
    'update.reload': 'Actualizar ahora',

    'login.title': 'Bienvenido de nuevo',
    'login.subtitle': 'Iniciá sesión para ver y generar tus resúmenes.',
    'login.email': 'Correo electrónico',
    'login.emailPlaceholder': 'vos@ejemplo.com',
    'login.password': 'Contraseña',
    'login.passwordPlaceholder': '••••••••',
    'login.forgotPassword': '¿Olvidaste tu contraseña?',
    'login.submit': 'Iniciar sesión',
    'login.noAccount': '¿No tenés cuenta?',
    'login.registerLink': 'Registrate',

    'register.title': 'Creá tu cuenta',
    'register.subtitle':
      'Registrate para guardar y volver a escuchar tus resúmenes.',
    'register.email': 'Correo electrónico',
    'register.emailPlaceholder': 'vos@ejemplo.com',
    'register.password': 'Contraseña',
    'register.passwordPlaceholder': 'Mínimo 6 caracteres',
    'register.confirmPassword': 'Confirmar contraseña',
    'register.confirmPasswordPlaceholder': '••••••••',
    'register.passwordTooShort':
      'La contraseña debe tener al menos 6 caracteres.',
    'register.passwordMismatch': 'Las contraseñas no coinciden.',
    'register.submit': 'Crear cuenta',
    'register.hasAccount': '¿Ya tenés cuenta?',
    'register.loginLink': 'Iniciá sesión',
    'register.checkEmailTitle': 'Revisá tu correo',
    'register.checkEmailSubtitle': 'Te enviamos un enlace de confirmación a {email}.',
    'register.checkEmailBody':
      'Confirmá tu cuenta desde ese correo y después volvé acá para iniciar sesión.',
    'register.goToLogin': 'Ir a iniciar sesión',

    'forgotPassword.title': 'Recuperar contraseña',
    'forgotPassword.subtitle':
      'Ingresá tu correo y te enviamos un enlace para elegir una nueva contraseña.',
    'forgotPassword.email': 'Correo electrónico',
    'forgotPassword.emailPlaceholder': 'vos@ejemplo.com',
    'forgotPassword.submit': 'Enviar enlace',
    'forgotPassword.backToLogin': 'Volver a iniciar sesión',
    'forgotPassword.successTitle': 'Revisá tu correo',
    'forgotPassword.successSubtitle': 'Te enviamos un enlace a {email}.',
    'forgotPassword.successBody':
      'Abrí ese correo y seguí el enlace para elegir tu nueva contraseña.',

    'resetPassword.title': 'Elegí tu nueva contraseña',
    'resetPassword.subtitle': 'Escribí una nueva contraseña para tu cuenta.',
    'resetPassword.invalidLinkTitle': 'Enlace inválido o vencido',
    'resetPassword.invalidLinkSubtitle':
      'Este enlace de recuperación ya no es válido.',
    'resetPassword.requestNewLink': 'Pedir un enlace nuevo',
    'resetPassword.newPassword': 'Nueva contraseña',
    'resetPassword.confirmPassword': 'Confirmar contraseña',
    'resetPassword.passwordTooShort':
      'La contraseña debe tener al menos 6 caracteres.',
    'resetPassword.passwordMismatch': 'Las contraseñas no coinciden.',
    'resetPassword.submit': 'Guardar contraseña',
    'resetPassword.successTitle': 'Contraseña actualizada',
    'resetPassword.successSubtitle':
      'Ya podés seguir usando Summarify con tu nueva contraseña.',
    'resetPassword.continueButton': 'Ir a Summarify',

    'logout.confirmTitle': '¿Cerrar sesión?',
    'logout.confirmBody': '¿Estás seguro de que quieres cerrar sesión?',
    'logout.cancel': 'Cancelar',
    'logout.confirm': 'Cerrar sesión',
  },
  en: {
    'header.viewHistory': 'View history',
    'header.signOut': 'Sign out',
    'header.themeToLight': 'Switch to light mode',
    'header.themeToDark': 'Switch to dark mode',
    'header.languageLabel': 'Language',

    'hero.title1': 'Clear summaries,',
    'hero.titleHighlight': 'instantly.',
    'hero.subtitle':
      'Upload a PDF or paste your text. Summarify summarises it instantly and reads it aloud, in English.',

    'buttons.brief': 'Brief Summary',
    'buttons.detailed': 'Detailed Summary',

    'upload.onlyPdfError': 'Only PDF files are supported.',
    'upload.scannedError':
      "Couldn't extract text from this PDF (maybe it's a scanned image?).",
    'upload.readError':
      'Something went wrong reading the PDF. Try another file.',
    'upload.extracting': 'Extracting text from the PDF…',
    'upload.replaceHint': 'Click to replace the file',
    'upload.dragHint': 'Drag your PDF here or click to browse',
    'upload.pasteHint': 'You can also paste the text directly below',
    'upload.pasteLabel': 'Or paste your text',
    'upload.clear': 'Clear',
    'upload.placeholder': 'Paste the long text you want to summarise here…',
    'upload.charCount': '{count} characters',

    'summaryPanel.titleBrief': 'Brief summary',
    'summaryPanel.titleDetailed': 'Detailed summary',
    'summaryPanel.titleGeneric': 'Summary',
    'summaryPanel.copyAria': 'Copy summary',
    'summaryPanel.readAloud': 'Read aloud',
    'summaryPanel.pause': 'Pause',
    'summaryPanel.resume': 'Resume',
    'summaryPanel.stopAria': 'Stop reading',
    'summaryPanel.save': '💾 Save to my history',
    'summaryPanel.saved': 'Saved to your history',

    'export.button': 'Export',
    'export.asPdf': 'Export as PDF',
    'export.asMarkdown': 'Export as Markdown (.md)',
    'export.asText': 'Export as Plain Text (.txt)',
    'export.dateLabel': 'Date created',
    'export.languageLabel': 'Summary language',
    'export.languageEs': 'Spanish',
    'export.languageEn': 'English',
    'export.summaryHeading': 'Summary',
    'export.fileBaseName': 'summary_export',

    'summarize.emptyResultError':
      "Couldn't generate the summary. Try a different text.",
    'summarize.genericError': 'Something went wrong generating the summary.',
    'summarize.saveError': "Couldn't save the summary to your history.",
    'summarize.savePending':
      "You're offline: the summary was saved locally. It'll sync to your history once you're back online.",
    'summarize.notEnglishWarning':
      "To generate summaries in English, please provide text that's originally in English (the local engine doesn't translate automatically).",
    'summarize.footer':
      'Summarify — built with React, TypeScript and a 100% local summarisation engine (no external APIs).',

    'history.back': 'Back to Summarify',
    'history.title': 'Your history',
    'history.subtitle': 'Your last 5 saved summaries.',
    'history.loadError': "Couldn't load your summary history.",
    'history.empty':
      'You haven\'t saved any summaries yet. Generate one and tap "💾 Save to my history".',
    'history.reload': 'Reload',
    'history.tagBrief': 'Brief summary',
    'history.tagDetailed': 'Detailed summary',
    'history.offlineBadge': 'Offline',

    'offline.banner':
      "You're offline. You can keep summarising, reading, and exporting — saving will resume once you're back online.",

    'update.available': 'A new version of Summarify is available.',
    'update.later': 'Later',
    'update.reload': 'Update now',

    'login.title': 'Welcome back',
    'login.subtitle': 'Sign in to view and generate your summaries.',
    'login.email': 'Email',
    'login.emailPlaceholder': 'you@example.com',
    'login.password': 'Password',
    'login.passwordPlaceholder': '••••••••',
    'login.forgotPassword': 'Forgot your password?',
    'login.submit': 'Sign in',
    'login.noAccount': "Don't have an account?",
    'login.registerLink': 'Sign up',

    'register.title': 'Create your account',
    'register.subtitle': 'Sign up to save and listen back to your summaries.',
    'register.email': 'Email',
    'register.emailPlaceholder': 'you@example.com',
    'register.password': 'Password',
    'register.passwordPlaceholder': 'At least 6 characters',
    'register.confirmPassword': 'Confirm password',
    'register.confirmPasswordPlaceholder': '••••••••',
    'register.passwordTooShort': 'Password must be at least 6 characters.',
    'register.passwordMismatch': "Passwords don't match.",
    'register.submit': 'Create account',
    'register.hasAccount': 'Already have an account?',
    'register.loginLink': 'Sign in',
    'register.checkEmailTitle': 'Check your email',
    'register.checkEmailSubtitle': 'We sent a confirmation link to {email}.',
    'register.checkEmailBody':
      'Confirm your account from that email, then come back here to sign in.',
    'register.goToLogin': 'Go to sign in',

    'forgotPassword.title': 'Reset your password',
    'forgotPassword.subtitle':
      "Enter your email and we'll send you a link to choose a new password.",
    'forgotPassword.email': 'Email',
    'forgotPassword.emailPlaceholder': 'you@example.com',
    'forgotPassword.submit': 'Send reset link',
    'forgotPassword.backToLogin': 'Back to sign in',
    'forgotPassword.successTitle': 'Check your email',
    'forgotPassword.successSubtitle': 'We sent a link to {email}.',
    'forgotPassword.successBody':
      'Open that email and follow the link to choose your new password.',

    'resetPassword.title': 'Choose your new password',
    'resetPassword.subtitle': 'Write a new password for your account.',
    'resetPassword.invalidLinkTitle': 'Invalid or expired link',
    'resetPassword.invalidLinkSubtitle':
      'This recovery link is no longer valid.',
    'resetPassword.requestNewLink': 'Request a new link',
    'resetPassword.newPassword': 'New password',
    'resetPassword.confirmPassword': 'Confirm password',
    'resetPassword.passwordTooShort': 'Password must be at least 6 characters.',
    'resetPassword.passwordMismatch': "Passwords don't match.",
    'resetPassword.submit': 'Save password',
    'resetPassword.successTitle': 'Password updated',
    'resetPassword.successSubtitle':
      'You can keep using Summarify with your new password.',
    'resetPassword.continueButton': 'Go to Summarify',

    'logout.confirmTitle': 'Sign out?',
    'logout.confirmBody': 'Are you sure you want to sign out?',
    'logout.cancel': 'Cancel',
    'logout.confirm': 'Sign out',
  },
}

export type TranslationKey = keyof Translations
