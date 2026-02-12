

import React, { useState, useEffect } from 'react';
import { View, Alert, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, ToastAndroid, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Image, ActivityIndicator } from 'react-native';
import CustomDropDownMenu from '../../components/DropDownMenu'; // Ensure this doesn't use ScrollView/FlatList
import axios from 'axios';
import { ExperienceType, industrySkills, industryType, SalaryType, topTierCities } from '../../assets/Constants';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import Message3 from '../../components/Message3';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import { addJobPost } from '../Redux/Job_Actions';
import apiClient from '../ApiClient';
import default_image from '../../images/homepage/buliding.jpg'
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import AppStyles from '../AppUtils/AppStyles';
import { EventRegister } from 'react-native-event-listeners';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import KeyboardAvoid from '../AppUtils/KeyboardAvoid.jsx';
import { AppHeader } from '../AppUtils/AppHeader.jsx';
const defaultImage = Image.resolveAssetSource(default_image).uri;

const CompanyJobPostScreen = () => {
  
  const { myId, myData } = useNetwork();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);


  const initialJobFormData = {
    job_title: "",
    industry_type: "",
    job_description: "",
    experience_required: "",
    preferred_languages: '',
    speicializations_required: "",
    Package: "",
    working_location: "",
    required_expertise: "",
    required_qualifications: ''
  };

  const [jobFormData, setJobFormData] = useState(initialJobFormData);
  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hasUnsavedChanges = Boolean(hasChanges);
  const [pendingAction, setPendingAction] = React.useState(null);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [expertiseKey, setExpertiseKey] = useState(Date.now());
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      setPendingAction(e.data.action);
      setShowModal(true);
    });

    return unsubscribe;
  }, [hasUnsavedChanges, navigation]);

  const handleLeave = () => {
    setHasChanges(false);
    setShowModal(false);

    if (pendingAction) {
      navigation.dispatch(pendingAction);
      setPendingAction(null);
    }
  };

  const handleStay = () => {
    setShowModal(false);
  };






  useEffect(() => {
    const checkChanges = () => {
      const hasAnyChanges =
        jobFormData.job_title !== initialJobFormData.job_title ||
        jobFormData.industry_type !== initialJobFormData.industry_type ||
        jobFormData.job_description !== initialJobFormData.job_description ||
        jobFormData.hiring_type !== initialJobFormData.hiring_type ||
        jobFormData.experience_required !== initialJobFormData.experience_required ||
        jobFormData.preferred_languages !== initialJobFormData.preferred_languages ||
        jobFormData.working_location !== initialJobFormData.working_location ||
        jobFormData.speicializations_required !== initialJobFormData.speicializations_required ||
        jobFormData.Package !== initialJobFormData.Package ||
        jobFormData.required_expertise !== initialJobFormData.required_expertise ||
        jobFormData.required_qualifications !== initialJobFormData.required_qualifications;

      setHasChanges(hasAnyChanges);
    };

    checkChanges();
  }, [jobFormData]);


  const handleIndustrySelect = (selectedItem) => {
    const { label } = selectedItem;

    // Reset required_expertise and selectedSkills
    handleChange('industry_type', label);
    handleChange('required_expertise', '');
    setSelectedSkills([]); // Clear previously selected skills

    // Update skill options for the new industry
    setExpertiseOptions(industrySkills[label] || []);
    setExpertiseKey(Date.now()); // Re-render dropdown if needed
  };


  const handleSkillSelect = (selected) => {
    if (!selectedSkills.find(s => s === selected.label)) {
      if (selectedSkills.length >= 3) {
        showToast('You can select up to 3 skills', 'info');
        return;
      }
      const updated = [...selectedSkills, selected.label];
      setSelectedSkills(updated);
      handleChange('required_expertise', updated.join(', '));
    }
  };

  const removeSkill = (skill) => {
    const updated = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(updated);
    handleChange('required_expertise', updated.length > 0 ? updated.join(', ') : '');
  };



  const handleCitySelect = (selected) => {
    if (!selectedCities.find(c => c === selected.label)) {
      if (selectedCities.length >= 5) {
        showToast('You can select up to 5 cities', 'info');
        return;
      }
      const updated = [...selectedCities, selected.label];
      setSelectedCities(updated);
      handleChange('working_location', updated.join(', '));
    }
  };

  const removeCity = (city) => {
    const updated = selectedCities.filter(c => c !== city);
    setSelectedCities(updated);
    handleChange('working_location', updated.length > 0 ? updated.join(', ') : '');
  };


  const renderSelectedItems = (items, onRemove) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {items.map(item => (
        <View key={item} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', padding: 6, paddingHorizontal: 10, borderRadius: 18 }}>
          <Text style={{ marginRight: 8, fontSize: 12 }}>{item}</Text>
          <TouchableOpacity
            onPress={() => onRemove(item)}
            style={{
              width: 16,
              height: 16,
              borderRadius: 9,
              backgroundColor: '#999',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, }}>✕</Text>
          </TouchableOpacity>

        </View>
      ))}
    </View>
  );

  const handleChange = (field, value) => {
    if (value.startsWith(" ")) {
      showToast('Leading spaces are not allowed', 'error');
      return;
    }
    setJobFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };


  const JobPostHandle = () => {
    setHasChanges(false);

    // List of required fields
    const requiredFields = [
      'job_title',
      'industry_type',
      'job_description',
      'required_expertise',
      'Package',
      'speicializations_required',
      'required_qualifications',
      'working_location'
    ];

    // Trim all string values in jobFormData
    const trimmedJobFormData = Object.fromEntries(
      Object.entries(jobFormData).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value
      ])
    );

    const isFormValid = requiredFields.every(field => trimmedJobFormData[field]);

    if (!isFormValid) {
      showToast('All fields are required', 'info');
      return;
    }
    setLoading(true);
    const payload = {
      command: 'createAJobPost',
      company_id: myId,
      ...trimmedJobFormData,
    };
   
    apiClient.post('/createAJobPost', payload)
      .then(async (res) => {
        if (res.data.status === 'success') {
          const newPost = res.data.post_details;

          EventRegister.emit('onJobPostCreated', {
            newPost: newPost,
            companyId: myId,
          });

          showToast('Job posted successfully', 'success');
          setLoading(false);
          setHasChanges(false);

          setTimeout(() => {
            navigation.goBack();
          }, 100);
        } else {
          showToast('Something went wrong', 'error');
        }
      })
      .catch(error => {
        showToast('Something went wrong', 'error');
      });
  };




  const Package = (selectedItem) => {
    handleChange('Package', selectedItem.label);

  };

  const industry = (selectedItem) => {
    handleChange('industry_type', selectedItem.label);

  };

  const Experience = (selectedItem) => {
    handleChange('experience_required', selectedItem.label);

  };

  const submitDisabled = !jobFormData.job_title || !jobFormData.industry_type || !jobFormData.job_description || !jobFormData.experience_required || !jobFormData.working_location || !jobFormData.speicializations_required || !jobFormData.Package || !jobFormData.required_expertise || !jobFormData.required_qualifications;

  return (

    < KeyboardAvoid>

      <AppHeader
        title={"Post a job"}

      />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingHorizontal: 5, paddingBottom: '10%', top: 10 }]}
        keyboardDismissMode="on-drag"
      >


        {/* <Text style={styles.header}>Post a job</Text> */}

        <Text style={[styles.title]}>Job title <Text style={{ color: 'red' }}>*</Text></Text>
        <View style={styles.inputContainer}>

          <TextInput
            style={[styles.input]}
            onChangeText={text => { handleChange('job_title', text); }}

            value={jobFormData.job_title || ""}
            placeholderTextColor="gray"
            multiline
          />

        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>
            Industry type <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <CustomDropDownMenu
            items={industryType}
            onSelect={handleIndustrySelect}
            buttonStyle={styles.dropdownButton}
            buttonTextStyle={styles.dropdownButtonText}
            placeholderTextColor="gray"
            placeholder=""
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>
            Required expertise <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <CustomDropDownMenu
            key={expertiseKey}
            items={expertiseOptions.map(item => ({ label: item, value: item }))}
            onSelect={handleSkillSelect}
            buttonStyle={styles.dropdownButton}
            buttonTextStyle={styles.dropdownButtonText}
            placeholder="Select skills"
            multiSelect
          />
          {selectedSkills.length === 0 && (
            <Text style={styles.instructionText}>You can select up to 3 skills</Text>
          )}
          {renderSelectedItems(selectedSkills, removeSkill)}

        </View>


        <View style={styles.inputContainer}>
          <Text style={styles.title}>Required qualification <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            style={[styles.input,]}
            onChangeText={text => handleChange('required_qualifications', text)}
            placeholderTextColor="gray"
            multiline
            value={jobFormData.required_qualifications || ""}
          />
        </View>




        <View style={styles.inputContainer}>
          <Text style={[styles.title]}> Required experience <Text style={{ color: 'red' }}>*</Text></Text>
          <CustomDropDownMenu
            items={ExperienceType}
            onSelect={Experience}
            buttonStyle={styles.dropdownButton}
            buttonTextStyle={styles.dropdownButtonText}
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>Required specializations <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            style={[styles.input]}
            multiline
            onChangeText={text => handleChange('speicializations_required', text)}
            placeholderTextColor="gray"
            value={jobFormData.speicializations_required || ""}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>
            Work location <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <CustomDropDownMenu
            items={topTierCities.map(city => ({ label: city, value: city }))}
            onSelect={handleCitySelect}
            buttonStyle={styles.dropdownButton}
            buttonTextStyle={styles.dropdownButtonText}
            placeholder="Select cities"
            multiSelect
          />
          {selectedCities.length === 0 && (
            <Text style={styles.instructionText}>You can select up to 5 cities</Text>
          )}

          {renderSelectedItems(selectedCities, removeCity)}
        </View>


        <View style={styles.inputContainer}>
          <Text style={[styles.title]}>Salary package <Text style={{ color: 'red' }}>*</Text></Text>
          <CustomDropDownMenu
            items={SalaryType}
            onSelect={Package}
            buttonStyle={styles.dropdownButton}
            buttonTextStyle={styles.dropdownButtonText}

          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>Job description <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            style={[styles.input,]}
            multiline
            onChangeText={text => handleChange('job_description', text)}
            placeholderTextColor="gray"
            value={jobFormData.job_description || ""}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>Required languages</Text>
          <TextInput
            style={[styles.input,]}
            onChangeText={text => handleChange('preferred_languages', text)}
            placeholderTextColor="gray"
            multiline
            value={jobFormData.preferred_languages || ""}
          />
        </View>

        <TouchableOpacity onPress={JobPostHandle} style={[AppStyles.Postbtn, (submitDisabled) && styles.postButtonDisabled,]}>
          {loading ? (
            <ActivityIndicator size="small" color="#075CAB" />
          ) : (
            <Text style={AppStyles.PostbtnText}>Submit</Text>

          )}
        </TouchableOpacity>
        <Message3
          visible={showModal}
          onClose={() => setShowModal(false)}
          onCancel={handleStay}
          onOk={handleLeave}
          title="Are you sure?"
          message="Your updates will be lost if you leave this page. This action cannot be undone."
          iconType="warning"
        />

      </ScrollView>

    </KeyboardAvoid>

  );
};

const styles = StyleSheet.create({


  scrollViewContainer: {
    paddingBottom: "40%",
  },
  container1: {
    padding: 10,
    backgroundColor: 'whitesmoke',
    justifyContent: 'center',

  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
    color: '#075cab',
    top: 10,
  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10,

  }
  ,
  heading: {
    fontSize: 20,
    color: '#075cab',
    textAlign: 'center',
    marginVertical: 20,
  },
  title: {
    marginBottom: 5,
    color: colors.text_primary,
    fontSize: 15,
    fontWeight: '500',
  },
  title1: {
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
  },

  instructionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },

  dropdownButton: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text_secondary,
    flex: 1,
    padding: 5,
  },
  input: {
    minHeight: 40,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 10, // Moves text down
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text_secondary,
    elevation: 2,
  },


});

export default CompanyJobPostScreen;