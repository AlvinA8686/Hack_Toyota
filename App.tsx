import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { getProfile, getQuestions, rankOptions, type Answers, type Profile, type RankedOption } from './src/domain';
import { HomeScreen } from './src/screens/HomeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { ThinkingScreen } from './src/screens/ThinkingScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { CompareScreen } from './src/screens/CompareScreen';
import { GarageScreen } from './src/screens/GarageScreen';
import { ProfilePicker } from './src/screens/ProfilePicker';
import { SavedScreen } from './src/screens/SavedScreen';
import { PlanSheet } from './src/screens/PlanSheet';
import { loadMoves, persistMoves, planId, type SavedMove } from './src/storage';
import { Button, Icon, type IconName } from './src/ui/components';
import { Genie } from './src/ui/Genie';
import { colors } from './src/ui/theme';

type Screen = 'home' | 'quiz' | 'thinking' | 'result' | 'compare' | 'garage' | 'saved';
const tabs: { screen: Screen; label: string; icon: IconName; activeIcon: IconName }[] = [{ screen: 'home', label: 'Discover', icon: 'sparkles-outline', activeIcon: 'sparkles' }, { screen: 'saved', label: 'My moves', icon: 'bookmark-outline', activeIcon: 'bookmark' }, { screen: 'garage', label: 'My Toyota', icon: 'car-outline', activeIcon: 'car' }];

export default function App() { return <SafeAreaProvider><StatusBar style="dark" /><NextMove /></SafeAreaProvider>; }

function NextMove() {
  const { width, height } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 900;
  const framed = Platform.OS === 'web' && width >= 600;
  const [profile, setProfile] = useState(() => getProfile('C017'));
  const [screen, setScreen] = useState<Screen>('home');
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [picker, setPicker] = useState(false);
  const [help, setHelp] = useState(false);
  const [action, setAction] = useState<RankedOption | null>(null);
  const [moves, setMoves] = useState<SavedMove[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState('');
  const questions = useMemo(() => getQuestions(profile, answers), [profile, answers]);
  const decision = useMemo(() => rankOptions(profile, answers), [profile, answers]);
  const question = questions[Math.min(index, questions.length - 1)];
  const activePlan = moves.find(m => m.id === planId(profile.customer.customer_id, action?.id ?? decision.recommended.id));
  const hasSaved = moves.some(m => m.id === planId(profile.customer.customer_id, decision.recommended.id) && JSON.stringify(m.answers) === JSON.stringify(answers));
  const quietMode = ['quiz', 'thinking'].includes(screen);

  useEffect(() => { loadMoves().then(setMoves).catch(() => setToast('Saved plans could not be loaded on this device.')).finally(() => setLoaded(true)); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  const back = useCallback(() => { if (action) setAction(null); else if (picker) setPicker(false); else if (help) setHelp(false); else if (screen === 'quiz' && index > 0) setIndex(i => i - 1); else if (screen === 'compare') setScreen('result'); else setScreen('home'); }, [action, picker, help, screen, index]);
  useEffect(() => { const listener = BackHandler.addEventListener('hardwareBackPress', () => { if (screen === 'home' && !action && !picker && !help) return false; back(); return true; }); return () => listener.remove(); }, [back, screen, action, picker, help]);

  function start(reset = true) { if (reset) setAnswers({}); setIndex(0); setScreen('quiz'); }
  function selectAnswer(value: string) {
    const idsToKeep = new Set(questions.slice(0, index + 1).map(q => q.id));
    const next = Object.fromEntries(Object.entries(answers).filter(([id]) => idsToKeep.has(id)));
    setAnswers({ ...next, [question.id]: value });
    if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => {});
  }
  function continueQuiz() { if (!answers[question.id]) return; if (index < questions.length - 1) setIndex(i => i + 1); else setScreen('thinking'); }
  const finish = useCallback(() => { setScreen('result'); if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }, []);
  function selectProfile(next: Profile) { setProfile(next); setAnswers({}); setIndex(0); setPicker(false); setScreen('home'); setAction(null); }
  async function save(option = decision.recommended, completedSteps = activePlan?.completedSteps ?? []) {
    if (!loaded) { setToast('Saved plans are still loading. Please try again.'); throw new Error('Storage is still loading'); }
    const item: SavedMove = { id: planId(profile.customer.customer_id, option.id), profileId: profile.customer.customer_id, answers: { ...answers }, optionId: option.id, savedAt: new Date().toISOString(), completedSteps };
    const next = [item, ...moves.filter(m => m.id !== item.id)];
    try { await persistMoves(next); setMoves(next); setToast('Your next move is saved on this device.'); }
    catch { setToast('Could not save. Device storage may be unavailable.'); throw new Error('Local storage unavailable'); }
  }
  async function remove(id: string) { const next = moves.filter(m => m.id !== id); try { await persistMoves(next); setMoves(next); setToast('Plan removed from My moves.'); } catch { setToast('Could not remove this saved plan.'); } }
  function openMove(move: SavedMove) { const next = getProfile(move.profileId); setProfile(next); setAnswers(move.answers); setScreen('result'); setAction(rankOptions(next, move.answers).allOptions.find(o => o.id === move.optionId) ?? null); }

  return <View style={[s.shell, framed && s.desktopShell]}>
    {desktop && <View style={s.desktopIntro}><View style={s.desktopBrand}><View style={s.brandMark}><Icon name="sparkles" color="white" size={25} /></View><View><Text style={s.desktopBrandToyota}>TOYOTA</Text><Text style={s.desktopBrandName}>Next Move</Text></View></View><Text style={s.desktopEyebrow}>LESS GUESSWORK. MORE POSSIBILITY.</Text><Text style={s.desktopTitle}>Your life changes.{ '\n' }Your next move{ '\n' }should fit.</Text><Text style={s.desktopDescription}>Meet the little genie behind your next big decision. A few thoughtful questions turn your Toyota account into a plan made around you.</Text><View style={s.desktopRule} /><View style={s.desktopFeatures}>{[['person-outline', 'Your priorities, at the center.'], ['git-compare-outline', 'Real trade-offs, clearly explained.'], ['heart-outline', 'A little guidance. No pressure.']].map(([icon, text]) => <View key={text} style={s.desktopFeature}><Icon name={icon as IconName} size={19} color={colors.green} /><Text style={s.desktopFeatureText}>{text}</Text></View>)}</View><Text style={s.desktopFoot}>BUILT FOR HACK UTD 2026  ·  SYNTHETIC DATA DEMO</Text></View>}
    <View style={[s.app, framed && { width: 440, minWidth: 440, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', height: Math.min(height - 40, 940), borderRadius: 32, borderWidth: 1, borderColor: '#D8DFD5', shadowColor: '#1D3324', shadowOpacity: .12, shadowRadius: 35, shadowOffset: { width: 0, height: 16 } }]}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.header}>
          {screen === 'garage' ? <><Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={() => setScreen('home')} style={s.backHomeButton}><Icon name="arrow-back" size={21} /><Text style={s.backHomeLabel}>Home</Text></Pressable><Text accessibilityRole="header" style={s.headerEyebrow}>MY TOYOTA</Text><Pressable accessibilityRole="button" accessibilityLabel={`Switch demo customer. Current customer ${profile.customer.first_name}`} onPress={() => setPicker(true)} style={s.profileButton}><Text style={s.avatar}>{profile.customer.first_name[0]}</Text><Icon name="chevron-down" size={12} color={colors.green} /></Pressable></> : ['quiz', 'thinking', 'result', 'compare'].includes(screen) ? <><Pressable accessibilityRole="button" accessibilityLabel={screen === 'quiz' && index > 0 ? 'Previous question' : 'Go back'} onPress={back} style={s.headerButton}><Icon name="arrow-back" size={21} /></Pressable><View style={s.headerCenter}><Text style={s.headerEyebrow}>TOYOTA NEXT MOVE</Text><Text style={s.headerSubtitle}>{screen === 'quiz' ? 'A conversation with your genie' : screen === 'compare' ? 'The full picture' : 'Made around you'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="How recommendations work" onPress={() => setHelp(true)} style={s.headerButton}><Icon name="information-circle-outline" size={22} color={colors.muted} /></Pressable></> : <><View style={s.brand}><View style={s.smallMark}><Icon name="sparkles" color={colors.red} size={22} /></View><View><Text style={s.brandToyota}>TOYOTA</Text><Text style={s.brandName}>Next Move<Text style={{ color: colors.red }}>.</Text></Text></View></View><Pressable accessibilityRole="button" accessibilityLabel={`Switch demo customer. Current customer ${profile.customer.first_name}`} onPress={() => setPicker(true)} style={s.profileButton}><Text style={s.avatar}>{profile.customer.first_name[0]}</Text><Icon name="chevron-down" size={12} color={colors.green} /></Pressable></>}
        </View>
        <View style={s.body}>
          {screen === 'home' && <HomeScreen profile={profile} onStart={() => start()} onGarage={() => setScreen('garage')} onHowItWorks={() => setHelp(true)} />}
          {screen === 'quiz' && <QuizScreen question={question} index={index} count={questions.length} selected={answers[question.id]} onSelect={selectAnswer} onContinue={continueQuiz} />}
          {screen === 'thinking' && <ThinkingScreen onDone={finish} supportive={decision.hardship || decision.recall} />}
          {screen === 'result' && <ResultsScreen key={profile.customer.customer_id} profile={profile} answers={answers} decision={decision} onCompare={() => setScreen('compare')} onAction={setAction} onSave={() => { void save().catch(() => {}); }} saved={hasSaved} onRestart={() => start(false)} />}
          {screen === 'compare' && <CompareScreen decision={decision} onAction={setAction} />}
          {screen === 'garage' && <GarageScreen profile={profile} onSwitch={() => setPicker(true)} onRestart={() => start()} />}
          {screen === 'saved' && (loaded ? <SavedScreen moves={moves} onOpen={openMove} onRemove={id => { void remove(id); }} onStart={() => start()} /> : <ActivityIndicator style={{ flex: 1 }} color={colors.red} />)}
        </View>
        {toast !== '' && <View accessibilityLiveRegion="polite" style={s.toast}><Icon name="information-circle-outline" color="white" size={17} /><Text style={s.toastText}>{toast}</Text></View>}
        {!quietMode && <View style={s.tabs}>{tabs.map(tab => { const active = screen === tab.screen || (tab.screen === 'home' && ['result', 'compare'].includes(screen)); return <Pressable key={tab.screen} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setScreen(tab.screen)} style={s.tab}><View style={[s.tabIcon, active && s.tabIconActive]}><Icon name={active ? tab.activeIcon : tab.icon} size={21} color={active ? colors.red : colors.muted} /></View><Text style={[s.tabLabel, active && { color: colors.ink, fontWeight: '700' }]}>{tab.label}</Text></Pressable>; })}</View>}
      </SafeAreaView>
    </View>
    <ProfilePicker visible={picker} currentId={profile.customer.customer_id} onSelect={selectProfile} onClose={() => setPicker(false)} />
    <PlanSheet option={action} profile={profile} completed={activePlan?.completedSteps ?? []} onClose={() => setAction(null)} onSave={steps => save(action ?? decision.recommended, steps)} />
    <Modal visible={help} animationType="slide" transparent onRequestClose={() => setHelp(false)}><View style={s.modalBackdrop}><SafeAreaView edges={['top', 'bottom']} style={s.helpSheet}><View style={s.helpHeader}><Text style={s.headerEyebrow}>A LITTLE METHOD BEHIND THE MAGIC</Text><Pressable style={s.headerButton} accessibilityRole="button" accessibilityLabel="Close explanation" onPress={() => setHelp(false)}><Icon name="close" size={23} /></Pressable></View><ScrollView contentContainerStyle={s.helpContent}><Genie pose={4} size={130} /><Text style={s.helpTitle}>Thoughtful guidance.{ '\n' }No crystal ball.</Text><Text style={s.helpBody}>Your genie uses a transparent decision engine. It combines your account facts with your answers to rank the options that fit your situation.</Text>{[['01', 'Your account brings the facts.', 'Payment, mileage, contract end date, and buyout or payoff estimates are already here. We don’t ask you to enter them again.'], ['02', 'Your life gives them meaning.', 'A few branching questions explore your priorities, plans, and comfort with the trade-offs.'], ['03', 'Eligibility comes first.', 'Contract timing and permissions are checked before ranking. Support and safety take priority.'], ['04', 'You stay in the driver’s seat.', 'Compare costs and assumptions, then save a checklist. The app does not submit applications or change your account.']].map(([n, title, body]) => <View key={n} style={s.helpRow}><Text style={s.helpNumber}>{n}</Text><View style={{ flex: 1, gap: 6 }}><Text style={s.helpItemTitle}>{title}</Text><Text style={s.helpBody}>{body}</Text></View></View>)}<View style={s.helpNote}><Text style={s.helpBody}>All 20 profiles and figures are synthetic, using the Nov 7, 2026 data snapshot. Recommendations are explainable fit rankings, not verified offers or predictions of approval. No external AI service receives your answers.</Text></View><Button label="Let’s find my next move" icon="arrow-forward" onPress={() => { setHelp(false); start(); }} /></ScrollView></SafeAreaView></View></Modal>
  </View>;
}

const s = StyleSheet.create({
  backHomeButton: { minHeight: 44, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }, backHomeLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  shell: { flex: 1, backgroundColor: colors.background }, desktopShell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF0E8', gap: 90, padding: 20 }, app: { flex: 1, overflow: 'hidden', backgroundColor: colors.background }, safe: { flex: 1 }, body: { flex: 1 },
  header: { minHeight: 75, paddingHorizontal: 21, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EBEDE6' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, smallMark: { backgroundColor: '#FCE9E5', width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, brandToyota: { fontSize: 8, letterSpacing: 2.1, color: colors.ink, fontWeight: '800' }, brandName: { fontSize: 21, lineHeight: 25, fontWeight: '700', letterSpacing: -.7, color: colors.ink }, profileButton: { flexDirection: 'row', alignItems: 'center', paddingLeft: 5, paddingRight: 7, gap: 6, minHeight: 44 }, avatar: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', backgroundColor: '#E6EDDF', textAlign: 'center', lineHeight: 34, fontSize: 13, color: colors.green, fontWeight: '700' }, headerButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, headerCenter: { alignItems: 'center', gap: 6 }, headerEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: colors.ink }, headerSubtitle: { fontSize: 10, color: colors.muted },
  tabs: { minHeight: 72, flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 7, paddingBottom: 8 }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }, tabIcon: { height: 30, width: 49, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, tabIconActive: { backgroundColor: '#FFF0ED' }, tabLabel: { fontSize: 9, color: colors.muted, lineHeight: 15 }, toast: { position: 'absolute', left: 15, right: 15, bottom: 82, backgroundColor: colors.ink, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, zIndex: 100 }, toastText: { color: colors.white, fontSize: 12, lineHeight: 18, flex: 1 },
  desktopIntro: { width: 380, gap: 22 }, desktopBrand: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 48 }, brandMark: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' }, desktopBrandToyota: { fontSize: 9, letterSpacing: 2.3, fontWeight: '800', color: colors.ink }, desktopBrandName: { fontSize: 25, letterSpacing: -.7, fontWeight: '700', color: colors.ink }, desktopEyebrow: { fontSize: 9, letterSpacing: 1.6, fontWeight: '700', color: colors.green }, desktopTitle: { fontSize: 48, lineHeight: 53, letterSpacing: -2, color: colors.ink, fontWeight: '600' }, desktopDescription: { fontSize: 14, lineHeight: 24, color: '#72806E', maxWidth: 330 }, desktopRule: { width: 40, height: 3, backgroundColor: colors.red, borderRadius: 2, marginVertical: 5 }, desktopFeatures: { gap: 16 }, desktopFeature: { flexDirection: 'row', gap: 12, alignItems: 'center' }, desktopFeatureText: { fontSize: 12, color: '#5B6C57' }, desktopFoot: { marginTop: 40, fontSize: 8, letterSpacing: 1.2, color: '#879181', lineHeight: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(23,37,34,.35)', alignItems: 'center', justifyContent: 'flex-end' }, helpSheet: { width: '100%', maxWidth: 480, maxHeight: '94%', backgroundColor: colors.background, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden', ...(Platform.OS === 'web' ? { height: '90%' } : {}) }, helpHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 12, paddingTop: 6 }, helpContent: { padding: 24, gap: 22, paddingBottom: 40 }, helpTitle: { fontSize: 30, lineHeight: 37, color: colors.ink, fontWeight: '700', letterSpacing: -1 }, helpBody: { fontSize: 12, lineHeight: 20, color: colors.muted }, helpRow: { flexDirection: 'row', gap: 16 }, helpNumber: { fontSize: 12, color: colors.red, fontWeight: '700', marginTop: 3 }, helpItemTitle: { fontSize: 14, lineHeight: 21, color: colors.ink, fontWeight: '600' }, helpNote: { backgroundColor: colors.greenSoft, borderRadius: 17, padding: 17 },
});
