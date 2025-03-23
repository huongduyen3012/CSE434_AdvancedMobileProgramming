package com.nfcandcompass;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Collections;

class CompassPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return mutableListOf(CompassModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> {
        return mutableListOf()
    }
}