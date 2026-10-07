import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryIcon } from '../components/CategoryIcon';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { Category } from '../models/Category';
import * as ImagePicker from 'expo-image-picker';
import { saveCustomIcon } from '../services/ImageService';
import { ICON_NAMES } from '../utils/iconUtils';
import { useTranslation } from 'react-i18next';
import { CATEGORY_COLORS, Theme, useTheme, useThemedStyles } from '../theme';
import { Button, createFormStyles, IconButton } from '../components/ui';

/**
 * Screen for managing categories.
 * Allows creating new categories with custom icons and colors, and deleting existing ones.
 */
const CategoriesScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { categories, addCategory, deleteCategory } = useCategoryViewModel();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('help-circle'); // Default icon
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

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
      setSelectedColor(CATEGORY_COLORS[0]);
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
      if ((globalThis as { confirm?: (message: string) => boolean }).confirm?.(t('common.confirmDelete'))) {
        deleteCategory(id);
      }
      return;
    }
    Alert.alert(t('common.delete'), t('common.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteCategory(id) },
    ]);
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
      Alert.alert('Error', t('categoryModal.errorImage'));
    }
  };

  /**
   * Renders a single category item in the list.
   */
  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <CategoryIcon icon={item.icon} size={24} color={theme.colors.onCategory} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <IconButton
        icon="trash-outline"
        color={theme.colors.danger}
        accessibilityLabel={t('common.deleteItem', { name: item.name })}
        onPress={() => handleDeleteCategory(item.id)}
      />
    </View>
  );

  const renderIconItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.iconGridItem}
      accessibilityRole="button"
      accessibilityLabel={item}
      onPress={() => {
        setSelectedIcon(item);
        setIconModalVisible(false);
      }}
    >
      <Ionicons name={item as any} size={32} color={theme.colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>{t('categories.title')}</Text>

      <View style={styles.form}>
        <TouchableOpacity
          style={styles.formHeader}
          onPress={() => setIsFormExpanded(!isFormExpanded)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: isFormExpanded }}
        >
          <Text style={styles.formTitle}>{t('categories.addCategory')}</Text>
          <Ionicons name={isFormExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {isFormExpanded && (
          <View style={styles.formContent}>
            <TextInput
              style={styles.input}
              placeholder={t('categoryModal.name')}
              placeholderTextColor={theme.colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{t('categoryModal.icon')}</Text>
            <View style={styles.iconSelectionRow}>
                <View style={[styles.selectedIconPreview, { backgroundColor: selectedColor }]}>
                    <CategoryIcon icon={selectedIcon} size={30} color={theme.colors.onCategory} />
                </View>
                <Button label={t('categoryModal.selectIcon')} variant="secondary" onPress={() => setIconModalVisible(true)} />
            </View>

            <Text style={styles.label}>{t('categoryModal.color')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
              {CATEGORY_COLORS.map((color, index) => {
                const selected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={styles.colorTouch}
                    onPress={() => setSelectedColor(color)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t('categoryModal.colorOption', { index: index + 1 })}
                  >
                    <View style={[styles.colorOption, { backgroundColor: color }, selected && styles.selectedColorOption]}>
                      {selected && <Ionicons name="checkmark" size={18} color={theme.colors.onCategory} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button label={t('categories.addCategory')} onPress={handleAddCategory} style={{ marginTop: theme.spacing.sm }} />
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
                  <Text style={styles.modalTitleLeft}>{t('categoryModal.selectIcon')}</Text>
                  <IconButton icon="close" size={28} accessibilityLabel={t('categoryModal.close')} onPress={() => setIconModalVisible(false)} />
              </View>

              <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage} accessibilityRole="button">
                      <Ionicons name="images" size={20} color={theme.colors.onAccent} />
                      <Text style={styles.uploadButtonText}>{t('categoryModal.uploadImage')}</Text>
                  </TouchableOpacity>
              </View>

              <TextInput
                  style={[styles.input, styles.searchInput]}
                  placeholder={t('categoryModal.searchIcons')}
                  placeholderTextColor={theme.colors.muted}
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

const createStyles = (theme: Theme) => ({
  ...createFormStyles(theme),
  ...StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.screen,
      paddingTop: theme.spacing.screen + theme.spacing.sm,
      backgroundColor: theme.colors.bg,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    form: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      minHeight: theme.minTouch,
    },
    formTitle: {
      ...theme.typography.bodyStrong,
      color: theme.colors.text,
    },
    formContent: {
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    searchInput: {
      marginHorizontal: theme.spacing.screen,
    },
    selector: {
      marginBottom: theme.spacing.sm,
    },
    colorTouch: {
      width: theme.minTouch,
      height: theme.minTouch,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.xs,
    },
    colorOption: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 3,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedColorOption: {
      borderColor: theme.colors.text,
    },
    listContent: {
      paddingBottom: theme.spacing.xxl * 2,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.md,
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.sm,
      borderRadius: theme.radii.inner,
      marginBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    categoryName: {
      ...theme.typography.bodyStrong,
      flex: 1,
      color: theme.colors.text,
    },
    iconSelectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    selectedIconPreview: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      paddingTop: 50,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.screen,
      marginBottom: theme.spacing.lg,
    },
    modalTitleLeft: {
      ...theme.typography.heading,
      color: theme.colors.text,
    },
    modalActions: {
      paddingHorizontal: theme.spacing.screen,
      marginBottom: theme.spacing.md,
    },
    uploadButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.accent,
      minHeight: theme.minTouch,
      borderRadius: theme.radii.pill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadButtonText: {
      ...theme.typography.bodyStrong,
      color: theme.colors.onAccent,
      marginLeft: theme.spacing.sm,
    },
    iconGrid: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    iconGridItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.minTouch + theme.spacing.md,
      margin: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.input,
    },
  }),
});

export default CategoriesScreen;
