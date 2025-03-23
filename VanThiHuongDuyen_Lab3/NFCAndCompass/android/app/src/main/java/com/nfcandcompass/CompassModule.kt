package com.nfcandcompass;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

class CompassModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), SensorEventListener {
    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var magnetometer: Sensor? = null
    private val lastAccelerometer = FloatArray(3)
    private val lastMagnetometer = FloatArray(3)
    private var hasAccelerometer = false
    private var hasMagnetometer = false
    private val rotation = FloatArray(9)
    private val orientation = FloatArray(3)

    init {
        sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager?
        accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        magnetometer = sensorManager?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
    }

    override fun getName(): String = "CompassModule"

    @ReactMethod
    fun startCompassUpdates() {
        sensorManager?.let { manager ->
            accelerometer?.let { acc ->
                manager.registerListener(this, acc, SensorManager.SENSOR_DELAY_UI)
            }
            magnetometer?.let { mag ->
                manager.registerListener(this, mag, SensorManager.SENSOR_DELAY_UI)
            }
        }
    }

    @ReactMethod
    fun stopCompassUpdates() {
        sensorManager?.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                System.arraycopy(event.values, 0, lastAccelerometer, 0, event.values.size)
                hasAccelerometer = true
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                System.arraycopy(event.values, 0, lastMagnetometer, 0, event.values.size)
                hasMagnetometer = true
            }
        }

        if (hasAccelerometer && hasMagnetometer) {
            SensorManager.getRotationMatrix(rotation, null, lastAccelerometer, lastMagnetometer)
            SensorManager.getOrientation(rotation, orientation)

            val azimuthInRadians = orientation[0]
            val azimuthInDegrees = Math.toDegrees(azimuthInRadians.toDouble()).toFloat()
            val adjustedDegrees = (azimuthInDegrees + 360) % 360

            sendEvent("CompassUpdate", Arguments.createMap().apply {
                putDouble("degree", adjustedDegrees.toDouble())
            })
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}