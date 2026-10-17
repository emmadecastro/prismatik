import { useEffect } from "react";
import { SafeAreaView, StatusBar, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import html from "./prismatikHtml";

export default function App() {
  const [perm, ask] = useCameraPermissions();
  useEffect(() => {
    if (perm && !perm.granted && perm.canAskAgain) ask();
  }, [perm]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0914", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0914" />
      <WebView
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://localhost" }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        style={{ flex: 1, backgroundColor: "#0a0914" }}
      />
    </SafeAreaView>
  );
}