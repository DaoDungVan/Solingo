import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { chatApi, type ChatTurn } from '@/api/chat';
import { useTheme } from '@/hooks/use-theme';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { speak } from '@/lib/speak';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  correction?: string | null;
}

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! I'm Sol 👋 Let's practice English together. What did you do today?",
};

export default function ChatScreen() {
  const c = useTheme();
  const { supported, listening, transcript, start, stop, reset } = useSpeechRecognition('en-US');
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Đọc lời chào khi mở màn.
  useEffect(() => {
    speak(GREETING.content);
  }, []);

  // Kết quả nhận giọng nói → điền vào ô nhập.
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    stop();
    reset();
    setInput('');
    setError(null);

    const history: ChatTurn[] = messages.map((m) => ({ role: m.role, content: m.content }));
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setSending(true);
    try {
      const { data } = await chatApi.send(history, text);
      setMessages((prev) => {
        // gắn correction vào tin nhắn user vừa gửi
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'user') {
            updated[i] = { ...updated[i], correction: data.correction };
            break;
          }
        }
        return [...updated, { role: 'assistant', content: data.reply }];
      });
      speak(data.reply);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Không gửi được. Kiểm tra ANTHROPIC_API_KEY / kết nối.');
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m, i) => (
          <View key={i} style={{ gap: 4 }}>
            <View
              style={[
                styles.bubble,
                m.role === 'user'
                  ? { backgroundColor: c.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 }
                  : { backgroundColor: c.backgroundElement, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
              ]}>
              <Text style={{ color: m.role === 'user' ? c.onPrimary : c.text, fontSize: 16 }}>
                {m.content}
              </Text>
              {m.role === 'assistant' ? (
                <Pressable onPress={() => speak(m.content)} hitSlop={8} style={styles.speak}>
                  <Ionicons name="volume-medium" size={16} color={c.textSecondary} />
                </Pressable>
              ) : null}
            </View>
            {m.correction ? (
              <View style={[styles.correction, { backgroundColor: c.danger + '18', alignSelf: 'flex-end' }]}>
                <Text style={{ color: c.danger, fontSize: 13 }}>✏️ {m.correction}</Text>
              </View>
            ) : null}
          </View>
        ))}
        {sending ? (
          <Text style={{ color: c.textSecondary, alignSelf: 'flex-start', marginLeft: 8 }}>
            Sol đang trả lời…
          </Text>
        ) : null}
        {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
      </ScrollView>

      {/* Thanh nhập */}
      <View style={[styles.inputBar, { borderTopColor: c.border, backgroundColor: c.background }]}>
        {supported ? (
          <Pressable
            onPress={() => (listening ? stop() : start())}
            style={[styles.micBtn, { backgroundColor: listening ? c.danger : c.backgroundElement }]}>
            <Ionicons name={listening ? 'stop' : 'mic'} size={22} color={listening ? c.onPrimary : c.primary} />
          </Pressable>
        ) : null}
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={listening ? 'Đang nghe…' : 'Nhập hoặc nói tiếng Anh…'}
          placeholderTextColor={c.textSecondary}
          style={[styles.input, { color: c.text, backgroundColor: c.backgroundElement }]}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          onPress={send}
          disabled={!input.trim() || sending}
          style={[styles.sendBtn, { backgroundColor: c.primary, opacity: !input.trim() || sending ? 0.5 : 1 }]}>
          <Ionicons name="send" size={20} color={c.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messages: { padding: 16, gap: 12 },
  bubble: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, paddingRight: 30 },
  speak: { position: 'absolute', bottom: 6, right: 8 },
  correction: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, maxWidth: '82%' },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1 },
  micBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, height: 42, borderRadius: 21, paddingHorizontal: 16, fontSize: 16 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
