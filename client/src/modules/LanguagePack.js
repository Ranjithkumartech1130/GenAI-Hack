/**
 * LanguagePack — Multi-language support for SkillGPS Voice Assistant
 * Supports: English, Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Spanish, French
 */

export const SUPPORTED_LANGUAGES = {
    'en-US': { name: 'English', flag: '🇺🇸', code: 'en-US', short: 'en' },
    'ta-IN': { name: 'தமிழ்', flag: '🇮🇳', code: 'ta-IN', short: 'ta', englishName: 'Tamil' },
    'hi-IN': { name: 'हिन्दी', flag: '🇮🇳', code: 'hi-IN', short: 'hi', englishName: 'Hindi' },
    'te-IN': { name: 'తెలుగు', flag: '🇮🇳', code: 'te-IN', short: 'te', englishName: 'Telugu' },
    'kn-IN': { name: 'ಕನ್ನಡ', flag: '🇮🇳', code: 'kn-IN', short: 'kn', englishName: 'Kannada' },
    'ml-IN': { name: 'മലയാളം', flag: '🇮🇳', code: 'ml-IN', short: 'ml', englishName: 'Malayalam' },
    'bn-IN': { name: 'বাংলা', flag: '🇮🇳', code: 'bn-IN', short: 'bn', englishName: 'Bengali' },
    'mr-IN': { name: 'मराठी', flag: '🇮🇳', code: 'mr-IN', short: 'mr', englishName: 'Marathi' },
    'es-ES': { name: 'Español', flag: '🇪🇸', code: 'es-ES', short: 'es', englishName: 'Spanish' },
    'fr-FR': { name: 'Français', flag: '🇫🇷', code: 'fr-FR', short: 'fr', englishName: 'French' },
};

// Language detection keywords — when user says these, switch language
export const LANGUAGE_SWITCH_TRIGGERS = {
    'en-US': ['switch to english', 'speak english', 'english please', 'english mode', 'in english'],
    'ta-IN': ['switch to tamil', 'speak tamil', 'tamil please', 'tamil mode', 'in tamil', 'தமிழில் பேசு', 'தமிழ்'],
    'hi-IN': ['switch to hindi', 'speak hindi', 'hindi please', 'hindi mode', 'in hindi', 'हिंदी में बोलो', 'हिंदी'],
    'te-IN': ['switch to telugu', 'speak telugu', 'telugu please', 'telugu mode', 'in telugu', 'తెలుగులో మాట్లాడు', 'తెలుగు'],
    'kn-IN': ['switch to kannada', 'speak kannada', 'kannada please', 'kannada mode', 'in kannada', 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡು'],
    'ml-IN': ['switch to malayalam', 'speak malayalam', 'malayalam please', 'malayalam mode', 'in malayalam', 'മലയാളത്തിൽ സംസാരിക്കൂ'],
    'bn-IN': ['switch to bengali', 'speak bengali', 'bangla please', 'bengali mode', 'in bengali', 'বাংলায় বলো'],
    'mr-IN': ['switch to marathi', 'speak marathi', 'marathi please', 'marathi mode', 'in marathi', 'मराठीत बोला'],
    'es-ES': ['switch to spanish', 'speak spanish', 'spanish please', 'en español', 'habla español'],
    'fr-FR': ['switch to french', 'speak french', 'french please', 'en français', 'parle français'],
};

// Intent keywords per language — maps intent ID → array of keywords in that language
export const INTENT_KEYWORDS = {
    'en-US': {}, // Uses default NLPEngine keywords

    'ta-IN': {
        greet: ['வணக்கம்', 'ஹலோ', 'நமஸ்காரம்', 'ஹாய்'],
        navigate: ['போ', 'செல்', 'திற', 'காட்டு', 'பார்', 'கொண்டு', 'எடு', 'மாற்று', 'பக்கம்'],
        scroll: ['ஸ்க்ரோல்', 'கீழே', 'மேலே', 'நகர்', 'இறக்கு', 'ஏற்று'],
        click: ['கிளிக்', 'அழுத்து', 'தட்டு', 'பட்டன்'],
        type_text: ['டைப்', 'எழுது', 'உள்ளிடு', 'நிரப்பு', 'தட்டச்சு'],
        help: ['உதவி', 'கட்டளைகள்', 'என்ன', 'செய்ய', 'எப்படி'],
        stop_voice: ['நிறுத்து', 'அமைதி', 'நிறுத்தம்', 'ஓய்வு'],
        logout: ['வெளியேறு', 'லாக்அவுட்', 'போய்விடு'],
        refresh: ['புதுப்பி', 'ரீலோட்', 'மீண்டும்'],
        read_page: ['படி', 'வாசி', 'சொல்', 'என்ன', 'இருக்கு', 'திரை'],
        start_coding: ['கோடிங்', 'நிரலாக்கம்', 'எழுது', 'குறியீடு'],
        stop_coding: ['நிறுத்து', 'கோடிங்', 'வழிசெலுத்தல்'],
        status: ['நிலை', 'யார்', 'என்ன', 'உன்னால்'],
        go_back: ['பின்', 'திரும்பு', 'முந்தைய'],
        save: ['சேமி', 'பதிவு', 'சமர்ப்பி'],
        clear_field: ['அழி', 'நீக்கு', 'சுத்தம்'],
        focus_next: ['அடுத்த', 'முன்', 'தாவு'],
        focus_prev: ['முந்தைய', 'பின்', 'திரும்பு'],
        run_code: ['இயக்கு', 'ரன்', 'செயல்படுத்து'],
        repeat: ['திரும்ப', 'மீண்டும்', 'சொல்'],
    },

    'hi-IN': {
        greet: ['नमस्ते', 'हेलो', 'हाय', 'प्रणाम', 'नमस्कार'],
        navigate: ['जाओ', 'चलो', 'खोलो', 'दिखाओ', 'ले', 'बदलो', 'पेज', 'पन्ना'],
        scroll: ['स्क्रॉल', 'नीचे', 'ऊपर', 'हिलाओ', 'खिसकाओ'],
        click: ['क्लिक', 'दबाओ', 'बटन', 'टैप'],
        type_text: ['टाइप', 'लिखो', 'भरो', 'डालो', 'टंकण'],
        help: ['मदद', 'सहायता', 'कमांड', 'क्या', 'कैसे', 'बताओ'],
        stop_voice: ['रुको', 'बंद', 'चुप', 'शांत', 'थामो'],
        logout: ['लॉगआउट', 'निकलो', 'बाहर', 'जाओ'],
        refresh: ['रिफ्रेश', 'रीलोड', 'ताज़ा'],
        read_page: ['पढ़ो', 'बताओ', 'क्या', 'स्क्रीन', 'दिख'],
        start_coding: ['कोडिंग', 'प्रोग्रामिंग', 'कोड', 'लिखो'],
        stop_coding: ['कोडिंग', 'बंद', 'नेविगेशन'],
        status: ['स्थिति', 'कौन', 'क्या', 'तुम'],
        go_back: ['पीछे', 'वापस', 'लौटो'],
        save: ['सेव', 'बचाओ', 'सबमिट', 'जमा'],
        clear_field: ['साफ़', 'मिटाओ', 'हटाओ'],
        focus_next: ['अगला', 'आगे', 'टैब'],
        focus_prev: ['पिछला', 'पीछे', 'वापस'],
        run_code: ['चलाओ', 'रन', 'एक्सीक्यूट'],
        repeat: ['दोहराओ', 'फिर', 'बोलो'],
    },

    'te-IN': {
        greet: ['నమస్కారం', 'హలో', 'హాయ్', 'నమస్తే'],
        navigate: ['వెళ్ళు', 'తెరువు', 'చూపించు', 'చూడు', 'మార్చు', 'పేజీ'],
        scroll: ['స్క్రోల్', 'కిందకు', 'పైకి', 'జరుపు'],
        click: ['క్లిక్', 'నొక్కు', 'బటన్', 'ట్యాప్'],
        type_text: ['టైప్', 'రాయి', 'నింపు', 'ఇవ్వు'],
        help: ['సహాయం', 'ఆదేశాలు', 'ఏమి', 'ఎలా'],
        stop_voice: ['ఆపు', 'నిలుపు', 'మౌనం'],
        logout: ['లాగౌట్', 'బయటకు', 'వెళ్ళు'],
        refresh: ['రిఫ్రెష్', 'రీలోడ్', 'తాజా'],
        read_page: ['చదువు', 'చెప్పు', 'ఏమి', 'స్క్రీన్'],
        start_coding: ['కోడింగ్', 'ప్రోగ్రామింగ్', 'కోడ్'],
        stop_coding: ['ఆపు', 'కోడింగ్', 'నావిగేషన్'],
        status: ['స్థితి', 'ఎవరు', 'ఏమి'],
        go_back: ['వెనక్కి', 'తిరిగి'],
        save: ['సేవ్', 'భద్రపరచు', 'సబ్మిట్'],
    },

    'kn-IN': {
        greet: ['ನಮಸ್ಕಾರ', 'ಹಲೋ', 'ಹಾಯ್'],
        navigate: ['ಹೋಗು', 'ತೆರೆ', 'ತೋರಿಸು', 'ನೋಡು', 'ಬದಲಾಯಿಸು'],
        scroll: ['ಸ್ಕ್ರೋಲ್', 'ಕೆಳಗೆ', 'ಮೇಲೆ'],
        click: ['ಕ್ಲಿಕ್', 'ಒತ್ತು', 'ಬಟನ್'],
        help: ['ಸಹಾಯ', 'ಆದೇಶಗಳು', 'ಏನು', 'ಹೇಗೆ'],
        stop_voice: ['ನಿಲ್ಲಿಸು', 'ಮೌನ'],
        logout: ['ಲಾಗೌಟ್', 'ಹೊರಗೆ'],
        read_page: ['ಓದು', 'ಹೇಳು', 'ಏನು', 'ಪರದೆ'],
    },

    'ml-IN': {
        greet: ['നമസ്കാരം', 'ഹലോ', 'ഹായ്'],
        navigate: ['പോകൂ', 'തുറക്കൂ', 'കാണിക്കൂ', 'മാറ്റൂ'],
        scroll: ['സ്ക്രോൾ', 'താഴേക്ക്', 'മുകളിലേക്ക്'],
        click: ['ക്ലിക്ക്', 'അമർത്തൂ', 'ബട്ടൺ'],
        help: ['സഹായം', 'കമാൻഡുകൾ', 'എന്ത്', 'എങ്ങനെ'],
        stop_voice: ['നിർത്തൂ', 'മൗനം'],
        logout: ['ലോഗൗട്ട്', 'പുറത്ത്'],
        read_page: ['വായിക്കൂ', 'പറയൂ', 'എന്ത്', 'സ്ക്രീൻ'],
    },

    'bn-IN': {
        greet: ['নমস্কার', 'হ্যালো', 'হাই'],
        navigate: ['যাও', 'খোলো', 'দেখাও', 'বদলাও'],
        scroll: ['স্ক্রোল', 'নিচে', 'উপরে'],
        click: ['ক্লিক', 'চাপো', 'বাটন'],
        help: ['সাহায্য', 'কমান্ড', 'কী', 'কিভাবে'],
        stop_voice: ['থামো', 'বন্ধ', 'চুপ'],
        logout: ['লগআউট', 'বের'],
        read_page: ['পড়ো', 'বলো', 'কী', 'স্ক্রিন'],
    },

    'mr-IN': {
        greet: ['नमस्कार', 'हॅलो', 'हाय'],
        navigate: ['जा', 'उघडा', 'दाखवा', 'बदला'],
        scroll: ['स्क्रोल', 'खाली', 'वर'],
        click: ['क्लिक', 'दाबा', 'बटण'],
        help: ['मदत', 'आदेश', 'काय', 'कसे'],
        stop_voice: ['थांबा', 'बंद', 'शांत'],
        logout: ['लॉगआउट', 'बाहेर'],
        read_page: ['वाचा', 'सांगा', 'काय', 'स्क्रीन'],
    },

    'es-ES': {
        greet: ['hola', 'buenos', 'buenas', 'saludos', 'hey'],
        navigate: ['ir', 've', 'abre', 'muestra', 'llévame', 'cambia', 'navega', 'página', 'mostrar', 'abrir', 'enseña'],
        scroll: ['desplaza', 'baja', 'sube', 'mueve', 'scroll'],
        click: ['clic', 'pulsa', 'presiona', 'toca', 'botón', 'haz'],
        type_text: ['escribe', 'teclea', 'pon', 'rellena', 'ingresa'],
        help: ['ayuda', 'comandos', 'qué', 'cómo', 'opciones', 'puedes'],
        stop_voice: ['para', 'detente', 'calla', 'silencio', 'pausa', 'basta'],
        logout: ['cerrar', 'salir', 'sesión', 'adiós'],
        refresh: ['actualiza', 'recarga', 'refresca'],
        read_page: ['lee', 'dime', 'qué', 'pantalla', 'hay', 'dice'],
        start_coding: ['programar', 'codificar', 'código', 'escribir'],
        stop_coding: ['parar', 'codificar', 'navegación'],
        status: ['estado', 'quién', 'qué', 'puedes'],
        go_back: ['atrás', 'volver', 'regresar', 'anterior'],
        save: ['guardar', 'salvar', 'enviar'],
        clear_field: ['borrar', 'limpiar', 'vaciar'],
        focus_next: ['siguiente', 'próximo', 'adelante'],
        focus_prev: ['anterior', 'previo', 'atrás'],
        run_code: ['ejecutar', 'correr', 'compilar'],
        repeat: ['repite', 'otra', 'vez', 'repetir'],
    },

    'fr-FR': {
        greet: ['bonjour', 'salut', 'bonsoir', 'coucou', 'hey'],
        navigate: ['va', 'aller', 'ouvre', 'montre', 'emmène', 'change', 'page', 'affiche', 'navigue'],
        scroll: ['défiler', 'descends', 'monte', 'bouge', 'scroll', 'bas', 'haut'],
        click: ['clique', 'appuie', 'bouton', 'tape', 'presse'],
        type_text: ['écris', 'tape', 'saisis', 'remplis', 'entre'],
        help: ['aide', 'commandes', 'quoi', 'comment', 'options', 'peux'],
        stop_voice: ['arrête', 'stop', 'tais', 'silence', 'pause'],
        logout: ['déconnecte', 'sortir', 'quitter', 'adieu', 'au revoir'],
        refresh: ['rafraîchis', 'recharge', 'actualise'],
        read_page: ['lis', 'dis', 'quoi', 'écran', 'affiché'],
        start_coding: ['programmer', 'coder', 'code', 'écrire'],
        stop_coding: ['arrêter', 'coder', 'navigation'],
        status: ['état', 'qui', 'quoi', 'peux'],
        go_back: ['retour', 'revenir', 'précédent', 'arrière'],
        save: ['sauvegarder', 'enregistrer', 'soumettre'],
        clear_field: ['effacer', 'vider', 'nettoyer'],
        focus_next: ['suivant', 'prochain', 'avancer'],
        focus_prev: ['précédent', 'revenir', 'arrière'],
        run_code: ['exécuter', 'lancer', 'compiler'],
        repeat: ['répète', 'encore', 'redis'],
    },
};

// Page entity names per language
export const PAGE_ENTITIES_I18N = {
    'en-US': {}, // default

    'ta-IN': {
        dashboard: ['டாஷ்போர்டு', 'டாஷ்போர்ட்', 'முகப்பு', 'கட்டுப்பாடு'],
        landing: ['முகப்பு', 'வீடு', 'தொடக்கம்', 'வரவேற்பு'],
        profile: ['சுயவிவரம்', 'பிரொபைல்', 'கணக்கு', 'என் விவரம்'],
        ide: ['ஐடிஇ', 'எடிட்டர்', 'கோட்', 'குறியீடு'],
        resume: ['ரெஸ்யூம்', 'சிவி', 'தொழில்'],
        progress: ['முன்னேற்றம்', 'புள்ளிவிவரம்', 'வளர்ச்சி'],
        path: ['கற்றல்', 'பாதை', 'படிப்பு', 'திட்டம்'],
        overview: ['மேலோட்டம்', 'சுருக்கம்'],
        auth: ['உள்நுழை', 'லாகின்', 'பதிவு'],
    },

    'hi-IN': {
        dashboard: ['डैशबोर्ड', 'डेशबोर्ड', 'मुख्य', 'नियंत्रण'],
        landing: ['होम', 'घर', 'मुखपृष्ठ', 'शुरुआत', 'स्वागत'],
        profile: ['प्रोफाइल', 'खाता', 'मेरा', 'विवरण'],
        ide: ['आईडीई', 'एडिटर', 'कोड', 'संपादक'],
        resume: ['रिज्यूमे', 'रेज़्यूमे', 'सीवी', 'बायोडाटा'],
        progress: ['प्रगति', 'प्रोग्रेस', 'आंकड़े', 'विकास'],
        path: ['सीखने', 'पथ', 'रास्ता', 'पाठ्यक्रम', 'कोर्स', 'योजना'],
        overview: ['अवलोकन', 'सारांश', 'ओवरव्यू'],
        auth: ['लॉगिन', 'प्रवेश', 'साइन'],
    },

    'te-IN': {
        dashboard: ['డాష్‌బోర్డ్', 'ప్రధాన', 'నియంత్రణ'],
        landing: ['హోమ్', 'ఇల్లు', 'ప్రారంభ', 'స్వాగతం'],
        profile: ['ప్రొఫైల్', 'ఖాతా', 'నా', 'వివరాలు'],
        ide: ['ఐడిఇ', 'ఎడిటర్', 'కోడ్'],
        resume: ['రెజ్యూమే', 'సివి'],
        progress: ['ప్రగతి', 'గణాంకాలు'],
        path: ['నేర్చుకోవడం', 'మార్గం', 'కోర్సు', 'ప్రణాళిక'],
    },

    'es-ES': {
        dashboard: ['panel', 'tablero', 'principal', 'control'],
        landing: ['inicio', 'casa', 'portada', 'bienvenida'],
        profile: ['perfil', 'cuenta', 'mi perfil', 'usuario'],
        ide: ['editor', 'código', 'programación', 'ide'],
        resume: ['currículum', 'cv', 'hoja de vida'],
        progress: ['progreso', 'estadísticas', 'avance'],
        path: ['ruta', 'aprendizaje', 'curso', 'plan', 'camino'],
        overview: ['resumen', 'general', 'vista'],
        auth: ['iniciar', 'sesión', 'login', 'registrar'],
    },

    'fr-FR': {
        dashboard: ['tableau', 'bord', 'principal', 'contrôle'],
        landing: ['accueil', 'maison', 'bienvenue'],
        profile: ['profil', 'compte', 'mon profil', 'utilisateur'],
        ide: ['éditeur', 'code', 'programmation', 'ide'],
        resume: ['cv', 'curriculum', 'résumé'],
        progress: ['progrès', 'statistiques', 'avancement'],
        path: ['parcours', 'apprentissage', 'cours', 'plan', 'chemin'],
        overview: ['aperçu', 'résumé', 'vue'],
        auth: ['connexion', 'login', 'inscription'],
    },
};

// Direction entity names per language
export const DIRECTION_ENTITIES_I18N = {
    'ta-IN': { up: ['மேலே', 'மேல்'], down: ['கீழே', 'கீழ்'], top: ['மேல்', 'தொடக்கம்'], bottom: ['கீழ்', 'முடிவு'] },
    'hi-IN': { up: ['ऊपर', 'उपर'], down: ['नीचे', 'निचे'], top: ['ऊपर', 'शुरू'], bottom: ['नीचे', 'अंत'] },
    'te-IN': { up: ['పైకి', 'పై'], down: ['కిందకు', 'కింద'], top: ['పైన', 'మొదలు'], bottom: ['కింద', 'చివర'] },
    'es-ES': { up: ['arriba', 'sube'], down: ['abajo', 'baja'], top: ['arriba', 'inicio', 'principio'], bottom: ['abajo', 'final'] },
    'fr-FR': { up: ['haut', 'monte'], down: ['bas', 'descends'], top: ['haut', 'début'], bottom: ['bas', 'fin'] },
};

// Personality responses per language
export const RESPONSES = {
    'en-US': {
        greet: ["Hello! I'm your SkillGPS assistant. Just tell me what you need!", "Hi! How can I help you today?", "Welcome! What would you like to do?"],
        confirm: ["Done!", "Got it!", "Right away!", "On it!"],
        nav: ["Navigating to", "Opening", "Taking you to", "Switching to"],
        error: ["I didn't quite catch that. Could you try saying it differently?", "Hmm, I'm not sure what you mean. Say 'help' to see options.", "Sorry, could you repeat that?"],
        farewell: ["Voice assistant paused. Click the mic to resume.", "Going quiet now. Tap the mic anytime!"],
        langSwitch: "Switched to English.",
        activated: "Voice assistant activated. Just speak naturally!",
        helpIntro: "Here's what I can do for you:",
    },

    'ta-IN': {
        greet: ["வணக்கம்! நான் உங்கள் SkillGPS உதவியாளர். என்ன வேண்டும் என்று சொல்லுங்கள்!", "ஹலோ! எவ்வாறு உதவ முடியும்?"],
        confirm: ["செய்தாச்சு!", "சரி!", "உடனே!"],
        nav: ["செல்கிறேன்", "திறக்கிறேன்", "மாற்றுகிறேன்"],
        error: ["மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்லுங்கள்.", "என்ன சொன்னீர்கள் என்று தெரியவில்லை. 'உதவி' என்று சொல்லுங்கள்."],
        farewell: ["உதவியாளர் நிறுத்தப்பட்டது. மீண்டும் தொடங்க மைக் அழுத்துங்கள்."],
        langSwitch: "தமிழுக்கு மாற்றப்பட்டது.",
        activated: "குரல் உதவியாளர் இயக்கப்பட்டது. இயல்பாகப் பேசுங்கள்!",
        helpIntro: "நான் இது எல்லாம் செய்ய முடியும்:",
    },

    'hi-IN': {
        greet: ["नमस्ते! मैं आपका SkillGPS सहायक हूँ। बताइए क्या करना है!", "हेलो! कैसे मदद कर सकता हूँ?"],
        confirm: ["हो गया!", "ठीक है!", "तुरंत!"],
        nav: ["जा रहा हूँ", "खोल रहा हूँ", "बदल रहा हूँ"],
        error: ["माफ़ कीजिए, समझ नहीं आया। दोबारा बोलिए।", "क्या कहा आपने? 'मदद' बोलिए विकल्प देखने के लिए।"],
        farewell: ["सहायक रुक गया। माइक दबाकर फिर से शुरू करें।"],
        langSwitch: "हिंदी में बदल गया।",
        activated: "वॉइस सहायक चालू हो गया। बस सामान्य रूप से बोलिए!",
        helpIntro: "मैं ये सब कर सकता हूँ:",
    },

    'te-IN': {
        greet: ["నమస్కారం! నేను మీ SkillGPS సహాయకుడిని. ఏమి కావాలో చెప్పండి!", "హలో! ఎలా సహాయం చేయగలను?"],
        confirm: ["అయిపోయింది!", "సరే!", "వెంటనే!"],
        nav: ["వెళ్తున్నాను", "తెరుస్తున్నాను", "మారుస్తున్నాను"],
        error: ["క్షమించండి, అర్థం కాలేదు. మళ్ళీ చెప్పండి.", "'సహాయం' అని చెప్పండి ఎంపికలు చూడటానికి."],
        farewell: ["సహాయకుడు ఆగిపోయాడు. మైక్ నొక్కి మళ్ళీ ప్రారంభించండి."],
        langSwitch: "తెలుగుకు మారింది.",
        activated: "వాయిస్ సహాయకుడు ప్రారంభమైనాడు. సహజంగా మాట్లాడండి!",
        helpIntro: "నేను ఇవి చేయగలను:",
    },

    'es-ES': {
        greet: ["¡Hola! Soy tu asistente SkillGPS. ¿En qué te puedo ayudar?", "¡Bienvenido! Dime qué necesitas."],
        confirm: ["¡Listo!", "¡Hecho!", "¡Enseguida!"],
        nav: ["Navegando a", "Abriendo", "Cambiando a"],
        error: ["No entendí bien. ¿Podrías repetirlo?", "Hmm, no estoy seguro. Di 'ayuda' para ver opciones."],
        farewell: ["Asistente pausado. Toca el micrófono para continuar."],
        langSwitch: "Cambiado a español.",
        activated: "¡Asistente de voz activado! Habla con naturalidad.",
        helpIntro: "Esto es lo que puedo hacer:",
    },

    'fr-FR': {
        greet: ["Bonjour! Je suis votre assistant SkillGPS. Que puis-je faire pour vous?", "Salut! Comment puis-je aider?"],
        confirm: ["C'est fait!", "Compris!", "Tout de suite!"],
        nav: ["Navigation vers", "Ouverture de", "Passage à"],
        error: ["Désolé, je n'ai pas compris. Pourriez-vous répéter?", "Dites 'aide' pour voir les options."],
        farewell: ["Assistant en pause. Appuyez sur le micro pour reprendre."],
        langSwitch: "Passé en français.",
        activated: "Assistant vocal activé! Parlez naturellement.",
        helpIntro: "Voici ce que je peux faire:",
    },
};

// Fallback: if language not in RESPONSES, use English
export function getResponses(lang) {
    return RESPONSES[lang] || RESPONSES['en-US'];
}

export function getIntentKeywords(lang) {
    return INTENT_KEYWORDS[lang] || {};
}

export function getPageEntities(lang) {
    return PAGE_ENTITIES_I18N[lang] || {};
}

export function getDirectionEntities(lang) {
    return DIRECTION_ENTITIES_I18N[lang] || {};
}
