package com.mesut.iptv;

import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MesutPlayer")
public class MesutPlayerPlugin extends Plugin {

    @PluginMethod
    public void play(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) { call.reject("url required"); return; }
        Intent i = new Intent(getContext(), PlayerActivity.class);
        i.putExtra("url", url);
        i.putExtra("title", call.getString("title", ""));
        i.putExtra("start", (long) call.getInt("startMs", 0));
        startActivityForResult(call, i, "playerResult");
    }

    @ActivityCallback
    private void playerResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent d = result.getData();
        JSObject o = new JSObject();
        o.put("positionMs", d != null ? d.getLongExtra("pos", 0L) : 0L);
        o.put("durationMs", d != null ? d.getLongExtra("dur", 0L) : 0L);
        call.resolve(o);
    }
}
