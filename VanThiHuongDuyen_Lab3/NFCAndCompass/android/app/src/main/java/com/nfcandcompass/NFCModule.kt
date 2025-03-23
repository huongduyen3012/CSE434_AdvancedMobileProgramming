package com.nfcandcompass;

import android.app.Activity;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.MifareClassic;
import android.nfc.tech.IsoDep;
import android.nfc.NfcManager;
import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

class NFCModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {
    private var nfcAdapter: NfcAdapter? = null

    init {
        nfcAdapter = NfcAdapter.getDefaultAdapter(reactContext)
        reactContext.addActivityEventListener(this)
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String = "NFCModule"

    @ReactMethod
    fun startNFCScanning() {
        val activity = currentActivity ?: return
        nfcAdapter?.enableReaderMode(activity, 
            { tag: Tag? ->
                tag?.let { handleTag(it) }
            },
            NfcAdapter.FLAG_READER_NFC_A or 
            NfcAdapter.FLAG_READER_NFC_B,
            null)
    }

    @ReactMethod
    fun stopNFCScanning() {
        val activity = currentActivity ?: return
        nfcAdapter?.disableReaderMode(activity)
    }

    private fun handleTag(tag: Tag) {
        try {
            val data = Arguments.createMap().apply {
                putString("uid", bytesToHexString(tag.id))
                putString("cardType", tag.techList.joinToString())
                putString("message", "Card detected successfully")
            }
            
            sendEvent("NFCTagDetected", data)
        } catch (e: Exception) {
            sendEvent("NFCTagDetected", Arguments.createMap().apply {
                putString("error", e.message)
                putString("message", "Error reading card")
            })
        }
    }

    private fun bytesToHexString(bytes: ByteArray): String {
        val sb = StringBuilder()
        for (b in bytes) {
            sb.append(String.format("%02x", b))
        }
        return sb.toString()
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {}
    
    override fun onNewIntent(intent: Intent?) {
        intent?.let { 
            if (NfcAdapter.ACTION_TECH_DISCOVERED == it.action) {
                val tag = it.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
                tag?.let { handleTag(it) }
            }
        }
    }
    
    override fun onHostResume() { startNFCScanning() }
    override fun onHostPause() { stopNFCScanning() }
    override fun onHostDestroy() { stopNFCScanning() }
}