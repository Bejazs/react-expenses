import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryIcon } from '../components/CategoryIcon';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { Category } from '../models/Category';
import * as ImagePicker from 'expo-image-picker';
import { saveCustomIcon } from '../services/ImageService';
import { ICON_NAMES } from '../utils/iconUtils';
import { useTranslation } from 'react-i18next';

// Available colors for selection
const COLORS = ['#FF6347', '#4682B4', '#9370DB', '#20B2AA', '#808080', '#FFA500', '#FF4500', '#32CD32'];

/**
 * Screen for managing categories.
 * Allows creating new categories with custom icons and colors, and deleting existing ones.
 */
const CategoriesScreen = () => {
  const { t } = useTranslation();
  const { categories, loading, addCategory, deleteCategory } = useCategoryViewModel();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('help-circle'); // Default icon
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const [iconModalVisible, setIconModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const filteredIcons = useMemo(() => {
    if (!searchQuery) return ICON_NAMES.slice(0, 100); // Show first 100 initially
    return ICON_NAMES.filter(icon => icon.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 200);
  }, [searchQuery]);

  /**
   * Handles adding a new category.
   */
  const handleAddCategory = () => {
    if (name.trim()) {
      addCategory(name, selectedIcon, selectedColor);
      setName('');
      setSelectedIcon('help-circle');
      setSelectedColor(COLORS[0]);
      setIsFormExpanded(false);
    } else {
      Alert.alert('Error', t('categoryModal.errorName'));
    }
  };

  /**
   * Confirms and handles deletion of a category.
   * @param id The ID of the category to delete.
   */
  const handleDeleteCategory = (id: string) => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm('Are you sure you want to delete this category?')) {
        deleteCategory(id);
      }
    } else {
      Alert.alert(
        'Delete',
        'Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(id) },
        ]
      );
    }
  };

  /**
   * Handles picking an image from the gallery.
   */
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const savedUri = await saveCustomIcon(result.assets[0].uri);
        setSelectedIcon(savedUri);
        setIconModalVisible(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  /**
   * Renders a single category item in the list.
   */
  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <CategoryIcon icon={item.icon} size={24} color="white" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  const renderIconItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.iconGridItem}
      onPress={() => {
        setSelectedIcon(item);
        setIconModalVisible(false);
      }}
    >
      <Ionicons name={item as any} size={32} color="black" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('categories.title')}</Text>

      <View style={styles.form}>
        <TouchableOpacity style={styles.formHeader} onPress={() => setIsFormExpanded(!isFormExpanded)} activeOpacity={0.7}>
          <Text style={styles.formTitle}>{t('categories.addCategory')}</Text>
          <Ionicons name={isFormExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
        </TouchableOpacity>
        
        {isFormExpanded && (
          <View style={styles.formContent}>
            <TextInput
              style={styles.input}
              placeholder={t('categoryModal.name')}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Icon:</Text>
            <View style={styles.iconSelectionRow}>
                <View style={[styles.selectedIconPreview, { backgroundColor: selectedColor }]}>
                    <CategoryIcon icon={selectedIcon} size={30} color="white" />
                </View>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setIconModalVisible(true)}>
                    <Text style={styles.secondaryButtonText}>{t('categoryModal.selectIcon')}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('categoryModal.color')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.primaryButton} onPress={handleAddCategory}>
                <Text style={styles.primaryButtonText}>{t('categories.addCategory')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={iconModalVisible}
        animationType="slide"
        onRequestClose={() => setIconModalVisible(false)}
      >
          <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('categoryModal.selectIcon')}</Text>
                  <TouchableOpacity onPress={() => setIconModalVisible(false)}>
                      <Ionicons name="close" size={28} color="black" />
                  </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                      <Ionicons name="images" size={20} color="white" />
                      <Text style={styles.uploadButtonText}>{t('categoryModal.uploadImage')}</Text>
                  </TouchableOpacity>
              </View>

              <TextInput
                  style={styles.searchInput}
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
              />

              <FlatList
                  data={filteredIcons}
                  keyExtractor={(item) => item}
                  renderItem={renderIconItem}
                  numColumns={5}
                  contentContainerStyle={styles.iconGrid}
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                  windowSize={5}
              />
          </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    overflow: 'hidden',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContent: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selector: {
    marginBottom: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: 'black',
  },
  listContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  iconSelectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
  },
  selectedIconPreview: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  modalContainer: {
      flex: 1,
      backgroundColor: 'white',
      paddingTop: 50,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
  },
  modalActions: {
      paddingHorizontal: 20,
      marginBottom: 10,
  },
  uploadButton: {
      flexDirection: 'row',
      backgroundColor: '#6366f1',
      padding: 14,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
  },
  uploadButtonText: {
      color: 'white',
      marginLeft: 10,
      fontWeight: 'bold',
  },
  iconGrid: {
      paddingHorizontal: 10,
      paddingBottom: 20,
  },
  iconGridItem: {
      flex: 1,
      alignItems: 'center',
      padding: 10,
      margin: 5,
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 5,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontWeight: '600',
  }
});

export default CategoriesScreen;
