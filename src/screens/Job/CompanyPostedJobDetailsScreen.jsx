import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';

import { COLORS } from '../../assets/Constants';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CompanyPostedJobDetailsScreen = ({ route }) => {
  const { post, imageUrl } = route.params || {};

  const navigation = useNavigation();


  if (!post) {
    return <Text>No post data found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}  // Use the passed image URL
          style={styles.detailImage}
        />
      )}
      <View style={styles.textContainer1}>
        <Text style={styles.title}>{(post.job_title || '').trimStart().trimEnd()}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Industry Type:</Text>{post.industry_type || ''}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Experience Required:</Text>{post.experience_required || ''}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Required Expertise :</Text>{(post.required_expertise || '').trimStart().trimEnd()}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Package:</Text> {post.Package || ''}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Company Contact:</Text>{post.company_contact_number || ''}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Company Email: </Text>{post.company_email_id || ''}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Posted On:</Text>{new Date(post.job_post_created_on * 1000).toLocaleDateString() || ''}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.body}><Text style={styles.label}>Description:</Text>{(post.job_description || '').trimStart().trimEnd()}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detail}><Text style={styles.label}>Specializations Required:</Text>{(post.speicializations_required || '').trimStart().trimEnd()}</Text>
      </View>
    </ScrollView>



  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.white,
  },
  textContainer1: {
    textAlign: "left",
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,

  },
  textContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: "#075cab",
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    color: 'black',
    textAlign: 'justify',
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    color: 'black',
    textAlign: 'justify',
  },
  label: {
    fontWeight: "490",
    color: "#075cab",
    fontSize: 17
  },
  applyButton: {
    fontSize: 20,
    fontWeight: '500',
    color: "#075cab",
    marginBottom: 20,
    textAlign: "center",
  },
});


export default CompanyPostedJobDetailsScreen;
