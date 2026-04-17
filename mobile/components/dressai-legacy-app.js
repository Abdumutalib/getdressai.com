import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  LogBox,
} from "react-native";
import * as RNIap from "react-native-iap";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

import { LanguageBar } from "@/components/language-bar";
import { useLocale } from "@/contexts/locale";

WebBrowser.maybeCompleteAuthSession();

LogBox.ignoreLogs(["props.pointerEvents is deprecated. Use style.pointerEvents"]);
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const firstArg = args?.[0];
  if (
    typeof firstArg === "string" &&
    firstArg.includes("props.pointerEvents is deprecated")
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

const productIds = ["dressai_pro"];

/** Телефонда Expo Go: компьютер LAN IP. Эмулятор: 127.0.0.1. .env: EXPO_PUBLIC_API_URL=http://192.168.x.x:3000 */
const API =
  (typeof process !== "undefined" &&
    process.env?.EXPO_PUBLIC_API_URL &&
    String(process.env.EXPO_PUBLIC_API_URL).trim()) ||
  "http://127.0.0.1:3000";
const SUPABASE_URL =
  (typeof process !== "undefined" &&
    (process.env?.EXPO_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL) &&
    String(process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).trim()) ||
  "";
const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" &&
    (process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY) &&
    String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY).trim()) ||
  "";

let supabaseSingleton = null;
function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!supabaseSingleton) {
    supabaseSingleton = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseSingleton;
}
const SESSION_STORAGE_KEY = "dressai-session-v1";
const GUEST_USAGE_STORAGE_KEY = "dressai-guest-usage-v1";
const GENDER_OPTIONS = ["male", "female"];
const STYLE_OPTIONS = ["casual", "business", "party"];
const OCCASION_OPTIONS = ["work", "weekend", "event"];

function formatLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function OptionChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.optionChip, active && styles.optionChipActive]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function getGeneratedImageUri(imagePayload) {
  if (!imagePayload) {
    return null;
  }

  if (typeof imagePayload.url === "string" && imagePayload.url.trim() !== "") {
    return imagePayload.url;
  }

  if (typeof imagePayload.b64_json === "string" && imagePayload.b64_json.trim() !== "") {
    return `data:image/png;base64,${imagePayload.b64_json}`;
  }

  return null;
}

function getAuthHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function DressAiLegacyApp() {
  const { t } = useLocale();
  const proMotivation = t("legacyProMotivation");
  const proActive = t("legacyProActive");

  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [generatedImageUri, setGeneratedImageUri] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [guestUsage, setGuestUsage] = useState(0);
  const [gender, setGender] = useState("male");
  const [style, setStyle] = useState("casual");
  const [occasion, setOccasion] = useState("work");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await RNIap.initConnection();
        const res = await RNIap.getAvailablePurchases();
        if (!cancelled) setPurchases(res || []);
      } catch {
        /* IAP store йўқ ёки симулятор */
      }
    })();
    return () => {
      cancelled = true;
      try {
        RNIap.endConnection();
      } catch {
        /* noop */
      }
    };
  }, []);

  useEffect(() => {
    if (purchases.length > 0) {
      setUser((u) => (u ? { ...u, plan: "pro" } : u));
    }
  }, [purchases]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedGuestUsage = await AsyncStorage.getItem(GUEST_USAGE_STORAGE_KEY);
        if (storedGuestUsage) {
          const parsedGuestUsage = Number.parseInt(storedGuestUsage, 10);
          if (!Number.isNaN(parsedGuestUsage)) {
            setGuestUsage(parsedGuestUsage);
          }
        }

        const sb = getSupabase();
        if (sb) {
          const {
            data: { session },
          } = await sb.auth.getSession();
          if (session?.access_token) {
            setToken(session.access_token);
            setRefreshToken(session.refresh_token || null);
            await refreshProfile(session.access_token, session.refresh_token || null);
          }
        } else {
          const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
          if (raw) {
            const parsedSession = JSON.parse(raw);
            if (parsedSession?.token) {
              setToken(parsedSession.token);
              setRefreshToken(parsedSession.refreshToken || null);
              setUser(parsedSession.user || null);
              await refreshProfile(parsedSession.token, parsedSession.refreshToken || null);
            }
          }
        }
      } catch {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsRestoringSession(false);
      }
    }

    async function loadConfig() {
      try {
        const response = await axios.get(`${API}/config`);
        setPaymentEnabled(Boolean(response.data?.paymentEnabled));
      } catch {
        setPaymentEnabled(false);
      }
    }

    restoreSession();
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshProfile session token билан чақирилади
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      return undefined;
    }
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (session?.access_token) {
        setToken(session.access_token);
        setRefreshToken(session.refresh_token || null);
        await refreshProfile(session.access_token, session.refresh_token || null);
      } else {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buyPro = async () => {
    try {
      await RNIap.requestSubscription(productIds[0]);
    } catch (err) {
      Alert.alert(t("legacyAlertPurchaseFailed"), err?.message || t("legacyAlertUnknownError"));
    }
  };

  const plan = user?.plan === "pro" ? "pro" : "free";
  const remainingLooks = plan === "pro" ? "∞" : String(user?.remainingGenerations ?? Math.max(0, 1 - guestUsage));
  const planLabel =
    plan === "pro" ? t("legacyPlanPro") : user ? t("legacyPlanMember") : t("legacyPlanGuest");
  const planCaption = user
    ? user.email
    : paymentEnabled
      ? t("legacyPlanCaptionGuestPay").replace("{{n}}", String(Math.max(0, 1 - guestUsage)))
      : t("legacyPlanCaptionGuestNoPay");
  const promptPreview = `${formatLabel(gender)} · ${formatLabel(style)} · ${formatLabel(occasion)}`;

  const referralCode = user?.id || user?.email || "GUEST";
  const referralLink = `https://getdressai.com/?ref=${encodeURIComponent(String(referralCode))}`;

  const handleShareReferral = async () => {
    try {
      await Sharing.shareAsync(undefined, {
        dialogTitle: t("legacyInviteDialogTitle"),
        mimeType: "text/plain",
        UTI: "public.plain-text",
        message: t("legacyInviteShareMessage").replace("{{link}}", referralLink),
      });
    } catch {
      /* share отмена */
    }
  };

  const persistSession = async (nextToken, nextUser, refreshToken = null) => {
    if (!nextToken || !nextUser) {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    if (getSupabase()) {
      return;
    }
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        token: nextToken,
        refreshToken,
        user: nextUser,
      })
    );
  };

  const persistGuestUsage = async (nextUsage) => {
    await AsyncStorage.setItem(GUEST_USAGE_STORAGE_KEY, String(nextUsage));
  };

  const applyUserState = async (nextToken, nextUser, refreshToken = null) => {
    setToken(nextToken);
    setRefreshToken(refreshToken);
    setUser(nextUser);
    await persistSession(nextToken, nextUser, refreshToken);
  };

  const refreshSupabaseSession = async (refreshToken) => {
    if (!isSupabaseConfigured() || !refreshToken) {
      throw new Error("Supabase session refresh is not available.");
    }

    const response = await axios.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        refresh_token: refreshToken,
      },
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      accessToken: response.data?.access_token || null,
      refreshToken: response.data?.refresh_token || refreshToken,
    };
  };

  const refreshProfile = async (activeToken = token, activeRefreshToken = refreshToken) => {
    if (!activeToken) {
      return;
    }

    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: getAuthHeaders(activeToken),
      });

      const nextUser = response.data?.user || null;
      setPaymentEnabled(Boolean(response.data?.paymentEnabled));
      setToken(activeToken);

      if (nextUser) {
        await applyUserState(activeToken, nextUser, activeRefreshToken);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (activeRefreshToken) {
          try {
            const refreshedSession = await refreshSupabaseSession(activeRefreshToken);
            if (refreshedSession.accessToken) {
              await refreshProfile(
                refreshedSession.accessToken,
                refreshedSession.refreshToken || activeRefreshToken
              );
              return;
            }
          } catch {
            /* fall through to logout */
          }
        }

        await handleLogout();
      }
    }
  };

  const handleLogout = async () => {
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setPassword("");
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const handleAuth = async (mode) => {
    if (!email.trim() || !password.trim() || (mode === "register" && !name.trim())) {
      Alert.alert(t("legacyAlertMissingDetails"), t("legacyAlertMissingDetailsBody"));
      return;
    }

    if (!isSupabaseConfigured()) {
      Alert.alert(t("legacyAlertSupabaseTitle"), t("legacyAlertSupabaseBody"));
      return;
    }

    setIsAuthLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      let nextToken = null;
      let nextRefreshToken = null;

      if (mode === "register") {
        const signUpResponse = await axios.post(
          `${SUPABASE_URL}/auth/v1/signup`,
          {
            email: normalizedEmail,
            password,
            data: {
              name: name.trim(),
            },
          },
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        nextToken = signUpResponse.data?.session?.access_token || null;
        nextRefreshToken = signUpResponse.data?.session?.refresh_token || null;

        if (!nextToken) {
          setAuthMode("login");
          setPassword("");
          Alert.alert(t("legacyAlertCheckEmailTitle"), t("legacyAlertCheckEmailBody"));
          return;
        }
      } else {
        const signInResponse = await axios.post(
          `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
          {
            email: normalizedEmail,
            password,
          },
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        nextToken = signInResponse.data?.access_token || null;
        nextRefreshToken = signInResponse.data?.refresh_token || null;
      }

      if (!nextToken) {
        throw new Error("Supabase did not return an access token.");
      }

      const profileResponse = await axios.get(`${API}/auth/me`, {
        headers: getAuthHeaders(nextToken),
      });

      const nextUser = profileResponse.data?.user || null;

      if (!nextUser) {
        throw new Error("The backend did not return a synced account profile.");
      }

      setPaymentEnabled(Boolean(profileResponse.data?.paymentEnabled));
      await applyUserState(nextToken, nextUser, nextRefreshToken);
      setPassword("");
      Alert.alert(
        mode === "register" ? t("legacyAlertAccountCreated") : t("legacyAlertWelcomeBack"),
        t("legacyAlertSignedInBody").replace("{{name}}", nextUser.name || "")
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.msg || error.response?.data?.error_description || error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "Authentication failed.";

      Alert.alert(t("legacyAlertAuthFailed"), message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(t("alertPermTitle"), t("alertPermBody"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    setSelectedImageUri(result.assets[0].uri);
    setGeneratedImageUri(null);
  };

  const generateOutfit = async () => {
    if (!selectedImageUri) {
      Alert.alert(t("legacyAlertUploadPhotoTitle"), t("legacyAlertUploadPhotoBody"));
      return;
    }

    setIsLoading(true);

    try {
      let productRecs = [];
      try {
        const analyzeRes = await axios.post(
          `${API}/analyze`,
          { gender, style, occasion, plan },
          { headers: getAuthHeaders(token) }
        );
        const prods = analyzeRes.data?.recommendations?.products;
        productRecs = Array.isArray(prods) ? prods : [];
      } catch {
        productRecs = [];
      }
      setRecommendations(productRecs);

      const response = await axios.post(`${API}/image`, {
        prompt: `${gender} person, ${style} style, for ${occasion}, modern outfit`,
        plan,
      }, {
        headers: getAuthHeaders(token),
      });

      const nextImageUri = getGeneratedImageUri(response.data?.image);
      if (!nextImageUri) {
        throw new Error("The API response did not include an image.");
      }
      setGeneratedImageUri(nextImageUri);
      if (response.data?.user) {
        await applyUserState(token, response.data.user, refreshToken);
      } else {
        const nextGuestUsage = guestUsage + 1;
        setGuestUsage(nextGuestUsage);
        await persistGuestUsage(nextGuestUsage);
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "Something went wrong.";

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await handleLogout();
      }

      Alert.alert(t("legacyAlertGenerationFailed"), message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async (sessionId) => {
    const response = await axios.get(`${API}/billing/confirm`, {
      params: { session_id: sessionId },
      headers: getAuthHeaders(token),
    });

    const nextUser = response.data?.user;

    if (nextUser) {
      await applyUserState(token, nextUser, refreshToken);
      Alert.alert(t("legacyAlertProActivatedTitle"), t("legacyAlertProActivatedBody"));
    }
  };

  const handleUpgrade = async () => {
    if (!paymentEnabled) {
      Alert.alert(t("legacyAlertPaymentsUnavailableTitle"), t("legacyAlertPaymentsUnavailableBody"));
      return;
    }

    if (!token || !user) {
      Alert.alert(t("legacyAlertSignInRequiredTitle"), t("legacyAlertSignInRequiredBody"));
      return;
    }

    if (plan === "pro") {
      Alert.alert(t("legacyAlertAlreadyProTitle"), t("legacyAlertAlreadyProBody"));
      return;
    }

    setIsPaymentLoading(true);

    try {
      const successUrl = Linking.createURL("payment-success");
      const cancelUrl = Linking.createURL("payment-cancel");
      const sessionResponse = await axios.post(
        `${API}/billing/create-checkout-session`,
        { successUrl, cancelUrl },
        { headers: getAuthHeaders(token) }
      );

      const checkoutUrl = sessionResponse.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("The backend did not return a Stripe checkout URL.");
      }

      const browserResult = await WebBrowser.openAuthSessionAsync(checkoutUrl, successUrl);

      if (browserResult.type === "success" && browserResult.url) {
        const parsed = Linking.parse(browserResult.url);
        const sessionId =
          typeof parsed.queryParams?.session_id === "string" ? parsed.queryParams.session_id : null;

        if (!sessionId) {
          throw new Error("Stripe did not return a checkout session id.");
        }

        await confirmPayment(sessionId);
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "Upgrade failed.";

      Alert.alert(t("legacyAlertUpgradeFailed"), message);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  if (isRestoringSession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.screenLoader}>
          <ActivityIndicator size="large" color="#c94f3d" />
          <Text style={styles.screenLoaderText}>{t("legacyRestoringSession")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <LanguageBar />
        <View style={styles.heroBackground}>
          <View style={styles.heroOrbLarge} />
          <View style={styles.heroOrbSmall} />
          <View style={styles.heroCard}>
            {/* PRO holatida motivational banner */}
            {plan === "pro" && (
              <View style={{ backgroundColor: '#fff3e4', borderRadius: 12, padding: 10, marginBottom: 10 }}>
                <Text style={{ color: '#c94f3d', fontWeight: 'bold', textAlign: 'center' }}>{proActive}</Text>
              </View>
            )}
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.eyebrow}>{t("legacyEyebrow")}</Text>
                <Text style={styles.title}>GetDressAI</Text>
                <Text style={styles.heroUserText}>
                  {user ? `${t("legacyHiPrefix")}${user.name}` : t("legacyGuestSession")}
                </Text>
              </View>
              <View style={[styles.planBadge, plan === "pro" && styles.planBadgePro]}>
                <Text style={[styles.planBadgeText, plan === "pro" && styles.planBadgeTextPro]}>
                  {planLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.subtitle}>{t("legacyHeroSubtitle")}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{remainingLooks}</Text>
                <Text style={styles.statLabel}>{t("legacyStatRemaining")}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatLabel(style)}</Text>
                <Text style={styles.statLabel}>{t("legacyStatCurrentStyle")}</Text>
              </View>
            </View>

            <View style={styles.promptPreviewCard}>
              <Text style={styles.promptPreviewLabel}>{t("legacyCurrentPrompt")}</Text>
              <Text style={styles.promptPreviewValue}>{promptPreview}</Text>
              <Text style={styles.promptPreviewCaption}>{planCaption}</Text>
              {/* Free режада motivational call-to-action */}
              {plan === "free" && (
                <Text style={{ color: '#c94f3d', fontWeight: 'bold', marginTop: 8, textAlign: 'center' }}>{proMotivation}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.authCard}>
          <View style={styles.authHeader}>
            <View>
              <Text style={styles.panelTitle}>{t("legacyPanelAccount")}</Text>
              <Text style={styles.authSubtitle}>
                {user ? t("legacyAuthSubtitleSynced") : t("legacyAuthSubtitleSignin")}
              </Text>
            </View>
            {user ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout} activeOpacity={0.88}>
                <Text style={styles.secondaryButtonText}>{t("legacyLogOut")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {user ? (
            <View style={styles.accountSummary}>
              <View style={styles.accountSummaryRow}>
                <Text style={styles.accountSummaryLabel}>{t("legacyAccountNameLabel")}</Text>
                <Text style={styles.accountSummaryValue}>{user.name}</Text>
              </View>
              <View style={styles.accountSummaryRow}>
                <Text style={styles.accountSummaryLabel}>{t("legacyAccountEmailLabel")}</Text>
                <Text style={styles.accountSummaryValue}>{user.email}</Text>
              </View>
              <View style={styles.accountSummaryRow}>
                <Text style={styles.accountSummaryLabel}>{t("legacyAccountPlanLabel")}</Text>
                <Text style={styles.accountSummaryValue}>{plan.toUpperCase()}</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.authModeRow}>
                <OptionChip
                  label={t("legacyLogin")}
                  active={authMode === "login"}
                  onPress={() => setAuthMode("login")}
                />
                <OptionChip
                  label={t("legacyRegister")}
                  active={authMode === "register"}
                  onPress={() => setAuthMode("register")}
                />
              </View>

              {authMode === "register" ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={t("legacyPlaceholderFullName")}
                  placeholderTextColor="#8d8378"
                />
              ) : null}
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t("legacyPlaceholderEmail")}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#8d8378"
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t("legacyPlaceholderPassword")}
                secureTextEntry
                placeholderTextColor="#8d8378"
              />

              <TouchableOpacity
                style={[styles.primaryButton, styles.authActionButton, isAuthLoading && styles.disabledButton]}
                onPress={() => handleAuth(authMode)}
                activeOpacity={0.85}
                disabled={isAuthLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isAuthLoading
                    ? t("legacyAuthPleaseWait")
                    : authMode === "login"
                      ? t("legacyAuthLogIn")
                      : t("legacyAuthCreateAccount")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t("legacyBuildYourLook")}</Text>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t("legacyGender")}</Text>
            <View style={styles.optionRow}>
              {GENDER_OPTIONS.map((option) => (
                <OptionChip
                  key={option}
                  label={formatLabel(option)}
                  active={gender === option}
                  onPress={() => setGender(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t("legacyStyle")}</Text>
            <View style={styles.optionRow}>
              {STYLE_OPTIONS.map((option) => (
                <OptionChip
                  key={option}
                  label={formatLabel(option)}
                  active={style === option}
                  onPress={() => setStyle(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterGroupLast}>
            <Text style={styles.filterLabel}>{t("legacyOccasion")}</Text>
            <View style={styles.optionRow}>
              {OCCASION_OPTIONS.map((option) => (
                <OptionChip
                  key={option}
                  label={formatLabel(option)}
                  active={occasion === option}
                  onPress={() => setOccasion(option)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>{t("legacySourcePhotoTitle")}</Text>
              <Text style={styles.cardSubtitle}>{t("legacySourcePhotoSubtitle")}</Text>
            </View>
            <TouchableOpacity style={styles.secondaryButton} onPress={pickImage} activeOpacity={0.88}>
              <Text style={styles.secondaryButtonText}>{t("legacyUpload")}</Text>
            </TouchableOpacity>
          </View>
          {selectedImageUri ? (
            <Image source={{ uri: selectedImageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderTitle}>{t("legacyNoPhotoTitle")}</Text>
              <Text style={styles.placeholderText}>{t("legacyNoPhotoHint")}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (!selectedImageUri || isLoading) && styles.disabledButton]}
          onPress={generateOutfit}
          activeOpacity={0.85}
          disabled={!selectedImageUri || isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? t("legacyGenerating") : t("legacyGenerateOutfit")}
          </Text>
        </TouchableOpacity>

        {plan === "free" && (
          <View style={styles.upgradeCard}>
            <View>
              <Text style={styles.upgradeTitle}>{t("legacyUnlockProTitle")}</Text>
              <Text style={styles.upgradeText}>
                {paymentEnabled ? t("legacyUnlockProStripe") : t("legacyUnlockProNoStripe")}
              </Text>
            </View>
            {/* Stripe орқали PRO ёки IAP орқали PRO */}
            <TouchableOpacity
              style={[styles.upgradeButton, isPaymentLoading && styles.disabledButton]}
              onPress={paymentEnabled ? handleUpgrade : buyPro}
              activeOpacity={0.88}
              disabled={isPaymentLoading}
            >
              <Text style={styles.upgradeButtonText}>
                {isPaymentLoading ? t("legacyUpgradeOpening") : t("legacyBuyPro")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c94f3d" />
            <Text style={styles.loadingText}>{t("legacyGeneratingOutfit")}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>{t("legacyAiResultTitle")}</Text>
              <Text style={styles.cardSubtitle}>{t("legacyAiResultSubtitle")}</Text>
            </View>
            <View style={styles.resultTag}>
              <Text style={styles.resultTagText}>{formatLabel(occasion)}</Text>
            </View>
          </View>
          {generatedImageUri ? (
            <>
              <Image source={{ uri: generatedImageUri }} style={styles.image} resizeMode="cover" />
              {/* Growth loop: Share preview */}
              <TouchableOpacity
                style={{ backgroundColor: '#c94f3d', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 }}
                onPress={async () => {
                  try {
                    await Sharing.shareAsync(generatedImageUri, {
                      dialogTitle: t("legacyShareDialogTitle"),
                      mimeType: 'image/png',
                      UTI: 'public.png',
                      message: t("legacyShareDialogMessage").replace("{{link}}", referralLink),
                    });
                  } catch {}
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t("legacyShareLookButton")}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderTitle}>{t("legacyResultPlaceholderTitle")}</Text>
              <Text style={styles.placeholderText}>{t("legacyResultPlaceholderHint")}</Text>
            </View>
          )}
        </View>

        {recommendations.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("legacyShopTheLook")}</Text>
            <FlatList
              scrollEnabled={false}
              data={recommendations}
              keyExtractor={(item, idx) =>
                String(item.affiliateUrl || item.url || item.name || idx)
              }
              renderItem={({ item }) => (
                <View
                  style={{
                    marginBottom: 16,
                    borderBottomWidth: 1,
                    borderColor: "#eadfce",
                    paddingBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                    {item.name || item.title || t("legacyProductFallbackName")}
                  </Text>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: "100%", height: 120, borderRadius: 10, marginVertical: 6 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <Text style={{ color: "#6c6157", marginBottom: 4 }}>{item.brand || ""}</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#c94f3d",
                      borderRadius: 8,
                      padding: 10,
                      alignItems: "center",
                    }}
                    onPress={() => Linking.openURL(item.affiliateUrl || item.url)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>{t("legacyBuy")}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("legacyInviteTitle")}</Text>
          <Text style={{ color: "#6c6157", marginBottom: 8 }}>{t("legacyInviteBody")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 15, marginRight: 8 }}>{referralCode}</Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(String(referralCode));
                Alert.alert(t("legacyCopied"));
              }}
              style={{ backgroundColor: "#f1e7d9", borderRadius: 8, padding: 6 }}
            >
              <Text style={{ color: "#c94f3d", fontWeight: "bold" }}>{t("legacyCopy")}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleShareReferral}
            style={{ backgroundColor: "#c94f3d", borderRadius: 8, padding: 10, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{t("legacyInviteShare")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default DressAiLegacyApp;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3ede2",
  },
  screenLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  screenLoaderText: {
    marginTop: 12,
    color: "#5e544a",
    fontSize: 15,
    textAlign: "center",
  },
  container: {
    padding: 20,
    paddingBottom: 44,
  },
  heroBackground: {
    position: "relative",
    marginBottom: 18,
  },
  heroOrbLarge: {
    position: "absolute",
    top: 8,
    right: 18,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#d7cab6",
  },
  heroOrbSmall: {
    position: "absolute",
    left: -12,
    bottom: 22,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#c94f3d",
    opacity: 0.22,
  },
  heroCard: {
    backgroundColor: "#1f2430",
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  eyebrow: {
    color: "#d7cab6",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fffaf1",
  },
  heroUserText: {
    marginTop: 8,
    color: "#c7cfdb",
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#d7dde8",
    maxWidth: 280,
  },
  planBadge: {
    backgroundColor: "#fff3e4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  planBadgePro: {
    backgroundColor: "#c94f3d",
  },
  planBadgeText: {
    color: "#6d2f25",
    fontSize: 12,
    fontWeight: "700",
  },
  planBadgeTextPro: {
    color: "#fff8f4",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 250, 241, 0.08)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 250, 241, 0.08)",
  },
  statValue: {
    color: "#fffaf1",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    color: "#c7cfdb",
    fontSize: 13,
  },
  promptPreviewCard: {
    marginTop: 16,
    backgroundColor: "#fffaf1",
    borderRadius: 20,
    padding: 16,
  },
  promptPreviewLabel: {
    color: "#7b7166",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  promptPreviewValue: {
    color: "#1f2430",
    fontSize: 18,
    fontWeight: "700",
  },
  promptPreviewCaption: {
    color: "#72685d",
    fontSize: 13,
    marginTop: 6,
  },
  panel: {
    backgroundColor: "#fffaf1",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2430",
    marginBottom: 18,
  },
  authCard: {
    backgroundColor: "#fffaf1",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  authHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  authSubtitle: {
    marginTop: -12,
    color: "#7a7065",
    fontSize: 13,
    maxWidth: 240,
  },
  authModeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#f8f0e5",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6d7c1",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1f2430",
    marginBottom: 12,
  },
  authActionButton: {
    marginBottom: 0,
    marginTop: 4,
  },
  accountSummary: {
    gap: 12,
  },
  accountSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8f0e5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  accountSummaryLabel: {
    color: "#7a7065",
    fontSize: 13,
    fontWeight: "700",
  },
  accountSummaryValue: {
    color: "#1f2430",
    fontSize: 14,
    fontWeight: "800",
    flexShrink: 1,
    textAlign: "right",
  },
  filterGroup: {
    marginBottom: 18,
  },
  filterGroupLast: {
    marginBottom: 0,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#51483f",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f1e7d9",
    borderWidth: 1,
    borderColor: "#e4d7c5",
  },
  optionChipActive: {
    backgroundColor: "#1f2430",
    borderColor: "#1f2430",
  },
  optionChipText: {
    color: "#4f473e",
    fontSize: 14,
    fontWeight: "700",
  },
  optionChipTextActive: {
    color: "#fffaf1",
  },
  primaryButton: {
    backgroundColor: "#c94f3d",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#9f3528",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#fff8f4",
    fontSize: 16,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#fffaf1",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
    shadowColor: "#7b6b59",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2430",
  },
  cardSubtitle: {
    color: "#7a7065",
    fontSize: 13,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: "#f1e7d9",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#4f473e",
    fontSize: 13,
    fontWeight: "800",
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 18,
    backgroundColor: "#ece4d9",
  },
  placeholder: {
    height: 240,
    borderRadius: 18,
    backgroundColor: "#f1e7d9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d7cab6",
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2430",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    color: "#6c6157",
    textAlign: "center",
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 18,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#5e544a",
  },
  upgradeCard: {
    backgroundColor: "#1f2430",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  upgradeTitle: {
    color: "#fffaf1",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  upgradeText: {
    color: "#cfd5df",
    fontSize: 13,
  },
  upgradeButton: {
    backgroundColor: "#fff3e4",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  upgradeButtonText: {
    color: "#7a3227",
    fontSize: 13,
    fontWeight: "800",
  },
  resultTag: {
    backgroundColor: "#f1e7d9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resultTagText: {
    color: "#4f473e",
    fontSize: 12,
    fontWeight: "800",
  },
});
