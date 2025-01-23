package com.batterydisplay

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BrightnessModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BrightnessModule"
    }

    @ReactMethod fun setBrightness(brightness: Float, promise: Promise) {
    try {
        // Ensure this runs on the main thread
        val activity = currentActivity
        activity?.runOnUiThread {
            val layoutParams = activity.window.attributes
            layoutParams.screenBrightness = brightness
            activity.window.attributes = layoutParams
            promise.resolve(true)
        } ?: promise.reject("ActivityError", "Current activity is null.")
    } catch (e: Exception) {
        promise.reject("Error", e.message)
    }
}

}
