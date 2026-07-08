import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface PracticeMode {
  key: string;
  title: string;
  description: string;
  icon: IoniconName;
  route: Href;
  available: boolean; // false = sắp ra mắt (giai đoạn sau)
}

// 3 chế độ MVP + 2 chế độ giai đoạn sau.
export const PRACTICE_MODES: PracticeMode[] = [
  {
    key: 'dictation',
    title: 'Nghe & Viết',
    description: 'Nghe câu rồi viết lại hoặc điền chỗ trống',
    icon: 'create',
    route: '/(app)/practice/dictation',
    available: true,
  },
  {
    key: 'shadowing',
    title: 'Nghe & Nói',
    description: 'Nghe mẫu rồi nói lại, chấm điểm phát âm',
    icon: 'mic',
    route: '/(app)/practice/shadowing',
    available: true,
  },
  {
    key: 'grammar',
    title: 'Từ vựng & Ngữ pháp',
    description: 'Luyện từ vựng, chia thì, cấu trúc câu',
    icon: 'book',
    route: '/(app)/practice/grammar',
    available: true,
  },
  {
    key: 'chat',
    title: 'Trò chuyện với AI',
    description: 'Nói chuyện với Sol, được sửa cách dùng từ',
    icon: 'chatbubbles',
    route: '/(app)/practice/chat',
    available: true,
  },
  {
    key: 'partner',
    title: 'Ghép bạn luyện nói',
    description: 'Ghép ngẫu nhiên với người học khác để chat',
    icon: 'people',
    route: '/(app)/practice/partner',
    available: true,
  },
];
