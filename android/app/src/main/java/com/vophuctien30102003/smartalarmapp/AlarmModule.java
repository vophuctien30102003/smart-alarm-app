package com.vophuctien30102003.smartalarmapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AlarmModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    AlarmModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "AlarmModule";
    }

    @ReactMethod
    public void setExactAlarm(double triggerTimeMillis, String title, String body) {
        AlarmHelper.setExactAlarm(reactContext, (long) triggerTimeMillis, title, body);
    }
}