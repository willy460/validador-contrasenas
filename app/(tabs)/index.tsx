import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrengthResult {
  score: number;       // 0–4
  label: string;
  color: string;
  crackTime: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function analyzePassword(password: string): StrengthResult {
  if (!password) {
    return { score: 0, label: 'Sin contraseña', color: '#3a3a3a', crackTime: '—' };
  }

  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;

  const combinations = Math.pow(charset, password.length);
  // Assume 10 billion guesses/second (modern GPU cluster)
  const seconds = combinations / 1e10;

  let crackTime: string;
  if (seconds < 1) crackTime = 'Instantáneo';
  else if (seconds < 60) crackTime = `${Math.round(seconds)} segundos`;
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutos`;
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} horas`;
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} días`;
  else if (seconds < 3.154e9) crackTime = `${Math.round(seconds / 31536000)} años`;
  else if (seconds < 3.154e12) crackTime = `${Math.round(seconds / 3.154e9)} mil años`;
  else crackTime = 'Siglos';

  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const score =
    (len >= 8 ? 1 : 0) +
    (len >= 12 ? 1 : 0) +
    ((hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0) >= 3
      ? 1
      : 0) +
    (len >= 16 && hasSymbol ? 1 : 0);

  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
  const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be'];

  return {
    score,
    label: labels[score],
    color: colors[score],
    crackTime,
  };
}

// ─── Requirement Row ──────────────────────────────────────────────────────────

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={styles.reqRow}>
      <View style={[styles.reqDot, { backgroundColor: met ? '#34c759' : '#3a3a3a' }]} />
      <Text style={[styles.reqText, { color: met ? '#e0e0e0' : '#666' }]}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const strength = analyzePassword(password);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const bars = [0, 1, 2, 3, 4];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.badge}>SEGURIDAD</Text>
        <Text style={styles.title}>Validador de{'\n'}Contraseñas</Text>
        <Text style={styles.subtitle}>Comprueba qué tan segura es tu clave</Text>
      </View>

      {/* ── Input Card ── */}
      <View style={styles.card}>
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu contraseña"
            placeholderTextColor="#555"
            secureTextEntry={!visible}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setVisible(v => !v)}>
            <Text style={styles.eyeIcon}>{visible ? '🟩' : '🔲'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Strength Bar ── */}
        <View style={styles.barContainer}>
          {bars.map(i => (
            <View
              key={i}
              style={[
                styles.barSegment,
                {
                  backgroundColor:
                    i <= strength.score && password.length > 0
                      ? strength.color
                      : '#2a2a2a',
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.strengthRow}>
          <Text style={[styles.strengthLabel, { color: password ? strength.color : '#555' }]}>
            {password ? strength.label : 'Ingresa una contraseña'}
          </Text>
          {password.length > 0 && (
            <Text style={styles.strengthScore}>
              {strength.score}/4
            </Text>
          )}
        </View>
      </View>

      {/* ── Crack Time Card ── */}
      {password.length > 0 && (
        <View style={[styles.card, styles.crackCard]}>
          <Text style={styles.crackTitle}>⏱ Tiempo estimado para hackear</Text>
          <Text style={[styles.crackTime, { color: strength.color }]}>
            {strength.crackTime}
          </Text>
          <Text style={styles.crackNote}>Basado en 10 mil millones de intentos/segundo</Text>
        </View>
      )}

      {/* ── Requirements ── */}
      <View style={styles.card}>
        <Text style={styles.label}>Requisitos</Text>
        <Req met={password.length >= 8} label="Mínimo 8 caracteres" />
        <Req met={password.length >= 12} label="Recomendado: 12 o más caracteres" />
        <Req met={/[A-Z]/.test(password)} label="Al menos una letra mayúscula" />
        <Req met={/[a-z]/.test(password)} label="Al menos una letra minúscula" />
        <Req met={/[0-9]/.test(password)} label="Al menos un número" />
        <Req met={/[^a-zA-Z0-9]/.test(password)} label="Al menos un símbolo (!@#$...)" />
      </View>

      {/* ── Actions ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.copyBtn, !password && styles.disabledBtn]}
          onPress={handleCopy}
          disabled={!password}>
          <Text style={styles.actionBtnText}>{copied ? '☑ Copiado' : 'Copiar contraseña'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Las contraseñas nunca se envían a ningún servidor.
      </Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0d0d0d',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 28,
  },
  badge: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#00c7be',
    fontWeight: '700',
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f0f0f0',
    lineHeight: 42,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  // Card
  card: {
    backgroundColor: '#161616',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#242424',
  },
  label: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#555',
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#f0f0f0',
    fontSize: 15,
    fontFamily: 'monospace',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 18,
  },

  // Strength bar
  barContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  barSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  strengthScore: {
    fontSize: 12,
    color: '#555',
  },

  // Crack time
  crackCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  crackTitle: {
    fontSize: 12,
    color: '#555',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  crackTime: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  crackNote: {
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
  },

  // Requirements
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  reqDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reqText: {
    fontSize: 13,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtn: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#333',
  },
});