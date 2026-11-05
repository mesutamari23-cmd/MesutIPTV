package com.mesut.iptv;

import android.app.Activity;
import android.content.Intent;
import android.media.AudioManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.DefaultLoadControl;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;
import androidx.media3.ui.AspectRatioFrameLayout;
import androidx.media3.ui.PlayerView;

public class PlayerActivity extends Activity {
    private ExoPlayer player;
    private PlayerView view;
    private TextView label;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private int retries = 0;
    private int mode = 0;
    private final int[] MODES = {AspectRatioFrameLayout.RESIZE_MODE_FIT, AspectRatioFrameLayout.RESIZE_MODE_FILL, AspectRatioFrameLayout.RESIZE_MODE_ZOOM};
    private final String[] MODE_NAMES = {"16:9 / Fit", "Fill", "Zoom"};

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat c = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        c.hide(WindowInsetsCompat.Type.systemBars());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF000000);
        view = new PlayerView(this);
        view.setKeepScreenOn(true);
        root.addView(view, new FrameLayout.LayoutParams(-1, -1));

        label = new TextView(this);
        label.setTextColor(0xFFFFFFFF);
        label.setBackgroundColor(0x99000000);
        label.setPadding(28, 14, 28, 14);
        label.setVisibility(View.GONE);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(-2, -2, Gravity.CENTER);
        root.addView(label, lp);

        TextView ratio = new TextView(this);
        ratio.setText("⤢");
        ratio.setTextSize(24);
        ratio.setTextColor(0xFFFFFFFF);
        ratio.setPadding(36, 24, 36, 24);
        ratio.setOnClickListener(v -> {
            mode = (mode + 1) % MODES.length;
            view.setResizeMode(MODES[mode]);
            flash(MODE_NAMES[mode]);
        });
        root.addView(ratio, new FrameLayout.LayoutParams(-2, -2, Gravity.TOP | Gravity.END));
        setContentView(root);

        DefaultHttpDataSource.Factory http = new DefaultHttpDataSource.Factory()
                .setAllowCrossProtocolRedirects(true)
                .setConnectTimeoutMs(15000)
                .setReadTimeoutMs(20000)
                .setUserAgent("Mozilla/5.0 (Linux; Android 10) MesutIPTV/1.0");
        player = new ExoPlayer.Builder(this)
                .setMediaSourceFactory(new DefaultMediaSourceFactory(this).setDataSourceFactory(http))
                .build();
        view.setPlayer(player);
        view.setShowBuffering(PlayerView.SHOW_BUFFERING_WHEN_PLAYING);

        player.addListener(new Player.Listener() {
            @Override public void onPlaybackStateChanged(int s) { if (s == Player.STATE_READY) retries = 0; }
            @Override public void onPlayerError(PlaybackException e) {
                if (retries++ < 6) {
                    flash("…" + retries);
                    handler.postDelayed(() -> { player.seekToDefaultPosition(); player.prepare(); player.play(); }, 2000);
                } else {
                    Toast.makeText(PlayerActivity.this, "Playback error", Toast.LENGTH_LONG).show();
                    finish();
                }
            }
        });

        long start = getIntent().getLongExtra("start", 0L);
        player.setMediaItem(MediaItem.fromUri(getIntent().getStringExtra("url")));
        if (start > 0) player.seekTo(start);
        player.prepare();
        player.play();

        // Glissement vertical : gauche = luminosité, droite = volume
        final AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE);
        final GestureDetector gd = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() {
            @Override public boolean onSingleTapUp(MotionEvent e) { if (view.isControllerFullyVisible()) view.hideController(); else view.showController(); return true; }
            @Override public boolean onScroll(MotionEvent a, MotionEvent e, float dx, float dy) {
                if (a == null || Math.abs(dy) < Math.abs(dx)) return false;
                if (a.getX() < root.getWidth() / 2f) {
                    WindowManager.LayoutParams p = getWindow().getAttributes();
                    float cur = p.screenBrightness < 0 ? 0.5f : p.screenBrightness;
                    p.screenBrightness = Math.max(0.02f, Math.min(1f, cur + dy / root.getHeight()));
                    getWindow().setAttributes(p);
                    flash("☀ " + Math.round(p.screenBrightness * 100) + "%");
                } else {
                    int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                    int v = am.getStreamVolume(AudioManager.STREAM_MUSIC);
                    if (Math.abs(dy) > 8) {
                        v = Math.max(0, Math.min(max, v + (dy > 0 ? 1 : -1)));
                        am.setStreamVolume(AudioManager.STREAM_MUSIC, v, 0);
                    }
                    flash("🔊 " + Math.round(100f * v / max) + "%");
                }
                return true;
            }
        });
        view.setOnTouchListener((v, ev) -> gd.onTouchEvent(ev));
        view.setControllerShowTimeoutMs(3500);
    }

    private void flash(String s) {
        label.setText(s);
        label.setVisibility(View.VISIBLE);
        handler.removeCallbacks(hide);
        handler.postDelayed(hide, 900);
    }
    private final Runnable hide = () -> label.setVisibility(View.GONE);

    @Override
    public void finish() {
        if (player != null) {
            Intent r = new Intent();
            r.putExtra("pos", Math.max(0L, player.getCurrentPosition()));
            long d = player.getDuration();
            r.putExtra("dur", d > 0 ? d : 0L);
            setResult(RESULT_OK, r);
        }
        super.finish();
    }

    @Override protected void onStop() { super.onStop(); if (player != null) player.pause(); }
    @Override protected void onDestroy() { handler.removeCallbacksAndMessages(null); if (player != null) { player.release(); player = null; } super.onDestroy(); }
}
