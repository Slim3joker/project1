/* Goldwörter – Grammatik-Modul
   Konjugations-Engine (Vokalharmonie, Konsonantenerweichung),
   Grammatik-Lektionen und Satzbau-Puzzle. */
"use strict";

// ---------------------------------------------------------------- Konjugator
const TR_VOWELS = "aeıioöuü";
// 4er-Harmonie: ı/i/u/ü – 2er-Harmonie: a/e
const HARM4 = { a: "ı", ı: "ı", e: "i", i: "i", o: "u", u: "u", ö: "ü", ü: "ü" };
const HARM2 = { a: "a", ı: "a", o: "a", u: "a", e: "e", i: "e", ö: "e", ü: "e" };
const VOICELESS = "fstkçşhp"; // fıstıkçı şahap

function lastVowelOf(s) {
  for (let i = s.length - 1; i >= 0; i--) if (TR_VOWELS.includes(s[i])) return s[i];
  return null;
}

// Verben, deren Stamm-t vor Vokal weich wird (t -> d): git-, et- und et-Komposita, tat-
function softenStem(stem) {
  if (stem === "git" || stem === "tat" || stem === "et" || (stem.length > 2 && stem.endsWith("et"))) {
    return stem.slice(0, -1) + "d";
  }
  return stem;
}

// Aorist-Ausnahmen: einsilbige Stämme, die -Ir statt -Ar nehmen
const AORIST_IR = ["al", "bil", "bul", "dur", "gel", "gör", "kal", "ol", "öl", "san", "ver", "vur"];

function endsWithVowel(s) {
  return TR_VOWELS.includes(s[s.length - 1]);
}

function syllableCount(s) {
  let n = 0;
  for (const c of s) if (TR_VOWELS.includes(c)) n++;
  return n;
}

const PERSONS = ["ben", "sen", "o", "biz", "siz", "onlar"];
const TENSES = {
  pres: { name: "Şimdiki zaman", de: "Gegenwart (-iyor)" },
  past: { name: "Geçmiş zaman", de: "Vergangenheit (-di)" },
  fut: { name: "Gelecek zaman", de: "Zukunft (-ecek)" },
  aor: { name: "Geniş zaman", de: "Aorist (-r, generell/immer)" },
};

/* Konjugiert ein Verb. inf: Infinitiv (…mak/…mek), personIdx: 0-5,
   tense: pres|past|fut|aor, negative: bool. Gibt String oder null zurück. */
function conjugate(inf, personIdx, tense, negative) {
  if (!/^[a-zçğıiöşü]+m[ae]k$/.test(inf)) return null;
  const stem = inf.slice(0, -3);
  const lv = lastVowelOf(stem);
  if (!lv) return null;
  const p = personIdx;

  if (tense === "pres") {
    if (negative) {
      // stem + m + I + yor
      const v = HARM4[lv];
      const base = stem + "m" + v + "yor";
      return base + ["um", "sun", "", "uz", "sunuz", "lar"][p];
    }
    let b = softenStem(stem);
    let harmSrc = lv;
    if (endsWithVowel(b)) b = b.slice(0, -1); // yaşa->yaş, iste->ist, ye->y
    const remV = lastVowelOf(b);
    const v = HARM4[remV || harmSrc];
    const base = b + v + "yor";
    return base + ["um", "sun", "", "uz", "sunuz", "lar"][p];
  }

  if (tense === "past") {
    let b = stem;
    if (negative) b = stem + "m" + HARM2[lv];
    const lv2 = lastVowelOf(b);
    const d = !negative && VOICELESS.includes(b[b.length - 1]) ? "t" : "d";
    const v = HARM4[lv2];
    const base = b + d + v;
    const nIz = "n" + v + "z";
    return base + ["m", "n", "", "k", nIz, HARM2[lv2] === "a" ? "lar" : "ler"][p];
  }

  if (tense === "fut") {
    let b;
    if (negative) {
      b = stem + "m" + HARM2[lv] + "y";
    } else {
      b = softenStem(stem);
      if (b === "y") b = "yi"; // ye- -> yiyecek
      if (b === "d" || stem === "de") b = "di"; // de- -> diyecek
      if (stem === "ye") b = "yi";
      if (endsWithVowel(b)) b = b + "y";
    }
    const a = HARM2[lv];
    const cek = a + "c" + a + "k"; // acak / ecek
    const cekSoft = a + "c" + a + "ğ"; // acağ / eceğ
    const i4 = HARM4[a];
    return [
      b + cekSoft + i4 + "m",
      b + cek + "s" + i4 + "n",
      b + cek,
      b + cekSoft + i4 + "z",
      b + cek + "s" + i4 + "n" + i4 + "z",
      b + cek + (a === "a" ? "lar" : "ler"),
    ][p];
  }

  if (tense === "aor") {
    if (negative) {
      const ma = "m" + HARM2[lv]; // ma/me
      const maz = ma + "z";
      const i4 = HARM4[lv];
      return [
        stem + ma + "m",
        stem + maz + "s" + i4 + "n",
        stem + maz,
        stem + ma + "y" + i4 + "z",
        stem + maz + "s" + i4 + "n" + i4 + "z",
        stem + maz + (HARM2[lv] === "a" ? "lar" : "ler"),
      ][p];
    }
    let b = softenStem(stem);
    let suffix;
    if (endsWithVowel(b)) suffix = "r"; // bekle-r, oku-r, ye-r
    else if (stem.endsWith("et")) suffix = "er"; // et-Komposita wie etmek: affeder, hisseder
    else if (syllableCount(b) > 1) suffix = HARM4[lastVowelOf(b)] + "r"; // çalış-ır
    else if (AORIST_IR.includes(stem)) suffix = HARM4[lastVowelOf(b)] + "r"; // gel-ir
    else suffix = HARM2[lastVowelOf(b)] + "r"; // yap-ar (gid-er über soften)
    const base = b + suffix;
    const lvB = lastVowelOf(base);
    const i4 = HARM4[lvB];
    return [
      base + HARM4[lvB] + "m",
      base + "s" + i4 + "n",
      base,
      base + HARM4[lvB] + "z",
      base + "s" + i4 + "n" + i4 + "z",
      base + (HARM2[lvB] === "a" ? "lar" : "ler"),
    ][p];
  }
  return null;
}

// ---------------------------------------------------------------- Lektionen
const GRAMMAR_LESSONS = [
  {
    id: "harmony",
    title: "Vokalharmonie – das Betriebssystem",
    ico: "🎵",
    html: `
<p>Türkische Endungen passen sich den Vokalen des Wortes an. Es gibt zwei Muster:</p>
<p><b>2er-Harmonie (a/e):</b> Nach a, ı, o, u kommt <b>a</b> – nach e, i, ö, ü kommt <b>e</b>.<br>
<i>araba<b>da</b></i> (im Auto) – <i>ev<b>de</b></i> (im Haus)</p>
<p><b>4er-Harmonie (ı/i/u/ü):</b> Nach a/ı → <b>ı</b>, nach e/i → <b>i</b>, nach o/u → <b>u</b>, nach ö/ü → <b>ü</b>.<br>
<i>yap<b>ı</b>yor</i>, <i>gel<b>i</b>yor</i>, <i>oku<b>u</b>… → oku<b>yor</b></i>, <i>gör<b>ü</b>yor</i></p>
<p>💡 Deshalb heißt es <i>mı / mi / mu / mü</i> – alles dieselbe Fragepartikel, nur harmonisiert.</p>`,
  },
  {
    id: "person",
    title: "Personalendungen",
    ico: "👤",
    html: `
<p>Das Subjekt steckt in der Endung – <i>ben, sen, o …</i> kann man oft weglassen:</p>
<table class="gtable">
<tr><td>ben</td><td>-(y)im / -m</td><td><i>geliyor<b>um</b></i> – ich komme</td></tr>
<tr><td>sen</td><td>-sin</td><td><i>geliyor<b>sun</b></i> – du kommst</td></tr>
<tr><td>o</td><td>–</td><td><i>geliyor</i> – er/sie kommt</td></tr>
<tr><td>biz</td><td>-(y)iz / -k</td><td><i>geliyor<b>uz</b></i> – wir kommen</td></tr>
<tr><td>siz</td><td>-siniz</td><td><i>geliyor<b>sunuz</b></i> – ihr kommt / Sie kommen</td></tr>
<tr><td>onlar</td><td>-lar/-ler</td><td><i>geliyor<b>lar</b></i> – sie kommen</td></tr>
</table>
<p>💡 In der Vergangenheit sind ben/biz anders: <i>geldi<b>m</b></i> (ich kam), <i>geldi<b>k</b></i> (wir kamen).</p>`,
  },
  {
    id: "pres",
    title: "Gegenwart: -iyor",
    ico: "▶️",
    html: `
<p><b>Stamm + (ı/i/u/ü)yor + Endung.</b> Der Stamm ist der Infinitiv ohne -mak/-mek.</p>
<p><i>gel-mek → gel<b>iyor</b>um</i> (ich komme) · <i>yap-mak → yap<b>ıyor</b>sun</i> (du machst) · <i>gör-mek → gör<b>üyor</b></i></p>
<p>Endet der Stamm auf Vokal, fällt der weg: <i>iste- → ist<b>iyor</b>um</i>, <i>yaşa- → yaş<b>ıyor</b></i>, <i>oku- → ok<b>uyor</b></i>.</p>
<p>Sonderfälle: <i>git- → gid</i>, <i>et- → ed</i> (t wird weich): <i>gidiyorum, ediyorum</i>. <i>ye- → yiyor</i>, <i>de- → diyor</i>.</p>
<p><b>Verneinung:</b> m + Harmonievokal vor -yor: <i>gel<b>mi</b>yorum</i> (ich komme nicht), <i>yap<b>mı</b>yor</i>, <i>oku<b>mu</b>yor</i>.</p>
<p>💡 Gesprochen wird -iyor meist zu „-iyo": <i>geliyo, napıyo(n)</i>.</p>`,
  },
  {
    id: "past",
    title: "Vergangenheit: -di",
    ico: "⏪",
    html: `
<p><b>Stamm + dı/di/du/dü + Endung.</b> Nach harten Konsonanten (f s t k ç ş h p – Merkwort: <i>fıstıkçı şahap</i>) wird d zu t.</p>
<p><i>gel<b>di</b>m</i> (ich kam) · <i>yap<b>tı</b>n</i> (du machtest) · <i>ol<b>du</b></i> (es wurde/geschah) · <i>git<b>ti</b>k</i> (wir gingen)</p>
<p>Endungen: -m, -n, –, -k, -niz, -ler: <i>geldim, geldin, geldi, geldik, geldiniz, geldiler</i>.</p>
<p><b>Verneinung:</b> -ma/-me vor -di: <i>gel<b>me</b>di</i> (er kam nicht), <i>yap<b>ma</b>dım</i> (ich hab's nicht gemacht).</p>
<p>💡 <i>Bitti</i> = es ist vorbei (bit-mek), <i>anladım</i> = verstanden!, <i>oldu</i> = alles klar.</p>`,
  },
  {
    id: "fut",
    title: "Zukunft: -ecek",
    ico: "⏩",
    html: `
<p><b>Stamm + acak/ecek + Endung.</b> Nach Vokal kommt ein y dazwischen, vor Vokal-Endung wird k zu ğ.</p>
<p><i>gel<b>eceğ</b>im</i> (ich werde kommen) · <i>yap<b>acak</b>sın</i> (du wirst machen) · <i>bekle<b>yecek</b></i> (er wird warten) · <i>gid<b>ecek</b>ler</i></p>
<p><b>Verneinung:</b> <i>gel<b>meyeceğ</b>im</i> (ich werde nicht kommen), <i>yap<b>mayacak</b></i>.</p>
<p>💡 Gesprochen schrumpft das oft: <i>geleceğim → „gelicem"</i>, <i>yapacağım → „yapıcam"</i> – so redet der Alltag!</p>`,
  },
  {
    id: "aor",
    title: "Aorist: -(i)r – generell/immer",
    ico: "🔁",
    html: `
<p>Der Aorist beschreibt Gewohnheiten, Allgemeines und Angebote – nicht das Jetzt:</p>
<p><i>Her sabah çay içer<b>im</b></i> = Ich trinke (grundsätzlich) jeden Morgen Tee.<br>
<i>Kapıyı açar mısın?</i> = Machst du (mal) die Tür auf?</p>
<p>Bildung: Stamm auf Vokal + r (<i>bekler, okur</i>) · mehrsilbig + ır/ir/ur/ür (<i>çalışır, konuşur</i>) · einsilbig meist + ar/er (<i>yapar, bakar</i>) – 12 Ausnahmen mit -ir: <i>alır, bilir, bulur, durur, gelir, görür, kalır, olur, ölür, sanır, verir, vurur</i>.</p>
<p><b>Verneinung (unregelmäßig!):</b> <i>gelmem</i> (ich komme nicht), <i>gelmezsin, gelmez, gelmeyiz, gelmezsiniz, gelmezler</i>.</p>
<p>💡 Daher: <i>olur</i> = geht klar · <i>olmaz</i> = geht nicht · <i>bilmem</i> = weiß ich nicht · <i>fark etmez</i> = ist egal.</p>`,
  },
  {
    id: "question",
    title: "Fragen: mı / mi / mu / mü",
    ico: "❓",
    html: `
<p>Die Fragepartikel steht <b>getrennt</b> hinter dem Wort und harmoniert mit ihm:</p>
<p><i>Geliyor <b>mu</b>sun?</i> = Kommst du? · <i>Yaptın <b>mı</b>?</i> = Hast du's gemacht? · <i>Güzel <b>mi</b>?</i> = Ist es schön?</p>
<p>Die Personalendung wandert bei -iyor/-ecek an die Partikel: <i>geliyor musun, gelecek misin</i> – aber in der Vergangenheit bleibt sie am Verb: <i>geldin mi?</i></p>
<p>💡 Betonung macht den Unterschied: <i>Sen mi yaptın?</i> = WARST DU das? vs. <i>Yaptın mı?</i> = Hast du es gemacht?</p>`,
  },
  {
    id: "cases",
    title: "Die 5 wichtigsten Fälle",
    ico: "📍",
    html: `
<p>Statt Präpositionen hängt Türkisch Endungen an – mit Harmonie:</p>
<table class="gtable">
<tr><td><b>-de/-da</b></td><td>in/an/bei</td><td><i>evde</i> = zu Hause, <i>işte</i> = auf der Arbeit</td></tr>
<tr><td><b>-e/-a</b></td><td>nach/zu</td><td><i>eve</i> = nach Hause, <i>okula</i> = zur Schule</td></tr>
<tr><td><b>-den/-dan</b></td><td>von/aus</td><td><i>evden</i> = von zu Hause, <i>senden</i> = von dir</td></tr>
<tr><td><b>-i/-ı/-u/-ü</b></td><td>Akkusativ (bestimmt)</td><td><i>kapıyı aç</i> = mach DIE Tür auf</td></tr>
<tr><td><b>-(n)in</b></td><td>Genitiv (von)</td><td><i>Ali'nin arabası</i> = Alis Auto</td></tr>
</table>
<p>Nach harten Konsonanten wird d zu t: <i>işte, sokakta</i>. Nach Vokalen kommen Puffer: <i>arabayı, arabaya, Ali'nin</i>.</p>
<p>💡 Deshalb ugs. „burda": <i>bura + da</i> = „an diesem Ort" – das a in der Mitte wird verschluckt.</p>`,
  },
  {
    id: "order",
    title: "Satzbau: Subjekt – Objekt – Verb",
    ico: "🧩",
    html: `
<p>Das Verb kommt <b>ans Ende</b>. Die Grundordnung ist Subjekt–Objekt–Verb:</p>
<p><i>Ben yarın İstanbul'a gidiyorum.</i><br>= Ich – morgen – nach Istanbul – fahre.</p>
<p>Zeit- und Ortsangaben stehen vor dem Verb, das Wichtigste direkt davor:<br>
<i>Yarın seninle <b>konuşmak</b> istiyorum</i> = Ich will morgen <b>mit dir reden</b>.</p>
<p>Die Reihenfolge davor ist flexibel – was direkt vorm Verb steht, ist betont:<br>
<i>Okula <b>ben</b> gidiyorum</i> = ICH gehe zur Schule (nicht du).</p>
<p>💡 Fürs Verstehen heißt das: <b>ans Satzende hören</b> – da sitzt das Verb mit Zeit und Person!</p>`,
  },
  {
    id: "colloquial",
    title: "So redet die Familie wirklich",
    ico: "🗣️",
    html: `
<p>Geschrieben ↔ gesprochen – die häufigsten Verkürzungen:</p>
<table class="gtable">
<tr><td>burada / şurada / orada / nerede</td><td>→</td><td><b>burda, şurda, orda, nerde</b></td></tr>
<tr><td>geliyor / yapıyor</td><td>→</td><td><b>geliyo, yapıyo</b></td></tr>
<tr><td>geleceğim / yapacağım</td><td>→</td><td><b>gelicem, yapıcam</b></td></tr>
<tr><td>ne yapıyorsun?</td><td>→</td><td><b>napıyorsun? / napıyon?</b></td></tr>
<tr><td>ne haber?</td><td>→</td><td><b>naber?</b></td></tr>
<tr><td>bir şey</td><td>→</td><td><b>bişey / bişi</b></td></tr>
<tr><td>değil mi?</td><td>→</td><td><b>di mi?</b></td></tr>
<tr><td>Allah'a ısmarladık</td><td>→</td><td><b>hoşça kal / hadi görüşürüz</b></td></tr>
</table>
<p><b>bura/şura/ora:</b> <i>burada</i> = hier (bei mir) · <i>şurada</i> = da drüben (man zeigt hin!) · <i>orada</i> = dort (weiter weg/bekannt).</p>
<p>💡 Beides ist richtig: burada ist die Schriftform, burda die Sprechform – wie „haben wir" vs. „hamwa".</p>`,
  },
];

// ---------------------------------------------------------------- Satz-Puzzle
const SENTENCES = [
  { tr: "Bugün işe gitmiyorum", de: "Ich gehe heute nicht zur Arbeit" },
  { tr: "Yarın seni arayacağım", de: "Ich rufe dich morgen an" },
  { tr: "Bu akşam ne yapıyorsun", de: "Was machst du heute Abend?" },
  { tr: "Türkçe öğrenmek istiyorum", de: "Ich will Türkisch lernen" },
  { tr: "Her sabah çay içerim", de: "Jeden Morgen trinke ich Tee" },
  { tr: "Dün gece çok geç yattım", de: "Gestern Nacht bin ich sehr spät ins Bett" },
  { tr: "Bana yardım eder misin", de: "Hilfst du mir (mal)?" },
  { tr: "Hafta sonu ailemi ziyaret edeceğim", de: "Am Wochenende besuche ich meine Familie" },
  { tr: "Bu kelimeyi bilmiyorum", de: "Dieses Wort kenne ich nicht" },
  { tr: "Nerede oturuyorsunuz", de: "Wo wohnen Sie / wohnt ihr?" },
  { tr: "Akşam yemeği için ne pişirelim", de: "Was sollen wir zum Abendessen kochen?" },
  { tr: "Seninle konuşmak istiyorum", de: "Ich möchte mit dir reden" },
  { tr: "Çocuklar bahçede oynuyorlar", de: "Die Kinder spielen im Garten" },
  { tr: "Bu çok pahalı değil mi", de: "Das ist ziemlich teuer, oder?" },
  { tr: "Saat kaçta buluşuyoruz", de: "Um wie viel Uhr treffen wir uns?" },
  { tr: "Annem harika yemek yapar", de: "Meine Mutter kocht großartig" },
  { tr: "Biraz daha yavaş konuşur musun", de: "Sprichst du bitte etwas langsamer?" },
  { tr: "Türkiye'ye ne zaman gideceksin", de: "Wann fährst du in die Türkei?" },
  { tr: "Bu benim en sevdiğim şarkı", de: "Das ist mein Lieblingslied" },
  { tr: "Kapıyı açar mısın lütfen", de: "Machst du bitte die Tür auf?" },
  { tr: "Seni çok özledim", de: "Ich habe dich sehr vermisst" },
  { tr: "Hiçbir şey anlamadım", de: "Ich habe gar nichts verstanden" },
  { tr: "Yemek çok lezzetli olmuş", de: "Das Essen ist sehr lecker geworden" },
  { tr: "Ben de seninle geliyorum", de: "Ich komme auch mit dir mit" },
  { tr: "Bunu nereden aldın", de: "Wo hast du das her (gekauft)?" },
  { tr: "Yarın hava nasıl olacak", de: "Wie wird das Wetter morgen?" },
  { tr: "Bir dakika bekler misin", de: "Wartest du eine Minute?" },
  { tr: "Bu konuda emin değilim", de: "Da bin ich mir nicht sicher" },
  { tr: "Telefonum evde kaldı", de: "Mein Handy ist zu Hause geblieben" },
  { tr: "Onun ne dediğini anlamıyorum", de: "Ich verstehe nicht, was er/sie sagt" },
  { tr: "Kendine iyi bak", de: "Pass auf dich auf" },
  { tr: "Sana bir şey soracağım", de: "Ich werde dich etwas fragen" },
  { tr: "Bu fikir hiç fena değil", de: "Diese Idee ist gar nicht schlecht" },
  { tr: "Trafikte bir saat bekledik", de: "Wir haben eine Stunde im Verkehr gewartet" },
  { tr: "Misafirler birazdan gelirler", de: "Die Gäste kommen gleich" },
  { tr: "Param yanımda değil", de: "Ich habe mein Geld nicht dabei" },
];
