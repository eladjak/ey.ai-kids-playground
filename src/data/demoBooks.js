/**
 * Demo books for Sipurai's Showcase section.
 * These are complete sample stories that visitors can browse through
 * to experience the platform before signing up.
 */

const demoBooks = [
  {
    id: 'demo-dragons-garden',
    title: {
      he: 'הגן הסודי של הדרקון',
      en: "The Dragon's Secret Garden",
    },
    genre: 'fantasy',
    art_style: 'watercolor',
    age_range: '5-8',
    language: 'hebrew',
    moral: 'אומץ וחסד יכולים להפוך אויבים לחברים',
    cover_gradient: 'from-emerald-400 via-teal-500 to-green-600',
    pages: [
      {
        pageNumber: 1,
        text: 'לילי הייתה ילדה שקטה שאהבה לטייל ביער שליד הכפר. יום אחד, כשהלכה בשביל שלא הכירה, גילתה חומה גבוהה של אבנים עתיקות מכוסות בקיסוס. בין האבנים הייתה דלת קטנה וישנה, פתוחה רק מעט. לילי הציצה פנימה וראתה גן מופלא מלא בפרחים שזוהרים באור רך.',
        imagePrompt:
          'Watercolor illustration of a shy little girl with braided hair discovering an ancient stone wall covered in ivy in a forest. A small wooden door is slightly ajar, revealing a magical glowing garden inside. Soft greens and golden light. Children book style, warm and inviting.',
      },
      {
        pageNumber: 2,
        text: 'לילי דחפה את הדלת בזהירות ונכנסה פנימה. הגן היה הכי יפה שראתה בחייה - פרחים בכל צבעי הקשת, פרפרים גדולים כציפורים, ועצים שפירותיהם נוצצו כמו יהלומים. אבל אז שמעה רעש עמוק, כמו נשימה כבדה. מאחורי השיחים הגדולים, זוג עיניים ירוקות ענקיות הביטו בה.',
        imagePrompt:
          'Watercolor painting of a magical garden seen from inside - rainbow flowers, oversized butterflies, fruit trees with sparkling diamond-like fruits. A small girl stands in awe. Two large green eyes peer from behind bushes. Dreamy watercolor style, luminous colors, children book illustration.',
      },
      {
        pageNumber: 3,
        text: 'לילי רצתה לברוח, אבל אז שמעה משהו מפתיע - הדרקון הגדול והירוק... בכה. דמעות גדולות כבועות סבון נפלו מעיניו. "אל תפחדי," לחש הדרקון בקול רועד. "אני אזמרגד. אני שומר על הגן הזה כבר מאות שנים, אבל כבר כל כך הרבה זמן שאף אחד לא בא לבקר. אני כל כך לבד."',
        imagePrompt:
          'Watercolor illustration of a large gentle green dragon crying big bubble-like tears in a magical garden. A small brave girl stands before him, looking up with compassion. The dragon looks sad but not scary. Soft watercolors, emotional scene, children book style.',
      },
      {
        pageNumber: 4,
        text: 'לילי הרגישה את הפחד נמס מליבה. היא ניגשה לאזמרגד והניחה את ידה הקטנה על כפה הענקית שלו. "אני אבוא לבקר אותך כל יום," הבטיחה לילי. "ואני אביא גם חברים." הדרקון חייך חיוך רחב, ומהנשימה החמה שלו צמחו פרחים חדשים בכל הגן. "תודה לך, ילדה אמיצה," אמר אזמרגד.',
        imagePrompt:
          'Watercolor illustration of a small girl placing her tiny hand on a large green dragon paw. The dragon is smiling warmly, and new flowers are blooming from his warm breath. Magical garden background. Tender moment, warm colors, children book watercolor style.',
      },
      {
        pageNumber: 5,
        text: 'מאז, לילי באה לגן כל יום אחרי בית הספר. היא הביאה את חבריה, והם גילו שאזמרגד מספר את הסיפורים הכי מדהימים בעולם. הגן הסודי הפך למקום הכי שמח ביער. ולילי? היא למדה שלפעמים הדברים הכי מפחידים מסתירים בפנים את הדברים הכי יפים - צריך רק קצת אומץ ולב טוב כדי לגלות את זה.',
        imagePrompt:
          'Watercolor illustration of a group of happy children sitting around a large friendly green dragon in a magical garden, listening to stories. Butterflies and glowing flowers surround them. The shy girl from before is now confident and happy. Warm sunset light, joyful scene, children book watercolor finale.',
      },
    ],
  },
  {
    id: 'demo-space-adventure',
    title: {
      he: 'הרפתקה בחלל עם יעל',
      en: 'Space Adventure with Yael',
    },
    genre: 'science-fiction',
    art_style: 'pixar',
    age_range: '6-10',
    language: 'hebrew',
    moral: 'סקרנות ועבודת צוות פותרות כל בעיה',
    cover_gradient: 'from-indigo-500 via-purple-500 to-blue-600',
    pages: [
      {
        pageNumber: 1,
        text: 'יעל אהבה לבנות דברים. מקופסאות קרטון היא בנתה טירות, ממכסי בקבוקים היא יצרה רובוטים, ומצינורות ישנים היא המציאה טלסקופ. יום אחד, יעל החליטה לבנות את הדבר הכי גדול שאפשר - חללית אמיתית! היא אספה חלקים ממוחזרים מכל השכונה והתחילה לעבוד.',
        imagePrompt:
          'Pixar-style 3D illustration of a creative girl with curly hair and overalls building a spaceship from recycled materials - cardboard boxes, plastic bottles, old pipes - in her backyard. Tools scattered around. Bright, optimistic lighting. Pixar quality rendering, children movie style.',
      },
      {
        pageNumber: 2,
        text: 'כשיעל סיימה לבנות, היא לחצה על הכפתור האדום הגדול. החללית רעדה, השמיעה צפצוף חזק, ו... המריאה! יעל טסה מעל הבתים, מעל העננים, מעל הירח, עד שהגיעה לכוכב לכת מוזר שכולו היה הפוך - העצים גדלו מלמטה למעלה, הגשם עלה מהאדמה לשמיים, והילדים שם הלכו על הידיים!',
        imagePrompt:
          'Pixar-style 3D illustration of a homemade recycled-materials spaceship flying through colorful space, approaching a strange upside-down planet. Trees grow downward from floating islands, rain falls upward. A girl looks out the window in amazement. Vibrant colors, Pixar quality, whimsical sci-fi.',
      },
      {
        pageNumber: 3,
        text: 'אבל אז, בום! החללית נחתה קצת חזק מדי, ואחד הכנפיים נשבר. "אוי לא," אמרה יעל. "איך אני אחזור הביתה?" מאחורי סלע הפוך הציצו שלושה ילדים חייזרים - עם אוזניים סגולות וחיוכים ענקיים. "שלום!" אמרה אחת מהן. "אני זיפי. אנחנו יכולים לעזור לך!"',
        imagePrompt:
          'Pixar-style 3D illustration of a crashed homemade spaceship with a broken wing on an upside-down planet. Three cute alien children with purple ears and big smiles peek from behind an upside-down rock. A girl stands by her ship looking worried. Pixar quality, friendly aliens, colorful landscape.',
      },
      {
        pageNumber: 4,
        text: 'יעל וחברותיה החדשות עבדו ביחד. זיפי ידעה איזה צמחים יכולים לשמש כדבק חזק. בובו, חבר נוסף, מצא אבנים קלות שיכולות להחליף את הכנף השבורה. ויעל לימדה אותם איך לחבר הכול עם ברגים וחוטים. ביחד, הם תיקנו את החללית - וזה היה אפילו יותר טוב ממה שהיה קודם!',
        imagePrompt:
          'Pixar-style 3D illustration of a girl and three alien kids working together to repair a spaceship. One alien applies plant-based glue, another carries lightweight stones, the girl uses tools. Teamwork scene, everyone smiling and contributing. Pixar quality, warm collaborative atmosphere.',
      },
      {
        pageNumber: 5,
        text: '"בואי לבקר אותנו שוב!" קראה זיפי כשיעל עלתה לחללית המתוקנת. "בטח!" חייכה יעל. "ואולי בפעם הבאה אתם תבואו לבקר אצלי על כדור הארץ. רק תזכרו - אצלנו הכול בכיוון הנכון!" כולם צחקו. יעל הפעילה את המנוע וטסה הביתה, עם חברים חדשים ועם הידיעה שאפשר לפתור כל בעיה - אם עושים את זה ביחד.',
        imagePrompt:
          'Pixar-style 3D illustration of a girl waving goodbye from her repaired spaceship window to three alien friends standing on their upside-down planet. Stars and colorful nebulas in the background. Happy farewell scene. Pixar quality, emotional and uplifting ending, children movie style.',
      },
    ],
  },
  {
    id: 'demo-brave-fox',
    title: {
      he: 'השועל האמיץ הקטן',
      en: 'The Brave Little Fox',
    },
    genre: 'adventure',
    art_style: 'storybook',
    age_range: '4-7',
    language: 'hebrew',
    moral: 'להיות קטן לא אומר להיות חלש - לכל אחד יש כוח מיוחד',
    cover_gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    pages: [
      {
        pageNumber: 1,
        text: 'ביער הגדול גרה משפחה של שועלים. כולם היו מהירים וזריזים, חוץ מאחד - ערן הקטן. ערן היה השועל הכי קטן ביער, ולא הצליח לרוץ מהר כמו אחיו ואחיותיו. "אל תדאג," אמרה לו אמא. "יום אחד תגלה מה הכוח המיוחד שלך." ערן לא היה בטוח שיש לו כוח מיוחד בכלל.',
        imagePrompt:
          'Classic storybook illustration of a small cute fox cub looking up at his bigger fox siblings who are running fast through an autumn forest. The little fox looks a bit sad but determined. Mother fox comforts him. Warm autumn colors, traditional storybook art style, soft textures.',
      },
      {
        pageNumber: 2,
        text: 'יום אחד, כשערן טייל ביער, הוא שמע צפצוף קטן וחלש. בין השורשים של עץ אלון ישן, הוא מצא ציפור קטנה עם כנף שבורה. "אני אעזור לך," לחש ערן. הוא הביא עלים רכים ועטף בהם את הכנף בזהירות. למחרת, הוא חזר עם גרגרים. ובכל יום אחרי כן, ערן טיפל בציפור בסבלנות ובעדינות.',
        imagePrompt:
          'Classic storybook illustration of a small gentle fox carefully wrapping a tiny bird injured wing with soft leaves near an old oak tree roots. Forest floor with mushrooms and ferns. Tender caring scene. Traditional storybook art, warm and gentle mood.',
      },
      {
        pageNumber: 3,
        text: 'השמועה על ערן התפשטה ביער. חיות נוספות התחילו לבוא אליו - ארנבון עם כפה כואבת, קיפוד עם קוץ תקוע, ואפילו דוב גדול עם כאב שיניים. ערן עזר לכולם בסבלנות ובחוכמה. הוא למד להכיר כל צמח מרפא ביער, וידע בדיוק מה עוזר לכל כאב.',
        imagePrompt:
          'Classic storybook illustration of a small fox acting as a forest healer - a line of forest animals waiting for help: a bunny with a hurt paw, a hedgehog, and a big bear. The fox has herbs and healing plants around him. Charming storybook art, warm colors, gentle humor.',
      },
      {
        pageNumber: 4,
        text: 'באחד הלילות, סערה חזקה הכתה ביער. עצים נפלו, שבילים נחסמו, וחיות רבות נפצעו. כולם ברחו אנה ואנה בבהלה - גם השועלים המהירים לא ידעו מה לעשות. אבל ערן? ערן ידע בדיוק. "עקבו אחריי!" קרא בקול חזק שלא שמעו ממנו מעולם. הוא ארגן את כל החיות - מי שחזק נשא את הפצועים, מי שמהיר הביא צמחי מרפא, ומי שגדול פינה את העצים.',
        imagePrompt:
          'Classic storybook illustration of a dramatic storm in a forest at night. A small brave fox stands on a rock, directing other animals - bears clearing fallen trees, fast foxes gathering herbs, rabbits helping injured animals. Lightning in sky but hope on faces. Dynamic storybook art, dramatic but not scary.',
      },
      {
        pageNumber: 5,
        text: 'כשהסערה עברה, כל חיות היער התאספו סביב ערן. "אתה הגיבור שלנו!" קרא הדוב הגדול. "אבל אני הכי קטן," התבייש ערן. "אתה הכי קטן בגודל," חייכה אמא שלו, "אבל הכי גדול בלב ובחוכמה." מאז, ערן הפך למרפא הרשמי של היער. הוא גילה שלא צריך להיות הכי מהיר או הכי חזק - צריך רק למצוא את מה שאתה עושה הכי טוב.',
        imagePrompt:
          'Classic storybook illustration of all the forest animals gathered in a sunny clearing, celebrating a small fox hero. The little fox looks proud but humble, mother fox beside him. Flowers blooming, sunbeams through trees. Joyful, triumphant ending scene. Traditional storybook art, golden warm light.',
      },
    ],
  },
];

export default demoBooks;
