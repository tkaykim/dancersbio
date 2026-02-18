package com.dancersbio.app;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.RemoteMessage;
import io.capawesome.capacitorjs.plugins.firebase.messaging.MessagingService;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.Executors;

/**
 * FCM 수신 시 긴 메시지(BigTextStyle), 이미지(BigPictureStyle)로 확장 알림 표시.
 * 플러그인 상속으로 토큰/JS 이벤트는 그대로 동작.
 */
public class DancersBioMessagingService extends MessagingService {

    private static final String CHANNEL_ID = "default";
    private static final int NOTIFICATION_ID_BASE = 1000;
    private static final int EXPANDABLE_BODY_LENGTH = 80;

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();
        RemoteMessage.Notification notif = remoteMessage.getNotification();
        String title = notif != null ? notif.getTitle() : (data != null ? data.get("title") : null);
        String body = notif != null ? notif.getBody() : (data != null ? data.get("body") : null);
        String imageUrl = data != null ? data.get("image") : null;
        String link = data != null ? data.get("link") : null;
        final String finalTitle = title != null ? title : "알림";
        final String finalBody = body != null ? body : "";
        final String finalLink = link;

        boolean useExpandable = (finalBody.length() > EXPANDABLE_BODY_LENGTH) || (imageUrl != null && !imageUrl.isEmpty());

        final RemoteMessage msg = remoteMessage;
        if (useExpandable && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (imageUrl != null && !imageUrl.isEmpty()) {
                Executors.newSingleThreadExecutor().execute(() -> {
                    Bitmap bitmap = fetchBitmap(imageUrl);
                    new Handler(Looper.getMainLooper()).post(() -> {
                        showExpandableNotification(finalTitle, finalBody, bitmap, finalLink, msg);
                        DancersBioMessagingService.super.onMessageReceived(msg);
                    });
                });
                return;
            }
            showExpandableNotification(finalTitle, finalBody, null, finalLink, msg);
        }

        super.onMessageReceived(msg);
    }

    private void showExpandableNotification(String title, String body, Bitmap imageBitmap, String link, RemoteMessage remoteMessage) {
        android.content.Context ctx = getApplicationContext();
        NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(getApplicationInfo().icon != 0 ? getApplicationInfo().icon : android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body.length() > EXPANDABLE_BODY_LENGTH ? body.substring(0, EXPANDABLE_BODY_LENGTH - 3) + "…" : body)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE);

        if (imageBitmap != null) {
            builder.setStyle(new NotificationCompat.BigPictureStyle()
                    .bigPicture(imageBitmap)
                    .bigLargeIcon((Bitmap) null)
                    .setSummaryText(body));
        } else {
            builder.setStyle(new NotificationCompat.BigTextStyle().bigText(body));
        }

        Intent intent = new Intent(ctx, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        if (link != null && !link.isEmpty()) {
            intent.putExtra("link", link);
        }
        intent.putExtra("google.message_id", remoteMessage.getMessageId() != null ? remoteMessage.getMessageId() : "");
        if (remoteMessage.getData() != null) {
            for (Map.Entry<String, String> e : remoteMessage.getData().entrySet()) {
                intent.putExtra(e.getKey(), e.getValue());
            }
        }
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        builder.setContentIntent(PendingIntent.getActivity(ctx, (int) System.currentTimeMillis() % 100000, intent, flags));

        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) {
            int id = NOTIFICATION_ID_BASE + (remoteMessage.getMessageId() != null ? remoteMessage.getMessageId().hashCode() : 0);
            if (id < 0) id = -id;
            nm.notify(id, builder.build());
        }
    }

    private Bitmap fetchBitmap(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoInput(true);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.connect();
            InputStream is = conn.getInputStream();
            Bitmap bitmap = BitmapFactory.decodeStream(is);
            if (bitmap != null && (bitmap.getWidth() > 1024 || bitmap.getHeight() > 1024)) {
                float scale = Math.min(1024f / bitmap.getWidth(), 1024f / bitmap.getHeight());
                int w = (int) (bitmap.getWidth() * scale);
                int h = (int) (bitmap.getHeight() * scale);
                bitmap = Bitmap.createScaledBitmap(bitmap, w, h, true);
            }
            is.close();
            conn.disconnect();
            return bitmap;
        } catch (Exception e) {
            return null;
        }
    }
}
