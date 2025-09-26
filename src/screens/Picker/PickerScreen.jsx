import React, { useState } from 'react';
import { Button, NativeModules, View, ScrollView, Text } from 'react-native';

import PreviewModal from './src/screens/Picker/PreviewModal'; // make sure the path is correct

const { DocumentPicker } = NativeModules;

const categories = [
  { label: 'Documents', value: 'docs' },
  { label: 'Images', value: 'images' },
  { label: 'Videos', value: 'videos' },
  { label: 'All Files', value: 'allFiles' },
];

const PickerScreen = () => {
  const [pickedFiles, setPickedFiles] = useState({});
  const [previewItem, setPreviewItem] = useState(null);

  const handlePick = async (category) => {
    try {
      const result = await DocumentPicker.pick({ allowMultiple: true, category });
      console.log(`Picked ${category}:`, result);
      setPickedFiles((prev) => ({ ...prev, [category]: result }));
    } catch (e) {
      console.error(`Document pick failed for ${category}:`, e);
    }
  };

  const handleUpload = (item) => {
    console.log('Upload clicked for:', item);
    // call your upload logic here
    setPreviewItem(null); // close modal after upload
  };

  return (
    <View style={{ flex: 1, padding: 16 ,}}>
      <ScrollView>
        {categories.map((cat) => (
          <View key={cat.value} style={{ marginBottom: 16 }}>
            <Button
              title={`Pick ${cat.label}`}
              onPress={() => handlePick(cat.value)}
            />
            {pickedFiles[cat.value] && (
              <View style={{ marginTop: 8 }}>
                <Text>Picked {cat.label}:</Text>
                {pickedFiles[cat.value].map((file, index) => (
                  <Text
                    key={index}
                    style={{ fontSize: 12, color: 'blue', textDecorationLine: 'underline' }}
                    onPress={() => setPreviewItem(file)}
                  >
                    {file.name} ({file.size} bytes)
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Preview modal */}
      <PreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onUpload={handleUpload}
      />
    </View>
  );
};

export default PickerScreen;
