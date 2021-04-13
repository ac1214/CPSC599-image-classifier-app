/***************************************************************************************
*    The following code was modified from the code from the documentation for the
*    camera module of expo.
*
*    Title: Camera - Expo Documentation
*    Availability: https://docs.expo.io/versions/latest/sdk/camera/
*
***************************************************************************************/

import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { Camera } from "expo-camera";
import { Icon } from "react-native-elements";
import { Picker } from '@react-native-picker/picker';
import { Root, Popup } from "popup-ui";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [selectedModel, setSelectedModel] = useState("cnn");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  async function getPrediction(base64) {
    let data = {
      method: "PUT",
      body: JSON.stringify({
        data: base64,
        model: selectedModel
      }),
    };
    // Modify the url below to the IP address of the machine which you are running the webserver
    let response = await fetch("http://192.168.1.72:9999/classify_image", data);
    return await response.json();
  }

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Root>
      <StatusBar hidden />
      <Camera
        style={{ flex: 1 }}
        type={Camera.Constants.Type.back}
        ref={(ref) => {
          setCameraRef(ref);
        }}
        autoFocus="on"
      >
        <View
          style={{
            flex: 0.8,
            backgroundColor: "transparent",
            flexDirection: "row",
          }}
        >

          <TouchableOpacity
            style={{
              flex: 1,
              alignSelf: "flex-end",
              alignItems: "center",
              backgroundColor: "transparent",
            }}
            onPressIn={async () => {
              if (cameraRef) {
                let opt = { base64: true };
                let photo = await cameraRef.takePictureAsync(opt);
                let res = await getPrediction(photo.base64);

                let body = null;
                let type = "Success";
                let title = "Prediction Made";
                if (res.predicted_class == "cardboard") {
                  body = "📦 Cardboard Predicted!";
                } else if (res.predicted_class == "glass") {
                  body = "🥃 Glass Predicted!";
                } else if (res.predicted_class == "metal") {
                  body = "⚙️ Metal Predicted!";
                } else if (res.predicted_class == "organic") {
                  body = "🌳 Organic Waste Predicted!";
                } else if (res.predicted_class == "paper") {
                  body = "📃 Paper Predicted!";
                } else if (res.predicted_class == "plastic") {
                  body = "🧴 Plastic Predicted!";
                } else if (res.predicted_class == "trash") {
                  body = "🗑️ Trash Predicted!";
                } else {
                  type = 'Danger'
                  title = 'Error encountered'
                  body = 'Error encountered';
                }

                Popup.show({
                  type: type,
                  title: title,
                  button: true,
                  textBody: body,
                  buttonText: "Ok",
                  callback: () => Popup.hide(),
                });
              }
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "stretch",
                position: 'absolute',
                marginTop: 'auto',
                backgroundColor: "transparent",
                width: "100%",
              }}
            >
              <Icon name="circle" size={80} type="entypo" color="#149414" />
            </View>
          </TouchableOpacity>
        </View>
      </Camera>
      <Picker
        style={{
          height: "10%",
          flex: 0.3,
        }}
        selectedValue={selectedModel}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedModel(itemValue)
        }>
        <Picker.Item label="CNN" value="cnn" />
        <Picker.Item label="Pretrained CNN" value="pcnn" />
        <Picker.Item label="SVM" value="svm" />
        <Picker.Item label="KNN" value="knn" />
      </Picker>
    </Root>
  );
}
