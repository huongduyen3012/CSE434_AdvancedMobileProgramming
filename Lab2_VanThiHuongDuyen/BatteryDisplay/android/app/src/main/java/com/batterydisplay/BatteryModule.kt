package com.batterydisplay

import android.content.Context
import android.os.BatteryManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BatteryModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BatteryModule"
    }

    @ReactMethod
    fun getBatteryPercentage(promise: Promise) {
        try {
            val batteryManager = reactApplicationContext.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
                promise.resolve(batteryLevel)
            } else {
                promise.reject("Error", "BatteryManager API not supported on this Android version.")
            }
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }
}
