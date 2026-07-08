// Seed nội dung demo cho TN1 (nghe-viết). Chạy lại được: xoá lesson topic='seed-demo' rồi tạo mới.
// Chạy: npm run seed
import { pool } from '../src/config/db';

interface SeedItem {
  kind: 'dictation' | 'fill_blank' | 'mcq' | 'reorder' | 'shadowing' | 'write';
  text: string;
  display?: string;
  answers: string[];
  options?: string[]; // mcq: các lựa chọn; reorder: các từ đã xáo trộn
  hint?: string;
}

interface SeedLesson {
  type: string;
  title: string;
  level: string;
  order_index: number;
  items: SeedItem[];
}

const LESSONS: SeedLesson[] = [
  {
    type: 'dictation',
    title: 'Chào hỏi hằng ngày',
    level: 'A1',
    order_index: 1,
    items: [
      { kind: 'dictation', text: 'Good morning, how are you today?', answers: ['Good morning, how are you today?'] },
      { kind: 'dictation', text: 'My name is Anna and I am from Vietnam.', answers: ['My name is Anna and I am from Vietnam.'] },
      { kind: 'dictation', text: 'She goes to school by bus every day.', answers: ['She goes to school by bus every day.'] },
      { kind: 'dictation', text: 'We are having lunch at noon.', answers: ['We are having lunch at noon.'] },
      { kind: 'dictation', text: 'They like playing football on Sunday.', answers: ['They like playing football on Sunday.'] },
    ],
  },
  {
    type: 'dictation',
    title: 'Điền từ còn thiếu',
    level: 'A1',
    order_index: 2,
    items: [
      { kind: 'fill_blank', text: 'She goes to school by bus.', display: 'She ___ to school by bus.', answers: ['goes'], hint: 'động từ, chia ngôi thứ ba' },
      { kind: 'fill_blank', text: 'I am reading a good book.', display: 'I am ___ a good book.', answers: ['reading'] },
      { kind: 'fill_blank', text: 'There are two cats on the sofa.', display: 'There ___ two cats on the sofa.', answers: ['are'] },
      { kind: 'fill_blank', text: 'He does not like coffee.', display: 'He does not ___ coffee.', answers: ['like'] },
    ],
  },
  {
    type: 'dictation',
    title: 'Cuộc sống hằng ngày',
    level: 'A2',
    order_index: 1,
    items: [
      { kind: 'dictation', text: 'I usually wake up at seven in the morning.', answers: ['I usually wake up at seven in the morning.'] },
      { kind: 'dictation', text: 'Could you tell me how to get to the station?', answers: ['Could you tell me how to get to the station?'] },
      { kind: 'dictation', text: 'We went shopping and bought some new clothes.', answers: ['We went shopping and bought some new clothes.'] },
      { kind: 'fill_blank', text: 'She has lived here since 2019.', display: 'She has ___ here since 2019.', answers: ['lived'], hint: 'thì hiện tại hoàn thành' },
      { kind: 'fill_blank', text: 'They were watching a movie last night.', display: 'They ___ watching a movie last night.', answers: ['were'] },
    ],
  },
  {
    type: 'dictation',
    title: 'Công việc & Kế hoạch',
    level: 'B1',
    order_index: 1,
    items: [
      { kind: 'dictation', text: 'If I had more time, I would learn to play the guitar.', answers: ['If I had more time, I would learn to play the guitar.'] },
      { kind: 'dictation', text: 'The meeting has been postponed until next Friday.', answers: ['The meeting has been postponed until next Friday.'] },
      { kind: 'dictation', text: 'I am looking forward to hearing from you soon.', answers: ['I am looking forward to hearing from you soon.'] },
      { kind: 'fill_blank', text: 'The report must be finished by tomorrow.', display: 'The report must be ___ by tomorrow.', answers: ['finished'], hint: 'câu bị động' },
      { kind: 'fill_blank', text: 'She asked me whether I had seen the email.', display: 'She asked me ___ I had seen the email.', answers: ['whether'] },
    ],
  },
  {
    type: 'dictation',
    title: 'Chủ đề nâng cao',
    level: 'B2',
    order_index: 1,
    items: [
      { kind: 'dictation', text: 'Despite the challenges, the team managed to meet the deadline.', answers: ['Despite the challenges, the team managed to meet the deadline.'] },
      { kind: 'dictation', text: 'Had I known about the traffic, I would have left earlier.', answers: ['Had I known about the traffic, I would have left earlier.'] },
      { kind: 'dictation', text: 'The proposal raises several concerns that need to be addressed.', answers: ['The proposal raises several concerns that need to be addressed.'] },
      { kind: 'fill_blank', text: 'The new policy is likely to have a significant impact.', display: 'The new policy is likely to have a ___ impact.', answers: ['significant'], hint: 'tính từ = đáng kể' },
      { kind: 'fill_blank', text: 'He is used to working under pressure.', display: 'He is used to ___ under pressure.', answers: ['working'] },
    ],
  },

  // ── Ngữ pháp (mcq + reorder) ──────────────────────────
  {
    type: 'grammar',
    title: 'Chia thì cơ bản',
    level: 'A1',
    order_index: 1,
    items: [
      { kind: 'mcq', text: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], answers: ['goes'], hint: 'thì hiện tại đơn, ngôi thứ ba' },
      { kind: 'mcq', text: 'They ___ playing in the park now.', options: ['is', 'am', 'are', 'be'], answers: ['are'] },
      { kind: 'mcq', text: 'I ___ a doctor.', options: ['am', 'is', 'are', 'be'], answers: ['am'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['school', 'to', 'I', 'go', 'by', 'bus'], answers: ['I go to school by bus'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['cat', 'a', 'have', 'I'], answers: ['I have a cat'] },
      { kind: 'write', text: 'Viết một câu tiếng Anh tự giới thiệu tên của bạn.', answers: ['My name is Nam.'], hint: 'dùng "My name is..."' },
    ],
  },
  {
    type: 'grammar',
    title: 'Thì quá khứ & hiện tại hoàn thành',
    level: 'A2',
    order_index: 1,
    items: [
      { kind: 'mcq', text: 'Yesterday I ___ to the market.', options: ['go', 'went', 'gone', 'going'], answers: ['went'], hint: 'quá khứ đơn' },
      { kind: 'mcq', text: 'She has ___ here since 2019.', options: ['live', 'lived', 'living', 'lives'], answers: ['lived'] },
      { kind: 'mcq', text: 'We ___ watching a movie when he called.', options: ['was', 'were', 'are', 'is'], answers: ['were'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['finished', 'have', 'I', 'homework', 'my'], answers: ['I have finished my homework'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['last', 'we', 'met', 'week', 'them'], answers: ['We met them last week'] },
    ],
  },
  {
    type: 'grammar',
    title: 'Câu điều kiện & bị động',
    level: 'B1',
    order_index: 1,
    items: [
      { kind: 'mcq', text: 'If it rains, we ___ stay home.', options: ['will', 'would', 'are', 'did'], answers: ['will'], hint: 'điều kiện loại 1' },
      { kind: 'mcq', text: 'The report ___ finished by tomorrow.', options: ['must be', 'must', 'is', 'be'], answers: ['must be'], hint: 'bị động' },
      { kind: 'mcq', text: 'She asked me ___ I had seen the email.', options: ['whether', 'what', 'which', 'who'], answers: ['whether'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['would', 'I', 'more', 'travel', 'time', 'if', 'had', 'I'], answers: ['If I had more time I would travel'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['was', 'the', 'letter', 'yesterday', 'sent'], answers: ['The letter was sent yesterday'] },
      { kind: 'write', text: 'Viết lại câu ở thể bị động: "People speak English all over the world."', answers: ['English is spoken all over the world.'], hint: 'be + V3' },
      { kind: 'write', text: 'Đặt một câu tiếng Anh dùng từ "although".', answers: [], hint: 'although + mệnh đề' },
    ],
  },
  {
    type: 'grammar',
    title: 'Cấu trúc nâng cao',
    level: 'B2',
    order_index: 1,
    items: [
      { kind: 'mcq', text: 'He is used to ___ under pressure.', options: ['work', 'working', 'works', 'worked'], answers: ['working'], hint: 'used to + V-ing' },
      { kind: 'mcq', text: '___ I known earlier, I would have helped.', options: ['Had', 'If', 'Have', 'Did'], answers: ['Had'], hint: 'đảo ngữ điều kiện' },
      { kind: 'mcq', text: 'The proposal, ___ was rejected, needs revision.', options: ['which', 'who', 'whose', 'where'], answers: ['which'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['challenges', 'despite', 'the', 'succeeded', 'they'], answers: ['Despite the challenges they succeeded'] },
      { kind: 'reorder', text: '', display: 'Sắp xếp thành câu đúng:', options: ['sooner', 'the', 'better', 'the'], answers: ['The sooner the better'] },
    ],
  },

  // ── Nghe & Nói (shadowing) ────────────────────────────
  {
    type: 'shadowing',
    title: 'Nói theo câu ngắn',
    level: 'A1',
    order_index: 1,
    items: [
      { kind: 'shadowing', text: 'Hello, how are you?', answers: ['Hello, how are you?'] },
      { kind: 'shadowing', text: 'My name is John.', answers: ['My name is John.'] },
      { kind: 'shadowing', text: 'I like coffee.', answers: ['I like coffee.'] },
      { kind: 'shadowing', text: 'The weather is nice today.', answers: ['The weather is nice today.'] },
    ],
  },
  {
    type: 'shadowing',
    title: 'Câu giao tiếp',
    level: 'A2',
    order_index: 1,
    items: [
      { kind: 'shadowing', text: 'Could you help me, please?', answers: ['Could you help me, please?'] },
      { kind: 'shadowing', text: 'I would like a cup of tea.', answers: ['I would like a cup of tea.'] },
      { kind: 'shadowing', text: 'What time does the train leave?', answers: ['What time does the train leave?'] },
      { kind: 'shadowing', text: 'It was a wonderful trip.', answers: ['It was a wonderful trip.'] },
    ],
  },
  {
    type: 'shadowing',
    title: 'Câu dài hơn',
    level: 'B1',
    order_index: 1,
    items: [
      { kind: 'shadowing', text: 'I am looking forward to the weekend.', answers: ['I am looking forward to the weekend.'] },
      { kind: 'shadowing', text: 'She has been working here for five years.', answers: ['She has been working here for five years.'] },
      { kind: 'shadowing', text: 'We should consider all the options carefully.', answers: ['We should consider all the options carefully.'] },
    ],
  },
  {
    type: 'shadowing',
    title: 'Câu phức',
    level: 'B2',
    order_index: 1,
    items: [
      { kind: 'shadowing', text: 'Despite the difficulties, we achieved our goal.', answers: ['Despite the difficulties, we achieved our goal.'] },
      { kind: 'shadowing', text: 'The presentation was both informative and engaging.', answers: ['The presentation was both informative and engaging.'] },
      { kind: 'shadowing', text: 'I would appreciate it if you could reply soon.', answers: ['I would appreciate it if you could reply soon.'] },
    ],
  },
];

interface VocabWord {
  word: string;
  meaning: string;
  ipa?: string;
  example?: string;
}
interface VocabSet {
  level: string;
  words: VocabWord[];
}

const VOCAB: VocabSet[] = [
  {
    level: 'A1',
    words: [
      { word: 'apple', meaning: 'quả táo', ipa: '/ˈæp.əl/', example: 'I eat an apple every morning.' },
      { word: 'house', meaning: 'ngôi nhà', ipa: '/haʊs/', example: 'They live in a big house.' },
      { word: 'water', meaning: 'nước', ipa: '/ˈwɔː.tər/', example: 'Can I have some water?' },
      { word: 'friend', meaning: 'bạn bè', ipa: '/frend/', example: 'She is my best friend.' },
      { word: 'happy', meaning: 'vui, hạnh phúc', ipa: '/ˈhæp.i/', example: 'I am happy to see you.' },
      { word: 'school', meaning: 'trường học', ipa: '/skuːl/', example: 'The children go to school.' },
    ],
  },
  {
    level: 'A2',
    words: [
      { word: 'travel', meaning: 'du lịch, đi lại', ipa: '/ˈtræv.əl/', example: 'I love to travel in summer.' },
      { word: 'weather', meaning: 'thời tiết', ipa: '/ˈweð.ər/', example: 'The weather is nice today.' },
      { word: 'because', meaning: 'bởi vì', ipa: '/bɪˈkɒz/', example: 'I stayed home because it rained.' },
      { word: 'expensive', meaning: 'đắt đỏ', ipa: '/ɪkˈspen.sɪv/', example: 'This phone is too expensive.' },
      { word: 'remember', meaning: 'nhớ', ipa: '/rɪˈmem.bər/', example: 'Please remember to call me.' },
      { word: 'often', meaning: 'thường xuyên', ipa: '/ˈɒf.ən/', example: 'We often eat out on Fridays.' },
    ],
  },
  {
    level: 'B1',
    words: [
      { word: 'achieve', meaning: 'đạt được', ipa: '/əˈtʃiːv/', example: 'She worked hard to achieve her goals.' },
      { word: 'available', meaning: 'có sẵn, rảnh', ipa: '/əˈveɪ.lə.bəl/', example: 'Are you available tomorrow?' },
      { word: 'consider', meaning: 'cân nhắc', ipa: '/kənˈsɪd.ər/', example: 'We should consider all options.' },
      { word: 'improve', meaning: 'cải thiện', ipa: '/ɪmˈpruːv/', example: 'I want to improve my English.' },
      { word: 'opportunity', meaning: 'cơ hội', ipa: '/ˌɒp.əˈtʃuː.nə.ti/', example: 'This is a great opportunity.' },
      { word: 'suggest', meaning: 'đề nghị, gợi ý', ipa: '/səˈdʒest/', example: 'I suggest we take a break.' },
    ],
  },
  {
    level: 'B2',
    words: [
      { word: 'significant', meaning: 'đáng kể, quan trọng', ipa: '/sɪɡˈnɪf.ɪ.kənt/', example: 'There was a significant improvement.' },
      { word: 'nevertheless', meaning: 'tuy nhiên', ipa: '/ˌnev.ə.ðəˈles/', example: 'It was hard; nevertheless, we finished.' },
      { word: 'acknowledge', meaning: 'thừa nhận', ipa: '/əkˈnɒl.ɪdʒ/', example: 'He acknowledged his mistake.' },
      { word: 'inevitable', meaning: 'không thể tránh khỏi', ipa: '/ɪˈnev.ɪ.tə.bəl/', example: 'Change is inevitable.' },
      { word: 'thorough', meaning: 'kỹ lưỡng', ipa: '/ˈθʌr.ə/', example: 'She did a thorough review.' },
      { word: 'compromise', meaning: 'thỏa hiệp', ipa: '/ˈkɒm.prə.maɪz/', example: 'Both sides had to compromise.' },
    ],
  },
];

async function seed() {
  await pool.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS seed_tag TEXT`);
  await pool.query(`DELETE FROM lessons WHERE seed_tag = 'seed-demo'`);

  for (const l of LESSONS) {
    const lessonRes = await pool.query(
      `INSERT INTO lessons (type, title, level, order_index, seed_tag)
       VALUES ($1,$2,$3,$4,'seed-demo') RETURNING id`,
      [l.type, l.title, l.level, l.order_index]
    );
    const lessonId = lessonRes.rows[0].id;

    let idx = 0;
    for (const it of l.items) {
      await pool.query(
        `INSERT INTO items (lesson_id, kind, text, display, answers, options, hint, order_index)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          lessonId,
          it.kind,
          it.text,
          it.display ?? null,
          JSON.stringify(it.answers),
          it.options ? JSON.stringify(it.options) : null,
          it.hint ?? null,
          idx++,
        ]
      );
    }
    console.log(`[seed] ${l.title} — ${l.items.length} câu`);
  }

  // ── Từ vựng ────────────────────────────────────────────
  await pool.query(`DELETE FROM vocab WHERE seed_tag = 'seed-demo'`);
  for (const v of VOCAB) {
    let idx = 0;
    for (const w of v.words) {
      await pool.query(
        `INSERT INTO vocab (word, meaning, ipa, example, level, order_index, seed_tag)
         VALUES ($1,$2,$3,$4,$5,$6,'seed-demo')`,
        [w.word, w.meaning, w.ipa ?? null, w.example ?? null, v.level, idx++]
      );
    }
    console.log(`[seed] từ vựng ${v.level} — ${v.words.length} từ`);
  }

  console.log('[seed] xong.');
  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] LỖI:', err);
  process.exit(1);
});
