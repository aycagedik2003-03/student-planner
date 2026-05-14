import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure foreground notification display (Expo SDK 53+)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true, // legacy
    shouldShowBanner: true, // SDK 53+
    shouldShowList:   true, // SDK 53+
    shouldPlaySound:  true,
    shouldSetBadge:   true,
  }),
});

/**
 * Request push-notification permission.
 * Returns true if granted.
 * On web, silently returns false (not supported).
 */
export async function registerForPushNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a local notification.
 * delaySeconds = 0 → immediate (1 s jitter avoids SDK quirk on Android)
 *
 * Backend gelince bu fonksiyon gerçek push token ile
 * Anthropic / FCM / APNs API'ye istek atacak.
 */
export async function schedulePushNotification(
  title: string,
  body: string,
  delaySeconds = 1,
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      },
    });
  } catch (e) {
    // Notification izni yoksa ya da emülatörde sessizce geç
    console.warn('[NotificationService]', e);
  }
}

/** Convenience: yeni eşleşme bildirimi */
export async function scheduleMatchNotification(userName: string): Promise<void> {
  await schedulePushNotification(
    '🎉 Yeni Eşleşme!',
    `${userName} ile eşleştin. Şimdi mesaj gönder!`,
    1,
  );
}

/** Convenience: gelen mesaj bildirimi (fake gecikmeyle) */
export async function scheduleMessageNotification(
  userName: string,
  preview: string,
  delaySeconds = 5,
): Promise<void> {
  await schedulePushNotification(
    `💬 ${userName}`,
    preview,
    delaySeconds,
  );
}
