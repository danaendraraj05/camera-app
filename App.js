import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('Take Photo');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    if (!mediaPermission) {
      requestMediaPermission();
    }
  }, []);

  if (!permission || !mediaPermission) {
    return <View><Text>Loading permissions...</Text></View>;
  }

  if (!permission.granted || !mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera or media library</Text>
        <TouchableOpacity onPress={() => { requestPermission(); requestMediaPermission(); }} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const picture = await cameraRef.current.takePictureAsync();

      // Save to media library in custom album
      const asset = await MediaLibrary.createAssetAsync(picture.uri);
      let album = await MediaLibrary.getAlbumAsync('MyCameraApp');
      if (!album) {
        await MediaLibrary.createAlbumAsync('MyCameraApp', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }

      setPhotos((prev) => [picture.uri, ...prev]); //
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>React Native Camera Libraries</Text>
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcome}>Welcome To React-Native-Expo-Camera Tutorial</Text>


      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} />
      </View>

      {/* Take Photo Button */}
      <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
        <Text style={styles.captureButtonText}>Take Photo</Text>
      </TouchableOpacity>

      {/* Recent Photos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.photoPreview}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {photos.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.capturedImage} />
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8e7',
  },
  header: {
    backgroundColor: '#4a8c5d',
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcome: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  dropdownContainer: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdown: {
    height: 40,
    width: '100%',
  },
  cameraContainer: {
    height: 550,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  captureButton: {
    backgroundColor: '#4a8c5d',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  photoPreview: {
    marginTop: 10,
    marginHorizontal: 20,
    height: 120,
  },
  capturedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
});
