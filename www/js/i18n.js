const I18N = {
  ar: {search:"ابحث عن قناة أو فيلم أو مسلسل", home:"الرئيسية", live:"مباشر", movies:"أفلام", series:"مسلسلات", settings:"الإعدادات",
    noSource:"لا توجد مصادر بعد", noSourceHint:"أضف اشتراك Xtream Codes أو قائمة M3U لبدء المشاهدة.", addSource:"إضافة مصدر",
    sources:"المصادر", xtream:"Xtream Codes", m3u:"قائمة M3U", epg:"دليل البرامج EPG", name:"الاسم", server:"رابط الخادم", user:"اسم المستخدم",
    pass:"كلمة المرور", m3uUrl:"رابط M3U", m3uFile:"أو استيراد ملف M3U من الهاتف", xmltv:"رابط XMLTV", save:"حفظ", edit:"تعديل", del:"حذف",
    refresh:"تحديث", cancel:"إلغاء", saved:"تم الحفظ", deleted:"تم الحذف", confirmDel:"حذف هذا المصدر؟", invalid:"تحقق من الحقول المطلوبة",
    badUrl:"الرابط غير صالح، يجب أن يبدأ بـ http:// أو https://", fileRead:"تعذّر قراءة الملف", language:"اللغة", theme:"المظهر",
    themeNavy:"كحلي داكن", themeBlack:"أسود", cache:"مسح ذاكرة التخزين المؤقت", cacheDone:"تم مسح الذاكرة المؤقتة", about:"معلومات التطبيق",
    version:"الإصدار", aboutTxt:"Mesut IPTV مشغّل فقط، لا يتضمن أي قنوات أو اشتراكات. استخدم مصادر مصرّح لك بها.", type:"النوع", manage:"إدارة المصادر",
    refreshed:"تم تحديث المصدر", soon:"يُضاف في المرحلة التالية", fileLoaded:"تم تحميل الملف", channels:"قناة"},
  fr: {search:"Rechercher une chaîne, un film, une série", home:"Accueil", live:"Direct", movies:"Films", series:"Séries", settings:"Réglages",
    noSource:"Aucune source pour l'instant", noSourceHint:"Ajoutez un abonnement Xtream Codes ou une liste M3U pour commencer.", addSource:"Ajouter une source",
    sources:"Sources", xtream:"Xtream Codes", m3u:"Liste M3U", epg:"Guide des programmes EPG", name:"Nom", server:"URL du serveur", user:"Identifiant",
    pass:"Mot de passe", m3uUrl:"Lien M3U", m3uFile:"ou importer un fichier M3U du téléphone", xmltv:"Lien XMLTV", save:"Enregistrer", edit:"Modifier", del:"Supprimer",
    refresh:"Actualiser", cancel:"Annuler", saved:"Enregistré", deleted:"Supprimé", confirmDel:"Supprimer cette source ?", invalid:"Vérifiez les champs obligatoires",
    badUrl:"Lien invalide : il doit commencer par http:// ou https://", fileRead:"Lecture du fichier impossible", language:"Langue", theme:"Thème",
    themeNavy:"Bleu nuit", themeBlack:"Noir", cache:"Vider le cache", cacheDone:"Cache vidé", about:"À propos",
    version:"Version", aboutTxt:"Mesut IPTV est un lecteur : il ne contient aucune chaîne ni abonnement. Utilisez des sources que vous avez le droit d'utiliser.", type:"Type", manage:"Gérer les sources",
    refreshed:"Source actualisée", soon:"Disponible à l'étape suivante", fileLoaded:"Fichier chargé", channels:"chaînes"},
  en: {search:"Search channels, movies, series", home:"Home", live:"Live", movies:"Movies", series:"Series", settings:"Settings",
    noSource:"No sources yet", noSourceHint:"Add an Xtream Codes subscription or an M3U playlist to start watching.", addSource:"Add a source",
    sources:"Sources", xtream:"Xtream Codes", m3u:"M3U playlist", epg:"EPG program guide", name:"Name", server:"Server URL", user:"Username",
    pass:"Password", m3uUrl:"M3U link", m3uFile:"or import an M3U file from your phone", xmltv:"XMLTV link", save:"Save", edit:"Edit", del:"Delete",
    refresh:"Refresh", cancel:"Cancel", saved:"Saved", deleted:"Deleted", confirmDel:"Delete this source?", invalid:"Check the required fields",
    badUrl:"Invalid link: it must start with http:// or https://", fileRead:"Could not read the file", language:"Language", theme:"Theme",
    themeNavy:"Dark navy", themeBlack:"Black", cache:"Clear cache", cacheDone:"Cache cleared", about:"About",
    version:"Version", aboutTxt:"Mesut IPTV is a player only: it ships with no channels or subscriptions. Use sources you are authorized to use.", type:"Type", manage:"Manage sources",
    refreshed:"Source refreshed", soon:"Coming in the next step", fileLoaded:"File loaded", channels:"channels"}
};

Object.assign(I18N.ar,{all:"الكل",favs:"المفضلة",more:"عرض المزيد",noData:"لا توجد بيانات. حدّث المصدر من إدارة المصادر.",noPlayer:"المشغل متاح داخل تطبيق Android فقط",playErr:"تعذّر تشغيل هذا الرابط",continueW:"متابعة المشاهدة",nothing:"لا نتائج",group:"الفئة"});
Object.assign(I18N.fr,{all:"Tout",favs:"Favoris",more:"Afficher plus",noData:"Aucune donnée. Actualisez la source dans Gérer les sources.",noPlayer:"Le lecteur n'est disponible que dans l'app Android",playErr:"Lecture impossible pour ce lien",continueW:"Reprendre la lecture",nothing:"Aucun résultat",group:"Catégorie"});
Object.assign(I18N.en,{all:"All",favs:"Favorites",more:"Show more",noData:"No data. Refresh the source in Manage sources.",noPlayer:"The player is only available in the Android app",playErr:"Could not play this link",continueW:"Continue watching",nothing:"No results",group:"Category"});
Object.assign(I18N.ar,{reimport:"هذا المصدر ملف مستورد: اضغط تعديل ثم اختر الملف من جديد واحفظ"});
Object.assign(I18N.fr,{reimport:"Source importée depuis un fichier : cliquez sur Modifier, rechoisissez le fichier puis enregistrez"});
Object.assign(I18N.en,{reimport:"This source is an imported file: tap Edit, pick the file again and save"});
