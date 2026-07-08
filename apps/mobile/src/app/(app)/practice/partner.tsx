import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Socket } from 'socket.io-client';

import { Button } from '@/components/ui/button';
import { createSocket } from '@/lib/socket';
import { useTheme } from '@/hooks/use-theme';

type Status = 'idle' | 'searching' | 'matched' | 'partner_left';
interface Msg {
  mine: boolean;
  text: string;
}

export default function PartnerScreen() {
  const c = useTheme();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [partner, setPartner] = useState<string>('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const socket = await createSocket();
      if (!mounted) {
        socket.disconnect();
        return;
      }
      socketRef.current = socket;
      socket.on('connect_error', (e) => setError(e.message || 'Không kết nối được máy chủ'));
      socket.on('waiting', () => setStatus('searching'));
      socket.on('matched', ({ partner: name }: { partner: string }) => {
        setPartner(name);
        setMessages([]);
        setStatus('matched');
      });
      socket.on('chat:message', ({ text }: { text: string }) => {
        setMessages((m) => [...m, { mine: false, text }]);
      });
      socket.on('partner:left', () => setStatus('partner_left'));
    })();

    return () => {
      mounted = false;
      socketRef.current?.emit('leave');
      socketRef.current?.disconnect();
    };
  }, []);

  function find() {
    setError(null);
    setMessages([]);
    setStatus('searching');
    socketRef.current?.emit('find');
  }

  function send() {
    const text = input.trim();
    if (!text || status !== 'matched') return;
    socketRef.current?.emit('chat:message', { text });
    setMessages((m) => [...m, { mine: true, text }]);
    setInput('');
  }

  // ── Idle / searching / partner_left: màn trạng thái ──
  if (status !== 'matched') {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <View style={[styles.iconCircle, { backgroundColor: c.primary + '22' }]}>
          <Ionicons name="people" size={40} color={c.primary} />
        </View>
        {status === 'searching' ? (
          <>
            <ActivityIndicator color={c.primary} />
            <Text style={[styles.statusTitle, { color: c.text }]}>Đang tìm bạn luyện nói…</Text>
            <Text style={{ color: c.textSecondary, textAlign: 'center' }}>
              Chờ một người khác cùng vào ghép cặp.
            </Text>
            <Pressable onPress={() => { socketRef.current?.emit('leave'); setStatus('idle'); }}>
              <Text style={{ color: c.danger, marginTop: 8 }}>Huỷ</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.statusTitle, { color: c.text }]}>
              {status === 'partner_left' ? 'Bạn kia đã rời đi' : 'Trò chuyện với người thật'}
            </Text>
            <Text style={{ color: c.textSecondary, textAlign: 'center', marginBottom: 8 }}>
              Ghép ngẫu nhiên với một người học khác để chat luyện tiếng Anh (hoặc trò chuyện vui vẻ).
            </Text>
            <Button title="Tìm bạn luyện nói" onPress={find} />
          </>
        )}
        {error ? <Text style={{ color: c.danger, marginTop: 8 }}>{error}</Text> : null}
      </View>
    );
  }

  // ── Matched: màn chat ──
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <View style={[styles.partnerBar, { borderBottomColor: c.border }]}>
        <View style={[styles.dot, { backgroundColor: c.success }]} />
        <Text style={{ color: c.text, fontWeight: '600', flex: 1 }}>{partner || 'Bạn học'}</Text>
        <Pressable onPress={find} style={styles.skipBtn}>
          <Ionicons name="shuffle" size={16} color={c.primary} />
          <Text style={{ color: c.primary, fontWeight: '600' }}>Người khác</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 ? (
          <Text style={{ color: c.textSecondary, textAlign: 'center', marginTop: 20 }}>
            Đã ghép! Chào hỏi bằng tiếng Anh nào 👋
          </Text>
        ) : (
          messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.mine
                  ? { backgroundColor: c.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 }
                  : { backgroundColor: c.backgroundElement, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
              ]}>
              <Text style={{ color: m.mine ? c.onPrimary : c.text, fontSize: 16 }}>{m.text}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.inputBar, { borderTopColor: c.border }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Nhập tin nhắn…"
          placeholderTextColor={c.textSecondary}
          style={[styles.input, { color: c.text, backgroundColor: c.backgroundElement }]}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          onPress={send}
          disabled={!input.trim()}
          style={[styles.sendBtn, { backgroundColor: c.primary, opacity: input.trim() ? 1 : 0.5 }]}>
          <Ionicons name="send" size={20} color={c.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  iconCircle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 20, fontWeight: '800' },
  partnerBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  skipBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  messages: { padding: 16, gap: 10 },
  bubble: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1 },
  input: { flex: 1, height: 42, borderRadius: 21, paddingHorizontal: 16, fontSize: 16 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
