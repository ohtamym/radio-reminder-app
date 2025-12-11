import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// dayjsのタイムゾーンプラグインを有効化
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

/**
 * NotificationService
 * 通知機能を管理するサービスクラス
 */
export class NotificationService {
  /**
   * 通知の基本設定を行う
   * アプリ起動時に一度だけ呼び出す
   */
  static configure(): void {
    // 通知が届いたときの挙動を設定
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, // アラート表示
        shouldPlaySound: true, // サウンド再生
        shouldSetBadge: false, // バッジは使用しない
        shouldShowBanner: true, // バナー表示
        shouldShowList: true, // 通知リストに表示
      }),
    });
  }

  /**
   * 通知パーミッションを要求する
   * @returns パーミッションが許可されたかどうか
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      // パーミッションがまだ要求されていない場合、要求する
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Androidの場合、通知チャンネルを設定
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "リマインダー通知",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      if (finalStatus !== "granted") {
        console.warn("通知パーミッションが許可されませんでした");
        return false;
      }

      console.log("通知パーミッションが許可されました");
      return true;
    } catch (error) {
      console.error("通知パーミッション要求エラー:", error);
      return false;
    }
  }

  /**
   * リマインダー通知をスケジュールする
   * @param taskId タスクID（通知の識別子として使用）
   * @param programName 番組名
   * @param stationName 放送局名
   * @param deadlineDatetime 期限日時（ISO8601形式）
   * @returns スケジュールされた通知のID（失敗時はnull）
   */
  static async scheduleReminder(
    taskId: number,
    programName: string,
    stationName: string,
    deadlineDatetime: string
  ): Promise<string | null> {
    try {
      // 期限の1日前の18時を計算
      const deadline = dayjs(deadlineDatetime);
      const reminderTime = deadline.subtract(1, "day").hour(18).minute(0).second(0);

      // 過去の日時の場合は通知をスケジュールしない
      const now = dayjs();
      if (reminderTime.isBefore(now)) {
        console.log(
          `通知時刻が過去のため、通知をスケジュールしません: taskId=${taskId}, reminderTime=${reminderTime.format()}`
        );
        return null;
      }

      // 残り時間を計算（時間単位）
      const remainingHours = Math.ceil(deadline.diff(reminderTime, "hour", true));

      // 通知内容の作成
      const notificationContent: Notifications.NotificationContentInput = {
        title: "📻 ラジオ番組の聴取期限が近づいています",
        body: `${stationName} 「${programName}」\n残り約${remainingHours}時間`,
        data: { taskId },
        sound: true,
      };

      // 通知をスケジュール
      const identifier = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime.toDate(),
        },
        identifier: `task_${taskId}`, // タスクIDを識別子として使用
      });

      console.log(
        `通知をスケジュールしました: taskId=${taskId}, identifier=${identifier}, reminderTime=${reminderTime.format()}`
      );

      return identifier;
    } catch (error) {
      console.error("通知のスケジュールに失敗しました:", error);
      return null;
    }
  }

  /**
   * 特定のタスクの通知をキャンセルする
   * @param taskId タスクID
   */
  static async cancelNotification(taskId: number): Promise<void> {
    try {
      const identifier = `task_${taskId}`;
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log(`通知をキャンセルしました: taskId=${taskId}, identifier=${identifier}`);
    } catch (error) {
      console.error("通知のキャンセルに失敗しました:", error);
    }
  }

  /**
   * すべての通知をキャンセルする
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("すべての通知をキャンセルしました");
    } catch (error) {
      console.error("すべての通知のキャンセルに失敗しました:", error);
    }
  }

  /**
   * スケジュール済みの通知一覧を取得する（デバッグ用）
   * @returns スケジュール済みの通知一覧
   */
  static async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      console.log(`スケジュール済みの通知数: ${notifications.length}`);
      return notifications;
    } catch (error) {
      console.error("通知一覧の取得に失敗しました:", error);
      return [];
    }
  }
}
