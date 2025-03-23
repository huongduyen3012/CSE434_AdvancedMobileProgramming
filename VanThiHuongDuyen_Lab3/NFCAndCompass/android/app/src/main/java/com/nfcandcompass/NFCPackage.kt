package com.nfcandcompass;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.Collections;

class NFCPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return mutableListOf(NFCModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> {
        return mutableListOf()
    }
}