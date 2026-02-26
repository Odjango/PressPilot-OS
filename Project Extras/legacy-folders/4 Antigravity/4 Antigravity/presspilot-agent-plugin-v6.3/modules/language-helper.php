<?php
/**
 * Module: Language Helper
 * Purpose: Handle multi-language content generation
 * Architecture: Modular - language support for AI content generation
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Language_Helper {
    
    /**
     * Get language configuration
     */
    public static function get_language_config($language_code) {
        $languages = array(
            'en' => array(
                'name' => 'English',
                'native_name' => 'English',
                'flag' => '🇺🇸',
                'ai_instruction' => 'Generate professional website content in English.',
                'sample_business_types' => 'restaurant, fitness center, corporate office, online store'
            ),
            'es' => array(
                'name' => 'Spanish',
                'native_name' => 'Español',
                'flag' => '🇪🇸',
                'ai_instruction' => 'Genera contenido profesional para sitio web en español. Usa un tono profesional y amigable.',
                'sample_business_types' => 'restaurante, gimnasio, oficina corporativa, tienda en línea'
            ),
            'fr' => array(
                'name' => 'French',
                'native_name' => 'Français',
                'flag' => '🇫🇷',
                'ai_instruction' => 'Générez du contenu professionnel pour site web en français. Utilisez un ton professionnel et accueillant.',
                'sample_business_types' => 'restaurant, salle de sport, bureau d\'entreprise, boutique en ligne'
            ),
            'de' => array(
                'name' => 'German',
                'native_name' => 'Deutsch',
                'flag' => '🇩🇪',
                'ai_instruction' => 'Erstellen Sie professionelle Website-Inhalte auf Deutsch. Verwenden Sie einen professionellen und freundlichen Ton.',
                'sample_business_types' => 'Restaurant, Fitnessstudio, Firmenbüro, Online-Shop'
            ),
            'it' => array(
                'name' => 'Italian',
                'native_name' => 'Italiano',
                'flag' => '🇮🇹',
                'ai_instruction' => 'Genera contenuti professionali per sito web in italiano. Usa un tono professionale e accogliente.',
                'sample_business_types' => 'ristorante, palestra, ufficio aziendale, negozio online'
            ),
            'pt' => array(
                'name' => 'Portuguese',
                'native_name' => 'Português',
                'flag' => '🇧🇷',
                'ai_instruction' => 'Gere conteúdo profissional para site web em português. Use um tom profissional e acolhedor.',
                'sample_business_types' => 'restaurante, academia, escritório corporativo, loja online'
            ),
            'nl' => array(
                'name' => 'Dutch',
                'native_name' => 'Nederlands',
                'flag' => '🇳🇱',
                'ai_instruction' => 'Genereer professionele website-inhoud in het Nederlands. Gebruik een professionele en vriendelijke toon.',
                'sample_business_types' => 'restaurant, sportschool, bedrijfskantoor, online winkel'
            ),
            'zh' => array(
                'name' => 'Chinese',
                'native_name' => '中文',
                'flag' => '🇨🇳',
                'ai_instruction' => '生成专业的中文网站内容。使用专业和友好的语调。',
                'sample_business_types' => '餐厅、健身房、企业办公室、在线商店'
            ),
            'ja' => array(
                'name' => 'Japanese',
                'native_name' => '日本語',
                'flag' => '🇯🇵',
                'ai_instruction' => 'プロフェッショナルなウェブサイトコンテンツを日本語で生成してください。丁寧で親しみやすいトーンを使用してください。',
                'sample_business_types' => 'レストラン、フィットネスジム、企業オフィス、オンラインストア'
            ),
            'ko' => array(
                'name' => 'Korean',
                'native_name' => '한국어',
                'flag' => '🇰🇷',
                'ai_instruction' => '전문적인 웹사이트 콘텐츠를 한국어로 생성하세요. 전문적이고 친근한 톤을 사용하세요.',
                'sample_business_types' => '레스토랑, 피트니스 센터, 기업 사무실, 온라인 스토어'
            ),
            'ar' => array(
                'name' => 'Arabic',
                'native_name' => 'العربية',
                'flag' => '🇸🇦',
                'ai_instruction' => 'أنشئ محتوى موقع ويب احترافي باللغة العربية. استخدم نبرة مهنية وودودة.',
                'sample_business_types' => 'مطعم، صالة رياضية، مكتب شركة، متجر إلكتروني'
            ),
            'hi' => array(
                'name' => 'Hindi',
                'native_name' => 'हिन्दी',
                'flag' => '🇮🇳',
                'ai_instruction' => 'हिंदी में पेशेवर वेबसाइट सामग्री तैयार करें। पेशेवर और मित्रवत टोन का उपयोग करें।',
                'sample_business_types' => 'रेस्तरां, फिटनेस सेंटर, कॉर्पोरेट ऑफिस, ऑनलाइन स्टोर'
            ),
            'ru' => array(
                'name' => 'Russian',
                'native_name' => 'Русский',
                'flag' => '🇷🇺',
                'ai_instruction' => 'Создайте профессиональный контент для веб-сайта на русском языке. Используйте профессиональный и дружелюбный тон.',
                'sample_business_types' => 'ресторан, фитнес-центр, корпоративный офис, интернет-магазин'
            )
        );
        
        return isset($languages[$language_code]) ? $languages[$language_code] : $languages['en'];
    }
    
    /**
     * Get AI prompt instruction for language
     */
    public static function get_ai_language_instruction($language_code) {
        $config = self::get_language_config($language_code);
        
        $instruction = "\nLANGUAGE REQUIREMENT: " . $config['ai_instruction'] . "\n";
        $instruction .= "IMPORTANT: Generate ALL content in " . $config['native_name'] . " (" . $config['name'] . "). ";
        $instruction .= "Use culturally appropriate expressions and business terminology for " . $config['name'] . " speakers.\n";
        
        return $instruction;
    }
    
    /**
     * Get supported languages list
     */
    public static function get_supported_languages() {
        return array(
            'en' => 'English 🇺🇸',
            'es' => 'Spanish (Español) 🇪🇸',
            'fr' => 'French (Français) 🇫🇷',
            'de' => 'German (Deutsch) 🇩🇪',
            'it' => 'Italian (Italiano) 🇮🇹',
            'pt' => 'Portuguese (Português) 🇧🇷',
            'nl' => 'Dutch (Nederlands) 🇳🇱',
            'zh' => 'Chinese (中文) 🇨🇳',
            'ja' => 'Japanese (日本語) 🇯🇵',
            'ko' => 'Korean (한국어) 🇰🇷',
            'ar' => 'Arabic (العربية) 🇸🇦',
            'hi' => 'Hindi (हिन्दी) 🇮🇳',
            'ru' => 'Russian (Русский) 🇷🇺'
        );
    }
    
    /**
     * Validate language code
     */
    public static function is_supported_language($language_code) {
        $supported = self::get_supported_languages();
        return array_key_exists($language_code, $supported);
    }
}