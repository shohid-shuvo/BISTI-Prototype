/* ==========================================================================
   BISTI — i18n.js
   Bangla ⇄ English language switcher + Light/Dark theme switcher.

   How the language switching works
   --------------------------------
   The markup is authored Bangla-first. Instead of tagging every element with a
   data-en attribute, this module walks the DOM text nodes and looks each one up
   in a Bangla → English dictionary. Text nodes are cached on their first pass,
   so switching back to Bangla is a byte-for-byte restore of the original page.

   Anything whose text JavaScript overwrites at runtime (counters, the year, the
   result card, slider buttons …) is listed in SKIP_SEL and left to main.js,
   which re-renders itself on the `bisti:lang` event.
   ========================================================================== */
window.BISTI_I18N = (function () {
  'use strict';

  var KEY_LANG  = 'bisti-lang';
  var KEY_THEME = 'bisti-theme';

  var BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  var BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
                   'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  var EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

  var TITLE = {
    bn: 'BISTI — বায়রা ইন্টারন্যাশনাল স্কিলস ডেভেলপমেন্ট অ্যান্ড ট্রেনিং ইনস্টিটিউট',
    en: 'BISTI — BAIRA International Skills Development & Training Institute'
  };

  /* Elements whose text belongs to JavaScript at runtime. */
  var SKIP_SEL = [
    'script', 'style', 'noscript', 'iframe', 'svg',
    '.count', '#year', '#hPause', '.langsw__btn', '.themebtn__label',
    '.result__hint', '.form__note',
    '#rBadge', '#rTitle', '#rName', '#rRollNo', '#rTradeVal',
    '#rSessionVal', '#rDate', '#rGrade', '#rScore'
  ].join(',');

  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

  /* -------------------------------------------------------------- dictionary */
  var DICT = {
    /* ---- topbar ---- */
    'শনি – বৃহস্পতি : সকাল ৯টা – বিকাল ৫টা': 'Sat – Thu : 9:00 AM – 5:00 PM',
    'অভিবাসী কল্যাণ ও বৈদেশিক কর্মসংস্থান মন্ত্রণালয় অনুমোদিত': "Approved by the Ministry of Expatriates' Welfare & Overseas Employment",
    'হেড অফিস ওয়েবসাইট': 'Head Office Website',
    'ভাষা নির্বাচন': 'Select language',
    'থিম পরিবর্তন করুন': 'Toggle theme',
    'মেনু খুলুন': 'Open menu',
    'মেনু বন্ধ করুন': 'Close menu',
    'হটলাইন': 'Hotline',
    'ইমেইল': 'Email',

    /* ---- header actions ---- */
    'ফলাফল যাচাই': 'Check Result',
    'ভর্তি হোন': 'Apply Now',

    /* ---- nav ---- */
    'হোম': 'Home',
    'আমাদের সম্পর্কে': 'About Us',
    'প্রশাসন': 'Administration',
    'ট্রেড / কোর্স': 'Trades / Courses',
    'ভর্তি': 'Admission',
    'সার্টিফিকেট': 'Certificate',
    'সংবাদ': 'News',
    'ক্যারিয়ার': 'Career',
    'যোগাযোগ': 'Contact',
    'অনলাইনে আবেদন করুন': 'Apply Online',
    'হেড অফিস ওয়েবসাইট দেখুন': 'Visit Head Office Website',

    /* ---- running notice ---- */
    'চলমান নোটিশ': 'Running Notice',
    'ভর্তি বিজ্ঞপ্তি:': 'Admission Notice:',
    '২০২৬ শিক্ষাবর্ষের নতুন ব্যাচে ভর্তি চলছে — আসন সীমিত।': 'Admission is open for a new batch of the 2026 academic year — seats are limited.',
    'পরীক্ষা:': 'Exam:',
    'ট্রেড টেস্টের সময়সূচি প্রকাশিত হয়েছে।': 'The trade test schedule has been published.',
    'ফলাফল:': 'Result:',
    'সর্বশেষ ব্যাচের ফলাফল এখন অনলাইনে দেখুন।': 'View the latest batch results online now.',
    'নোটিশ:': 'Notice:',
    'সার্টিফিকেট বিতরণ অনুষ্ঠান আগামী বৃহস্পতিবার।': 'The certificate distribution ceremony is next Thursday.',

    /* ---- hero ---- */
    'দক্ষ হাত · সমৃদ্ধ দেশ': 'Skilled Hands · Prosperous Nation',
    'গড়ুন': 'Build a',
    'দক্ষ ক্যারিয়ার': 'Skilled Career',
    'বিশ্বমানের কারিগরি প্রশিক্ষণে': 'with World-Class Technical Training',
    'BISTI — বায়রা ইন্টারন্যাশনাল স্কিলস ডেভেলপমেন্ট অ্যান্ড ট্রেনিং ইনস্টিটিউট। কর্মমুখী ও দক্ষতা-ভিত্তিক প্রশিক্ষণের মাধ্যমে দেশে ও বিদেশে সম্মানজনক কর্মসংস্থানের নিশ্চয়তা।': 'BISTI — BAIRA International Skills Development & Training Institute. Job-oriented, skills-based training that ensures respectable employment at home and abroad.',
    'ভর্তি শুরু করুন': 'Start Admission',
    'কোর্স দেখুন': 'View Courses',
    'হাতে-কলমে প্রশিক্ষণ': 'Hands-on Training',
    'আধুনিক': 'Modern',
    'ওয়ার্কশপ ও ল্যাব': 'Workshops & Labs',
    'দিয়ে ব্যবহারিক শিক্ষা': 'for Practical Learning',
    'বাস্তব মেশিন আর যন্ত্রপাতিতে অনুশীলন — যাতে প্রশিক্ষণ শেষে আপনি সরাসরি কাজে নামতে পারেন, কোনো দ্বিধা ছাড়াই।': 'Practice on real machines and equipment — so that after training you can step straight into the job, with no hesitation.',
    'ট্রেড দেখুন': 'View Trades',
    'আরও জানুন': 'Learn More',
    'প্রশিক্ষণ শেষে কর্মসংস্থান': 'Employment After Training',
    '৯৬%': '96%',
    'চাকরি নিশ্চিত': 'Job Assurance',
    'প্রশিক্ষণ শেষে সহায়তা': 'Support After Training',
    'দেশি ও বিদেশি নিয়োগকারী প্রতিষ্ঠানের সাথে সরাসরি যোগাযোগ, ক্যারিয়ার কাউন্সেলিং এবং কাগজপত্র প্রস্তুতিতে সহায়তা।': 'Direct contact with local and overseas employers, career counselling and help with preparing your documents.',
    'যোগাযোগ করুন': 'Contact Us',
    'আগের স্লাইড': 'Previous slide',
    'পরের স্লাইড': 'Next slide',
    'স্লাইড থামান': 'Pause slideshow',
    'স্লাইড চালান': 'Play slideshow',
    'থামান': 'Pause',
    'চালান': 'Play',

    /* ---- feature strip ---- */
    'কম্পিটেন্সি ভিত্তিক': 'Competency Based',
    'জাতীয় দক্ষতা মানদণ্ড (NSQ) অনুসারে সাজানো পাঠ্যক্রম।': 'Curriculum aligned with the National Skills Qualification (NSQ) framework.',
    'স্বীকৃত প্রতিষ্ঠান': 'Recognised Institute',
    'সংশ্লিষ্ট সরকারি সংস্থা কর্তৃক অনুমোদিত প্রশিক্ষণ কেন্দ্র।': 'A training centre approved by the relevant government authority.',
    'অভিজ্ঞ প্রশিক্ষক': 'Expert Instructors',
    'শিল্প ও বিদেশে কাজের বাস্তব অভিজ্ঞতাসম্পন্ন ইনস্ট্রাক্টর।': 'Instructors with real industry and overseas work experience.',
    'চাকরির সংযোগ': 'Job Linkage',
    'নিয়োগকারী প্রতিষ্ঠান ও রিক্রুটিং এজেন্সির সাথে সরাসরি সম্পর্ক।': 'Direct relationships with employers and recruiting agencies.',

    /* ---- recent notices ---- */
    'সাম্প্রতিক নোটিশ': 'Recent Notices',
    'সব নোটিশ': 'All Notices',
    '১২': '12', '০৮': '08', '০২': '02', '২৫': '25', '২৮': '28',
    'অক্টো': 'Oct', 'সেপ্ট': 'Sep',
    '২০২৬ শিক্ষাবর্ষে নতুন ব্যাচে ভর্তি বিজ্ঞপ্তি প্রকাশিত': 'Admission notice published for the new batch of the 2026 academic year',
    'জরুরি': 'Urgent',
    'PDF নোটিশ': 'PDF Notice',
    'ডাউনলোড': 'Download',
    'ট্রেড টেস্ট ও মূল্যায়নের সময়সূচি প্রকাশ': 'Trade test and assessment schedule published',
    'নোটিশ': 'Notice',
    'সার্টিফিকেট বিতরণ অনুষ্ঠানের তারিখ পরিবর্তন': 'Certificate distribution ceremony date changed',
    'বিদেশি নিয়োগকারী প্রতিষ্ঠানের ভিজিট ও ইন্টারভিউ': 'Visit and interview by an overseas employer',
    'ইভেন্ট': 'Event',

    /* ---- principal ---- */
    'অধ্যক্ষের বাণী': "Principal's Message",
    'অধ্যক্ষ': 'Principal',
    'প্রিয় শিক্ষার্থী, আমাদের লক্ষ্য শুধু সনদ দেওয়া নয় — বরং আপনাকে সত্যিকারভাবে দক্ষ করে তোলা, যাতে দেশে বা বিদেশে যেকোনো কর্মক্ষেত্রে আপনি নিজের জায়গা তৈরি করতে পারেন। আমাদের দরজা সবসময় আপনার জন্য খোলা।': 'Dear students, our goal is not merely to hand out certificates — it is to make you genuinely skilled, so that you can carve out your own place in any workplace at home or abroad. Our doors are always open for you.',
    'মোঃ অধ্যক্ষের নাম': "Md. Principal's Name",
    'অধ্যক্ষ, BISTI': 'Principal, BISTI',
    'সম্পূর্ণ বাণী পড়ুন': 'Read Full Message',

    /* ---- about ---- */
    'প্রশিক্ষণ সেশন': 'Training session',
    'ওয়েল্ডিং অনুশীলন': 'Welding practice',
    'বছরের': 'Years of',
    'অভিজ্ঞতা': 'Experience',
    'সম্ভাবনাকে': 'Turning Potential',
    'কর্মদক্ষতায়': 'into Skill',
    'রূপান্তর': '',
    'বায়রা ইন্টারন্যাশনাল স্কিলস ডেভেলপমেন্ট অ্যান্ড ট্রেনিং ইনস্টিটিউট (BISTI) একটি আধুনিক কারিগরি প্রশিক্ষণ প্রতিষ্ঠান, যা দক্ষ, আত্মবিশ্বাসী এবং কর্মপ্রস্তুত টেকনিশিয়ান তৈরি করে। আমাদের ওয়ার্কশপ, ল্যাব ও শ্রেণিকক্ষ আন্তর্জাতিক মানে সাজানো — যাতে প্রতিটি প্রশিক্ষণার্থী বাস্তব যন্ত্রপাতিতেই অনুশীলন করতে পারে।': 'BAIRA International Skills Development & Training Institute (BISTI) is a modern technical training institute that produces skilled, confident and job-ready technicians. Our workshops, labs and classrooms are set to international standards — so that every trainee can practise on real equipment.',
    'পূর্ণাঙ্গ ওয়ার্কশপে হাতে-কলমে প্রশিক্ষণ': 'Hands-on training in a fully equipped workshop',
    'জাতীয়ভাবে স্বীকৃত দক্ষতা সনদ': 'Nationally recognised skills certificate',
    'মূল্যায়ন ও ট্রেড টেস্টে সহায়তা': 'Support for assessment and trade tests',
    'ক্যারিয়ার কাউন্সেলিং ও বিদেশ যাওয়ার ডকুমেন্টেশন সহায়তা': 'Career counselling and documentation support for going abroad',
    'পরামর্শ নিন': 'Get Advice',
    'সব ট্রেড দেখুন': 'View All Trades',

    /* ---- counters ---- */
    'প্রশিক্ষণপ্রাপ্ত': 'Trained',
    'স্কিল ট্রেড': 'Skill Trades',
    'কর্মসংস্থান': 'Employment',

    /* ---- trades / courses ---- */
    'ট্রেড ও কোর্স': 'Trades & Courses',
    'আপনার': 'Choose Your',
    'দক্ষতা বেছে নিন': 'Skill',
    'নিয়োগকারীদের চাহিদা অনুযায়ী সাজানো স্বল্পমেয়াদি, কর্মমুখী কোর্স — শূন্য থেকে শুরু করে চাকরির উপযোগী হয়ে উঠুন।': 'Short, job-oriented courses designed around employer demand — start from zero and become job-ready.',
    'ইলেকট্রিক্যাল প্রশিক্ষণ': 'Electrical training',
    'টেকনিক্যাল': 'Technical',
    'ইলেকট্রিক্যাল (Electrical)': 'Electrical',
    'ওয়্যারিং, মোটর কন্ট্রোল, নিরাপত্তা এবং আবাসিক ও শিল্প স্থাপনায় ট্রাবলশুটিং।': 'Wiring, motor control, safety and troubleshooting in residential and industrial installations.',
    '৩ মাস': '3 Months',
    '৩০ আসন': '30 Seats',
    'বিস্তারিত': 'Details',
    'ওয়েল্ডিং প্রশিক্ষণ': 'Welding training',
    'ওয়েল্ডিং (Welding)': 'Welding',
    'SMAW ও MIG/TIG প্লেট এবং পাইপ জয়েন্ট অনুশীলন — বিদেশি নিয়োগকর্তার চাহিদার স্কিল।': 'Practice on SMAW and MIG/TIG plate and pipe joints — the skill overseas employers ask for.',
    '২৫ আসন': '25 Seats',
    'রেফ্রিজারেশন প্রশিক্ষণ': 'Refrigeration training',
    'রেফ্রিজারেশন ও এয়ার কন্ডিশনিং': 'Refrigeration & Air Conditioning',
    'ইনস্টলেশন, গ্যাস চার্জিং, ত্রুটি নির্ণয় এবং প্রতিরোধমূলক রক্ষণাবেক্ষণ।': 'Installation, gas charging, fault diagnosis and preventive maintenance.',
    '২ মাস': '2 Months',
    '২০ আসন': '20 Seats',
    'কম্পিউটার প্রশিক্ষণ': 'Computer training',
    'আইটি': 'IT',
    'কম্পিউটার / আইটি (Computer / IT)': 'Computer / IT',
    'অফিস অ্যাপ্লিকেশন, হার্ডওয়্যার বেসিক, নেটওয়ার্কিং এবং ফ্রিল্যান্সিং স্কিল।': 'Office applications, hardware basics, networking and freelancing skills.',
    '৪০ আসন': '40 Seats',
    'প্লাম্বিং প্রশিক্ষণ': 'Plumbing training',
    'প্লাম্বিং (Plumbing)': 'Plumbing',
    'GI/PPR/CPVC পাইপিং, স্যানিটারি ফিটিং, ড্রয়িং পড়া ও প্রেশার টেস্টিং।': 'GI/PPR/CPVC piping, sanitary fittings, drawing reading and pressure testing.',
    'মেসনরি প্রশিক্ষণ': 'Masonry training',
    'কনস্ট্রাকশন': 'Construction',
    'মেসনরি ও কনস্ট্রাকশন': 'Masonry & Construction',
    'ইটের গাঁথুনি, প্লাস্টার, আরসিসি কাজ, রড বাইন্ডিং ও সাইট নিরাপত্তা।': 'Brickwork, plastering, RCC work, rod binding and site safety.',
    'আরও যে ট্রেডগুলো চালু আছে:': 'Other trades currently offered:',
    'কার্পেন্ট্রি (Carpentry)': 'Carpentry',
    'কনস্ট্রাকশন (Construction)': 'Construction',
    'ল্যাঙ্গুয়েজ (Language)': 'Language',
    'সোলার পিভি (Solar PV)': 'Solar PV',
    'টেইলরিং (Tailoring)': 'Tailoring',
    'অটোমোটিভ (Automotive)': 'Automotive',
    'অন্যান্য শর্ট কোর্স': 'Other Short Courses',
    'সব ২৪টি ট্রেড দেখুন': 'View All 24 Trades',

    /* ---- result / certificate ---- */
    'ফলাফল ও': 'Result &',
    'সার্টিফিকেট যাচাই': 'Certificate Verification',
    'রোল / রেজিস্ট্রেশন নম্বর দিয়ে অনলাইনে ফলাফল দেখুন এবং সার্টিফিকেটের সত্যতা যাচাই করুন।': 'Check results online with a roll / registration number and verify the authenticity of a certificate.',
    'ফলাফল অনুসন্ধান': 'Result Search',
    'রোল / রেজিস্ট্রেশন নম্বর': 'Roll / Registration Number',
    'যেমন: BISTI-2025-0142': 'e.g. BISTI-2025-0142',
    'ট্রেড': 'Trade',
    'সব ট্রেড': 'All Trades',
    'সেশন / ব্যাচ': 'Session / Batch',
    'নির্বাচন করুন': 'Select',
    'ফলাফল দেখুন': 'View Result',
    'নাম': 'Name',
    'রোল / রেজি. নং': 'Roll / Reg. No.',
    'সেশন': 'Session',
    'মূল্যায়নের তারিখ': 'Assessment Date',
    'ফলাফল': 'Result',
    'প্রাপ্ত নম্বর': 'Marks Obtained',
    'রেজাল্ট শিট ডাউনলোড': 'Download Result Sheet',
    'সার্টিফিকেট ডাউনলোড': 'Download Certificate',
    'এই রেকর্ডটি BISTI-এর অনলাইন ভেরিফিকেশন সিস্টেম দ্বারা নিশ্চিত করা হয়েছে।': "This record has been verified by BISTI's online verification system.",

    /* ---- why choose ---- */
    'কেন BISTI': 'Why BISTI',
    'প্রতিটি ধাপ সাজানো': 'Every Step Designed Around',
    'আপনার কর্মসংস্থানকে': 'Your Employment',
    'ঘিরে': '',
    'আমরা শুধু একটি ট্রেড শেখাই না — কর্মক্ষেত্রের জন্য প্রস্তুত করি। ক্লাসের প্রথম দিন থেকে ট্রেড টেস্টের দিন পর্যন্ত প্রতিটি ধাপে পাশে থাকি।': "We don't just teach a trade — we prepare you for the workplace. We stand beside you at every step, from the first day of class to the day of the trade test.",
    'ব্যবহারিক ওয়ার্কশপ সময়': 'Practical Workshop Time',
    '৮৫%': '85%',
    'শিক্ষার্থী সন্তুষ্টি': 'Student Satisfaction',
    '৯৪%': '94%',
    'মূল্যায়নে পাসের হার': 'Assessment Pass Rate',
    '৯১%': '91%',
    'আধুনিক ল্যাব ও ওয়ার্কশপ': 'Modern Labs & Workshops',
    'বাস্তব মেশিন, বাস্তব যন্ত্রপাতি, বাস্তব অনুশীলন — শুধু বোর্ডে তত্ত্ব নয়।': 'Real machines, real equipment, real practice — not just theory on the board.',
    'ছোট ব্যাচ, বেশি মনোযোগ': 'Small Batches, More Attention',
    'প্রতি ব্যাচে সীমিত আসন, যাতে প্রত্যেকে প্রশিক্ষকের সময় পায়।': "Limited seats per batch, so everyone gets the instructor's time.",
    'সাশ্রয়ী ও নমনীয়': 'Affordable & Flexible',
    'যৌক্তিক ফি, সহজ কিস্তি এবং দিন/সন্ধ্যা দুই শিফটের সুবিধা।': 'Reasonable fees, easy instalments and both day and evening shifts.',
    'সনদ ও চাকরিতে সহায়তা': 'Certificate & Job Support',
    'স্বীকৃত সার্টিফিকেটের সাথে প্রশিক্ষণ শেষে কর্মসংস্থান সহায়তা।': 'A recognised certificate plus employment support after training.',

    /* ---- administration / trainers ---- */
    'প্রশাসন ও প্রশিক্ষক': 'Administration & Trainers',
    'আমাদের দক্ষ': 'Our Expert',
    'প্রশিক্ষকমণ্ডলী': 'Instructors',
    'যাঁরা মাঠে, কারখানায় ও বিদেশে কাজ করেছেন — এবং জানেন চাকরিতে ঠিক কী চাওয়া হয়।': 'People who have worked on site, in factories and abroad — and know exactly what the job demands.',
    'প্রশিক্ষক': 'Instructor',
    'প্রশিক্ষকের নাম': "Instructor's Name",
    'চিফ ইনস্ট্রাক্টর — ইলেকট্রিক্যাল': 'Chief Instructor — Electrical',
    'সিনিয়র ট্রেইনার — কম্পিউটার ও আইটি': 'Senior Trainer — Computer & IT',
    'ট্রেড ট্রেইনার — ওয়েল্ডিং': 'Trade Trainer — Welding',
    'ক্যারিয়ার কাউন্সেলর': 'Career Counsellor',

    /* ---- admission ---- */
    'ভর্তি চলছে': 'Admission Open',
    'আজই ভর্তি হোন —': 'Apply Today —',
    'আসন সীমিত': 'Seats Are Limited',
    'নতুন ব্যাচ শুরু হতে যাচ্ছে। ফর্মটি পূরণ করুন — আমাদের ভর্তি অফিসার কোর্সের বিস্তারিত, ফি ও ক্লাসের সময়সূচি জানিয়ে কল করবেন।': 'A new batch is about to begin. Fill in the form — our admission officer will call you with course details, fees and class schedules.',
    'ফ্রি ক্যারিয়ার কাউন্সেলিং সেশন': 'Free career counselling session',
    'সহজ কিস্তিতে কোর্স ফি': 'Course fees in easy instalments',
    'দিন ও সন্ধ্যা শিফটের সুবিধা': 'Day and evening shift options',
    'অনলাইন আবেদনের সুবিধা': 'Online application facility',
    'দ্রুত ভর্তি ফর্ম': 'Quick Admission Form',
    'পূর্ণ নাম': 'Full Name',
    'মোবাইল নম্বর': 'Mobile Number',
    'ট্রেড নির্বাচন করুন': 'Select a Trade',
    'আপনার বার্তা (ঐচ্ছিক)': 'Your message (optional)',
    'আবেদন জমা দিন': 'Submit Application',

    /* ---- testimonials ---- */
    'সফলতার গল্প': 'Success Stories',
    'আমাদের প্রশিক্ষণার্থীরা': 'What Our Trainees',
    'যা বলেন': 'Say',
    'শূন্য অভিজ্ঞতা নিয়ে ওয়েল্ডিং কোর্সে ভর্তি হয়েছিলাম। তিন মাস পর ট্রেড টেস্ট পাস করে এখন বিদেশে কাজ করছি। ব্যবহারিক ক্লাসগুলোই আসল পার্থক্য গড়ে দিয়েছে।': 'I joined the welding course with zero experience. Three months later I passed the trade test and now I work abroad. The practical classes made the real difference.',
    'মোঃ রাকিব হাসান': 'Md. Rakib Hasan',
    'ওয়েল্ডিং — ব্যাচ ১২': 'Welding — Batch 12',
    'আইটি কোর্সটি খুব সুন্দরভাবে পরিচালিত হয়েছে। প্রশিক্ষকরা ধৈর্য ধরে সব বুঝিয়েছেন এবং ঘরে বসে ফ্রিল্যান্সিং শুরু করতে সাহায্য করেছেন।': 'The IT course was run very well. The instructors patiently explained everything and helped me start freelancing from home.',
    'নুসরাত জাহান': 'Nusrat Jahan',
    'কম্পিউটার ও আইটি — ব্যাচ ০৮': 'Computer & IT — Batch 08',
    'পরিষ্কার ওয়ার্কশপ, আসল মেশিন আর সত্যিকারের যত্ন নেওয়া প্রশিক্ষক। ক্যারিয়ার কাউন্সেলিং টিম কাগজপত্র প্রস্তুত করতেও সাহায্য করেছে।': 'Clean workshops, real machines and instructors who genuinely care. The career counselling team even helped prepare my documents.',
    'আব্দুল করিম': 'Abdul Karim',
    'রেফ্রিজারেশন ও এসি — ব্যাচ ০৫': 'Refrigeration & AC — Batch 05',
    'আগের': 'Previous',
    'পরের': 'Next',

    /* ---- gallery ---- */
    'ক্যাম্পাস জীবন': 'Campus Life',
    'আমাদের প্রশিক্ষণ কেন্দ্রের': 'Inside Our',
    'ভেতরের ছবি': 'Training Centre',
    'ওয়ার্কশপ': 'Workshop',
    'শ্রেণিকক্ষ': 'Classroom',
    'প্রশিক্ষণার্থী': 'Trainee',
    'টিম ওয়ার্ক': 'Team work',
    'সমাবর্তন': 'Convocation',

    /* ---- news ---- */
    'নোটিশ ও সংবাদ': 'Notice & News',
    'সাম্প্রতিক': 'Recent',
    'আপডেট': 'Updates',
    'অ্যাডমিন': 'Admin',
    'ওয়েল্ডিং ও ইলেকট্রিক্যাল ট্রেডে নতুন ব্যাচের ভর্তি শুরু': 'Admission open for a new batch in Welding and Electrical trades',
    'বিস্তারিত পড়ুন': 'Read More',
    'সকল প্রশিক্ষণার্থীর জন্য ট্রেড টেস্ট ও মূল্যায়নের সময়সূচি': 'Trade test and assessment schedule for all trainees',
    'বিদেশি নিয়োগকারী প্রতিষ্ঠান আমাদের গ্র্যাজুয়েটদের সাথে দেখা করবে': 'An overseas employer will meet our graduates',

    /* ---- career ---- */
    'ইন্টার্নশিপ ও': 'Internship &',
    'চাকরির সুযোগ': 'Job Opportunities',
    'আমাদের প্রশিক্ষণার্থীদের জন্য ইন্টার্নশিপ এবং দেশি-বিদেশি নিয়োগকারী প্রতিষ্ঠানের সর্বশেষ সার্কুলার।': 'Internships for our trainees and the latest circulars from local and overseas employers.',
    'চাকরির সার্কুলার': 'Job Circulars',
    'ইন্টার্নশিপের জন্য আবেদন': 'Apply for Internship',

    /* ---- faq ---- */
    'প্রশ্ন আছে?': 'Have Questions?',
    'সাধারণ': 'Frequently Asked',
    'জিজ্ঞাসা': 'Questions',
    'উত্তর খুঁজে পাচ্ছেন না? আমাদের ভর্তি টিম এক কল দূরেই।': "Can't find an answer? Our admission team is just one call away.",
    'কে ভর্তি হতে পারবেন?': 'Who can enrol?',
    '১৮ বছর বা তার বেশি বয়সী যে কেউ আবেদন করতে পারবেন। ন্যূনতম শিক্ষাগত যোগ্যতা ট্রেড অনুযায়ী ভিন্ন — বেশিরভাগ কারিগরি কোর্সে প্রাথমিক সাক্ষরতা ও জাতীয় পরিচয়পত্র থাকলেই হয়।': 'Anyone aged 18 or above can apply. The minimum educational requirement varies by trade — for most technical courses, basic literacy and a national ID card are enough.',
    'কোর্স কতদিনের?': 'How long are the courses?',
    'ট্রেড অনুযায়ী কোর্স ১ থেকে ৬ মাস পর্যন্ত হয়ে থাকে। প্রতিটি কোর্সে শ্রেণিকক্ষের পাশাপাশি যথেষ্ট ব্যবহারিক ওয়ার্কশপ সময় থাকে।': 'Courses run from 1 to 6 months depending on the trade. Every course includes plenty of practical workshop time alongside classroom sessions.',
    'কোর্স শেষে সার্টিফিকেট পাবো কি?': 'Will I get a certificate after the course?',
    'হ্যাঁ। কোর্স সম্পন্ন করে মূল্যায়নে উত্তীর্ণ হলে স্বীকৃত দক্ষতা সনদ দেওয়া হয়, যা দেশি চাকরি ও বিদেশ যাওয়ার প্রক্রিয়ায় সহায়ক।': 'Yes. On completing the course and passing the assessment you receive a recognised skills certificate, which helps with local jobs and the process of going abroad.',
    'চাকরিতে সহায়তা করেন কি?': 'Do you help with jobs?',
    'আমাদের প্লেসমেন্ট ডেস্ক প্রশিক্ষণপ্রাপ্তদের দেশি নিয়োগকারী ও রিক্রুটিং এজেন্সির সাথে সংযুক্ত করে এবং ডকুমেন্টেশন ও ইন্টারভিউ প্রস্তুতিতে সহায়তা করে।': 'Our placement desk connects trainees with local employers and recruiting agencies, and assists with documentation and interview preparation.',
    'কোর্স ফি কি কিস্তিতে দেওয়া যায়?': 'Can the course fee be paid in instalments?',
    'হ্যাঁ — কোর্স ফি সহজ কিস্তিতে পরিশোধের সুবিধা আছে। বর্তমান ফি কাঠামো ও পরিশোধ পরিকল্পনার জন্য আমাদের ভর্তি অফিসারের সাথে কথা বলুন।': 'Yes — course fees can be paid in easy instalments. Talk to our admission officer for the current fee structure and payment plan.',
    'সার্টিফিকেট কীভাবে যাচাই করবো?': 'How do I verify a certificate?',
    'ওয়েবসাইটের': 'Go to the',
    'সেকশনে গিয়ে সার্টিফিকেট নম্বর দিলে রেকর্ডটি যাচাই হয়ে যাবে।': 'section of the website and enter the certificate number to verify the record.',

    /* ---- contact ---- */
    'আমাদের': 'Visit Our',
    'ক্যাম্পাসে আসুন': 'Campus',
    'ঠিকানা': 'Address',
    'বায়রা ইন্টারন্যাশনাল স্কিলস ডেভেলপমেন্ট অ্যান্ড ট্রেনিং ইনস্টিটিউট (BISTI)': 'BAIRA International Skills Development & Training Institute (BISTI)',
    'ঠিকানার লাইন, শহর, বাংলাদেশ': 'Address line, City, Bangladesh',
    'ফোন': 'Phone',
    'অফিস সময়': 'Office Hours',
    'শনিবার – বৃহস্পতিবার': 'Saturday – Thursday',
    'সকাল ৯টা – বিকাল ৫টা': '9:00 AM – 5:00 PM',
    'আমাদের বার্তা পাঠান': 'Send Us a Message',
    'আপনার নাম': 'Your Name',
    'ইমেইল ঠিকানা': 'Email Address',
    'ফোন নম্বর': 'Phone Number',
    'বিষয়': 'Subject',
    'আপনার বার্তা লিখুন...': 'Write your message...',
    'বার্তা পাঠান': 'Send Message',

    /* ---- footer ---- */
    'বায়রা ইন্টারন্যাশনাল স্কিলস ডেভেলপমেন্ট অ্যান্ড ট্রেনিং ইনস্টিটিউট — মানসম্মত কারিগরি প্রশিক্ষণের মাধ্যমে দক্ষ, কর্মপ্রস্তুত ও স্বনির্ভর প্রজন্ম গড়ে তোলা।': 'BAIRA International Skills Development & Training Institute — building a skilled, job-ready and self-reliant generation through quality technical training.',
    'দ্রুত লিংক': 'Quick Links',
    'ভর্তি তথ্য': 'Admission Info',
    'গ্যালারি': 'Gallery',
    'নোটিশ বোর্ড': 'Notice Board',
    'জনপ্রিয় ট্রেড': 'Popular Trades',
    'ইলেকট্রিক্যাল': 'Electrical',
    'ওয়েল্ডিং': 'Welding',
    'রেফ্রিজারেশন ও এসি': 'Refrigeration & AC',
    'কম্পিউটার / আইটি': 'Computer / IT',
    'প্লাম্বিং': 'Plumbing',
    'মেসনরি': 'Masonry',
    'নিউজলেটার': 'Newsletter',
    'ভর্তি নোটিশ ও কোর্স আপডেট পেতে সাবস্ক্রাইব করুন।': 'Subscribe to get admission notices and course updates.',
    'আপনার ইমেইল': 'Your email',
    'সাবস্ক্রাইব': 'Subscribe',
    'ঠিকানা, বাংলাদেশ': 'Address, Bangladesh',
    'BISTI — বায়রা ইন্টারন্যাশনাল স্কিলস ডেভেলপমেন্ট অ্যান্ড ট্রেনিং ইনস্টিটিউট। সর্বস্বত্ব সংরক্ষিত।': 'BISTI — BAIRA International Skills Development & Training Institute. All rights reserved.',
    'প্রাইভেসি পলিসি': 'Privacy Policy',
    'ব্যবহারের শর্তাবলী': 'Terms of Use',
    'WhatsApp-এ কথা বলুন': 'Chat on WhatsApp',
    'WhatsApp-এ যোগাযোগ করুন': 'Contact us on WhatsApp',
    'উপরে যান': 'Back to top'
  };

  /* ---------------------------------------------------------------- helpers */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* private mode */ }
  }
  function toBn(v) {
    return String(v).replace(/\d/g, function (d) { return BN_DIGITS[+d]; });
  }

  /* Split "  text  " into its whitespace and its content, so a replacement can
     keep the exact spacing the template relies on. */
  function parts(raw) {
    var m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return m ? { lead: m[1], core: m[2], tail: m[3] }
             : { lead: '', core: raw, tail: '' };
  }

  var nodeOrig = new WeakMap();
  var attrOrig = new WeakMap();

  function skipped(el) {
    return !!(el && el.closest && el.closest(SKIP_SEL));
  }

  /* ------------------------------------------------------------ text pass */
  function applyTextNodes(root, lang) {
    if (!root || !document.createTreeWalker) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var v = n.nodeValue;
        if (!v || !v.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p || p.nodeType !== 1) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (skipped(p)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var n;
    while ((n = walker.nextNode())) {
      if (!nodeOrig.has(n)) nodeOrig.set(n, n.nodeValue);

      var raw = nodeOrig.get(n);
      var p = parts(raw);
      if (!p.core) continue;

      if (lang === 'en') {
        var en = DICT[p.core];
        if (en === undefined) continue;       /* already English, or not in the map */
        n.nodeValue = p.lead + en + p.tail;
      } else {
        n.nodeValue = raw;
      }
    }
  }

  /* ------------------------------------------------------- attribute pass */
  function applyAttrs(root, lang) {
    if (!root || !root.querySelectorAll) return;

    $$(ATTRS.map(function (a) { return '[' + a + ']'; }).join(','), root).forEach(function (el) {
      if (skipped(el)) return;

      var store = attrOrig.get(el);
      if (!store) { store = {}; attrOrig.set(el, store); }

      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        if (!(a in store)) store[a] = el.getAttribute(a);

        var p = parts(store[a]);
        if (!p.core) return;

        if (lang === 'en') {
          var en = DICT[p.core];
          if (en !== undefined) el.setAttribute(a, p.lead + en + p.tail);
        } else {
          el.setAttribute(a, store[a]);
        }
      });
    });
  }

  /* ----------------------------------------------------------------- state */
  var lang  = read(KEY_LANG) === 'en' ? 'en' : 'bn';      /* Bangla on first visit */
  var theme = read(KEY_THEME) === 'light' ? 'light' : 'dark'; /* Dark by default */

  function syncLangButtons() {
    $$('.langsw').forEach(function (sw) {
      sw.classList.toggle('is-en', lang === 'en');
    });
    $$('.langsw__btn').forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function applyLang(next, opts) {
    lang = next === 'en' ? 'en' : 'bn';
    write(KEY_LANG, lang);

    var d = document.documentElement;
    d.classList.toggle('lang-en', lang === 'en');
    d.setAttribute('lang', lang);

    applyTextNodes(document.body, lang);
    applyAttrs(document.body, lang);
    document.title = TITLE[lang];
    syncLangButtons();
    syncThemeControls();   /* the toggle's label + aria-label are language-aware too */

    if (!opts || !opts.silent) {
      document.dispatchEvent(new CustomEvent('bisti:lang', { detail: { lang: lang } }));
    }
  }

  /* ------------------------------------------------------------------ theme */
  var THEME_META = { light: '#0e2f7d', dark: '#0b1226' };

  function syncThemeControls() {
    var dark = theme === 'dark';

    $$('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('aria-label', t(
        dark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন',
        dark ? 'Switch to light mode' : 'Switch to dark mode'
      ));
      var label = $('.themebtn__label', b);
      if (label) label.textContent = t(dark ? 'লাইট মোড' : 'ডার্ক মোড',
                                       dark ? 'Light Mode' : 'Dark Mode');
    });

    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_META[theme]);
  }

  function applyTheme(next, opts) {
    theme = next === 'dark' ? 'dark' : 'light';
    write(KEY_THEME, theme);

    var d = document.documentElement;
    if (theme === 'dark') d.setAttribute('data-theme', 'dark');
    else d.removeAttribute('data-theme');

    syncThemeControls();

    if (!opts || !opts.silent) {
      document.dispatchEvent(new CustomEvent('bisti:theme', { detail: { theme: theme } }));
    }
  }

  /* ------------------------------------------------------------------- API */
  function t(bn, en) { return lang === 'en' ? en : bn; }

  function num(v) { return lang === 'en' ? String(v) : toBn(v); }

  function date(d) {
    d = d || new Date();
    return lang === 'en'
      ? d.getDate() + ' ' + EN_MONTHS[d.getMonth()] + ' ' + d.getFullYear()
      : toBn(d.getDate()) + ' ' + BN_MONTHS[d.getMonth()] + ' ' + toBn(d.getFullYear());
  }

  /* ------------------------------------------------------------------- boot */
  function init() {
    /* theme first — the head bootstrap already set the class, this syncs the
       controls and the meta colour */
    applyTheme(theme, { silent: true });

    /* wires the switchers */
    $$('.langsw__btn').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.dataset.lang); });
    });
    $$('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        applyTheme(theme === 'dark' ? 'light' : 'dark');
      });
    });

    /* rewrite the Bangla-first markup into the stored language */
    applyLang(lang);
  }

  /* This file sits at the end of <body>, so the markup above it is already
     parsed — running straight away avoids a flash of untranslated Bangla. It
     also runs before main.js, so the walker caches pristine originals. */
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);

  return {
    get lang() { return lang; },
    get theme() { return theme; },
    t: t,
    num: num,
    date: date,
    setLang: applyLang,
    setTheme: applyTheme,
    toggleTheme: function () { applyTheme(theme === 'dark' ? 'light' : 'dark'); }
  };
})();
